import { v4 as uuidv4 } from 'uuid';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { withCors } from '../utils/cors.js';

// Store uploaded files in memory (for development)
const uploadedFiles = new Map();

// Extract text from PDF buffer
async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

// Extract text from DOCX buffer
async function extractTextFromDOCX(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer: buffer });
    return result.value;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error(`Failed to extract text from DOCX: ${error.message}`);
  }
}

// Extract text from TXT buffer
function extractTextFromTXT(buffer) {
  try {
    return buffer.toString('utf8');
  } catch (error) {
    console.error('TXT extraction error:', error);
    throw new Error(`Failed to read text file: ${error.message}`);
  }
}

// Determine file type and extract content from buffer
async function extractContentFromBuffer(buffer, mimeType, fileName) {
  console.log(`📄 Extracting content from: ${fileName} (${mimeType})`);

  // Check file extension as fallback
  const ext = fileName.toLowerCase().split('.').pop();

  // PDF files
  if (mimeType === 'application/pdf' || ext === 'pdf') {
    return await extractTextFromPDF(buffer);
  }

  // DOCX files
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === 'docx'
  ) {
    return await extractTextFromDOCX(buffer);
  }

  // DOC files (older Word format)
  if (mimeType === 'application/msword' || ext === 'doc') {
    try {
      return await extractTextFromDOCX(buffer);
    } catch (error) {
      throw new Error('DOC format is not fully supported. Please convert to DOCX or TXT format.');
    }
  }

  // Text files
  if (mimeType === 'text/plain' || ext === 'txt') {
    return extractTextFromTXT(buffer);
  }

  // PPTX - Not yet implemented
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    ext === 'pptx' ||
    ext === 'ppt'
  ) {
    throw new Error(
      'PowerPoint files are not yet supported. Please export your slides to PDF or copy the text to a TXT file.'
    );
  }

  // Audio/Video files - Require transcription
  if (
    mimeType?.startsWith('audio/') ||
    mimeType?.startsWith('video/') ||
    ['mp3', 'wav', 'mp4', 'mov', 'avi'].includes(ext)
  ) {
    throw new Error(
      'Audio and video files require transcription, which is not yet implemented. Please provide a transcript in TXT or DOCX format.'
    );
  }

  // SCORM packages
  if (ext === 'zip' || fileName.toLowerCase().includes('scorm')) {
    throw new Error(
      'SCORM packages require special processing. Please extract the content and upload as PDF or DOCX.'
    );
  }

  // Image files
  if (mimeType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
    throw new Error(
      'Image files cannot be analyzed for text content. If the image contains text, please use OCR or copy the text to a TXT file.'
    );
  }

  // Unsupported file type
  throw new Error(
    `Unsupported file type: ${mimeType || ext}. Supported formats: PDF, DOCX, TXT. Coming soon: Audio/Video transcription.`
  );
}

// Parse multipart form data manually (Vercel-compatible)
async function parseMultipartForm(req) {
  return new Promise((resolve, reject) => {
    const boundary = req.headers['content-type']?.split('boundary=')[1];
    if (!boundary) {
      reject(new Error('No boundary found in content-type'));
      return;
    }

    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks);
        const parts = buffer.toString('binary').split(`--${boundary}`);
        const files = [];

        for (const part of parts) {
          if (part.includes('Content-Disposition: form-data')) {
            const nameMatch = part.match(/name="([^"]+)"/);
            const filenameMatch = part.match(/filename="([^"]+)"/);
            const contentTypeMatch = part.match(/Content-Type: ([^\r\n]+)/);

            if (filenameMatch) {
              // This is a file
              const contentStart = part.indexOf('\r\n\r\n') + 4;
              const contentEnd = part.lastIndexOf('\r\n');
              const fileContent = part.substring(contentStart, contentEnd);
              const fileBuffer = Buffer.from(fileContent, 'binary');

              files.push({
                fieldName: nameMatch ? nameMatch[1] : 'file',
                fileName: filenameMatch[1],
                mimeType: contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream',
                buffer: fileBuffer,
                size: fileBuffer.length,
              });
            }
          }
        }

        resolve({ files });
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📥 Upload request received');

    // Check if this is multipart form data or JSON
    const contentType = req.headers['content-type'] || '';

    if (contentType.includes('multipart/form-data')) {
      // Parse multipart form data
      const { files } = await parseMultipartForm(req);

      if (!files || files.length === 0) {
        throw new Error('No files provided');
      }

      console.log(`📦 Received ${files.length} file(s)`);

      // Process each uploaded file
      const uploadedFilesList = [];
      const fileIds = [];
      let allContent = '';

      for (const file of files) {
        console.log(`📄 Processing file: ${file.fileName}`);

        try {
          // Extract content based on file type
          const content = await extractContentFromBuffer(file.buffer, file.mimeType, file.fileName);

          console.log(`✅ Extracted ${content.length} characters from ${file.fileName}`);

          // Generate file ID
          const fileId = uuidv4();

          // Store file content
          uploadedFiles.set(fileId, {
            content: content,
            fileName: file.fileName,
            mimeType: file.mimeType,
            size: file.size,
            uploadedAt: new Date().toISOString(),
          });

          uploadedFilesList.push({
            fileId: fileId,
            fileName: file.fileName,
            size: file.size,
            contentLength: content.length,
            wordCount: content.trim().split(/\s+/).length,
          });

          fileIds.push(fileId);
          allContent += content + '\n\n';
        } catch (extractionError) {
          console.error(`❌ Extraction failed for ${file.fileName}:`, extractionError);

          // Return user-friendly error
          return res.status(400).json({
            success: false,
            error: 'Content extraction failed',
            message: extractionError.message,
            fileName: file.fileName,
            fileType: file.mimeType,
          });
        }
      }

      console.log(`✅ Successfully processed ${uploadedFilesList.length} file(s)`);

      return res.status(200).json({
        success: true,
        message: `Successfully processed ${uploadedFilesList.length} file(s)`,
        fileId: fileIds[0], // Primary file ID for single file
        fileIds: fileIds,
        sessionId: uuidv4(),
        files: uploadedFilesList,
        totalWordCount: allContent.trim().split(/\s+/).length,
        content: allContent, // Combined content for analysis
      });
    } else {
      // JSON body with content
      const bodyContent = req.body.content;
      const bodyFileName = req.body.fileName || 'uploaded-file';

      if (bodyContent) {
        console.log('📄 Processing content from JSON body');
        const fileId = uuidv4();
        uploadedFiles.set(fileId, {
          content: bodyContent,
          fileName: bodyFileName,
          uploadedAt: new Date().toISOString(),
        });

        return res.status(200).json({
          success: true,
          message: 'Content received successfully',
          fileId: fileId,
          fileIds: [fileId],
          content: bodyContent,
          fileName: bodyFileName,
          wordCount: bodyContent.trim().split(/\s+/).length,
        });
      }

      throw new Error('No files or content provided');
    }
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'File upload failed',
      message: error.message,
    });
  }
}

export default withCors(handler);

// Export the store for use in analyze endpoint
export { uploadedFiles };
