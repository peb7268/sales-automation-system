/**
 * Task Manager - Core JSON-based task orchestration system
 * Handles loading, scheduling, and executing tasks defined in JSON configuration
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as cron from 'node-cron';
import { EventEmitter } from 'events';
import { logger } from '@utils/logging';

export interface Task {
  id: string;
  name: string;
  description: string;
  type: 'scheduled' | 'triggered' | 'manual';
  schedule?: string; // cron expression
  trigger?: string;  // event name
  agent: string;
  enabled: boolean;
  config: Record<string, any>;
  output: {
    format: 'json';
    schema: string;
    destination: string;
  };
  dependencies: string[];
  retry_config?: {
    max_attempts: number;
    backoff_seconds: number;
  };
}

export interface TaskDefinitions {
  version: string;
  description: string;
  last_updated: string;
  prospecting_tasks: Task[];
  outreach_tasks: Task[];
  pipeline_tasks: Task[];
  analytics_tasks: Task[];
  maintenance_tasks: Task[];
}

export interface TaskExecution {
  id: string;
  task_id: string;
  started_at: Date;
  completed_at?: Date;
  status: 'running' | 'completed' | 'failed' | 'retrying';
  attempt: number;
  result?: any;
  error?: string;
  output_data?: any;
}

export interface AutomationRules {
  version: string;
  stage_transitions: Record<string, any>;
  qualification_rules: Record<string, any>;
  alert_rules: Record<string, any>;
  data_validation: Record<string, any>;
}

export interface ScheduleConfig {
  version: string;
  timezone: string;
  cron_schedules: Record<string, any>;
  execution_windows: Record<string, any>;
  retry_policies: Record<string, any>;
  task_priorities: Record<string, string[]>;
  resource_limits: Record<string, any>;
  monitoring: Record<string, any>;
}

export class TaskManager extends EventEmitter {
  private taskDefinitions: TaskDefinitions | null = null;
  private automationRules: AutomationRules | null = null;
  private scheduleConfig: ScheduleConfig | null = null;
  private scheduledJobs: Map<string, cron.ScheduledTask> = new Map();
  private runningTasks: Map<string, TaskExecution> = new Map();
  private taskHistory: TaskExecution[] = [];
  private configPath: string;

  constructor(configPath: string = 'config/tasks') {
    super();
    this.configPath = configPath;
  }

  /**
   * Initialize the task manager by loading all configurations
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Task Manager...');
      
      await this.loadConfigurations();
      await this.setupScheduledTasks();
      await this.setupEventListeners();
      
      logger.info('Task Manager initialized successfully');
      this.emit('initialized');
    } catch (error) {
      logger.error('Failed to initialize Task Manager:', error);
      throw error;
    }
  }

  /**
   * Load all configuration files
   */
  private async loadConfigurations(): Promise<void> {
    const configDir = path.resolve(this.configPath);
    
    // Load task definitions
    const taskDefsPath = path.join(configDir, 'pipeline-tasks.json');
    const taskDefsContent = await fs.readFile(taskDefsPath, 'utf8');
    this.taskDefinitions = JSON.parse(taskDefsContent);
    
    // Load automation rules
    const rulesPath = path.join(configDir, 'automation-rules.json');
    const rulesContent = await fs.readFile(rulesPath, 'utf8');
    this.automationRules = JSON.parse(rulesContent);
    
    // Load schedule configuration
    const schedulePath = path.join(configDir, 'schedules.json');
    const scheduleContent = await fs.readFile(schedulePath, 'utf8');
    this.scheduleConfig = JSON.parse(scheduleContent);
    
    logger.info('All task configurations loaded successfully');
  }

  /**
   * Setup scheduled tasks using cron
   */
  private async setupScheduledTasks(): Promise<void> {
    if (!this.taskDefinitions) return;
    
    const allTasks = [
      ...this.taskDefinitions.prospecting_tasks,
      ...this.taskDefinitions.outreach_tasks,
      ...this.taskDefinitions.pipeline_tasks,
      ...this.taskDefinitions.analytics_tasks,
      ...this.taskDefinitions.maintenance_tasks
    ];

    for (const task of allTasks) {
      if (task.type === 'scheduled' && task.enabled && task.schedule) {
        await this.scheduleTask(task);
      }
    }
    
    logger.info(`Scheduled ${this.scheduledJobs.size} tasks`);
  }

  /**
   * Schedule a single task
   */
  private async scheduleTask(task: Task): Promise<void> {
    try {
      const job = cron.schedule(task.schedule!, async () => {
        await this.executeTask(task);
      }, {
        scheduled: false,
        timezone: this.scheduleConfig?.timezone || 'America/Denver'
      });

      this.scheduledJobs.set(task.id, job);
      job.start();
      
      logger.info(`Scheduled task: ${task.name} (${task.schedule})`);
    } catch (error) {
      logger.error(`Failed to schedule task ${task.id}:`, error);
    }
  }

  /**
   * Setup event listeners for triggered tasks
   */
  private async setupEventListeners(): Promise<void> {
    if (!this.taskDefinitions) return;
    
    const allTasks = [
      ...this.taskDefinitions.prospecting_tasks,
      ...this.taskDefinitions.outreach_tasks,
      ...this.taskDefinitions.pipeline_tasks,
      ...this.taskDefinitions.analytics_tasks,
      ...this.taskDefinitions.maintenance_tasks
    ];

    for (const task of allTasks) {
      if (task.type === 'triggered' && task.enabled && task.trigger) {
        this.on(task.trigger, async (data: any) => {
          await this.executeTask(task, data);
        });
        
        logger.info(`Setup trigger listener: ${task.name} -> ${task.trigger}`);
      }
    }
  }

  /**
   * Execute a task with full lifecycle management
   */
  async executeTask(task: Task, triggerData?: any): Promise<TaskExecution> {
    const executionId = `${task.id}_${Date.now()}`;
    
    const execution: TaskExecution = {
      id: executionId,
      task_id: task.id,
      started_at: new Date(),
      status: 'running',
      attempt: 1
    };

    this.runningTasks.set(executionId, execution);
    this.taskHistory.push(execution);

    try {
      logger.info(`Executing task: ${task.name} (${task.id})`);
      
      // Check dependencies
      await this.checkDependencies(task);
      
      // Execute the task
      const result = await this.runTaskAgent(task, triggerData);
      
      // Process output as JSON
      const outputData = await this.processTaskOutput(task, result);
      
      // Update execution
      execution.status = 'completed';
      execution.completed_at = new Date();
      execution.result = result;
      execution.output_data = outputData;
      
      // Emit completion event
      this.emit('task_completed', { task, execution, outputData });
      
      logger.info(`Task completed: ${task.name}`);
      
    } catch (error) {
      execution.status = 'failed';
      execution.completed_at = new Date();
      execution.error = error.message;
      
      logger.error(`Task failed: ${task.name}`, error);
      
      // Handle retry logic
      if (task.retry_config && execution.attempt < task.retry_config.max_attempts) {
        setTimeout(() => {
          this.retryTask(task, execution);
        }, task.retry_config.backoff_seconds * 1000);
      } else {
        this.emit('task_failed', { task, execution, error });
      }
    } finally {
      this.runningTasks.delete(executionId);
    }

    return execution;
  }

  /**
   * Check if task dependencies are met
   */
  private async checkDependencies(task: Task): Promise<void> {
    if (!task.dependencies || task.dependencies.length === 0) return;
    
    for (const depId of task.dependencies) {
      const recentExecution = this.taskHistory
        .filter(exec => exec.task_id === depId && exec.status === 'completed')
        .sort((a, b) => b.started_at.getTime() - a.started_at.getTime())[0];
        
      if (!recentExecution) {
        throw new Error(`Dependency not met: ${depId} has not completed successfully`);
      }
      
      // Check if dependency execution is recent enough (within 24 hours)
      const age = Date.now() - recentExecution.completed_at!.getTime();
      if (age > 24 * 60 * 60 * 1000) {
        throw new Error(`Dependency too old: ${depId} last completed ${Math.round(age / 3600000)} hours ago`);
      }
    }
  }

  /**
   * Execute the actual task agent
   */
  private async runTaskAgent(task: Task, triggerData?: any): Promise<any> {
    // This will be extended to call specific agents based on task.agent
    logger.info(`Running agent: ${task.agent} for task: ${task.id}`);
    
    // For now, return mock success data
    // This will be replaced with actual agent execution
    return {
      agent: task.agent,
      task_id: task.id,
      config: task.config,
      trigger_data: triggerData,
      timestamp: new Date().toISOString(),
      status: 'success'
    };
  }

  /**
   * Process task output into JSON format before Obsidian insertion
   */
  private async processTaskOutput(task: Task, result: any): Promise<any> {
    const outputData = {
      task_id: task.id,
      task_name: task.name,
      execution_time: new Date().toISOString(),
      output_format: task.output.format,
      output_schema: task.output.schema,
      destination: task.output.destination,
      data: result,
      metadata: {
        agent: task.agent,
        config: task.config,
        version: this.taskDefinitions?.version
      }
    };

    // Save JSON output before processing to Obsidian
    await this.saveJSONOutput(task, outputData);
    
    return outputData;
  }

  /**
   * Save JSON output to file system
   */
  private async saveJSONOutput(task: Task, outputData: any): Promise<void> {
    const outputDir = path.resolve('data/output/json');
    await fs.mkdir(outputDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${task.id}_${timestamp}.json`;
    const filepath = path.join(outputDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(outputData, null, 2), 'utf8');
    
    logger.info(`Saved JSON output: ${filepath}`);
  }

  /**
   * Retry a failed task
   */
  private async retryTask(task: Task, execution: TaskExecution): Promise<void> {
    execution.attempt++;
    execution.status = 'retrying';
    execution.started_at = new Date();
    
    logger.info(`Retrying task: ${task.name} (attempt ${execution.attempt})`);
    
    await this.executeTask(task);
  }

  /**
   * Manually trigger a task by event name
   */
  async triggerTask(eventName: string, data?: any): Promise<void> {
    this.emit(eventName, data);
  }

  /**
   * Get task execution status
   */
  getTaskStatus(taskId?: string): TaskExecution[] {
    if (taskId) {
      return this.taskHistory.filter(exec => exec.task_id === taskId);
    }
    return [...this.taskHistory];
  }

  /**
   * Get currently running tasks
   */
  getRunningTasks(): TaskExecution[] {
    return Array.from(this.runningTasks.values());
  }

  /**
   * Stop all scheduled tasks
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down Task Manager...');
    
    for (const [taskId, job] of this.scheduledJobs) {
      job.stop();
      logger.info(`Stopped scheduled task: ${taskId}`);
    }
    
    this.scheduledJobs.clear();
    this.removeAllListeners();
    
    logger.info('Task Manager shutdown complete');
  }
}

export const taskManager = new TaskManager();