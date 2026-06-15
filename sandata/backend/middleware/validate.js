const mongoose = require('mongoose');

function rejectUnexpected(body, allowed) {
  const keys = Object.keys(body || {});
  return keys.filter((key) => !allowed.includes(key));
}

function assertOnlyAllowed(req, res, allowed) {
  const unexpected = rejectUnexpected(req.body, allowed);
  if (unexpected.length) {
    res.status(400).json({ error: `Unexpected field(s): ${unexpected.join(', ')}` });
    return false;
  }
  return true;
}

function isObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function sanitizeUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    totalXP: user.totalXP,
    level: user.level,
    rank: user.rank,
    dayStreak: user.dayStreak,
    weekStreak: user.weekStreak,
    badges: user.badges,
    completedModules: user.completedModules,
    quizzesCompleted: user.quizzesCompleted,
    accuracy: user.accuracy,
  };
}

module.exports = { assertOnlyAllowed, isObjectId, sanitizeUser };
