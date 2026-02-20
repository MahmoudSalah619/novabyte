# novabyte Converter Server

This server powers the Swagger/OpenAPI to RTK Query converter functionality for novabyte.

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Running the Server

For production:
```bash
npm run server
```

For development (with auto-reload):
```bash
npm run server:dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and timestamp.

### Convert Swagger to RTK Query
```
POST /convert
Content-Type: application/json

{
  "swaggerData": { ... },  // Swagger/OpenAPI JSON object
  "isDirectData": true      // Always true for direct data input
}
```

**Response:**
```json
{
  "success": true,
  "message": "RTK Query endpoints generated successfully!",
  "downloadUrl": "http://localhost:3000/downloads/[jobId]_rtk_endpoints.zip",
  "jobId": "unique-job-id"
}
```

### Download Generated Files
```
GET /downloads/[jobId]_rtk_endpoints.zip
```
Downloads the generated RTK Query files as a zip archive.

## Features

- ✅ Swagger 2.0 support
- ✅ OpenAPI 3.x support
- ✅ Automatic endpoint generation
- ✅ Type-safe RTK Query code
- ✅ Tag-based API organization
- ✅ Automatic hook generation
- ✅ File upload and JSON paste support

## How It Works

1. **Input**: Users upload a Swagger/OpenAPI file or paste JSON
2. **Processing**: Server parses the specification and generates RTK Query endpoints
3. **Output**: Returns a downloadable zip file containing:
   - `index.ts` - Base API configuration
   - `[tag].ts` - Individual API slices for each tag

## File Structure

```
server/
├── server.js          # Express server
├── swaggerToRTK.js   # Conversion logic
├── temp/             # Temporary files (auto-created)
└── downloads/        # Generated zip files (auto-created)
```

## Generated Code Structure

The converter generates RTK Query code with the following structure:

```typescript
// index.ts - Base API configuration
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ['user', 'posts'],
  endpoints: () => ({}),
});

// user.ts - User API slice
import api from './index';

export const UserApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => ({ url: '/users', method: 'GET' }),
      providesTags: ['user'],
    }),
  }),
});

export const { useGetUsersQuery } = UserApi;
```

## Environment Variables

- `PORT` - Server port (default: 3000)

## Cleanup

Temporary files are automatically cleaned up after processing. Downloaded zip files are persisted for retrieval.

## Troubleshooting

**Server not starting?**
- Make sure port 3000 is available
- Check if all dependencies are installed

**Conversion failing?**
- Verify your Swagger/OpenAPI JSON is valid
- Ensure all endpoints have tags defined
- Check server console for detailed error messages

**Can't download files?**
- Check if the `downloads` directory exists
- Verify the job ID is correct
- Check server logs for errors

## Support

For issues or questions, please check the novabyte documentation or contact support.
