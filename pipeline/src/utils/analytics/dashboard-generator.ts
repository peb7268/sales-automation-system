/**
 * Sales Analytics Dashboard Data Generator
 * Generates real-time analytics data for Obsidian Charts plugin
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { Prospect, Activity, PipelineStage } from '@/types';
import { vaultIntegration } from '@utils/obsidian/vault-integration';
import { parseFrontmatter, updateFrontmatter } from '@utils/obsidian/frontmatter-parser';
import { logger } from '@utils/logging';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Analytics data structures
 */
export interface AnalyticsData {
  summary: {
    totalProspects: number;
    qualifiedProspects: number;
    pipelineValue: number;
    monthlyProgress: number;
    conversionRate: number;
  };
  charts: {
    revenueTracking: ChartData;
    pipelineDistribution: ChartData;
    scoreDistribution: ChartData;
    geographicPerformance: ChartData;
    industryAnalysis: ChartData;
    activityTrends: ChartData;
    conversionFunnel: ChartData;
  };
  tables: {
    topProspects: ProspectSummary[];
    recentActivity: ActivitySummary[];
    stagnantProspects: ProspectSummary[];
    performanceByLocation: LocationPerformance[];
    industryBreakdown: IndustryPerformance[];
  };
  kpis: {
    dailyProspects: KPIMetric;
    responseRate: KPIMetric;
    qualificationRate: KPIMetric;
    pipelineValue: KPIMetric;
    averageDealSize: KPIMetric;
  };
}

export interface ChartData {
  type: string;
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string[];
  borderColor?: string;
  tension?: number;
}

export interface ProspectSummary {
  company: string;
  score: number;
  stage: PipelineStage;
  industry: string;
  location: string;
  daysSinceUpdate: number;
  estimatedValue: number;
}

export interface ActivitySummary {
  company: string;
  type: string;
  outcome: string;
  agent: string;
  date: string;
  duration?: number;
}

export interface LocationPerformance {
  location: string;
  prospects: number;
  averageScore: number;
  estimatedRevenue: number;
  conversionRate: number;
}

export interface IndustryPerformance {
  industry: string;
  prospects: number;
  averageScore: number;
  conversionRate: number;
  marketShare: number;
}

export interface KPIMetric {
  current: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  status: 'on-track' | 'warning' | 'critical';
}

/**
 * Analytics dashboard generator
 */
export class DashboardGenerator {
  private dashboardPath: string;
  private annualTarget: number;
  private monthlyTarget: number;

  constructor(dashboardPath?: string) {
    this.dashboardPath = dashboardPath || process.env.OBSIDIAN_DASHBOARD_FILE || '/Users/pbarrick/Documents/Main/Projects/Sales/Sales-Analytics-Dashboard.md';
    this.annualTarget = parseInt(process.env.ANNUAL_REVENUE_TARGET || '50000');
    this.monthlyTarget = parseInt(process.env.MONTHLY_REVENUE_TARGET || '4167');
  }

  /**
   * Generate complete analytics data from current prospects and activities
   */
  async generateAnalyticsData(): Promise<AnalyticsData> {
    try {
      const [prospects, activities] = await Promise.all([
        vaultIntegration.getAllProspects(),
        this.getAllActivities()
      ]);

      const data: AnalyticsData = {
        summary: this.generateSummary(prospects, activities),
        charts: this.generateChartData(prospects, activities),
        tables: this.generateTableData(prospects, activities),
        kpis: this.generateKPIs(prospects, activities)
      };

      return data;
    } catch (error) {
      logger.error('Failed to generate analytics data:', error);
      throw error;
    }
  }

  /**
   * Update dashboard with fresh analytics data
   */
  async updateDashboard(): Promise<void> {
    try {
      const analyticsData = await this.generateAnalyticsData();
      
      // Read current dashboard
      const dashboardContent = await fs.readFile(this.dashboardPath, 'utf8');
      const { frontmatter, content } = parseFrontmatter(dashboardContent);

      // Update frontmatter with current metrics
      const updatedFrontmatter = {
        ...frontmatter,
        updated: new Date().toISOString(),
        total_prospects: analyticsData.summary.totalProspects,
        qualified_prospects: analyticsData.summary.qualifiedProspects,
        pipeline_value: analyticsData.summary.pipelineValue,
        monthly_progress: analyticsData.summary.monthlyProgress
      };

      // Update chart data in content
      let updatedContent = this.updateChartData(content, analyticsData.charts);
      
      // Update KPI section
      updatedContent = this.updateKPISection(updatedContent, analyticsData.kpis);

      // Write updated dashboard
      const finalContent = updateFrontmatter(dashboardContent, updatedFrontmatter);
      await fs.writeFile(this.dashboardPath, finalContent, 'utf8');

      logger.info('Dashboard updated successfully with fresh analytics data');
    } catch (error) {
      logger.error('Failed to update dashboard:', error);
      throw error;
    }
  }

  /**
   * Generate summary metrics
   */
  private generateSummary(prospects: Prospect[], activities: Activity[]): AnalyticsData['summary'] {
    const totalProspects = prospects.length;
    const qualifiedProspects = prospects.filter(p => p.qualificationScore.total >= 75).length;
    const closedWonProspects = prospects.filter(p => p.pipelineStage === 'closed_won').length;
    
    // Calculate pipeline value (estimated based on stage probabilities and deal sizes)
    const pipelineValue = prospects.reduce((total, prospect) => {
      const stageMultipliers: Record<PipelineStage, number> = {
        cold: 0.02,
        contacted: 0.05,
        interested: 0.15,
        qualified: 0.35,
        closed_won: 1.0,
        closed_lost: 0,
        frozen: 0.01
      };
      
      const estimatedDealSize = this.estimateDealSize(prospect);
      const probability = stageMultipliers[prospect.pipelineStage];
      
      return total + (estimatedDealSize * probability);
    }, 0);

    const monthlyProgress = (pipelineValue / this.monthlyTarget) * 100;
    const conversionRate = totalProspects > 0 ? (closedWonProspects / totalProspects) * 100 : 0;

    return {
      totalProspects,
      qualifiedProspects,
      pipelineValue: Math.round(pipelineValue),
      monthlyProgress: Math.round(monthlyProgress * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100
    };
  }

  /**
   * Generate chart data for all visualizations
   */
  private generateChartData(prospects: Prospect[], activities: Activity[]): AnalyticsData['charts'] {
    return {
      revenueTracking: this.generateRevenueTrackingChart(prospects),
      pipelineDistribution: this.generatePipelineDistributionChart(prospects),
      scoreDistribution: this.generateScoreDistributionChart(prospects),
      geographicPerformance: this.generateGeographicChart(prospects),
      industryAnalysis: this.generateIndustryChart(prospects),
      activityTrends: this.generateActivityTrendsChart(activities),
      conversionFunnel: this.generateConversionFunnelChart(prospects)
    };
  }

  /**
   * Generate revenue tracking chart data
   */
  private generateRevenueTrackingChart(prospects: Prospect[]): ChartData {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const targetData = months.map((_, index) => (index + 1) * this.monthlyTarget);
    
    // Calculate actual data (simplified - based on closed deals by month)
    const actualData = months.map((_, index) => {
      const monthProspects = prospects.filter(p => 
        p.pipelineStage === 'closed_won' && 
        p.updated.getMonth() === index
      );
      return monthProspects.reduce((sum, p) => sum + this.estimateDealSize(p), 0);
    });

    return {
      type: 'line',
      labels: months,
      datasets: [
        {
          label: '2025 Target',
          data: targetData,
          borderColor: '#007bff',
          tension: 0.2
        },
        {
          label: '2025 Actual',
          data: actualData,
          borderColor: '#28a745',
          tension: 0.2
        }
      ]
    };
  }

  /**
   * Generate pipeline distribution chart
   */
  private generatePipelineDistributionChart(prospects: Prospect[]): ChartData {
    const stageLabels = ['Cold', 'Contacted', 'Interested', 'Qualified', 'Closed Won', 'Closed Lost', 'Frozen'];
    const stageKeys: PipelineStage[] = ['cold', 'contacted', 'interested', 'qualified', 'closed_won', 'closed_lost', 'frozen'];
    
    const stageData = stageKeys.map(stage => {
      const stageProspects = prospects.filter(p => p.pipelineStage === stage);
      return stageProspects.reduce((sum, p) => sum + this.estimateDealSize(p), 0);
    });

    return {
      type: 'doughnut',
      labels: stageLabels,
      datasets: [{
        label: 'Pipeline Value ($)',
        data: stageData,
        backgroundColor: [
          '#e3f2fd', '#f3e5f5', '#e8f5e8', '#fff3e0', 
          '#e8f5e8', '#ffebee', '#f5f5f5'
        ]
      }]
    };
  }

  /**
   * Generate qualification score distribution chart
   */
  private generateScoreDistributionChart(prospects: Prospect[]): ChartData {
    const scoreRanges = [
      { label: '0-20', min: 0, max: 20 },
      { label: '21-40', min: 21, max: 40 },
      { label: '41-60', min: 41, max: 60 },
      { label: '61-75', min: 61, max: 75 },
      { label: '76-85', min: 76, max: 85 },
      { label: '86-95', min: 86, max: 95 },
      { label: '96-100', min: 96, max: 100 }
    ];

    const distributionData = scoreRanges.map(range => 
      prospects.filter(p => 
        p.qualificationScore.total >= range.min && 
        p.qualificationScore.total <= range.max
      ).length
    );

    return {
      type: 'bar',
      labels: scoreRanges.map(r => r.label),
      datasets: [{
        label: 'Prospects by Score Range',
        data: distributionData,
        backgroundColor: '#007bff'
      }]
    };
  }

  /**
   * Generate geographic performance chart
   */
  private generateGeographicChart(prospects: Prospect[]): ChartData {
    const locationCounts = new Map<string, number>();
    
    prospects.forEach(prospect => {
      const location = `${prospect.business.location.city}, ${prospect.business.location.state}`;
      locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
    });

    const topLocations = Array.from(locationCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6);

    return {
      type: 'doughnut',
      labels: topLocations.map(([location]) => location),
      datasets: [{
        label: 'Prospects by Location',
        data: topLocations.map(([, count]) => count),
        backgroundColor: [
          '#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14'
        ]
      }]
    };
  }

  /**
   * Generate industry analysis chart
   */
  private generateIndustryChart(prospects: Prospect[]): ChartData {
    const industryCounts = new Map<string, { prospects: number; qualified: number }>();
    
    prospects.forEach(prospect => {
      const industry = prospect.business.industry;
      const current = industryCounts.get(industry) || { prospects: 0, qualified: 0 };
      
      current.prospects++;
      if (prospect.qualificationScore.total >= 75) {
        current.qualified++;
      }
      
      industryCounts.set(industry, current);
    });

    const industries = Array.from(industryCounts.entries())
      .sort(([,a], [,b]) => b.prospects - a.prospects);

    return {
      type: 'bar',
      labels: industries.map(([industry]) => this.formatIndustryName(industry)),
      datasets: [
        {
          label: 'Total Prospects',
          data: industries.map(([, data]) => data.prospects),
          backgroundColor: '#007bff'
        },
        {
          label: 'Qualified (75+)',
          data: industries.map(([, data]) => data.qualified),
          backgroundColor: '#28a745'
        }
      ]
    };
  }

  /**
   * Generate activity trends chart
   */
  private generateActivityTrendsChart(activities: Activity[]): ChartData {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const activityCounts = last30Days.map(date => 
      activities.filter(a => a.date.toISOString().split('T')[0] === date).length
    );

    return {
      type: 'line',
      labels: last30Days.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        label: 'Daily Activities',
        data: activityCounts,
        borderColor: '#007bff',
        tension: 0.2
      }]
    };
  }

  /**
   * Generate conversion funnel chart
   */
  private generateConversionFunnelChart(prospects: Prospect[]): ChartData {
    const stages = ['cold', 'contacted', 'interested', 'qualified', 'closed_won'];
    const stageCounts = stages.map(stage => 
      prospects.filter(p => p.pipelineStage === stage).length
    );

    return {
      type: 'bar',
      labels: ['Cold', 'Contacted', 'Interested', 'Qualified', 'Closed Won'],
      datasets: [{
        label: 'Conversion Funnel',
        data: stageCounts,
        backgroundColor: [
          '#e3f2fd', '#f3e5f5', '#e8f5e8', '#fff3e0', '#e8f5e8'
        ]
      }]
    };
  }

  /**
   * Generate table data for various analytics tables
   */
  private generateTableData(prospects: Prospect[], activities: Activity[]): AnalyticsData['tables'] {
    return {
      topProspects: this.generateTopProspects(prospects),
      recentActivity: this.generateRecentActivity(activities),
      stagnantProspects: this.generateStagnantProspects(prospects),
      performanceByLocation: this.generateLocationPerformance(prospects),
      industryBreakdown: this.generateIndustryBreakdown(prospects)
    };
  }

  /**
   * Generate KPI metrics
   */
  private generateKPIs(prospects: Prospect[], activities: Activity[]): AnalyticsData['kpis'] {
    const today = new Date();
    const todayActivities = activities.filter(a => 
      a.date.toDateString() === today.toDateString()
    );

    const last30Days = activities.filter(a => 
      (today.getTime() - a.date.getTime()) <= (30 * 24 * 60 * 60 * 1000)
    );

    const responseActivities = last30Days.filter(a => a.outcome === 'positive');
    const responseRate = last30Days.length > 0 ? (responseActivities.length / last30Days.length) * 100 : 0;

    const qualifiedProspects = prospects.filter(p => p.qualificationScore.total >= 75);
    const qualificationRate = prospects.length > 0 ? (qualifiedProspects.length / prospects.length) * 100 : 0;

    const pipelineValue = prospects.reduce((sum, p) => sum + this.estimateDealSize(p) * this.getStageMultiplier(p.pipelineStage), 0);

    const closedDeals = prospects.filter(p => p.pipelineStage === 'closed_won');
    const averageDealSize = closedDeals.length > 0 ? 
      closedDeals.reduce((sum, p) => sum + this.estimateDealSize(p), 0) / closedDeals.length : 0;

    return {
      dailyProspects: {
        current: todayActivities.filter(a => a.type === 'research').length,
        target: 10,
        trend: 'stable',
        status: todayActivities.length >= 10 ? 'on-track' : 'critical'
      },
      responseRate: {
        current: Math.round(responseRate),
        target: 15,
        trend: 'stable',
        status: responseRate >= 15 ? 'on-track' : responseRate >= 10 ? 'warning' : 'critical'
      },
      qualificationRate: {
        current: Math.round(qualificationRate),
        target: 5,
        trend: 'stable',
        status: qualificationRate >= 5 ? 'on-track' : qualificationRate >= 3 ? 'warning' : 'critical'
      },
      pipelineValue: {
        current: Math.round(pipelineValue),
        target: 15000,
        trend: 'stable',
        status: pipelineValue >= 15000 ? 'on-track' : pipelineValue >= 10000 ? 'warning' : 'critical'
      },
      averageDealSize: {
        current: Math.round(averageDealSize),
        target: 3000,
        trend: 'stable',
        status: averageDealSize >= 3000 ? 'on-track' : averageDealSize >= 2000 ? 'warning' : 'critical'
      }
    };
  }

  // Helper methods
  private async getAllActivities(): Promise<Activity[]> {
    // Simplified - in real implementation, this would read from Activities folder
    return [];
  }

  private estimateDealSize(prospect: Prospect): number {
    // Estimate deal size based on business size and industry
    const baseSizes: Record<string, number> = {
      'restaurants': 2500,
      'retail': 3000,
      'professional_services': 4000,
      'healthcare': 5000,
      'real_estate': 3500,
      'other': 3000
    };

    const sizeMultipliers = {
      'micro': 0.7,
      'small': 1.0,
      'medium': 1.5
    };

    const baseSize = baseSizes[prospect.business.industry] || 3000;
    const multiplier = sizeMultipliers[prospect.business.size.category] || 1.0;
    
    return Math.round(baseSize * multiplier);
  }

  private getStageMultiplier(stage: PipelineStage): number {
    const multipliers: Record<PipelineStage, number> = {
      cold: 0.02,
      contacted: 0.05,
      interested: 0.15,
      qualified: 0.35,
      closed_won: 1.0,
      closed_lost: 0,
      frozen: 0.01
    };
    return multipliers[stage] || 0;
  }

  private formatIndustryName(industry: string): string {
    return industry.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private generateTopProspects(prospects: Prospect[]): ProspectSummary[] {
    return prospects
      .filter(p => p.qualificationScore.total >= 75)
      .sort((a, b) => b.qualificationScore.total - a.qualificationScore.total)
      .slice(0, 10)
      .map(p => ({
        company: p.business.name,
        score: p.qualificationScore.total,
        stage: p.pipelineStage,
        industry: p.business.industry,
        location: `${p.business.location.city}, ${p.business.location.state}`,
        daysSinceUpdate: Math.floor((Date.now() - p.updated.getTime()) / (1000 * 60 * 60 * 24)),
        estimatedValue: this.estimateDealSize(p)
      }));
  }

  private generateRecentActivity(activities: Activity[]): ActivitySummary[] {
    return activities
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 15)
      .map(a => ({
        company: a.prospectId,
        type: a.type,
        outcome: a.outcome,
        agent: a.agentResponsible,
        date: a.date.toLocaleDateString(),
        duration: a.duration
      }));
  }

  private generateStagnantProspects(prospects: Prospect[]): ProspectSummary[] {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    return prospects
      .filter(p => 
        p.updated.getTime() < sevenDaysAgo && 
        !['closed_won', 'closed_lost'].includes(p.pipelineStage)
      )
      .sort((a, b) => a.updated.getTime() - b.updated.getTime())
      .slice(0, 10)
      .map(p => ({
        company: p.business.name,
        score: p.qualificationScore.total,
        stage: p.pipelineStage,
        industry: p.business.industry,
        location: `${p.business.location.city}, ${p.business.location.state}`,
        daysSinceUpdate: Math.floor((Date.now() - p.updated.getTime()) / (1000 * 60 * 60 * 24)),
        estimatedValue: this.estimateDealSize(p)
      }));
  }

  private generateLocationPerformance(prospects: Prospect[]): LocationPerformance[] {
    const locationMap = new Map<string, Prospect[]>();
    
    prospects.forEach(p => {
      const location = `${p.business.location.city}, ${p.business.location.state}`;
      if (!locationMap.has(location)) {
        locationMap.set(location, []);
      }
      locationMap.get(location)!.push(p);
    });

    return Array.from(locationMap.entries()).map(([location, locationProspects]) => ({
      location,
      prospects: locationProspects.length,
      averageScore: Math.round(locationProspects.reduce((sum, p) => sum + p.qualificationScore.total, 0) / locationProspects.length),
      estimatedRevenue: locationProspects.reduce((sum, p) => sum + this.estimateDealSize(p), 0),
      conversionRate: Math.round((locationProspects.filter(p => p.pipelineStage === 'closed_won').length / locationProspects.length) * 100)
    }));
  }

  private generateIndustryBreakdown(prospects: Prospect[]): IndustryPerformance[] {
    const industryMap = new Map<string, Prospect[]>();
    
    prospects.forEach(p => {
      if (!industryMap.has(p.business.industry)) {
        industryMap.set(p.business.industry, []);
      }
      industryMap.get(p.business.industry)!.push(p);
    });

    const totalProspects = prospects.length;

    return Array.from(industryMap.entries()).map(([industry, industryProspects]) => ({
      industry: this.formatIndustryName(industry),
      prospects: industryProspects.length,
      averageScore: Math.round(industryProspects.reduce((sum, p) => sum + p.qualificationScore.total, 0) / industryProspects.length),
      conversionRate: Math.round((industryProspects.filter(p => p.pipelineStage === 'closed_won').length / industryProspects.length) * 100),
      marketShare: Math.round((industryProspects.length / totalProspects) * 100)
    }));
  }

  // Chart update methods
  private updateChartData(content: string, charts: AnalyticsData['charts']): string {
    // This would update chart data in the markdown content
    // Implementation would parse and replace chart data blocks
    return content;
  }

  private updateKPISection(content: string, kpis: AnalyticsData['kpis']): string {
    // This would update the KPI table with current metrics
    return content;
  }
}

/**
 * Export singleton instance
 */
export const dashboardGenerator = new DashboardGenerator();