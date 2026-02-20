const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const { processSwaggerSpec } = require('./swaggerToRTK');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(cors());
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

// Directories
const TEMP_DIR = path.join(__dirname, 'temp');
const DOWNLOADS_DIR = path.join(__dirname, 'downloads');

// Ensure directories exist
[TEMP_DIR, DOWNLOADS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Function to download file from URL
const downloadFile = (url, destination, authToken = null) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {}
    };

    if (authToken) {
      if (authToken.toLowerCase().startsWith('bearer ') || 
          authToken.toLowerCase().startsWith('apikey ') ||
          authToken.includes(' ')) {
        options.headers['Authorization'] = authToken;
      } else {
        options.headers['Authorization'] = `Bearer ${authToken}`;
      }
    }
    
    const file = fs.createWriteStream(destination);
    
    const req = protocol.request(options, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file: ${response.statusCode} ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(destination, () => {});
        reject(err);
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
};

// Function to create zip file
const createZip = (sourceDir, outputPath) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    output.on('close', () => {
      console.log(`Archive created: ${archive.pointer()} total bytes`);
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
};

// Clean up temporary files
const cleanup = (paths) => {
  paths.forEach(path => {
    if (fs.existsSync(path)) {
      if (fs.statSync(path).isDirectory()) {
        fs.rmSync(path, { recursive: true, force: true });
      } else {
        fs.unlinkSync(path);
      }
    }
  });
};

// Main endpoint
app.post('/convert', async (req, res) => {
  const { url, authToken, swaggerData, isDirectData } = req.body;
  
  if (!url && !swaggerData) {
    return res.status(400).json({ error: 'URL or Swagger data is required' });
  }

  const jobId = uuidv4();
  const tempSwaggerPath = path.join(TEMP_DIR, `${jobId}_swagger.json`);
  const tempOutputDir = path.join(TEMP_DIR, `${jobId}_output`);
  const zipPath = path.join(DOWNLOADS_DIR, `${jobId}_rtk_endpoints.zip`);

  try {
    if (isDirectData && swaggerData) {
      console.log('Processing direct Swagger data...');
      
      const jsonData = typeof swaggerData === 'string' 
        ? swaggerData 
        : JSON.stringify(swaggerData, null, 2);
      
      fs.writeFileSync(tempSwaggerPath, jsonData, 'utf8');
      console.log('Swagger data written to temporary file');
    } else if (url) {
      console.log(`Downloading Swagger file from: ${url}${authToken ? ' (with auth)' : ''}`);
      await downloadFile(url, tempSwaggerPath, authToken);
    }

    console.log('Processing Swagger specification...');
    await processSwaggerSpec(tempSwaggerPath, tempOutputDir);

    console.log('Creating zip file...');
    await createZip(tempOutputDir, zipPath);

    const downloadUrl = `${req.protocol}://${req.get('host')}/downloads/${jobId}_rtk_endpoints.zip`;

    cleanup([tempSwaggerPath, tempOutputDir]);

    res.json({
      success: true,
      message: 'RTK Query endpoints generated successfully!',
      downloadUrl: downloadUrl,
      jobId: jobId
    });

  } catch (error) {
    console.error('Error processing request:', error.message);
    
    cleanup([tempSwaggerPath, tempOutputDir, zipPath]);
    
    res.status(500).json({
      error: 'Failed to process Swagger specification',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 Convert endpoint: POST http://localhost:${PORT}/convert`);
});

module.exports = app;
