/**
 * Kanban Pipeline Integration Utilities
 * Handles syncing between Kanban board cards and prospect frontmatter
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { Prospect, PipelineStage, Activity, ActivityCreationInput } from '@/types';
import { vaultIntegration } from './vault-integration';
import { parseFrontmatter, updateFrontmatter, formatDateForFrontmatter } from './frontmatter-parser';
import { logger } from '@utils/logging';

/**
 * Pipeline stage mapping for Kanban integration
 */
export const KANBAN_STAGES: Record<PipelineStage, string> = {
  'cold': '🧊 Cold',
  'contacted': '📞 Contacted', 
  'interested': '💬 Interested',
  'qualified': '✅ Qualified',
  'closed_won': '💰 Closed Won',
  'closed_lost': '❌ Closed Lost',
  'frozen': '🧊 Frozen'
};

/**
 * Reverse mapping from Kanban lane names to pipeline stages
 */
export const LANE_TO_STAGE: Record<string, PipelineStage> = {
  '🧊 Cold': 'cold',
  '📞 Contacted': 'contacted',
  '💬 Interested': 'interested', 
  '✅ Qualified': 'qualified',
  '💰 Closed Won': 'closed_won',
  '❌ Closed Lost': 'closed_lost',
  '🧊 Frozen': 'frozen'
};

/**
 * Kanban card data structure
 */
export interface KanbanCard {
  id: string;
  title: string;
  content: string;
  lane: string;
  prospectId: string;
  prospectFile: string;
  metadata: {
    company: string;
    industry: string;
    location: string;
    qualificationScore: number;
    lastUpdated: Date;
    tags: string[];
  };
}

/**
 * Stage transition event
 */
export interface StageTransition {
  prospectId: string;
  fromStage: PipelineStage;
  toStage: PipelineStage;
  timestamp: Date;
  triggeredBy: 'manual' | 'automated' | 'agent';
  reason?: string;
}

/**
 * Kanban integration manager
 */
export class KanbanIntegration {
  private kanbanFilePath: string;
  private prospectsPath: string;

  constructor(
    kanbanFilePath: string = '/Users/pbarrick/Documents/Main/Projects/Sales/Sales-Pipeline-Kanban.md',
    prospectsPath: string = '/Users/pbarrick/Documents/Main/Projects/Sales/Prospects'
  ) {
    this.kanbanFilePath = kanbanFilePath;
    this.prospectsPath = prospectsPath;
  }

  /**
   * Generate Kanban card content from prospect data
   */
  generateKanbanCard(prospect: Prospect): string {
    const scoreEmoji = this.getScoreEmoji(prospect.qualificationScore.total);
    const industryEmoji = this.getIndustryEmoji(prospect.business.industry);
    
    return `- [ ] ${industryEmoji} **[[${prospect.business.name}]]**<br/>🏷️ #prospect #${prospect.pipelineStage}<br/>📍 ${prospect.business.location.city}, ${prospect.business.location.state}<br/>⭐ Score: ${prospect.qualificationScore.total}/100 ${scoreEmoji}<br/>📅 Updated: ${formatDateForFrontmatter(prospect.updated).slice(0, 10)}`;
  }

  /**
   * Update prospect frontmatter when card is moved between lanes
   */
  async handleStageTransition(transition: StageTransition): Promise<boolean> {
    try {
      // Find prospect file
      const prospectFiles = await fs.readdir(this.prospectsPath);
      const prospectFile = prospectFiles.find(file => 
        file.includes(transition.prospectId) && file.endsWith('.md')
      );

      if (!prospectFile) {
        logger.error(`Prospect file not found for ID: ${transition.prospectId}`);
        return false;
      }

      const filePath = path.join(this.prospectsPath, prospectFile);
      const content = await fs.readFile(filePath, 'utf8');

      // Update frontmatter
      const updates = {
        pipeline_stage: transition.toStage,
        updated: formatDateForFrontmatter(transition.timestamp),
        tags: this.updateTags(content, transition.fromStage, transition.toStage)
      };

      const updatedContent = updateFrontmatter(content, updates);
      await fs.writeFile(filePath, updatedContent, 'utf8');

      // Log the stage transition activity
      await this.logStageTransition(transition);

      // Update qualification score based on stage
      await this.updateQualificationScore(transition);

      logger.info(`Stage transition completed: ${transition.prospectId} ${transition.fromStage} → ${transition.toStage}`);
      return true;

    } catch (error) {
      logger.error('Failed to handle stage transition:', error);
      return false;
    }
  }

  /**
   * Sync all prospect cards with Kanban board
   */
  async syncAllProspectsToKanban(): Promise<void> {
    try {
      const prospects = await vaultIntegration.getAllProspects();
      
      // Group prospects by pipeline stage
      const prospectsByStage = new Map<PipelineStage, Prospect[]>();
      
      prospects.forEach(prospect => {
        const stage = prospect.pipelineStage;
        if (!prospectsByStage.has(stage)) {
          prospectsByStage.set(stage, []);
        }
        prospectsByStage.get(stage)!.push(prospect);
      });

      // Read current Kanban board
      let kanbanContent = await fs.readFile(this.kanbanFilePath, 'utf8');

      // Update each stage section
      for (const [stage, stageProspects] of prospectsByStage) {
        const laneName = KANBAN_STAGES[stage];
        const cards = stageProspects
          .sort((a, b) => b.qualificationScore.total - a.qualificationScore.total)
          .map(prospect => this.generateKanbanCard(prospect))
          .join('\n\n');

        // Replace the section content
        const sectionRegex = new RegExp(`(## ${laneName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n\\n)(.*?)(?=\\n## |$)`, 's');
        kanbanContent = kanbanContent.replace(sectionRegex, `$1${cards}\n\n`);
      }

      await fs.writeFile(this.kanbanFilePath, kanbanContent, 'utf8');
      logger.info(`Synced ${prospects.length} prospects to Kanban board`);

    } catch (error) {
      logger.error('Failed to sync prospects to Kanban:', error);
    }
  }

  /**
   * Monitor Kanban board for changes and update prospect data
   */
  async monitorKanbanChanges(): Promise<void> {
    // This would typically use file watching or plugin hooks
    // For now, implement as a polling mechanism that can be called periodically
    try {
      const kanbanContent = await fs.readFile(this.kanbanFilePath, 'utf8');
      const changes = await this.detectKanbanChanges(kanbanContent);
      
      for (const change of changes) {
        await this.handleStageTransition(change);
      }

    } catch (error) {
      logger.error('Failed to monitor Kanban changes:', error);
    }
  }

  /**
   * Create activity log entry for stage transitions
   */
  private async logStageTransition(transition: StageTransition): Promise<void> {
    const activityInput: ActivityCreationInput = {
      prospectId: transition.prospectId,
      campaignId: undefined,
      type: 'note',
      outcome: 'positive',
      agentResponsible: 'sales_orchestrator_agent',
      summary: `Pipeline stage changed: ${transition.fromStage} → ${transition.toStage}`,
      notes: `Stage transition triggered by: ${transition.triggeredBy}${transition.reason ? `. Reason: ${transition.reason}` : ''}`,
      metadata: {
        stageChange: {
          from: transition.fromStage,
          to: transition.toStage,
          timestamp: transition.timestamp.toISOString(),
          triggeredBy: transition.triggeredBy
        }
      }
    };

    await vaultIntegration.createActivity(activityInput);
  }

  /**
   * Update qualification score based on stage progression
   */
  private async updateQualificationScore(transition: StageTransition): Promise<void> {
    const scoreAdjustments: Record<string, number> = {
      'cold→contacted': 10,
      'contacted→interested': 15,
      'interested→qualified': 20,
      'qualified→closed_won': 25,
      'contacted→cold': -5,
      'interested→contacted': -10,
      'qualified→interested': -15,
      'any→frozen': 0,
      'any→closed_lost': -20
    };

    const transitionKey = `${transition.fromStage}→${transition.toStage}`;
    const generalKey = `any→${transition.toStage}`;
    
    const adjustment = scoreAdjustments[transitionKey] || scoreAdjustments[generalKey] || 0;
    
    if (adjustment !== 0) {
      // This would update the qualification score in the prospect frontmatter
      logger.info(`Score adjustment: ${adjustment} points for ${transition.prospectId}`);
    }
  }

  /**
   * Update tags when stage changes
   */
  private updateTags(content: string, fromStage: PipelineStage, toStage: PipelineStage): string[] {
    const { frontmatter } = parseFrontmatter(content);
    let tags = Array.isArray(frontmatter.tags) ? [...frontmatter.tags] : [];
    
    // Remove old stage tag
    tags = tags.filter(tag => tag !== fromStage);
    
    // Add new stage tag if not present
    if (!tags.includes(toStage)) {
      tags.push(toStage);
    }
    
    return tags;
  }

  /**
   * Get emoji based on qualification score
   */
  private getScoreEmoji(score: number): string {
    if (score >= 90) return '🔥';
    if (score >= 75) return '⭐';
    if (score >= 60) return '👍';
    if (score >= 40) return '👌';
    return '🆕';
  }

  /**
   * Get emoji based on industry
   */
  private getIndustryEmoji(industry: string): string {
    const industryEmojis: Record<string, string> = {
      'restaurants': '🍽️',
      'retail': '🛍️',
      'professional_services': '💼',
      'healthcare': '🏥',
      'real_estate': '🏠',
      'automotive': '🚗',
      'home_services': '🔧',
      'fitness': '💪',
      'beauty_salons': '💄',
      'legal_services': '⚖️',
      'other': '🏢'
    };
    
    return industryEmojis[industry] || '🏢';
  }

  /**
   * Detect changes in Kanban board (simplified implementation)
   */
  private async detectKanbanChanges(kanbanContent: string): Promise<StageTransition[]> {
    // This is a simplified implementation
    // In practice, this would compare against a stored state or use file watching
    const changes: StageTransition[] = [];
    
    // Parse Kanban content and detect card movements
    // This would involve comparing current state with previous state
    // and identifying cards that have moved between lanes
    
    return changes;
  }

  /**
   * Generate pipeline health metrics
   */
  async generatePipelineMetrics(): Promise<{
    stageDistribution: Record<PipelineStage, number>;
    conversionRates: Record<string, number>;
    averageScoreByStage: Record<PipelineStage, number>;
    stagnantProspects: Prospect[];
    velocityMetrics: Record<PipelineStage, number>;
  }> {
    const prospects = await vaultIntegration.getAllProspects();
    
    const stageDistribution: Record<PipelineStage, number> = {
      cold: 0, contacted: 0, interested: 0, qualified: 0, 
      closed_won: 0, closed_lost: 0, frozen: 0
    };
    
    const scoreByStage: Record<PipelineStage, number[]> = {
      cold: [], contacted: [], interested: [], qualified: [], 
      closed_won: [], closed_lost: [], frozen: []
    };

    // Calculate distributions
    prospects.forEach(prospect => {
      stageDistribution[prospect.pipelineStage]++;
      scoreByStage[prospect.pipelineStage].push(prospect.qualificationScore.total);
    });

    // Calculate average scores
    const averageScoreByStage = Object.entries(scoreByStage).reduce((acc, [stage, scores]) => {
      acc[stage as PipelineStage] = scores.length > 0 
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : 0;
      return acc;
    }, {} as Record<PipelineStage, number>);

    // Calculate conversion rates (simplified)
    const conversionRates = {
      'Cold to Contacted': this.calculateConversionRate(stageDistribution.cold, stageDistribution.contacted),
      'Contacted to Interested': this.calculateConversionRate(stageDistribution.contacted, stageDistribution.interested),
      'Interested to Qualified': this.calculateConversionRate(stageDistribution.interested, stageDistribution.qualified),
      'Qualified to Closed': this.calculateConversionRate(stageDistribution.qualified, stageDistribution.closed_won)
    };

    // Find stagnant prospects (no activity in 7+ days)
    const stagnantProspects = prospects.filter(prospect => {
      const daysSinceUpdate = (Date.now() - prospect.updated.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate >= 7 && !['closed_won', 'closed_lost'].includes(prospect.pipelineStage);
    });

    // Velocity metrics (days in stage - simplified)
    const velocityMetrics: Record<PipelineStage, number> = {
      cold: 3, contacted: 7, interested: 5, qualified: 10,
      closed_won: 0, closed_lost: 0, frozen: 0
    };

    return {
      stageDistribution,
      conversionRates,
      averageScoreByStage,
      stagnantProspects,
      velocityMetrics
    };
  }

  /**
   * Calculate conversion rate between stages
   */
  private calculateConversionRate(fromCount: number, toCount: number): number {
    if (fromCount === 0) return 0;
    return Math.round((toCount / (fromCount + toCount)) * 100);
  }
}

/**
 * Export singleton instance
 */
export const kanbanIntegration = new KanbanIntegration();