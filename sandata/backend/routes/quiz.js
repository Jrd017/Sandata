const router = require('express').Router();
const protect = require('../middleware/auth');
const Module = require('../models/Module');
const User = require('../models/User');
const Progress = require('../models/Progress');
const { assertOnlyAllowed, isObjectId, sanitizeUser } = require('../middleware/validate');

function hasValidAnswers(answers, length) {
  return Array.isArray(answers)
    && answers.length === length
    && answers.every((answer) => Number.isInteger(answer) && answer >= -1 && answer <= 3);
}

async function updateModuleStats(moduleId) {
  const records = await Progress.find({ module: moduleId });
  if (!records.length) return;

  const average = Math.round(records.reduce((sum, record) => sum + record.percentComplete, 0) / records.length);
  await Module.findByIdAndUpdate(moduleId, {
    totalEnrolled: records.length,
    averageScore: average,
  });
}

router.post('/check', protect, async (req, res) => {
  if (!assertOnlyAllowed(req, res, ['moduleId', 'questionIndex', 'answer'])) return;

  const { moduleId, questionIndex, answer } = req.body;
  if (!isObjectId(moduleId) || !Number.isInteger(questionIndex) || !Number.isInteger(answer)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const module = await Module.findById(moduleId);
  if (!module || !module.questions[questionIndex]) {
    return res.status(404).json({ error: 'Question not found' });
  }

  if (answer < 0 || answer > 3) return res.status(400).json({ error: 'Invalid answer' });

  const question = module.questions[questionIndex];
  res.json({
    isCorrect: answer === question.correctIndex,
    correctIndex: question.correctIndex,
    explanation: question.explanation,
  });
});

router.post('/submit', protect, async (req, res) => {
  if (!assertOnlyAllowed(req, res, ['moduleId', 'answers'])) return;

  try {
    const { moduleId, answers } = req.body;
    if (!isObjectId(moduleId)) return res.status(400).json({ error: 'Invalid module id' });

    const module = await Module.findById(moduleId);
    if (!module) return res.status(404).json({ error: 'Module not found' });
    if (!hasValidAnswers(answers, module.questions.length)) {
      return res.status(400).json({ error: 'Invalid answers' });
    }

    let correct = 0;
    const results = module.questions.map((question, index) => {
      const isCorrect = answers[index] === question.correctIndex;
      if (isCorrect) correct += 1;
      return {
        isCorrect,
        explanation: question.explanation,
        correctIndex: question.correctIndex,
      };
    });

    const scorePercent = Math.round((correct / module.questions.length) * 100);
    const calculatedXP = Math.round((correct / module.questions.length) * module.completionXP);
    const existingProgress = await Progress.findOne({ user: req.user._id, module: moduleId });
    const xpAwarded = Math.max(0, calculatedXP - (existingProgress?.xpEarned || 0));

    const user = await User.findById(req.user._id);
    user.totalXP += xpAwarded;
    user.quizzesCompleted += 1;
    user.totalQuestionsAnswered += module.questions.length;
    user.totalCorrectAnswers += correct;
    user.accuracy = Math.round((user.totalCorrectAnswers / user.totalQuestionsAnswered) * 100);

    if (!user.completedModules.some((id) => id.toString() === moduleId)) {
      user.completedModules.push(module._id);
    }

    const newBadges = [];
    function award(key) {
      if (!user.badges.includes(key)) {
        user.badges.push(key);
        newBadges.push(key);
      }
    }

    if (user.quizzesCompleted >= 5) award('phishing_fighter');
    if (user.accuracy >= 90 && user.quizzesCompleted >= 1) award('quiz_master');
    if (user.dayStreak >= 7) award('streak_warrior');
    if (scorePercent === 100) award('sharp_observer');
    if (user.totalXP >= 500) award('community_helper');

    user.recalculateLevel();
    await user.save();

    await Progress.findOneAndUpdate(
      { user: user._id, module: moduleId },
      {
        percentComplete: Math.max(scorePercent, existingProgress?.percentComplete || 0),
        score: Math.max(correct, existingProgress?.score || 0),
        xpEarned: Math.max(calculatedXP, existingProgress?.xpEarned || 0),
        completedAt: new Date(),
        $inc: { attempts: 1 },
      },
      { upsert: true, new: true, runValidators: true },
    );
    await updateModuleStats(moduleId);

    res.json({
      results,
      scorePercent,
      xpEarned: calculatedXP,
      xpAwarded,
      newBadges,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
