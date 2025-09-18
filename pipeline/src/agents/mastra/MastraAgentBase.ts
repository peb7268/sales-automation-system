import { Agent, Tool } from '@mastra/core';
import { anthropic } from '@ai-sdk/anthropic';
import { Logger } from '../../utils/logging';
import { EventEmitter } from 'events';

/**
 * Agent execution modes
 */
export enum AgentExecutionMode {
  FOREGROUND = 'foreground',    // Blocks until completion
  BACKGROUND = 'background',    // Non-blocking execution
  HYBRID = 'hybrid'            // Can switch between modes
}

/**
 * Agent categories based on their primary function
 */
export enum AgentCategory {
  PROSPECTING = 'prospecting',     // Business research and lead generation
  COMMUNICATION = 'communication', // Email, calls, messaging
  ANALYSIS = 'analysis',           // Data analysis and insights
  ORGANIZATION = 'organization',   // File management and organization
  MONITORING = 'monitoring',       // System and process monitoring
  ORCHESTRATION = 'orchestration', // Agent coordination and workflow
  UTILITY = 'utility'             // General utility functions
}

/**
 * Agent priority levels for execution scheduling
 */
export enum AgentPriority {
  CRITICAL = 1,    // Must execute immediately
  HIGH = 2,        // Execute as soon as possible
  NORMAL = 3,      // Standard execution priority
  LOW = 4,         // Execute when resources are available
  BACKGROUND = 5   // Execute during idle periods
}

/**
 * Execution context information
 */
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
  // Agent categorization
  category: AgentCategory;
  executionMode: AgentExecutionMode;
  priority?: AgentPriority;
  capabilities?: string[];
  // New state management options
  persistentState?: {
    enabled: boolean;
    statePath?: string;
    autoSave?: boolean;
    saveInterval?: number;
  };
  // Background execution options
  background?: {
    enabled: boolean;
    maxConcurrency?: number;
    timeout?: number;
  };
  // Communication options
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
  // Execution context and categorization
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

/**
 * Message interface for inter-agent communication
 */
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

/**
 * Communication event interface
 */
export interface CommunicationEvent {
  type: 'message_sent' | 'message_received' | 'channel_joined' | 'channel_left' | 'error';
  agentName: string;
  channel?: string;
  message?: AgentMessage;
  error?: Error;
  timestamp: Date;
}

/**
 * Message handler callback interface
 */
export interface MessageHandler {
  (message: AgentMessage): Promise<any>;
}

/**
 * Communication manager interface for agent messaging
 */
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

/**
 * Base class for all MHM Mastra agents
 * Provides common functionality and standardized agent creation
 */
export abstract class MastraAgentBase {
  protected agent: Agent;
  protected logger: Logger;
  protected config: MastraAgentBaseConfig;
  
  // State management properties
  protected state: AgentState;
  private stateFilePath?: string;
  private autoSaveInterval?: NodeJS.Timeout;
  
  // Communication properties
  protected eventEmitter: EventEmitter;
  protected communicationManager: CommunicationManager;
  protected messageHandlers: Map<string, Set<MessageHandler>>;
  protected messageQueue: AgentMessage[];
  protected activeChannels: Set<string>;
  
  // Execution context and categorization properties
  protected currentExecutionMode: AgentExecutionMode;
  protected executionContext: ExecutionContext;
  protected backgroundTaskQueue: any[];
  protected isExecuting: boolean;

  constructor(config: MastraAgentBaseConfig) {
    this.config = config;
    this.logger = new Logger(config.name, 'agent');
    
    // Initialize execution context and categorization
    this.currentExecutionMode = config.executionMode;
    this.backgroundTaskQueue = [];
    this.isExecuting = false;
    this.executionContext = {
      mode: config.executionMode,
      priority: config.priority || AgentPriority.NORMAL,
      timeout: config.background?.timeout,
      maxRetries: 3,
      resourceLimits: {
        maxConcurrency: config.background?.maxConcurrency || 1
      }
    };

    // Initialize communication system
    this.eventEmitter = new EventEmitter();
    this.messageHandlers = new Map();
    this.messageQueue = [];
    this.activeChannels = new Set();
    this.initializeCommunication();
    
    // Initialize state management
    this.initializeState();
    
    // Initialize agent with Mastra framework
    const agentConfig = {
      name: config.name,
      instructions: config.instructions,
      model: config.model || anthropic('claude-3-5-sonnet-20241022', {
        temperature: config.temperature || 0.2,
        maxTokens: config.maxTokens || 4000
      }),
      tools: this.getTools()
    };

    this.agent = new Agent(agentConfig);
    
    // Load persisted state if enabled
    if (this.config.persistentState?.enabled) {
      this.loadState();
      this.setupAutoSave();
    }
    
    this.logger.info(`Initialized Mastra agent: ${config.name}`, {
      category: this.config.category,
      executionMode: this.config.executionMode,
      priority: AgentPriority[this.executionContext.priority],
      capabilities: this.config.capabilities?.length || 0,
      persistentState: !!this.config.persistentState?.enabled,
      backgroundEnabled: !!this.config.background?.enabled,
      communicationEnabled: !!this.config.communication?.enabled,
      channels: this.config.communication?.channels?.length || 0
    });
  }

  /**
   * Abstract method to define agent-specific tools
   */
  abstract getTools(): Tool[];

  /**
   * Execute the agent with provided input
   */
  async execute(input: string, context?: Record<string, any>): Promise<any> {
    const startTime = Date.now();
    let success = false;
    let result: any = null;
    
    try {
      this.logger.info(`Executing agent with input`, { inputLength: input.length });
      
      // Update execution context
      this.updateExecutionContext(context);
      
      // Note: Actual Mastra agent execution would be implemented here
      // For now, return a mock response structure
      result = {
        content: `Processed: ${input}`,
        context: context,
        timestamp: new Date()
      };
      
      success = true;
      this.logger.info(`Agent execution completed`, { 
        resultType: typeof result,
        hasContent: !!result
      });

      return result;
    } catch (error: any) {
      this.logger.error(`Agent execution failed`, { error: error.message });
      throw error;
    } finally {
      // Update state with execution results
      const duration = Date.now() - startTime;
      this.updateExecutionState(input, result, duration, success);
      
      // Auto-save state if enabled
      if (this.config.persistentState?.autoSave) {
        await this.saveState();
      }
    }
  }

  /**
   * Execute the agent with structured data
   */
  async executeWithData(data: Record<string, any>, prompt?: string): Promise<any> {
    try {
      const contextualPrompt = prompt || this.generateContextualPrompt(data);
      
      this.logger.info(`Executing agent with structured data`, { 
        dataKeys: Object.keys(data),
        hasPrompt: !!prompt
      });

      return await this.execute(contextualPrompt, data);
    } catch (error: any) {
      this.logger.error(`Agent execution with data failed`, { error: error.message });
      throw error;
    }
  }

  /**
   * Generate a contextual prompt from structured data
   */
  protected generateContextualPrompt(data: Record<string, any>): string {
    const dataString = Object.entries(data)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n');
    
    return `Please process the following data according to your instructions:\n\n${dataString}`;
  }

  /**
   * Get agent configuration and status
   */
  getStatus() {
    return {
      name: this.config.name,
      initialized: !!this.agent,
      toolCount: this.getTools().length,
      model: 'claude-3-5-sonnet-20241022',
      // Categorization information
      category: this.config.category,
      executionMode: this.config.executionMode,
      currentMode: this.currentExecutionMode,
      priority: this.executionContext.priority,
      isExecuting: this.isExecuting,
      capabilities: this.state.capabilities,
      backgroundQueueSize: this.backgroundTaskQueue.length,
      canSwitchModes: this.config.executionMode === AgentExecutionMode.HYBRID
    };
  }

  /**
   * Update agent instructions dynamically
   */
  updateInstructions(newInstructions: string): void {
    this.config.instructions = newInstructions;
    // Note: Mastra agents may need to be recreated to update instructions
    // This would depend on the specific Mastra API capabilities
    this.logger.info(`Instructions updated for agent: ${this.config.name}`);
  }

  /**
   * Helper method to validate required context data
   */
  protected validateRequiredContext(context: Record<string, any>, requiredKeys: string[]): void {
    const missingKeys = requiredKeys.filter(key => !(key in context));
    if (missingKeys.length > 0) {
      throw new Error(`Missing required context keys: ${missingKeys.join(', ')}`);
    }
  }

  /**
   * Helper method to sanitize and log execution results
   */
  protected logExecutionResult(result: any, operation: string): void {
    // Remove sensitive data before logging
    const sanitizedResult = this.sanitizeForLogging(result);
    this.logger.info(`${operation} completed`, { result: sanitizedResult });
  }

  /**
   * Remove sensitive information from objects before logging
   */
  private sanitizeForLogging(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const sanitized = { ...obj };
    const sensitiveKeys = ['email', 'phone', 'password', 'token', 'key', 'secret'];
    
    for (const key in sanitized) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeForLogging(sanitized[key]);
      }
    }

    return sanitized;
  }

  // ===== STATE MANAGEMENT METHODS =====

  /**
   * Initialize agent state with default values
   */
  private initializeState(): void {
    this.state = {
      id: `${this.config.name}-${Date.now()}`,
      agentName: this.config.name,
      timestamp: new Date(),
      executionCount: 0,
      // Agent categorization
      category: this.config.category,
      currentMode: this.currentExecutionMode,
      priority: this.config.priority || AgentPriority.NORMAL,
      capabilities: this.config.capabilities || [],
      context: {},
      metrics: {
        totalExecutions: 0,
        successfulExecutions: 0,
        avgExecutionTime: 0,
        errorRate: 0,
        modeUsageStats: {
          [AgentExecutionMode.FOREGROUND]: 0,
          [AgentExecutionMode.BACKGROUND]: 0,
          [AgentExecutionMode.HYBRID]: 0
        }
      }
    };

    // Set up state file path if persistent state is enabled
    if (this.config.persistentState?.enabled) {
      const statePath = this.config.persistentState.statePath || './.mastra/state';
      this.stateFilePath = `${statePath}/${this.config.name}-state.json`;
      
      // Ensure state directory exists
      const fs = require('fs');
      const path = require('path');
      const stateDir = path.dirname(this.stateFilePath);
      if (!fs.existsSync(stateDir)) {
        fs.mkdirSync(stateDir, { recursive: true });
      }
    }
  }

  /**
   * Load persisted state from file
   */
  private async loadState(): Promise<void> {
    if (!this.stateFilePath) return;

    try {
      const fs = require('fs').promises;
      const stateData = await fs.readFile(this.stateFilePath, 'utf8');
      const savedState = JSON.parse(stateData);
      
      // Merge saved state with current state, preserving essential fields
      this.state = {
        ...this.state,
        ...savedState,
        timestamp: new Date(savedState.timestamp),
        lastExecution: savedState.lastExecution ? {
          ...savedState.lastExecution,
          timestamp: new Date(savedState.lastExecution.timestamp)
        } : undefined
      };
      
      this.logger.info(`Loaded persisted state`, {
        executionCount: this.state.executionCount,
        totalExecutions: this.state.metrics.totalExecutions
      });
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        this.logger.warn(`Failed to load persisted state: ${error.message}`);
      }
      // If file doesn't exist or is corrupted, continue with default state
    }
  }

  /**
   * Save current state to file
   */
  private async saveState(): Promise<void> {
    if (!this.stateFilePath) return;

    try {
      const fs = require('fs').promises;
      const stateData = JSON.stringify(this.state, null, 2);
      await fs.writeFile(this.stateFilePath, stateData, 'utf8');
      
      this.logger.debug(`State saved to ${this.stateFilePath}`);
    } catch (error: any) {
      this.logger.error(`Failed to save state: ${error.message}`);
    }
  }

  /**
   * Setup auto-save interval
   */
  private setupAutoSave(): void {
    const saveInterval = this.config.persistentState?.saveInterval || 30000; // 30 seconds default
    
    this.autoSaveInterval = setInterval(async () => {
      await this.saveState();
    }, saveInterval);

    this.logger.debug(`Auto-save enabled with ${saveInterval}ms interval`);
  }

  /**
   * Update execution context
   */
  private updateExecutionContext(context?: Record<string, any>): void {
    if (context) {
      this.state.context = { ...this.state.context, ...context };
    }
  }

  /**
   * Update state after execution
   */
  private updateExecutionState(input: any, result: any, duration: number, success: boolean): void {
    this.state.executionCount++;
    this.state.timestamp = new Date();
    
    // Update last execution
    this.state.lastExecution = {
      input: this.sanitizeForLogging(input),
      output: this.sanitizeForLogging(result),
      duration,
      success,
      mode: this.currentExecutionMode
    };
    
    // Update metrics
    this.state.metrics.totalExecutions++;
    if (success) {
      this.state.metrics.successfulExecutions++;
    }
    
    // Calculate average execution time
    const totalTime = (this.state.metrics.avgExecutionTime * (this.state.metrics.totalExecutions - 1)) + duration;
    this.state.metrics.avgExecutionTime = Math.round(totalTime / this.state.metrics.totalExecutions);
    
    // Calculate error rate
    this.state.metrics.errorRate = ((this.state.metrics.totalExecutions - this.state.metrics.successfulExecutions) / this.state.metrics.totalExecutions) * 100;
  }

  /**
   * Get current agent state
   */
  public getState(): AgentState {
    return { ...this.state };
  }

  /**
   * Get agent metrics
   */
  public getMetrics() {
    return {
      ...this.state.metrics,
      uptime: Date.now() - new Date(this.state.timestamp).getTime(),
      lastExecution: this.state.lastExecution?.duration,
      contextSize: Object.keys(this.state.context).length
    };
  }

  /**
   * Reset agent state (useful for testing)
   */
  public async resetState(): Promise<void> {
    this.initializeState();
    if (this.config.persistentState?.enabled) {
      await this.saveState();
    }
    this.logger.info(`Agent state reset`);
  }

  // ===== COMMUNICATION METHODS =====

  /**
   * Initialize communication system
   */
  private initializeCommunication(): void {
    this.communicationManager = {
      subscribe: this.subscribe.bind(this),
      unsubscribe: this.unsubscribe.bind(this),
      publish: this.publish.bind(this),
      sendMessage: this.sendMessage.bind(this),
      broadcast: this.broadcast.bind(this),
      getActiveChannels: () => Array.from(this.activeChannels),
      getMessageQueue: () => [...this.messageQueue],
      clearMessageQueue: () => { this.messageQueue = []; }
    };

    // Set up default event listeners
    this.eventEmitter.on('message', this.handleIncomingMessage.bind(this));
    this.eventEmitter.on('error', this.handleCommunicationError.bind(this));

    // Join default channels if configured
    if (this.config.communication?.channels) {
      this.config.communication.channels.forEach(channel => {
        this.activeChannels.add(channel);
      });
    }

    this.logger.debug(`Communication system initialized`, {
      channels: Array.from(this.activeChannels),
      maxQueueSize: this.config.communication?.maxQueueSize || 100
    });
  }

  /**
   * Subscribe to a communication channel
   */
  private async subscribe(channel: string, handler: MessageHandler): Promise<void> {
    if (!this.messageHandlers.has(channel)) {
      this.messageHandlers.set(channel, new Set());
    }
    
    this.messageHandlers.get(channel)!.add(handler);
    this.activeChannels.add(channel);
    
    this.eventEmitter.emit('communication_event', {
      type: 'channel_joined',
      agentName: this.config.name,
      channel,
      timestamp: new Date()
    } as CommunicationEvent);
    
    this.logger.debug(`Subscribed to channel: ${channel}`);
  }

  /**
   * Unsubscribe from a communication channel
   */
  private async unsubscribe(channel: string, handler?: MessageHandler): Promise<void> {
    if (handler && this.messageHandlers.has(channel)) {
      this.messageHandlers.get(channel)!.delete(handler);
      
      // Remove channel if no handlers left
      if (this.messageHandlers.get(channel)!.size === 0) {
        this.messageHandlers.delete(channel);
        this.activeChannels.delete(channel);
      }
    } else {
      // Remove all handlers for channel
      this.messageHandlers.delete(channel);
      this.activeChannels.delete(channel);
    }
    
    this.eventEmitter.emit('communication_event', {
      type: 'channel_left',
      agentName: this.config.name,
      channel,
      timestamp: new Date()
    } as CommunicationEvent);
    
    this.logger.debug(`Unsubscribed from channel: ${channel}`);
  }

  /**
   * Publish a message to a channel
   */
  private async publish(channel: string, payload: any, type: AgentMessage['type'] = 'event'): Promise<void> {
    const message: AgentMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from: this.config.name,
      to: 'broadcast',
      channel,
      type,
      payload,
      timestamp: new Date()
    };

    // Add to message queue with size limit
    const maxQueueSize = this.config.communication?.maxQueueSize || 100;
    if (this.messageQueue.length >= maxQueueSize) {
      this.messageQueue.shift(); // Remove oldest message
    }
    this.messageQueue.push(message);

    // Emit to event system (in production, this would be sent to message broker)
    this.eventEmitter.emit('message_published', message);
    
    this.eventEmitter.emit('communication_event', {
      type: 'message_sent',
      agentName: this.config.name,
      channel,
      message,
      timestamp: new Date()
    } as CommunicationEvent);

    this.logger.debug(`Published message to channel: ${channel}`, { 
      messageId: message.id,
      type,
      payloadSize: JSON.stringify(payload).length
    });
  }

  /**
   * Send a direct message to another agent
   */
  private async sendMessage(to: string, payload: any, options?: {
    channel?: string;
    timeout?: number;
    correlationId?: string;
  }): Promise<AgentMessage> {
    const message: AgentMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from: this.config.name,
      to,
      channel: options?.channel || 'direct',
      type: 'request',
      payload,
      timestamp: new Date(),
      correlationId: options?.correlationId,
      timeout: options?.timeout || this.config.communication?.messageTimeout || 30000
    };

    // Add to message queue
    const maxQueueSize = this.config.communication?.maxQueueSize || 100;
    if (this.messageQueue.length >= maxQueueSize) {
      this.messageQueue.shift();
    }
    this.messageQueue.push(message);

    // Emit message (in production, this would route through message broker)
    this.eventEmitter.emit('direct_message', message);
    
    this.eventEmitter.emit('communication_event', {
      type: 'message_sent',
      agentName: this.config.name,
      channel: message.channel,
      message,
      timestamp: new Date()
    } as CommunicationEvent);

    this.logger.debug(`Sent message to agent: ${to}`, { 
      messageId: message.id,
      channel: message.channel,
      timeout: message.timeout
    });

    return message;
  }

  /**
   * Broadcast a message to multiple channels
   */
  private async broadcast(payload: any, channels?: string[]): Promise<void> {
    const targetChannels = channels || Array.from(this.activeChannels);
    
    for (const channel of targetChannels) {
      await this.publish(channel, payload, 'broadcast');
    }

    this.logger.debug(`Broadcast message to ${targetChannels.length} channels`, {
      channels: targetChannels,
      payloadSize: JSON.stringify(payload).length
    });
  }

  /**
   * Handle incoming messages
   */
  private async handleIncomingMessage(message: AgentMessage): Promise<void> {
    try {
      // Check if message is addressed to this agent or broadcast
      if (message.to !== this.config.name && message.to !== 'broadcast') {
        return;
      }

      const handlers = this.messageHandlers.get(message.channel);
      if (!handlers || handlers.size === 0) {
        this.logger.debug(`No handlers for channel: ${message.channel}`);
        return;
      }

      // Execute all handlers for this channel
      const results = await Promise.allSettled(
        Array.from(handlers).map(handler => handler(message))
      );

      // Log any handler failures
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          this.logger.warn(`Message handler ${index} failed`, {
            messageId: message.id,
            error: result.reason?.message
          });
        }
      });

      this.eventEmitter.emit('communication_event', {
        type: 'message_received',
        agentName: this.config.name,
        channel: message.channel,
        message,
        timestamp: new Date()
      } as CommunicationEvent);

    } catch (error: any) {
      this.logger.error(`Error handling incoming message`, {
        messageId: message.id,
        error: error.message
      });
      
      this.eventEmitter.emit('communication_event', {
        type: 'error',
        agentName: this.config.name,
        channel: message.channel,
        error,
        timestamp: new Date()
      } as CommunicationEvent);
    }
  }

  /**
   * Handle communication errors
   */
  private handleCommunicationError(error: Error): void {
    this.logger.error(`Communication system error`, { error: error.message });
    
    this.eventEmitter.emit('communication_event', {
      type: 'error',
      agentName: this.config.name,
      error,
      timestamp: new Date()
    } as CommunicationEvent);
  }

  /**
   * Get communication manager for external access
   */
  public getCommunicationManager(): CommunicationManager {
    return this.communicationManager;
  }

  /**
   * Get event emitter for external event handling
   */
  public getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }

  /**
   * Add a message handler for a specific channel
   */
  public addMessageHandler(channel: string, handler: MessageHandler): void {
    this.communicationManager.subscribe(channel, handler);
  }

  /**
   * Remove a message handler from a channel
   */
  public removeMessageHandler(channel: string, handler?: MessageHandler): void {
    this.communicationManager.unsubscribe(channel, handler);
  }

  /**
   * Send a message to another agent
   */
  public async sendToAgent(targetAgent: string, payload: any, channel?: string): Promise<AgentMessage> {
    return this.communicationManager.sendMessage(targetAgent, payload, { channel });
  }

  /**
   * Broadcast a message to all subscribed channels
   */
  public async broadcastMessage(payload: any, channels?: string[]): Promise<void> {
    return this.communicationManager.broadcast(payload, channels);
  }

  /**
   * Get communication statistics
   */
  public getCommunicationStats() {
    return {
      activeChannels: Array.from(this.activeChannels),
      messageQueueSize: this.messageQueue.length,
      totalHandlers: Array.from(this.messageHandlers.values())
        .reduce((sum, handlers) => sum + handlers.size, 0),
      isEnabled: !!this.config.communication?.enabled
    };
  }

  // ===== EXECUTION MODE AND CATEGORIZATION METHODS =====

  /**
   * Switch agent execution mode dynamically
   */
  public async switchExecutionMode(newMode: AgentExecutionMode, context?: Partial<ExecutionContext>): Promise<void> {
    if (this.isExecuting) {
      throw new Error(`Cannot switch execution mode while agent is executing. Current task must complete first.`);
    }

    if (this.config.executionMode !== AgentExecutionMode.HYBRID && newMode !== this.config.executionMode) {
      throw new Error(`Agent ${this.config.name} is not configured for hybrid mode. Cannot switch from ${this.config.executionMode} to ${newMode}.`);
    }

    const previousMode = this.currentExecutionMode;
    this.currentExecutionMode = newMode;
    
    // Update execution context
    this.executionContext = {
      ...this.executionContext,
      mode: newMode,
      ...context
    };
    
    // Update state
    this.state.currentMode = newMode;
    
    // Log mode switch
    this.logger.info(`Execution mode switched: ${previousMode} → ${newMode}`, {
      agentName: this.config.name,
      category: this.config.category,
      priority: this.executionContext.priority
    });

    // Emit mode switch event
    this.eventEmitter.emit('mode_switched', {
      agentName: this.config.name,
      previousMode,
      newMode,
      timestamp: new Date()
    });

    // Auto-save state if enabled
    if (this.config.persistentState?.autoSave) {
      await this.saveState();
    }
  }

  /**
   * Execute with specific execution mode (temporary override)
   */
  public async executeWithMode(input: string, mode: AgentExecutionMode, context?: Record<string, any>): Promise<any> {
    if (this.config.executionMode !== AgentExecutionMode.HYBRID && mode !== this.currentExecutionMode) {
      throw new Error(`Agent ${this.config.name} cannot execute in ${mode} mode. Current mode: ${this.currentExecutionMode}`);
    }

    const originalMode = this.currentExecutionMode;
    
    try {
      // Temporarily switch mode if different
      if (mode !== this.currentExecutionMode) {
        this.currentExecutionMode = mode;
      }

      // Update mode usage statistics
      this.state.metrics.modeUsageStats[mode]++;

      // Execute based on mode
      switch (mode) {
        case AgentExecutionMode.FOREGROUND:
          return await this.executeForeground(input, context);
        
        case AgentExecutionMode.BACKGROUND:
          return await this.executeBackground(input, context);
        
        case AgentExecutionMode.HYBRID:
          // For hybrid mode, decide based on current system load or priority
          return await this.executeHybrid(input, context);
        
        default:
          throw new Error(`Unknown execution mode: ${mode}`);
      }
    } finally {
      // Restore original mode if it was temporarily changed
      if (mode !== originalMode) {
        this.currentExecutionMode = originalMode;
      }
    }
  }

  /**
   * Execute in foreground mode (blocking)
   */
  private async executeForeground(input: string, context?: Record<string, any>): Promise<any> {
    this.isExecuting = true;
    try {
      this.logger.debug(`Executing in FOREGROUND mode`, { input: input.substring(0, 100) });
      return await this.execute(input, context);
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Execute in background mode (non-blocking)
   */
  private async executeBackground(input: string, context?: Record<string, any>): Promise<any> {
    return new Promise((resolve, reject) => {
      // Add to background task queue
      const task = {
        id: `bg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        input,
        context,
        resolve,
        reject,
        timestamp: new Date(),
        timeout: this.executionContext.timeout
      };

      this.backgroundTaskQueue.push(task);
      
      this.logger.debug(`Queued task for BACKGROUND execution`, { 
        taskId: task.id,
        queueSize: this.backgroundTaskQueue.length 
      });

      // Process background queue
      this.processBackgroundQueue();
    });
  }

  /**
   * Execute in hybrid mode (intelligent mode selection)
   */
  private async executeHybrid(input: string, context?: Record<string, any>): Promise<any> {
    // Decide execution mode based on current conditions
    const shouldRunInBackground = this.shouldUseBackgroundMode(input, context);
    
    if (shouldRunInBackground) {
      this.logger.debug(`HYBRID mode: Selected BACKGROUND execution`);
      return await this.executeBackground(input, context);
    } else {
      this.logger.debug(`HYBRID mode: Selected FOREGROUND execution`);
      return await this.executeForeground(input, context);
    }
  }

  /**
   * Determine if task should run in background mode
   */
  private shouldUseBackgroundMode(input: string, context?: Record<string, any>): boolean {
    // Simple heuristics for mode selection
    const factors = {
      inputLength: input.length > 1000, // Long inputs tend to be complex
      hasFileOperations: input.toLowerCase().includes('file') || input.toLowerCase().includes('write'),
      isLowPriority: this.executionContext.priority >= AgentPriority.LOW,
      queueNotBusy: this.backgroundTaskQueue.length < 5,
      contextSuggestsBackground: context?.async === true || context?.background === true
    };

    // Count positive factors
    const backgroundScore = Object.values(factors).filter(Boolean).length;
    
    // Use background if 2 or more factors suggest it
    return backgroundScore >= 2;
  }

  /**
   * Process background task queue
   */
  private async processBackgroundQueue(): Promise<void> {
    if (this.isExecuting || this.backgroundTaskQueue.length === 0) {
      return;
    }

    const maxConcurrency = this.executionContext.resourceLimits?.maxConcurrency || 1;
    const currentTasks = Math.min(maxConcurrency, this.backgroundTaskQueue.length);

    for (let i = 0; i < currentTasks; i++) {
      const task = this.backgroundTaskQueue.shift();
      if (!task) continue;

      // Execute task in background
      this.executeBackgroundTask(task).catch(error => {
        this.logger.error(`Background task failed`, { taskId: task.id, error: error.message });
        task.reject(error);
      });
    }
  }

  /**
   * Execute individual background task
   */
  private async executeBackgroundTask(task: any): Promise<void> {
    try {
      this.logger.debug(`Executing background task`, { taskId: task.id });
      
      // Set timeout if specified
      let timeoutHandle: NodeJS.Timeout | undefined;
      if (task.timeout) {
        timeoutHandle = setTimeout(() => {
          task.reject(new Error(`Background task timed out after ${task.timeout}ms`));
        }, task.timeout);
      }

      const result = await this.execute(task.input, task.context);
      
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }

      task.resolve(result);
      
      this.logger.debug(`Background task completed`, { taskId: task.id });
    } catch (error: any) {
      task.reject(error);
    }
  }

  /**
   * Get agent category information
   */
  public getCategory(): AgentCategory {
    return this.config.category;
  }

  /**
   * Get current execution mode
   */
  public getCurrentExecutionMode(): AgentExecutionMode {
    return this.currentExecutionMode;
  }

  /**
   * Get execution context
   */
  public getExecutionContext(): ExecutionContext {
    return { ...this.executionContext };
  }

  /**
   * Check if agent can switch to specified mode
   */
  public canSwitchToMode(mode: AgentExecutionMode): boolean {
    if (this.isExecuting) {
      return false;
    }
    
    if (this.config.executionMode === AgentExecutionMode.HYBRID) {
      return true;
    }
    
    return mode === this.config.executionMode;
  }

  /**
   * Get agent capabilities
   */
  public getCapabilities(): string[] {
    return [...this.state.capabilities];
  }

  /**
   * Add capability to agent
   */
  public addCapability(capability: string): void {
    if (!this.state.capabilities.includes(capability)) {
      this.state.capabilities.push(capability);
      this.logger.debug(`Added capability: ${capability}`);
    }
  }

  /**
   * Remove capability from agent
   */
  public removeCapability(capability: string): void {
    const index = this.state.capabilities.indexOf(capability);
    if (index > -1) {
      this.state.capabilities.splice(index, 1);
      this.logger.debug(`Removed capability: ${capability}`);
    }
  }

  /**
   * Get comprehensive agent categorization info
   */
  public getCategorizationInfo() {
    return {
      name: this.config.name,
      category: this.config.category,
      executionMode: this.config.executionMode,
      currentMode: this.currentExecutionMode,
      priority: this.executionContext.priority,
      capabilities: this.state.capabilities,
      canSwitchModes: this.config.executionMode === AgentExecutionMode.HYBRID,
      isExecuting: this.isExecuting,
      backgroundQueueSize: this.backgroundTaskQueue.length,
      modeUsageStats: this.state.metrics.modeUsageStats
    };
  }

  /**
   * Set agent priority
   */
  public setPriority(priority: AgentPriority): void {
    this.executionContext.priority = priority;
    this.state.priority = priority;
    
    this.logger.debug(`Priority updated to: ${AgentPriority[priority]}`);
    
    // Emit priority change event
    this.eventEmitter.emit('priority_changed', {
      agentName: this.config.name,
      newPriority: priority,
      timestamp: new Date()
    });
  }

  /**
   * Clear background task queue
   */
  public clearBackgroundQueue(): void {
    const queueSize = this.backgroundTaskQueue.length;
    
    // Reject all pending tasks
    this.backgroundTaskQueue.forEach(task => {
      task.reject(new Error('Background queue cleared'));
    });
    
    this.backgroundTaskQueue = [];
    
    this.logger.info(`Cleared background task queue`, { clearedTasks: queueSize });
  }

  /**
   * Cleanup resources when agent is destroyed
   */
  public async destroy(): Promise<void> {
    // Clear auto-save interval
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    
    // Clear background task queue
    this.clearBackgroundQueue();
    
    // Cleanup communication resources
    this.eventEmitter.removeAllListeners();
    this.messageHandlers.clear();
    this.activeChannels.clear();
    this.messageQueue = [];
    
    // Save final state
    if (this.config.persistentState?.enabled) {
      await this.saveState();
    }
    
    this.logger.info(`Agent destroyed, final state saved, communication and background tasks cleaned up`);
  }
}