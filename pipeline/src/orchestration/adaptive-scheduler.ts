/**
 * Adaptive Scheduler - Intelligent task scheduling with ML-based optimization
 * Learns from historical performance to optimize task timing and resource allocation
 */

import { EventEmitter } from 'events';
import { logger } from '@utils/logging';
import { Task, TaskExecution } from './task-manager';

export interface SchedulingPattern {
  task_type: string;
  optimal_hour: number;
  optimal_day_of_week: number;
  success_rate: number;
  avg_duration_ms: number;
  resource_usage: number;
  confidence: number;
}

export interface SystemLoad {
  cpu_usage: number;
  memory_usage: number;
  active_tasks: number;
  queue_depth: number;
  timestamp: Date;
}

export interface SchedulingDecision {
  task_id: string;
  recommended_time: Date;
  priority_adjustment: 'boost' | 'maintain' | 'defer';
  reason: string;
  confidence: number;
  resource_requirements: {
    cpu: number;
    memory: number;
    io: number;
  };
}

export class AdaptiveScheduler extends EventEmitter {
  private schedulingPatterns: Map<string, SchedulingPattern> = new Map();
  private executionHistory: TaskExecution[] = [];
  private systemLoadHistory: SystemLoad[] = [];
  private learningInterval: NodeJS.Timeout | null = null;
  private loadMonitorInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.startLearningProcess();
    this.startLoadMonitoring();
    logger.info('🧠 Adaptive Scheduler initialized with ML-based optimization');
  }

  /**
   * Start the continuous learning process
   */
  private startLearningProcess(): void {
    this.learningInterval = setInterval(() => {
      this.analyzePatternsAndOptimize();
    }, 300000); // Every 5 minutes
  }

  /**
   * Start system load monitoring
   */
  private startLoadMonitoring(): void {
    this.loadMonitorInterval = setInterval(() => {
      this.recordSystemLoad();
    }, 30000); // Every 30 seconds
  }

  /**
   * Add task execution to history for learning
   */
  addTaskExecution(execution: TaskExecution): void {
    this.executionHistory.push(execution);
    
    // Keep only last 1000 executions to prevent memory bloat
    if (this.executionHistory.length > 1000) {
      this.executionHistory = this.executionHistory.slice(-1000);
    }

    // Trigger immediate learning if we have enough data
    if (this.executionHistory.length % 50 === 0) {
      this.analyzePatternsAndOptimize();
    }
  }

  /**
   * Get optimal scheduling recommendation for a task
   */
  async getSchedulingRecommendation(task: Task, urgency: 'low' | 'medium' | 'high' = 'medium'): Promise<SchedulingDecision> {
    const pattern = this.schedulingPatterns.get(task.type) || await this.createInitialPattern(task);
    const currentLoad = await this.getCurrentSystemLoad();
    const optimalTime = this.calculateOptimalTime(pattern, currentLoad, urgency);
    
    const decision: SchedulingDecision = {
      task_id: task.id,
      recommended_time: optimalTime,
      priority_adjustment: this.determinePriorityAdjustment(pattern, currentLoad, urgency),
      reason: this.generateSchedulingReason(pattern, currentLoad, urgency),
      confidence: pattern.confidence,
      resource_requirements: this.estimateResourceRequirements(pattern)
    };

    logger.debug(`📅 Scheduling recommendation for ${task.id}: ${decision.recommended_time.toISOString()} (confidence: ${decision.confidence})`);
    
    return decision;
  }

  /**
   * Analyze historical patterns and optimize scheduling
   */
  private analyzePatternsAndOptimize(): void {
    if (this.executionHistory.length < 10) return; // Need minimum data

    const taskTypes = [...new Set(this.executionHistory.map(e => this.getTaskType(e.task_id)))];
    
    for (const taskType of taskTypes) {
      const typeExecutions = this.executionHistory.filter(e => 
        this.getTaskType(e.task_id) === taskType
      );
      
      if (typeExecutions.length >= 5) { // Minimum executions for pattern analysis
        const pattern = this.analyzeTaskTypePattern(taskType, typeExecutions);
        this.schedulingPatterns.set(taskType, pattern);
        
        logger.debug(`📊 Updated pattern for ${taskType}: success rate ${Math.round(pattern.success_rate * 100)}%`);
      }
    }

    this.emit('patterns_updated', {
      patterns: Array.from(this.schedulingPatterns.entries()),
      total_executions: this.executionHistory.length
    });
  }

  /**
   * Analyze pattern for specific task type
   */
  private analyzeTaskTypePattern(taskType: string, executions: TaskExecution[]): SchedulingPattern {
    const completedExecutions = executions.filter(e => e.status === 'completed');
    const successRate = completedExecutions.length / executions.length;
    
    // Calculate optimal timing based on successful executions
    const successfulTimes = completedExecutions.map(e => e.started_at);
    const optimalHour = this.findOptimalHour(successfulTimes);
    const optimalDayOfWeek = this.findOptimalDayOfWeek(successfulTimes);
    
    // Calculate average duration
    const avgDuration = completedExecutions.reduce((sum, e) => {
      const duration = e.completed_at ? 
        e.completed_at.getTime() - e.started_at.getTime() : 0;
      return sum + duration;
    }, 0) / completedExecutions.length;

    // Estimate resource usage (simplified calculation)
    const resourceUsage = this.estimateAverageResourceUsage(completedExecutions);
    
    // Calculate confidence based on data amount and consistency
    const confidence = this.calculatePatternConfidence(executions);

    return {
      task_type: taskType,
      optimal_hour: optimalHour,
      optimal_day_of_week: optimalDayOfWeek,
      success_rate: successRate,
      avg_duration_ms: avgDuration,
      resource_usage: resourceUsage,
      confidence: confidence
    };
  }

  /**
   * Find optimal hour of day for task execution
   */
  private findOptimalHour(executionTimes: Date[]): number {
    const hourCounts = new Array(24).fill(0);
    
    executionTimes.forEach(time => {
      hourCounts[time.getHours()]++;
    });
    
    // Find hour with most successful executions
    const maxCount = Math.max(...hourCounts);
    const optimalHour = hourCounts.indexOf(maxCount);
    
    return optimalHour;
  }

  /**
   * Find optimal day of week for task execution
   */
  private findOptimalDayOfWeek(executionTimes: Date[]): number {
    const dayCounts = new Array(7).fill(0);
    
    executionTimes.forEach(time => {
      dayCounts[time.getDay()]++;
    });
    
    const maxCount = Math.max(...dayCounts);
    const optimalDay = dayCounts.indexOf(maxCount);
    
    return optimalDay;
  }

  /**
   * Calculate optimal execution time based on patterns and current conditions
   */
  private calculateOptimalTime(pattern: SchedulingPattern, currentLoad: SystemLoad, urgency: string): Date {
    const now = new Date();
    let optimalTime = new Date(now);

    if (urgency === 'high') {
      // High urgency: schedule ASAP but consider current load
      if (currentLoad.active_tasks > 10) {
        optimalTime.setMinutes(optimalTime.getMinutes() + 5); // Small delay if system busy
      }
      return optimalTime;
    }

    if (urgency === 'low') {
      // Low urgency: find next optimal window
      const nextOptimalHour = this.findNextOptimalTime(pattern.optimal_hour, pattern.optimal_day_of_week);
      return nextOptimalHour;
    }

    // Medium urgency: balance between optimal time and current needs
    const hoursUntilOptimal = this.calculateHoursUntilOptimal(pattern.optimal_hour);
    
    if (hoursUntilOptimal <= 2) {
      // Close to optimal time, wait for it
      optimalTime.setHours(pattern.optimal_hour, 0, 0, 0);
      if (optimalTime <= now) {
        optimalTime.setDate(optimalTime.getDate() + 1); // Next day
      }
    } else if (currentLoad.active_tasks < 5) {
      // System not busy, schedule sooner
      optimalTime.setMinutes(optimalTime.getMinutes() + 10);
    } else {
      // Wait for less busy time
      optimalTime.setHours(optimalTime.getHours() + 1);
    }

    return optimalTime;
  }

  /**
   * Determine priority adjustment based on patterns and system state
   */
  private determinePriorityAdjustment(pattern: SchedulingPattern, currentLoad: SystemLoad, urgency: string): 'boost' | 'maintain' | 'defer' {
    if (urgency === 'high') return 'boost';
    if (urgency === 'low' && currentLoad.active_tasks > 8) return 'defer';
    
    // If task type has low success rate and system is busy, defer
    if (pattern.success_rate < 0.7 && currentLoad.active_tasks > 6) {
      return 'defer';
    }
    
    // If system is idle and task type performs well, boost
    if (currentLoad.active_tasks < 3 && pattern.success_rate > 0.9) {
      return 'boost';
    }
    
    return 'maintain';
  }

  /**
   * Generate human-readable scheduling reason
   */
  private generateSchedulingReason(pattern: SchedulingPattern, currentLoad: SystemLoad, urgency: string): string {
    const reasons = [];

    if (urgency === 'high') {
      reasons.push('High urgency task');
    } else if (urgency === 'low') {
      reasons.push('Low urgency, scheduled for optimal time');
    }

    if (pattern.success_rate > 0.9) {
      reasons.push(`High success rate (${Math.round(pattern.success_rate * 100)}%)`);
    } else if (pattern.success_rate < 0.7) {
      reasons.push(`Low success rate (${Math.round(pattern.success_rate * 100)}%), scheduling carefully`);
    }

    if (currentLoad.active_tasks > 8) {
      reasons.push('System busy, deferring');
    } else if (currentLoad.active_tasks < 3) {
      reasons.push('System idle, prioritizing');
    }

    if (pattern.confidence < 0.5) {
      reasons.push('Limited historical data');
    }

    return reasons.join('; ') || 'Standard scheduling';
  }

  /**
   * Record current system load
   */
  private async recordSystemLoad(): Promise<void> {
    const load: SystemLoad = {
      cpu_usage: await this.getCPUUsage(),
      memory_usage: await this.getMemoryUsage(), 
      active_tasks: await this.getActiveTasks(),
      queue_depth: await this.getQueueDepth(),
      timestamp: new Date()
    };

    this.systemLoadHistory.push(load);
    
    // Keep only last 1000 load measurements
    if (this.systemLoadHistory.length > 1000) {
      this.systemLoadHistory = this.systemLoadHistory.slice(-1000);
    }
  }

  /**
   * Get current system load
   */
  private async getCurrentSystemLoad(): Promise<SystemLoad> {
    return {
      cpu_usage: await this.getCPUUsage(),
      memory_usage: await this.getMemoryUsage(),
      active_tasks: await this.getActiveTasks(),
      queue_depth: await this.getQueueDepth(),
      timestamp: new Date()
    };
  }

  /**
   * Create initial pattern for new task type
   */
  private async createInitialPattern(task: Task): Promise<SchedulingPattern> {
    return {
      task_type: task.type,
      optimal_hour: 9, // Default to 9 AM
      optimal_day_of_week: 1, // Default to Monday
      success_rate: 0.8, // Optimistic default
      avg_duration_ms: 300000, // 5 minutes default
      resource_usage: 0.3, // Low resource usage default
      confidence: 0.1 // Very low confidence initially
    };
  }

  /**
   * Helper methods for system metrics (simplified implementations)
   */
  private async getCPUUsage(): Promise<number> {
    // In a real implementation, this would read actual CPU metrics
    return Math.random() * 0.8; // Simulated CPU usage 0-80%
  }

  private async getMemoryUsage(): Promise<number> {
    const used = process.memoryUsage();
    const total = 16 * 1024 * 1024 * 1024; // Assume 16GB total
    return used.heapUsed / total;
  }

  private async getActiveTasks(): Promise<number> {
    // This would be injected from TaskManager
    return Math.floor(Math.random() * 15); // Simulated 0-15 active tasks
  }

  private async getQueueDepth(): Promise<number> {
    // This would be injected from RabbitMQ client
    return Math.floor(Math.random() * 50); // Simulated 0-50 queued tasks
  }

  private getTaskType(taskId: string): string {
    if (taskId.includes('prospect')) return 'prospecting';
    if (taskId.includes('pitch')) return 'pitch_creation';
    if (taskId.includes('analytics')) return 'analytics';
    if (taskId.includes('kanban')) return 'kanban';
    return 'general';
  }

  private estimateAverageResourceUsage(executions: TaskExecution[]): number {
    // Simplified resource usage estimation
    return 0.5; // Default to 50% resource usage
  }

  private calculatePatternConfidence(executions: TaskExecution[]): number {
    const dataPoints = executions.length;
    const consistency = this.calculateConsistency(executions);
    
    // More data points and higher consistency = higher confidence
    const dataConfidence = Math.min(dataPoints / 100, 1.0); // Max at 100 executions
    const totalConfidence = (dataConfidence * 0.7) + (consistency * 0.3);
    
    return Math.min(totalConfidence, 0.95); // Max 95% confidence
  }

  private calculateConsistency(executions: TaskExecution[]): number {
    if (executions.length < 2) return 0.1;
    
    const durations = executions
      .filter(e => e.completed_at)
      .map(e => e.completed_at!.getTime() - e.started_at.getTime());
    
    if (durations.length < 2) return 0.1;
    
    const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - avg, 2), 0) / durations.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower standard deviation = higher consistency
    const consistency = Math.max(0, 1 - (stdDev / avg));
    return Math.min(consistency, 1.0);
  }

  private calculateHoursUntilOptimal(optimalHour: number): number {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (optimalHour > currentHour) {
      return optimalHour - currentHour;
    } else {
      return (24 - currentHour) + optimalHour;
    }
  }

  private findNextOptimalTime(optimalHour: number, optimalDayOfWeek: number): Date {
    const now = new Date();
    const nextOptimal = new Date(now);
    
    // Set to optimal hour
    nextOptimal.setHours(optimalHour, 0, 0, 0);
    
    // If optimal time today has passed, move to tomorrow
    if (nextOptimal <= now) {
      nextOptimal.setDate(nextOptimal.getDate() + 1);
    }
    
    // Adjust for optimal day of week if needed
    const daysUntilOptimal = (optimalDayOfWeek - nextOptimal.getDay() + 7) % 7;
    if (daysUntilOptimal > 0) {
      nextOptimal.setDate(nextOptimal.getDate() + daysUntilOptimal);
    }
    
    return nextOptimal;
  }

  private estimateResourceRequirements(pattern: SchedulingPattern): { cpu: number; memory: number; io: number } {
    // Estimate based on task type and historical resource usage
    const baseResource = pattern.resource_usage;
    
    return {
      cpu: baseResource * 0.8,
      memory: baseResource * 0.6,
      io: baseResource * 0.4
    };
  }

  /**
   * Get current scheduling patterns
   */
  getSchedulingPatterns(): Map<string, SchedulingPattern> {
    return new Map(this.schedulingPatterns);
  }

  /**
   * Get system performance analytics
   */
  getPerformanceAnalytics(): {
    total_executions: number;
    success_rate: number;
    avg_duration: number;
    patterns_learned: number;
    confidence_score: number;
  } {
    const completed = this.executionHistory.filter(e => e.status === 'completed');
    const avgDuration = completed.reduce((sum, e) => {
      const duration = e.completed_at ? e.completed_at.getTime() - e.started_at.getTime() : 0;
      return sum + duration;
    }, 0) / (completed.length || 1);

    const avgConfidence = Array.from(this.schedulingPatterns.values())
      .reduce((sum, p) => sum + p.confidence, 0) / (this.schedulingPatterns.size || 1);

    return {
      total_executions: this.executionHistory.length,
      success_rate: completed.length / (this.executionHistory.length || 1),
      avg_duration: avgDuration,
      patterns_learned: this.schedulingPatterns.size,
      confidence_score: avgConfidence
    };
  }

  /**
   * Shutdown the adaptive scheduler
   */
  shutdown(): void {
    if (this.learningInterval) {
      clearInterval(this.learningInterval);
      this.learningInterval = null;
    }
    
    if (this.loadMonitorInterval) {
      clearInterval(this.loadMonitorInterval);
      this.loadMonitorInterval = null;
    }
    
    logger.info('🧠 Adaptive Scheduler shutdown complete');
  }
}

export default AdaptiveScheduler;