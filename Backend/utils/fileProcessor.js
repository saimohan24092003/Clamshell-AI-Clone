import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { readFile } from 'fs/promises';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Extract text content from PDF files
 */
async function extractPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return {
      text: data.text,
      pageCount: data.numpages,
      metadata: {
        title: data.info?.Title || null,
        author: data.info?.Author || null,
        subject: data.info?.Subject || null
      }
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract PDF: ${error.message}`);
  }
}

/**
 * Extract text content from DOCX files
 */
async function extractDOCX(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;

    // Estimate page count (roughly 500 words per page)
    const wordCount = text.split(/\s+/).length;
    const pageCount = Math.ceil(wordCount / 500);

    return {
      text,
      pageCount,
      metadata: {
        wordCount
      }
    };
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error(`Failed to extract DOCX: ${error.message}`);
  }
}

/**
 * Extract text content from DOC files (legacy Word format)
 */
async function extractDOC(buffer) {
  try {
    // Mammoth also supports .doc files
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;

    const wordCount = text.split(/\s+/).length;
    const pageCount = Math.ceil(wordCount / 500);

    return {
      text,
      pageCount,
      metadata: {
        wordCount
      }
    };
  } catch (error) {
    console.error('DOC extraction error:', error);
    throw new Error(`Failed to extract DOC: ${error.message}`);
  }
}

/**
 * Transcribe audio files using OpenAI Whisper
 */
async function transcribeAudio(buffer, fileName) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // OpenAI Whisper API accepts File objects
    // We need to create a File-like object from the buffer
    const file = new File([buffer], fileName, {
      type: getAudioMimeType(fileName)
    });

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      response_format: 'verbose_json'
    });

    return {
      text: transcription.text,
      duration: transcription.duration || null,
      language: transcription.language || null,
      metadata: {
        segments: transcription.segments?.length || 0,
        model: 'whisper-1'
      }
    };
  } catch (error) {
    console.error('Audio transcription error:', error);
    throw new Error(`Failed to transcribe audio: ${error.message}`);
  }
}

/**
 * Extract audio from video and transcribe using OpenAI Whisper
 */
async function transcribeVideo(buffer, fileName) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // OpenAI Whisper can process video files directly
    const file = new File([buffer], fileName, {
      type: getVideoMimeType(fileName)
    });

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      response_format: 'verbose_json'
    });

    return {
      text: transcription.text,
      duration: transcription.duration || null,
      language: transcription.language || null,
      metadata: {
        segments: transcription.segments?.length || 0,
        model: 'whisper-1',
        type: 'video'
      }
    };
  } catch (error) {
    console.error('Video transcription error:', error);
    throw new Error(`Failed to transcribe video: ${error.message}`);
  }
}

/**
 * Extract text from plain text files
 */
async function extractText(buffer) {
  try {
    const text = buffer.toString('utf-8');
    const wordCount = text.split(/\s+/).length;
    const pageCount = Math.ceil(wordCount / 500);

    return {
      text,
      pageCount,
      metadata: {
        wordCount
      }
    };
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

/**
 * Get audio MIME type from file extension
 */
function getAudioMimeType(fileName) {
  const ext = fileName.toLowerCase().split('.').pop();
  const mimeTypes = {
    'mp3': 'audio/mpeg',
    'mp4': 'audio/mp4',
    'm4a': 'audio/mp4',
    'wav': 'audio/wav',
    'webm': 'audio/webm',
    'ogg': 'audio/ogg',
    'flac': 'audio/flac'
  };
  return mimeTypes[ext] || 'audio/mpeg';
}

/**
 * Get video MIME type from file extension
 */
function getVideoMimeType(fileName) {
  const ext = fileName.toLowerCase().split('.').pop();
  const mimeTypes = {
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'webm': 'video/webm',
    'mkv': 'video/x-matroska',
    'mpeg': 'video/mpeg',
    'mpg': 'video/mpeg'
  };
  return mimeTypes[ext] || 'video/mp4';
}

/**
 * Main file processor - detects file type and extracts content
 */
export async function processFile(buffer, fileName, mimeType) {
  const ext = fileName.toLowerCase().split('.').pop();

  console.log(`📄 Processing file: ${fileName} (${ext})`);

  try {
    // PDF files
    if (ext === 'pdf' || mimeType === 'application/pdf') {
      return await extractPDF(buffer);
    }

    // DOCX files
    if (ext === 'docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return await extractDOCX(buffer);
    }

    // DOC files
    if (ext === 'doc' || mimeType === 'application/msword') {
      return await extractDOC(buffer);
    }

    // Audio files
    if (['mp3', 'wav', 'm4a', 'ogg', 'flac', 'webm'].includes(ext) ||
        mimeType?.startsWith('audio/')) {
      return await transcribeAudio(buffer, fileName);
    }

    // Video files
    if (['mp4', 'mov', 'avi', 'webm', 'mkv', 'mpeg', 'mpg'].includes(ext) ||
        mimeType?.startsWith('video/')) {
      return await transcribeVideo(buffer, fileName);
    }

    // Text files
    if (['txt', 'text'].includes(ext) || mimeType?.startsWith('text/')) {
      return await extractText(buffer);
    }

    // PPT/PPTX - return placeholder (officegen is for creation, not extraction)
    if (['ppt', 'pptx'].includes(ext)) {
      return {
        text: `[PowerPoint presentation: ${fileName}]\n\nNote: PowerPoint content extraction requires additional processing. Please convert to PDF for full text extraction.`,
        pageCount: null,
        metadata: {
          warning: 'PowerPoint files require conversion to PDF for complete text extraction'
        }
      };
    }

    // Unsupported format - try as text
    console.warn(`⚠️  Unsupported file type: ${ext}, attempting text extraction`);
    return await extractText(buffer);

  } catch (error) {
    console.error(`❌ Error processing file ${fileName}:`, error);
    throw error;
  }
}

/**
 * Get supported file types list
 */
export function getSupportedFileTypes() {
  return {
    documents: ['.pdf', '.doc', '.docx', '.txt'],
    presentations: ['.ppt', '.pptx'],
    audio: ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.webm'],
    video: ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.mpeg', '.mpg'],
    archives: ['.zip']
  };
}

/**
 * Check if file type is supported
 */
export function isFileTypeSupported(fileName) {
  const ext = '.' + fileName.toLowerCase().split('.').pop();
  const supported = getSupportedFileTypes();

  return Object.values(supported).some(types => types.includes(ext));
}
