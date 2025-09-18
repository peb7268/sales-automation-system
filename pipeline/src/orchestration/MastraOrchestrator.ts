import { MastraAgentBase } from '../agents/mastra/MastraAgentBase';
import { MastraProspectingAgent, mastraProspectingAgent } from '../agents/mastra/MastraProspectingAgent';
import { MastraPitchCreatorAgent, mastraPitchCreatorAgent } from '../agents/mastra/MastraPitchCreatorAgent';
import { Logger } from '../utils/logging';
import { GeographicFilter, ProspectingResults, ProspectData } from '../types/prospect';

export interface AgentStatus {
  name: string;
  initialized: boolean;
  toolCount: number;
  model: string;
  lastExecuted?: Date;
  executionCount: number;
  averageExecutionTime: number;
}

export interface OrchestrationTask {
  id: string;
  type: 'prospecting' | 'pitch_generation' | 'combined_workflow';
  priority: 'high' | 'medium' | 'low';
  data: any;
  createdAt: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  executionTime?: number;
}

export interface WorkflowResult {
  success: boolean;
  taskId: string;
  result?: any;
  error?: string;
  executionTime: number;
  agentsUsed: string[];
}

/**
 * Enhanced Agent Orchestrator using Mastra framework
 * Coordinates multiple AI agents for comprehensive sales automation workflows
 */
export class MastraOrchestrator {
  private logger: Logger;
  private agents: Map<string, MastraAgentBase> = new Map();
  private tasks: Map<string, OrchestrationTask> = new Map();
  private initialized = false;
  private running = false;
  private executionMetrics: Map<string, { count: number; totalTime: number; lastExecuted: Date }> = new Map();

  constructor() {
    this.logger = new Logger('MastraOrchestrator', 'orchestration');
    this.initializeAgents();
  }

  /**
   * Initialize all Mastra agents
   */
  private initializeAgents(): void {
    try {
      // Initialize prospecting agent
      this.agents.set('prospecting', mastraProspectingAgent);
      
      // Initialize pitch creator agent
      this.agents.set('pitch_creator', mastraPitchCreatorAgent);

      this.logger.info('Mastra agents initialized', {
        agentCount: this.agents.size,
        agents: Array.from(this.agents.keys())
      });

    } catch (error) {
      this.logger.error('Failed to initialize Mastra agents', { error: error.message });
      throw error;
    }
  }

  /**
   * Initialize the orchestrator
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('Mastra Orchestrator already initialized');
      return;
    }

    try {
      this.logger.info('Initializing Mastra Orchestrator...');

      // Verify all agents are initialized
      for (const [name, agent] of this.agents) {
        const status = agent.getStatus();
        if (!status.initialized) {
          throw new Error(`Agent ${name} failed to initialize`);
        }
        this.logger.info(`Agent ${name} ready`, { 
          toolCount: status.toolCount,
          model: status.model
        });
      }

      this.initialized = true;
      this.logger.info('Mastra Orchestrator initialized successfully', {
        agentCount: this.agents.size
      });

    } catch (error) {
      this.logger.error('Failed to initialize Mastra Orchestrator', { error: error.message });
      throw error;
    }
  }

  /**
   * Start the orchestrator
   */
  async start(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Mastra Orchestrator must be initialized before starting');
    }

    if (this.running) {
      this.logger.warn('Mastra Orchestrator already running');
      return;
    }

    try {
      this.logger.info('Starting Mastra Orchestrator...');

      // Start monitoring and maintenance tasks
      this.startMaintenanceTasks();

      this.running = true;
      this.logger.info('Mastra Orchestrator started successfully');

    } catch (error) {
      this.logger.error('Failed to start Mastra Orchestrator', { error: error.message });
      throw error;
    }
  }

  /**
   * Stop the orchestrator
   */
  async stop(): Promise<void> {
    if (!this.running) {
      this.logger.warn('Mastra Orchestrator not running');
      return;
    }

    try {
      this.logger.info('Stopping Mastra Orchestrator...');

      // Stop any running tasks (if applicable)
      // Clear pending tasks
      this.tasks.clear();

      this.running = false;
      this.logger.info('Mastra Orchestrator stopped successfully');

    } catch (error) {
      this.logger.error('Failed to stop Mastra Orchestrator', { error: error.message });
      throw error;
    }
  }

  /**
   * Execute prospecting workflow using Mastra agents
   */
  async executeProspectingWorkflow(params: GeographicFilter): Promise<WorkflowResult> {
    const taskId = this.generateTaskId('prospecting');
    const startTime = Date.now();

    this.logger.info('Starting Mastra prospecting workflow', { taskId, params });

    try {
      // Create task record
      const task: OrchestrationTask = {
        id: taskId,
        type: 'prospecting',
        priority: 'medium',
        data: params,
        createdAt: new Date(),
        status: 'running'
      };
      this.tasks.set(taskId, task);

      // Execute using prospecting agent
      const prospectingAgent = this.agents.get('prospecting') as MastraProspectingAgent;
      if (!prospectingAgent) {
        throw new Error('Prospecting agent not available');
      }

      // Execute the prospecting workflow
      const result = await prospectingAgent.prospect(params);

      // Update task status
      task.status = 'completed';
      task.result = result;
      task.executionTime = Date.now() - startTime;

      // Update metrics
      this.updateExecutionMetrics('prospecting', task.executionTime);

      this.logger.info('Mastra prospecting workflow completed', {
        taskId,
        executionTime: task.executionTime,
        prospectsFound: result.totalFound,
        qualified: result.qualified
      });

      return {
        success: true,
        taskId,
        result,
        executionTime: task.executionTime,
        agentsUsed: ['prospecting']
      };

    } catch (error) {
      // Update task status
      const task = this.tasks.get(taskId);
      if (task) {
        task.status = 'failed';
        task.error = error.message;
        task.executionTime = Date.now() - startTime;
      }

      this.logger.error('Mastra prospecting workflow failed', { 
        taskId,
        error: error.message 
      });

      return {
        success: false,
        taskId,
        error: error.message,
        executionTime: Date.now() - startTime,
        agentsUsed: ['prospecting']
      };
    }
  }

  /**
   * Execute pitch generation workflow using Mastra agents
   */
  async executePitchGeneration(prospectFolder: string, options: any = {}): Promise<WorkflowResult> {
    const taskId = this.generateTaskId('pitch_generation');
    const startTime = Date.now();

    this.logger.info('Starting Mastra pitch generation workflow', { 
      taskId, 
      prospectFolder,
      options
    });

    try {
      // Create task record
      const task: OrchestrationTask = {
        id: taskId,
        type: 'pitch_generation',
        priority: 'medium',
        data: { prospectFolder, options },
        createdAt: new Date(),
        status: 'running'
      };
      this.tasks.set(taskId, task);

      // Execute using pitch creator agent
      const pitchAgent = this.agents.get('pitch_creator') as MastraPitchCreatorAgent;
      if (!pitchAgent) {
        throw new Error('Pitch creator agent not available');
      }

      // Execute the pitch generation workflow
      const result = await pitchAgent.generatePitch(prospectFolder, options);

      // Update task status
      task.status = result.success ? 'completed' : 'failed';
      task.result = result;
      task.error = result.error;
      task.executionTime = Date.now() - startTime;

      // Update metrics
      this.updateExecutionMetrics('pitch_generation', task.executionTime);

      this.logger.info('Mastra pitch generation workflow completed', {
        taskId,
        success: result.success,
        executionTime: task.executionTime,
        pitchPath: result.pitchPath
      });

      return {
        success: result.success,
        taskId,
        result,
        error: result.error,
        executionTime: task.executionTime,
        agentsUsed: ['pitch_creator']
      };

    } catch (error) {
      // Update task status
      const task = this.tasks.get(taskId);
      if (task) {
        task.status = 'failed';
        task.error = error.message;
        task.executionTime = Date.now() - startTime;
      }

      this.logger.error('Mastra pitch generation workflow failed', { 
        taskId,
        error: error.message 
      });

      return {
        success: false,
        taskId,
        error: error.message,
        executionTime: Date.now() - startTime,
        agentsUsed: ['pitch_creator']
      };
    }
  }

  /**
   * Execute combined workflow: prospecting + pitch generation
   */
  async executeCombinedWorkflow(params: GeographicFilter, pitchOptions: any = {}): Promise<WorkflowResult> {
    const taskId = this.generateTaskId('combined_workflow');
    const startTime = Date.now();

    this.logger.info('Starting Mastra combined workflow', { 
      taskId, 
      params,
      pitchOptions
    });

    try {
      // Create task record
      const task: OrchestrationTask = {
        id: taskId,
        type: 'combined_workflow',
        priority: 'high',
        data: { params, pitchOptions },
        createdAt: new Date(),
        status: 'running'
      };
      this.tasks.set(taskId, task);

      const results = {
        prospecting: null as any,
        pitchGeneration: [] as any[],
        summary: {
          totalProspects: 0,
          qualifiedProspects: 0,
          pitchesGenerated: 0,
          errors: [] as string[]
        }
      };

      // Step 1: Execute prospecting workflow
      this.logger.info('Executing prospecting phase', { taskId });
      const prospectingResult = await this.executeProspectingWorkflow(params);
      
      if (!prospectingResult.success) {
        throw new Error(`Prospecting failed: ${prospectingResult.error}`);
      }

      results.prospecting = prospectingResult.result;
      results.summary.totalProspects = prospectingResult.result.totalFound;
      results.summary.qualifiedProspects = prospectingResult.result.qualified;

      // Step 2: Generate pitches for qualified prospects
      this.logger.info('Executing pitch generation phase', { 
        taskId,
        qualifiedProspects: results.summary.qualifiedProspects
      });

      if (results.summary.qualifiedProspects > 0) {
        // For each qualified prospect, generate a pitch
        const pitchAgent = this.agents.get('pitch_creator') as MastraPitchCreatorAgent;
        
        for (const prospect of prospectingResult.result.prospects) {
          try {
            // Create a folder name for the prospect
            const folderName = this.generateProspectFolderName(prospect);
            
            // Generate pitch
            const pitchResult = await pitchAgent.generatePitch(folderName, pitchOptions);
            results.pitchGeneration.push({
              prospect: prospect.business.name,
              success: pitchResult.success,
              pitchPath: pitchResult.pitchPath,
              error: pitchResult.error
            });

            if (pitchResult.success) {
              results.summary.pitchesGenerated++;
            } else {
              results.summary.errors.push(`Pitch generation failed for ${prospect.business.name}: ${pitchResult.error}`);
            }

          } catch (error) {
            results.summary.errors.push(`Pitch generation error for ${prospect.business.name}: ${error.message}`);
          }
        }
      }

      // Update task status
      task.status = 'completed';
      task.result = results;
      task.executionTime = Date.now() - startTime;

      // Update metrics
      this.updateExecutionMetrics('combined_workflow', task.executionTime);

      this.logger.info('Mastra combined workflow completed', {
        taskId,
        executionTime: task.executionTime,
        totalProspects: results.summary.totalProspects,
        qualifiedProspects: results.summary.qualifiedProspects,
        pitchesGenerated: results.summary.pitchesGenerated,
        errors: results.summary.errors.length
      });

      return {
        success: true,
        taskId,
        result: results,
        executionTime: task.executionTime,
        agentsUsed: ['prospecting', 'pitch_creator']
      };

    } catch (error) {
      // Update task status
      const task = this.tasks.get(taskId);
      if (task) {
        task.status = 'failed';
        task.error = error.message;
        task.executionTime = Date.now() - startTime;
      }

      this.logger.error('Mastra combined workflow failed', { 
        taskId,
        error: error.message 
      });

      return {
        success: false,
        taskId,
        error: error.message,
        executionTime: Date.now() - startTime,
        agentsUsed: ['prospecting', 'pitch_creator']
      };
    }
  }

  /**
   * Execute batch pitch generation for all prospects
   */
  async executeBatchPitchGeneration(): Promise<WorkflowResult> {
    const taskId = this.generateTaskId('batch_pitch_generation');
    const startTime = Date.now();

    this.logger.info('Starting Mastra batch pitch generation', { taskId });

    try {
      const pitchAgent = this.agents.get('pitch_creator') as MastraPitchCreatorAgent;
      if (!pitchAgent) {
        throw new Error('Pitch creator agent not available');
      }

      const result = await pitchAgent.generateAllPitches();

      const executionTime = Date.now() - startTime;
      this.updateExecutionMetrics('batch_pitch_generation', executionTime);

      this.logger.info('Mastra batch pitch generation completed', {
        taskId,
        success: result.success,
        executionTime,
        resultsCount: result.results.length
      });

      return {
        success: result.success,
        taskId,
        result,
        executionTime,
        agentsUsed: ['pitch_creator']
      };

    } catch (error) {
      this.logger.error('Mastra batch pitch generation failed', { 
        taskId,
        error: error.message 
      });

      return {
        success: false,
        taskId,
        error: error.message,
        executionTime: Date.now() - startTime,
        agentsUsed: ['pitch_creator']
      };
    }
  }

  /**
   * Get comprehensive orchestrator status
   */
  getStatus(): {
    initialized: boolean;
    running: boolean;
    agentCount: number;
    activeTasks: number;
    completedTasks: number;
    failedTasks: number;
    agents: AgentStatus[];
  } {
    const agents: AgentStatus[] = [];
    
    for (const [name, agent] of this.agents) {
      const agentStatus = agent.getStatus();
      const metrics = this.executionMetrics.get(name);
      
      agents.push({
        name,
        initialized: agentStatus.initialized,
        toolCount: agentStatus.toolCount,
        model: agentStatus.model,
        lastExecuted: metrics?.lastExecuted,
        executionCount: metrics?.count || 0,
        averageExecutionTime: metrics ? metrics.totalTime / metrics.count : 0
      });
    }

    const activeTasks = Array.from(this.tasks.values()).filter(task => task.status === 'running').length;
    const completedTasks = Array.from(this.tasks.values()).filter(task => task.status === 'completed').length;
    const failedTasks = Array.from(this.tasks.values()).filter(task => task.status === 'failed').length;

    return {
      initialized: this.initialized,
      running: this.running,
      agentCount: this.agents.size,
      activeTasks,
      completedTasks,
      failedTasks,
      agents
    };
  }

  /**
   * Get task status and history
   */
  getTaskHistory(limit: number = 100): OrchestrationTask[] {
    return Array.from(this.tasks.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get specific task details
   */
  getTask(taskId: string): OrchestrationTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get agent by name
   */
  getAgent(name: string): MastraAgentBase | undefined {
    return this.agents.get(name);
  }

  /**
   * Execute custom agent workflow
   */
  async executeCustomAgentWorkflow(
    agentName: string, 
    data: any, 
    prompt?: string
  ): Promise<WorkflowResult> {
    const taskId = this.generateTaskId('custom_agent');
    const startTime = Date.now();

    this.logger.info('Starting custom agent workflow', { 
      taskId, 
      agentName,
      hasPrompt: !!prompt
    });

    try {
      const agent = this.agents.get(agentName);
      if (!agent) {
        throw new Error(`Agent ${agentName} not found`);
      }

      const result = await agent.executeWithData(data, prompt);

      const executionTime = Date.now() - startTime;
      this.updateExecutionMetrics(`custom_${agentName}`, executionTime);

      this.logger.info('Custom agent workflow completed', {
        taskId,
        agentName,
        executionTime
      });

      return {
        success: true,
        taskId,
        result,
        executionTime,
        agentsUsed: [agentName]
      };

    } catch (error) {
      this.logger.error('Custom agent workflow failed', { 
        taskId,
        agentName,
        error: error.message 
      });

      return {
        success: false,
        taskId,
        error: error.message,
        executionTime: Date.now() - startTime,
        agentsUsed: [agentName]
      };
    }
  }

  // Private helper methods

  private generateTaskId(type: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${type}_${timestamp}_${random}`;
  }

  private generateProspectFolderName(prospect: any): string {
    const businessName = prospect.business?.name || prospect.businessName || 'unknown_business';
    return businessName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substr(0, 50);
  }

  private updateExecutionMetrics(operation: string, executionTime: number): void {
    const current = this.executionMetrics.get(operation) || { 
      count: 0, 
      totalTime: 0, 
      lastExecuted: new Date() 
    };
    
    current.count++;
    current.totalTime += executionTime;
    current.lastExecuted = new Date();
    
    this.executionMetrics.set(operation, current);
  }

  private startMaintenanceTasks(): void {
    // Clean up old tasks periodically
    setInterval(() => {
      this.cleanupOldTasks();
    }, 300000); // Every 5 minutes

    // Log status periodically
    setInterval(() => {
      const status = this.getStatus();
      this.logger.info('Orchestrator status update', {
        activeTasks: status.activeTasks,
        completedTasks: status.completedTasks,
        failedTasks: status.failedTasks
      });
    }, 60000); // Every minute
  }

  private cleanupOldTasks(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    let removedCount = 0;

    for (const [taskId, task] of this.tasks) {
      if (task.createdAt.getTime() < cutoffTime && task.status !== 'running') {
        this.tasks.delete(taskId);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.logger.info('Cleaned up old tasks', { removedCount });
    }
  }
}

// Export singleton instance
export const mastraOrchestrator = new MastraOrchestrator();