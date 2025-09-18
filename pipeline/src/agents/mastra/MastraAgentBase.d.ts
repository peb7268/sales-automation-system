import { Agent, Tool } from '@mastra/core';
import { Logger } from '../../utils/logging';
import { EventEmitter } from 'events';
export declare enum AgentExecutionMode {
    FOREGROUND = "foreground",
    BACKGROUND = "background",
    HYBRID = "hybrid"
}
export declare enum AgentCategory {
    PROSPECTING = "prospecting",
    COMMUNICATION = "communication",
    ANALYSIS = "analysis",
    ORGANIZATION = "organization",
    MONITORING = "monitoring",
    ORCHESTRATION = "orchestration",
    UTILITY = "utility"
}
export declare enum AgentPriority {
    CRITICAL = 1,
    HIGH = 2,
    NORMAL = 3,
    LOW = 4,
    BACKGROUND = 5
}
export interface ExecutionContext {
    mode: AgentExecutionMode;
    priority: AgentPriority;
    timeout?: number;
    maxRetries?: number;
    resourceLimits?: {
        maxMemory?: number;
        maxCpu?: number;
        maxConcurrency?: number;
    };
    metadata?: Record<string, any>;
}
export interface MastraAgentBaseConfig {
    name: string;
    instructions: string;
    model?: any;
    temperature?: number;
    maxTokens?: number;
    category: AgentCategory;
    executionMode: AgentExecutionMode;
    priority?: AgentPriority;
    capabilities?: string[];
    persistentState?: {
        enabled: boolean;
        statePath?: string;
        autoSave?: boolean;
        saveInterval?: number;
    };
    background?: {
        enabled: boolean;
        maxConcurrency?: number;
        timeout?: number;
    };
    communication?: {
        enabled: boolean;
        channels?: string[];
        messageTimeout?: number;
        maxQueueSize?: number;
    };
}
export interface AgentState {
    id: string;
    agentName: string;
    timestamp: Date;
    executionCount: number;
    category: AgentCategory;
    currentMode: AgentExecutionMode;
    priority: AgentPriority;
    capabilities: string[];
    lastExecution?: {
        input: any;
        output: any;
        duration: number;
        success: boolean;
        mode: AgentExecutionMode;
    };
    context: Record<string, any>;
    metrics: {
        totalExecutions: number;
        successfulExecutions: number;
        avgExecutionTime: number;
        errorRate: number;
        modeUsageStats: {
            [AgentExecutionMode.FOREGROUND]: number;
            [AgentExecutionMode.BACKGROUND]: number;
            [AgentExecutionMode.HYBRID]: number;
        };
    };
}
export interface AgentMessage {
    id: string;
    from: string;
    to: string;
    channel: string;
    type: 'request' | 'response' | 'event' | 'broadcast';
    payload: any;
    timestamp: Date;
    correlationId?: string;
    replyTo?: string;
    timeout?: number;
}
export interface CommunicationEvent {
    type: 'message_sent' | 'message_received' | 'channel_joined' | 'channel_left' | 'error';
    agentName: string;
    channel?: string;
    message?: AgentMessage;
    error?: Error;
    timestamp: Date;
}
export interface MessageHandler {
    (message: AgentMessage): Promise<any>;
}
export interface CommunicationManager {
    subscribe(channel: string, handler: MessageHandler): Promise<void>;
    unsubscribe(channel: string, handler?: MessageHandler): Promise<void>;
    publish(channel: string, payload: any, type?: AgentMessage['type']): Promise<void>;
    sendMessage(to: string, payload: any, options?: {
        channel?: string;
        timeout?: number;
        correlationId?: string;
    }): Promise<AgentMessage>;
    broadcast(payload: any, channels?: string[]): Promise<void>;
    getActiveChannels(): string[];
    getMessageQueue(): AgentMessage[];
    clearMessageQueue(): void;
}
export declare abstract class MastraAgentBase {
    protected agent: Agent;
    protected logger: Logger;
    protected config: MastraAgentBaseConfig;
    protected state: AgentState;
    private stateFilePath?;
    private autoSaveInterval?;
    protected eventEmitter: EventEmitter;
    protected communicationManager: CommunicationManager;
    protected messageHandlers: Map<string, Set<MessageHandler>>;
    protected messageQueue: AgentMessage[];
    protected activeChannels: Set<string>;
    protected currentExecutionMode: AgentExecutionMode;
    protected executionContext: ExecutionContext;
    protected backgroundTaskQueue: any[];
    protected isExecuting: boolean;
    constructor(config: MastraAgentBaseConfig);
    abstract getTools(): Tool[];
    execute(input: string, context?: Record<string, any>): Promise<any>;
    executeWithData(data: Record<string, any>, prompt?: string): Promise<any>;
    protected generateContextualPrompt(data: Record<string, any>): string;
    getStatus(): {
        name: string;
        initialized: boolean;
        toolCount: number;
        model: string;
        category: AgentCategory;
        executionMode: AgentExecutionMode;
        currentMode: AgentExecutionMode;
        priority: AgentPriority;
        isExecuting: boolean;
        capabilities: string[];
        backgroundQueueSize: number;
        canSwitchModes: boolean;
    };
    updateInstructions(newInstructions: string): void;
    protected validateRequiredContext(context: Record<string, any>, requiredKeys: string[]): void;
    protected logExecutionResult(result: any, operation: string): void;
    private sanitizeForLogging;
    private initializeState;
    private loadState;
    private saveState;
    private setupAutoSave;
    private updateExecutionContext;
    private updateExecutionState;
    getState(): AgentState;
    getMetrics(): {
        uptime: number;
        lastExecution: number;
        contextSize: number;
        totalExecutions: number;
        successfulExecutions: number;
        avgExecutionTime: number;
        errorRate: number;
        modeUsageStats: {
            [AgentExecutionMode.FOREGROUND]: number;
            [AgentExecutionMode.BACKGROUND]: number;
            [AgentExecutionMode.HYBRID]: number;
        };
    };
    resetState(): Promise<void>;
    private initializeCommunication;
    private subscribe;
    private unsubscribe;
    private publish;
    private sendMessage;
    private broadcast;
    private handleIncomingMessage;
    private handleCommunicationError;
    getCommunicationManager(): CommunicationManager;
    getEventEmitter(): EventEmitter;
    addMessageHandler(channel: string, handler: MessageHandler): void;
    removeMessageHandler(channel: string, handler?: MessageHandler): void;
    sendToAgent(targetAgent: string, payload: any, channel?: string): Promise<AgentMessage>;
    broadcastMessage(payload: any, channels?: string[]): Promise<void>;
    getCommunicationStats(): {
        activeChannels: string[];
        messageQueueSize: number;
        totalHandlers: number;
        isEnabled: boolean;
    };
    switchExecutionMode(newMode: AgentExecutionMode, context?: Partial<ExecutionContext>): Promise<void>;
    executeWithMode(input: string, mode: AgentExecutionMode, context?: Record<string, any>): Promise<any>;
    private executeForeground;
    private executeBackground;
    private executeHybrid;
    private shouldUseBackgroundMode;
    private processBackgroundQueue;
    private executeBackgroundTask;
    getCategory(): AgentCategory;
    getCurrentExecutionMode(): AgentExecutionMode;
    getExecutionContext(): ExecutionContext;
    canSwitchToMode(mode: AgentExecutionMode): boolean;
    getCapabilities(): string[];
    addCapability(capability: string): void;
    removeCapability(capability: string): void;
    getCategorizationInfo(): {
        name: string;
        category: AgentCategory;
        executionMode: AgentExecutionMode;
        currentMode: AgentExecutionMode;
        priority: AgentPriority;
        capabilities: string[];
        canSwitchModes: boolean;
        isExecuting: boolean;
        backgroundQueueSize: number;
        modeUsageStats: {
            foreground: number;
            background: number;
            hybrid: number;
        };
    };
    setPriority(priority: AgentPriority): void;
    clearBackgroundQueue(): void;
    destroy(): Promise<void>;
}
//# sourceMappingURL=MastraAgentBase.d.ts.map