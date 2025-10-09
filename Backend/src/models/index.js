import mongoose from 'mongoose';

// Upload Session Schema - Main container for entire process
const uploadSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['uploading', 'analyzing', 'completed', 'error'],
    default: 'uploading'
  },
  analysisProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  currentStep: {
    type: String,
    default: 'waiting'
  },
  completedAt: Date,
  errorMessage: String,

  // Files metadata
  files: [{
    id: String,
    originalName: String,
    filename: String,
    mimetype: String,
    size: Number,
    path: String
  }],

  // Extracted content data
  contentData: [{
    fileName: String,
    content: String,
    metadata: {
      fileType: String,
      originalSize: Number,
      extractionMethod: String,
      pages: Number,
      extractionError: String
    },
    fileInfo: {
      id: String,
      originalName: String,
      filename: String,
      mimetype: String,
      size: Number,
      path: String
    }
  }],

  // Analysis results
  analysisResults: {
    domainClassified: String,
    complexityLevel: String,
    qualityScore: Number,
    suitabilityLevel: String,
    suitabilityColor: String,
    gapsIdentified: Number,
    enhancementsRecommended: Number,
    smeQuestionsGenerated: Number,
    analyst: String,
    professionalGrade: Boolean
  }
}, {
  timestamps: true
});

// Professional Analysis Schema
const professionalAnalysisSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },

  // Domain Classification
  domainClassification: {
    primaryDomain: String,
    confidence: Number,
    reasoning: String,
    subDomain: String,
    contentType: String
  },

  // Complexity Assessment
  complexityAssessment: {
    level: String,
    reasoning: String,
    prerequisites: [String],
    cognitiveLoad: String
  },

  // Quality Assessment
  qualityAssessment: {
    overallScore: Number,
    clarityScore: Number,
    clarityJustification: String,
    completenessScore: Number,
    completenessJustification: String,
    engagementScore: Number,
    engagementJustification: String,
    currencyScore: Number,
    currencyJustification: String
  },

  // Suitability Assessment
  suitabilityAssessment: {
    score: Number,
    level: String,
    colorCode: String,
    recommendation: String,
    reasoning: String
  },

  // Gap Analysis
  gapAnalysis: {
    totalGaps: Number,
    severity: String,
    identifiedGaps: [{
      type: String,
      severity: String,
      description: String,
      recommendation: String
    }],
    recommendations: [String]
  },

  // Enhancement Suggestions
  enhancementSuggestions: [{
    type: String,
    description: String,
    priority: String
  }],

  // Professional Recommendations
  professionalRecommendations: [String],

  // Metadata
  metadata: {
    analysisCompletedAt: Date,
    analysisModel: String,
    analysisVersion: String,
    contentFilesAnalyzed: Number,
    totalContentLength: Number,
    analysisDurationMs: Number
  },

  // Raw Response
  rawResponse: String
}, {
  timestamps: true
});

// SME Questions Schema
const smeQuestionsSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  questions: [{
    id: String,
    question: String,
    category: String,
    domain: String,
    priority: String,
    rationale: String
  }],
  totalQuestions: Number,
  generatedAt: {
    type: Date,
    default: Date.now
  },
  domain: String,
  complexity: String
}, {
  timestamps: true
});

// SME Responses Schema
const smeResponsesSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  answers: [{
    questionId: String,
    question: String,
    answer: String,
    answeredAt: Date
  }],
  completedAt: Date,
  totalQuestions: Number,
  answeredQuestions: Number,
  completionRate: Number
}, {
  timestamps: true
});

// Learning Map Schema
const learningMapSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },

  // Course Information
  courseName: String,
  courseDescription: String,
  totalDuration: Number,
  difficultyLevel: String,

  // Learning Objectives
  learningObjectives: [String],

  // Prerequisites
  prerequisites: [String],

  // Modules
  modules: [{
    id: String,
    title: String,
    description: String,
    duration: Number,
    objectives: [String],
    order: Number,

    // Learning Activities
    activities: [{
      id: String,
      type: String,
      title: String,
      description: String,
      duration: Number,
      objectives: [String],
      resources: [String],
      order: Number
    }],

    // Assessment
    assessment: {
      type: String,
      description: String,
      duration: Number,
      weight: Number
    }
  }],

  // Learning Path
  learningPath: [{
    moduleId: String,
    order: Number,
    dependencies: [String],
    optionalPrerequisites: [String]
  }],

  // Strategy Information
  strategy: {
    learningApproach: String,
    primaryMethods: [String],
    assessmentStrategy: String,
    engagementTactics: [String]
  },

  // Content Profile
  contentProfile: {
    domain: String,
    complexity: String,
    estimatedHours: Number,
    targetAudience: String,
    deliveryMode: String
  },

  // Metadata
  metadata: {
    generatedAt: Date,
    generationModel: String,
    basedOnAnalysis: Boolean,
    includedSMEInput: Boolean,
    customStrategy: Boolean,
    aiEnhanced: Boolean
  },

  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Strategy Recommendations Schema
const strategyRecommendationsSchema = new mongoose.Schema({
  sessionId: String,
  requestId: String,

  // Strategy Data
  strategies: [{
    id: Number,
    title: String,
    description: String,
    icon: String,
    color: String,
    score: Number,
    reasoning: String,
    implementationComplexity: String,
    estimatedImpact: String,
    aiGenerated: Boolean,
    aiEnhanced: Boolean,
    enhancementType: String,
    useCases: [String],
    idealFor: [String]
  }],

  // Content Scores
  contentScores: {
    clarity: Number,
    engagement: Number,
    complexity: Number,
    completeness: Number,
    interactivity: Number,
    overall: Number
  },

  // Generation Method
  method: String,
  totalStrategiesAnalyzed: Number,
  useAI: Boolean,

  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// User Feedback Schema
const userFeedbackSchema = new mongoose.Schema({
  sessionId: String,
  feedbackType: {
    type: String,
    enum: ['analysis', 'learning_map', 'strategy', 'general']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  comments: String,
  suggestions: String,
  userId: String,
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Content Suggestions Schema
const contentSuggestionsSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  approvedSuggestions: [{
    id: String,
    type: String,
    description: String,
    priority: String,
    approved: Boolean,
    userNotes: String
  }],
  userNotes: String,
  approvedAt: Date,
  approvedBy: String
}, {
  timestamps: true
});

// Page Comments Schema - For expert feedback on each workflow step
const pageCommentsSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  pageId: {
    type: String,
    required: true,
    enum: [
      'content_upload_processing',
      'pre_sme_questions',
      'sme_questions',
      'sme_responses',
      'strategy_recommendations',
      'learning_map_generation',
      'personalize_learning_map',
      'final_report'
    ],
    index: true
  },
  comments: [{
    id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    content: {
      type: String,
      required: true,
      maxLength: 2000
    },
    expertName: {
      type: String,
      default: 'Expert'
    },
    expertEmail: {
      type: String,
      default: 'expert@company.com'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isResolved: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    category: {
      type: String,
      enum: ['suggestion', 'issue', 'question', 'feedback'],
      default: 'feedback'
    }
  }],
  totalComments: {
    type: Number,
    default: 0
  },
  lastCommentAt: Date
}, {
  timestamps: true
});

// Create models
export const UploadSession = mongoose.model('UploadSession', uploadSessionSchema);
export const ProfessionalAnalysis = mongoose.model('ProfessionalAnalysis', professionalAnalysisSchema);
export const SMEQuestions = mongoose.model('SMEQuestions', smeQuestionsSchema);
export const SMEResponses = mongoose.model('SMEResponses', smeResponsesSchema);
export const LearningMap = mongoose.model('LearningMap', learningMapSchema);
export const StrategyRecommendations = mongoose.model('StrategyRecommendations', strategyRecommendationsSchema);
export const UserFeedback = mongoose.model('UserFeedback', userFeedbackSchema);
export const ContentSuggestions = mongoose.model('ContentSuggestions', contentSuggestionsSchema);
export const PageComments = mongoose.model('PageComments', pageCommentsSchema);

// Export all models as default
export default {
  UploadSession,
  ProfessionalAnalysis,
  SMEQuestions,
  SMEResponses,
  LearningMap,
  StrategyRecommendations,
  UserFeedback,
  ContentSuggestions,
  PageComments
};