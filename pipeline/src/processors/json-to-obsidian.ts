/**
 * JSON to Obsidian Processor
 * Handles conversion of JSON task outputs to Obsidian markdown format
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '@utils/logging';
import { generateFrontmatter } from '@utils/obsidian/frontmatter-parser';
import { vaultIntegration } from '@utils/obsidian/vault-integration';

export interface JSONProcessorOptions {
  outputDir?: string;
  preserveJSON?: boolean;
  validateSchema?: boolean;
}

export interface ProcessingResult {
  success: boolean;
  inputFile?: string;
  outputFile?: string;
  error?: string;
  metadata?: any;
}

export class JSONToObsidianProcessor {
  private readonly outputDir: string;
  private readonly obsidianVaultPath: string;

  constructor(options: JSONProcessorOptions = {}) {
    this.outputDir = options.outputDir || 'data/output/json';
    this.obsidianVaultPath = process.env.OBSIDIAN_VAULT_PATH || '/Users/pbarrick/Documents/Main';
  }

  /**
   * Process JSON task output and convert to Obsidian format
   */
  async processTaskOutput(
    taskId: string, 
    outputData: any, 
    destination: string
  ): Promise<ProcessingResult> {
    try {
      logger.info(`Processing JSON output for task: ${taskId}`);

      // Save raw JSON first
      const jsonFile = await this.saveRawJSON(taskId, outputData);

      // Process based on destination type
      let result: ProcessingResult;
      switch (destination) {
        case 'obsidian_prospects':
          result = await this.processProspectData(outputData);
          break;
        case 'obsidian_pitches':
          result = await this.processPitchData(outputData);
          break;
        case 'obsidian_activities':
          result = await this.processActivityData(outputData);
          break;
        case 'obsidian_dashboard':
          result = await this.processDashboardData(outputData);
          break;
        case 'obsidian_kanban':
          result = await this.processKanbanData(outputData);
          break;
        case 'obsidian_reports':
          result = await this.processReportData(outputData);
          break;
        default:
          throw new Error(`Unknown destination: ${destination}`);
      }

      result.inputFile = jsonFile;
      logger.info(`Successfully processed JSON output: ${taskId}`);
      
      return result;

    } catch (error) {
      logger.error(`Failed to process JSON output for ${taskId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Save raw JSON output to file system
   */
  private async saveRawJSON(taskId: string, data: any): Promise<string> {
    await fs.mkdir(this.outputDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${taskId}_${timestamp}.json`;
    const filepath = path.join(this.outputDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf8');
    
    return filepath;
  }

  /**
   * Process prospect data and create/update prospect files
   */
  private async processProspectData(outputData: any): Promise<ProcessingResult> {
    try {
      const prospects = Array.isArray(outputData.data) ? outputData.data : [outputData.data];
      const results: string[] = [];

      for (const prospectData of prospects) {
        // Convert to prospect format
        const prospect = this.convertToProspectFormat(prospectData);
        
        // Create prospect file
        const result = await vaultIntegration.createProspectProfile(prospect);
        
        if (result.success && result.filePath) {
          results.push(result.filePath);
        }
      }

      return {
        success: true,
        outputFile: results.join(', '),
        metadata: { 
          prospect_count: prospects.length,
          files_created: results.length
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process pitch data and update pitch files
   */
  private async processPitchData(outputData: any): Promise<ProcessingResult> {
    try {
      const pitchData = outputData.data;
      const prospectFolder = pitchData.prospect_folder || pitchData.company_slug;
      
      if (!prospectFolder) {
        throw new Error('Prospect folder not specified in pitch data');
      }

      // Generate pitch content
      const pitchContent = this.generatePitchMarkdown(pitchData);
      
      // Write to pitch.md file
      const pitchPath = path.join(
        this.obsidianVaultPath,
        'Projects/Sales/Prospects',
        prospectFolder,
        'pitch.md'
      );
      
      await fs.writeFile(pitchPath, pitchContent, 'utf8');

      return {
        success: true,
        outputFile: pitchPath,
        metadata: {
          prospect_folder: prospectFolder,
          pitch_version: pitchData.version || '1.0'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process activity data and create activity files
   */
  private async processActivityData(outputData: any): Promise<ProcessingResult> {
    try {
      const activities = Array.isArray(outputData.data) ? outputData.data : [outputData.data];
      const results: string[] = [];

      for (const activityData of activities) {
        const activityContent = this.generateActivityMarkdown(activityData);
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${activityData.type || 'activity'}_${timestamp}.md`;
        const activityPath = path.join(
          this.obsidianVaultPath,
          'Projects/Sales/Activities',
          filename
        );
        
        await fs.mkdir(path.dirname(activityPath), { recursive: true });
        await fs.writeFile(activityPath, activityContent, 'utf8');
        results.push(activityPath);
      }

      return {
        success: true,
        outputFile: results.join(', '),
        metadata: {
          activity_count: activities.length,
          files_created: results.length
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process dashboard data and update analytics dashboard
   */
  private async processDashboardData(outputData: any): Promise<ProcessingResult> {
    try {
      const dashboardPath = path.join(
        this.obsidianVaultPath,
        'Projects/Sales/Sales-Analytics-Dashboard.md'
      );

      // Read existing dashboard
      let existingContent = '';
      try {
        existingContent = await fs.readFile(dashboardPath, 'utf8');
      } catch (error) {
        // Dashboard doesn't exist, will create new one
      }

      // Update with new data
      const updatedContent = this.updateDashboardContent(existingContent, outputData);
      
      await fs.writeFile(dashboardPath, updatedContent, 'utf8');

      return {
        success: true,
        outputFile: dashboardPath,
        metadata: {
          updated_at: new Date().toISOString(),
          metrics_count: Object.keys(outputData.data || {}).length
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process kanban data and update kanban board
   */
  private async processKanbanData(outputData: any): Promise<ProcessingResult> {
    try {
      const kanbanPath = path.join(
        this.obsidianVaultPath,
        'Projects/Sales/Sales-Pipeline-Kanban.md'
      );

      // Generate kanban content
      const kanbanContent = this.generateKanbanMarkdown(outputData);
      
      await fs.writeFile(kanbanPath, kanbanContent, 'utf8');

      return {
        success: true,
        outputFile: kanbanPath,
        metadata: {
          updated_at: new Date().toISOString(),
          prospects_synced: outputData.data?.prospects?.length || 0
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process report data and create report files
   */
  private async processReportData(outputData: any): Promise<ProcessingResult> {
    try {
      const reportData = outputData.data;
      const reportType = reportData.type || 'performance';
      const timestamp = new Date().toISOString().slice(0, 10);
      
      const reportContent = this.generateReportMarkdown(reportData);
      
      const reportsDir = path.join(this.obsidianVaultPath, 'Projects/Sales/Reports');
      await fs.mkdir(reportsDir, { recursive: true });
      
      const reportPath = path.join(reportsDir, `${reportType}_${timestamp}.md`);
      await fs.writeFile(reportPath, reportContent, 'utf8');

      return {
        success: true,
        outputFile: reportPath,
        metadata: {
          report_type: reportType,
          period: reportData.period,
          generated_at: timestamp
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Convert raw data to prospect format
   */
  private convertToProspectFormat(data: any): any {
    return {
      companyName: data.company || data.name,
      industry: data.industry,
      location: data.location,
      primaryContact: data.contact?.name || data.primary_contact,
      contactTitle: data.contact?.title || data.contact_title,
      phone: data.contact?.phone || data.phone,
      email: data.contact?.email || data.email,
      website: data.website,
      estimatedRevenue: data.estimated_revenue || data.revenue,
      businessSize: data.business_size || data.size,
      qualificationScore: data.qualification_score || 50,
      pipelineStage: data.pipeline_stage || 'cold',
      digitalPresence: {
        hasWebsite: data.has_website || false,
        hasGoogleBusiness: data.has_google_business || false,
        hasSocialMedia: data.has_social_media || false,
        hasOnlineReviews: data.has_online_reviews || false
      }
    };
  }

  /**
   * Generate pitch markdown content
   */
  private generatePitchMarkdown(pitchData: any): string {
    const frontmatter = generateFrontmatter({
      type: 'prospect-pitch',
      company: pitchData.company,
      industry: pitchData.industry,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      status: 'generated',
      pitch_version: pitchData.version || '1.0',
      qualification_score: pitchData.qualification_score,
      tags: ['sales', 'pitch', pitchData.industry, 'ai-generated', 'json-processed']
    });

    return `${frontmatter}
# Custom Pitch - ${pitchData.company}

> **AI-Generated Sales Pitch**
> 
> Generated from JSON task output and processed into Obsidian format

## 🎯 Opening Hook

${pitchData.hook || 'Personalized opening message...'}

## 💎 Value Proposition

${pitchData.value_proposition || 'Customized value proposition...'}

## 📊 Proof Points & Case Studies

${pitchData.proof_points || 'Industry-relevant case studies...'}

## 💰 ROI Projection

${pitchData.roi_projection || 'Financial impact analysis...'}

## 🚀 Next Steps

${pitchData.call_to_action || 'Tailored call to action...'}

---

## 📋 Generation Metadata

**Generated At**: ${new Date().toISOString()}
**Task ID**: ${pitchData.task_id || 'unknown'}
**Processing Method**: JSON → Obsidian
**Agent**: ${pitchData.agent || 'pitch_creator_agent'}

---

*This pitch was generated via JSON task processing*
*Prospect data source: [[index|Prospect Profile]]*`;
  }

  /**
   * Generate activity markdown content
   */
  private generateActivityMarkdown(activityData: any): string {
    const frontmatter = generateFrontmatter({
      type: 'activity-log',
      prospect: activityData.prospect || activityData.company,
      activity_type: activityData.type || activityData.activity_type,
      date: activityData.date || new Date().toISOString(),
      outcome: activityData.outcome || 'pending',
      agent_responsible: activityData.agent || 'system',
      tags: ['activity', activityData.type, 'json-processed']
    });

    return `${frontmatter}
# ${activityData.type || 'Activity'} - ${activityData.prospect || 'Unknown'}

## 📋 Activity Details

**Type**: ${activityData.type || 'Unknown'}
**Date**: ${activityData.date || new Date().toLocaleDateString()}
**Outcome**: ${activityData.outcome || 'Pending'}
**Duration**: ${activityData.duration || 'N/A'}

## 📝 Notes

${activityData.notes || 'No additional notes provided.'}

## 🎯 Next Actions

${activityData.next_actions || 'No follow-up actions specified.'}

---

*Generated via JSON task processing at ${new Date().toISOString()}*`;
  }

  /**
   * Update dashboard content with new data
   */
  private updateDashboardContent(existingContent: string, outputData: any): string {
    // This is a simplified version - would be enhanced to properly merge data
    const timestamp = new Date().toISOString();
    
    if (!existingContent) {
      // Create new dashboard if none exists
      return this.generateNewDashboard(outputData);
    }
    
    // Update existing dashboard
    // For now, append new data - would be enhanced to merge properly
    return existingContent + `\n\n<!-- Updated: ${timestamp} via JSON processing -->\n`;
  }

  /**
   * Generate new dashboard content
   */
  private generateNewDashboard(outputData: any): string {
    const frontmatter = generateFrontmatter({
      type: 'analytics-dashboard',
      title: 'Sales Analytics Dashboard',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      tags: ['sales', 'analytics', 'dashboard', 'json-processed']
    });

    return `${frontmatter}
# 📊 Sales Analytics Dashboard

## 🎯 Executive Summary

**Generated**: ${new Date().toLocaleDateString()}
**Data Processing**: JSON → Obsidian Pipeline

## 📈 Performance Metrics

*Dashboard content generated from JSON task output*

---

*Generated via JSON task processing system*`;
  }

  /**
   * Generate kanban markdown content
   */
  private generateKanbanMarkdown(outputData: any): string {
    // Simplified kanban generation - would be enhanced with actual prospect data
    return `---
kanban-plugin: basic
kanban-settings: {"hide-card-count":false}
---

# Sales Pipeline - JSON Processed

## 🧊 Cold

${this.generateKanbanCards(outputData.data?.prospects?.filter((p: any) => p.stage === 'cold') || [])}

## 📞 Contacted

${this.generateKanbanCards(outputData.data?.prospects?.filter((p: any) => p.stage === 'contacted') || [])}

## 💬 Interested

${this.generateKanbanCards(outputData.data?.prospects?.filter((p: any) => p.stage === 'interested') || [])}

---

*Updated via JSON processing at ${new Date().toISOString()}*`;
  }

  /**
   * Generate kanban cards from prospect data
   */
  private generateKanbanCards(prospects: any[]): string {
    return prospects.map(prospect => 
      `- [ ] **${prospect.company}**<br/>📍 ${prospect.location}<br/>⭐ Score: ${prospect.qualification_score}/100`
    ).join('\n');
  }

  /**
   * Generate report markdown content
   */
  private generateReportMarkdown(reportData: any): string {
    const frontmatter = generateFrontmatter({
      type: 'performance-report',
      report_type: reportData.type,
      period: reportData.period,
      generated: new Date().toISOString(),
      tags: ['report', 'performance', 'json-processed']
    });

    return `${frontmatter}
# ${reportData.type || 'Performance'} Report - ${reportData.period || 'Current'}

## 📊 Summary

**Report Period**: ${reportData.period || 'Unknown'}
**Generated**: ${new Date().toLocaleDateString()}

## 📈 Key Metrics

${Object.entries(reportData.metrics || {}).map(([key, value]) => 
  `- **${key}**: ${value}`
).join('\n')}

## 🎯 Recommendations

${reportData.recommendations || 'No recommendations available.'}

---

*Generated via JSON task processing system*`;
  }
}

export const jsonToObsidianProcessor = new JSONToObsidianProcessor();