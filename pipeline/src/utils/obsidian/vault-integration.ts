/**
 * Obsidian Main Vault Integration Utilities
 * Handles seamless integration with the existing Main vault structure
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { 
  Prospect, 
  Campaign, 
  Activity,
  ProspectCreationInput,
  CampaignCreationInput,
  ActivityCreationInput
} from '@/types';
import { DataModelFactory } from '@utils/data-models';
import { 
  generateSlug,
  formatDateForFrontmatter,
  parseFrontmatter
} from '@utils/obsidian/frontmatter-parser';
import { prospectFolderManager } from '@utils/obsidian/prospect-folder-manager';
import { logger } from '@utils/logging';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Configuration for Main vault integration
 */
export interface VaultConfig {
  vaultPath: string;
  prospectsPath: string;
  campaignsPath: string;
  activitiesPath: string;
  templatesPath: string;
  dashboardPath: string;
  dailyNotesPath: string;
}

/**
 * Default vault configuration for MHM Main vault
 */
export const DEFAULT_VAULT_CONFIG: VaultConfig = {
  vaultPath: process.env.OBSIDIAN_VAULT_PATH || '/Users/pbarrick/Documents/Main',
  prospectsPath: 'Projects/Sales/Prospects',
  campaignsPath: 'Projects/Sales/Campaigns', 
  activitiesPath: 'Projects/Sales/Activities',
  templatesPath: 'Resources/General/Templates/Sales',
  dashboardPath: 'Projects/Sales/Sales-Dashboard.md',
  dailyNotesPath: 'Resources/Agenda/Daily'
};

/**
 * Main vault integration manager
 */
export class VaultIntegration {
  private config: VaultConfig;

  constructor(config: VaultConfig = DEFAULT_VAULT_CONFIG) {
    this.config = config;
  }

  /**
   * Initialize vault structure if it doesn't exist
   */
  async initializeVault(): Promise<void> {
    try {
      const directories = [
        this.getProspectsPath(),
        this.getCampaignsPath(),
        this.getActivitiesPath(),
        this.getTemplatesPath()
      ];

      for (const dir of directories) {
        await fs.mkdir(dir, { recursive: true });
        logger.info(`Ensured directory exists: ${dir}`);
      }
    } catch (error) {
      logger.error('Failed to initialize vault structure:', error);
      throw error;
    }
  }

  /**
   * Create new prospect profile in Main vault using folder-based structure
   */
  async createProspectProfile(input: ProspectCreationInput): Promise<{ 
    prospect: Prospect | null; 
    filePath: string | null; 
    success: boolean;
    error?: string;
  }> {
    try {
      // Use the new folder manager to create prospect
      const { prospect, folderPath } = await prospectFolderManager.createProspect(input);
      
      if (!prospect) {
        return {
          prospect: null,
          filePath: null,
          success: false,
          error: 'Failed to create prospect'
        };
      }

      return {
        prospect,
        filePath: folderPath,
        success: true
      };
    } catch (error) {
      logger.error('Failed to create prospect profile:', error);
      return {
        prospect: null,
        filePath: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create new campaign in Main vault
   */
  async createCampaign(input: CampaignCreationInput): Promise<{
    campaign: Campaign | null;
    filePath: string | null;
    success: boolean;
    error?: string;
  }> {
    try {
      // Create campaign using data model factory
      const { campaign, validation } = DataModelFactory.createCampaign(input);
      
      if (!campaign || !validation.isValid) {
        return {
          campaign: null,
          filePath: null,
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Generate file path
      const slug = generateSlug(campaign.name);
      const fileName = `${slug}.md`;
      const filePath = path.join(this.getCampaignsPath(), fileName);

      // Load campaign template
      const template = await this.loadTemplate('Campaign.md');
      
      // Generate markdown content with template substitution
      const markdown = this.substituteTemplateVariables(template, {
        title: campaign.name,
        end_date: campaign.endDate ? formatDateForFrontmatter(campaign.endDate) : '',
        city: campaign.geographic.city,
        state: campaign.geographic.state,
        radius: campaign.geographic.radius.toString(),
        industries: campaign.targeting.industries.map(i => `"${i}"`).join(', '),
        min_employees: campaign.targeting.businessSizes.min.toString(),
        max_employees: campaign.targeting.businessSizes.max.toString(),
        min_revenue: campaign.targeting.revenueRange.min.toString(),
        max_revenue: campaign.targeting.revenueRange.max.toString(),
        daily_target: campaign.goals.dailyProspects.toString(),
        pipeline_target: campaign.goals.pipelineValue.toString(),
        monthly_target: (campaign.goals.dailyProspects * 22).toString() // ~22 working days
      });

      // Write campaign file
      await fs.writeFile(filePath, markdown, 'utf8');

      // Update campaign with actual file path
      campaign.filePath = path.relative(this.config.vaultPath, filePath);

      logger.info(`Created campaign: ${filePath}`);

      return {
        campaign,
        filePath,
        success: true
      };

    } catch (error) {
      logger.error('Failed to create campaign:', error);
      return {
        campaign: null,
        filePath: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create new activity record in Main vault
   */
  async createActivity(input: ActivityCreationInput): Promise<{
    activity: Activity | null;
    filePath: string | null;
    success: boolean;
    error?: string;
  }> {
    try {
      // Create activity using data model factory
      const { activity, validation } = DataModelFactory.createActivity(input);
      
      if (!activity || !validation.isValid) {
        return {
          activity: null,
          filePath: null,
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Generate file path
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const prospectSlug = generateSlug(input.prospectId.slice(0, 8));
      const fileName = `${activity.type}-${prospectSlug}-${timestamp}.md`;
      const filePath = path.join(this.getActivitiesPath(), fileName);

      // Load activity template
      const template = await this.loadTemplate('Activity.md');
      
      // Generate markdown content with template substitution
      const markdown = this.substituteTemplateVariables(template, {
        prospect_name: input.prospectId, // This should be resolved to company name
        activity_type: activity.type,
        outcome: activity.outcome,
        duration: activity.duration?.toString() || '0',
        agent: activity.agentResponsible,
        stage_from: '',
        stage_to: '',
        score_change: '0',
        follow_up_required: activity.followUpRequired ? 'true' : 'false',
        follow_up_date: activity.followUpDate ? formatDateForFrontmatter(activity.followUpDate) : '',
        follow_up_type: activity.followUpType || '',
        automated: activity.automatedActivity ? 'true' : 'false',
        review_required: activity.manualReview?.required ? 'true' : 'false',
        summary: activity.summary,
        notes: activity.notes || '',
        // Email-specific fields
        email_opened: input.metadata?.emailMetadata?.opened ? 'true' : 'false',
        email_clicked: input.metadata?.emailMetadata?.clicked ? 'true' : 'false',
        email_bounced: input.metadata?.emailMetadata?.bounced ? 'true' : 'false',
        email_template: input.metadata?.emailMetadata?.template || '',
        // Call-specific fields  
        call_duration: input.metadata?.callMetadata?.duration?.toString() || '0',
        call_answered: input.metadata?.callMetadata?.answered ? 'true' : 'false',
        voicemail_left: input.metadata?.callMetadata?.voicemailLeft ? 'true' : 'false',
        call_quality: input.metadata?.callMetadata?.callQuality || '',
      });

      // Write activity file
      await fs.writeFile(filePath, markdown, 'utf8');

      // Update activity with actual file path
      activity.filePath = path.relative(this.config.vaultPath, filePath);

      logger.info(`Created activity record: ${filePath}`);

      return {
        activity,
        filePath,
        success: true
      };

    } catch (error) {
      logger.error('Failed to create activity record:', error);
      return {
        activity: null,
        filePath: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update daily note with sales activity summary
   */
  async updateDailyNote(date: Date, salesSummary: string): Promise<boolean> {
    try {
      const dateStr = date.toISOString().slice(0, 10); // YYYY-MM-DD
      const dailyNotePath = path.join(this.getDailyNotesPath(), `${dateStr}.md`);
      
      // Check if daily note exists
      let dailyNoteContent = '';
      try {
        dailyNoteContent = await fs.readFile(dailyNotePath, 'utf8');
      } catch (error) {
        // Daily note doesn't exist, create basic structure
        dailyNoteContent = `---
pomodoros_hit: 0
pomodoros_goal: 4
row_or_run: 0
water_drank: 0
---

# ${dateStr}

## Sales Activity Summary

${salesSummary}

---

## Notes

`;
        await fs.writeFile(dailyNotePath, dailyNoteContent, 'utf8');
        logger.info(`Created daily note with sales summary: ${dailyNotePath}`);
        return true;
      }

      // Daily note exists, update it
      const salesSectionRegex = /## Sales Activity Summary\n[\s\S]*?(?=\n##|\n---|\Z)/;
      const newSalesSection = `## Sales Activity Summary\n\n${salesSummary}\n`;
      
      if (salesSectionRegex.test(dailyNoteContent)) {
        // Replace existing sales section
        dailyNoteContent = dailyNoteContent.replace(salesSectionRegex, newSalesSection);
      } else {
        // Add sales section after frontmatter
        const frontmatterEnd = dailyNoteContent.indexOf('---', 3) + 3;
        const beforeContent = dailyNoteContent.slice(0, frontmatterEnd);
        const afterContent = dailyNoteContent.slice(frontmatterEnd);
        dailyNoteContent = `${beforeContent}\n\n${newSalesSection}${afterContent}`;
      }

      await fs.writeFile(dailyNotePath, dailyNoteContent, 'utf8');
      logger.info(`Updated daily note with sales summary: ${dailyNotePath}`);
      return true;

    } catch (error) {
      logger.error('Failed to update daily note:', error);
      return false;
    }
  }

  /**
   * Get all prospects from vault
   */
  async getAllProspects(): Promise<Prospect[]> {
    try {
      // Use the new folder manager to get all prospects
      return await prospectFolderManager.getAllProspects();
    } catch (error) {
      logger.error('Failed to get all prospects:', error);
      return [];
    }
  }

  /**
   * Load template file content
   */
  private async loadTemplate(templateName: string): Promise<string> {
    const templatePath = path.join(this.getTemplatesPath(), templateName);
    return await fs.readFile(templatePath, 'utf8');
  }

  /**
   * Substitute template variables with actual values
   */
  private substituteTemplateVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    
    // Replace {{VALUE:key}} placeholders
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{VALUE:${key}}}`, 'g');
      result = result.replace(regex, value);
    }

    // Replace {{date:format}} placeholders with current date
    const dateRegex = /{{date:([^}]+)}}/g;
    result = result.replace(dateRegex, (match, format) => {
      const now = new Date();
      if (format === 'YYYY-MM-DDTHH:mm:ss.SSSZ') {
        return now.toISOString();
      } else if (format === 'YYYY-MM-DD HH:mm') {
        return now.toISOString().replace('T', ' ').slice(0, 16);
      } else if (format === 'YYYY-MM-DD') {
        return now.toISOString().slice(0, 10);
      } else if (format === 'HH:mm') {
        return now.toISOString().slice(11, 16);
      }
      return match; // Return original if format not recognized
    });

    return result;
  }

  /**
   * Convert frontmatter back to Prospect object
   */
  private frontmatterToProspect(frontmatter: any, filePath: string): Prospect | null {
    try {
      // This is a simplified conversion - in a real implementation,
      // you'd want more robust parsing and validation
      return {
        id: frontmatter.id || '',
        filePath: path.relative(this.config.vaultPath, filePath),
        created: new Date(frontmatter.created),
        updated: new Date(frontmatter.updated),
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        business: {
          name: frontmatter.company,
          industry: frontmatter.industry,
          location: {
            city: frontmatter.location?.split(',')[0]?.trim() || '',
            state: frontmatter.location?.split(',')[1]?.trim() || '',
            country: 'US'
          },
          size: {
            category: frontmatter.business_size,
            employeeCount: frontmatter.employee_count,
            estimatedRevenue: frontmatter.estimated_revenue
          },
          digitalPresence: {
            hasWebsite: frontmatter.has_website,
            hasGoogleBusiness: frontmatter.has_google_business,
            hasSocialMedia: frontmatter.has_social_media,
            hasOnlineReviews: frontmatter.has_online_reviews
          }
        },
        contact: {
          primaryContact: frontmatter.primary_contact,
          contactTitle: frontmatter.contact_title,
          phone: frontmatter.phone,
          email: frontmatter.email,
          website: frontmatter.website,
          decisionMaker: frontmatter.decision_maker
        },
        pipelineStage: frontmatter.pipeline_stage,
        qualificationScore: {
          total: frontmatter.qualification_score,
          breakdown: {
            businessSize: frontmatter.score_business_size,
            digitalPresence: frontmatter.score_digital_presence,
            competitorGaps: frontmatter.score_competitor_gaps,
            location: frontmatter.score_location,
            industry: frontmatter.score_industry,
            revenueIndicators: frontmatter.score_revenue
          },
          lastUpdated: new Date(frontmatter.updated)
        },
        interactions: [],
        obsidianMeta: {
          templateUsed: 'prospect-profile-template',
          lastSyncDate: new Date(frontmatter.updated)
        }
      };
    } catch (error) {
      logger.error('Failed to convert frontmatter to prospect:', error);
      return null;
    }
  }

  // Helper methods for getting full paths
  private getProspectsPath(): string {
    return path.join(this.config.vaultPath, this.config.prospectsPath);
  }

  private getCampaignsPath(): string {
    return path.join(this.config.vaultPath, this.config.campaignsPath);
  }

  private getActivitiesPath(): string {
    return path.join(this.config.vaultPath, this.config.activitiesPath);
  }

  private getTemplatesPath(): string {
    return path.join(this.config.vaultPath, this.config.templatesPath);
  }

  // private getDashboardPath(): string {
  //   return path.join(this.config.vaultPath, this.config.dashboardPath);
  // }

  private getDailyNotesPath(): string {
    return path.join(this.config.vaultPath, this.config.dailyNotesPath);
  }
}

/**
 * Export singleton instance for easy use
 */
export const vaultIntegration = new VaultIntegration();