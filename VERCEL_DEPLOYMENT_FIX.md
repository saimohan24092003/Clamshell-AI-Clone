# Vercel Deployment Fix - CourseCraft AI

## Issue Diagnosis
The frontend is showing `FUNCTION_INVOCATION_FAILED` error because the backend API functions are failing due to **missing OPENAI_API_KEY environment variable** in Vercel.

## Architecture Overview
Your project has TWO separate Vercel deployments:

1. **Frontend Deployment** (`clamshell-frontend.vercel.app`)
   - Serves static HTML/CSS/JS files
   - Root `vercel.json` points to `serve_frontend.js`
   - Needs: `BACKEND_URL` environment variable

2. **Backend Deployment** (should be separate, e.g., `clamshell-backend.vercel.app`)
   - `Backend/vercel.json` points to `Backend/index.js`
   - Needs: `OPENAI_API_KEY`, `MONGODB_URI`, other env vars

## Required Environment Variables

### Backend Deployment (CRITICAL - Missing!)
```bash
# REQUIRED - API Keys
OPENAI_API_KEY=sk-your-openai-api-key-here

# REQUIRED - Database
MONGODB_URI=mongodb+srv://kannansaimohan2003_db_user:Saisai123@cluster0.lvrcq5y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# REQUIRED - Environment
NODE_ENV=production
PORT=3000

# REQUIRED - CORS (update with actual frontend URL)
FRONTEND_ORIGIN=https://clamshell-frontend.vercel.app
FRONTEND_URL=https://clamshell-frontend.vercel.app
```

### Frontend Deployment
```bash
# REQUIRED - Backend URL (update with actual backend URL)
BACKEND_URL=https://clamshell-backend.vercel.app
```

## Step-by-Step Fix

### Step 1: Set Backend Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **backend project** (likely named `clamshell-backend` or similar)
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - Click "Add New"
   - Enter key name (e.g., `OPENAI_API_KEY`)
   - Enter value
   - Select environments: **Production**, **Preview**, and **Development**
   - Click "Save"

**IMPORTANT**: Add these variables:
- `OPENAI_API_KEY` - Your OpenAI API key (starts with `sk-`)
- `MONGODB_URI` - Your MongoDB connection string (already in `.env.production`)
- `NODE_ENV` - Set to `production`
- `FRONTEND_ORIGIN` - Your frontend Vercel URL
- `FRONTEND_URL` - Your frontend Vercel URL (same as above)

### Step 2: Redeploy Backend

After adding environment variables:
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click "..." menu → **Redeploy**
4. Wait for deployment to complete

### Step 3: Update Frontend BACKEND_URL

1. Go to your **frontend project** in Vercel
2. Go to **Settings** → **Environment Variables**
3. Update `BACKEND_URL` to point to your backend deployment URL
4. Example: `https://clamshell-backend-gs8tjbm6d-mohammed-asrafs-projects.vercel.app`

### Step 4: Redeploy Frontend

1. Go to **Deployments** tab
2. Click "..." menu → **Redeploy**
3. Wait for deployment to complete

### Step 5: Test the Deployment

1. Visit your frontend URL: `https://clamshell-frontend.vercel.app`
2. Try uploading content
3. Check browser console for errors
4. Verify backend API calls succeed

## Quick CLI Fix (If You Have Vercel CLI)

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link to backend project
cd Backend
vercel link

# Add environment variables
vercel env add OPENAI_API_KEY
# Paste your OpenAI API key when prompted
# Select: Production, Preview, Development

vercel env add MONGODB_URI
# Paste: mongodb+srv://kannansaimohan2003_db_user:Saisai123@cluster0.lvrcq5y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

vercel env add NODE_ENV
# Enter: production

vercel env add FRONTEND_ORIGIN
# Enter: https://clamshell-frontend.vercel.app

# Redeploy
vercel --prod
```

## Verification Checklist

- [ ] Backend has `OPENAI_API_KEY` set in Vercel environment variables
- [ ] Backend has `MONGODB_URI` set in Vercel environment variables
- [ ] Backend redeployed after adding environment variables
- [ ] Frontend has correct `BACKEND_URL` pointing to backend deployment
- [ ] Frontend redeployed with updated backend URL
- [ ] Can access backend health endpoint: `https://your-backend.vercel.app/api/health`
- [ ] Frontend loads without errors
- [ ] Content upload and analysis works end-to-end

## Troubleshooting

### Error: "FUNCTION_INVOCATION_FAILED"
- **Cause**: Missing `OPENAI_API_KEY` in backend environment variables
- **Fix**: Add the API key in Vercel dashboard and redeploy

### Error: "Failed to fetch" or CORS errors
- **Cause**: Incorrect `BACKEND_URL` or CORS settings
- **Fix**: Update `FRONTEND_ORIGIN` in backend and `BACKEND_URL` in frontend

### Error: "MongoDB connection failed"
- **Cause**: Missing or incorrect `MONGODB_URI`
- **Fix**: Add correct MongoDB connection string and redeploy

### Backend returns 500 errors
- **Cause**: Check Vercel Function Logs for specific error
- **Fix**: Go to Deployments → Click on deployment → View Function Logs

## Important Notes

1. **Never commit `.env` files to git** - They contain secrets
2. **Use Vercel environment variables** for production secrets
3. **Each deployment (frontend/backend) needs its own environment variables**
4. **Always redeploy after changing environment variables**
5. **Test in preview environments first** before deploying to production

## Current Project Status

Based on git status, these files are modified/untracked:
- `Backend/index.js` - Modified
- `Backend/.env.production` - Untracked (contains MONGODB_URI)
- `Backend/env.txt` - Untracked

**Action Required**: Commit changes and push to trigger new deployment:
```bash
git add Backend/index.js
git commit -m "fix(backend): Update serverless configuration for Vercel"
git push origin master
```

## Next Steps After Fix

1. Test all pages:
   - Content Upload & Processing
   - Domain Classification
   - Pre-SME Interview
   - SME Interview
   - Professional Analysis Results
   - Strategy Recommendations
   - Personalized Learning Map

2. Monitor Vercel Function Logs for any runtime errors

3. Set up proper monitoring and alerting for production

## Need Help?

Check Vercel documentation:
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Troubleshooting Deployments](https://vercel.com/docs/deployments/troubleshoot)
