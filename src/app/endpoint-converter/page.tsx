"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import "../templates/services.css";
import "./converter.css";

export default function EndpointConverter() {
  const CONVERTER_BASE_URL =
    process.env.NEXT_PUBLIC_CONVERTER_BASE_URL ?? "http://localhost:4000";
  const [inputMethod, setInputMethod] = useState<'file' | 'json'>('file');
  const [jsonInput, setJsonInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [swaggerData, setSwaggerData] = useState<any>(null);
  const [result, setResult] = useState<{ type: 'success' | 'error' | 'loading' | null; message: string; downloadUrl?: string }>({ type: null, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [serverOnline, setServerOnline] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    checkServerHealth();
  }, []);

  const checkServerHealth = async () => {
    try {
      const response = await fetch(`${CONVERTER_BASE_URL}/health`);
      const data = await response.json();
      if (data.status === "OK") {
        setServerOnline(true);
      }
    } catch (error) {
      setServerOnline(false);
      setTimeout(() => {
        setResult({
          type: 'error',
          message: 'Cannot connect to the conversion service. Please start the backend with: npm run server:dev (or npm run server)'
        });
      }, 1000);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      readFileContent(file);
    }
  };

  const readFileContent = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (file.name.endsWith('.json')) {
          setSwaggerData(JSON.parse(content));
        } else if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
          setSwaggerData(content);
        } else {
          setSwaggerData(JSON.parse(content));
        }
      } catch (error) {
        setResult({
          type: 'error',
          message: 'Invalid file format. Please upload a valid JSON or YAML file.'
        });
        setSelectedFile(null);
        setSwaggerData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      readFileContent(file);
    }
  };

  const handleConvert = async () => {
    let dataToSend = null;

    if (inputMethod === 'file') {
      if (!swaggerData) {
        setResult({
          type: 'error',
          message: 'Please select a file'
        });
        return;
      }
      dataToSend = swaggerData;
    } else {
      const jsonText = jsonInput.trim();
      if (!jsonText) {
        setResult({
          type: 'error',
          message: 'Please paste JSON content'
        });
        return;
      }

      try {
        dataToSend = JSON.parse(jsonText);
      } catch (error: any) {
        setResult({
          type: 'error',
          message: `Invalid JSON: ${error.message}`
        });
        return;
      }
    }

    setIsLoading(true);
    setResult({
      type: 'loading',
      message: 'Processing your Swagger specification... This may take a few moments'
    });

    try {
      const requestBody = { 
        swaggerData: dataToSend,
        isDirectData: true
      };

      const response = await fetch(`${CONVERTER_BASE_URL}/convert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          type: 'success',
          message: `${data.message} - Job ID: ${data.jobId}`,
          downloadUrl: data.downloadUrl
        });
      } else {
        setResult({
          type: 'error',
          message: `${data.error}${data.details ? `: ${data.details}` : ''}`
        });
      }
    } catch (error: any) {
      setResult({
        type: 'error',
        message: `Network Error: ${error.message}. Make sure the conversion server is running (default: http://localhost:4000)`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setJsonInput('');
    setSelectedFile(null);
    setSwaggerData(null);
    setResult({ type: null, message: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="service-page converter-page">
      {/* Server Status Indicator */}
      {serverOnline && (
        <div className="server-status">
          <div className="status-dot"></div>
          <span>Server Online</span>
        </div>
      )}

      {/* Header */}
      <header className="service-header">
        <Navbar currentPage="endpoint-converter" />

        <div className="page-hero">
          <h1 className="page-title">
            Endpoint <span className="highlight">Converter</span>
          </h1>
          <p className="page-subtitle">
            Transform your Swagger/OpenAPI specifications into RTK Query endpoints with type safety and best practices
          </p>
        </div>
      </header>

      {/* Converter Tool */}
      <section className="converter-section">
        <div className="converter-card">
          {/* Input Method Selector */}
          <div className="input-method-selector">
            <label className="method-label">Choose Input Method</label>
            <div className="method-buttons">
              <button
                type="button"
                className={`method-btn ${inputMethod === 'file' ? 'active' : ''}`}
                onClick={() => setInputMethod('file')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
                Upload File
              </button>
              <button
                type="button"
                className={`method-btn ${inputMethod === 'json' ? 'active' : ''}`}
                onClick={() => setInputMethod('json')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
                Paste JSON
              </button>
            </div>
          </div>

          {/* File Upload Section */}
          {inputMethod === 'file' && (
            <div className="input-section">
              <label className="input-label">Upload Swagger/OpenAPI File</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.yaml,.yml"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <div
                className={`drop-zone ${isDragging ? 'dragover' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5, marginBottom: '1rem' }}>
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
                <div className="drop-zone-text">Click to upload or drag and drop</div>
                <div className="drop-zone-hint">JSON, YAML files accepted</div>
                {selectedFile && (
                  <div className="file-name">📄 {selectedFile.name}</div>
                )}
              </div>
            </div>
          )}

          {/* JSON Input Section */}
          {inputMethod === 'json' && (
            <div className="input-section">
              <label className="input-label">Paste Swagger/OpenAPI JSON</label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='Paste your Swagger/OpenAPI JSON here...'
                className="json-textarea"
                rows={12}
              />
              <div className="input-hint">
                💡 Paste your complete Swagger/OpenAPI specification in JSON format
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={handleConvert}
              disabled={isLoading}
              className={`btn btn-primary ${isLoading ? 'btn-loading' : ''}`}
            >
              {isLoading ? 'Processing...' : 'Generate RTK Query Code'}
            </button>
            <button onClick={handleClear} className="btn btn-secondary">
              Clear
            </button>
          </div>

          {/* Result Display */}
          {result.type && (
            <div className={`result-box ${result.type}`}>
              <div className="result-content">
                {result.type === 'loading' && (
                  <div className="loading-spinner"></div>
                )}
                {result.type === 'success' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3 8-8"></path>
                    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.38 0 2.69.31 3.86.87"></path>
                  </svg>
                )}
                {result.type === 'error' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                )}
                <div className="result-message">{result.message}</div>
              </div>
              {result.downloadUrl && (
                <a href={result.downloadUrl} className="download-btn" target="_blank" rel="noopener noreferrer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download RTK Query Files
                </a>
              )}
            </div>
          )}

          {/* Supported Formats */}
          <div className="formats-info">
            <h3 className="formats-title">Supported Formats</h3>
            <div className="formats-grid">
              <div className="format-card">
                <strong>Swagger 2.0</strong>
                <div className="format-desc">JSON format supported</div>
              </div>
              <div className="format-card">
                <strong>OpenAPI 3.x</strong>
                <div className="format-desc">JSON and YAML formats supported</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Converter Features</h2>
        <div className="features-list">
          <div className="feature-item">
            <div className="feature-icon">🔄</div>
            <h3>Multiple Formats</h3>
            <p>Support for OpenAPI, Swagger, Postman collections, and raw REST endpoints</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">✨</div>
            <h3>Type Safety</h3>
            <p>Generates TypeScript types and interfaces for full type safety</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <h3>RTK Query</h3>
            <p>Generates optimized RTK Query endpoints with caching and state management</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📝</div>
            <h3>Best Practices</h3>
            <p>Follows Redux Toolkit and React best practices out of the box</p>
          </div>
        </div>
      </section>

      {/* Usage Guide */}
      <section className="usage-guide">
        <h2>How to Use</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Select Conversion Type</h3>
              <p>Choose the format of your API specification</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Paste Your Specification</h3>
              <p>Enter your API spec in the input panel</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Convert & Copy</h3>
              <p>Click convert and copy the generated RTK Query code</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Integrate</h3>
              <p>Add the code to your Redux store and start using the hooks</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer variant="service" />
    </div>
  );
}
