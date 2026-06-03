require('dotenv').config();
const express = require('express');
const sequelize = require('./config/db');

// ─── Security Middleware ──────────────────────────────────────────────────────
const {
  helmetMiddleware,
  corsMiddleware,
  apiLimiter,
} = require('./middleware/security');

// ─── Graceful Error Handling (prevent crashes) ────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err.message, err.stack);
});
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

// ─── Model Registration (Sequelize sync) ────────────────────────────────────
require('./models/Worker');
require('./models/Company');
require('./models/Job');
require('./models/Conversation');
require('./models/Message');
require('./models/Notification');
require('./models/Admin');
require('./models/Application');
require('./models/Rating');
require('./models/AdminLog');
require('./models/Report');
require('./models/Block');
require('./models/Bookmark');
require('./models/Settings');
require('./models/GlobalSettings');
require('./models/Broadcast');
require('./models/Category');
require('./models/Transaction');

// ─── Route Imports ────────────────────────────────────────────────────────────
const authRoutes         = require('./routes/authRoutes');
const jobRoutes          = require('./routes/jobRoutes');
const userRoutes         = require('./routes/userRoutes');
const chatRoutes         = require('./routes/chatRoutes');
const aiRoutes           = require('./routes/aiRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes        = require('./routes/adminRoutes');
const bookmarkRoutes     = require('./routes/bookmarkRoutes');
const settingsRoutes     = require('./routes/settingsRoutes');
const reportRoutes       = require('./routes/reportRoutes');

const app = express();

// ─── Core Security Middleware Stack ──────────────────────────────────────────
app.use(helmetMiddleware);            // HTTP security headers
app.use(corsMiddleware);              // Strict CORS whitelist
app.use(express.json({ limit: '10mb' })); // Reduced from 50mb — prevents DoS
app.use(apiLimiter);                  // Global rate limit (300/15min)

// ─── Health Check (unauthenticated, no DB hit) ────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/jobs',          jobRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/chats',         chatRoutes);
app.use('/api/ai',            aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/bookmarks',     bookmarkRoutes);
app.use('/api/settings',      settingsRoutes);
app.use('/api/reports',       reportRoutes);

// ─── 404 Handler (prevents route-enumeration info leak) ──────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Resource not found.' });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
// IMPORTANT: Never leak stack traces to the client in production
app.use((err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';
  console.error('[EXPRESS ERROR]', err.message, isDev ? err.stack : '');

  // Handle CORS errors
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({ success: false, error: err.message });
  }

  res.status(err.status || 500).json({
    success: false,
    error: isDev ? err.message : 'Internal server error.',
    ...(isDev && { stack: err.stack }),
  });
});

// ─── Database & Server Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

sequelize
  .sync()
  .then(async () => {
    console.log('[DB] Connected to MySQL via Sequelize');

    // Increase packet size for image uploads
    try {
      await sequelize.query('SET GLOBAL max_allowed_packet = 67108864;');
    } catch {
      try {
        await sequelize.query('SET SESSION max_allowed_packet = 67108864;');
      } catch {
        console.warn('[DB] Could not set max_allowed_packet. Large uploads may fail.');
      }
    }

    app.listen(PORT, () => {
      console.log(`[SERVER] NearJob API running on port ${PORT}`);
      console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('[DB] Connection failed:', err.message);
    console.error('[DB] Ensure MySQL is running and database "nearjob" exists.');
  });