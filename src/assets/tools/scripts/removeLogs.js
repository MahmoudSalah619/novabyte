import * as fs from 'fs';
import * as path from 'path';


// Configuration
const projectRoot = './'; // Change this to your project root directory
const fileExtensions = ['.js', '.jsx', '.ts', '.tsx']; // File types to process
const excludeDirs = ['node_modules', '.git', 'dist', 'build']; // Directories to exclude


function removeConsoleLogs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  
  content = content.replace(/console\.log\([^)]*\);?\n?/g, '');
  
  
  content = content.replace(/console\.log\([^)]*\)[^;]*;?\n?/g, '');
  
  
  content = content.replace(/\/\/.*console\.log.*/g, '');
  content = content.replace(/\/\*[\s\S]*?console\.log[\s\S]*?\*\//g, '');
  
  fs.writeFileSync(filePath, content, 'utf8');
}

// Recursive function to process all files
function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        processDirectory(fullPath);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (fileExtensions.includes(ext)) {
                removeConsoleLogs(fullPath);
      }
    }
  });
}

// Start processing
processDirectory(projectRoot);
