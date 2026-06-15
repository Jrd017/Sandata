const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  percentComplete: { type: Number, default: 0, min: 0, max: 100 },
  score: { type: Number, default: 0, min: 0 },
  xpEarned: { type: Number, default: 0, min: 0 },
  completedAt: Date,
  attempts: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

progressSchema.index({ user: 1, module: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
