/**
 * Enhanced Incremental Prospect Sync Service
 * Handles graceful failures and incremental updates to prevent data loss
 */

import fs from 'fs';
import path from 'path';
import { Prospect, ProspectFrontmatter } from '../../types/prospect';
import { MarketingStrategy } from '../marketing/strategy-generator';
import { MarketingStrategyFormatter } from './marketing-strategy-formatter';
import { Logger } from '../logging';

export interface ProcessingAttempt {
  timestamp: string;
  passNumber: number;
  passName: string;
  status: 'success' | 'failed' | 'partial';
  dataExtracted: string[];
  errors: string[];
  retryable: boolean;
}

export interface ProcessingHistory {
  totalAttempts: number;
  lastAttempt: string;
  successfulPasses: number[];
  failedPasses: number[];
  nextRetryPasses: number[];
  attempts: ProcessingAttempt[];
}

export interface ExistingProspectData {
  frontmatter: Record<string, any>;
  content: string;
  processingHistory: ProcessingHistory;
  lastModified: Date;
}

export class IncrementalProspectSync {
  private logger: Logger;
  private vaultPath: string;
  private prospectsPath: string;
  private marketingFormatter: MarketingStrategyFormatter;

  constructor(vaultPath: string) {
    this.logger = new Logger('IncrementalProspectSync');
    this.vaultPath = vaultPath;
    this.marketingFormatter = new MarketingStrategyFormatter();
    this.prospectsPath = process.env.OBSIDIAN_PROSPECTS_PATH || path.join(vaultPath, 'Projects', 'Sales', 'Prospects');
    
    if (!fs.existsSync(vaultPath)) {
      throw new Error(`Obsidian vault path does not exist: ${vaultPath}`);
    }
    
    this.logger.info('Incremental Prospect Sync initialized', { 
      vaultPath,
      prospectsPath: this.prospectsPath
    });
  }

  /**
   * Save or update prospect with incremental approach
   */
  async saveProspectIncremental(
    prospect: Prospect, 
    passResults: Array<{passNumber: number, passName: string, success: boolean, errors: string[], dataExtracted: Record<string, any>}>
  ): Promise<void> {
    try {
      const safeBusinessName = prospect.business.name
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase();
      
      const prospectDir = path.join(this.prospectsPath, safeBusinessName);
      const filePath = path.join(prospectDir, 'prospect-profile.md');

      // Ensure directory exists
      if (!fs.existsSync(prospectDir)) {
        fs.mkdirSync(prospectDir, { recursive: true });
      }

      // Read existing data if file exists
      let existingData: ExistingProspectData | null = null;
      if (fs.existsSync(filePath)) {
        existingData = await this.parseExistingProspect(filePath);
      }

      // Create processing history entry
      const processingHistory = this.updateProcessingHistory(existingData?.processingHistory, passResults);

      // Generate incremental content
      const updatedContent = await this.generateIncrementalContent(
        prospect,
        existingData,
        passResults,
        processingHistory
      );

      // Write updated content
      fs.writeFileSync(filePath, updatedContent, 'utf8');

      this.logger.info('Successfully saved/updated prospect', {
        businessName: prospect.business.name,
        filePath: filePath,
        isUpdate: existingData !== null,
        successfulPasses: processingHistory.successfulPasses,
        failedPasses: processingHistory.failedPasses
      });

    } catch (error: any) {
      this.logger.error('Failed to save prospect incrementally', {
        businessName: prospect.business.name,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Parse existing prospect file to extract current data
   */
  private async parseExistingProspect(filePath: string): Promise<ExistingProspectData> {
    const content = fs.readFileSync(filePath, 'utf8');
    const stats = fs.statSync(filePath);

    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    let frontmatter: Record<string, any> = {};
    
    if (frontmatterMatch) {
      const frontmatterText = frontmatterMatch[1];
      // Simple YAML parsing for our specific format
      const lines = frontmatterText.split('\n');
      for (const line of lines) {
        const match = line.match(/^(\w+):\s*(.+)$/);
        if (match) {
          const [, key, value] = match;
          // Parse different value types
          if (value.startsWith('[') && value.endsWith(']')) {
            // Array
            frontmatter[key] = JSON.parse(value.replace(/"/g, '"'));
          } else if (value === 'true' || value === 'false') {
            frontmatter[key] = value === 'true';
          } else if (!isNaN(Number(value))) {
            frontmatter[key] = Number(value);
          } else {
            frontmatter[key] = value.replace(/^"(.+)"$/, '$1');
          }
        }
      }
    }

    // Extract processing history if exists
    let processingHistory: ProcessingHistory = {
      totalAttempts: 0,
      lastAttempt: new Date().toISOString(),
      successfulPasses: [],
      failedPasses: [],
      nextRetryPasses: [],
      attempts: []
    };

    const historyMatch = content.match(/## 🔄 Processing History\n\n([\s\S]*?)(?=\n## |$)/);
    if (historyMatch) {
      processingHistory = this.parseProcessingHistory(historyMatch[1]);
    }

    return {
      frontmatter,
      content,
      processingHistory,
      lastModified: stats.mtime
    };
  }

  /**
   * Parse processing history from markdown content
   */
  private parseProcessingHistory(historyText: string): ProcessingHistory {
    const history: ProcessingHistory = {
      totalAttempts: 0,
      lastAttempt: new Date().toISOString(),
      successfulPasses: [],
      failedPasses: [],
      nextRetryPasses: [],
      attempts: []
    };

    // Extract basic stats
    const statsMatch = historyText.match(/- \*\*Total Attempts:\*\* (\d+)/);
    if (statsMatch) history.totalAttempts = parseInt(statsMatch[1]);

    const lastAttemptMatch = historyText.match(/- \*\*Last Attempt:\*\* (.+)/);
    if (lastAttemptMatch) history.lastAttempt = lastAttemptMatch[1];

    const successMatch = historyText.match(/- \*\*Successful Passes:\*\* \[(.+)\]/);
    if (successMatch && successMatch[1].trim()) {
      history.successfulPasses = successMatch[1].split(',').map(n => parseInt(n.trim()));
    }

    const failedMatch = historyText.match(/- \*\*Failed Passes:\*\* \[(.+)\]/);
    if (failedMatch && failedMatch[1].trim()) {
      history.failedPasses = failedMatch[1].split(',').map(n => parseInt(n.trim()));
    }

    const retryMatch = historyText.match(/- \*\*Next Retry Passes:\*\* \[(.+)\]/);
    if (retryMatch && retryMatch[1].trim()) {
      history.nextRetryPasses = retryMatch[1].split(',').map(n => parseInt(n.trim()));
    }

    return history;
  }

  /**
   * Update processing history with current attempt results
   */
  private updateProcessingHistory(
    existingHistory: ProcessingHistory | undefined,
    passResults: Array<{passNumber: number, passName: string, success: boolean, errors: string[], dataExtracted: Record<string, any>}>
  ): ProcessingHistory {
    const history: ProcessingHistory = existingHistory || {
      totalAttempts: 0,
      lastAttempt: new Date().toISOString(),
      successfulPasses: [],
      failedPasses: [],
      nextRetryPasses: [],
      attempts: []
    };

    // Update with current attempt
    history.totalAttempts += 1;
    history.lastAttempt = new Date().toISOString();

    // Process current results
    const currentAttempt: ProcessingAttempt = {
      timestamp: new Date().toISOString(),
      passNumber: 0, // Will be set per pass
      passName: 'Multi-pass processing',
      status: 'partial',
      dataExtracted: [],
      errors: [],
      retryable: true
    };

    // Update pass tracking
    for (const result of passResults) {
      if (result.success && !history.successfulPasses.includes(result.passNumber)) {
        history.successfulPasses.push(result.passNumber);
        // Remove from failed if it was there
        history.failedPasses = history.failedPasses.filter(p => p !== result.passNumber);
        // Remove from retry list
        history.nextRetryPasses = history.nextRetryPasses.filter(p => p !== result.passNumber);
      } else if (!result.success && !history.failedPasses.includes(result.passNumber)) {
        history.failedPasses.push(result.passNumber);
        // Add to retry list if errors are retryable
        const retryableErrors = result.errors.some(error => 
          error.includes('API') || 
          error.includes('timeout') || 
          error.includes('rate limit') ||
          error.includes('network')
        );
        if (retryableErrors && !history.nextRetryPasses.includes(result.passNumber)) {
          history.nextRetryPasses.push(result.passNumber);
        }
      }

      currentAttempt.errors.push(...result.errors);
      currentAttempt.dataExtracted.push(...Object.keys(result.dataExtracted));
    }

    // Determine overall status
    const totalPasses = 5; // We expect 5 passes
    if (history.successfulPasses.length === totalPasses) {
      currentAttempt.status = 'success';
    } else if (history.successfulPasses.length > 0) {
      currentAttempt.status = 'partial';
    } else {
      currentAttempt.status = 'failed';
    }

    history.attempts.push(currentAttempt);

    // Keep only last 10 attempts
    if (history.attempts.length > 10) {
      history.attempts = history.attempts.slice(-10);
    }

    // Sort arrays for consistency
    history.successfulPasses.sort();
    history.failedPasses.sort();
    history.nextRetryPasses.sort();

    return history;
  }

  /**
   * Generate incremental content preserving existing data
   */
  private async generateIncrementalContent(
    prospect: Prospect,
    existingData: ExistingProspectData | null,
    passResults: Array<{passNumber: number, passName: string, success: boolean, errors: string[], dataExtracted: Record<string, any>}>,
    processingHistory: ProcessingHistory
  ): string {
    // Start with updated frontmatter
    const frontmatter = this.generateIncrementalFrontmatter(prospect, existingData?.frontmatter);

    // Build content sections incrementally
    const sections = [];

    // Header
    sections.push(`# ${prospect.business.name}`);
    sections.push('');

    // Business Information - always update with latest data
    sections.push(this.generateBusinessInfoSection(prospect));

    // Contact Details - merge with existing if available
    sections.push(this.generateContactDetailsSection(prospect, existingData));

    // Qualification Score - always update
    sections.push(this.generateQualificationSection(prospect));

    // Digital Presence Analysis - merge with existing
    sections.push(this.generateDigitalPresenceSection(prospect, existingData));

    // Competitive Analysis - preserve existing, add new if available
    sections.push(this.generateCompetitiveAnalysisSection(prospect, existingData, passResults));

    // Marketing Strategy - preserve existing, add new if available
    if (prospect.marketingStrategy) {
      sections.push(this.marketingFormatter.formatStrategy(prospect.marketingStrategy, prospect.business.name));
    } else if (existingData?.content.includes('## 🚀 Digital Marketing Strategy')) {
      // Preserve existing marketing strategy
      const strategyMatch = existingData.content.match(/## 🚀 Digital Marketing Strategy\n\n([\s\S]*?)(?=\n## |$)/);
      if (strategyMatch) {
        sections.push('## 🚀 Digital Marketing Strategy\n');
        sections.push(strategyMatch[1]);
      }
    }

    // Processing History - always update
    sections.push(this.generateProcessingHistorySection(processingHistory, passResults));

    // Interaction History - preserve existing
    sections.push(this.generateInteractionHistorySection(prospect, existingData));

    // Next Actions - preserve existing checkmarks
    sections.push(this.generateNextActionsSection(existingData));

    // Notes - preserve existing
    sections.push(this.generateNotesSection(existingData));

    // Footer - update dates
    sections.push(this.generateFooterSection(prospect, existingData));

    // Combine all sections
    const content = `---\n${frontmatter}\n---\n\n${sections.join('\n')}`;
    return content;
  }

  /**
   * Generate incremental frontmatter preserving existing data
   */
  private generateIncrementalFrontmatter(prospect: Prospect, existingFrontmatter?: Record<string, any>): string {
    const frontmatter: Record<string, any> = {
      type: 'prospect-profile',
      company: prospect.business.name,
      industry: prospect.business.industry,
      location: `${prospect.business.location.city}, ${prospect.business.location.state}`,
      qualification_score: prospect.qualificationScore.total,
      pipeline_stage: prospect.pipelineStage,
      created: existingFrontmatter?.created || prospect.created.toISOString(),
      updated: new Date().toISOString(),
      tags: prospect.tags,
      
      // Contact information - preserve existing if new data not available
      phone: prospect.contact.phone || existingFrontmatter?.phone || '',
      email: prospect.contact.email || existingFrontmatter?.email || '',
      website: prospect.contact.website || existingFrontmatter?.website || '',
      business_size: prospect.business.size.category,
      
      // Digital presence flags
      has_website: prospect.business.digitalPresence?.hasWebsite ?? existingFrontmatter?.has_website ?? false,
      has_google_business: prospect.business.digitalPresence?.hasGoogleBusiness ?? existingFrontmatter?.has_google_business ?? false,
      has_social_media: prospect.business.digitalPresence?.hasSocialMedia ?? existingFrontmatter?.has_social_media ?? false,
      has_online_reviews: prospect.business.digitalPresence?.hasOnlineReviews ?? existingFrontmatter?.has_online_reviews ?? false,
      
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

  // Section generators with incremental logic
  private generateBusinessInfoSection(prospect: Prospect): string {
    return `## Business Information

- **Industry:** ${prospect.business.industry}
- **Location:** ${prospect.business.location.city}, ${prospect.business.location.state}
- **Business Size:** ${prospect.business.size.category} (${prospect.business.size.employeeCount || 'Unknown'} employees)
- **Estimated Revenue:** $${prospect.business.size.estimatedRevenue?.toLocaleString() || 'Unknown'}

`;
  }

  private generateContactDetailsSection(prospect: Prospect, existingData: ExistingProspectData | null): string {
    return `## Contact Details

- **Phone:** ${prospect.contact.phone || existingData?.frontmatter?.phone || 'Not available'}
- **Email:** ${prospect.contact.email || existingData?.frontmatter?.email || 'Not available'}
- **Website:** ${prospect.contact.website || existingData?.frontmatter?.website || 'Not available'}
- **Primary Contact:** ${prospect.contact.primaryContact || 'Unknown'}
- **Decision Maker:** ${prospect.contact.decisionMaker || 'Unknown'}

`;
  }

  private generateQualificationSection(prospect: Prospect): string {
    return `## Qualification Score: ${prospect.qualificationScore.total}/100

### Score Breakdown
- **Business Size:** ${prospect.qualificationScore.breakdown.businessSize}/20
- **Digital Presence:** ${prospect.qualificationScore.breakdown.digitalPresence}/25
- **Location:** ${prospect.qualificationScore.breakdown.location}/15
- **Industry:** ${prospect.qualificationScore.breakdown.industry}/10
- **Revenue Indicators:** ${prospect.qualificationScore.breakdown.revenueIndicators}/10
- **Competitor Gaps:** ${prospect.qualificationScore.breakdown.competitorGaps}/20

`;
  }

  private generateDigitalPresenceSection(prospect: Prospect, existingData: ExistingProspectData | null): string {
    const presence = prospect.business.digitalPresence || {};
    
    return `## Digital Presence Analysis

- **Has Website:** ${presence.hasWebsite || existingData?.frontmatter?.has_website ? '✅' : '❌'}
- **Google Business:** ${presence.hasGoogleBusiness || existingData?.frontmatter?.has_google_business ? '✅' : '❌'}
- **Social Media:** ${presence.hasSocialMedia || existingData?.frontmatter?.has_social_media ? '✅' : '❌'}
- **Online Reviews:** ${presence.hasOnlineReviews || existingData?.frontmatter?.has_online_reviews ? '✅' : '❌'}

`;
  }

  private generateCompetitiveAnalysisSection(
    prospect: Prospect, 
    existingData: ExistingProspectData | null,
    passResults: Array<{passNumber: number, passName: string, success: boolean, errors: string[]}>
  ): string {
    let content = '## Competitive Analysis\n\n';

    // Check if we have new competitive analysis data
    if (prospect.competitors && prospect.competitors.competitiveGaps.length > 0) {
      content += '### Identified Gaps\n';
      content += prospect.competitors.competitiveGaps.map(gap => `- ${gap}`).join('\n') + '\n\n';
      
      if (prospect.competitors.opportunityAreas.length > 0) {
        content += '### Opportunity Areas\n';
        content += prospect.competitors.opportunityAreas.map(opportunity => `- ${opportunity}`).join('\n') + '\n\n';
      }
    } else if (existingData?.content.includes('### Identified Gaps')) {
      // Preserve existing competitive analysis
      const competitiveMatch = existingData.content.match(/## Competitive Analysis\n\n([\s\S]*?)(?=\n## |$)/);
      if (competitiveMatch) {
        content += competitiveMatch[1];
      } else {
        content += this.generateCompetitiveAnalysisFallback(passResults);
      }
    } else {
      content += this.generateCompetitiveAnalysisFallback(passResults);
    }

    return content;
  }

  private generateCompetitiveAnalysisFallback(passResults: Array<{passNumber: number, passName: string, success: boolean, errors: string[]}>): string {
    const failedPasses = passResults.filter(p => !p.success);
    
    if (failedPasses.length > 0) {
      return `**⚠️ Competitive analysis incomplete due to API failures:**\n${failedPasses.map(p => `- ${p.passName}: ${p.errors.join(', ')}`).join('\n')}\n\n**Manual research recommended for:**\n- Local competitor analysis\n- Digital presence comparison\n- Pricing and service offerings\n- Market positioning opportunities\n\n`;
    }
    
    return 'Competitive analysis pending - no competitor data available.\n\n';
  }

  private generateProcessingHistorySection(
    processingHistory: ProcessingHistory, 
    currentResults: Array<{passNumber: number, passName: string, success: boolean, errors: string[]}>
  ): string {
    let content = '## 🔄 Processing History\n\n';
    
    content += `**Processing Status:**\n`;
    content += `- **Total Attempts:** ${processingHistory.totalAttempts}\n`;
    content += `- **Last Attempt:** ${processingHistory.lastAttempt}\n`;
    content += `- **Successful Passes:** [${processingHistory.successfulPasses.join(', ') || 'none'}]\n`;
    content += `- **Failed Passes:** [${processingHistory.failedPasses.join(', ') || 'none'}]\n`;
    content += `- **Next Retry Passes:** [${processingHistory.nextRetryPasses.join(', ') || 'none'}]\n\n`;

    if (currentResults.length > 0) {
      content += '**Current Attempt Results:**\n';
      for (const result of currentResults) {
        const status = result.success ? '✅' : '❌';
        content += `- **Pass ${result.passNumber} (${result.passName}):** ${status}\n`;
        if (result.errors.length > 0) {
          content += `  - Errors: ${result.errors.join(', ')}\n`;
        }
      }
      content += '\n';
    }

    if (processingHistory.nextRetryPasses.length > 0) {
      content += `**⚠️ Retry Required:** Re-run processing to complete passes ${processingHistory.nextRetryPasses.join(', ')}\n\n`;
    }

    return content;
  }

  private generateInteractionHistorySection(prospect: Prospect, existingData: ExistingProspectData | null): string {
    let content = '## Interaction History\n\n';
    
    if (prospect.interactions && prospect.interactions.length > 0) {
      content += prospect.interactions.map(interaction => `
### ${interaction.date.toISOString().split('T')[0]} - ${interaction.type}
- **Outcome:** ${interaction.outcome}
- **Agent:** ${interaction.agentResponsible}
- **Notes:** ${interaction.notes}
${interaction.nextSteps ? `- **Next Steps:** ${interaction.nextSteps.join(', ')}` : ''}
`).join('\n');
    } else if (existingData?.content.includes('## Interaction History')) {
      // Preserve existing interaction history
      const interactionMatch = existingData.content.match(/## Interaction History\n\n([\s\S]*?)(?=\n## |$)/);
      if (interactionMatch) {
        content += interactionMatch[1];
      } else {
        content += 'No interactions recorded yet\n';
      }
    } else {
      content += 'No interactions recorded yet\n';
    }

    return content + '\n';
  }

  private generateNextActionsSection(existingData: ExistingProspectData | null): string {
    if (existingData?.content.includes('## Next Actions')) {
      // Preserve existing next actions with their checkmarks
      const actionsMatch = existingData.content.match(/## Next Actions\n\n([\s\S]*?)(?=\n## |$)/);
      if (actionsMatch) {
        return `## Next Actions\n\n${actionsMatch[1]}\n`;
      }
    }

    return `## Next Actions

- [ ] Initial outreach via email
- [ ] Follow-up phone call
- [ ] Send customized pitch
- [ ] Schedule discovery meeting

`;
  }

  private generateNotesSection(existingData: ExistingProspectData | null): string {
    if (existingData?.content.includes('## Notes')) {
      const notesMatch = existingData.content.match(/## Notes\n\n([\s\S]*?)(?=\n--- |$)/);
      if (notesMatch) {
        return `## Notes\n\n${notesMatch[1]}\n`;
      }
    }

    return `## Notes\n\n_Add your notes about this prospect here..._\n\n`;
  }

  private generateFooterSection(prospect: Prospect, existingData: ExistingProspectData | null): string {
    const created = existingData?.frontmatter?.created 
      ? new Date(existingData.frontmatter.created).toISOString().split('T')[0]
      : prospect.created.toISOString().split('T')[0];
    
    const updated = new Date().toISOString().split('T')[0];

    return `---

**Created:** ${created}  
**Last Updated:** ${updated}  
**Pipeline Stage:** ${prospect.pipelineStage}  
**Tags:** ${prospect.tags.join(', ')}
`;
  }

  /**
   * Get processing status for a prospect
   */
  async getProcessingStatus(businessName: string): Promise<ProcessingHistory | null> {
    const safeBusinessName = businessName
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
    
    const filePath = path.join(this.prospectsPath, safeBusinessName, 'prospect-profile.md');
    
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const existingData = await this.parseExistingProspect(filePath);
    return existingData.processingHistory;
  }

  /**
   * Get list of prospects that need retry processing
   */
  async getProspectsNeedingRetry(): Promise<Array<{businessName: string, nextRetryPasses: number[]}>> {
    const prospects: Array<{businessName: string, nextRetryPasses: number[]}> = [];
    
    if (!fs.existsSync(this.prospectsPath)) {
      return prospects;
    }

    const directories = fs.readdirSync(this.prospectsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const dirName of directories) {
      const filePath = path.join(this.prospectsPath, dirName, 'prospect-profile.md');
      
      if (fs.existsSync(filePath)) {
        try {
          const existingData = await this.parseExistingProspect(filePath);
          
          if (existingData.processingHistory.nextRetryPasses.length > 0) {
            prospects.push({
              businessName: dirName,
              nextRetryPasses: existingData.processingHistory.nextRetryPasses
            });
          }
        } catch (error) {
          this.logger.warn('Failed to parse prospect for retry check', { 
            dirName, 
            error: error.message 
          });
        }
      }
    }

    return prospects;
  }
}