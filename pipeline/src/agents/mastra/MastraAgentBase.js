"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MastraAgentBase = exports.AgentPriority = exports.AgentCategory = exports.AgentExecutionMode = void 0;
const core_1 = require("@mastra/core");
const anthropic_1 = require("@ai-sdk/anthropic");
const logging_1 = require("../../utils/logging");
const events_1 = require("events");
var AgentExecutionMode;
(function (AgentExecutionMode) {
    AgentExecutionMode["FOREGROUND"] = "foreground";
    AgentExecutionMode["BACKGROUND"] = "background";
    AgentExecutionMode["HYBRID"] = "hybrid";
})(AgentExecutionMode || (exports.AgentExecutionMode = AgentExecutionMode = {}));
var AgentCategory;
(function (AgentCategory) {
    AgentCategory["PROSPECTING"] = "prospecting";
    AgentCategory["COMMUNICATION"] = "communication";
    AgentCategory["ANALYSIS"] = "analysis";
    AgentCategory["ORGANIZATION"] = "organization";
    AgentCategory["MONITORING"] = "monitoring";
    AgentCategory["ORCHESTRATION"] = "orchestration";
    AgentCategory["UTILITY"] = "utility";
})(AgentCategory || (exports.AgentCategory = AgentCategory = {}));
var AgentPriority;
(function (AgentPriority) {
    AgentPriority[AgentPriority["CRITICAL"] = 1] = "CRITICAL";
    AgentPriority[AgentPriority["HIGH"] = 2] = "HIGH";
    AgentPriority[AgentPriority["NORMAL"] = 3] = "NORMAL";
    AgentPriority[AgentPriority["LOW"] = 4] = "LOW";
    AgentPriority[AgentPriority["BACKGROUND"] = 5] = "BACKGROUND";
})(AgentPriority || (exports.AgentPriority = AgentPriority = {}));
class MastraAgentBase {
    agent;
    logger;
    config;
    state;
    stateFilePath;
    autoSaveInterval;
    eventEmitter;
    communicationManager;
    messageHandlers;
    messageQueue;
    activeChannels;
    currentExecutionMode;
    executionContext;
    backgroundTaskQueue;
    isExecuting;
    constructor(config) {
        this.config = config;
        this.logger = new logging_1.Logger(config.name, 'agent');
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
        this.eventEmitter = new events_1.EventEmitter();
        this.messageHandlers = new Map();
        this.messageQueue = [];
        this.activeChannels = new Set();
        this.initializeCommunication();
        this.initializeState();
        const agentConfig = {
            name: config.name,
            instructions: config.instructions,
            model: config.model || (0, anthropic_1.anthropic)('claude-3-5-sonnet-20241022', {
                temperature: config.temperature || 0.2,
                maxTokens: config.maxTokens || 4000
            }),
            tools: this.getTools()
        };
        this.agent = new core_1.Agent(agentConfig);
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
    async execute(input, context) {
        const startTime = Date.now();
        let success = false;
        let result = null;
        try {
            this.logger.info(`Executing agent with input`, { inputLength: input.length });
            this.updateExecutionContext(context);
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
        }
        catch (error) {
            this.logger.error(`Agent execution failed`, { error: error.message });
            throw error;
        }
        finally {
            const duration = Date.now() - startTime;
            this.updateExecutionState(input, result, duration, success);
            if (this.config.persistentState?.autoSave) {
                await this.saveState();
            }
        }
    }
    async executeWithData(data, prompt) {
        try {
            const contextualPrompt = prompt || this.generateContextualPrompt(data);
            this.logger.info(`Executing agent with structured data`, {
                dataKeys: Object.keys(data),
                hasPrompt: !!prompt
            });
            return await this.execute(contextualPrompt, data);
        }
        catch (error) {
            this.logger.error(`Agent execution with data failed`, { error: error.message });
            throw error;
        }
    }
    generateContextualPrompt(data) {
        const dataString = Object.entries(data)
            .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
            .join('\n');
        return `Please process the following data according to your instructions:\n\n${dataString}`;
    }
    getStatus() {
        return {
            name: this.config.name,
            initialized: !!this.agent,
            toolCount: this.getTools().length,
            model: 'claude-3-5-sonnet-20241022',
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
    updateInstructions(newInstructions) {
        this.config.instructions = newInstructions;
        this.logger.info(`Instructions updated for agent: ${this.config.name}`);
    }
    validateRequiredContext(context, requiredKeys) {
        const missingKeys = requiredKeys.filter(key => !(key in context));
        if (missingKeys.length > 0) {
            throw new Error(`Missing required context keys: ${missingKeys.join(', ')}`);
        }
    }
    logExecutionResult(result, operation) {
        const sanitizedResult = this.sanitizeForLogging(result);
        this.logger.info(`${operation} completed`, { result: sanitizedResult });
    }
    sanitizeForLogging(obj) {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }
        const sanitized = { ...obj };
        const sensitiveKeys = ['email', 'phone', 'password', 'token', 'key', 'secret'];
        for (const key in sanitized) {
            if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
                sanitized[key] = '[REDACTED]';
            }
            else if (typeof sanitized[key] === 'object') {
                sanitized[key] = this.sanitizeForLogging(sanitized[key]);
            }
        }
        return sanitized;
    }
    initializeState() {
        this.state = {
            id: `${this.config.name}-${Date.now()}`,
            agentName: this.config.name,
            timestamp: new Date(),
            executionCount: 0,
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
        if (this.config.persistentState?.enabled) {
            const statePath = this.config.persistentState.statePath || './.mastra/state';
            this.stateFilePath = `${statePath}/${this.config.name}-state.json`;
            const fs = require('fs');
            const path = require('path');
            const stateDir = path.dirname(this.stateFilePath);
            if (!fs.existsSync(stateDir)) {
                fs.mkdirSync(stateDir, { recursive: true });
            }
        }
    }
    async loadState() {
        if (!this.stateFilePath)
            return;
        try {
            const fs = require('fs').promises;
            const stateData = await fs.readFile(this.stateFilePath, 'utf8');
            const savedState = JSON.parse(stateData);
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
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                this.logger.warn(`Failed to load persisted state: ${error.message}`);
            }
        }
    }
    async saveState() {
        if (!this.stateFilePath)
            return;
        try {
            const fs = require('fs').promises;
            const stateData = JSON.stringify(this.state, null, 2);
            await fs.writeFile(this.stateFilePath, stateData, 'utf8');
            this.logger.debug(`State saved to ${this.stateFilePath}`);
        }
        catch (error) {
            this.logger.error(`Failed to save state: ${error.message}`);
        }
    }
    setupAutoSave() {
        const saveInterval = this.config.persistentState?.saveInterval || 30000;
        this.autoSaveInterval = setInterval(async () => {
            await this.saveState();
        }, saveInterval);
        this.logger.debug(`Auto-save enabled with ${saveInterval}ms interval`);
    }
    updateExecutionContext(context) {
        if (context) {
            this.state.context = { ...this.state.context, ...context };
        }
    }
    updateExecutionState(input, result, duration, success) {
        this.state.executionCount++;
        this.state.timestamp = new Date();
        this.state.lastExecution = {
            input: this.sanitizeForLogging(input),
            output: this.sanitizeForLogging(result),
            duration,
            success,
            mode: this.currentExecutionMode
        };
        this.state.metrics.totalExecutions++;
        if (success) {
            this.state.metrics.successfulExecutions++;
        }
        const totalTime = (this.state.metrics.avgExecutionTime * (this.state.metrics.totalExecutions - 1)) + duration;
        this.state.metrics.avgExecutionTime = Math.round(totalTime / this.state.metrics.totalExecutions);
        this.state.metrics.errorRate = ((this.state.metrics.totalExecutions - this.state.metrics.successfulExecutions) / this.state.metrics.totalExecutions) * 100;
    }
    getState() {
        return { ...this.state };
    }
    getMetrics() {
        return {
            ...this.state.metrics,
            uptime: Date.now() - new Date(this.state.timestamp).getTime(),
            lastExecution: this.state.lastExecution?.duration,
            contextSize: Object.keys(this.state.context).length
        };
    }
    async resetState() {
        this.initializeState();
        if (this.config.persistentState?.enabled) {
            await this.saveState();
        }
        this.logger.info(`Agent state reset`);
    }
    initializeCommunication() {
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
        this.eventEmitter.on('message', this.handleIncomingMessage.bind(this));
        this.eventEmitter.on('error', this.handleCommunicationError.bind(this));
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
    async subscribe(channel, handler) {
        if (!this.messageHandlers.has(channel)) {
            this.messageHandlers.set(channel, new Set());
        }
        this.messageHandlers.get(channel).add(handler);
        this.activeChannels.add(channel);
        this.eventEmitter.emit('communication_event', {
            type: 'channel_joined',
            agentName: this.config.name,
            channel,
            timestamp: new Date()
        });
        this.logger.debug(`Subscribed to channel: ${channel}`);
    }
    async unsubscribe(channel, handler) {
        if (handler && this.messageHandlers.has(channel)) {
            this.messageHandlers.get(channel).delete(handler);
            if (this.messageHandlers.get(channel).size === 0) {
                this.messageHandlers.delete(channel);
                this.activeChannels.delete(channel);
            }
        }
        else {
            this.messageHandlers.delete(channel);
            this.activeChannels.delete(channel);
        }
        this.eventEmitter.emit('communication_event', {
            type: 'channel_left',
            agentName: this.config.name,
            channel,
            timestamp: new Date()
        });
        this.logger.debug(`Unsubscribed from channel: ${channel}`);
    }
    async publish(channel, payload, type = 'event') {
        const message = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            from: this.config.name,
            to: 'broadcast',
            channel,
            type,
            payload,
            timestamp: new Date()
        };
        const maxQueueSize = this.config.communication?.maxQueueSize || 100;
        if (this.messageQueue.length >= maxQueueSize) {
            this.messageQueue.shift();
        }
        this.messageQueue.push(message);
        this.eventEmitter.emit('message_published', message);
        this.eventEmitter.emit('communication_event', {
            type: 'message_sent',
            agentName: this.config.name,
            channel,
            message,
            timestamp: new Date()
        });
        this.logger.debug(`Published message to channel: ${channel}`, {
            messageId: message.id,
            type,
            payloadSize: JSON.stringify(payload).length
        });
    }
    async sendMessage(to, payload, options) {
        const message = {
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
        const maxQueueSize = this.config.communication?.maxQueueSize || 100;
        if (this.messageQueue.length >= maxQueueSize) {
            this.messageQueue.shift();
        }
        this.messageQueue.push(message);
        this.eventEmitter.emit('direct_message', message);
        this.eventEmitter.emit('communication_event', {
            type: 'message_sent',
            agentName: this.config.name,
            channel: message.channel,
            message,
            timestamp: new Date()
        });
        this.logger.debug(`Sent message to agent: ${to}`, {
            messageId: message.id,
            channel: message.channel,
            timeout: message.timeout
        });
        return message;
    }
    async broadcast(payload, channels) {
        const targetChannels = channels || Array.from(this.activeChannels);
        for (const channel of targetChannels) {
            await this.publish(channel, payload, 'broadcast');
        }
        this.logger.debug(`Broadcast message to ${targetChannels.length} channels`, {
            channels: targetChannels,
            payloadSize: JSON.stringify(payload).length
        });
    }
    async handleIncomingMessage(message) {
        try {
            if (message.to !== this.config.name && message.to !== 'broadcast') {
                return;
            }
            const handlers = this.messageHandlers.get(message.channel);
            if (!handlers || handlers.size === 0) {
                this.logger.debug(`No handlers for channel: ${message.channel}`);
                return;
            }
            const results = await Promise.allSettled(Array.from(handlers).map(handler => handler(message)));
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
            });
        }
        catch (error) {
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
            });
        }
    }
    handleCommunicationError(error) {
        this.logger.error(`Communication system error`, { error: error.message });
        this.eventEmitter.emit('communication_event', {
            type: 'error',
            agentName: this.config.name,
            error,
            timestamp: new Date()
        });
    }
    getCommunicationManager() {
        return this.communicationManager;
    }
    getEventEmitter() {
        return this.eventEmitter;
    }
    addMessageHandler(channel, handler) {
        this.communicationManager.subscribe(channel, handler);
    }
    removeMessageHandler(channel, handler) {
        this.communicationManager.unsubscribe(channel, handler);
    }
    async sendToAgent(targetAgent, payload, channel) {
        return this.communicationManager.sendMessage(targetAgent, payload, { channel });
    }
    async broadcastMessage(payload, channels) {
        return this.communicationManager.broadcast(payload, channels);
    }
    getCommunicationStats() {
        return {
            activeChannels: Array.from(this.activeChannels),
            messageQueueSize: this.messageQueue.length,
            totalHandlers: Array.from(this.messageHandlers.values())
                .reduce((sum, handlers) => sum + handlers.size, 0),
            isEnabled: !!this.config.communication?.enabled
        };
    }
    async switchExecutionMode(newMode, context) {
        if (this.isExecuting) {
            throw new Error(`Cannot switch execution mode while agent is executing. Current task must complete first.`);
        }
        if (this.config.executionMode !== AgentExecutionMode.HYBRID && newMode !== this.config.executionMode) {
            throw new Error(`Agent ${this.config.name} is not configured for hybrid mode. Cannot switch from ${this.config.executionMode} to ${newMode}.`);
        }
        const previousMode = this.currentExecutionMode;
        this.currentExecutionMode = newMode;
        this.executionContext = {
            ...this.executionContext,
            mode: newMode,
            ...context
        };
        this.state.currentMode = newMode;
        this.logger.info(`Execution mode switched: ${previousMode} → ${newMode}`, {
            agentName: this.config.name,
            category: this.config.category,
            priority: this.executionContext.priority
        });
        this.eventEmitter.emit('mode_switched', {
            agentName: this.config.name,
            previousMode,
            newMode,
            timestamp: new Date()
        });
        if (this.config.persistentState?.autoSave) {
            await this.saveState();
        }
    }
    async executeWithMode(input, mode, context) {
        if (this.config.executionMode !== AgentExecutionMode.HYBRID && mode !== this.currentExecutionMode) {
            throw new Error(`Agent ${this.config.name} cannot execute in ${mode} mode. Current mode: ${this.currentExecutionMode}`);
        }
        const originalMode = this.currentExecutionMode;
        try {
            if (mode !== this.currentExecutionMode) {
                this.currentExecutionMode = mode;
            }
            this.state.metrics.modeUsageStats[mode]++;
            switch (mode) {
                case AgentExecutionMode.FOREGROUND:
                    return await this.executeForeground(input, context);
                case AgentExecutionMode.BACKGROUND:
                    return await this.executeBackground(input, context);
                case AgentExecutionMode.HYBRID:
                    return await this.executeHybrid(input, context);
                default:
                    throw new Error(`Unknown execution mode: ${mode}`);
            }
        }
        finally {
            if (mode !== originalMode) {
                this.currentExecutionMode = originalMode;
            }
        }
    }
    async executeForeground(input, context) {
        this.isExecuting = true;
        try {
            this.logger.debug(`Executing in FOREGROUND mode`, { input: input.substring(0, 100) });
            return await this.execute(input, context);
        }
        finally {
            this.isExecuting = false;
        }
    }
    async executeBackground(input, context) {
        return new Promise((resolve, reject) => {
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
            this.processBackgroundQueue();
        });
    }
    async executeHybrid(input, context) {
        const shouldRunInBackground = this.shouldUseBackgroundMode(input, context);
        if (shouldRunInBackground) {
            this.logger.debug(`HYBRID mode: Selected BACKGROUND execution`);
            return await this.executeBackground(input, context);
        }
        else {
            this.logger.debug(`HYBRID mode: Selected FOREGROUND execution`);
            return await this.executeForeground(input, context);
        }
    }
    shouldUseBackgroundMode(input, context) {
        const factors = {
            inputLength: input.length > 1000,
            hasFileOperations: input.toLowerCase().includes('file') || input.toLowerCase().includes('write'),
            isLowPriority: this.executionContext.priority >= AgentPriority.LOW,
            queueNotBusy: this.backgroundTaskQueue.length < 5,
            contextSuggestsBackground: context?.async === true || context?.background === true
        };
        const backgroundScore = Object.values(factors).filter(Boolean).length;
        return backgroundScore >= 2;
    }
    async processBackgroundQueue() {
        if (this.isExecuting || this.backgroundTaskQueue.length === 0) {
            return;
        }
        const maxConcurrency = this.executionContext.resourceLimits?.maxConcurrency || 1;
        const currentTasks = Math.min(maxConcurrency, this.backgroundTaskQueue.length);
        for (let i = 0; i < currentTasks; i++) {
            const task = this.backgroundTaskQueue.shift();
            if (!task)
                continue;
            this.executeBackgroundTask(task).catch(error => {
                this.logger.error(`Background task failed`, { taskId: task.id, error: error.message });
                task.reject(error);
            });
        }
    }
    async executeBackgroundTask(task) {
        try {
            this.logger.debug(`Executing background task`, { taskId: task.id });
            let timeoutHandle;
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
        }
        catch (error) {
            task.reject(error);
        }
    }
    getCategory() {
        return this.config.category;
    }
    getCurrentExecutionMode() {
        return this.currentExecutionMode;
    }
    getExecutionContext() {
        return { ...this.executionContext };
    }
    canSwitchToMode(mode) {
        if (this.isExecuting) {
            return false;
        }
        if (this.config.executionMode === AgentExecutionMode.HYBRID) {
            return true;
        }
        return mode === this.config.executionMode;
    }
    getCapabilities() {
        return [...this.state.capabilities];
    }
    addCapability(capability) {
        if (!this.state.capabilities.includes(capability)) {
            this.state.capabilities.push(capability);
            this.logger.debug(`Added capability: ${capability}`);
        }
    }
    removeCapability(capability) {
        const index = this.state.capabilities.indexOf(capability);
        if (index > -1) {
            this.state.capabilities.splice(index, 1);
            this.logger.debug(`Removed capability: ${capability}`);
        }
    }
    getCategorizationInfo() {
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
    setPriority(priority) {
        this.executionContext.priority = priority;
        this.state.priority = priority;
        this.logger.debug(`Priority updated to: ${AgentPriority[priority]}`);
        this.eventEmitter.emit('priority_changed', {
            agentName: this.config.name,
            newPriority: priority,
            timestamp: new Date()
        });
    }
    clearBackgroundQueue() {
        const queueSize = this.backgroundTaskQueue.length;
        this.backgroundTaskQueue.forEach(task => {
            task.reject(new Error('Background queue cleared'));
        });
        this.backgroundTaskQueue = [];
        this.logger.info(`Cleared background task queue`, { clearedTasks: queueSize });
    }
    async destroy() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        this.clearBackgroundQueue();
        this.eventEmitter.removeAllListeners();
        this.messageHandlers.clear();
        this.activeChannels.clear();
        this.messageQueue = [];
        if (this.config.persistentState?.enabled) {
            await this.saveState();
        }
        this.logger.info(`Agent destroyed, final state saved, communication and background tasks cleaned up`);
    }
}
exports.MastraAgentBase = MastraAgentBase;
//# sourceMappingURL=MastraAgentBase.js.map