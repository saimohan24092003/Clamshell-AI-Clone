import mongoose from 'mongoose';

const preSMEResponseSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  clientName: {
    type: String,
    required: true
  },
  contentConfirmation: {
    type: String,
    enum: ['primary', 'partial', 'supplementary'],
    required: true
  },
  audienceLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Mixed'],
    required: true
  },
  courseType: {
    type: String,
    enum: ['certification', 'training', 'onboarding', 'compliance', 'skills', 'academic', 'workshop', 'other'],
    required: true
  },
  courseDuration: {
    type: String,
    enum: ['30min', '1hour', '2-3hours', 'half-day', 'full-day', 'multi-day', 'self-paced'],
    required: true
  },
  instructionalFrameworks: [{
    type: String,
    enum: [
      'Blooms Taxonomy',
      'ADDIE Model',
      'SAM Model',
      'Kirkpatrick Model',
      "Gagné's Nine Events",
      "Merrill's Principles",
      "Kolb's Learning Cycle"
    ]
  }],
  detectedDomain: {
    type: String,
    default: 'General'
  },
  detectedComplexity: {
    type: String,
    default: 'Intermediate'
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
preSMEResponseSchema.index({ sessionId: 1, createdAt: -1 });

const PreSMEResponse = mongoose.models.PreSMEResponse || mongoose.model('PreSMEResponse', preSMEResponseSchema);

export default PreSMEResponse;
