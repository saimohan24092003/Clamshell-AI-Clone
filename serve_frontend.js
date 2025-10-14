const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Backend URL - use environment variable or default to localhost for development
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

// Enable CORS for all origins
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// Root route - serve main landing page
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>CourseCraft AI - Clamshell Learning Platform</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                .container {
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    max-width: 900px;
                    width: 100%;
                    padding: 40px;
                }
                h1 {
                    color: #333;
                    font-size: 2.5rem;
                    margin-bottom: 10px;
                    text-align: center;
                }
                .subtitle {
                    color: #666;
                    text-align: center;
                    font-size: 1.1rem;
                    margin-bottom: 30px;
                }
                .info {
                    background: #f0f4ff;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                }
                .info strong { color: #667eea; }
                .links {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 15px;
                    margin-top: 30px;
                }
                .link-card {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 20px;
                    border-radius: 10px;
                    text-decoration: none;
                    display: block;
                    transition: transform 0.2s, box-shadow 0.2s;
                    text-align: center;
                }
                .link-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
                }
                .link-card h3 {
                    font-size: 1.1rem;
                    margin-bottom: 5px;
                }
                .link-card p {
                    font-size: 0.9rem;
                    opacity: 0.9;
                }
                .status {
                    display: inline-block;
                    padding: 5px 15px;
                    background: #4CAF50;
                    color: white;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    margin-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 CourseCraft AI</h1>
                <p class="subtitle">Intelligent Learning Platform powered by AI</p>

                <div class="info">
                    <p><strong>Status:</strong> <span class="status">🟢 Online</span></p>
                    <p><strong>Backend API:</strong> ${BACKEND_URL}</p>
                    <p><strong>Environment:</strong> Production</p>
                </div>

                <h2 style="margin: 30px 0 20px 0; color: #333; text-align: center;">📄 Application Pages</h2>
                <div class="links">
                    <a href="/stitch_welcome_/login/content_upload%5E&_processing/code.html" class="link-card">
                        <h3>📤 Content Upload</h3>
                        <p>Upload and process learning materials</p>
                    </a>
                    <a href="/stitch_welcome_/login/domain_classification/code.html" class="link-card">
                        <h3>🏷️ Domain Classification</h3>
                        <p>AI-powered content categorization</p>
                    </a>
                    <a href="/stitch_welcome_/login/pre-sme_interview/code.html" class="link-card">
                        <h3>📋 Pre-SME Interview</h3>
                        <p>Initial subject matter assessment</p>
                    </a>
                    <a href="/stitch_welcome_/login/sme_interview/code.html" class="link-card">
                        <h3>💬 SME Interview</h3>
                        <p>Detailed expert consultation</p>
                    </a>
                    <a href="/stitch_welcome_/login/professional_analysis_results/code.html" class="link-card">
                        <h3>📊 Analysis Results</h3>
                        <p>Professional content analysis</p>
                    </a>
                    <a href="/stitch_welcome_/login/strategy_recommendations/code.html" class="link-card">
                        <h3>🎯 Strategy Recommendations</h3>
                        <p>Personalized learning strategies</p>
                    </a>
                    <a href="/stitch_welcome_/login/personalized_learning_map/code.html" class="link-card">
                        <h3>🗺️ Learning Map</h3>
                        <p>Customized learning pathways</p>
                    </a>
                </div>

                <div class="info" style="margin-top: 30px; background: #fff3cd; border-left: 4px solid #ffc107;">
                    <p><strong>💡 Note:</strong> All API calls are automatically routed to the backend at <strong>${BACKEND_URL}</strong></p>
                </div>
            </div>
        </body>
        </html>
    `);
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

// API proxy endpoint to help with CORS if needed
app.use('/api', (req, res) => {
    res.json({
        message: 'Frontend proxy - use backend directly',
        backend: BACKEND_URL,
        hint: `Make requests to ${BACKEND_URL}${req.path}`
    });
});

// For Vercel serverless deployment
module.exports = app;
