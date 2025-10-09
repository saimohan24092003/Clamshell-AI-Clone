// Simple server to serve the frontend and avoid CORS issues
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 8080;

// Enable CORS for all routes
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Serve static files from current directory
app.use(express.static(path.join(__dirname, '.')));

// Serve the HTML file for any route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🌐 Frontend server running on http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    console.log('✅ CORS enabled - backend connections should work');
    console.log('');
    console.log('🔧 Make sure your backend is running on https://clamshell-backend-ao2dpyypa-mohammed-asrafs-projects.vercel.app');
    console.log('📄 Open: http://localhost:8080 in your browser');
});

module.exports = app;
