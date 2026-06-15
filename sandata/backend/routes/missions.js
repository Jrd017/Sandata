const router = require('express').Router();
const protect = require('../middleware/auth');

const DAILY_MISSIONS = [
  { id: 'identify_phishing', label: 'Identify 3 phishing messages', target: 3, xp: 80 },
  { id: 'complete_module', label: 'Complete 1 lesson in any module', target: 1, xp: 50 },
  { id: 'quiz_streak', label: 'Get 5 correct answers in quizzes', target: 5, xp: 60 },
];

router.get('/', protect, async (req, res) => {
  const completedModules = req.user.completedModules?.length || 0;
  const correctAnswers = req.user.totalCorrectAnswers || 0;

  res.json(DAILY_MISSIONS.map((mission) => {
    const progressById = {
      identify_phishing: Math.min(correctAnswers, mission.target),
      complete_module: Math.min(completedModules, mission.target),
      quiz_streak: Math.min(correctAnswers, mission.target),
    };
    const progress = progressById[mission.id] || 0;
    return {
      ...mission,
      progress,
      complete: progress >= mission.target,
    };
  }));
});

module.exports = router;
