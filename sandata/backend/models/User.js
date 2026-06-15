const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  avatar: {
    type: String,
    enum: ['character_1', 'character_2', 'character_3', 'character_4', 'character_5'],
    default: 'character_1',
  },
  totalXP: { type: Number, default: 0, min: 0 },
  level: { type: Number, default: 1, min: 1 },
  rank: { type: String, default: 'Aspirant' },
  dayStreak: { type: Number, default: 0, min: 0 },
  weekStreak: { type: Number, default: 0, min: 0 },
  lastLoginDate: { type: Date },
  badges: [{ type: String }],
  completedModules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
  quizzesCompleted: { type: Number, default: 0, min: 0 },
  totalQuestionsAnswered: { type: Number, default: 0, min: 0 },
  totalCorrectAnswers: { type: Number, default: 0, min: 0 },
  accuracy: { type: Number, default: 0, min: 0, max: 100 },
}, { timestamps: true });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.recalculateLevel = function recalculateLevel() {
  const xp = this.totalXP;
  const levels = [
    { min: 0, level: 1, rank: 'Aspirant' },
    { min: 500, level: 2, rank: 'Data Scout' },
    { min: 1500, level: 3, rank: 'Shield Apprentice' },
    { min: 3000, level: 4, rank: 'Phish Hunter' },
    { min: 5000, level: 5, rank: 'Scam Buster' },
    { min: 8000, level: 6, rank: 'Net Guardian' },
    { min: 12000, level: 7, rank: 'Cyber Warrior' },
    { min: 18000, level: 8, rank: 'Digital Paladin' },
    { min: 25000, level: 9, rank: 'Data Sovereign' },
    { min: 35000, level: 10, rank: 'SanData Master' },
  ];
  const current = [...levels].reverse().find((item) => xp >= item.min) || levels[0];
  this.level = current.level;
  this.rank = current.rank;
};

module.exports = mongoose.model('User', userSchema);
