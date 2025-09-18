#!/usr/bin/env node

import dotenv from 'dotenv';
import path from 'path';
import { logger } from '@utils/logging';
import { validateEnvironment } from '@utils/config';
import { mastraOrchestrator } from '@orchestration/MastraOrchestrator';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * Main application entry point
 */
async function bootstrap(): Promise<void> {
  try {
    logger.info('🚀 Starting Automated Agentic Sales Team System');

    // Validate environment configuration
    await validateEnvironment();
    logger.info('✅ Environment validation passed');

    // Initialize the Mastra orchestrator
    await mastraOrchestrator.initialize();
    logger.info('✅ Mastra orchestrator initialized');

    // Start the sales automation system
    await mastraOrchestrator.start();
    logger.info('🎯 Mastra sales automation system is running');

    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      logger.info('📋 Received SIGINT, shutting down gracefully...');
      await mastraOrchestrator.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('📋 Received SIGTERM, shutting down gracefully...');
      await mastraOrchestrator.stop();
      process.exit(0);
    });

  } catch (error) {
    logger.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

// Start the application
if (require.main === module) {
  bootstrap().catch((error) => {
    logger.error('💥 Unhandled error during bootstrap:', error);
    process.exit(1);
  });
}

export { bootstrap };