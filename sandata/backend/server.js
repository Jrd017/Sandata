require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { globalLimiter } = require('./middleware/rateLimit');
const { connectDatabase } = require('./services/db');
const { seedIfEmpty } = require('./services/seedContent');

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin blocked'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '32kb' }));
app.use(globalLimiter);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'sandata-backend' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/modules', require('./routes/modules'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/battlefield', require('./routes/battlefield'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/missions', require('./routes/missions'));

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  if (err.message === 'CORS origin blocked') {
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  console.error(err);
  return res.status(500).json({ error: 'Server error' });
});

async function start() {
  await connectDatabase();
  await seedIfEmpty();

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

if (require.main === module) {
  start().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = app;
