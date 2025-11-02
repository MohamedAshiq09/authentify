import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Import configuration
import { config } from './config/environment.config';

// Import middleware
import { generalLimiter } from './middleware/ratelimit.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import sessionRoutes from './routes/session.routes';
import contractRoutes from './routes/contract.routes';
import sdkRoutes from './routes/sdk.routes';

// Import services
import { EventsService } from './services/contract/events.service';
import { SessionService } from './services/session/session.service';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Authentify Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/contract', contractRoutes);
app.use('/api/sdk', sdkRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = () => {
  console.log('Received shutdown signal, closing server gracefully...');
  
  // Stop contract event listener
  EventsService.stopEventListener();
  
  // Clean up any other resources here
  
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const PORT = config.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Authentify Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${config.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${config.FRONTEND_URL}`);
  
  // Start contract event listener in production
  if (config.NODE_ENV === 'production') {
    console.log('🔗 Starting contract event listener...');
    EventsService.startEventListener();
  }
  
  // Schedule cleanup of expired sessions (every hour)
  setInterval(async () => {
    try {
      const result = await SessionService.cleanupExpiredSessions();
      if (result.deletedCount > 0) {
        console.log(`🧹 Cleaned up ${result.deletedCount} expired sessions`);
      }
    } catch (error) {
      console.error('Failed to cleanup expired sessions:', error);
    }
  }, 60 * 60 * 1000); // 1 hour
});

export default app;