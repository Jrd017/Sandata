const crypto = require('crypto');
const router = require('express').Router();
const protect = require('../middleware/auth');
const BattleResult = require('../models/BattleResult');
const User = require('../models/User');
const { assertOnlyAllowed, sanitizeUser } = require('../middleware/validate');

const rooms = new Map();
const roomLifetimeMs = 60 * 60 * 1000;
const roomCodePattern = /^[A-Z0-9]{5,8}$/;

function pruneRooms() {
  const staleBefore = Date.now() - roomLifetimeMs;
  for (const [code, room] of rooms.entries()) {
    if (room.createdAt.getTime() < staleBefore) rooms.delete(code);
  }
}

function createRoomCode() {
  pruneRooms();
  let code = '';
  do {
    code = crypto.randomBytes(4).toString('hex').slice(0, 6).toUpperCase();
  } while (rooms.has(code));
  return code;
}

function roomPayload(room) {
  return {
    code: room.code,
    host: room.host,
    players: Array.from(room.players.values()),
    status: room.status,
    createdAt: room.createdAt,
  };
}

router.post('/rooms', protect, (req, res) => {
  if (!assertOnlyAllowed(req, res, [])) return;

  const code = createRoomCode();
  const host = {
    id: req.user._id.toString(),
    username: req.user.username,
    avatar: req.user.avatar,
  };
  const room = {
    code,
    host,
    players: new Map([[host.id, host]]),
    status: 'waiting',
    createdAt: new Date(),
  };
  rooms.set(code, room);
  res.status(201).json(roomPayload(room));
});

router.post('/rooms/:code/join', protect, (req, res) => {
  if (!assertOnlyAllowed(req, res, [])) return;
  pruneRooms();

  const code = String(req.params.code || '').trim().toUpperCase();
  if (!roomCodePattern.test(code)) return res.status(400).json({ error: 'Invalid room code' });

  const room = rooms.get(code);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (room.players.size >= 2 && !room.players.has(req.user._id.toString())) {
    return res.status(409).json({ error: 'Room is full' });
  }

  room.players.set(req.user._id.toString(), {
    id: req.user._id.toString(),
    username: req.user.username,
    avatar: req.user.avatar,
  });
  room.status = room.players.size > 1 ? 'ready' : 'waiting';
  res.json(roomPayload(room));
});

router.get('/rooms/:code', protect, (req, res) => {
  pruneRooms();

  const code = String(req.params.code || '').trim().toUpperCase();
  if (!roomCodePattern.test(code)) return res.status(400).json({ error: 'Invalid room code' });

  const room = rooms.get(code);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json(roomPayload(room));
});

router.post('/submit', protect, async (req, res) => {
  if (!assertOnlyAllowed(req, res, ['enemyId', 'outcome', 'correctAnswers', 'totalQuestions', 'roomCode'])) return;

  try {
    const enemyId = String(req.body.enemyId || '').trim();
    const outcome = String(req.body.outcome || '').trim();
    const correctAnswers = Number(req.body.correctAnswers);
    const totalQuestions = Number(req.body.totalQuestions);
    const roomCode = req.body.roomCode ? String(req.body.roomCode).trim().toUpperCase() : undefined;

    if (!enemyId || enemyId.length > 80) return res.status(400).json({ error: 'Invalid enemy' });
    if (!['win', 'loss'].includes(outcome)) return res.status(400).json({ error: 'Invalid outcome' });
    if (!Number.isInteger(correctAnswers) || !Number.isInteger(totalQuestions)) {
      return res.status(400).json({ error: 'Invalid score' });
    }
    if (totalQuestions < 1 || totalQuestions > 20 || correctAnswers < 0 || correctAnswers > totalQuestions) {
      return res.status(400).json({ error: 'Invalid score' });
    }
    if (roomCode && !roomCodePattern.test(roomCode)) return res.status(400).json({ error: 'Invalid room code' });

    const scorePercent = Math.round((correctAnswers / totalQuestions) * 100);
    const xpAwarded = Math.min(160, Math.max(0, correctAnswers * 30 + (outcome === 'win' ? 40 : 0)));

    const user = await User.findById(req.user._id);
    user.totalXP += xpAwarded;
    user.quizzesCompleted += 1;
    user.totalQuestionsAnswered += totalQuestions;
    user.totalCorrectAnswers += correctAnswers;
    user.accuracy = Math.round((user.totalCorrectAnswers / user.totalQuestionsAnswered) * 100);

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

    await BattleResult.create({
      user: user._id,
      enemyId,
      outcome,
      correctAnswers,
      totalQuestions,
      scorePercent,
      xpAwarded,
      roomCode,
    });

    if (roomCode && rooms.has(roomCode)) {
      const room = rooms.get(roomCode);
      room.status = 'completed';
    }

    res.json({
      outcome,
      scorePercent,
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
