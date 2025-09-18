import Joi from 'joi';
import { logger } from '@utils/logging';

/**
 * Environment variable validation schema
 */
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  
  // Obsidian Configuration
  OBSIDIAN_VAULT_PATH: Joi.string().required(),
  
  // API Keys
  GOOGLE_MAPS_API_KEY: Joi.string().required(),
  YELLOW_PAGES_API_KEY: Joi.string().required(),
  FIRECRAWL_API_KEY: Joi.string().required(),
  PERPLEXITY_API_KEY: Joi.string().required(),
  ANTHROPIC_API_KEY: Joi.string().required(),
  
  // Optional integrations
  FRESHBOOKS_API_KEY: Joi.string().optional(),
  LINEAR_API_KEY: Joi.string().optional(),
  SENDGRID_API_KEY: Joi.string().optional(),
  VOICE_AI_API_KEY: Joi.string().optional(),
}).unknown();

/**
 * Validated environment configuration
 */
export interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  LOG_LEVEL: string;
  OBSIDIAN_VAULT_PATH: string;
  GOOGLE_MAPS_API_KEY: string;
  YELLOW_PAGES_API_KEY: string;
  FIRECRAWL_API_KEY: string;
  PERPLEXITY_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  FRESHBOOKS_API_KEY?: string;
  LINEAR_API_KEY?: string;
  SENDGRID_API_KEY?: string;
  VOICE_AI_API_KEY?: string;
}

/**
 * Validates and returns the environment configuration
 */
export async function validateEnvironment(): Promise<EnvironmentConfig> {
  const { error, value } = envSchema.validate(process.env);
  
  if (error) {
    logger.error('❌ Environment validation failed:', error.details);
    throw new Error(`Environment validation failed: ${error.message}`);
  }
  
  // Additional custom validations
  const config = value as EnvironmentConfig;
  
  // Check if Obsidian vault path exists
  const fs = await import('fs-extra');
  if (!await fs.pathExists(config.OBSIDIAN_VAULT_PATH)) {
    throw new Error(`Obsidian vault path does not exist: ${config.OBSIDIAN_VAULT_PATH}`);
  }
  
  logger.info('🔧 Environment configuration validated successfully');
  return config;
}

/**
 * Get environment configuration (assumes already validated)
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  return process.env as unknown as EnvironmentConfig;
}