# Frontend Setup - Backend Connection

Your frontend is now configured to connect to the production backend!

## ✅ Files Created:

### 1. `public/js/config.js` - API Configuration
Contains the backend URL and all API endpoints.

### 2. `.env` - Environment Variables (Local only - not committed to git)
Contains environment-specific configurations.

---

## 🔗 Backend URL:
```
https://coursecraft-backend-mohammed-asrafs-projects.vercel.app
```

---

## 📝 How to Use in Your HTML Files:

### Step 1: Include the config script in your HTML
```html
<!-- Add this in the <head> section BEFORE other scripts -->
<script src="/js/config.js"></script>
```

### Step 2: Use the API_CONFIG in your JavaScript
```javascript
// Example: Call the health endpoint
fetch(API_CONFIG.getApiUrl(API_CONFIG.ENDPOINTS.HEALTH))
  .then(response => response.json())
  .then(data => console.log(data));

// Example: Call auth endpoint
fetch(API_CONFIG.getApiUrl(API_CONFIG.ENDPOINTS.AUTH + '/login'), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'pass' })
})
  .then(response => response.json())
  .then(data => console.log(data));

// Example: Upload file
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch(API_CONFIG.getApiUrl(API_CONFIG.ENDPOINTS.UPLOAD), {
  method: 'POST',
  body: formData
})
  .then(response => response.json())
  .then(data => console.log(data));
```

---

## 🔄 Update Existing Files:

Replace all hardcoded URLs like:
- `http://localhost:3000`
- `http://localhost:3005`

With:
```javascript
API_CONFIG.getApiUrl(API_CONFIG.ENDPOINTS.YOUR_ENDPOINT)
```

---

## 🧪 Test Your Connection:

Open browser console and run:
```javascript
fetch(API_CONFIG.getApiUrl(API_CONFIG.ENDPOINTS.HEALTH))
  .then(r => r.json())
  .then(console.log);
```

Expected response:
```json
{
  "status": "ok",
  "message": "CourseCraft AI Backend is running",
  "database": "connected",
  "environment": "production"
}
```

---

## 🌐 Your Live URLs:

- **Backend Health:** https://coursecraft-backend-mohammed-asrafs-projects.vercel.app/api/health
- **Vercel Dashboard:** https://vercel.com/mohammed-asrafs-projects/coursecraft-backend
- **GitHub Repo:** https://github.com/Mohammed-Asraf/AI-ID-PRODUCT-1

---

## 🛠️ For Local Development:

Update `config.js` to use localhost:
```javascript
BACKEND_URL: 'http://localhost:3005'  // or your local port
```

Or use the `.env` file for environment-specific settings.
