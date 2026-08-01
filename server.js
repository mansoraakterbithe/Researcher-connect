const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/connections', require('./routes/connections'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/endorsements', require('./routes/endorsements'));
app.use('/api/match', require('./routes/match'));
app.use('/api/search', require('./routes/search'));
app.use('/api/karma', require('./routes/karma'));

// Ghosting Protection — runs every day at midnight
const cron = require('node-cron');
const { runGhostingProtection } = require('./utils/ghostingProtection');
cron.schedule('0 0 * * *', runGhostingProtection);
console.log('Ghosting Protection scheduler started');
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});