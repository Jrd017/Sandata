const router = require('express').Router();
const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const top = await User.find()
      .sort({ totalXP: -1, createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('username avatar totalXP level rank');

    res.json(top.map((user, index) => ({
      id: user._id,
      rankNumber: (page - 1) * limit + index + 1,
      username: user.username,
      avatar: user.avatar,
      totalXP: user.totalXP,
      level: user.level,
      rank: user.rank,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
