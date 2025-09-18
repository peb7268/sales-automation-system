/**
 * RabbitMQ Client - Durable message queuing for task orchestration
 * Handles task queuing, routing, and persistence across system restarts
 */

import amqp from 'amqplib';
import { EventEmitter } from 'events';
import { logger } from '@utils/logging';

export interface TaskMessage {
  task_id: string;
  task_type: string;
  agent_type: string;
  priority: 'high' | 'medium' | 'low';
  data: any;
  created_at: string;
  scheduled_for?: string;
  retry_count: number;
  max_retries: number;
  correlation_id?: string;
}

export interface QueueConfig {
  name: string;
  durable: boolean;
  exclusive: boolean;
  autoDelete: boolean;
  arguments?: Record<string, any>;
}

export class RabbitMQClient extends EventEmitter {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private connectionString: string;
  private isConnected: boolean = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private queues: Map<string, QueueConfig> = new Map();

  constructor(connectionString: string) {
    super();
    this.connectionString = connectionString;
    this.setupQueues();
  }

  /**
   * Setup default queue configurations
   */
  private setupQueues(): void {
    // Task queues organized by priority and type
    this.queues.set('tasks.high_priority', {
      name: 'tasks.high_priority',
      durable: true,
      exclusive: false,
      autoDelete: false,
      arguments: {
        'x-message-ttl': 3600000, // 1 hour TTL
        'x-max-priority': 10
      }
    });

    this.queues.set('tasks.medium_priority', {
      name: 'tasks.medium_priority',
      durable: true,
      exclusive: false,
      autoDelete: false,
      arguments: {
        'x-message-ttl': 7200000, // 2 hours TTL
        'x-max-priority': 5
      }
    });

    this.queues.set('tasks.low_priority', {
      name: 'tasks.low_priority',
      durable: true,
      exclusive: false,
      autoDelete: false,
      arguments: {
        'x-message-ttl': 14400000, // 4 hours TTL
        'x-max-priority': 1
      }
    });

    // Agent-specific queues
    this.queues.set('agents.prospecting', {
      name: 'agents.prospecting',
      durable: true,
      exclusive: false,
      autoDelete: false
    });

    this.queues.set('agents.pitch_creator', {
      name: 'agents.pitch_creator',
      durable: true,
      exclusive: false,
      autoDelete: false
    });

    this.queues.set('agents.analytics', {
      name: 'agents.analytics',
      durable: true,
      exclusive: false,
      autoDelete: false
    });

    // Dead letter queue for failed tasks
    this.queues.set('tasks.dead_letter', {
      name: 'tasks.dead_letter',
      durable: true,
      exclusive: false,
      autoDelete: false
    });

    // Scheduled tasks queue
    this.queues.set('tasks.scheduled', {
      name: 'tasks.scheduled',
      durable: true,
      exclusive: false,
      autoDelete: false,
      arguments: {
        'x-delayed-type': 'direct'
      }
    });
  }

  /**
   * Connect to RabbitMQ server
   */
  async connect(): Promise<void> {
    try {
      logger.info('🐰 Connecting to RabbitMQ...');
      
      this.connection = await amqp.connect(this.connectionString);
      this.channel = await this.connection.createChannel();

      // Setup connection event handlers
      this.connection.on('error', this.handleConnectionError.bind(this));
      this.connection.on('close', this.handleConnectionClose.bind(this));

      // Setup channel event handlers
      this.channel.on('error', this.handleChannelError.bind(this));
      this.channel.on('close', this.handleChannelClose.bind(this));

      // Set channel prefetch for fair dispatching
      await this.channel.prefetch(10);

      // Create all queues and exchanges
      await this.setupExchangesAndQueues();

      this.isConnected = true;
      logger.info('✅ Connected to RabbitMQ successfully');
      this.emit('connected');

    } catch (error) {
      logger.error('❌ Failed to connect to RabbitMQ:', error);
      this.scheduleReconnect();
      throw error;
    }
  }

  /**
   * Setup exchanges and queues
   */
  private async setupExchangesAndQueues(): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel not available');

    // Create main task exchange
    await this.channel.assertExchange('tasks', 'topic', { durable: true });
    
    // Create dead letter exchange
    await this.channel.assertExchange('tasks.dead_letter', 'direct', { durable: true });

    // Create all configured queues
    for (const [queueName, config] of this.queues) {
      await this.channel.assertQueue(config.name, {
        durable: config.durable,
        exclusive: config.exclusive,
        autoDelete: config.autoDelete,
        arguments: {
          ...config.arguments,
          'x-dead-letter-exchange': 'tasks.dead_letter',
          'x-dead-letter-routing-key': 'failed'
        }
      });

      // Bind queues to appropriate exchanges
      if (queueName.startsWith('tasks.')) {
        const priority = queueName.split('.')[1];
        await this.channel.bindQueue(config.name, 'tasks', `task.${priority}`);
      } else if (queueName.startsWith('agents.')) {
        const agentType = queueName.split('.')[1];
        await this.channel.bindQueue(config.name, 'tasks', `agent.${agentType}`);
      }
    }

    // Bind dead letter queue
    await this.channel.bindQueue('tasks.dead_letter', 'tasks.dead_letter', 'failed');

    logger.info(`📋 Created ${this.queues.size} queues and bindings`);
  }

  /**
   * Publish a task message to appropriate queue
   */
  async publishTask(task: TaskMessage): Promise<boolean> {
    if (!this.isConnected || !this.channel) {
      logger.error('Cannot publish task: RabbitMQ not connected');
      return false;
    }

    try {
      const routingKey = this.getRoutingKey(task);
      const messageBuffer = Buffer.from(JSON.stringify(task));
      
      const publishOptions: amqp.Options.Publish = {
        persistent: true,
        priority: this.getPriorityNumber(task.priority),
        timestamp: Date.now(),
        messageId: task.task_id,
        correlationId: task.correlation_id,
        headers: {
          task_type: task.task_type,
          agent_type: task.agent_type,
          retry_count: task.retry_count
        }
      };

      // Handle scheduled tasks
      if (task.scheduled_for) {
        const delay = new Date(task.scheduled_for).getTime() - Date.now();
        if (delay > 0) {
          publishOptions.headers = {
            ...publishOptions.headers,
            'x-delay': delay
          };
        }
      }

      const published = this.channel.publish(
        'tasks',
        routingKey,
        messageBuffer,
        publishOptions
      );

      if (published) {
        logger.info(`📤 Published task ${task.task_id} to queue with routing key: ${routingKey}`);
        this.emit('task_published', task);
        return true;
      } else {
        logger.warn(`⚠️ Failed to publish task ${task.task_id}: channel blocked`);
        return false;
      }

    } catch (error) {
      logger.error(`Failed to publish task ${task.task_id}:`, error);
      return false;
    }
  }

  /**
   * Subscribe to task messages from a specific queue
   */
  async subscribeToTasks(
    queueName: string,
    handler: (task: TaskMessage, ack: () => void, nack: (requeue?: boolean) => void) => Promise<void>
  ): Promise<void> {
    if (!this.isConnected || !this.channel) {
      throw new Error('Cannot subscribe: RabbitMQ not connected');
    }

    try {
      await this.channel.consume(queueName, async (message) => {
        if (!message) return;

        try {
          const task: TaskMessage = JSON.parse(message.content.toString());
          
          // Create ack/nack functions
          const ack = () => {
            if (this.channel) {
              this.channel.ack(message);
              logger.debug(`✅ Acknowledged task ${task.task_id}`);
            }
          };

          const nack = (requeue: boolean = false) => {
            if (this.channel) {
              this.channel.nack(message, false, requeue);
              logger.debug(`❌ Nacked task ${task.task_id}, requeue: ${requeue}`);
            }
          };

          // Handle the task
          await handler(task, ack, nack);

        } catch (error) {
          logger.error('Error processing task message:', error);
          if (this.channel) {
            this.channel.nack(message, false, false); // Don't requeue malformed messages
          }
        }
      });

      logger.info(`🔄 Subscribed to queue: ${queueName}`);

    } catch (error) {
      logger.error(`Failed to subscribe to queue ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Get routing key for task based on priority and type
   */
  private getRoutingKey(task: TaskMessage): string {
    // Route by priority first, then by agent type
    if (task.priority === 'high') {
      return 'task.high_priority';
    } else if (task.agent_type) {
      return `agent.${task.agent_type}`;
    } else {
      return `task.${task.priority}`;
    }
  }

  /**
   * Convert priority string to number
   */
  private getPriorityNumber(priority: 'high' | 'medium' | 'low'): number {
    switch (priority) {
      case 'high': return 10;
      case 'medium': return 5;
      case 'low': return 1;
      default: return 1;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queueName: string): Promise<{
    messageCount: number;
    consumerCount: number;
  }> {
    if (!this.isConnected || !this.channel) {
      throw new Error('Cannot get stats: RabbitMQ not connected');
    }

    try {
      const queueInfo = await this.channel.checkQueue(queueName);
      return {
        messageCount: queueInfo.messageCount,
        consumerCount: queueInfo.consumerCount
      };
    } catch (error) {
      logger.error(`Failed to get stats for queue ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Purge all messages from a queue
   */
  async purgeQueue(queueName: string): Promise<number> {
    if (!this.isConnected || !this.channel) {
      throw new Error('Cannot purge: RabbitMQ not connected');
    }

    try {
      const result = await this.channel.purgeQueue(queueName);
      logger.info(`🗑️ Purged ${result.messageCount} messages from queue: ${queueName}`);
      return result.messageCount;
    } catch (error) {
      logger.error(`Failed to purge queue ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Handle connection errors
   */
  private handleConnectionError(error: Error): void {
    logger.error('RabbitMQ connection error:', error);
    this.isConnected = false;
    this.emit('connection_error', error);
  }

  /**
   * Handle connection close
   */
  private handleConnectionClose(): void {
    logger.warn('RabbitMQ connection closed');
    this.isConnected = false;
    this.emit('connection_closed');
    this.scheduleReconnect();
  }

  /**
   * Handle channel errors
   */
  private handleChannelError(error: Error): void {
    logger.error('RabbitMQ channel error:', error);
    this.emit('channel_error', error);
  }

  /**
   * Handle channel close
   */
  private handleChannelClose(): void {
    logger.warn('RabbitMQ channel closed');
    this.emit('channel_closed');
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) return;

    this.reconnectTimeout = setTimeout(async () => {
      this.reconnectTimeout = null;
      try {
        await this.connect();
      } catch (error) {
        logger.error('Reconnection attempt failed:', error);
      }
    }, 5000); // Retry after 5 seconds
  }

  /**
   * Get connection status
   */
  isConnectionHealthy(): boolean {
    return this.isConnected && 
           this.connection !== null && 
           this.channel !== null;
  }

  /**
   * Close connection gracefully
   */
  async close(): Promise<void> {
    logger.info('🐰 Closing RabbitMQ connection...');

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
    } catch (error) {
      logger.error('Error closing RabbitMQ connection:', error);
    }

    this.isConnected = false;
    this.connection = null;
    this.channel = null;
    
    logger.info('✅ RabbitMQ connection closed');
  }
}

export default RabbitMQClient;