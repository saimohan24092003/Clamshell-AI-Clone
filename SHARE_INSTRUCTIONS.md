# 📦 CourseCraft AI - Sharing & Deployment Instructions

## 🎯 Problem Solved

The nested folder structure with special characters was causing issues when sharing via ZIP. This guide provides solutions for sharing the project with others.

---

## 🚀 Quick Start for Recipients

If someone shared this project with you, follow these steps:

### 1. Extract the ZIP file
Extract to a simple path like: `C:\coursecraft-ai\` or `~/coursecraft-ai/`

### 2. Install Dependencies

**Backend:**
```bash
cd Backend
npm install
```

**Frontend:**
```bash
cd ..
npm install
```

### 3. Configure Environment

Create `Backend/.env` file:
```env
# Core Configuration
PORT=3000
NODE_ENV=development
OPENAI_API_KEY=your-openai-api-key-here

# CORS - Frontend URL
FRONTEND_ORIGIN=http://localhost:8080
FRONTEND_URL=http://localhost:8080
BACKEND_URL=http://localhost:3000

# JWT Authentication
JWT_SECRET=your-secure-jwt-secret-here
SESSION_SECRET=your-secure-session-secret-here

# MongoDB (Optional - for data persistence)
MONGODB_URI=mongodb://localhost:27017/coursecraft-ai

# Optional: OAuth (if using Google/Microsoft login)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
# MICROSOFT_CLIENT_ID=your-microsoft-client-id
# MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# Optional: Logging
REQUEST_LOGGING=true
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd Backend
npm run dev
```
Backend will start on: http://localhost:3000

**Terminal 2 - Frontend:**
```bash
# From project root
npm start
```
Frontend will start on: http://localhost:8080

### 5. Access the Application

Open your browser and go to: **http://localhost:8080**

You'll see a landing page with links to all the pages:
- Content Upload & Processing
- Domain Classification
- Pre-SME Interview
- SME Interview
- Professional Analysis Results
- Strategy Recommendations
- Personalized Learning Map

---

## 📋 For Project Owners - How to Share

### Option 1: Share via ZIP (Recommended)

**Step 1: Clean the project**
```bash
# Remove node_modules to reduce size
cd Backend
rm -rf node_modules

cd ..
rm -rf node_modules
```

**Step 2: Create ZIP**
- Right-click the project folder
- Select "Send to" → "Compressed (zipped) folder"
- OR use command line:
  ```bash
  # Windows (PowerShell)
  Compress-Archive -Path "C:\path\to\project" -DestinationPath "CourseCraft-AI.zip"

  # Mac/Linux
  zip -r CourseCraft-AI.zip . -x "node_modules/*" "Backend/node_modules/*"
  ```

**Step 3: Share**
- Upload to Google Drive, Dropbox, or email
- Include this `SHARE_INSTRUCTIONS.md` file

### Option 2: Share via GitHub

**Step 1: Create `.gitignore`**
```bash
node_modules/
Backend/node_modules/
.env
Backend/.env
*.log
.DS_Store
```

**Step 2: Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/coursecraft-ai.git
git push -u origin main
```

**Step 3: Share the repository link**

### Option 3: Deploy to Production

**Deploy Backend to Vercel:**
```bash
cd Backend
vercel

# Set environment variables in Vercel dashboard:
# - OPENAI_API_KEY
# - JWT_SECRET
# - SESSION_SECRET
# - MONGODB_URI (if using MongoDB)
# - FRONTEND_ORIGIN (set to your frontend URL)
```

**Deploy Frontend to Vercel:**
```bash
cd .. # Back to root
vercel

# Set environment variable in Vercel dashboard:
# - BACKEND_URL (set to your backend URL)
```

---

## 🔧 Troubleshooting

### Issue: "Cannot GET /stitch_welcome__login/..."

**Solution:** The frontend server is not running. Start it with:
```bash
npm start
```

### Issue: "404 on API endpoints"

**Solution:** Backend is not running. Start it with:
```bash
cd Backend
npm run dev
```

### Issue: "CORS error"

**Solution:** Make sure `FRONTEND_ORIGIN` in Backend `.env` matches your frontend URL:
```env
FRONTEND_ORIGIN=http://localhost:8080
```

### Issue: "OpenAI API error"

**Solution:** Check your `OPENAI_API_KEY` in `Backend/.env`:
1. Get API key from: https://platform.openai.com/api-keys
2. Add to `.env`: `OPENAI_API_KEY=sk-...`

### Issue: "Port already in use"

**Solution:**
- Backend (port 3000): Change in `Backend/.env`: `PORT=3001`
- Frontend (port 8080): Change in root `.env` or run: `PORT=8081 npm start`

---

## 📁 Project Structure

```
coursecraft-ai/
├── Backend/                   # Express.js backend
│   ├── api/                   # API route handlers
│   ├── models/                # MongoDB models
│   ├── index.js               # Backend entry point
│   ├── .env                   # Backend environment variables
│   └── package.json           # Backend dependencies
│
├── public/                    # Frontend static files
│   └── stitch_welcome_/
│       └── login/             # All HTML pages
│           ├── content_upload^&_processing/
│           ├── domain_classification/
│           ├── pre-sme_interview/
│           ├── sme_interview/
│           ├── professional_analysis_results/
│           ├── strategy_recommendations/
│           └── personalized_learning_map/
│
├── serve_frontend.js          # Frontend server
├── package.json               # Frontend dependencies
└── SHARE_INSTRUCTIONS.md      # This file
```

---

## 🔐 Security Notes

⚠️ **NEVER share your `.env` file or commit it to GitHub!**

When sharing:
1. Remove all `.env` files
2. Provide `.env.example` template instead
3. Recipients should create their own `.env` with their own API keys

---

## 💡 Quick Commands Reference

```bash
# Install all dependencies
npm install && cd Backend && npm install && cd ..

# Start both servers (requires 2 terminals)
# Terminal 1:
cd Backend && npm run dev

# Terminal 2:
npm start

# Check if servers are running
curl http://localhost:3000/api/health    # Backend
curl http://localhost:8080/health        # Frontend
```

---

## 📞 Support

If you encounter issues:

1. Check that both backend (port 3000) and frontend (port 8080) are running
2. Verify `.env` file is configured correctly
3. Check browser console for errors (F12 → Console)
4. Check terminal logs for server errors

---

## ✅ Checklist for Recipients

- [ ] Extracted ZIP to simple path
- [ ] Installed Backend dependencies (`cd Backend && npm install`)
- [ ] Installed Frontend dependencies (`npm install`)
- [ ] Created `Backend/.env` with OpenAI API key
- [ ] Started Backend server (`cd Backend && npm run dev`)
- [ ] Started Frontend server (`npm start`)
- [ ] Opened http://localhost:8080 in browser
- [ ] Verified both servers are running

---

**🎉 Ready to use CourseCraft AI!**
