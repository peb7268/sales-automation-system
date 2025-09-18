/**
 * Obsidian Prospect Sync Service
 * Handles syncing prospect data to Obsidian vault with proper formatting
 */

import fs from 'fs';
import path from 'path';
import { Prospect, ProspectFrontmatter } from '../../types/prospect';
import { MarketingStrategy } from '../marketing/strategy-generator';
import { MarketingStrategyFormatter } from './marketing-strategy-formatter';
import { Logger } from '../logging';

export interface ObsidianSyncOptions {
  vaultPath: string;
  createDailyNote?: boolean;
  updateKanban?: boolean;
  generateAnalytics?: boolean;
}

export interface DailyNoteEntry {
  date: string;
  prospectsAdded: number;
  totalQualified: number;
  topProspects: Array<{
    name: string;
    score: number;
    industry: string;
    location: string;
  }>;
  apiUsage: {
    googleMaps: number;
    yellowPages: number;
    firecrawl: number;
    perplexity: number;
  };
}

export class ObsidianProspectSync {
  private logger: Logger;
  private vaultPath: string;
  private prospectsPath: string;
  private dailyNotePath: string;
  private kanbanPath: string;
  private dashboardPath: string;
  private marketingFormatter: MarketingStrategyFormatter;

  constructor(vaultPath: string) {
    this.logger = new Logger('ObsidianProspectSync');
    this.vaultPath = vaultPath;
    this.marketingFormatter = new MarketingStrategyFormatter();
    
    // Use environment variables for specific paths, fallback to defaults
    this.prospectsPath = process.env.OBSIDIAN_PROSPECTS_PATH || path.join(vaultPath, 'prospects');
    this.dailyNotePath = process.env.OBSIDIAN_DAILY_NOTE_PATH || path.join(vaultPath, 'Daily Notes');
    this.kanbanPath = process.env.OBSIDIAN_KANBAN_FILE || path.join(vaultPath, 'Sales-Pipeline-Kanban.md');
    this.dashboardPath = process.env.OBSIDIAN_DASHBOARD_FILE || path.join(vaultPath, 'Sales-Analytics-Dashboard.md');
    
    if (!fs.existsSync(vaultPath)) {
      throw new Error(`Obsidian vault path does not exist: ${vaultPath}`);
    }
    
    this.logger.info('Obsidian Prospect Sync initialized', { 
      vaultPath,
      prospectsPath: this.prospectsPath,
      dailyNotePath: this.dailyNotePath
    });
  }

  /**
   * Sync prospects to Obsidian vault
   */
  async syncProspects(prospects: Prospect[], options: Partial<ObsidianSyncOptions> = {}): Promise<void> {
    const syncOptions: ObsidianSyncOptions = {
      vaultPath: this.vaultPath,
      createDailyNote: true,
      updateKanban: true,
      generateAnalytics: true,
      ...options
    };

    try {
      // Ensure directory structure exists
      await this.ensureDirectoryStructure();

      // Save individual prospect files
      const savedCount = await this.saveProspectFiles(prospects);

      // Update daily note if enabled
      if (syncOptions.createDailyNote) {
        await this.updateDailyNote(prospects);
      }

      // Update kanban board if enabled
      if (syncOptions.updateKanban) {
        await this.updateKanbanBoard(prospects);
      }

      // Generate analytics if enabled
      if (syncOptions.generateAnalytics) {
        await this.generateAnalyticsDashboard(prospects);
      }

      this.logger.info('Prospect sync completed', {
        prospectsProcessed: prospects.length,
        prospectsSaved: savedCount,
        dailyNoteUpdated: syncOptions.createDailyNote,
        kanbanUpdated: syncOptions.updateKanban,
        analyticsGenerated: syncOptions.generateAnalytics
      });

    } catch (error: any) {
      this.logger.error('Failed to sync prospects to Obsidian', {
        error: error.message,
        vaultPath: this.vaultPath,
        prospectCount: prospects.length
      });
      throw error;
    }
  }

  /**
   * Ensure required directory structure exists in vault
   */
  private async ensureDirectoryStructure(): Promise<void> {
    // Ensure the main prospects directory exists
    if (!fs.existsSync(this.prospectsPath)) {
      fs.mkdirSync(this.prospectsPath, { recursive: true });
      this.logger.debug(`Created prospects directory: ${this.prospectsPath}`);
    }

    // Ensure daily notes directory exists
    if (!fs.existsSync(this.dailyNotePath)) {
      fs.mkdirSync(this.dailyNotePath, { recursive: true });
      this.logger.debug(`Created daily notes directory: ${this.dailyNotePath}`);
    }

    // Ensure dashboard directory exists
    const dashboardDir = path.dirname(this.dashboardPath);
    if (!fs.existsSync(dashboardDir)) {
      fs.mkdirSync(dashboardDir, { recursive: true });
      this.logger.debug(`Created dashboard directory: ${dashboardDir}`);
    }

    this.logger.debug('Directory structure verified');
  }

  /**
   * Save individual prospect files to vault
   */
  private async saveProspectFiles(prospects: Prospect[]): Promise<number> {
    let savedCount = 0;

    for (const prospect of prospects) {
      try {
        // Create business-specific directory
        const safeBusinessName = prospect.business.name
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .toLowerCase();
        
        const prospectDir = path.join(this.prospectsPath, safeBusinessName);
        
        if (!fs.existsSync(prospectDir)) {
          fs.mkdirSync(prospectDir, { recursive: true });
        }

        // Generate prospect file content
        const fileContent = this.generateProspectMarkdown(prospect);
        
        // Use a simple filename since the folder is already the business name
        const fileName = `prospect-profile.md`;
        const filePath = path.join(prospectDir, fileName);

        // Write file
        fs.writeFileSync(filePath, fileContent, 'utf8');
        savedCount++;

        this.logger.info('Saved prospect file', {
          businessName: prospect.business.name,
          filePath: filePath,
          qualificationScore: prospect.qualificationScore.total
        });

      } catch (error: any) {
        this.logger.error('Failed to save prospect file', {
          businessName: prospect.business.name,
          error: error.message
        });
      }
    }

    return savedCount;
  }

  /**
   * Generate Markdown content for prospect profile
   */
  private generateProspectMarkdown(prospect: Prospect): string {
    const frontmatter = this.generateFrontmatter(prospect);
    
    return `---
${frontmatter}
---

# ${prospect.business.name}

## Business Information

- **Industry:** ${prospect.business.industry}
- **Location:** ${prospect.business.location.city}, ${prospect.business.location.state}
- **Business Size:** ${prospect.business.size.category} (${prospect.business.size.employeeCount || 'Unknown'} employees)
- **Estimated Revenue:** $${prospect.business.size.estimatedRevenue?.toLocaleString() || 'Unknown'}

## Contact Details

- **Phone:** ${prospect.contact.phone || 'Not available'}
- **Email:** ${prospect.contact.email || 'Not available'}
- **Website:** ${prospect.contact.website || 'Not available'}
- **Primary Contact:** ${prospect.contact.primaryContact || 'Unknown'}
- **Decision Maker:** ${prospect.contact.decisionMaker || 'Unknown'}

## Qualification Score: ${prospect.qualificationScore.total}/100

### Score Breakdown
- **Business Size:** ${prospect.qualificationScore.breakdown.businessSize}/20
- **Digital Presence:** ${prospect.qualificationScore.breakdown.digitalPresence}/25
- **Location:** ${prospect.qualificationScore.breakdown.location}/15
- **Industry:** ${prospect.qualificationScore.breakdown.industry}/10
- **Revenue Indicators:** ${prospect.qualificationScore.breakdown.revenueIndicators}/10
- **Competitor Gaps:** ${prospect.qualificationScore.breakdown.competitorGaps}/20

## Digital Presence Analysis

${prospect.business.digitalPresence ? `
- **Has Website:** ${prospect.business.digitalPresence.hasWebsite ? '✅' : '❌'}
- **Google Business:** ${prospect.business.digitalPresence.hasGoogleBusiness ? '✅' : '❌'}
- **Social Media:** ${prospect.business.digitalPresence.hasSocialMedia ? '✅' : '❌'}
- **Online Reviews:** ${prospect.business.digitalPresence.hasOnlineReviews ? '✅' : '❌'}
` : 'Digital presence analysis not available'}

## Competitive Analysis

${prospect.competitors ? `
### Identified Gaps
${prospect.competitors.competitiveGaps.map(gap => `- ${gap}`).join('\n')}

### Opportunity Areas
${prospect.competitors.opportunityAreas.map(opportunity => `- ${opportunity}`).join('\n')}
` : 'Competitive analysis pending'}

${prospect.marketingStrategy ? this.marketingFormatter.formatStrategy(prospect.marketingStrategy, prospect.business.name) : ''}

## Interaction History

${prospect.interactions.length > 0 ? 
  prospect.interactions.map(interaction => `
### ${interaction.date.toISOString().split('T')[0]} - ${interaction.type}
- **Outcome:** ${interaction.outcome}
- **Agent:** ${interaction.agentResponsible}
- **Notes:** ${interaction.notes}
${interaction.nextSteps ? `- **Next Steps:** ${interaction.nextSteps.join(', ')}` : ''}
`).join('\n') : 
  'No interactions recorded yet'
}

## Next Actions

- [ ] Initial outreach via email
- [ ] Follow-up phone call
- [ ] Send customized pitch
- [ ] Schedule discovery meeting

## Notes

_Add your notes about this prospect here..._

---

**Created:** ${prospect.created.toISOString().split('T')[0]}  
**Last Updated:** ${prospect.updated.toISOString().split('T')[0]}  
**Pipeline Stage:** ${prospect.pipelineStage}  
**Tags:** ${prospect.tags.join(', ')}
`;
  }

  /**
   * Generate YAML frontmatter for prospect
   */
  private generateFrontmatter(prospect: Prospect): string {
    const frontmatter: ProspectFrontmatter = {
      type: 'prospect-profile',
      company: prospect.business.name,
      industry: prospect.business.industry,
      location: `${prospect.business.location.city}, ${prospect.business.location.state}`,
      qualification_score: prospect.qualificationScore.total,
      pipeline_stage: prospect.pipelineStage,
      created: prospect.created.toISOString(),
      updated: prospect.updated.toISOString(),
      tags: prospect.tags,
      
      // Contact information
      primary_contact: prospect.contact.primaryContact,
      contact_title: prospect.contact.contactTitle,
      phone: prospect.contact.phone,
      email: prospect.contact.email,
      website: prospect.contact.website,
      decision_maker: prospect.contact.decisionMaker,
      
      // Business details
      employee_count: prospect.business.size.employeeCount,
      estimated_revenue: prospect.business.size.estimatedRevenue,
      business_size: prospect.business.size.category,
      
      // Digital presence flags
      has_website: prospect.business.digitalPresence?.hasWebsite,
      has_google_business: prospect.business.digitalPresence?.hasGoogleBusiness,
      has_social_media: prospect.business.digitalPresence?.hasSocialMedia,
      has_online_reviews: prospect.business.digitalPresence?.hasOnlineReviews,
      
      // Scoring breakdown
      score_business_size: prospect.qualificationScore.breakdown.businessSize,
      score_digital_presence: prospect.qualificationScore.breakdown.digitalPresence,
      score_competitor_gaps: prospect.qualificationScore.breakdown.competitorGaps,
      score_location: prospect.qualificationScore.breakdown.location,
      score_industry: prospect.qualificationScore.breakdown.industry,
      score_revenue: prospect.qualificationScore.breakdown.revenueIndicators
    };

    // Convert to YAML format
    const yamlLines: string[] = [];
    Object.entries(frontmatter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          yamlLines.push(`${key}: [${value.map(v => `"${v}"`).join(', ')}]`);
        } else if (typeof value === 'string') {
          yamlLines.push(`${key}: "${value}"`);
        } else {
          yamlLines.push(`${key}: ${value}`);
        }
      }
    });

    return yamlLines.join('\n');
  }

  /**
   * Update daily note with prospecting activity
   */
  private async updateDailyNote(prospects: Prospect[]): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const dailyNotePath = path.join(this.dailyNotePath, `${today}.md`);

    let existingContent = '';
    if (fs.existsSync(dailyNotePath)) {
      existingContent = fs.readFileSync(dailyNotePath, 'utf8');
    }

    // Generate daily note entry
    const entry = this.generateDailyNoteSection(prospects);
    
    // If file exists, append to it; otherwise create new
    let newContent: string;
    if (existingContent) {
      // Check if prospecting section already exists
      if (existingContent.includes('## 🎯 Prospecting Activity')) {
        // Update existing section
        newContent = existingContent.replace(
          /## 🎯 Prospecting Activity[\s\S]*?(?=\n## |$)/,
          entry
        );
      } else {
        // Append new section
        newContent = existingContent + '\n\n' + entry;
      }
    } else {
      // Create new daily note
      newContent = `# Daily Note - ${today}\n\n${entry}`;
    }

    fs.writeFileSync(dailyNotePath, newContent, 'utf8');
    
    this.logger.debug('Updated daily note', { 
      date: today, 
      prospectsAdded: prospects.length 
    });
  }

  /**
   * Generate daily note section for prospecting activity
   */
  private generateDailyNoteSection(prospects: Prospect[]): string {
    const qualifiedProspects = prospects.filter(p => p.qualificationScore.total >= 50);
    const topProspects = prospects
      .sort((a, b) => b.qualificationScore.total - a.qualificationScore.total)
      .slice(0, 3);

    return `## 🎯 Prospecting Activity

### Summary
- **Total Prospects Found:** ${prospects.length}
- **Qualified Prospects:** ${qualifiedProspects.length}
- **Average Score:** ${Math.round(prospects.reduce((sum, p) => sum + p.qualificationScore.total, 0) / prospects.length)}

### Top Prospects
${topProspects.map((prospect, index) => `
${index + 1}. **[[${prospect.business.name}]]** (${prospect.qualificationScore.total}/100)
   - Industry: ${prospect.business.industry}
   - Location: ${prospect.business.location.city}, ${prospect.business.location.state}
   - Contact: ${prospect.contact.phone || 'Phone N/A'} | ${prospect.contact.email || 'Email N/A'}
`).join('')}

### Next Actions
${qualifiedProspects.map(prospect => `- [ ] Reach out to [[${prospect.business.name}]]`).join('\n')}

---
`;
  }

  /**
   * Update Kanban board with new prospects
   */
  private async updateKanbanBoard(prospects: Prospect[]): Promise<void> {
    const kanbanPath = path.join(this.vaultPath, 'dashboards', 'sales-pipeline.md');
    
    // This is a placeholder - actual Kanban integration would depend on the Kanban plugin format
    let kanbanContent = `# Sales Pipeline\n\n`;
    
    const stages = ['cold', 'contacted', 'interested', 'qualified', 'closed_won', 'closed_lost'];
    
    for (const stage of stages) {
      const stageProspects = prospects.filter(p => p.pipelineStage === stage);
      kanbanContent += `## ${stage.charAt(0).toUpperCase() + stage.slice(1).replace('_', ' ')}\n\n`;
      
      if (stageProspects.length > 0) {
        stageProspects.forEach(prospect => {
          kanbanContent += `- [[${prospect.business.name}]] (${prospect.qualificationScore.total}/100)\n`;
        });
      } else {
        kanbanContent += `_No prospects in this stage_\n`;
      }
      
      kanbanContent += '\n';
    }

    fs.writeFileSync(kanbanPath, kanbanContent, 'utf8');
    
    this.logger.debug('Updated Kanban board', { 
      totalProspects: prospects.length 
    });
  }

  /**
   * Generate analytics dashboard
   */
  private async generateAnalyticsDashboard(prospects: Prospect[]): Promise<void> {
    const dashboardPath = path.join(this.vaultPath, 'dashboards', 'sales-analytics.md');
    
    const analytics = this.calculateAnalytics(prospects);
    
    const dashboardContent = `# Sales Analytics Dashboard

*Last Updated: ${new Date().toISOString().split('T')[0]}*

## Pipeline Overview

- **Total Active Prospects:** ${prospects.length}
- **Qualified Prospects:** ${analytics.qualifiedCount}
- **Average Qualification Score:** ${analytics.averageScore}/100
- **Conversion Rate:** ${analytics.conversionRate}%

## Score Distribution

- **90-100 (Excellent):** ${analytics.scoreDistribution.excellent}
- **70-89 (Good):** ${analytics.scoreDistribution.good}
- **50-69 (Fair):** ${analytics.scoreDistribution.fair}
- **Below 50 (Poor):** ${analytics.scoreDistribution.poor}

## Industry Breakdown

${Object.entries(analytics.industryBreakdown).map(([industry, count]) => 
  `- **${industry}:** ${count} prospects`
).join('\n')}

## Location Distribution

${Object.entries(analytics.locationBreakdown).map(([location, count]) => 
  `- **${location}:** ${count} prospects`
).join('\n')}

## Digital Presence Analysis

- **Has Website:** ${analytics.digitalPresence.hasWebsite}%
- **Google Business:** ${analytics.digitalPresence.hasGoogleBusiness}%
- **Social Media:** ${analytics.digitalPresence.hasSocialMedia}%
- **Online Reviews:** ${analytics.digitalPresence.hasOnlineReviews}%

## Performance Metrics

- **Daily Prospect Target:** 10
- **Current Daily Average:** ${analytics.dailyAverage}
- **Monthly Target:** 300
- **Monthly Progress:** ${analytics.monthlyProgress}%

---

*Generated automatically by Sales Automation System*
`;

    fs.writeFileSync(dashboardPath, dashboardContent, 'utf8');
    
    this.logger.debug('Generated analytics dashboard', { 
      totalProspects: prospects.length,
      qualifiedCount: analytics.qualifiedCount
    });
  }

  /**
   * Calculate analytics from prospects data
   */
  private calculateAnalytics(prospects: Prospect[]) {
    const qualifiedCount = prospects.filter(p => p.qualificationScore.total >= 50).length;
    const averageScore = Math.round(
      prospects.reduce((sum, p) => sum + p.qualificationScore.total, 0) / prospects.length
    );

    const scoreDistribution = {
      excellent: prospects.filter(p => p.qualificationScore.total >= 90).length,
      good: prospects.filter(p => p.qualificationScore.total >= 70 && p.qualificationScore.total < 90).length,
      fair: prospects.filter(p => p.qualificationScore.total >= 50 && p.qualificationScore.total < 70).length,
      poor: prospects.filter(p => p.qualificationScore.total < 50).length
    };

    const industryBreakdown: Record<string, number> = {};
    const locationBreakdown: Record<string, number> = {};

    prospects.forEach(prospect => {
      const industry = prospect.business.industry;
      const location = `${prospect.business.location.city}, ${prospect.business.location.state}`;
      
      industryBreakdown[industry] = (industryBreakdown[industry] || 0) + 1;
      locationBreakdown[location] = (locationBreakdown[location] || 0) + 1;
    });

    const digitalPresence = {
      hasWebsite: Math.round((prospects.filter(p => p.business.digitalPresence?.hasWebsite).length / prospects.length) * 100),
      hasGoogleBusiness: Math.round((prospects.filter(p => p.business.digitalPresence?.hasGoogleBusiness).length / prospects.length) * 100),
      hasSocialMedia: Math.round((prospects.filter(p => p.business.digitalPresence?.hasSocialMedia).length / prospects.length) * 100),
      hasOnlineReviews: Math.round((prospects.filter(p => p.business.digitalPresence?.hasOnlineReviews).length / prospects.length) * 100)
    };

    return {
      qualifiedCount,
      averageScore,
      conversionRate: Math.round((qualifiedCount / prospects.length) * 100),
      scoreDistribution,
      industryBreakdown,
      locationBreakdown,
      digitalPresence,
      dailyAverage: Math.round(prospects.length / 30), // Assuming monthly data
      monthlyProgress: Math.round((prospects.length / 300) * 100) // Against 300 monthly target
    };
  }
}