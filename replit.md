# ARIA - AI Waifu Assistant

## Overview

ARIA is a full-stack web application that serves as an AI waifu assistant with anime-style personality and voice capabilities. The application features a React TypeScript frontend with a Node.js/Express backend, utilizing PostgreSQL for data persistence through Drizzle ORM. The system is designed to provide an interactive chat experience with dynamic themes, creative writing assistance, and web analysis capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite for development and production builds
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: CSS variables for theming with support for 7 dynamic themes (water, mist, fire, aura, void, wind, smoke)
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with organized route handlers
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Development**: Hot reloading with Vite integration in development mode

### Database Architecture
- **Database**: PostgreSQL with persistent data storage
- **ORM**: Drizzle ORM with TypeScript schema definitions and Neon serverless driver
- **Schema**: Four main tables - chat_messages, user_settings, creative_sessions, web_analysis
- **Storage**: DatabaseStorage class implementing IStorage interface for PostgreSQL operations
- **Migrations**: Drizzle Kit for schema migrations and database management
- **Connection**: Connection pooling via @neondatabase/serverless with WebSocket support

## Key Components

### Chat System
- Real-time messaging interface with user and assistant roles
- Personality-based responses (flirty, protective, cheerful, serious, dark)
- Speech-to-text input via Web Speech API
- Text-to-speech output for assistant responses
- Message persistence with metadata support

### Theme Engine
- Seven animated background themes with CSS-based implementations
- Dynamic color schemes with CSS custom properties
- Particle effects and animated backgrounds using CSS animations
- Theme persistence in user settings

### Creative Writing Tools
- Plot development assistance
- Dialogue improvement suggestions
- Character and world-building help
- "What If?" scenario generator
- Tone and style guidance

### Web Analysis
- URL content scraping and analysis
- Content summarization and key point extraction
- Reading time estimation
- Website metadata extraction

### Settings Management
- Persistent user preferences
- Theme selection interface
- Personality mode switching
- Audio settings (voice, music, sound effects)
- Chat history management

## Data Flow

1. **User Interaction**: Frontend captures user input through chat interface or voice recognition
2. **API Request**: TanStack Query sends requests to Express backend endpoints
3. **OpenAI Integration**: Backend processes requests through OpenAI GPT-4o API with personality prompts
4. **Data Persistence**: Responses and settings stored in PostgreSQL via Drizzle ORM
5. **Real-time Updates**: Frontend polls for new messages and updates UI accordingly
6. **Voice Output**: Browser's Speech Synthesis API provides text-to-speech for assistant responses

## External Dependencies

### Core Dependencies
- **OpenAI API**: GPT-4o model for generating personality-based responses
- **Neon Database**: PostgreSQL hosting service
- **Web APIs**: Speech Recognition, Speech Synthesis for voice features
- **Cheerio**: Server-side HTML parsing for web scraping
- **Axios**: HTTP client for external API calls

### UI Libraries
- **Radix UI**: Headless components for accessibility
- **Lucide React**: Icon library
- **React Hook Form**: Form handling with validation
- **Date-fns**: Date formatting utilities

### Development Tools
- **ESBuild**: Fast bundling for production
- **TSX**: TypeScript execution for development
- **Replit Integration**: Development environment plugins

## Deployment Strategy

### Development Environment
- Vite dev server with hot module replacement
- TSX for running TypeScript server code
- Environment variables for API keys and database connections
- Replit-specific development banner and cartographer integration

### Production Build
- Vite builds frontend to `dist/public` directory
- ESBuild bundles server code to `dist/index.js`
- Static file serving through Express
- Environment-based configuration switching

### Database Management
- Drizzle migrations for schema updates
- Environment-based database URL configuration
- Connection pooling through @neondatabase/serverless
- Schema validation with Zod integration

## Recent Changes

### Database Integration (July 17, 2025)
- **Added PostgreSQL Database**: Migrated from in-memory storage to persistent PostgreSQL database
- **Created Database Layer**: Implemented server/db.ts with Drizzle connection and schema import
- **Updated Storage System**: Replaced MemStorage with DatabaseStorage class for all CRUD operations
- **Schema Push**: Successfully deployed database schema with all tables (chat_messages, user_settings, creative_sessions, web_analysis)
- **Fallback System**: Enhanced chat system with graceful fallback responses when OpenAI API quota is exceeded
- **Data Persistence**: All chat history, user settings, creative sessions, and web analysis now persist across server restarts

The application follows a modular architecture with clear separation of concerns, making it maintainable and scalable for future enhancements like additional AI personalities, more theme options, or expanded creative writing features.