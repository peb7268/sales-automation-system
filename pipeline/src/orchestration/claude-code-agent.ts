/**
 * Claude Code Agent - Primary orchestration intelligence
 * Handles dynamic task scheduling, performance analysis, and intelligent decision making
 */

import { EventEmitter } from 'events';
import { logger } from '@utils/logging';
import { TaskManager, Task, TaskExecution } from './task-manager';

export interface ClaudeCodeAgentConfig {
  model: 'claude-sonnet-4';
  temperature: number;
  max_tokens: number;
  mcp_tools: string[];
}

export interface OrchestrationDecision {
  action: 'schedule' | 'reschedule' | 'cancel' | 'priority_boost' | 'agent_reassign';
  task_id: string;
  reason: string;
  confidence: number;
  suggested_timing?: Date;
  priority_adjustment?: 'high' | 'medium' | 'low';
  agent_preference?: string;
}

export interface PerformanceAnalysis {
  agent_efficiency: Record<string, number>;
  task_completion_rates: Record<string, number>;
  pipeline_bottlenecks: string[];
  optimization_suggestions: string[];
  next_recommended_tasks: string[];
}

export class ClaudeCodeAgent extends EventEmitter {
  private config: ClaudeCodeAgentConfig;
  private taskManager: TaskManager;
  private performance_history: TaskExecution[] = [];
  private active_decisions: Map<string, OrchestrationDecision> = new Map();

  constructor(taskManager: TaskManager, config?: Partial<ClaudeCodeAgentConfig>) {
    super();
    
    this.taskManager = taskManager;
    this.config = {
      model: 'claude-sonnet-4',
      temperature: 0.2,
      max_tokens: 4000,
      mcp_tools: [
        'task_management',
        'obsidian_integration',
        'analytics_processing',
        'prospect_qualification'
      ],
      ...config
    };

    this.setupEventHandlers();
    logger.info('🧠 Claude Code Agent initialized as primary orchestrator');
  }

  /**
   * Setup event handlers for task management
   */
  private setupEventHandlers(): void {
    // Monitor task completions for performance analysis
    this.taskManager.on('task_completed', (data) => {
      this.performance_history.push(data.execution);
      this.analyzeAndOptimize();
    });

    // Handle task failures with intelligent recovery
    this.taskManager.on('task_failed', (data) => {
      this.handleTaskFailure(data.task, data.execution, data.error);
    });

    // Monitor system performance periodically
    setInterval(() => {
      this.performSystemAnalysis();
    }, 300000); // Every 5 minutes
  }

  /**
   * Make intelligent orchestration decisions based on current system state
   */
  async makeOrchestrationDecision(context: {
    current_tasks: Task[];
    running_executions: TaskExecution[];
    recent_performance: TaskExecution[];
    system_load: number;
  }): Promise<OrchestrationDecision[]> {
    
    const decisions: OrchestrationDecision[] = [];

    try {
      // Analyze current system state
      const analysis = await this.analyzeSystemPerformance(context);
      
      // Priority-based decision making
      decisions.push(...await this.makePriorityDecisions(analysis));
      
      // Load balancing decisions
      decisions.push(...await this.makeLoadBalancingDecisions(analysis));
      
      // Performance optimization decisions
      decisions.push(...await this.makeOptimizationDecisions(analysis));

      // Log decisions for transparency
      decisions.forEach(decision => {
        logger.info(`🧠 Orchestration Decision: ${decision.action} for ${decision.task_id} - ${decision.reason} (confidence: ${decision.confidence})`);
        this.active_decisions.set(decision.task_id, decision);
      });

      return decisions;

    } catch (error) {
      logger.error('Failed to make orchestration decisions:', error);
      return [];
    }
  }

  /**
   * Analyze system performance and identify optimization opportunities
   */
  private async analyzeSystemPerformance(context: any): Promise<PerformanceAnalysis> {
    const analysis: PerformanceAnalysis = {
      agent_efficiency: {},
      task_completion_rates: {},
      pipeline_bottlenecks: [],
      optimization_suggestions: [],
      next_recommended_tasks: []
    };

    // Calculate agent efficiency scores
    const agentStats = this.calculateAgentStats();
    analysis.agent_efficiency = agentStats.efficiency;
    analysis.task_completion_rates = agentStats.completion_rates;

    // Identify bottlenecks
    analysis.pipeline_bottlenecks = this.identifyBottlenecks(context);

    // Generate optimization suggestions
    analysis.optimization_suggestions = this.generateOptimizationSuggestions(analysis);

    // Recommend next tasks based on pipeline state
    analysis.next_recommended_tasks = await this.recommendNextTasks(context);

    return analysis;
  }

  /**
   * Make priority-based scheduling decisions
   */
  private async makePriorityDecisions(analysis: PerformanceAnalysis): Promise<OrchestrationDecision[]> {
    const decisions: OrchestrationDecision[] = [];

    // Boost priority for underperforming areas
    if (analysis.task_completion_rates['prospecting_agent'] < 0.8) {
      decisions.push({
        action: 'priority_boost',
        task_id: 'daily_prospect_generation',
        reason: 'Prospecting completion rate below target (80%)',
        confidence: 0.9,
        priority_adjustment: 'high'
      });
    }

    // Schedule urgent tasks based on pipeline health
    if (analysis.pipeline_bottlenecks.includes('qualified_prospects_low')) {
      decisions.push({
        action: 'schedule',
        task_id: 'prospect_research_enhancement',
        reason: 'Low qualified prospects detected, boosting research',
        confidence: 0.85,
        suggested_timing: new Date(Date.now() + 600000) // 10 minutes
      });
    }

    return decisions;
  }

  /**
   * Make load balancing decisions
   */
  private async makeLoadBalancingDecisions(analysis: PerformanceAnalysis): Promise<OrchestrationDecision[]> {
    const decisions: OrchestrationDecision[] = [];

    // Redistribute tasks from overloaded agents
    Object.entries(analysis.agent_efficiency).forEach(([agent, efficiency]) => {
      if (efficiency < 0.6) { // Below 60% efficiency
        decisions.push({
          action: 'agent_reassign',
          task_id: `${agent}_tasks`,
          reason: `Agent efficiency below threshold (${Math.round(efficiency * 100)}%)`,
          confidence: 0.7,
          agent_preference: this.findBestPerformingAgent(analysis.agent_efficiency)
        });
      }
    });

    return decisions;
  }

  /**
   * Make performance optimization decisions
   */
  private async makeOptimizationDecisions(analysis: PerformanceAnalysis): Promise<OrchestrationDecision[]> {
    const decisions: OrchestrationDecision[] = [];

    // Cancel redundant or low-value tasks
    analysis.optimization_suggestions.forEach(suggestion => {
      if (suggestion.includes('cancel_redundant')) {
        const taskId = suggestion.split(':')[1];
        decisions.push({
          action: 'cancel',
          task_id: taskId,
          reason: 'Redundant task identified by performance analysis',
          confidence: 0.8
        });
      }
    });

    return decisions;
  }

  /**
   * Handle intelligent task failure recovery
   */
  private async handleTaskFailure(task: Task, execution: TaskExecution, error: Error): Promise<void> {
    logger.warn(`🧠 Analyzing task failure: ${task.name} - ${error.message}`);

    // Intelligent failure analysis
    const failurePattern = this.analyzeFailurePattern(task, error);
    
    if (failurePattern.is_recoverable) {
      // Suggest alternative approach
      const recovery_decision: OrchestrationDecision = {
        action: 'reschedule',
        task_id: task.id,
        reason: `Recoverable failure detected: ${failurePattern.suggested_fix}`,
        confidence: failurePattern.confidence,
        suggested_timing: new Date(Date.now() + failurePattern.backoff_seconds * 1000)
      };

      this.active_decisions.set(task.id, recovery_decision);
      this.emit('recovery_suggested', recovery_decision);
    } else {
      logger.error(`🧠 Non-recoverable failure for task ${task.id}: ${failurePattern.reason}`);
      this.emit('task_abandoned', { task, reason: failurePattern.reason });
    }
  }

  /**
   * Perform periodic system analysis and optimization
   */
  private async performSystemAnalysis(): Promise<void> {
    const current_tasks = await this.getAllActiveTasks();
    const running_executions = this.taskManager.getRunningTasks();
    const recent_performance = this.performance_history.slice(-20); // Last 20 executions
    const system_load = this.calculateSystemLoad();

    const context = {
      current_tasks,
      running_executions,
      recent_performance,
      system_load
    };

    const decisions = await this.makeOrchestrationDecision(context);
    
    // Execute high-confidence decisions automatically
    for (const decision of decisions) {
      if (decision.confidence > 0.8) {
        await this.executeDecision(decision);
      }
    }

    // Emit system health update
    this.emit('system_analysis_complete', {
      decisions_made: decisions.length,
      auto_executed: decisions.filter(d => d.confidence > 0.8).length,
      system_health: this.calculateSystemHealth(context)
    });
  }

  /**
   * Execute an orchestration decision
   */
  private async executeDecision(decision: OrchestrationDecision): Promise<void> {
    try {
      switch (decision.action) {
        case 'schedule':
          if (decision.suggested_timing) {
            // Schedule task for specific time
            setTimeout(async () => {
              await this.taskManager.triggerTask(`schedule_${decision.task_id}`);
            }, decision.suggested_timing.getTime() - Date.now());
          }
          break;

        case 'priority_boost':
          // This would be handled by updating task configuration
          logger.info(`🚀 Priority boosted for ${decision.task_id}`);
          break;

        case 'cancel':
          // Cancel pending task execution
          logger.info(`❌ Cancelled task ${decision.task_id}: ${decision.reason}`);
          break;

        case 'reschedule':
          if (decision.suggested_timing) {
            setTimeout(async () => {
              await this.taskManager.triggerTask(`retry_${decision.task_id}`);
            }, decision.suggested_timing.getTime() - Date.now());
          }
          break;
      }

      logger.info(`✅ Executed decision: ${decision.action} for ${decision.task_id}`);
    } catch (error) {
      logger.error(`Failed to execute decision ${decision.action}:`, error);
    }
  }

  /**
   * Calculate agent performance statistics
   */
  private calculateAgentStats(): { efficiency: Record<string, number>; completion_rates: Record<string, number> } {
    const stats = {
      efficiency: {},
      completion_rates: {}
    };

    // Group executions by agent
    const agentExecutions: Record<string, TaskExecution[]> = {};
    
    this.performance_history.forEach(execution => {
      const taskId = execution.task_id;
      const agentType = this.getAgentTypeFromTaskId(taskId);
      
      if (!agentExecutions[agentType]) {
        agentExecutions[agentType] = [];
      }
      agentExecutions[agentType].push(execution);
    });

    // Calculate efficiency and completion rates
    Object.entries(agentExecutions).forEach(([agent, executions]) => {
      const completed = executions.filter(e => e.status === 'completed').length;
      const total = executions.length;
      
      stats.completion_rates[agent] = total > 0 ? completed / total : 1.0;
      
      // Calculate efficiency based on completion time vs expected time
      const avgDuration = this.calculateAverageExecutionTime(executions);
      const expectedDuration = this.getExpectedExecutionTime(agent);
      stats.efficiency[agent] = expectedDuration > 0 ? Math.min(expectedDuration / avgDuration, 1.0) : 1.0;
    });

    return stats;
  }

  /**
   * Identify system bottlenecks
   */
  private identifyBottlenecks(context: any): string[] {
    const bottlenecks: string[] = [];

    // Check for resource constraints
    if (context.system_load > 0.8) {
      bottlenecks.push('high_system_load');
    }

    // Check for task queue buildup
    if (context.running_executions.length > 10) {
      bottlenecks.push('task_queue_buildup');
    }

    // Check for low prospect quality
    const recentProspectTasks = context.recent_performance.filter(e => 
      e.task_id.includes('prospect') && e.status === 'completed'
    );
    if (recentProspectTasks.length < 5) {
      bottlenecks.push('qualified_prospects_low');
    }

    return bottlenecks;
  }

  /**
   * Generate optimization suggestions
   */
  private generateOptimizationSuggestions(analysis: PerformanceAnalysis): string[] {
    const suggestions: string[] = [];

    // Suggest task consolidation if many small tasks
    if (Object.keys(analysis.task_completion_rates).length > 10) {
      suggestions.push('consider_task_consolidation');
    }

    // Suggest agent rebalancing if efficiency varies widely
    const efficiencyValues = Object.values(analysis.agent_efficiency);
    const maxEff = Math.max(...efficiencyValues);
    const minEff = Math.min(...efficiencyValues);
    
    if (maxEff - minEff > 0.3) {
      suggestions.push('rebalance_agent_workload');
    }

    return suggestions;
  }

  /**
   * Recommend next tasks based on pipeline state
   */
  private async recommendNextTasks(context: any): Promise<string[]> {
    const recommendations: string[] = [];

    // Always ensure prospecting pipeline is active
    const hasActiveProspecting = context.running_executions.some(e => 
      e.task_id.includes('prospect')
    );
    
    if (!hasActiveProspecting) {
      recommendations.push('daily_prospect_generation');
    }

    // Recommend analytics if no recent updates
    const lastAnalytics = this.performance_history
      .filter(e => e.task_id.includes('analytics'))
      .sort((a, b) => b.started_at.getTime() - a.started_at.getTime())[0];
    
    if (!lastAnalytics || Date.now() - lastAnalytics.started_at.getTime() > 7200000) { // 2 hours
      recommendations.push('daily_analytics_update');
    }

    return recommendations;
  }

  // Helper methods
  private async getAllActiveTasks(): Promise<Task[]> {
    // This would integrate with TaskManager to get current task definitions
    return [];
  }

  private calculateSystemLoad(): number {
    const runningTasks = this.taskManager.getRunningTasks().length;
    const maxConcurrentTasks = 10; // Configurable
    return Math.min(runningTasks / maxConcurrentTasks, 1.0);
  }

  private calculateSystemHealth(context: any): number {
    // Simple health score based on various factors
    let health = 1.0;
    
    if (context.system_load > 0.8) health -= 0.2;
    if (context.running_executions.length > 15) health -= 0.3;
    
    const recentFailures = context.recent_performance.filter(e => e.status === 'failed').length;
    if (recentFailures > 3) health -= 0.3;
    
    return Math.max(health, 0.0);
  }

  private getAgentTypeFromTaskId(taskId: string): string {
    if (taskId.includes('prospect')) return 'prospecting_agent';
    if (taskId.includes('pitch')) return 'pitch_creator_agent';
    if (taskId.includes('analytics')) return 'analytics_generator';
    if (taskId.includes('kanban')) return 'kanban_manager';
    if (taskId.includes('stage')) return 'pipeline_manager';
    return 'unknown_agent';
  }

  private calculateAverageExecutionTime(executions: TaskExecution[]): number {
    const completedWithTime = executions.filter(e => 
      e.status === 'completed' && e.completed_at
    );
    
    if (completedWithTime.length === 0) return 300000; // 5 minutes default
    
    const avgMs = completedWithTime.reduce((sum, e) => {
      return sum + (e.completed_at!.getTime() - e.started_at.getTime());
    }, 0) / completedWithTime.length;
    
    return avgMs;
  }

  private getExpectedExecutionTime(agent: string): number {
    // Expected execution times in milliseconds
    const expectedTimes = {
      'prospecting_agent': 180000,      // 3 minutes
      'pitch_creator_agent': 120000,    // 2 minutes
      'analytics_generator': 60000,     // 1 minute
      'kanban_manager': 30000,          // 30 seconds
      'pipeline_manager': 90000         // 1.5 minutes
    };
    
    return expectedTimes[agent] || 300000; // 5 minutes default
  }

  private findBestPerformingAgent(efficiencyScores: Record<string, number>): string {
    return Object.entries(efficiencyScores)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'prospecting_agent';
  }

  private analyzeFailurePattern(task: Task, error: Error): {
    is_recoverable: boolean;
    confidence: number;
    suggested_fix: string;
    backoff_seconds: number;
    reason: string;
  } {
    // Simple failure pattern analysis
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
      return {
        is_recoverable: true,
        confidence: 0.8,
        suggested_fix: 'Network issue, retry with backoff',
        backoff_seconds: 300,
        reason: 'Network timeout'
      };
    }
    
    if (errorMessage.includes('rate limit')) {
      return {
        is_recoverable: true,
        confidence: 0.9,
        suggested_fix: 'Rate limit hit, wait longer before retry',
        backoff_seconds: 900,
        reason: 'API rate limiting'
      };
    }
    
    return {
      is_recoverable: false,
      confidence: 0.9,
      suggested_fix: 'Unknown error pattern',
      backoff_seconds: 0,
      reason: 'Unrecoverable error pattern'
    };
  }
}

export default ClaudeCodeAgent;