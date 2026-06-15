const router = require('express').Router();
const protect = require('../middleware/auth');
const { assertOnlyAllowed, sanitizeUser } = require('../middleware/validate');

router.get('/me', protect, async (req, res) => {
  res.json(sanitizeUser(req.user));
});

router.patch('/avatar', protect, async (req, res) => {
  if (!assertOnlyAllowed(req, res, ['avatar'])) return;

  const { avatar } = req.body;
  const allowed = ['character_1', 'character_2', 'character_3', 'character_4', 'character_5'];
  if (!allowed.includes(avatar)) return res.status(400).json({ error: 'Invalid avatar' });

  req.user.avatar = avatar;
  await req.user.save();
  res.json({ avatar });
});

module.exports = router;
