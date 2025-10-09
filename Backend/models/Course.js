import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  // Course identification
  courseId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Original content
  originalContent: {
    text: String,
    wordCount: Number,
    uploadedAt: Date
  },

  // Domain classification
  domain: {
    type: String,
    default: 'General'
  },

  // Source content (can be updated with AI enhancements)
  sourceContent: {
    type: String,
    required: true
  },

  // Enhanced content versions
  enhancedContent: [{
    version: Number,
    content: String,
    enhancements: [{
      recommendationId: Number,
      type: { type: String, enum: ['ai_generated', 'user_uploaded'] },
      title: String,
      enhancementData: mongoose.Schema.Types.Mixed,
      addedAt: Date,
      status: { type: String, enum: ['pending', 'approved', 'integrated'], default: 'pending' }
    }],
    createdAt: { type: Date, default: Date.now }
  }],

  // Analysis results
  analysis: {
    professional: mongoose.Schema.Types.Mixed,
    domainClassification: mongoose.Schema.Types.Mixed,
    qualityAssessment: mongoose.Schema.Types.Mixed,
    gapAnalysis: mongoose.Schema.Types.Mixed
  },

  // SME data
  sme: {
    preSMEAnswers: mongoose.Schema.Types.Mixed,
    smeAnswers: mongoose.Schema.Types.Mixed,
    validationStatus: String
  },

  // Recommendations
  recommendations: [{
    id: Number,
    category: String,
    priority: String,
    suggestion: String,
    reasoning: String,
    implementationSteps: [String],
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'implemented'], default: 'pending' },
    approvedAt: Date,
    documents: [{
      filename: String,
      path: String,
      type: String,
      uploadedAt: Date
    }],
    aiEnhancement: mongoose.Schema.Types.Mixed
  }],

  // Report data
  finalReport: mongoose.Schema.Types.Mixed,

  // Learning strategies
  strategies: mongoose.Schema.Types.Mixed,
  selectedStrategy: {
    strategyId: Number,
    selectedAt: Date
  },

  // Learning map
  learningMap: mongoose.Schema.Types.Mixed,

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['draft', 'analyzed', 'enhanced', 'strategy_selected', 'completed'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Index for faster queries
CourseSchema.index({ courseId: 1, status: 1 });
CourseSchema.index({ createdAt: -1 });

export default mongoose.model('Course', CourseSchema);
