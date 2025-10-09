# Local Development Setup Guide

## Prerequisites
- Node.js (v22.x or higher)
- npm or yarn

## Quick Start

### 1. Install Backend Dependencies
```bash
cd Backend
npm install
```

### 2. Start Backend Server
```bash
cd Backend
npm start
```
The backend will run on **http://localhost:3000**

### 3. Open Frontend in Browser
Simply open any HTML file in the `public` folder in your browser:

**Main Entry Points:**
- `public/index.html` - Main landing page
- `public/stitch_welcome_/_login/content_upload_&_processing/code.html` - Content upload page
- `public/stitch_welcome_/_login/ai_dashboard_landing_page/code.html` - AI Dashboard

**Using a Simple HTTP Server (Recommended):**
```bash
# Option 1: Using Python
cd public
python -m http.server 8080

# Option 2: Using Node.js http-server
npm install -g http-server
cd public
http-server -p 8080
```

Then open: **http://localhost:8080**

## Configuration

### Backend (Backend/.env)
- **PORT**: 3000
- **NODE_ENV**: development
- **MONGODB_URI**: Already configured with cloud database
- **OPENAI_API_KEY**: Already configured
- **FRONTEND_ORIGIN**: Allows localhost:5173, localhost:3000, localhost:8080

### Frontend (public/js/config.js)
- **BACKEND_URL**: http://localhost:3000

## Verify Setup

1. Backend health check: http://localhost:3000/api/health
2. Frontend: http://localhost:8080 (or directly open HTML files)

## Features Available Locally

✅ Content Upload & Analysis
✅ AI Professional Analysis (Dr. Elena Rodriguez)
✅ Strategy Recommendations
✅ Learning Map Generation
✅ Gap Analysis Dashboard
✅ Brand Document Upload & Analysis
✅ Comment Widget System

## Common Issues

### CORS Errors
Make sure:
1. Backend is running on port 3000
2. Frontend is accessed via http://localhost:8080 or http://localhost:5173
3. Not using file:// protocol (use http-server)

### Backend Not Starting
```bash
cd Backend
npm install
node index.js
```

### MongoDB Connection Issues
The MongoDB URI is already configured with a cloud database. If you see connection errors, check your internet connection.

## Development Workflow

1. **Backend changes**: Edit files in `Backend/` folder, restart server
2. **Frontend changes**: Edit files in `public/` folder, refresh browser
3. **API changes**: Edit files in `Backend/api/` folder, restart server

## API Endpoints

- `GET /` - API information
- `GET /api/health` - Health check
- `POST /api/upload` - File upload
- `POST /api/analyze` - Content analysis
- `POST /api/strategy` - Strategy recommendations
- `POST /api/learning-map` - Learning map generation

## Tech Stack

**Backend:**
- Node.js + Express
- MongoDB (Cloud)
- OpenAI GPT-4
- JWT Authentication

**Frontend:**
- Static HTML/CSS/JavaScript
- No build process required
- Direct browser loading

## Need Help?

Check the console logs:
- **Backend logs**: Terminal where you ran `npm start`
- **Frontend logs**: Browser Developer Console (F12)
