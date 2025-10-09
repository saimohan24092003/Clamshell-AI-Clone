# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the CourseCraft AI backend - an Express.js application integrating OpenAI's GPT-4o-mini for educational content analysis and personalized learning strategy generation. The system includes JWT authentication, file upload capabilities, content analysis, and AI-powered strategy recommendations.

## Commands

### Development
```bash
# Start development server (Backend directory)
cd Backend && npm run dev

# Start production server
cd Backend && npm start

# Install dependencies
cd Backend && npm install

# Health check
curl http://localhost:3000/api/health
```

### Legacy Server
```bash
# Run the original standalone server (root directory)
node server.js
```

## Architecture

### Dual Server Setup
- **Backend/**: Modern Express backend with structured architecture (preferred)
- **server.js**: Legacy standalone server with comprehensive AI analysis features

### Backend Structure (Primary)
- **Routes**: `/api/auth`, `/api/chat`, `/api/strategy`
- **Middleware**: JWT authentication, error handling, rate limiting
- **Services**: OpenAI integration, content analysis
- **Config**: Environment configuration, OAuth setup

### Authentication System
- JWT-based authentication with Bearer tokens
- OAuth support (Google, Microsoft) via Passport.js
- Session management for OAuth flows
- Rate limiting: 120 req/min global, 30 req/min for chat

### OpenAI Integration
- Model: GPT-4o-mini (configurable)
- Features: Streaming and non-streaming chat responses
- Error handling with 502 mapping for OpenAI failures
- Temperature, max tokens, and model parameters configurable

## Environment Configuration

### Required Environment Variables
```bash
# Core
PORT=3000
NODE_ENV=development
OPENAI_API_KEY=sk-your-key
JWT_SECRET=your-secret
SESSION_SECRET=your-session-secret

# CORS
FRONTEND_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

# OAuth
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
MICROSOFT_CLIENT_ID=your-microsoft-id
MICROSOFT_CLIENT_SECRET=your-microsoft-secret

# Optional
REQUEST_LOGGING=true
```

### Configuration Loading
Environment variables are loaded via `Backend/src/config/env.js` with validation for required variables.

## API Endpoints

### Chat API (`/api/chat`)
- **Method**: POST
- **Auth**: Required (Bearer token)
- **Rate Limit**: 30 requests/minute
- **Payload**: `prompt` or `messages` array, optional `stream`, `temperature`, `maxTokens`, `model`
- **Response**: JSON for non-streaming, Server-Sent Events for streaming

### Authentication (`/api/auth`)
- OAuth routes for Google and Microsoft authentication
- JWT token generation and validation

### Strategy Generation (`/api/strategy`)
- AI-powered learning strategy recommendations
- Integrates content analysis and SME responses

## File Structure

```
Backend/src/
├── app.js              # Express app configuration
├── server.js           # Server startup
├── config/
│   ├── env.js          # Environment configuration
│   └── passport.js     # OAuth configuration
├── middleware/
│   ├── auth.js         # JWT authentication middleware
│   └── errorHandler.js # Centralized error handling
├── routes/
│   ├── auth.js         # Authentication routes
│   ├── chat.js         # OpenAI chat integration
│   └── strategy.js     # Strategy generation
└── services/
    └── openaiService.js # OpenAI API wrapper
```

## Development Notes

### Streaming Implementation
The chat endpoint supports Server-Sent Events for real-time token streaming. Client must handle `text/event-stream` responses and parse `data:` prefixed JSON chunks.

### Error Handling
Centralized error handling in `errorHandler.js` with specific mapping for OpenAI API errors. All errors include `isOperational` flag for proper categorization.

### Security Features
- Helmet.js for security headers
- CORS configuration with specific origin allowlist
- Rate limiting with express-rate-limit
- JWT with configurable secrets
- Session security with httpOnly cookies

### Content Analysis (Legacy Server)
The standalone `server.js` includes comprehensive AI-powered content analysis:
- File upload with support for PDF, DOCX, TXT, and other formats
- Dr. Elena Rodriguez AI persona for instructional design analysis
- Domain classification across 6 specialized areas
- Quality assessment and gap analysis
- Personalized strategy generation with ChatGPT integration

### Testing Recommendations
- Mock OpenAI SDK for unit tests
- Test JWT authentication with valid/invalid tokens
- Integration tests for streaming responses
- Rate limiting tests for 429 responses