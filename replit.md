# TikTok Live Stream Dashboard

## Overview

This is a full-stack web application that provides a real-time dashboard for monitoring TikTok live streams. The application connects to TikTok live streams and displays real-time chat messages, gifts, and viewer statistics through an interactive web interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom TikTok brand colors and dark theme support
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for HTTP server
- **Real-time Communication**: WebSocket server using 'ws' library for live updates
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless PostgreSQL)
- **External Integration**: TikTok Live Connector for streaming data

## Key Components

### Database Schema
The application uses four main tables:
- **users**: Basic user authentication (id, username, password)
- **live_streams**: Stream metadata (TikTok username, activity status, statistics)
- **chat_messages**: Real-time chat messages from streams
- **gifts**: Virtual gifts sent during streams with coin values

### Real-time Features
- WebSocket connection for live updates
- Real-time chat message display
- Live gift notifications
- Dynamic viewer statistics
- Connection status monitoring

### UI Components
- **ConnectionForm**: Input for TikTok username and connection management
- **LiveStats**: Display of viewer count, message count, gifts, and coins
- **LiveChat**: Scrollable chat feed with user avatars and timestamps
- **LiveGifts**: Gift display with emojis and coin values
- **ActivityFeed**: Combined feed of recent chat and gift activity

## Data Flow

1. **Connection Establishment**: User enters TikTok username through ConnectionForm
2. **WebSocket Communication**: Frontend establishes WebSocket connection to backend
3. **TikTok Integration**: Backend connects to TikTok live stream using TikTok Live Connector
4. **Data Persistence**: Chat messages and gifts are stored in PostgreSQL database
5. **Real-time Updates**: Live data is broadcast to all connected clients via WebSocket
6. **UI Updates**: Frontend components automatically update with new data

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **tiktok-live-connector**: Third-party library for TikTok live stream integration
- **drizzle-orm**: Type-safe ORM for database operations
- **ws**: WebSocket library for real-time communication

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **@tanstack/react-query**: Server state management
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20
- **Database**: PostgreSQL 16
- **Dev Command**: `npm run dev` (starts both frontend and backend)
- **Port**: Application runs on port 5000

### Production Build
- **Frontend Build**: Vite builds static assets to `dist/public`
- **Backend Build**: esbuild bundles server code to `dist/index.js`
- **Start Command**: `npm run start` (serves production build)
- **Deployment Target**: Replit autoscale deployment

### Database Management
- **Migration Tool**: Drizzle Kit for schema migrations
- **Push Command**: `npm run db:push` (applies schema changes)
- **Connection**: Uses DATABASE_URL environment variable

The application is designed to be easily deployable on Replit with minimal configuration, using their built-in PostgreSQL service and autoscale deployment features.