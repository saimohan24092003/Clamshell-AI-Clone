import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import ProfessionalContentAnalyzer from '../services/professionalContentAnalyzer.js';
import AdaptiveLearningMapGenerator from '../services/adaptiveLearningMapGenerator.js';
import { dataService } from '../services/dataService.js';

const router = express.Router();
const contentAnalyzer = new ProfessionalContentAnalyzer();
const learningMapGenerator = new AdaptiveLearningMapGenerator();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/content';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueId = uuidv4();
    const fileExtension = path.extname(file.originalname);
    cb(null, `${uniqueId}-${Date.now()}${fileExtension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 10
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'audio/mpeg', 'audio/wav', 'video/mp4', 'video/quicktime',
      'application/zip'
    ];

    if (allowedTypes.includes(file.mimetype) || 
        file.originalname.toLowerCase().endsWith('.scorm')) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
    }
  }
});

// Fallback memory storage for backward compatibility (will migrate to MongoDB)
const uploadSessions = new Map();

// Extract content from uploaded files
async function extractFileContent(file) {
  const ext = path.extname(file.originalname).toLowerCase();

  try {
    let content = '';
    let metadata = {
      fileType: ext,
      originalSize: file.size,
      extractionMethod: 'unknown'
    };

    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdf(dataBuffer);
      content = pdfData.text;
      metadata.extractionMethod = 'PDF Parser';
      metadata.pages = pdfData.numpages;
    } else if (ext === '.docx' || ext === '.doc') {
      const dataBuffer = fs.readFileSync(file.path);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      content = result.value;
      metadata.extractionMethod = 'Mammoth DOCX Parser';
    } else if (ext === '.txt') {
      content = fs.readFileSync(file.path, 'utf8');
      metadata.extractionMethod = 'Direct Text Read';
    } else {
      // For other file types, create a description for analysis
      content = `File: ${file.originalname} (${file.mimetype}) - Content extraction pending professional analysis`;
      metadata.extractionMethod = 'File Description';
    }

    return {
      content: content || 'No extractable content found',
      metadata,
      extracted: content.length > 0
    };

  } catch (error) {
    console.error(`Content extraction error for ${file.originalname}:`, error);
    return {
      content: `Error extracting content from ${file.originalname}. File may be corrupted or in unsupported format.`,
      metadata: { extractionError: error.message },
      extracted: false
    };
  }
}

// Upload and analyze endpoint with professional analysis
router.post('/upload-and-analyze', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded for professional analysis'
      });
    }

    console.log(`🎓 Dr. Sarah Mitchell analyzing ${req.files.length} uploaded files`);

    // Create session for tracking this upload batch
    const sessionId = uuidv4();

    // Extract content from all files
    const contentData = [];
    for (const file of req.files) {
      console.log(`📄 Extracting content from: ${file.originalname}`);
      const extractedContent = await extractFileContent(file);

      contentData.push({
        fileName: file.originalname,
        content: extractedContent.content,
        metadata: extractedContent.metadata,
        fileInfo: {
          id: uuidv4(),
          originalName: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path
        }
      });
    }

    const uploadSession = {
      sessionId,
      uploadedAt: new Date(),
      files: contentData.map(d => d.fileInfo),
      contentData,
      status: 'analyzing',
      analysisProgress: 25,
      currentStep: 'content_extracted'
    };

    // Store session data in MongoDB
    try {
      await dataService.createUploadSession(uploadSession);
      console.log(`💾 Session ${sessionId} saved to MongoDB`);
    } catch (dbError) {
      console.error('Failed to save to MongoDB, using memory fallback:', dbError);
      uploadSessions.set(sessionId, uploadSession);
    }

    // Send immediate response
    res.json({
      success: true,
      message: `Dr. Sarah Mitchell is analyzing ${req.files.length} files with professional expertise`,
      data: {
        sessionId,
        filesUploaded: req.files.length,
        files: uploadSession.files.map(f => ({
          id: f.id,
          name: f.originalName,
          size: f.size,
          type: f.mimetype
        })),
        analyst: "Dr. Sarah Mitchell, Ph.D.",
        analysisStatus: "Content extracted, professional analysis in progress"
      }
    });

    // Perform professional content analysis in background
    try {
      console.log(`🔍 Starting professional instructional design analysis...`);

      // Update progress in database
      await dataService.updateUploadSession(sessionId, {
        status: 'analyzing',
        analysisProgress: 50,
        currentStep: 'domain_classification'
      });

      // Perform the AI analysis
      const professionalAnalysis = await contentAnalyzer.analyzeContent(contentData, sessionId);

      // Save professional analysis to database
      await dataService.saveProfessionalAnalysis({
        sessionId,
        ...professionalAnalysis
      });

      // Generate content-specific SME questions
      const smeQuestions = await contentAnalyzer.generateContentSpecificSMEQuestions(
        professionalAnalysis,
        sessionId
      );

      // Save SME questions to database
      await dataService.saveSMEQuestions({
        sessionId,
        questions: smeQuestions,
        totalQuestions: smeQuestions.length,
        domain: professionalAnalysis.domainClassification.primaryDomain,
        complexity: professionalAnalysis.complexityAssessment.level
      });

      // Final update to session with completion status
      const analysisResults = {
        domainClassified: professionalAnalysis.domainClassification.primaryDomain,
        complexityLevel: professionalAnalysis.complexityAssessment.level,
        qualityScore: professionalAnalysis.qualityAssessment.overallScore,
        suitabilityLevel: professionalAnalysis.suitabilityAssessment.level,
        suitabilityColor: professionalAnalysis.suitabilityAssessment.colorCode,
        gapsIdentified: professionalAnalysis.gapAnalysis.identifiedGaps.length,
        enhancementsRecommended: professionalAnalysis.enhancementSuggestions.length,
        smeQuestionsGenerated: smeQuestions.length,
        analyst: "Dr. Sarah Mitchell, Ph.D.",
        professionalGrade: true
      };

      await dataService.updateUploadSession(sessionId, {
        status: 'completed',
        analysisProgress: 100,
        currentStep: 'analysis_complete',
        completedAt: new Date(),
        analysisResults
      });

      console.log(`✅ Professional analysis completed for session ${sessionId}`);
      console.log(`   📊 Domain: ${professionalAnalysis.domainClassification.primaryDomain}`);
      console.log(`   📈 Quality: ${professionalAnalysis.qualityAssessment.overallScore}%`);
      console.log(`   🎯 Suitability: ${professionalAnalysis.suitabilityAssessment.level} (${professionalAnalysis.suitabilityAssessment.colorCode})`);
      console.log(`   🔍 Gaps: ${professionalAnalysis.gapAnalysis.identifiedGaps.length}`);

    } catch (analysisError) {
      console.error('❌ Professional analysis failed:', analysisError);

      // Update error status in database
      await dataService.updateUploadSession(sessionId, {
        status: 'error',
        analysisProgress: 0,
        currentStep: 'analysis_failed',
        errorMessage: `Professional analysis failed: ${analysisError.message}`
      });
    }

  } catch (error) {
    console.error('❌ Upload error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Professional content analysis failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get analysis status with detailed professional results
router.get('/analysis-status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // First try to get from MongoDB
    let session = await dataService.getUploadSession(sessionId);

    // Fallback to memory if not found in MongoDB
    if (!session) {
      session = uploadSessions.get(sessionId);

      // If found in memory, migrate to MongoDB
      if (session) {
        try {
          await dataService.migrateMemorySession(sessionId, session);
          console.log(`🔄 Migrated session ${sessionId} from memory to MongoDB`);
          // Get the migrated session from MongoDB
          session = await dataService.getUploadSession(sessionId);
        } catch (migrationError) {
          console.error('Migration failed:', migrationError);
        }
      }
    }

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Analysis session not found'
      });
    }

    const response = {
      success: true,
      data: {
        sessionId,
        status: session.status,
        filesCount: session.files.length,
        analysisProgress: session.analysisProgress || 0,
        currentStep: session.currentStep || 'waiting',
        completedAt: session.completedAt || null,
        analyst: "Dr. Sarah Mitchell, Ph.D.",
        analysisResults: session.analysisResults || null
      }
    };

    // Include detailed professional analysis if completed
    let professionalAnalysis = null;
    let smeQuestions = null;

    if (session.status === 'completed') {
      // Get detailed analysis from database
      professionalAnalysis = await dataService.getProfessionalAnalysis(sessionId);
      smeQuestions = await dataService.getSMEQuestions(sessionId);
    }

    if (professionalAnalysis) {
      response.data.professionalAnalysis = {
        domainClassification: professionalAnalysis.domainClassification,
        complexityAssessment: professionalAnalysis.complexityAssessment,
        qualityAssessment: professionalAnalysis.qualityAssessment,
        suitabilityAssessment: professionalAnalysis.suitabilityAssessment,
        gapAnalysis: professionalAnalysis.gapAnalysis,
        enhancementSuggestions: professionalAnalysis.enhancementSuggestions,
        professionalRecommendations: professionalAnalysis.professionalRecommendations
      };

      // Include content-specific SME questions from database
      if (smeQuestions) {
        response.data.contentSpecificSMEQuestions = smeQuestions.questions || [];
      }

      // Add metadata
      response.data.metadata = professionalAnalysis.metadata;
    }

    // Include error information if analysis failed
    if (session.status === 'error') {
      response.data.errorMessage = session.errorMessage;
    }

    res.json(response);

  } catch (error) {
    console.error('❌ Analysis status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve professional analysis results',
      error: error.message
    });
  }
});

// Get detailed professional analysis endpoint
router.get('/professional-analysis/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = uploadSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Analysis session not found'
      });
    }

    if (session.status !== 'completed' || !session.professionalAnalysis) {
      return res.status(400).json({
        success: false,
        message: 'Professional analysis not yet completed',
        status: session.status
      });
    }

    res.json({
      success: true,
      message: 'Comprehensive professional instructional design analysis',
      data: {
        sessionId,
        analyst: "Dr. Sarah Mitchell, Ph.D. - Expert Instructional Designer",
        analysisCompletedAt: session.completedAt,
        fullAnalysis: session.professionalAnalysis,
        contentSpecificSMEQuestions: session.contentSpecificSMEQuestions,
        rawAnalysisResponse: session.professionalAnalysis.rawResponse,
        implementationReady: true
      }
    });

  } catch (error) {
    console.error('❌ Detailed analysis retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve detailed professional analysis',
      error: error.message
    });
  }
});

// Generate adaptive learning map from analysis
router.post('/generate-learning-map/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { strategy } = req.body; // Optional strategy preferences from user

    console.log(`🎯 Generating adaptive learning map for session: ${sessionId}`);

    // Get the session data from MongoDB
    const session = await dataService.getUploadSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Content analysis must be completed before generating learning map',
        currentStatus: session.status
      });
    }

    // Get professional analysis from database
    const professionalAnalysis = await dataService.getProfessionalAnalysis(sessionId);

    if (!professionalAnalysis) {
      return res.status(400).json({
        success: false,
        message: 'Professional analysis not found for this session'
      });
    }

    // Get SME responses if available
    const smeResponsesData = await dataService.getSMEResponses(sessionId);
    const smeResponses = smeResponsesData?.answers || [];

    // Pass complete data to learning map generator
    const learningMap = await learningMapGenerator.generateAdaptiveLearningMap(
      professionalAnalysis,
      strategy || {},
      smeResponses,
      {
        sessionId: sessionId,
        contentData: session.contentData || [],
        files: session.files || []
      }
    );

    // Save learning map to MongoDB
    await dataService.saveLearningMap({
      sessionId,
      ...learningMap,
      generatedAt: new Date()
    });

    console.log(`✅ Learning map generated successfully for session ${sessionId}`);
    console.log(`   📚 Course: ${learningMap.courseName}`);
    console.log(`   ⏱️ Duration: ${learningMap.totalDuration} minutes`);
    console.log(`   📖 Modules: ${learningMap.modules.length}`);

    res.json({
      success: true,
      message: 'Adaptive learning map generated successfully',
      data: {
        sessionId,
        learningMap,
        generatedAt: new Date().toISOString(),
        strategy: learningMap.metadata?.strategy,
        contentProfile: learningMap.metadata?.contentProfile
      }
    });

  } catch (error) {
    console.error('❌ Learning map generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate adaptive learning map',
      error: error.message
    });
  }
});

// Get learning map for a session
router.get('/learning-map/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Get learning map from MongoDB
    const learningMapData = await dataService.getLearningMap(sessionId);

    if (!learningMapData) {
      return res.status(404).json({
        success: false,
        message: 'Learning map not yet generated for this session',
        suggestion: `POST /api/content/generate-learning-map/${sessionId}`
      });
    }

    // Also get session info for additional context
    const session = await dataService.getUploadSession(sessionId);

    res.json({
      success: true,
      message: 'Learning map retrieved successfully',
      data: {
        sessionId,
        learningMap: learningMapData,
        generatedAt: learningMapData.generatedAt,
        analysisCompletedAt: session?.completedAt
      }
    });

  } catch (error) {
    console.error('❌ Learning map retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve learning map',
      error: error.message
    });
  }
});

// TEST ENDPOINT - Generate learning map with mock data for immediate testing
router.post('/test-learning-map', async (req, res) => {
  try {
    const { strategy } = req.body;

    console.log('🧪 Generating TEST learning map with strategy:', strategy?.learningApproach || 'adaptive');

    // Create mock professional analysis data
    const mockAnalysis = {
      domainClassification: {
        primaryDomain: 'Business & Management',
        confidence: 85,
        reasoning: 'Content focuses on leadership and team management principles'
      },
      complexityAssessment: {
        level: 'Intermediate',
        reasoning: 'Requires practical experience and management understanding'
      },
      qualityAssessment: {
        overallScore: 82,
        clarityScore: 85,
        completenessScore: 78,
        engagementScore: 84,
        currencyScore: 81
      },
      metadata: {
        contentFilesAnalyzed: 1,
        totalContentLength: 12500 // Roughly 15 pages
      }
    };

    const mockSessionData = {
      contentData: [
        {
          fileName: 'Leadership_Training_Manual.pdf',
          metadata: { pages: 15 }
        }
      ]
    };

    // Generate learning map using our adaptive generator
    const learningMap = await learningMapGenerator.generateAdaptiveLearningMap(
      mockAnalysis,
      strategy || { learningApproach: 'adaptive' },
      [], // No SME responses for test
      mockSessionData
    );

    console.log('✅ TEST learning map generated successfully');

    res.json({
      success: true,
      message: 'TEST learning map generated with mock data',
      data: {
        learningMap,
        testMode: true,
        strategy: strategy?.learningApproach || 'adaptive'
      }
    });

  } catch (error) {
    console.error('❌ TEST learning map generation failed:', error);
    res.status(500).json({
      success: false,
      message: 'TEST learning map generation failed',
      error: error.message
    });
  }
});

// Store approved content suggestions
router.post('/store-suggestions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { approvedSuggestions, userNotes } = req.body;

    const session = await dataService.getUploadSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Store approved suggestions in MongoDB
    const suggestionsData = {
      sessionId,
      approvedSuggestions: approvedSuggestions || [],
      userNotes: userNotes || '',
      approvedAt: new Date(),
      approvedBy: 'Content Manager'
    };

    await dataService.updateContentSuggestions(sessionId, suggestionsData);

    console.log(`✅ Stored ${approvedSuggestions?.length || 0} approved suggestions for session ${sessionId}`);

    res.json({
      success: true,
      message: 'Content suggestions stored successfully',
      data: {
        sessionId,
        suggestionsStored: approvedSuggestions?.length || 0,
        storedAt: suggestionsData.approvedAt
      }
    });

  } catch (error) {
    console.error('❌ Error storing suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store content suggestions',
      error: error.message
    });
  }
});

// Store SME answers
router.post('/store-sme-answers/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { smeAnswers, completedAt } = req.body;

    const session = await dataService.getUploadSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Get SME questions to calculate totals
    const smeQuestions = await dataService.getSMEQuestions(sessionId);
    const totalQuestions = smeQuestions?.totalQuestions || 0;
    const answeredQuestions = smeAnswers?.length || 0;

    // Store SME answers in MongoDB
    const smeResponsesData = {
      sessionId,
      answers: smeAnswers || [],
      completedAt: completedAt ? new Date(completedAt) : new Date(),
      totalQuestions,
      answeredQuestions,
      completionRate: totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0
    };

    await dataService.updateSMEResponses(sessionId, smeResponsesData);

    console.log(`✅ Stored SME answers for session ${sessionId}: ${smeAnswers?.length || 0} answers`);

    res.json({
      success: true,
      message: 'SME answers stored successfully',
      data: {
        sessionId,
        answersStored: answeredQuestions,
        totalQuestions: totalQuestions,
        completionRate: smeResponsesData.completionRate,
        storedAt: smeResponsesData.completedAt
      }
    });

  } catch (error) {
    console.error('❌ Error storing SME answers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store SME answers',
      error: error.message
    });
  }
});

// Get stored data for a session (suggestions and SME answers)
router.get('/session-data/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Get complete session data from MongoDB
    const completeData = await dataService.getCompleteSessionData(sessionId);

    if (!completeData.uploadSession) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      message: 'Session data retrieved successfully',
      data: {
        sessionId,
        hasApprovedSuggestions: !!completeData.contentSuggestions,
        hasSMEAnswers: !!completeData.smeResponses,
        approvedSuggestions: completeData.contentSuggestions || null,
        smeResponses: completeData.smeResponses || null,
        professionalAnalysis: completeData.professionalAnalysis ? {
          domain: completeData.professionalAnalysis.domainClassification?.primaryDomain,
          complexity: completeData.professionalAnalysis.complexityAssessment?.level,
          qualityScore: completeData.professionalAnalysis.qualityAssessment?.overallScore
        } : null
      }
    });

  } catch (error) {
    console.error('❌ Error retrieving session data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve session data',
      error: error.message
    });
  }
});

// DEBUG: Test analysis with sample content
router.post('/test-analysis', async (req, res) => {
  try {
    const sampleContent = [{
      fileName: 'test-content.txt',
      content: 'This is a healthcare training manual about patient safety and infection control procedures. It covers hand hygiene, PPE usage, and isolation precautions for healthcare professionals.',
      metadata: { fileType: '.txt', extractionMethod: 'Direct Text Read' },
      fileInfo: { id: 'test-123', originalName: 'test-content.txt' }
    }];

    console.log('🧪 Testing analysis with sample content');

    const analysis = await contentAnalyzer.analyzeContent(sampleContent, 'test-session');

    res.json({
      success: true,
      message: 'Test analysis completed',
      data: analysis
    });

  } catch (error) {
    console.error('❌ Test analysis failed:', error);
    res.status(500).json({
      success: false,
      message: 'Test analysis failed',
      error: error.message,
      stack: error.stack
    });
  }
});

export default router;
