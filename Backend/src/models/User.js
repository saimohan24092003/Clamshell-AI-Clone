import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: function() {
      return this.provider === 'local';
    }
  },
  name: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'microsoft'],
    default: 'local'
  },
  providerId: {
    type: String,
    sparse: true
  },
  avatar: String,
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster lookups
userSchema.index({ provider: 1, providerId: 1 });

const User = mongoose.model('User', userSchema);

export default User;
