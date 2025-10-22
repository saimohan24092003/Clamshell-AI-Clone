import formidable from 'formidable';
import { readFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { withCors } from '../utils/cors.js';
import { processFile, isFileTypeSupported } from '../utils/fileProcessor.js';

// Store uploaded files in memory (for development)
const uploadedFiles = new Map();

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📥 Upload request received');
    const contentType = req.headers['content-type'] || '';

    // Handle JSON upload (backward compatibility)
    if (contentType.includes('application/json')) {
      const { content: bodyContent, fileName: bodyFileName, pageCount: bodyPageCount } = req.body;
      const content = bodyContent || '';
      const fileName = bodyFileName || 'uploaded-file';
      const pageCount = bodyPageCount || null;

      console.log('📄 Processing JSON upload:', { fileName, contentLength: content.length, pageCount });

      const fileId = uuidv4();
      uploadedFiles.set(fileId, {
        content: content,
        fileName: fileName,
        pageCount: pageCount,
        uploadedAt: new Date().toISOString()
      });

      console.log('✅ File stored:', fileId);

      return res.status(200).json({
        success: true,
        message: 'File received successfully',
        fileId: fileId,
        fileIds: [fileId],
        content: content,
        fileName: fileName,
        analysis: {
          status: 'analyzing',
          message: 'Dr. Elena Rodriguez is analyzing your content...'
        }
      });
    }

    // Handle multipart form data upload (PDF, DOCX, audio, video, etc.)
    console.log('📦 Processing multipart upload...');

    const form = formidable({
      maxFileSize: 100 * 1024 * 1024, // 100MB
      maxFiles: 10,
      allowEmptyFiles: false,
      multiples: true
    });

    const [fields, files] = await form.parse(req);

    // Get uploaded files
    const uploadedFilesList = files.files || files.file || [];
    const fileArray = Array.isArray(uploadedFilesList) ? uploadedFilesList : [uploadedFilesList];

    if (fileArray.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    console.log(`📄 Processing ${fileArray.length} file(s)...`);

    // Process each file
    const results = [];
    const errors = [];

    for (const file of fileArray) {
      try {
        const fileName = file.originalFilename || file.newFilename;
        const filePath = file.filepath;

        console.log(`🔍 Processing: ${fileName} (${Math.round(file.size / 1024)}KB)`);

        // Check if file type is supported
        if (!isFileTypeSupported(fileName)) {
          console.warn(`⚠️  Unsupported file type: ${fileName}`);
          errors.push({
            fileName,
            error: 'Unsupported file type'
          });
          continue;
        }

        // Read file buffer
        const buffer = await readFile(filePath);

        // Process file based on type
        const extracted = await processFile(buffer, fileName, file.mimetype);

        // Generate file ID
        const fileId = uuidv4();

        // Store extracted content
        uploadedFiles.set(fileId, {
          fileId,
          fileName,
          content: extracted.text,
          pageCount: extracted.pageCount,
          metadata: {
            ...extracted.metadata,
            originalSize: file.size,
            mimeType: file.mimetype,
            uploadedAt: new Date().toISOString()
          }
        });

        console.log(`✅ Successfully processed: ${fileName} (ID: ${fileId})`);

        results.push({
          fileId,
          fileName,
          contentLength: extracted.text.length,
          pageCount: extracted.pageCount,
          wordCount: extracted.text.split(/\s+/).length,
          metadata: extracted.metadata
        });

      } catch (error) {
        console.error(`❌ Error processing file:`, error);
        errors.push({
          fileName: file.originalFilename || file.newFilename,
          error: error.message
        });
      }
    }

    // Prepare response
    if (results.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All files failed to process',
        errors
      });
    }

    res.status(200).json({
      success: true,
      message: `Processed ${results.length} of ${fileArray.length} file(s)`,
      files: results,
      fileIds: results.map(r => r.fileId),
      errors: errors.length > 0 ? errors : undefined,
      totalFiles: fileArray.length,
      successfulFiles: results.length,
      failedFiles: errors.length
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'File upload failed',
      message: error.message
    });
  }
}

export default withCors(handler);

// Export the store for use in analyze endpoint
export { uploadedFiles };
