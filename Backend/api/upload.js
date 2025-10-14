import { v4 as uuidv4 } from 'uuid';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { withCors } from '../utils/cors.js';

// Store uploaded files in memory (for development)
const uploadedFiles = new Map();

// Extract text from PDF
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

// Extract text from DOCX
async function extractTextFromDOCX(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error(`Failed to extract text from DOCX: ${error.message}`);
  }
}

// Extract text from TXT
async function extractTextFromTXT(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error('TXT extraction error:', error);
    throw new Error(`Failed to read text file: ${error.message}`);
  }
}

// Determine file type and extract content
async function extractContentFromFile(filePath, mimeType, fileName) {
  console.log(`📄 Extracting content from: ${fileName} (${mimeType})`);

  // Check file extension as fallback
  const ext = fileName.toLowerCase().split('.').pop();

  // PDF files
  if (mimeType === 'application/pdf' || ext === 'pdf') {
    return await extractTextFromPDF(filePath);
  }

  // DOCX files
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === 'docx'
  ) {
    return await extractTextFromDOCX(filePath);
  }

  // DOC files (older Word format)
  if (mimeType === 'application/msword' || ext === 'doc') {
    // Note: mammoth primarily supports DOCX, DOC files may not work well
    try {
      return await extractTextFromDOCX(filePath);
    } catch (error) {
      throw new Error('DOC format is not fully supported. Please convert to DOCX or TXT format.');
    }
  }

  // Text files
  if (mimeType === 'text/plain' || ext === 'txt') {
    return await extractTextFromTXT(filePath);
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

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📥 Upload request received');

    // Parse multipart form data using formidable
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    console.log('📦 Parsed form data:', {
      fieldCount: Object.keys(fields).length,
      fileCount: Object.keys(files).length,
    });

    // Get the uploaded files (could be single or multiple)
    const uploadedFilesList = [];
    const fileIds = [];
    let allContent = '';

    // Handle files from formidable (could be array or single file)
    const fileEntries = Object.entries(files);

    if (fileEntries.length === 0) {
      // No files uploaded via multipart - check for JSON body with content
      const bodyContent = fields.content?.[0] || fields.content;
      const bodyFileName = fields.fileName?.[0] || fields.fileName || 'uploaded-file';

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

    // Process each uploaded file
    for (const [fieldName, fileData] of fileEntries) {
      // formidable returns array of files
      const fileArray = Array.isArray(fileData) ? fileData : [fileData];

      for (const file of fileArray) {
        console.log(`📄 Processing file: ${file.originalFilename || file.newFilename}`);

        try {
          // Extract content based on file type
          const content = await extractContentFromFile(
            file.filepath,
            file.mimetype,
            file.originalFilename || file.newFilename
          );

          console.log(`✅ Extracted ${content.length} characters from ${file.originalFilename}`);

          // Generate file ID
          const fileId = uuidv4();

          // Store file content
          uploadedFiles.set(fileId, {
            content: content,
            fileName: file.originalFilename || file.newFilename,
            mimeType: file.mimetype,
            size: file.size,
            uploadedAt: new Date().toISOString(),
          });

          uploadedFilesList.push({
            fileId: fileId,
            fileName: file.originalFilename || file.newFilename,
            size: file.size,
            contentLength: content.length,
            wordCount: content.trim().split(/\s+/).length,
          });

          fileIds.push(fileId);
          allContent += content + '\n\n';

          // Clean up temp file
          try {
            fs.unlinkSync(file.filepath);
          } catch (cleanupError) {
            console.warn('Failed to clean up temp file:', cleanupError.message);
          }
        } catch (extractionError) {
          console.error(`❌ Extraction failed for ${file.originalFilename}:`, extractionError);

          // Clean up temp file even on error
          try {
            fs.unlinkSync(file.filepath);
          } catch (cleanupError) {
            console.warn('Failed to clean up temp file:', cleanupError.message);
          }

          // Return user-friendly error
          return res.status(400).json({
            success: false,
            error: 'Content extraction failed',
            message: extractionError.message,
            fileName: file.originalFilename || file.newFilename,
            fileType: file.mimetype,
          });
        }
      }
    }

    console.log(`✅ Successfully processed ${uploadedFilesList.length} file(s)`);

    res.status(200).json({
      success: true,
      message: `Successfully processed ${uploadedFilesList.length} file(s)`,
      fileId: fileIds[0], // Primary file ID for single file
      fileIds: fileIds,
      sessionId: uuidv4(),
      files: uploadedFilesList,
      totalWordCount: allContent.trim().split(/\s+/).length,
      content: allContent, // Combined content for analysis
    });
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
