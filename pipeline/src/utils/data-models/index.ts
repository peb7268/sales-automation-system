/**
 * Core data model utilities and integrations
 * This module provides a unified interface for working with all data models
 */

import { v4 as uuid } from 'uuid';
import { 
  Prospect, 
  Campaign, 
  Activity,
  ProspectCreationInput,
  CampaignCreationInput,
  ActivityCreationInput,
  ValidationResult,
  ProspectFrontmatter,
  CampaignFrontmatter,
  ActivityFrontmatter
} from '@/types';
import { 
  validateData,
  prospectCreationInputSchema,
  campaignCreationInputSchema,
  activityCreationInputSchema,
  prospectFrontmatterSchema,
  campaignFrontmatterSchema,
  activityFrontmatterSchema
} from '@utils/validation';
import {
  createMarkdownFile,
  generateFrontmatter,
  parseFrontmatter,
  generateSlug,
  formatDateForFrontmatter
} from '@utils/obsidian/frontmatter-parser';
import { logger } from '@utils/logging';

/**
 * Data model factory for creating and validating entities
 */
export class DataModelFactory {
  /**
   * Create a new prospect from input data
   */
  static createProspect(input: ProspectCreationInput): { prospect: Prospect | null; validation: ValidationResult } {
    // Validate input
    const validation = validateData(prospectCreationInputSchema, input);
    if (!validation.isValid) {
      return { prospect: null, validation };
    }

    const now = new Date();
    const prospectId = uuid();
    const slug = generateSlug(input.businessName);

    // Create prospect entity
    const prospect: Prospect = {
      id: prospectId,
      filePath: `Sales/Prospects/${slug}.md`,
      created: now,
      updated: now,
      tags: ['prospect', 'sales', input.industry, 'cold'],

      business: {
        name: input.businessName,
        industry: input.industry,
        location: {
          city: input.city,
          state: input.state,
          country: 'US',
        },
        size: {
          category: this.determineBusinessSize(input.employeeCount),
          employeeCount: input.employeeCount,
          estimatedRevenue: input.estimatedRevenue,
        },
        digitalPresence: {
          hasWebsite: !!input.website,
          hasGoogleBusiness: false, // To be determined by research
          hasSocialMedia: false,    // To be determined by research
          hasOnlineReviews: false,  // To be determined by research
        },
      },

      contact: {
        phone: input.phone || '',
        email: input.email || '',
        website: input.website || '',
      },

      pipelineStage: 'cold',
      qualificationScore: {
        total: 0, // To be calculated by prospecting agent
        breakdown: {
          businessSize: 0,
          digitalPresence: 0,
          competitorGaps: 0,
          location: 0,
          industry: 0,
          revenueIndicators: 0,
        },
        lastUpdated: now,
      },

      interactions: [],
      
      obsidianMeta: {
        templateUsed: 'prospect-profile-template',
        lastSyncDate: now,
      },
    };

    return { prospect, validation: { isValid: true, errors: [] } };
  }

  /**
   * Create a new campaign from input data
   */
  static createCampaign(input: CampaignCreationInput): { campaign: Campaign | null; validation: ValidationResult } {
    // Validate input
    const validation = validateData(campaignCreationInputSchema, input);
    if (!validation.isValid) {
      return { campaign: null, validation };
    }

    const now = new Date();
    const campaignId = uuid();
    const slug = generateSlug(input.name);

    // Create campaign entity
    const campaign: Campaign = {
      id: campaignId,
      name: input.name,
      description: input.description,
      type: 'geographic', // Default type
      status: 'active',
      
      startDate: input.startDate,
      endDate: input.endDate || undefined,
      created: now,
      updated: now,
      
      geographic: input.geographic,
      targeting: input.targeting,
      messaging: {
        hook: {
          primary: input.messaging?.hook?.primary || '',
          alternatives: input.messaging?.hook?.alternatives || [],
          maxDuration: 30,
        },
        valueProp: {
          primary: input.messaging?.valueProp?.primary || '',
          alternatives: input.messaging?.valueProp?.alternatives || [],
          maxDuration: 60,
        },
        closing: {
          primary: input.messaging?.closing?.primary || '',
          alternatives: input.messaging?.closing?.alternatives || [],
          maxDuration: 120,
          callToAction: input.messaging?.closing?.callToAction || '',
          freeAnalysisOffer: {
            enabled: true,
            description: 'Free competitive analysis and digital marketing audit',
            deliverables: ['Competitor comparison', 'Digital presence audit', 'Growth opportunities'],
          },
        },
      },
      
      abTesting: {
        enabled: false,
        variants: [],
        trafficSplit: {},
        minSampleSize: 20,
        confidenceLevel: 95,
      },
      
      metrics: {
        prospectsIdentified: 0,
        contactAttempts: 0,
        conversationsInitiated: 0,
        responseRate: 0,
        positiveResponseRate: 0,
        qualificationRate: 0,
        pipelineConversion: {
          coldToContacted: 0,
          contactedToInterested: 0,
          interestedToQualified: 0,
          qualifiedToClosed: 0,
        },
        pipelineValue: 0,
        averageDealSize: 0,
        costPerQualifiedLead: 0,
        averageTimeToFirstContact: 0,
        averageTimeToQualification: 0,
        averageTimeToClose: 0,
        lastCalculated: now,
      },
      
      goals: input.goals,
      
      filePath: `Sales/Campaigns/${slug}.md`,
      tags: ['campaign', 'sales', 'geographic', 'active'],
      prospectIds: [],
      
      settings: {
        autoQualify: true,
        autoAdvanceStages: false,
        enableCompetitorAnalysis: true,
        maxContactAttempts: 3,
        cooldownPeriod: 7,
      },
    };

    return { campaign, validation: { isValid: true, errors: [] } };
  }

  /**
   * Create a new activity from input data
   */
  static createActivity(input: ActivityCreationInput): { activity: Activity | null; validation: ValidationResult } {
    // Validate input
    const validation = validateData(activityCreationInputSchema, input);
    if (!validation.isValid) {
      return { activity: null, validation };
    }

    const now = new Date();
    const activityId = uuid();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const slug = `${input.type}-${input.prospectId.slice(0, 8)}-${timestamp}`;

    // Create activity entity
    const activity: Activity = {
      id: activityId,
      prospectId: input.prospectId,
      campaignId: input.campaignId || undefined,
      
      type: input.type,
      outcome: input.outcome,
      date: now,
      duration: input.duration || undefined,
      
      agentResponsible: input.agentResponsible,
      
      summary: input.summary,
      notes: input.notes,
      
      metadata: input.metadata || {},
      
      impact: {
        nextStepsGenerated: [],
        buyingSignalsDetected: [],
        painPointsIdentified: [],
        opportunitiesDiscovered: [],
      },
      
      followUpRequired: input.followUpRequired || false,
      followUpDate: input.followUpDate,
      
      automatedActivity: input.agentResponsible !== 'human_sales_rep',
      
      filePath: `Sales/Activities/${slug}.md`,
      created: now,
      updated: now,
      tags: ['activity', input.type, input.outcome, input.agentResponsible],
    };

    return { activity, validation: { isValid: true, errors: [] } };
  }

  /**
   * Convert prospect to Obsidian frontmatter
   */
  static prospectToFrontmatter(prospect: Prospect): ProspectFrontmatter {
    return {
      type: 'prospect-profile',
      company: prospect.business.name,
      industry: prospect.business.industry,
      location: `${prospect.business.location.city}, ${prospect.business.location.state}`,
      qualification_score: prospect.qualificationScore.total,
      pipeline_stage: prospect.pipelineStage,
      created: formatDateForFrontmatter(prospect.created),
      updated: formatDateForFrontmatter(prospect.updated),
      tags: prospect.tags,
      
      primary_contact: prospect.contact.primaryContact || '',
      contact_title: prospect.contact.contactTitle || '',
      phone: prospect.contact.phone,
      email: prospect.contact.email,
      website: prospect.contact.website,
      decision_maker: prospect.contact.decisionMaker || '',
      
      employee_count: prospect.business.size.employeeCount || 0,
      estimated_revenue: prospect.business.size.estimatedRevenue || 0,
      business_size: prospect.business.size.category,
      
      has_website: prospect.business.digitalPresence?.hasWebsite,
      has_google_business: prospect.business.digitalPresence?.hasGoogleBusiness,
      has_social_media: prospect.business.digitalPresence?.hasSocialMedia,
      has_online_reviews: prospect.business.digitalPresence?.hasOnlineReviews,
      
      score_business_size: prospect.qualificationScore.breakdown.businessSize,
      score_digital_presence: prospect.qualificationScore.breakdown.digitalPresence,
      score_competitor_gaps: prospect.qualificationScore.breakdown.competitorGaps,
      score_location: prospect.qualificationScore.breakdown.location,
      score_industry: prospect.qualificationScore.breakdown.industry,
      score_revenue: prospect.qualificationScore.breakdown.revenueIndicators,
    };
  }

  /**
   * Convert campaign to Obsidian frontmatter
   */
  static campaignToFrontmatter(campaign: Campaign): CampaignFrontmatter {
    return {
      type: 'campaign',
      campaign_name: campaign.name,
      campaign_type: campaign.type,
      status: campaign.status,
      created: formatDateForFrontmatter(campaign.created),
      updated: formatDateForFrontmatter(campaign.updated),
      start_date: formatDateForFrontmatter(campaign.startDate),
      end_date: campaign.endDate ? formatDateForFrontmatter(campaign.endDate) : '',
      tags: campaign.tags,
      
      target_city: campaign.geographic.city,
      target_state: campaign.geographic.state,
      target_radius: campaign.geographic.radius,
      
      target_industries: campaign.targeting.industries,
      min_employees: campaign.targeting.businessSizes.min,
      max_employees: campaign.targeting.businessSizes.max,
      min_revenue: campaign.targeting.revenueRange.min,
      max_revenue: campaign.targeting.revenueRange.max,
      qualification_threshold: campaign.targeting.qualificationThreshold,
      
      prospects_identified: campaign.metrics.prospectsIdentified,
      contact_attempts: campaign.metrics.contactAttempts,
      positive_responses: Math.round(campaign.metrics.contactAttempts * campaign.metrics.positiveResponseRate / 100),
      qualified_leads: Math.round(campaign.metrics.contactAttempts * campaign.metrics.qualificationRate / 100),
      response_rate: campaign.metrics.responseRate,
      qualification_rate: campaign.metrics.qualificationRate,
      pipeline_value: campaign.metrics.pipelineValue,
      
      daily_target: campaign.goals.dailyProspects,
      monthly_pipeline_target: campaign.goals.pipelineValue,
      
      ab_testing_enabled: campaign.abTesting.enabled,
      active_variants: campaign.abTesting.variants.filter(v => v.isActive).length,
    };
  }

  /**
   * Convert activity to Obsidian frontmatter
   */
  static activityToFrontmatter(activity: Activity): ActivityFrontmatter {
    return {
      type: 'activity',
      prospect: activity.prospectId, // This should be resolved to company name
      activity_type: activity.type,
      outcome: activity.outcome,
      date: formatDateForFrontmatter(activity.date),
      duration: activity.duration || 0,
      agent_responsible: activity.agentResponsible,
      created: formatDateForFrontmatter(activity.created),
      updated: formatDateForFrontmatter(activity.updated),
      tags: activity.tags,
      
      stage_change_from: activity.impact.stageChange?.from,
      stage_change_to: activity.impact.stageChange?.to,
      qualification_score_change: activity.impact.qualificationScoreChange,
      
      follow_up_required: activity.followUpRequired,
      follow_up_date: activity.followUpDate ? formatDateForFrontmatter(activity.followUpDate) : undefined,
      follow_up_type: activity.followUpType,
      
      automated: activity.automatedActivity,
      human_review_required: activity.manualReview?.required,
      human_review_completed: activity.manualReview?.completed,
      
      email_opened: activity.metadata.emailMetadata?.opened,
      email_clicked: activity.metadata.emailMetadata?.clicked,
      email_bounced: activity.metadata.emailMetadata?.bounced,
      email_template: activity.metadata.emailMetadata?.template,
      
      call_duration: activity.metadata.callMetadata?.duration,
      call_answered: activity.metadata.callMetadata?.answered,
      voicemail_left: activity.metadata.callMetadata?.voicemailLeft,
      call_quality: activity.metadata.callMetadata?.callQuality,
    };
  }

  /**
   * Generate complete Obsidian markdown file for prospect
   */
  static generateProspectMarkdown(prospect: Prospect, template?: string): string {
    const frontmatter = this.prospectToFrontmatter(prospect);
    const content = template || `# ${prospect.business.name}\n\n## Company Overview\n\n*This prospect profile was automatically generated.*`;
    
    return createMarkdownFile(frontmatter, content);
  }

  /**
   * Generate complete Obsidian markdown file for campaign
   */
  static generateCampaignMarkdown(campaign: Campaign, template?: string): string {
    const frontmatter = this.campaignToFrontmatter(campaign);
    const content = template || `# ${campaign.name}\n\n## Campaign Overview\n\n${campaign.description}`;
    
    return createMarkdownFile(frontmatter, content);
  }

  /**
   * Generate complete Obsidian markdown file for activity
   */
  static generateActivityMarkdown(activity: Activity, template?: string): string {
    const frontmatter = this.activityToFrontmatter(activity);
    const content = template || `# ${activity.type} Activity\n\n## Summary\n\n${activity.summary}\n\n## Notes\n\n${activity.notes}`;
    
    return createMarkdownFile(frontmatter, content);
  }

  /**
   * Determine business size category from employee count
   */
  private static determineBusinessSize(employeeCount?: number): 'micro' | 'small' | 'medium' {
    if (!employeeCount) return 'small'; // Default assumption
    
    if (employeeCount <= 9) return 'micro';
    if (employeeCount <= 49) return 'small';
    return 'medium';
  }
}

/**
 * Export utility functions for external use
 */
// DataModelFactory already exported above

export * from '@/types';
export * from '@utils/validation';
export * from '@utils/obsidian/frontmatter-parser';