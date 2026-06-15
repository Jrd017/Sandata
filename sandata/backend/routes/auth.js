const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authLimiter } = require('../middleware/rateLimit');
const { assertOnlyAllowed, sanitizeUser } = require('../middleware/validate');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[a-zA-Z0-9_]{3,30}$/;

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

router.post('/register', authLimiter, async (req, res) => {
  if (!assertOnlyAllowed(req, res, ['username', 'email', 'password'])) return;

  try {
    const username = String(req.body.username || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }
    if (!usernamePattern.test(username)) {
      return res.status(400).json({ error: 'Username must be 3-30 letters, numbers, or underscores' });
    }
    if (!emailPattern.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({ error: 'Password must be 8-128 characters' });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(409).json({ error: 'User already exists' });

    const user = await User.create({ username, email, password });
    const token = signToken(user._id);
    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  if (!assertOnlyAllowed(req, res, ['email', 'password'])) return;

  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) return res.status(400).json({ error: 'All fields required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const today = new Date().toDateString();
    const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate).toDateString() : null;
    if (lastLogin !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      user.dayStreak = lastLogin === yesterday ? user.dayStreak + 1 : 1;
      user.weekStreak = Math.max(user.weekStreak, Math.min(user.dayStreak, 7));
      user.lastLoginDate = new Date();
      await user.save();
    }

    const token = signToken(user._id);
    return res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
