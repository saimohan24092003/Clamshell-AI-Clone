# Vercel Deployment Guide

## Fixed Issues

The "Cannot POST /api/auth/login" error has been resolved by:

1. **Created User Model** (`src/models/User.js`)
   - Supports local authentication with bcrypt
   - Supports OAuth providers (Google, Microsoft)
   - Email uniqueness and indexing

2. **Updated index.js**
   - Now properly mounts auth routes at `/api/auth`
   - Mounts chat routes at `/api/chat`
   - Added MongoDB connection
   - Auth routes are now accessible

3. **Updated package.json**
   - Added `bcrypt` dependency
   - Changed main entry point to `index.js`
   - Updated start script

4. **Updated vercel.json**
   - Simplified configuration for serverless deployment
   - Routes all traffic to index.js

## Files Modified

### New Files
- `Backend/src/models/User.js` - User model for authentication
- `Backend/scripts/createTestUser.js` - Script to create test user

### Modified Files
- `Backend/index.js` - Updated with auth routes and MongoDB connection
- `Backend/package.json` - Added bcrypt, updated main entry
- `Backend/vercel.json` - Simplified serverless config

## Deployment Steps

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Set Up Environment Variables in Vercel

Go to your Vercel project settings and add these environment variables:

**Required:**
- `MONGODB_URI` - Your MongoDB connection string (MongoDB Atlas recommended)
- `OPENAI_API_KEY` - Your OpenAI API key
- `JWT_SECRET` - Secret for JWT tokens (e.g., `your-super-secret-jwt-key-2024`)
- `SESSION_SECRET` - Secret for sessions (e.g., `your-session-secret-2024`)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `MICROSOFT_CLIENT_ID` - Microsoft OAuth client ID
- `MICROSOFT_CLIENT_SECRET` - Microsoft OAuth client secret

**Optional:**
- `FRONTEND_ORIGIN` - Your frontend URL (e.g., `https://yourdomain.com`)
- `FRONTEND_URL` - Same as FRONTEND_ORIGIN
- `BACKEND_URL` - Your Vercel backend URL (auto-set by Vercel)
- `NODE_ENV` - Set to `production` (auto-set by Vercel)

### 3. Set Up MongoDB Atlas (Recommended)

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Create a database user
4. Whitelist all IPs (0.0.0.0/0) for Vercel serverless functions
5. Get your connection string and add to Vercel env vars as `MONGODB_URI`

### 4. Create Test User (Optional)

After MongoDB is set up, run locally:
```bash
cd Backend
node scripts/createTestUser.js
```

This creates:
- Email: `test@example.com`
- Password: `secret`

### 5. Commit and Push to GitHub

```bash
cd Backend
git add .
git commit -m "Fix Vercel routing and add authentication support"
git push origin main
```

### 6. Deploy to Vercel

**Option A: Auto-deploy (if connected to GitHub)**
- Vercel will automatically deploy when you push to main branch

**Option B: Manual deploy**
```bash
cd Backend
vercel --prod
```

## Testing the Deployment

### 1. Test Health Check
```bash
curl https://your-backend-url.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "CourseCraft AI Backend is running",
  "timestamp": "2024-10-04T...",
  "environment": "production",
  "database": "connected"
}
```

### 2. Test Login Endpoint
```bash
curl -X POST "https://your-backend-url.vercel.app/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secret"}'
```

Expected response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Test Ping Endpoint
```bash
curl https://your-backend-url.vercel.app/api/auth/ping
```

Expected response:
```json
{
  "pong": true
}
```

## Troubleshooting

### Error: "Cannot POST /api/auth/login"
- Ensure all files are committed and pushed
- Check Vercel deployment logs
- Verify vercel.json is in the Backend directory

### Error: "Invalid email or password"
- Create test user using the script
- Verify MongoDB connection
- Check MONGODB_URI environment variable

### Error: "Missing required environment variable"
- Add all required environment variables in Vercel dashboard
- Redeploy after adding environment variables

### Error: MongoDB connection timeout
- Whitelist all IPs (0.0.0.0/0) in MongoDB Atlas
- Verify MONGODB_URI format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

## Frontend Integration

Update your frontend to use the Vercel backend URL:

```javascript
const API_URL = 'https://your-backend-url.vercel.app';

// Login example
const response = await fetch(`${API_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();
if (data.success) {
  localStorage.setItem('token', data.token);
}
```

## Available Endpoints

After deployment, these endpoints will be available:

- `GET /api/health` - Health check
- `GET /health` - Simple health check
- `POST /api/auth/login` - Email/password login
- `GET /api/auth/ping` - Ping test
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/microsoft` - Microsoft OAuth
- `POST /api/chat` - Chat with OpenAI (requires JWT)
- Other legacy endpoints from legacy-endpoints.js

## Notes

- MongoDB connection is persistent across serverless function invocations
- JWT tokens expire after 7 days
- All routes support CORS for the configured frontend origins
- Rate limiting is applied to chat endpoints (30 requests/min)
