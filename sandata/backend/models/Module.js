const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  scenarioType: { type: String, default: 'message' },
  options: {
    type: [String],
    validate: (value) => Array.isArray(value) && value.length === 4,
  },
  correctIndex: { type: Number, required: true, min: 0, max: 3 },
  explanation: { type: String, required: true },
  xpReward: { type: Number, default: 20, min: 0 },
});

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: {
    type: String,
    enum: [
      'phishing',
      'fake_shopping',
      'investment_scams',
      'social_engineering',
      'otp_scams',
      'ai_scams',
      'romance_scams',
      'data_harvesting',
      'smishing',
      'other',
    ],
    required: true,
  },
  difficulty: { type: String, enum: ['beginner', 'popular', 'advanced'], default: 'beginner' },
  icon: { type: String, default: 'other' },
  description: { type: String, default: '' },
  completionXP: { type: Number, default: 50, min: 0 },
  questions: [questionSchema],
  totalEnrolled: { type: Number, default: 0, min: 0 },
  averageScore: { type: Number, default: 0, min: 0, max: 100 },
}, { timestamps: true });

module.exports = mongoose.model('Module', moduleSchema);
