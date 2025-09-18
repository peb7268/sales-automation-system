import winston from 'winston';
export declare const logger: winston.Logger;
export declare function createAgentLogger(agentName: string): winston.Logger;
export declare function createIntegrationLogger(integrationName: string): winston.Logger;
export declare class Logger {
    private logger;
    constructor(name: string, type?: 'agent' | 'integration' | 'general');
    debug(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
}
//# sourceMappingURL=index.d.ts.map