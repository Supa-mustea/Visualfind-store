# VisualFind - AI-Powered Visual Product Search

## Overview

VisualFind is a modern web application that enables users to search for products using image uploads. The system leverages AI to analyze uploaded images and find similar products from a catalog. Built with a full-stack TypeScript architecture, it features a React frontend with shadcn/ui components, an Express.js backend, and PostgreSQL database integration via Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript in SPA mode
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite with React plugin for fast development and building

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with JSON responses
- **File Upload**: Multer middleware for handling image uploads with 10MB limit
- **Error Handling**: Centralized error middleware with structured error responses
- **Development**: Hot reload with Vite integration for seamless full-stack development

### Data Layer
- **Database**: PostgreSQL with connection via Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Three main entities - products, search history, and chat messages
- **Migrations**: Drizzle Kit for database schema management
- **Storage**: In-memory storage implementation with sample data for development

### Database Schema Design
- **Products**: Comprehensive product catalog with pricing, categories, images, ratings, and specifications
- **Search History**: Track image searches with results count and timestamps
- **Chat Messages**: Support for conversational AI features with user/bot message distinction

### API Architecture
- **Product Management**: CRUD operations with filtering by category, price range, brand, and search terms
- **Image Upload**: File processing endpoint with validation for image types and size limits
- **Chat System**: Message storage and retrieval for AI-powered product assistance
- **Search History**: Track and retrieve past visual searches

### Security & Validation
- **Input Validation**: Zod schemas for type-safe API request/response validation
- **File Upload Security**: Restricted to image files with size limitations
- **Type Safety**: End-to-end TypeScript with shared schema definitions

### Development Environment
- **Monorepo Structure**: Shared types and schemas between client and server
- **Hot Reload**: Vite dev server with Express backend integration
- **Path Aliases**: Simplified imports with @ prefixes for components and utilities
- **Replit Integration**: Custom plugins for development environment optimization

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for Neon database
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **express**: Web server framework
- **multer**: File upload handling middleware

### UI Component Libraries
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **cmdk**: Command palette functionality

### Development Tools
- **vite**: Build tool and dev server
- **typescript**: Type system and compiler
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast bundling for production builds

### Utility Libraries
- **zod**: Schema validation and type inference
- **date-fns**: Date manipulation utilities
- **nanoid**: Unique ID generation
- **clsx/tailwind-merge**: Conditional CSS class management

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Development environment integration