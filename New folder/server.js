const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' })); // Increased limit for large Swagger files
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

// Utility functions from your original script
const sanitizeName = (name) => name.replace(/-/g, "_");

const processUrl = (url) => {
  const basePath = "/en/api";
  return url.replace(basePath, "").replace(/{([^}]+)}/g, "${$1}");
};

const extractPathParams = (url) => {
  const params = [];
  const regex = /{([^}]+)}/g;
  let match;
  
  while ((match = regex.exec(url)) !== null) {
    params.push(match[1]);
  }
  return params;
};

const extractQueryParams = (parameters) => {
  const queryParams = parameters
    .filter((param) => param.in === "query")
    .map((param) => param.name);
  
  return queryParams.length > 1 ? ["params"] : queryParams;
};

const generateEndpointCode = (path, method, operation) => {
  const { operationId = "", parameters = [], tags = [] } = operation;
  const processedUrl = processUrl(path);
  const pathParams = extractPathParams(processedUrl);
  const queryParams = extractQueryParams(parameters);
  const tagName = sanitizeName(
    tags[0]?.toLowerCase().replace(/\s+/g, "").replace(/-/g, "_") || "default"
  );
  const isQuery = method.toLowerCase() === "get";
  const isMutation = ["post", "put", "patch", "delete"].includes(
    method.toLowerCase()
  );

  const sanitizedOperationId = sanitizeName(operationId || "unknown_operation");

  const allParams = [...pathParams, ...queryParams];
  const hasBody = parameters.some((param) => param.in === "body");

  if (hasBody && isMutation) {
    allParams.push("body");
  }

  const queryParameters =
    allParams.length === 1 &&
    (allParams[0] === "params" || allParams[0] === "body")
      ? allParams[0]
      : `{ ${allParams.join(", ")} }`;

  const detailedComments = isQuery
    ? parameters
        .filter((param) => param.in === "query")
        .map((param) => {
          const paramType =
            param.type || (param.schema ? param.schema.type : "unknown");
          return `     * ${param.name}: ${paramType}${
            param.description ? ` - ${param.description}` : ""
          }`;
        })
        .join("\n")
    : "";

  const commentBlock = detailedComments
    ? `/*
${detailedComments}
     */`
    : "";

  return `    ${commentBlock}
    ${sanitizedOperationId}: builder.${isQuery ? "query" : "mutation"}({
      query: (${queryParameters}) => ({
        url: \`${processedUrl}\`,
        method: '${method.toUpperCase()}'${
    hasBody && isMutation ? ",\n        body" : ""
  }${isQuery && queryParams.includes("params") ? ",\n        params" : ""}
      }),
      ${isQuery ? "providesTags" : "invalidatesTags"}: ['${tagName}'],
    }),`;
};

const generateApiSliceContent = (tagName, endpoints) => {
  const sanitizedTagName = sanitizeName(tagName);
  
  return `import api from './index';

export const ${
    sanitizedTagName.charAt(0).toUpperCase() + sanitizedTagName.slice(1)
  }Api = api.injectEndpoints({
  endpoints: (builder) => ({
${endpoints.join("\n")}
  }),
  overrideExisting: false,
});

export const {
${endpoints
  .map((endpoint) => {
    const withoutComments = endpoint.replace(/\/\*[\s\S]*?\*\//g, '');
    const nameMatch = withoutComments.match(/\s+([a-zA-Z0-9_]+):/);
    if (!nameMatch) return "";
    
    const name = nameMatch[1];
    const isQuery = endpoint.includes("builder.query") || endpoint.includes("providesTags");
    return `  use${name}${isQuery ? "Query" : "Mutation"},`;
  })
  .filter(Boolean)
  .join("\n")}
} = ${sanitizedTagName.charAt(0).toUpperCase() + sanitizedTagName.slice(1)}Api;
`;
};

const generateBaseApiContent = (endpointsByTag) => {
  return `import {
  createApi,
  fetchBaseQuery,
  retry,
  BaseQueryApi,
  FetchBaseQueryError,
  FetchArgs,
} from "@reduxjs/toolkit/query/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DomainUrl from "@/apis/Domain";
import { login, logout } from "@/redux/authReducer";
import { RootState } from "@/redux";
import { AuthTokenResponse } from "./@types/auth";

const rawBaseQuery = (baseUrl: string) =>
  fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const { token } = (getState() as RootState).auth;
      if (token && !headers.has("Authorization")) {
        headers.set("Authorization", \`Token \${token}\`);
      }
      return headers;
    },
  });

const baseQuery = async (
  args: FetchArgs,
  api: BaseQueryApi,
  extraOptions: object
) => {
  const lang = await AsyncStorage.getItem("lang");
  const languageText = lang?.includes("ar") ? "ar" : "en";

  const baseUrl = \`\${DomainUrl}/\${languageText}/api\`;

  return rawBaseQuery(baseUrl)(args, api, extraOptions);
};

const baseQueryWithRetry = retry(baseQuery, { maxRetries: 0 });

const baseQueryWithReauth = async (
  args: FetchArgs,
  api: BaseQueryApi,
  extraOptions: object
) => {
  let result = await baseQueryWithRetry(args, api, extraOptions);

  const getNewAccessToken = async () => {
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    const refreshResult = (await baseQueryWithRetry(
      {
        url: "/token/refresh/",
        method: "post",
        body: { refresh: refreshToken },
      },
      api,
      extraOptions
    )) as { data: AuthTokenResponse };

    return refreshResult;
  };

  const saveTheNewAccessTokenAndRetrySameRequest = async (
    newAccessToken: string
  ) => {
    AsyncStorage.setItem("token", newAccessToken);
    api.dispatch(login(newAccessToken));
    result = (await baseQueryWithRetry(args, api, extraOptions)) as {
      error: FetchBaseQueryError;
    };
  };

  const isTokenExpire = result?.error?.data?.code?.includes("token_not_valid");

  if (isTokenExpire) {
    const refreshResult = await getNewAccessToken();

    if (refreshResult.data?.access) {
      await saveTheNewAccessTokenAndRetrySameRequest(
        refreshResult.data?.access
      );
    } else {
      AsyncStorage.removeItem("token");
      AsyncStorage.removeItem("refreshToken");
      api.dispatch(logout());
    }
  }

  return result;
};

const api = createApi({
  reducerPath: "splitApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [${Object.keys(endpointsByTag)
    .map((tag) => `'${sanitizeName(tag.toLowerCase())}'`)
    .join(", ")}],
  endpoints: () => ({}),
});

export default api;
`;
};

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

    // Add authorization header if token is provided
    if (authToken) {
      // Handle different token formats
      if (authToken.toLowerCase().startsWith('bearer ') || 
          authToken.toLowerCase().startsWith('apikey ') ||
          authToken.includes(' ')) {
        options.headers['Authorization'] = authToken;
      } else {
        // Default to Bearer if no prefix is specified
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
        fs.unlink(destination, () => {}); // Delete the file on error
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
      zlib: { level: 9 } // Set compression level
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

// Process Swagger specification
const processSwaggerSpec = (swaggerPath, outputDirectory) => {
  return new Promise((resolve, reject) => {
    try {
      const swagger = JSON.parse(fs.readFileSync(swaggerPath, "utf8"));
      
      if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
      }

      const endpointsByTag = {};

      Object.entries(swagger.paths).forEach(([path, methods]) => {
        Object.entries(methods).forEach(([method, operation]) => {
          const tag = operation.tags?.[0];
          if (!tag) {
            console.warn(
              `Skipping endpoint at path "${path}" with method "${method}" because it has no tags.`
            );
            return;
          }

          const sanitizedTag = sanitizeName(tag);
          if (!endpointsByTag[sanitizedTag]) {
            endpointsByTag[sanitizedTag] = [];
          }
          endpointsByTag[sanitizedTag].push(
            generateEndpointCode(path, method, operation)
          );
        });
      });

      // Generate base API configuration
      const baseApiContent = generateBaseApiContent(endpointsByTag);
      const baseApiPath = path.join(outputDirectory, "index.ts");
      fs.writeFileSync(baseApiPath, baseApiContent);

      // Generate API slice files
      Object.entries(endpointsByTag).forEach(([tag, endpoints]) => {
        if (tag === "default") {
          console.warn(`Skipping generation of file for tag "default".`);
          return;
        }

        const sanitizedTag = sanitizeName(tag);
        const apiSliceContent = generateApiSliceContent(sanitizedTag, endpoints);
        const outputPath = path.join(outputDirectory, `${sanitizedTag}.ts`);
        fs.writeFileSync(outputPath, apiSliceContent);
      });

      resolve();
    } catch (error) {
      reject(error);
    }
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
  
  // Check if we have either URL or direct data
  if (!url && !swaggerData) {
    return res.status(400).json({ error: 'URL or Swagger data is required' });
  }

  const jobId = uuidv4();
  const tempSwaggerPath = path.join(TEMP_DIR, `${jobId}_swagger.json`);
  const tempOutputDir = path.join(TEMP_DIR, `${jobId}_output`);
  const zipPath = path.join(DOWNLOADS_DIR, `${jobId}_rtk_endpoints.zip`);

  try {
    if (isDirectData && swaggerData) {
      // Handle direct data input (file upload or pasted JSON)
      console.log('Processing direct Swagger data...');
      
      // Convert to JSON string if it's an object
      const jsonData = typeof swaggerData === 'string' 
        ? swaggerData 
        : JSON.stringify(swaggerData, null, 2);
      
      // Write data to temporary file
      fs.writeFileSync(tempSwaggerPath, jsonData, 'utf8');
      console.log('Swagger data written to temporary file');
    } else if (url) {
      // Handle URL-based input (legacy support)
      console.log(`Downloading Swagger file from: ${url}${authToken ? ' (with auth)' : ''}`);
      await downloadFile(url, tempSwaggerPath, authToken);
    }

    // Process the swagger file
    console.log('Processing Swagger specification...');
    await processSwaggerSpec(tempSwaggerPath, tempOutputDir);

    // Create zip file
    console.log('Creating zip file...');
    await createZip(tempOutputDir, zipPath);

    // Generate download link
    const downloadUrl = `${req.protocol}://${req.get('host')}/downloads/${jobId}_rtk_endpoints.zip`;

    // Clean up temporary files
    cleanup([tempSwaggerPath, tempOutputDir]);

    res.json({
      success: true,
      message: 'RTK Query endpoints generated successfully!',
      downloadUrl: downloadUrl,
      jobId: jobId
    });

  } catch (error) {
    console.error('Error processing request:', error.message);
    
    // Clean up on error
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
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Convert endpoint: POST http://localhost:${PORT}/convert`);
});

module.exports = app;