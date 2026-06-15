const mongoose = require('mongoose');

const battleResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  enemyId: { type: String, required: true, trim: true, maxlength: 80 },
  outcome: { type: String, enum: ['win', 'loss'], required: true },
  correctAnswers: { type: Number, required: true, min: 0 },
  totalQuestions: { type: Number, required: true, min: 1, max: 20 },
  scorePercent: { type: Number, required: true, min: 0, max: 100 },
  xpAwarded: { type: Number, required: true, min: 0 },
  roomCode: { type: String, trim: true, uppercase: true, maxlength: 12 },
}, { timestamps: true });

battleResultSchema.index({ createdAt: -1 });
battleResultSchema.index({ roomCode: 1, createdAt: -1 });

module.exports = mongoose.model('BattleResult', battleResultSchema);
