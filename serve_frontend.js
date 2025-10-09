const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8081;

// Backend URL - use environment variable or default to localhost for development
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

console.log('🌐 Frontend Server Configuration:');
console.log(`   Backend URL: ${BACKEND_URL}`);
console.log(`   Port: ${PORT}`);

// Enable CORS for all origins
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to replace backend URLs in HTML and JS files dynamically
app.use((req, res, next) => {
    if (req.path.endsWith('.html') || req.path.endsWith('.js')) {
        // Try to find the file in the public directory
        const possiblePaths = [
            path.join(__dirname, 'public', req.path),
            path.join(__dirname, req.path)
        ];

        for (const filePath of possiblePaths) {
            if (fs.existsSync(filePath)) {
                try {
                    let content = fs.readFileSync(filePath, 'utf8');

                    // Replace all localhost backend URLs with actual backend URL
                    content = content.replace(/http:\/\/localhost:3005/g, BACKEND_URL);
                    content = content.replace(/http:\/\/localhost:3000/g, BACKEND_URL);
                    content = content.replace(/https:\/\/ai-id-product-2\.vercel\.app/g, BACKEND_URL);
                    content = content.replace(/https:\/\/coursecraft-backend-mohammed-asrafs-projects\.vercel\.app/g, BACKEND_URL);

                    res.type(req.path.endsWith('.html') ? 'text/html' : 'application/javascript');
                    return res.send(content);
                } catch (err) {
                    console.error(`Error reading file ${filePath}:`, err.message);
                    return res.status(500).send('Error loading file');
                }
            }
        }
    }
    next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, filePath) => {
        // Ensure proper MIME types
        if (filePath.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        } else if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// Serve static files from root directory
app.use(express.static(__dirname));

// Root route - serve main index
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>CourseCraft AI</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 800px;
                        margin: 50px auto;
                        padding: 20px;
                        background: #f5f5f5;
                    }
                    h1 { color: #333; }
                    .links { background: white; padding: 20px; border-radius: 8px; }
                    a { display: block; padding: 10px; margin: 5px 0; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px; }
                    a:hover { background: #45a049; }
                    .info { background: #e3f2fd; padding: 15px; margin: 20px 0; border-radius: 4px; }
                </style>
            </head>
            <body>
                <h1>🚀 CourseCraft AI - Frontend Server Running</h1>
                <div class="info">
                    <p><strong>Backend URL:</strong> ${BACKEND_URL}</p>
                    <p><strong>Frontend Port:</strong> ${PORT}</p>
                </div>
                <div class="links">
                    <h2>📄 Available Pages:</h2>
                    <a href="/stitch_welcome_/login/content_upload%5E&_processing/code.html">Content Upload & Processing</a>
                    <a href="/stitch_welcome_/login/domain_classification/code.html">Domain Classification</a>
                    <a href="/stitch_welcome_/login/pre-sme_interview/code.html">Pre-SME Interview</a>
                    <a href="/stitch_welcome_/login/sme_interview/code.html">SME Interview</a>
                    <a href="/stitch_welcome_/login/professional_analysis_results/code.html">Professional Analysis Results</a>
                    <a href="/stitch_welcome_/login/strategy_recommendations/code.html">Strategy Recommendations</a>
                    <a href="/stitch_welcome_/login/personalized_learning_map/code.html">Personalized Learning Map</a>
                </div>
                <div class="info">
                    <p><strong>💡 Note:</strong> All backend API calls will be automatically routed to: ${BACKEND_URL}</p>
                </div>
            </body>
            </html>
        `);
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        frontend: 'running',
        backend: BACKEND_URL,
        timestamp: new Date().toISOString()
    });
});

// For Vercel serverless deployment
if (process.env.VERCEL) {
    module.exports = app;
} else {
    // For local development
    app.listen(PORT, () => {
        console.log('');
        console.log('✅ CourseCraft AI Frontend Server Running!');
        console.log('');
        console.log(`   🌐 Frontend: http://localhost:${PORT}`);
        console.log(`   🔌 Backend:  ${BACKEND_URL}`);
        console.log('');
        console.log('📄 Available Pages:');
        console.log(`   Content Upload:    http://localhost:${PORT}/stitch_welcome_/login/content_upload%5E&_processing/code.html`);
        console.log(`   Domain Class:      http://localhost:${PORT}/stitch_welcome_/login/domain_classification/code.html`);
        console.log(`   Pre-SME:           http://localhost:${PORT}/stitch_welcome_/login/pre-sme_interview/code.html`);
        console.log(`   SME Interview:     http://localhost:${PORT}/stitch_welcome_/login/sme_interview/code.html`);
        console.log(`   Analysis Results:  http://localhost:${PORT}/stitch_welcome_/login/professional_analysis_results/code.html`);
        console.log(`   Strategies:        http://localhost:${PORT}/stitch_welcome_/login/strategy_recommendations/code.html`);
        console.log(`   Learning Map:      http://localhost:${PORT}/stitch_welcome_/login/personalized_learning_map/code.html`);
        console.log('');
    });
}
