import { v4 as uuidv4 } from 'uuid';
import formidable from 'formidable';
import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import { extractContentWithPages } from '../utils/pageExtractor.js';

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

// Store uploaded files in memory (for development)
const uploadedFiles = new Map();

// Extract text from PDF buffer
async function extractPDFText(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    return '';
  }
}

// Parse FormData using formidable
function parseFormData(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: true,
      maxFileSize: 50 * 1024 * 1024 // 50MB
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
    // Check if it's FormData or JSON
    const contentType = req.headers['content-type'] || '';
    let content = '';
    let fileName = 'uploaded-file';

    let pageData = null;

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData upload
      console.log('📥 Processing FormData upload...');
      const { fields, files } = await parseFormData(req);

      console.log('Files received:', Object.keys(files));

      // Get the first file
      const fileArray = files.files;
      const uploadedFile = Array.isArray(fileArray) ? fileArray[0] : fileArray;

      if (!uploadedFile) {
        throw new Error('No file uploaded');
      }

      fileName = uploadedFile.originalFilename || uploadedFile.name || 'uploaded-file';
      console.log(`📄 Processing file: ${fileName}`);

      // Extract content WITH PAGE TRACKING using new utility
      try {
        pageData = await extractContentWithPages(uploadedFile.filepath, fileName);
        content = pageData.text;
        console.log(`✅ Content extracted with ${pageData.totalPages} pages, ${content.length} characters`);
      } catch (error) {
        console.error('Page extraction failed, falling back to basic extraction:', error);

        // Fallback to basic extraction without page tracking
        if (fileName.toLowerCase().endsWith('.pdf')) {
          content = await extractPDFText(uploadedFile.filepath);
          console.log(`✅ PDF extracted (no page tracking): ${content.length} characters`);
        } else if (fileName.toLowerCase().endsWith('.txt')) {
          content = await fs.readFile(uploadedFile.filepath, 'utf-8');
          console.log(`✅ Text file read: ${content.length} characters`);
        } else {
          // Try to read as text
          try {
            content = await fs.readFile(uploadedFile.filepath, 'utf-8');
          } catch (error) {
            content = `[Binary file: ${fileName}]`;
          }
        }
      }

      // Clean up temp file
      try {
        await fs.unlink(uploadedFile.filepath);
      } catch (error) {
        console.warn('Failed to delete temp file:', error.message);
      }
    } else {
      // Handle JSON upload (backward compatibility)
      const { files, content: bodyContent, fileName: bodyFileName } = req.body;
      content = bodyContent || '';
      fileName = bodyFileName || 'uploaded-file';
    }

    console.log('📥 Upload processed:', {
      hasContent: !!content,
      contentLength: content?.length || 0,
      fileName: fileName
    });

    // Generate file ID
    const fileId = uuidv4();

    // Store file content WITH PAGE DATA
    uploadedFiles.set(fileId, {
      content: content || '',
      fileName: fileName,
      uploadedAt: new Date().toISOString(),
      pageData: pageData || null,
      pageCount: pageData?.totalPages || null,
      pageMapping: pageData?.pageMapping || null
    });

    console.log('Extracted content:', content?.substring(0, 500));


    res.status(200).json({
      success: true,
      message: 'File received successfully',
      fileId: fileId,
      fileIds: [fileId],
      content: content || '',
      fileName: fileName,
      pageCount: pageData?.totalPages || null,
      totalPages: pageData?.totalPages || null,
      hasPageTracking: !!pageData,
      analysis: {
        status: 'analyzing',
        message: 'Dr. Elena Rodriguez is analyzing your content...'
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'File upload failed',
      message: error.message
    });
  }
}

// Export the store for use in analyze endpoint
export { uploadedFiles };
