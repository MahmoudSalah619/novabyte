# 🚀 Quick Start Guide

Get novabyte up and running in 3 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

This installs all necessary packages for both the Next.js app and the converter server.

## Step 2: Start the Application

**Easiest way - Run everything:**
```bash
npm run dev:all
```

This command starts:
- ✅ Next.js app on http://localhost:3000
- ✅ Converter server on port 3000 (backend)

**Alternative - Run separately:**

Terminal 1:
```bash
npm run dev
```

Terminal 2:
```bash
npm run server:dev
```

## Step 3: Explore novabyte

Open your browser and visit:

### 🏠 Landing Page
[http://localhost:3000](http://localhost:3000)
- Overview of all services
- Features showcase

### 📦 Templates
[http://localhost:3000/templates](http://localhost:3000/templates)
- Browse ready-to-use project templates
- Next.js, React, Express, E-commerce, and more

### ⚡ Scripts
[http://localhost:3000/scripts](http://localhost:3000/scripts)
- Automation scripts for development
- Database tools, optimizers, and utilities

### 🔄 Endpoint Converter
[http://localhost:3000/endpoint-converter](http://localhost:3000/endpoint-converter)
- Convert Swagger/OpenAPI specs to RTK Query
- Upload files or paste JSON
- Download generated TypeScript code

## 🎯 Try the Converter

1. Go to the [Endpoint Converter](http://localhost:3000/endpoint-converter)
2. Click "Paste JSON" tab
3. Paste this sample Swagger spec:

```json
{
  "swagger": "2.0",
  "paths": {
    "/users": {
      "get": {
        "tags": ["Users"],
        "operationId": "getUsers",
        "parameters": []
      }
    }
  }
}
```

4. Click "Generate RTK Query Code"
5. Download your generated files!

## ⚙️ Configuration

### Change Server Port

Edit `server/server.js`:
```javascript
const PORT = process.env.PORT || 3000;
```

Or set environment variable:
```bash
PORT=4000 npm run server
```

### Customize Colors

Edit `src/constants/colors.ts` to change the brand colors throughout the app.

## 🔧 Common Commands

```bash
# Development
npm run dev              # Next.js only
npm run server:dev       # Server only
npm run dev:all          # Both together

# Production
npm run build           # Build Next.js app
npm start              # Start Next.js production
npm run server         # Start server production

# Utilities
npm run lint           # Check code quality
```

## 🐛 Need Help?

**Server won't start?**
- Check if port 3000 is available
- Make sure dependencies are installed
- Look for error messages in the terminal

**Converter not working?**
- Verify the server is running (look for "Server Online" badge)
- Check your Swagger/OpenAPI JSON is valid
- Open browser console for error details

**Something else?**
- Check the [full README](README.md)
- Check [server documentation](server/README.md)
- Look for error messages in the console

## 🎉 Next Steps

1. Explore the different service pages
2. Try converting your own API specs
3. Customize the colors and styling
4. Add your own templates and scripts

**Happy coding with novabyte!** ✨
