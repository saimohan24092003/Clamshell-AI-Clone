import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';

// Helper function to set CORS headers
function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = process.env.FRONTEND_ORIGIN
    ? process.env.FRONTEND_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'];

  if (allowedOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}

// Store uploaded recommendation documents in memory (for development)
const recommendationDocuments = new Map();

// Parse FormData using formidable
function parseFormData(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      keepExtensions: true
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  // Set CORS headers
  setCorsHeaders(req, res);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📎 Processing recommendation document upload...');

    const { fields, files } = await parseFormData(req);

    const recommendationId = Array.isArray(fields.recommendationId)
      ? fields.recommendationId[0]
      : fields.recommendationId;
    const sessionId = Array.isArray(fields.sessionId)
      ? fields.sessionId[0]
      : fields.sessionId || 'default';

    console.log('Recommendation ID:', recommendationId);
    console.log('Session ID:', sessionId);
    console.log('Files received:', Object.keys(files));

    // Get uploaded documents
    const documentsArray = files.documents;
    const uploadedDocs = Array.isArray(documentsArray) ? documentsArray : [documentsArray];

    if (!uploadedDocs || uploadedDocs.length === 0) {
      throw new Error('No documents uploaded');
    }

    // Process uploaded files
    const processedFiles = [];
    for (const doc of uploadedDocs) {
      if (!doc) continue;

      const fileName = doc.originalFilename || doc.name || 'uploaded-document';
      const fileSize = doc.size;

      // Read file content
      let content = '';
      try {
        content = await fs.readFile(doc.filepath, 'utf-8');
      } catch (error) {
        content = `[Binary file: ${fileName}]`;
      }

      processedFiles.push({
        fileName,
        fileSize,
        uploadedAt: new Date().toISOString(),
        content: content.substring(0, 1000) // Store first 1000 chars
      });

      // Clean up temp file
      try {
        await fs.unlink(doc.filepath);
      } catch (error) {
        console.warn('Failed to delete temp file:', error.message);
      }
    }

    // Store in memory
    const key = `${sessionId}_${recommendationId}`;
    if (!recommendationDocuments.has(key)) {
      recommendationDocuments.set(key, []);
    }
    recommendationDocuments.get(key).push(...processedFiles);

    console.log(`✅ ${processedFiles.length} document(s) uploaded successfully for recommendation ${recommendationId}`);

    res.status(200).json({
      success: true,
      message: `${processedFiles.length} document(s) uploaded successfully`,
      recommendationId,
      sessionId,
      files: processedFiles.map(f => ({
        fileName: f.fileName,
        fileSize: f.fileSize,
        uploadedAt: f.uploadedAt
      }))
    });
  } catch (error) {
    console.error('❌ Document upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Document upload failed',
      message: error.message
    });
  }
}

// Export the store for use in other endpoints
export { recommendationDocuments };
