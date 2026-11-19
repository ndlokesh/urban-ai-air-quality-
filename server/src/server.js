import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import aqiRouter from './routes/aqi.js';
import planRouter from './routes/plan.js';
import chatRouter from './routes/chat.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware: Helmet with customized CSP for Vite/React and icons
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for local dev/Vite inline styles & data SVGs
  crossOriginEmbedderPolicy: false
}));

// Efficiency Middleware: Gzip/Deflate compression for fast payload delivery
app.use(compression());

// Security Middleware: CORS policy
app.use(cors({
  origin: '*', // Allows local dev & preview origins
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser with size limits to prevent payload exhaustion attacks
app.use(express.json({ limit: '250kb' }));

// Security Middleware: Rate limiting on public endpoints to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 40, // Limit AI plan/chat requests to 40 per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI request rate limit reached. Please wait a moment before trying again.' }
});

app.use('/api', apiLimiter);
app.use('/api/plan', aiLimiter);
app.use('/api/chat', aiLimiter);

// API Routes
app.use('/api/aqi', aqiRouter);
app.use('/api/plan', planRouter);
app.use('/api/chat', chatRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CleanBreath API',
    security: {
      helmet: true,
      rateLimit: true,
      compression: true
    },
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here')
  });
});

// Serve static frontend build if present
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('CleanBreath API is running. Start the client with "npm run dev --prefix client".');
    }
  });
});

app.listen(PORT, () => {
  console.log(`🌿 CleanBreath backend running at http://localhost:${PORT}`);
  console.log(`🔒 Security headers, rate limiting, and compression active`);
});

export default app;
