# AbuseBin - Pastebin Platform

## Overview
AbuseBin is a Next.js-based pastebin platform with user authentication, social features, and admin management capabilities. The project was migrated from Vercel to Replit on October 24, 2025.

## Architecture

### Tech Stack
- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.1.16
- **UI Components**: Radix UI primitives
- **State Management**: Zustand
- **Animations**: Framer Motion

### Project Structure
```
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes (WebSocket)
│   ├── admin/                # Admin management pages
│   ├── profile/              # User profile pages
│   ├── users/                # User listing page
│   └── ...                   # Other feature pages
├── components/               # React components
│   ├── ui/                   # Reusable UI components
│   └── ...                   # Feature-specific components
├── lib/                      # Utilities and shared logic
│   ├── auth.ts               # Authentication logic
│   ├── roles.ts              # Role-based access control
│   └── utils.ts              # Helper functions
└── public/                   # Static assets
```

## Recent Changes (October 24, 2025)

### Replit Migration
1. **Port Configuration**: Updated scripts to run on port 5000 and bind to 0.0.0.0 for Replit compatibility
2. **Component Import Fixes**: Fixed dynamic import issues in profile pages causing runtime errors
3. **Error Handling**: Removed noisy console logging from avatar component
4. **Fallback Images**: Added missing fallback avatar images to prevent 404 errors
5. **Deployment**: Configured for Replit autoscale deployment

### Fixed Issues
- Fixed "Element type is invalid" error caused by incorrect dynamic imports
- Fixed Layout component import (default vs named export)
- Removed excessive console.error logs from image loading failures
- Added missing `/images/design-mode/a9q5s0.png` fallback image

## Development

### Running Locally
```bash
npm run dev
```
Server runs on http://0.0.0.0:5000

### Building for Production
```bash
npm run build
npm run start
```

### Deployment
The project is configured for Replit's autoscale deployment:
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Output**: Standalone mode enabled in next.config.mjs

## Features

### Core Features
- User authentication and profiles
- Paste creation and sharing
- Social features (following, likes)
- Real-time messaging
- Admin management tools

### Admin Capabilities
- User role management
- Ban/unban users
- User avatar moderation
- Account deletion
- Effect permissions management

### User Roles
Based on ROLE_HIERARCHY in lib/auth.ts:
- Admin
- Council
- Moderator
- Premium
- User

## Configuration

### Next.js Config
- Standalone output mode for deployment
- Image optimization disabled (unoptimized: true)
- Build errors ignored for development speed
- Webpack chunk optimization (max 25MB)

### Environment Variables
No environment variables currently required. Future integrations may need:
- Database connection strings
- API keys for external services
- Authentication secrets

## Notes
- The project uses client-side state management with Zustand
- Avatar images support GIFs and external URLs with fallback handling
- The app includes real-time WebSocket functionality via `/api/ws`
- Cross-origin requests are properly configured for Replit's proxy environment
