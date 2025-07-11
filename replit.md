# Payment Form Application

## Overview

This is a full-stack TypeScript application featuring a payment form with real-time validation. The application uses a modern tech stack with React frontend, Express backend, and is configured for PostgreSQL database integration with Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with three main directories:
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Common schemas and types used by both frontend and backend

### Technology Stack
- **Frontend**: React 18 with TypeScript, Vite for bundling
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with validation
- **Build Tools**: Vite for frontend, esbuild for backend

## Key Components

### Frontend Architecture
- **Component Library**: Uses shadcn/ui component system with consistent design tokens
- **Routing**: Simple file-based routing with Wouter
- **State Management**: TanStack Query for API state, local state for form management
- **Styling**: Utility-first CSS with Tailwind, dark/light theme support
- **Form Validation**: Real-time validation with error handling and user feedback

### Backend Architecture
- **API Structure**: RESTful API with Express.js
- **Database Layer**: Drizzle ORM for type-safe database operations
- **Storage Interface**: Abstracted storage layer supporting both in-memory and database implementations
- **Middleware**: Request logging, JSON parsing, error handling

### Database Schema
Comprehensive schema supporting full CRUD operations:
- `users` table with id, username, and password fields
- `payments` table with complete transaction data including:
  - Payment details (amount, card info, expiry)
  - Customer information (name, email, address)
  - Transaction metadata (status, timestamps, transaction ID)
- Type-safe schema definitions using Drizzle ORM
- Zod schemas for runtime validation and security

## Data Flow

1. **Client Requests**: Frontend makes API calls using TanStack Query
2. **API Processing**: Express server handles requests through defined routes
3. **Data Persistence**: Storage layer abstracts database operations
4. **Response Handling**: Structured JSON responses with error handling
5. **UI Updates**: Automatic re-rendering based on query state changes

### Payment Form Flow
The main application feature is a comprehensive payment form that includes:
- Credit card information (number, CVC, expiry)
- Billing details (name, email, address)
- **Real-time validation as user types** with immediate visual feedback
- Live validation messages with helpful instructions (e.g., "Need 3 more digits")
- Visual indicators (✓ and ✗) next to field labels
- Progress bar showing form completion status
- Dynamic field styling (red for errors, green for valid, default for neutral)
- Client-side validation using preventDefault()
- Server-side validation for security
- AJAX form submission using fetch API
- Error state management with field highlighting
- Success/failure feedback with toast notifications
- Processing state with loading indicators
- FormData serialization for server transmission

### CRUD Operations Implementation
Full Create, Read, Update, Delete functionality:
- **CREATE**: Payment form submission stores new transactions
- **READ**: Admin dashboard displays payment records with filtering
- **UPDATE**: Payment status modification (pending → completed, etc.)
- **DELETE**: Payment record removal for admin cleanup
- **Security**: Input sanitization and validation at all levels

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form state and validation
- **zod**: Runtime type validation

### UI Dependencies
- **@radix-ui/***: Headless UI primitives for accessibility
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Type-safe variant styling

### Development Dependencies
- **vite**: Fast build tool and dev server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR and React Fast Refresh
- **Backend**: tsx for TypeScript execution with auto-restart
- **Database**: Uses DATABASE_URL environment variable for connection

### Production Build
- **Frontend**: Vite production build with optimization
- **Backend**: esbuild compilation to ESM format
- **Deployment**: Single command starts the Express server serving both API and static files

### Environment Configuration
- Supports both development and production environments
- Database configuration through environment variables
- Replit-specific optimizations and error handling
- Development tools (cartographer) only loaded in development

## Core Concepts Demonstrated

### Client-Server Architecture
- Frontend React application communicating with Express.js backend
- RESTful API design with structured request/response patterns
- Asynchronous AJAX requests using fetch API
- Real-time form validation and user feedback

### Framework Integration
- Express.js routing with middleware for request logging
- Wouter for client-side routing between payment form and admin dashboard
- Type-safe APIs using TypeScript interfaces
- Structured error handling across all layers

### Security Practices
- Dual validation: client-side for UX, server-side for security
- Input sanitization to prevent injection attacks
- Card number masking for sensitive data protection
- HTTPS-ready deployment configuration

### Database Integration
- **Production Database**: PostgreSQL with Drizzle ORM for type-safe operations
- **Database Tables**: `users` and `payments` tables with proper relationships
- **CRUD Operations**: Full Create, Read, Update, Delete functionality with real database persistence
- **Security**: Card number masking and input sanitization at database level
- **Automatic Migration**: Database schema pushed and synchronized with `npm run db:push`
- **Dual Storage**: Database storage in production, fallback to in-memory for development

## Recent Changes

- **Brand Integration**: Added El Nacional logo to header and updated color scheme to match logo's blue theme
- **Removed Demo Text**: Replaced "Full-Stack CRUD Demo" with clean logo and "Payment System" branding
- **Updated Color Scheme**: Applied logo's blue color (#2563eb) throughout the application for consistent branding
- **Enhanced UI with Icons**: Added Lucide React icons throughout the interface for better visual guidance
- **Real-Time Validation**: Added instant validation as users type with visual feedback
- **Enhanced User Experience**: Progress indicators, validation icons, and helpful messages
- **Database Integration**: Added PostgreSQL database with real data persistence
- **Full CRUD Operations**: Complete Create, Read, Update, Delete functionality
- **Admin Dashboard**: Management interface for payment records
- **Security Enhancements**: Input sanitization and card number masking
- **Client-Server Architecture**: Comprehensive API with proper error handling

## Notes

- **Production Ready**: Uses PostgreSQL database for real data persistence
- **Educational Value**: Demonstrates full-stack web development concepts
- **Two Interfaces**: Payment form for customers, admin dashboard for management
- **Security First**: Input validation, sanitization, and sensitive data protection
- **Modern Stack**: React, TypeScript, Express.js, PostgreSQL, Drizzle ORM
- **Responsive Design**: Mobile-friendly with dark mode support and accessibility features