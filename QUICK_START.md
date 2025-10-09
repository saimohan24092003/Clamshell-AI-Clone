# 🚀 CourseCraft AI - Quick Start Guide

## ✅ SOLUTION TO "Cannot GET" ERROR

The error you were seeing (`Cannot GET /stitch_welcome__login/...`) is now **FIXED**!

The problem was that HTML files were being accessed directly from the file system, which doesn't work with the nested folder structure. The solution is to run a **frontend server** that properly serves all the files.

---

## 📦 How to Share This Project

### Option 1: Share as ZIP (Easiest)

1. **Clean the project first:**
   ```bash
   cd Backend
   rm -rf node_modules
   cd ..
   rm -rf node_modules
   ```

2. **Create ZIP:**
   - Right-click the project folder → "Send to" → "Compressed (zipped) folder"
   - **Important:** Make sure to include `SHARE_INSTRUCTIONS.md` in the ZIP

3. **Share the ZIP:**
   - Upload to Google Drive, Dropbox, WeTransfer, etc.
   - Send the link to your colleague

### Option 2: Share via Cloud Storage

1. Upload the folder to Google Drive or OneDrive
2. Share the folder link with edit/view permissions
3. Your colleague can download the entire folder

---

## 👥 For People Receiving This Project

When someone sends you this project, follow these steps:

### Step 1: Extract & Setup
```bash
# Extract ZIP to a simple path (avoid spaces and special characters)
# Example: C:\coursecraft-ai\ or ~/coursecraft-ai/

# Navigate to the project
cd coursecraft-ai  # (or whatever you named the folder)
```

### Step 2: Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd Backend
npm install
cd ..
```

### Step 3: Configure Backend
Create a file `Backend/.env` and add:
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
PORT=3000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:8080
JWT_SECRET=your-random-secret-here
SESSION_SECRET=your-random-secret-here
```

**Get OpenAI API Key:** https://platform.openai.com/api-keys

### Step 4: Start Both Servers

**Open Terminal 1 - Backend:**
```bash
cd Backend
npm run dev
```
✅ Backend will start on: http://localhost:3000

**Open Terminal 2 - Frontend:**
```bash
# From project root (not Backend folder)
npm start
```
✅ Frontend will start on: http://localhost:8080

### Step 5: Access the Application

Open your browser and go to: **http://localhost:8080**

You'll see links to all pages:
- ✅ Content Upload & Processing
- ✅ Domain Classification
- ✅ Pre-SME Interview
- ✅ SME Interview
- ✅ Professional Analysis Results
- ✅ Strategy Recommendations
- ✅ Personalized Learning Map

---

## 🔧 Troubleshooting

### "Cannot GET /stitch_welcome__login/..." Error

**Cause:** Frontend server is not running

**Fix:**
```bash
npm start
```

### "404 on /api/..." Error

**Cause:** Backend server is not running

**Fix:**
```bash
cd Backend
npm run dev
```

### "CORS Error"

**Cause:** Backend `.env` doesn't have correct frontend URL

**Fix:** Add to `Backend/.env`:
```env
FRONTEND_ORIGIN=http://localhost:8080
```

### "OpenAI API Error"

**Cause:** Missing or invalid OpenAI API key

**Fix:**
1. Get API key from: https://platform.openai.com/api-keys
2. Add to `Backend/.env`:
   ```env
   OPENAI_API_KEY=sk-your-key-here
   ```

### "Port Already in Use"

**Fix:**
```bash
# Change backend port in Backend/.env:
PORT=3001

# OR change frontend port:
PORT=8081 npm start
```

---

## 📋 Quick Commands

```bash
# Install everything
npm install && cd Backend && npm install && cd ..

# Start backend (Terminal 1)
cd Backend && npm run dev

# Start frontend (Terminal 2)
npm start

# Check if running
curl http://localhost:3000/api/health    # Backend
curl http://localhost:8080/health        # Frontend
```

---

## 🌐 Accessing the Application

**Frontend (User Interface):**
- Main Page: http://localhost:8080
- All HTML pages accessible through the frontend server

**Backend (API):**
- Health Check: http://localhost:3000/api/health
- All API endpoints work through frontend

---

## ✅ Success Checklist

After starting both servers, verify:

- [ ] Backend running on port 3000
- [ ] Frontend running on port 8080
- [ ] Can access http://localhost:8080 in browser
- [ ] See list of available pages
- [ ] Can click on "Content Upload & Processing" and page loads
- [ ] No "Cannot GET" errors
- [ ] No CORS errors in browser console (F12 → Console)

---

## 💡 How It Works

**Before (Broken):**
```
Opening file directly → file:///C:/path/to/file.html
❌ Cannot access nested paths
❌ CORS errors
❌ Cannot GET errors
```

**After (Fixed):**
```
Frontend Server (Port 8080) → Serves all HTML files properly
Backend Server (Port 3000) → Handles all API calls
✅ All paths work correctly
✅ No CORS errors
✅ Automatic backend URL replacement
```

---

## 📞 Need Help?

1. Check both terminals - are servers running?
2. Check `Backend/.env` - is OpenAI API key set?
3. Open browser console (F12) - any errors?
4. Check terminal logs for error messages

---

**🎉 You're ready to use CourseCraft AI!**

For detailed deployment and sharing instructions, see: `SHARE_INSTRUCTIONS.md`
