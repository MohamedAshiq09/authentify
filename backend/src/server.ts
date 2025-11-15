import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Import configuration
import { config } from './config/environment.config';
import { initializePolkadotAPI, closeAPI } from './config/contract.config';

// Import middleware
import { generalLimiter } from './middleware/ratelimit.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import sessionRoutes from './routes/session.routes';
import contractRoutes from './routes/contract.routes';
import sdkRoutes from './routes/sdk.routes';
import sdkClientRoutes from './routes/sdk-client.routes';
import biometricRoutes from './routes/biometric.routes';

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
app.use('/api/biometric', biometricRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/contract', contractRoutes);
app.use('/api/sdk', sdkRoutes);
app.use('/api/sdk-client', sdkClientRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = async () => {
  console.log('Received shutdown signal, closing server gracefully...');
  
  // Stop contract event listener
  EventsService.stopEventListener();
  
  // Close Polkadot API connection
  await closeAPI();
  
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Initialize Polkadot and start server
async function startServer() {
  try {
    // Try to initialize Polkadot API (optional in development)
    console.log('🔗 Initializing Polkadot connection...');
    try {
      // Set a shorter timeout for the initialization
      const initTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Polkadot initialization timeout')), 15000);
      });
      
      await Promise.race([
        initializePolkadotAPI(),
        initTimeout
      ]);
      console.log('✅ Polkadot connection established');
    } catch (polkadotError) {
      console.warn('⚠️  Polkadot connection failed - continuing without blockchain features');
      console.warn('💡 To enable blockchain features, ensure Pop Network RPC is accessible');
      console.warn(`   Current endpoint: ${config.SUBSTRATE_WS_ENDPOINT}`);
      console.warn('   The backend will work with database-only authentication for now');
    }

    // Start server
    const PORT = config.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Authentify Backend running on port ${PORT}`);
      console.log(`📊 Environment: ${config.NODE_ENV}`);
      console.log(`🌐 Frontend URL: ${config.FRONTEND_URL}`);
      console.log(`🔗 Substrate endpoint: ${config.SUBSTRATE_WS_ENDPOINT}`);
      
      // Start contract event listener in production (only if connected)
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

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;