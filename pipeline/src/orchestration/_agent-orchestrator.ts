import { logger } from '@utils/logging';
import { getEnvironmentConfig } from '@utils/config';
import { taskManager, TaskManager } from './task-manager';
import { jsonToObsidianProcessor } from '../processors/json-to-obsidian';
import { pitchCreatorAgent } from '../agents/_pitch-creator-agent';
import ClaudeCodeAgent from './claude-code-agent';
import WebSocketAgentServer from '../infrastructure/websocket-server';
import RabbitMQClient from '../infrastructure/rabbitmq-client';

/**
 * Enhanced Agent Orchestrator - JSON-based task coordination system
 * Integrates with TaskManager for centralized JSON task management
 */
export class AgentOrchestrator {
  private initialized = false;
  private running = false;
  private taskManager: TaskManager;
  private claudeCodeAgent: ClaudeCodeAgent;
  private webSocketServer: WebSocketAgentServer;
  private rabbitMQClient: RabbitMQClient;

  constructor() {
    logger.info('🎭 Enhanced Agent Orchestrator created with JSON task management');
    this.taskManager = taskManager;
    
    // Initialize infrastructure components
    this.claudeCodeAgent = new ClaudeCodeAgent(this.taskManager);
    this.webSocketServer = new WebSocketAgentServer(8080);
    this.rabbitMQClient = new RabbitMQClient(
      process.env.RABBITMQ_URL || 'amqp://sales_pipeline:sales_secure_2025@localhost:5672/mhm_sales'
    );
    
    this.setupTaskEventHandlers();
    this.setupInfrastructureEventHandlers();
  }

  /**
   * Initialize the orchestrator and JSON task management system
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn('⚠️ Agent Orchestrator already initialized');
      return;
    }

    try {
      logger.info('🔧 Initializing Enhanced Agent Orchestrator...');
      
      const config = getEnvironmentConfig();
      logger.info('📋 Environment configuration loaded');

      // Initialize infrastructure
      await this.rabbitMQClient.connect();
      logger.info('✅ RabbitMQ connected');

      // Initialize Task Manager with JSON configurations
      await this.taskManager.initialize();
      logger.info('✅ JSON Task Manager initialized');

      // Initialize agents
      logger.info('🤖 Initializing AI agents...');
      // Pitch Creator Agent is already available
      
      // Initialize JSON processors
      logger.info('🔄 JSON processors initialized');

      this.initialized = true;
      logger.info('✅ Enhanced Agent Orchestrator initialized successfully');
      
    } catch (error) {
      logger.error('❌ Failed to initialize Enhanced Agent Orchestrator:', error);
      throw error;
    }
  }

  /**
   * Start the orchestrator and JSON task management system
   */
  async start(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Enhanced Agent Orchestrator must be initialized before starting');
    }

    if (this.running) {
      logger.warn('⚠️ Agent Orchestrator already running');
      return;
    }

    try {
      logger.info('🚀 Starting Enhanced Agent Orchestrator...');

      // Task Manager handles all scheduled tasks automatically
      logger.info('⏰ JSON-based scheduled tasks are now active');
      
      // Start local processing monitoring
      this.startProcessingMonitoring();

      this.running = true;
      logger.info('✅ Enhanced Agent Orchestrator started successfully');
      logger.info('📊 All processing will output JSON before Obsidian integration');
      
    } catch (error) {
      logger.error('❌ Failed to start Enhanced Agent Orchestrator:', error);
      throw error;
    }
  }

  /**
   * Stop the orchestrator and JSON task management system
   */
  async stop(): Promise<void> {
    if (!this.running) {
      logger.warn('⚠️ Agent Orchestrator not running');
      return;
    }

    try {
      logger.info('🛑 Stopping Enhanced Agent Orchestrator...');

      // Stop Task Manager (handles all scheduled tasks)
      await this.taskManager.shutdown();
      logger.info('⏰ JSON task scheduling stopped');

      // Stop infrastructure services
      await this.webSocketServer.shutdown();
      logger.info('🔌 WebSocket server stopped');
      
      await this.rabbitMQClient.close();
      logger.info('🐰 RabbitMQ disconnected');

      this.running = false;
      logger.info('✅ Enhanced Agent Orchestrator stopped successfully');
      
    } catch (error) {
      logger.error('❌ Failed to stop Enhanced Agent Orchestrator:', error);
      throw error;
    }
  }

  /**
   * Setup event handlers for task completion and processing
   */
  private setupTaskEventHandlers(): void {
    // Handle task completion and JSON processing
    this.taskManager.on('task_completed', async ({ task, execution, outputData }) => {
      logger.info(`Task completed: ${task.name}, processing JSON output...`);
      
      try {
        // Process JSON output to Obsidian format
        const result = await jsonToObsidianProcessor.processTaskOutput(
          task.id,
          outputData,
          task.output.destination
        );
        
        if (result.success) {
          logger.info(`JSON processed to Obsidian: ${result.outputFile}`);
        } else {
          logger.error(`Failed to process JSON output: ${result.error}`);
        }
      } catch (error) {
        logger.error('Error processing task output:', error);
      }
    });

    // Handle task failures
    this.taskManager.on('task_failed', ({ task, execution, error }) => {
      logger.error(`Task failed: ${task.name} - ${error.message}`);
      // Could implement alerting or retry logic here
    });
  }

  /**
   * Setup infrastructure event handlers
   */
  private setupInfrastructureEventHandlers(): void {
    // WebSocket server events
    this.webSocketServer.on('agent_registered', (agent) => {
      logger.info(`🔗 Agent registered: ${agent.id} (${agent.type})`);
    });

    this.webSocketServer.on('task_requested', async (data) => {
      logger.info(`📝 Task requested via WebSocket: ${data.task_id}`);
      // Forward to RabbitMQ for durable processing
      await this.publishTaskToQueue(data);
    });

    this.webSocketServer.on('task_completed', (data) => {
      logger.info(`✅ Task completed via WebSocket: ${data.task_id}`);
      this.emit('websocket_task_completed', data);
    });

    // RabbitMQ events  
    this.rabbitMQClient.on('connected', () => {
      logger.info('🐰 RabbitMQ connection established');
      this.setupTaskQueues();
    });

    this.rabbitMQClient.on('connection_error', (error) => {
      logger.error('🐰 RabbitMQ connection error:', error);
    });

    // Claude Code Agent events
    this.claudeCodeAgent.on('system_analysis_complete', (data) => {
      logger.info(`🧠 System analysis complete: ${data.decisions_made} decisions made`);
    });

    this.claudeCodeAgent.on('recovery_suggested', (decision) => {
      logger.info(`🧠 Recovery suggested: ${decision.reason}`);
      this.handleRecoveryDecision(decision);
    });
  }

  /**
   * Setup RabbitMQ task queues and consumers
   */
  private async setupTaskQueues(): Promise<void> {
    try {
      // Subscribe to high priority tasks
      await this.rabbitMQClient.subscribeToTasks('tasks.high_priority', async (task, ack, nack) => {
        try {
          await this.processTaskFromQueue(task);
          ack();
        } catch (error) {
          logger.error(`Failed to process high priority task ${task.task_id}:`, error);
          nack(task.retry_count < task.max_retries);
        }
      });

      // Subscribe to medium priority tasks
      await this.rabbitMQClient.subscribeToTasks('tasks.medium_priority', async (task, ack, nack) => {
        try {
          await this.processTaskFromQueue(task);
          ack();
        } catch (error) {
          logger.error(`Failed to process medium priority task ${task.task_id}:`, error);
          nack(task.retry_count < task.max_retries);
        }
      });

      // Subscribe to agent-specific queues
      await this.rabbitMQClient.subscribeToTasks('agents.prospecting', async (task, ack, nack) => {
        try {
          await this.processAgentTask(task, 'prospecting');
          ack();
        } catch (error) {
          logger.error(`Failed to process prospecting task ${task.task_id}:`, error);
          nack(task.retry_count < task.max_retries);
        }
      });

      logger.info('📋 RabbitMQ task queues configured');
    } catch (error) {
      logger.error('Failed to setup task queues:', error);
    }
  }

  /**
   * Process task from RabbitMQ queue
   */
  private async processTaskFromQueue(taskMessage: any): Promise<void> {
    logger.info(`🔄 Processing queued task: ${taskMessage.task_id}`);
    
    // Convert RabbitMQ message to internal task format
    const task = await this.convertMessageToTask(taskMessage);
    
    // Execute through TaskManager
    await this.taskManager.executeTask(task, taskMessage.data);
  }

  /**
   * Process agent-specific task
   */
  private async processAgentTask(taskMessage: any, agentType: string): Promise<void> {
    logger.info(`🤖 Processing ${agentType} task: ${taskMessage.task_id}`);
    
    // Send task to appropriate agent via WebSocket
    const sent = this.webSocketServer.sendMessageToAgent(`${agentType}_agent`, {
      type: 'task_request',
      task_id: taskMessage.task_id,
      data: taskMessage.data,
      priority: taskMessage.priority,
      requires_response: true
    });

    if (!sent) {
      logger.warn(`Failed to send task to ${agentType} agent via WebSocket`);
      throw new Error(`Agent ${agentType} not available via WebSocket`);
    }
  }

  /**
   * Publish task to RabbitMQ queue
   */
  private async publishTaskToQueue(taskData: any): Promise<void> {
    const taskMessage = {
      task_id: taskData.task_id,
      task_type: taskData.task_type || 'general',
      agent_type: taskData.agent_type || 'unknown',
      priority: taskData.priority || 'medium',
      data: taskData.data,
      created_at: new Date().toISOString(),
      retry_count: 0,
      max_retries: 3,
      correlation_id: taskData.correlation_id
    };

    await this.rabbitMQClient.publishTask(taskMessage);
  }

  /**
   * Handle recovery decision from Claude Code Agent
   */
  private async handleRecoveryDecision(decision: any): Promise<void> {
    logger.info(`🧠 Handling recovery decision: ${decision.action} for ${decision.task_id}`);
    
    switch (decision.action) {
      case 'reschedule':
        // Re-queue task with delay
        const taskMessage = {
          task_id: decision.task_id,
          task_type: 'recovery',
          agent_type: 'unknown',
          priority: 'medium' as const,
          data: { recovery_reason: decision.reason },
          created_at: new Date().toISOString(),
          scheduled_for: decision.suggested_timing?.toISOString(),
          retry_count: 0,
          max_retries: 1
        };
        await this.rabbitMQClient.publishTask(taskMessage);
        break;
        
      case 'priority_boost':
        // Publish as high priority
        await this.publishTaskToQueue({
          task_id: decision.task_id,
          priority: 'high',
          data: { priority_boosted: true, reason: decision.reason }
        });
        break;
    }
  }

  /**
   * Convert RabbitMQ message to internal task format
   */
  private async convertMessageToTask(message: any): Promise<any> {
    // This would lookup the actual task definition from JSON config
    // For now, return a basic task structure
    return {
      id: message.task_id,
      name: `Task ${message.task_id}`,
      type: 'triggered',
      agent: message.agent_type,
      enabled: true,
      config: message.data,
      output: {
        format: 'json',
        schema: 'generic',
        destination: 'obsidian_dashboard'
      },
      dependencies: [],
      retry_config: {
        max_attempts: message.max_retries,
        backoff_seconds: 300
      }
    };
  }

  /**
   * Start monitoring for local processing
   */
  private startProcessingMonitoring(): void {
    // Log current task status periodically
    setInterval(() => {
      const runningTasks = this.taskManager.getRunningTasks();
      if (runningTasks.length > 0) {
        logger.info(`📊 Currently processing ${runningTasks.length} tasks locally`);
      }
    }, 60000); // Every minute
  }

  /**
   * Manually trigger a task by name
   */
  async triggerTask(taskId: string, data?: any): Promise<void> {
    if (!this.running) {
      throw new Error('Agent Orchestrator must be running to trigger tasks');
    }
    
    logger.info(`🎯 Manually triggering task: ${taskId}`);
    await this.taskManager.triggerTask(`manual_${taskId}`, data);
  }

  /**
   * Get comprehensive orchestrator status including task information
   */
  getStatus(): { 
    initialized: boolean; 
    running: boolean; 
    runningTasks: number; 
    taskHistory: number;
    jsonProcessing: boolean;
  } {
    const runningTasks = this.taskManager.getRunningTasks();
    const taskHistory = this.taskManager.getTaskStatus();
    
    return {
      initialized: this.initialized,
      running: this.running,
      runningTasks: runningTasks.length,
      taskHistory: taskHistory.length,
      jsonProcessing: true // Always true for this system
    };
  }

  /**
   * Get detailed task execution information
   */
  getTaskStatus(taskId?: string): any[] {
    return this.taskManager.getTaskStatus(taskId);
  }
}