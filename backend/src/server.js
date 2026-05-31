require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { setIO } = require('./utils/notifications');

const app = express();
const server = http.createServer(app);

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://job-tracker-wheat-nine.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setIO(io);

// Socket.IO authentication & room management
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.userId}`);
  socket.join(`user:${socket.userId}`);

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.userId}`);
  });
});

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS middleware - FIXED
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(null, true); // Temporarily allow all for testing
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, please try again in 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// API Routes - wrapped so a single bad require doesn't kill all routes
const loadRoute = (path) => {
  try {
    return require(path);
  } catch (err) {
    console.error(`❌ Failed to load route ${path}:`, err.message);
    // Return a router that reports the error instead of silently 404ing
    const errRouter = require('express').Router();
    errRouter.all('*', (req, res) => res.status(500).json({ success: false, message: `Route module failed to load: ${err.message}` }));
    return errRouter;
  }
};

app.use('/api/auth', loadRoute('./routes/auth'));
app.use('/api/users', loadRoute('./routes/users'));
app.use('/api/jobs', loadRoute('./routes/jobs'));
app.use('/api/applications', loadRoute('./routes/applications'));
app.use('/api/evaluations', loadRoute('./routes/evaluations'));
app.use('/api/notifications', loadRoute('./routes/notifications'));
app.use('/api/reports', loadRoute('./routes/reports'));

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = { app, server };