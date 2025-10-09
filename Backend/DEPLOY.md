# Deploying CourseCraft AI Backend to Vercel

## Steps to Deploy

### 1. Push Backend to GitHub
Create a **separate repository** for the Backend folder only, or use the existing repo with proper configuration.

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. **Important**: Set the **Root Directory** to `Backend` if deploying from a monorepo
5. Vercel will auto-detect the Node.js project

#### Option B: Deploy via Vercel CLI
```bash
cd Backend
npm install -g vercel
vercel login
vercel
```

### 3. Configure Environment Variables in Vercel

Go to your project settings in Vercel and add these environment variables:

```
OPENAI_API_KEY=sk-your-actual-openai-key
JWT_SECRET=your-random-jwt-secret
SESSION_SECRET=your-random-session-secret
FRONTEND_ORIGIN=https://your-frontend-url.vercel.app
FRONTEND_URL=https://your-frontend-url.vercel.app
NODE_ENV=production
```

**Optional OAuth variables:**
```
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
MICROSOFT_CLIENT_ID=your-microsoft-id
MICROSOFT_CLIENT_SECRET=your-microsoft-secret
```

### 4. Update Frontend to Use Backend URL

After deployment, Vercel will give you a URL like: `https://your-backend.vercel.app`

Update your frontend code to use this URL instead of `http://localhost:3000`

### 5. Test the Deployment

```bash
# Health check
curl https://your-backend.vercel.app/api/health

# Should return: {"status":"ok","message":"Server is running"}
```

## Important Notes

1. **Serverless Functions**: Vercel runs Node.js apps as serverless functions with 10-second timeout (hobby plan) or 60-second (pro plan)
2. **File Uploads**: File uploads work but are stored in `/tmp` which is cleared between invocations
3. **Cold Starts**: First request may be slow due to serverless cold start
4. **MongoDB**: If using MongoDB, ensure you're using MongoDB Atlas (cloud) not local MongoDB

## Troubleshooting

### Build Fails with "Cannot find module"
- Delete `package-lock.json` and `node_modules` locally
- Run `npm install` to regenerate
- Commit and push the new `package-lock.json`

### CORS Errors
- Ensure `FRONTEND_ORIGIN` is set correctly in Vercel environment variables
- Check that frontend is using the correct backend URL

### 502 Bad Gateway
- Check Vercel function logs for errors
- Ensure all required environment variables are set
- Verify OpenAI API key is valid
