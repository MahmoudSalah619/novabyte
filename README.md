# 🚀 novabyte

**Powerful templates, essential scripts, and seamless endpoint conversion for modern development**

novabyte is your go-to platform for accelerating development with ready-to-use templates, automation scripts, and an innovative Swagger/OpenAPI to RTK Query converter.

## ✨ Features

### 📦 Templates
- Next.js Starter with TypeScript & Tailwind
- React Dashboard with analytics
- Express API Server with authentication
- E-commerce Store with payment integration
- Blog Platform with CMS
- Mobile App Starter with React Native

### ⚡ Scripts
- Database Migration Tool
- Bundle Optimizer
- API Documentation Generator
- Environment Config Manager
- Git Workflow Automation
- Image Optimizer
- Test Data Generator
- Code Quality Checker

### 🔄 Endpoint Converter
Transform Swagger/OpenAPI specifications into RTK Query endpoints with:
- ✅ Swagger 2.0 & OpenAPI 3.x support
- ✅ Type-safe TypeScript code generation
- ✅ Automatic hook generation
- ✅ Tag-based API organization
- ✅ File upload or JSON paste input

## 🚀 Getting Started

### Prerequisites
- Node.js 14 or higher
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/novabyte.git
cd novabyte
```

2. Install dependencies:
```bash
npm install
```

### Running the Application

**Option 1: Run both servers together (recommended)**
```bash
npm run dev:all
```
This starts both the Next.js app (port 3000) and the converter server (port 3000 backend).

**Option 2: Run separately**

Terminal 1 - Next.js app:
```bash
npm run dev
```

Terminal 2 - Converter server:
```bash
npm run server:dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

## 📁 Project Structure

```
novabyte/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── page.tsx           # Landing page
│   │   ├── templates/         # Templates service page
│   │   ├── scripts/           # Scripts service page
│   │   └── endpoint-converter/ # Converter page
│   ├── components/            # Reusable components
│   │   ├── Navbar/           # Navigation component
│   │   └── Footer/           # Footer component
│   └── constants/            # App constants
│       └── colors.ts         # Brand colors
├── server/                   # Backend server
│   ├── server.js            # Express server
│   ├── swaggerToRTK.js      # Conversion logic
│   └── README.md            # Server documentation
├── public/                  # Static assets
└── package.json            # Dependencies & scripts
```

## 🎨 Brand Colors

novabyte uses a modern dark theme with signature orange accents:

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#ffb339` | Highlights, accents, CTAs |
| Primary Dark | `#e09818` | Gradients, hover states |
| Background | `#0f172a` | Main background |
| Surface | `#1e293b` | Cards, panels |
| Text | `#f8fafc` | Primary text |

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run dev:all` | Start both Next.js and converter server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run server` | Start converter server (production) |
| `npm run server:dev` | Start converter server (development) |
| `npm run lint` | Run ESLint |

## 📖 Using the Endpoint Converter

1. Navigate to the [Endpoint Converter](http://localhost:3000/endpoint-converter)
2. Choose your input method:
   - **Upload File**: Drag & drop or click to upload `.json` or `.yaml` files
   - **Paste JSON**: Paste your Swagger/OpenAPI specification directly
3. Click "Generate RTK Query Code"
4. Download the generated TypeScript files

The converter generates:
- `index.ts` - Base API configuration with Redux Toolkit setup
- `[tag].ts` - Individual API slices for each endpoint tag
- Fully typed hooks for queries and mutations

### Example Output

```typescript
// Generated index.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ['users', 'posts'],
  endpoints: () => ({}),
});

// Generated users.ts
export const UsersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => ({ url: '/users', method: 'GET' }),
      providesTags: ['users'],
    }),
  }),
});

export const { useGetUsersQuery } = UsersApi;
```

## 🔒 Environment Variables

Create a `.env.local` file for environment-specific settings:

```env
# Server port (default: 3000)
PORT=3000

# Add your custom environment variables here
```

## 📦 Dependencies

### Main Dependencies
- **Next.js 16** - React framework
- **React 19** - UI library
- **Express** - Backend server
- **Archiver** - Zip file generation
- **CORS** - Cross-origin resource sharing

### Dev Dependencies
- **TypeScript** - Type safety
- **ESLint** - Code linting
- **Nodemon** - Auto-reload for server
- **Concurrently** - Run multiple commands

## 🛠️ Development

### Adding New Components

Components are organized in the `src/components` directory:

```typescript
// src/components/MyComponent/MyComponent.tsx
export default function MyComponent() {
  return <div>My Component</div>;
}

// Export from index
// src/components/index.ts
export { default as MyComponent } from './MyComponent/MyComponent';
```

### Using Color Constants

Import colors from the constants file:

```typescript
import { COLORS } from '@/constants/colors';

const styles = {
  background: COLORS.primary,
  gradient: COLORS.gradient.primary,
};
```

### Server API Endpoints

See [server/README.md](server/README.md) for detailed API documentation.

## 🐛 Troubleshooting

**Port 3000 already in use?**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

**Server not connecting?**
- Ensure the server is running with `npm run server:dev`
- Check if port 3000 is accessible
- Verify CORS settings in `server/server.js`

**Build errors?**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For questions or support:
- Open an issue on GitHub
- Check the documentation
- Contact the team

---

**Built with ❤️ by the novabyte team**

*Building the future, byte by byte* ✨
