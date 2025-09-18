/**
 * Core data models for Campaign entity
 * Manages geographic targeting and messaging campaigns
 */

import { Industry } from './prospect';

export type CampaignStatus = 'active' | 'paused' | 'completed' | 'archived';
export type CampaignType = 'geographic' | 'industry' | 'custom';

export interface GeographicParameters {
  city: string;
  state: string;
  radius: number; // in miles
  radiusUnits: 'miles' | 'kilometers';
  timeZone: string;
  excludeAreas?: string[]; // Areas to exclude within radius
}

export interface TargetingCriteria {
  industries: Industry[];
  businessSizes: {
    min: number; // minimum employees
    max: number; // maximum employees
    preferred?: string; // e.g., "5-25"
  };
  revenueRange: {
    min: number;
    max: number;
    currency: 'USD' | 'CAD' | 'EUR';
  };
  qualificationThreshold: number; // minimum score to qualify
  excludeCompetitors?: boolean;
}

export interface MessagingTemplates {
  hook: {
    primary: string;
    alternatives: string[];
    maxDuration: number; // seconds
  };
  valueProp: {
    primary: string;
    alternatives: string[];
    maxDuration: number; // seconds
    roiProjection?: {
      paybackPeriod: number; // months
      projectedGrowth: string; // percentage
      industryBenchmarks: Record<Industry, number>;
    };
  };
  closing: {
    primary: string;
    alternatives: string[];
    maxDuration: number; // seconds
    callToAction: string;
    freeAnalysisOffer: {
      enabled: boolean;
      description: string;
      deliverables: string[];
    };
  };
}

export interface ABTestVariant {
  id: string;
  name: string;
  messageType: 'hook' | 'valueProp' | 'closing';
  content: string;
  isControl: boolean;
  metrics: {
    impressions: number;
    responses: number;
    positiveResponses: number;
    qualified: number;
    responseRate: number;
    qualificationRate: number;
  };
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface PerformanceMetrics {
  // Volume metrics
  prospectsIdentified: number;
  contactAttempts: number;
  conversationsInitiated: number;
  
  // Quality metrics
  responseRate: number; // percentage
  positiveResponseRate: number; // percentage
  qualificationRate: number; // percentage
  
  // Conversion metrics
  pipelineConversion: {
    coldToContacted: number;
    contactedToInterested: number;
    interestedToQualified: number;
    qualifiedToClosed: number;
  };
  
  // Financial metrics
  pipelineValue: number;
  averageDealSize: number;
  costPerQualifiedLead: number;
  
  // Timing metrics
  averageTimeToFirstContact: number; // hours
  averageTimeToQualification: number; // days
  averageTimeToClose: number; // days
  
  // Last updated
  lastCalculated: Date;
}

export interface Campaign {
  // Basic information
  id: string;
  name: string;
  description: string;
  type: CampaignType;
  status: CampaignStatus;
  
  // Timing
  startDate: Date;
  endDate?: Date;
  created: Date;
  updated: Date;
  
  // Targeting
  geographic: GeographicParameters;
  targeting: TargetingCriteria;
  
  // Messaging
  messaging: MessagingTemplates;
  
  // A/B Testing
  abTesting: {
    enabled: boolean;
    variants: ABTestVariant[];
    trafficSplit: Record<string, number>; // variant_id -> percentage
    minSampleSize: number;
    confidenceLevel: number; // e.g., 95
  };
  
  // Performance tracking
  metrics: PerformanceMetrics;
  
  // Goals and targets
  goals: {
    dailyProspects: number;
    qualificationRate: number; // target percentage
    responseRate: number; // target percentage
    pipelineValue: number; // target monthly value
  };
  
  // Obsidian metadata
  filePath: string;
  tags: string[];
  
  // Associated prospects
  prospectIds: string[];
  
  // Configuration
  settings: {
    autoQualify: boolean;
    autoAdvanceStages: boolean;
    enableCompetitorAnalysis: boolean;
    maxContactAttempts: number;
    cooldownPeriod: number; // days between contacts
  };
}

/**
 * Frontmatter structure for Obsidian campaign files
 */
export interface CampaignFrontmatter {
  type: 'campaign';
  campaign_name: string;
  campaign_type: CampaignType;
  status: CampaignStatus;
  created: string; // ISO date string
  updated: string; // ISO date string
  start_date: string; // ISO date string
  end_date?: string; // ISO date string
  tags: string[];
  
  // Geographic targeting
  target_city: string;
  target_state: string;
  target_radius: number;
  
  // Targeting criteria
  target_industries: Industry[];
  min_employees: number;
  max_employees: number;
  min_revenue: number;
  max_revenue: number;
  qualification_threshold: number;
  
  // Performance metrics
  prospects_identified: number;
  contact_attempts: number;
  positive_responses: number;
  qualified_leads: number;
  response_rate: number;
  qualification_rate: number;
  pipeline_value: number;
  
  // Goals
  daily_target: number;
  monthly_pipeline_target: number;
  
  // A/B testing
  ab_testing_enabled: boolean;
  active_variants: number;
  
  // Custom fields
  [key: string]: any;
}

export interface CampaignCreationInput {
  name: string;
  description: string;
  geographic: GeographicParameters;
  targeting: TargetingCriteria;
  messaging: Partial<MessagingTemplates>;
  goals: Campaign['goals'];
  startDate: Date;
  endDate?: Date;
}

export interface CampaignUpdateInput {
  id: string;
  updates: Partial<Campaign>;
  updateReason?: string;
}

export interface CampaignAnalytics {
  campaignId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  metrics: PerformanceMetrics;
  trends: {
    metric: keyof PerformanceMetrics;
    direction: 'up' | 'down' | 'stable';
    changePercentage: number;
    periodComparison: string;
  }[];
  recommendations: string[];
  generatedAt: Date;
}