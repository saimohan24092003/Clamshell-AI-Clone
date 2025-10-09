# 🎓 CourseCraft AI - Complete E-Learning Platform

An AI-powered platform for creating professional learning experiences using OpenAI GPT-4o-mini.

---

## 📦 **IMPORTANT: How to Use This Project**

This project has a **nested folder structure** with special characters in paths. You **CANNOT** simply open HTML files directly. You **MUST** run the frontend server.

### ✅ **The Right Way:**
```bash
npm start                    # Start frontend server
# Then open: http://localhost:8080
```

### ❌ **The Wrong Way (will fail):**
```
Double-clicking HTML files
Opening file:///C:/path/to/file.html
```

---

## 🚀 Quick Start (2 Minutes)

### 1. Install Dependencies
```bash
npm install
cd Backend && npm install && cd ..
```

### 2. Configure Backend
Create `Backend/.env`:
```env
OPENAI_API_KEY=sk-your-api-key-here
PORT=3000
FRONTEND_ORIGIN=http://localhost:8080
JWT_SECRET=random-secret-123
SESSION_SECRET=random-secret-456
```

Get your OpenAI API key: https://platform.openai.com/api-keys

### 3. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd Backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm start
```

### 4. Access Application
Open browser: **http://localhost:8080**

---

## 🌟 Features

### AI-Powered Analysis
- **Content Analysis**: Upload documents (PDF, DOCX, TXT) for AI analysis
- **Domain Classification**: Automatic categorization into 6 specialized domains
- **Quality Assessment**: AI-driven evaluation of content clarity, completeness, engagement

### Intelligent Workflow
1. **Content Upload & Processing** - Upload and analyze training materials
2. **Domain Classification** - AI categorizes content by domain
3. **Pre-SME Interview** - Initial client/project information gathering
4. **SME Interview** - Subject Matter Expert validation
5. **Professional Analysis** - Comprehensive AI-powered content report
6. **Strategy Recommendations** - AI-generated learning strategies
7. **Personalized Learning Map** - Complete course structure with modules

### Advanced Capabilities
- **Real-time AI Chat** with streaming responses
- **Dynamic Strategy Generation** based on content analysis
- **Professional Excel Export** of learning maps
- **MongoDB Integration** for data persistence
- **OAuth Support** (Google, Microsoft)

---

## 📁 Project Structure

```
coursecraft-ai/
├── Backend/                          # Express.js API Server
│   ├── api/                          # API Endpoints
│   │   ├── analyze.js                # Content analysis
│   │   ├── generate-strategies.js   # Strategy generation
│   │   ├── generate-learning-map-ai.js  # Learning map creation
│   │   └── ...
│   ├── models/                       # MongoDB models
│   ├── index.js                      # Backend entry point
│   └── .env                          # Environment config
│
├── public/                           # Frontend Files
│   └── stitch_welcome_/login/        # All HTML pages
│       ├── content_upload^&_processing/
│       ├── domain_classification/
│       ├── pre-sme_interview/
│       ├── sme_interview/
│       ├── professional_analysis_results/
│       ├── strategy_recommendations/
│       └── personalized_learning_map/
│
├── serve_frontend.js                 # Frontend Express server
├── package.json                      # Frontend dependencies
├── QUICK_START.md                    # Quick start guide
├── SHARE_INSTRUCTIONS.md             # Detailed sharing guide
└── README_FOR_SHARING.md             # This file
```

---

## 🔧 Available Commands

```bash
# Frontend (from root directory)
npm start              # Start frontend server (port 8080)
npm run frontend       # Same as npm start

# Backend (from Backend directory)
cd Backend
npm run dev            # Start backend with nodemon (port 3000)
npm start              # Start backend (production)

# Health Checks
curl http://localhost:8080/health      # Frontend
curl http://localhost:3000/api/health  # Backend
```

---

## 🌐 API Endpoints

### Analysis & Generation
- `POST /api/analyze` - Analyze uploaded content
- `POST /api/generate-strategies` - Generate learning strategies
- `POST /api/generate-learning-map-ai` - Create learning map
- `POST /api/enhance-recommendation-content` - AI content enhancement

### Data Storage
- `POST /api/store-pre-sme-responses` - Store Pre-SME answers
- `POST /api/store-recommendation-approval` - Store SME approvals
- `POST /api/generate-final-report` - Generate comprehensive report

### Utilities
- `GET /api/health` - Backend health check
- `POST /api/upload` - File upload endpoint

---

## 🎯 Workflow

```
1. Upload Content
   ↓
2. AI Domain Classification
   ↓
3. Pre-SME Interview (Client/Project Info)
   ↓
4. SME Interview (Expert Validation)
   ↓
5. Professional Analysis (AI Report)
   ↓
6. Strategy Recommendations (AI-Generated)
   ↓
7. Personalized Learning Map (Complete Course Structure)
   ↓
8. Excel Export (Professional Learning Map)
```

---

## 📊 Data Flow

```
localStorage (Frontend) ←→ Express Server ←→ OpenAI API
                              ↓
                          MongoDB (Optional)
```

**localStorage Keys:**
- `courseId` - Unique course identifier
- `professionalAnalysisResults` - AI analysis data
- `domainClassificationResults` - Domain classification
- `preSMEAnswers` - Pre-SME interview responses
- `smeInterviewResults` - SME validation data
- `finalizedStrategies` - Selected learning strategies
- `generatedLearningMap` - Complete learning map

---

## 🔐 Environment Variables

### Backend (.env)

**Required:**
```env
OPENAI_API_KEY=sk-...                    # Your OpenAI API key
JWT_SECRET=your-secret                   # Random string
SESSION_SECRET=your-secret               # Random string
```

**Recommended:**
```env
PORT=3000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:8080
FRONTEND_URL=http://localhost:8080
```

**Optional:**
```env
MONGODB_URI=mongodb://localhost:27017/coursecraft-ai
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
REQUEST_LOGGING=true
```

---

## 🚨 Common Issues & Solutions

### Issue: "Cannot GET /stitch_welcome__login/..."
**Solution:** Frontend server not running
```bash
npm start
```

### Issue: "404 on /api/..."
**Solution:** Backend server not running
```bash
cd Backend && npm run dev
```

### Issue: "CORS Error"
**Solution:** Check `FRONTEND_ORIGIN` in `Backend/.env`
```env
FRONTEND_ORIGIN=http://localhost:8080
```

### Issue: "OpenAI API Error"
**Solution:** Invalid API key
```env
OPENAI_API_KEY=sk-your-valid-key-here
```

### Issue: "Port Already in Use"
**Solution:** Change port in `.env`
```env
PORT=3001  # Backend
```
```bash
PORT=8081 npm start  # Frontend
```

---

## 📤 How to Share This Project

### Method 1: ZIP File (Recommended)

1. **Remove `node_modules` to reduce size:**
   ```bash
   rm -rf node_modules Backend/node_modules
   ```

2. **Create ZIP:**
   - Right-click folder → "Send to" → "Compressed folder"
   - OR: `zip -r coursecraft-ai.zip . -x "node_modules/*" "Backend/node_modules/*" ".env" "Backend/.env"`

3. **Share via:**
   - Google Drive
   - Dropbox
   - WeTransfer
   - Email (if < 25MB)

### Method 2: GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/coursecraft-ai.git
git push -u origin main
```

**⚠️ NEVER commit `.env` files!**

### Method 3: Cloud Storage

Upload entire folder to Google Drive/OneDrive and share the link.

---

## 🔒 Security Notes

**NEVER share these files:**
- `.env`
- `Backend/.env`
- Any files containing API keys

**Before sharing:**
1. Delete all `.env` files
2. Include `Backend/.env.example` as template
3. Instruct recipients to create their own `.env`

---

## 📖 Documentation

- `QUICK_START.md` - Quick start guide for new users
- `SHARE_INSTRUCTIONS.md` - Detailed sharing and deployment guide
- `CLAUDE.md` - Technical documentation for developers
- `Backend/.env.example` - Environment variables template

---

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express.js
- OpenAI GPT-4o-mini API
- MongoDB + Mongoose (optional)
- Passport.js (OAuth)
- JWT Authentication

**Frontend:**
- Vanilla JavaScript
- HTML5 + CSS3
- Tailwind CSS
- SheetJS (Excel export)
- Server-Sent Events (streaming)

**Deployment:**
- Vercel (serverless)
- MongoDB Atlas (database)

---

## ✅ Recipient Checklist

When receiving this project:

- [ ] Extracted ZIP to simple path (e.g., `C:\coursecraft-ai\`)
- [ ] Installed dependencies (`npm install` in both root and Backend)
- [ ] Created `Backend/.env` with OpenAI API key
- [ ] Started Backend server (`cd Backend && npm run dev`)
- [ ] Started Frontend server (`npm start`)
- [ ] Opened http://localhost:8080 in browser
- [ ] Verified both servers running (check terminals)
- [ ] Can access all pages without errors

---

## 🎉 You're Ready!

Both servers should now be running:
- **Frontend:** http://localhost:8080
- **Backend:** http://localhost:3000/api/health

Open your browser and start creating professional learning experiences!

---

## 📞 Support

If you encounter issues:

1. ✅ Check both servers are running
2. ✅ Verify `.env` configuration
3. ✅ Check browser console (F12)
4. ✅ Review terminal logs
5. ✅ See `QUICK_START.md` for troubleshooting

---

**Built with ❤️ using AI-powered instructional design**
