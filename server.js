const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// ── CORS ──────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// ── BODY PARSER ───────────────────────────────────────────
app.use(express.json());

// ── RATE LIMITING ─────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again after 15 minutes' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, please try again after 15 minutes' }
});

app.use(limiter);
//app.use('/api/auth/login', authLimiter);
//app.use('/api/auth/signup', authLimiter);

// ── ROUTES ────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/connections', require('./routes/connections'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/endorsements', require('./routes/endorsements'));
app.use('/api/match', require('./routes/match'));
app.use('/api/search', require('./routes/search'));
app.use('/api/karma', require('./routes/karma'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/admin', require('./routes/admin'));

// ── SCHEDULED JOBS ────────────────────────────────────────
const { runGhostingProtection } = require('./utils/ghostingProtection');
const { runWeatherReport } = require('./utils/weatherReport');

// Ghosting Protection — runs every day at midnight
cron.schedule('0 0 * * *', runGhostingProtection);

// Research Weather Report — runs every Monday at 8am
cron.schedule('0 8 * * 1', runWeatherReport);

console.log('Scheduled jobs started: Ghosting Protection + Weather Report');

// ── HEALTH CHECK ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'ResearchConnect API is running',
    timestamp: new Date().toISOString()
  });
});

// ── ERROR HANDLER ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on our server' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});