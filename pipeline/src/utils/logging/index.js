"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.logger = void 0;
exports.createAgentLogger = createAgentLogger;
exports.createIntegrationLogger = createIntegrationLogger;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json(), winston_1.default.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(meta).length > 0) {
        logMessage += ` ${JSON.stringify(meta)}`;
    }
    if (stack) {
        logMessage += `\nStack trace: ${stack}`;
    }
    return logMessage;
}));
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({ format: 'HH:mm:ss' }), winston_1.default.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `${timestamp} ${level}: ${message}`;
    if (Object.keys(meta).length > 0) {
        logMessage += ` ${JSON.stringify(meta, null, 2)}`;
    }
    if (stack) {
        logMessage += `\n${stack}`;
    }
    return logMessage;
}));
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'agentic-sales-team' },
    transports: [
        new winston_1.default.transports.Console({
            format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(process.cwd(), 'logs', 'system', 'error.log'),
            level: 'error',
            maxsize: 10 * 1024 * 1024,
            maxFiles: 5,
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(process.cwd(), 'logs', 'system', 'combined.log'),
            maxsize: 10 * 1024 * 1024,
            maxFiles: 5,
        }),
    ],
});
function createAgentLogger(agentName) {
    return winston_1.default.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: logFormat,
        defaultMeta: { service: 'agentic-sales-team', agent: agentName },
        transports: [
            new winston_1.default.transports.Console({
                format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
            }),
            new winston_1.default.transports.File({
                filename: path_1.default.join(process.cwd(), 'logs', 'agents', `${agentName}.log`),
                maxsize: 5 * 1024 * 1024,
                maxFiles: 3,
            }),
        ],
    });
}
function createIntegrationLogger(integrationName) {
    return winston_1.default.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: logFormat,
        defaultMeta: { service: 'agentic-sales-team', integration: integrationName },
        transports: [
            new winston_1.default.transports.Console({
                format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
            }),
            new winston_1.default.transports.File({
                filename: path_1.default.join(process.cwd(), 'logs', 'integrations', `${integrationName}.log`),
                maxsize: 5 * 1024 * 1024,
                maxFiles: 3,
            }),
        ],
    });
}
class Logger {
    logger;
    constructor(name, type = 'general') {
        switch (type) {
            case 'agent':
                this.logger = createAgentLogger(name);
                break;
            case 'integration':
                this.logger = createIntegrationLogger(name);
                break;
            default:
                this.logger = winston_1.default.createLogger({
                    level: process.env.LOG_LEVEL || 'info',
                    format: logFormat,
                    defaultMeta: { service: 'agentic-sales-team', component: name },
                    transports: [
                        new winston_1.default.transports.Console({
                            format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
                        }),
                        new winston_1.default.transports.File({
                            filename: path_1.default.join(process.cwd(), 'logs', 'system', 'combined.log'),
                            maxsize: 10 * 1024 * 1024,
                            maxFiles: 5,
                        }),
                    ],
                });
        }
    }
    debug(message, meta) {
        this.logger.debug(message, meta);
    }
    info(message, meta) {
        this.logger.info(message, meta);
    }
    warn(message, meta) {
        this.logger.warn(message, meta);
    }
    error(message, meta) {
        this.logger.error(message, meta);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=index.js.map