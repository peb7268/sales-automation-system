/**
 * Obsidian Dashboard Generator - Real-time monitoring and observability
 * Generates comprehensive dashboards in Obsidian format from system metrics and task data
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '@utils/logging';
import { TaskExecution } from '../orchestration/task-manager';
import { SchedulingPattern } from '../orchestration/adaptive-scheduler';

export interface SystemMetrics {
  timestamp: Date;
  active_agents: number;
  running_tasks: number;
  queue_depth: number;
  success_rate: number;
  avg_response_time: number;
  error_count: number;
  memory_usage: number;
  cpu_usage: number;
}

export interface DashboardData {
  system_health: 'healthy' | 'warning' | 'critical';
  uptime: string;
  total_tasks_processed: number;
  tasks_today: number;
  success_rate_24h: number;
  active_agents: Array<{
    id: string;
    type: string;
    status: 'active' | 'idle' | 'busy' | 'error';
    last_heartbeat: Date;
    tasks_completed: number;
  }>;
  recent_tasks: TaskExecution[];
  performance_trends: {
    hourly_throughput: number[];
    success_rates: number[];
    response_times: number[];
  };
  scheduling_insights: {
    optimal_hours: Record<string, number>;
    bottlenecks: string[];
    recommendations: string[];
  };
  alerts: Array<{
    severity: 'info' | 'warning' | 'error';
    message: string;
    timestamp: Date;
  }>;
}

export class ObsidianDashboardGenerator {
  private metricsHistory: SystemMetrics[] = [];
  private dashboardUpdateInterval: NodeJS.Timeout | null = null;
  private obsidianPath: string;
  
  constructor(obsidianPath: string = process.env.OBSIDIAN_VAULT_PATH || './obsidian') {
    this.obsidianPath = obsidianPath;
    this.startDashboardUpdates();
    logger.info('📊 Obsidian Dashboard Generator initialized');
  }

  /**
   * Start automatic dashboard updates
   */
  private startDashboardUpdates(): void {
    this.dashboardUpdateInterval = setInterval(async () => {
      await this.updateAllDashboards();
    }, 60000); // Update every minute
  }

  /**
   * Add system metrics to history
   */
  addMetrics(metrics: SystemMetrics): void {
    this.metricsHistory.push(metrics);
    
    // Keep only last 1440 metrics (24 hours at 1-minute intervals)
    if (this.metricsHistory.length > 1440) {
      this.metricsHistory = this.metricsHistory.slice(-1440);
    }
  }

  /**
   * Generate main system dashboard
   */
  async generateSystemDashboard(data: DashboardData): Promise<string> {
    const now = new Date();
    const timestamp = now.toISOString();
    
    const dashboard = `---
title: "Sales Pipeline System Dashboard"
type: dashboard
updated: ${timestamp}
health: ${data.system_health}
auto_refresh: true
---

# 🎯 Sales Pipeline System Dashboard

> **Last Updated**: ${now.toLocaleString()}  
> **System Health**: ${this.getHealthEmoji(data.system_health)} **${data.system_health.toUpperCase()}**  
> **Uptime**: ${data.uptime}

## 📊 System Overview

### Key Metrics
| Metric | Value | Status |
|--------|-------|--------|
| 🔄 Tasks Processed Today | **${data.tasks_today}** | ${data.tasks_today > 10 ? '✅' : '⚠️'} |
| 📈 Success Rate (24h) | **${Math.round(data.success_rate_24h * 100)}%** | ${data.success_rate_24h > 0.8 ? '✅' : data.success_rate_24h > 0.6 ? '⚠️' : '❌'} |
| 🤖 Active Agents | **${data.active_agents.length}** | ${data.active_agents.length >= 3 ? '✅' : '⚠️'} |
| ⚡ Running Tasks | **${data.running_tasks}** | ${data.running_tasks < 10 ? '✅' : data.running_tasks < 20 ? '⚠️' : '❌'} |
| 📋 Queue Depth | **${data.queue_depth}** | ${data.queue_depth < 20 ? '✅' : data.queue_depth < 50 ? '⚠️' : '❌'} |

### Performance Trends
\`\`\`chart
type: line
labels: [1h, 2h, 3h, 4h, 5h, 6h, 7h, 8h, 9h, 10h, 11h, 12h]
series:
  - title: Hourly Throughput
    data: [${data.performance_trends.hourly_throughput.join(', ')}]
  - title: Success Rate %
    data: [${data.performance_trends.success_rates.map(r => Math.round(r * 100)).join(', ')}]
\`\`\`

## 🤖 Agent Status

${data.active_agents.map(agent => `
### ${agent.type.charAt(0).toUpperCase() + agent.type.slice(1)} Agent
- **ID**: \`${agent.id}\`
- **Status**: ${this.getAgentStatusEmoji(agent.status)} ${agent.status.toUpperCase()}
- **Last Heartbeat**: ${agent.last_heartbeat.toLocaleTimeString()}
- **Tasks Completed**: ${agent.tasks_completed}
`).join('\n')}

## 🔄 Recent Task Activity

${data.recent_tasks.slice(0, 10).map(task => `
- **${task.task_id}** | ${this.getTaskStatusEmoji(task.status)} ${task.status} | ${task.started_at.toLocaleTimeString()}${task.completed_at ? ` → ${task.completed_at.toLocaleTimeString()}` : ''}
`).join('')}

## 🧠 Scheduling Insights

### Optimal Execution Times
${Object.entries(data.scheduling_insights.optimal_hours).map(([taskType, hour]) => 
  `- **${taskType}**: ${hour}:00 (${this.getTimeDescription(hour)})`
).join('\n')}

### Current Bottlenecks
${data.scheduling_insights.bottlenecks.length > 0 ? 
  data.scheduling_insights.bottlenecks.map(bottleneck => `- ⚠️ ${bottleneck}`).join('\n') :
  '- ✅ No bottlenecks detected'
}

### Recommendations
${data.scheduling_insights.recommendations.length > 0 ?
  data.scheduling_insights.recommendations.map(rec => `- 💡 ${rec}`).join('\n') :
  '- ✅ System operating optimally'
}

## 🚨 Alerts & Notifications

${data.alerts.length > 0 ? 
  data.alerts.slice(0, 5).map(alert => 
    `- ${this.getAlertEmoji(alert.severity)} **${alert.message}** _(${alert.timestamp.toLocaleTimeString()})_`
  ).join('\n') :
  '- ✅ No active alerts'
}

## 📈 Performance Analytics

### System Load (Last 24 Hours)
\`\`\`chart
type: area
labels: [${this.generateHourLabels()}]
series:
  - title: CPU Usage %
    data: [${this.getCPUTrend()}]
  - title: Memory Usage %
    data: [${this.getMemoryTrend()}]
  - title: Active Tasks
    data: [${this.getTaskTrend()}]
\`\`\`

### Response Time Distribution
\`\`\`chart
type: bar
labels: [${data.performance_trends.response_times.map((_, i) => `${i}h`).join(', ')}]
series:
  - title: Avg Response Time (ms)
    data: [${data.performance_trends.response_times.join(', ')}]
\`\`\`

---

## 🔗 Quick Actions

- [[JSON Task Management System]] - View JSON task configuration
- [[Agent Performance Analysis]] - Detailed agent metrics
- [[System Health Report]] - Comprehensive health analysis
- [[Scheduling Optimization]] - ML-based scheduling insights

## 📋 Related Dashboards

- [[Sales-Analytics-Dashboard]] - Sales performance metrics
- [[Sales-Pipeline-Kanban]] - Visual pipeline overview
- [[Agent-Performance-Dashboard]] - Individual agent analytics

---

*Dashboard auto-updates every minute. Last refresh: ${timestamp}*`;

    return dashboard;
  }

  /**
   * Generate agent performance dashboard
   */
  async generateAgentPerformanceDashboard(agentData: any[]): Promise<string> {
    const now = new Date();
    
    const dashboard = `---
title: "Agent Performance Analysis"
type: analytics
updated: ${now.toISOString()}
---

# 🤖 Agent Performance Analysis

> **Generated**: ${now.toLocaleString()}

## Overview

${agentData.map(agent => `
## ${agent.name} Agent Performance

### Key Metrics
- **Total Tasks**: ${agent.total_tasks}
- **Success Rate**: ${Math.round(agent.success_rate * 100)}%
- **Avg Response Time**: ${agent.avg_response_time}ms
- **Efficiency Score**: ${Math.round(agent.efficiency * 100)}%

### Performance Trend
\`\`\`chart
type: line
labels: [${agent.performance_history.map((_, i) => `${i}h`).join(', ')}]
series:
  - title: Tasks/Hour
    data: [${agent.performance_history.join(', ')}]
\`\`\`

### Recent Activity
${agent.recent_tasks.map(task => 
  `- ${task.timestamp}: ${task.result} (${task.duration}ms)`
).join('\n')}

---
`).join('\n')}

## Comparative Analysis

### Agent Efficiency Comparison
\`\`\`chart
type: radar
labels: [${agentData.map(a => a.name).join(', ')}]
series:
  - title: Efficiency %
    data: [${agentData.map(a => Math.round(a.efficiency * 100)).join(', ')}]
  - title: Success Rate %
    data: [${agentData.map(a => Math.round(a.success_rate * 100)).join(', ')}]
\`\`\`

## Recommendations

${this.generateAgentRecommendations(agentData)}

---

*Analysis updated every 5 minutes*`;

    return dashboard;
  }

  /**
   * Generate system health report
   */
  async generateHealthReport(): Promise<string> {
    const now = new Date();
    const recentMetrics = this.metricsHistory.slice(-60); // Last hour
    
    const avgSuccessRate = recentMetrics.reduce((sum, m) => sum + m.success_rate, 0) / recentMetrics.length;
    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.avg_response_time, 0) / recentMetrics.length;
    const maxCPU = Math.max(...recentMetrics.map(m => m.cpu_usage));
    const maxMemory = Math.max(...recentMetrics.map(m => m.memory_usage));
    
    const healthScore = this.calculateHealthScore(recentMetrics);
    const healthStatus = healthScore > 0.8 ? 'healthy' : healthScore > 0.6 ? 'warning' : 'critical';

    const report = `---
title: "System Health Report"
type: health_report  
updated: ${now.toISOString()}
health_score: ${Math.round(healthScore * 100)}
---

# 🏥 System Health Report

> **Generated**: ${now.toLocaleString()}  
> **Health Score**: ${Math.round(healthScore * 100)}/100 (${healthStatus.toUpperCase()})

## Executive Summary

${healthStatus === 'healthy' ? '✅ System is operating within normal parameters.' :
  healthStatus === 'warning' ? '⚠️ System showing signs of stress but functioning.' :
  '❌ System requires immediate attention.'}

## Detailed Analysis

### Performance Metrics (Last Hour)
- **Average Success Rate**: ${Math.round(avgSuccessRate * 100)}%
- **Average Response Time**: ${Math.round(avgResponseTime)}ms
- **Peak CPU Usage**: ${Math.round(maxCPU * 100)}%
- **Peak Memory Usage**: ${Math.round(maxMemory * 100)}%

### Health Indicators
${this.generateHealthIndicators(recentMetrics)}

### Trend Analysis
\`\`\`chart
type: line
labels: [${recentMetrics.map((_, i) => `${i}m`).join(', ')}]
series:
  - title: Success Rate %
    data: [${recentMetrics.map(m => Math.round(m.success_rate * 100)).join(', ')}]
  - title: Response Time (ms)
    data: [${recentMetrics.map(m => Math.round(m.avg_response_time)).join(', ')}]
\`\`\`

## Issues & Recommendations

${this.generateSystemRecommendations(recentMetrics, healthScore)}

---

*Health report generated every 15 minutes*`;

    return report;
  }

  /**
   * Update all dashboards
   */
  private async updateAllDashboards(): Promise<void> {
    try {
      // Generate sample data - in real implementation, this would come from system metrics
      const dashboardData = await this.collectDashboardData();
      
      // Generate and save main dashboard
      const mainDashboard = await this.generateSystemDashboard(dashboardData);
      await this.saveDashboardFile('System-Dashboard.md', mainDashboard);
      
      // Generate and save health report
      const healthReport = await this.generateHealthReport();
      await this.saveDashboardFile('System-Health-Report.md', healthReport);
      
      logger.debug('📊 Dashboards updated successfully');
      
    } catch (error) {
      logger.error('Failed to update dashboards:', error);
    }
  }

  /**
   * Save dashboard file to Obsidian vault
   */
  private async saveDashboardFile(filename: string, content: string): Promise<void> {
    const dashboardDir = path.join(this.obsidianPath, 'Projects', 'Sales', 'Dashboards');
    await fs.mkdir(dashboardDir, { recursive: true });
    
    const filePath = path.join(dashboardDir, filename);
    await fs.writeFile(filePath, content, 'utf8');
    
    logger.debug(`💾 Saved dashboard: ${filename}`);
  }

  /**
   * Collect current dashboard data
   */
  private async collectDashboardData(): Promise<DashboardData> {
    // In real implementation, this would collect actual system data
    return {
      system_health: 'healthy',
      uptime: this.formatUptime(process.uptime()),
      total_tasks_processed: 1543,
      tasks_today: 127,
      success_rate_24h: 0.87,
      active_agents: [
        {
          id: 'prospecting_agent_1',
          type: 'prospecting',
          status: 'active',
          last_heartbeat: new Date(),
          tasks_completed: 45
        },
        {
          id: 'pitch_creator_agent_1', 
          type: 'pitch_creator',
          status: 'idle',
          last_heartbeat: new Date(Date.now() - 30000),
          tasks_completed: 23
        }
      ],
      running_tasks: 3,
      queue_depth: 8,
      recent_tasks: this.generateMockRecentTasks(),
      performance_trends: {
        hourly_throughput: [12, 15, 18, 22, 19, 16, 14, 20, 25, 21, 18, 15],
        success_rates: [0.85, 0.87, 0.89, 0.86, 0.88, 0.85, 0.87, 0.90, 0.88, 0.86, 0.87, 0.85],
        response_times: [1200, 1150, 1300, 1100, 1250, 1180, 1220, 1050, 1300, 1200, 1150, 1200]
      },
      scheduling_insights: {
        optimal_hours: {
          'prospecting': 9,
          'pitch_creation': 14,
          'analytics': 10
        },
        bottlenecks: ['Queue buildup during peak hours'],
        recommendations: ['Scale prospecting agents during 9-11 AM', 'Pre-generate pitches for high-value prospects']
      },
      alerts: [
        {
          severity: 'warning',
          message: 'Queue depth approaching threshold (8/10)',
          timestamp: new Date(Date.now() - 300000)
        }
      ]
    };
  }

  // Helper methods
  private getHealthEmoji(health: string): string {
    switch (health) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '❌';
      default: return '❓';
    }
  }

  private getAgentStatusEmoji(status: string): string {
    switch (status) {
      case 'active': return '✅';
      case 'idle': return '💤';
      case 'busy': return '⚡';
      case 'error': return '❌';
      default: return '❓';
    }
  }

  private getTaskStatusEmoji(status: string): string {
    switch (status) {
      case 'completed': return '✅';
      case 'running': return '⚡';
      case 'failed': return '❌';
      case 'retrying': return '🔄';
      default: return '❓';
    }
  }

  private getAlertEmoji(severity: string): string {
    switch (severity) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '❓';
    }
  }

  private getTimeDescription(hour: number): string {
    if (hour < 6) return 'Early Morning';
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    if (hour < 21) return 'Evening';
    return 'Night';
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  private generateHourLabels(): string {
    const labels = [];
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(Date.now() - i * 3600000).getHours();
      labels.push(`${hour}h`);
    }
    return labels.join(', ');
  }

  private getCPUTrend(): string {
    return Array.from({length: 24}, () => Math.round(Math.random() * 80)).join(', ');
  }

  private getMemoryTrend(): string {
    return Array.from({length: 24}, () => Math.round(30 + Math.random() * 40)).join(', ');
  }

  private getTaskTrend(): string {
    return Array.from({length: 24}, () => Math.round(Math.random() * 15)).join(', ');
  }

  private generateMockRecentTasks(): TaskExecution[] {
    return [
      {
        id: 'exec_1',
        task_id: 'daily_prospect_generation',
        started_at: new Date(Date.now() - 300000),
        completed_at: new Date(Date.now() - 120000),
        status: 'completed',
        attempt: 1
      },
      {
        id: 'exec_2',
        task_id: 'pitch_generation_xyz',
        started_at: new Date(Date.now() - 600000),
        status: 'running',
        attempt: 1
      }
    ];
  }

  private generateAgentRecommendations(agentData: any[]): string {
    const recommendations = [];
    
    agentData.forEach(agent => {
      if (agent.success_rate < 0.8) {
        recommendations.push(`- Investigate ${agent.name} agent performance issues`);
      }
      if (agent.avg_response_time > 5000) {
        recommendations.push(`- Optimize ${agent.name} agent response time`);
      }
    });
    
    if (recommendations.length === 0) {
      recommendations.push('- All agents performing within optimal parameters');
    }
    
    return recommendations.join('\n');
  }

  private generateHealthIndicators(metrics: SystemMetrics[]): string {
    const indicators = [];
    
    const avgCPU = metrics.reduce((sum, m) => sum + m.cpu_usage, 0) / metrics.length;
    const avgMemory = metrics.reduce((sum, m) => sum + m.memory_usage, 0) / metrics.length;
    const avgErrors = metrics.reduce((sum, m) => sum + m.error_count, 0) / metrics.length;
    
    indicators.push(`- **CPU Usage**: ${Math.round(avgCPU * 100)}% ${avgCPU < 0.7 ? '✅' : avgCPU < 0.85 ? '⚠️' : '❌'}`);
    indicators.push(`- **Memory Usage**: ${Math.round(avgMemory * 100)}% ${avgMemory < 0.8 ? '✅' : avgMemory < 0.9 ? '⚠️' : '❌'}`);
    indicators.push(`- **Error Rate**: ${Math.round(avgErrors)} errors/hour ${avgErrors < 5 ? '✅' : avgErrors < 15 ? '⚠️' : '❌'}`);
    
    return indicators.join('\n');
  }

  private generateSystemRecommendations(metrics: SystemMetrics[], healthScore: number): string {
    const recommendations = [];
    
    if (healthScore < 0.7) {
      recommendations.push('- **Critical**: System requires immediate attention');
      recommendations.push('- Consider scaling infrastructure resources');
      recommendations.push('- Review error logs for recurring issues');
    } else if (healthScore < 0.85) {
      recommendations.push('- Monitor system closely for potential issues');
      recommendations.push('- Consider optimizing task scheduling');
    } else {
      recommendations.push('- System operating optimally');
      recommendations.push('- Continue monitoring for any performance degradation');
    }
    
    return recommendations.join('\n');
  }

  private calculateHealthScore(metrics: SystemMetrics[]): number {
    if (metrics.length === 0) return 0.5;
    
    const avgSuccessRate = metrics.reduce((sum, m) => sum + m.success_rate, 0) / metrics.length;
    const avgCPU = metrics.reduce((sum, m) => sum + m.cpu_usage, 0) / metrics.length;
    const avgMemory = metrics.reduce((sum, m) => sum + m.memory_usage, 0) / metrics.length;
    const avgErrors = metrics.reduce((sum, m) => sum + m.error_count, 0) / metrics.length;
    
    // Weighted health score calculation
    const successWeight = 0.4;
    const resourceWeight = 0.3;
    const errorWeight = 0.3;
    
    const successScore = avgSuccessRate;
    const resourceScore = Math.max(0, 1 - Math.max(avgCPU, avgMemory));
    const errorScore = Math.max(0, 1 - (avgErrors / 20)); // Normalize errors to 0-1 scale
    
    return (successScore * successWeight) + (resourceScore * resourceWeight) + (errorScore * errorWeight);
  }

  /**
   * Shutdown dashboard updates
   */
  shutdown(): void {
    if (this.dashboardUpdateInterval) {
      clearInterval(this.dashboardUpdateInterval);
      this.dashboardUpdateInterval = null;
    }
    
    logger.info('📊 Obsidian Dashboard Generator shutdown complete');
  }
}

export default ObsidianDashboardGenerator;