import winston from 'winston';
import path from 'path';

/**
 * Custom log format with timestamp and colorization
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta)}`;
    }
    
    if (stack) {
      logMessage += `\nStack trace: ${stack}`;
    }
    
    return logMessage;
  })
);

/**
 * Console format with colors for development
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `${timestamp} ${level}: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    if (stack) {
      logMessage += `\n${stack}`;
    }
    
    return logMessage;
  })
);

/**
 * Create logger instance
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'agentic-sales-team' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'system', 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
    
    // File transport for combined logs
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'system', 'combined.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
  ],
});

/**
 * Agent-specific logger factory
 */
export function createAgentLogger(agentName: string): winston.Logger {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'agentic-sales-team', agent: agentName },
    transports: [
      new winston.transports.Console({
        format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
      }),
      new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'agents', `${agentName}.log`),
        maxsize: 5 * 1024 * 1024, // 5MB
        maxFiles: 3,
      }),
    ],
  });
}

/**
 * Integration-specific logger factory
 */
export function createIntegrationLogger(integrationName: string): winston.Logger {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'agentic-sales-team', integration: integrationName },
    transports: [
      new winston.transports.Console({
        format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
      }),
      new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'integrations', `${integrationName}.log`),
        maxsize: 5 * 1024 * 1024, // 5MB
        maxFiles: 3,
      }),
    ],
  });
}

/**
 * Logger class for consistent usage across the application
 */
export class Logger {
  private logger: winston.Logger;

  constructor(name: string, type: 'agent' | 'integration' | 'general' = 'general') {
    switch (type) {
      case 'agent':
        this.logger = createAgentLogger(name);
        break;
      case 'integration':
        this.logger = createIntegrationLogger(name);
        break;
      default:
        this.logger = winston.createLogger({
          level: process.env.LOG_LEVEL || 'info',
          format: logFormat,
          defaultMeta: { service: 'agentic-sales-team', component: name },
          transports: [
            new winston.transports.Console({
              format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
            }),
            new winston.transports.File({
              filename: path.join(process.cwd(), 'logs', 'system', 'combined.log'),
              maxsize: 10 * 1024 * 1024, // 10MB
              maxFiles: 5,
            }),
          ],
        });
    }
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }
}