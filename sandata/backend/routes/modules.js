const router = require('express').Router();
const Module = require('../models/Module');
const Progress = require('../models/Progress');
const protect = require('../middleware/auth');
const { isObjectId } = require('../middleware/validate');

router.get('/', protect, async (req, res) => {
  const modules = await Module.find().select('-questions').sort({ difficulty: 1, title: 1 });
  const progress = await Progress.find({ user: req.user._id });

  const result = modules.map((module) => {
    const item = module.toObject();
    const record = progress.find((entry) => entry.module.toString() === module._id.toString());
    return {
      ...item,
      percentComplete: record?.percentComplete || 0,
      attempts: record?.attempts || 0,
    };
  });

  res.json(result);
});

router.get('/:id', protect, async (req, res) => {
  if (!isObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid module id' });

  const module = await Module.findById(req.params.id);
  if (!module) return res.status(404).json({ error: 'Not found' });

  const safe = module.toObject();
  safe.questions = safe.questions.map(({ _id, questionText, scenarioType, options, xpReward }) => ({
    id: _id,
    questionText,
    scenarioType,
    options,
    xpReward,
  }));

  res.json(safe);
});

module.exports = router;
