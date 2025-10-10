import { v4 as uuidv4 } from 'uuid';

// Store uploaded files in memory (for development)
const uploadedFiles = new Map();

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📥 Upload request received');

    // Handle JSON upload
    const { content: bodyContent, fileName: bodyFileName } = req.body;
    const content = bodyContent || '';
    const fileName = bodyFileName || 'uploaded-file';

    console.log('📄 Processing upload:', { fileName, contentLength: content.length });

    // Generate file ID
    const fileId = uuidv4();

    // Store file content
    uploadedFiles.set(fileId, {
      content: content,
      fileName: fileName,
      uploadedAt: new Date().toISOString()
    });

    console.log('✅ File stored:', fileId);

    res.status(200).json({
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
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'File upload failed',
      message: error.message
    });
  }
}

export default handler;

// Export the store for use in analyze endpoint
export { uploadedFiles };
