# Express TypeScript Backend

A modern Express.js backend application built with TypeScript.

## Features

- TypeScript support
- Express.js server with middleware
- Error handling middleware
- Health check endpoint
- Environment variable configuration
- CORS enabled
- Security headers with Helmet

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   NODE_ENV=development
   ```

## Development

To start the development server with hot reload:

```bash
npm run dev
```

## Building for Production

To build the TypeScript code:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## API Endpoints

### Health Check
- `GET /health`
  - Returns server status and uptime information

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Project Structure

```
src/
├── index.ts           # Main application file
├── middleware/        # Custom middleware
│   └── errorHandler.ts
└── routes/           # Route handlers
    └── health.ts
``` 