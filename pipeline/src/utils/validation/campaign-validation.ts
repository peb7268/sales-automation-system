/**
 * Validation schemas for Campaign data model
 */

import Joi from 'joi';
import { 
  Campaign, 
  CampaignCreationInput, 
  CampaignUpdateInput, 
  CampaignFrontmatter,
  CampaignStatus,
  CampaignType 
} from '@/types';

// Enum validation schemas
const campaignStatusSchema = Joi.string().valid('active', 'paused', 'completed', 'archived');
const campaignTypeSchema = Joi.string().valid('geographic', 'industry', 'custom');
const industrySchema = Joi.string().valid(
  'restaurants', 'retail', 'professional_services', 'healthcare', 
  'real_estate', 'automotive', 'home_services', 'fitness', 
  'beauty_salons', 'legal_services', 'other'
);

// Sub-schema validations
const geographicParametersSchema = Joi.object({
  city: Joi.string().min(2).max(50).required(),
  state: Joi.string().length(2).required(),
  radius: Joi.number().min(1).max(500).required(),
  radiusUnits: Joi.string().valid('miles', 'kilometers').default('miles'),
  timeZone: Joi.string().required(),
  excludeAreas: Joi.array().items(Joi.string()).optional(),
});

const targetingCriteriaSchema = Joi.object({
  industries: Joi.array().items(industrySchema).min(1).required(),
  businessSizes: Joi.object({
    min: Joi.number().integer().min(1).required(),
    max: Joi.number().integer().min(Joi.ref('min')).required(),
    preferred: Joi.string().optional(),
  }).required(),
  revenueRange: Joi.object({
    min: Joi.number().min(0).required(),
    max: Joi.number().min(Joi.ref('min')).required(),
    currency: Joi.string().valid('USD', 'CAD', 'EUR').default('USD'),
  }).required(),
  qualificationThreshold: Joi.number().min(0).max(100).required(),
  excludeCompetitors: Joi.boolean().default(false),
});

const messagingTemplatesSchema = Joi.object({
  hook: Joi.object({
    primary: Joi.string().min(10).max(500).required(),
    alternatives: Joi.array().items(Joi.string().min(10).max(500)).default([]),
    maxDuration: Joi.number().min(15).max(60).default(30),
  }).required(),
  valueProp: Joi.object({
    primary: Joi.string().min(20).max(1000).required(),
    alternatives: Joi.array().items(Joi.string().min(20).max(1000)).default([]),
    maxDuration: Joi.number().min(30).max(120).default(60),
    roiProjection: Joi.object({
      paybackPeriod: Joi.number().min(1).max(36).required(),
      projectedGrowth: Joi.string().required(),
      industryBenchmarks: Joi.object().pattern(/.*/, Joi.number()).optional(),
    }).optional(),
  }).required(),
  closing: Joi.object({
    primary: Joi.string().min(20).max(1000).required(),
    alternatives: Joi.array().items(Joi.string().min(20).max(1000)).default([]),
    maxDuration: Joi.number().min(60).max(300).default(120),
    callToAction: Joi.string().min(10).max(200).required(),
    freeAnalysisOffer: Joi.object({
      enabled: Joi.boolean().required(),
      description: Joi.string().min(20).max(500).required(),
      deliverables: Joi.array().items(Joi.string().min(5).max(100)).min(1).required(),
    }).required(),
  }).required(),
});

const abTestVariantSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().min(3).max(50).required(),
  messageType: Joi.string().valid('hook', 'valueProp', 'closing').required(),
  content: Joi.string().min(10).max(1000).required(),
  isControl: Joi.boolean().required(),
  metrics: Joi.object({
    impressions: Joi.number().integer().min(0).default(0),
    responses: Joi.number().integer().min(0).default(0),
    positiveResponses: Joi.number().integer().min(0).default(0),
    qualified: Joi.number().integer().min(0).default(0),
    responseRate: Joi.number().min(0).max(100).default(0),
    qualificationRate: Joi.number().min(0).max(100).default(0),
  }).required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref('startDate')).optional(),
  isActive: Joi.boolean().default(true),
});

const performanceMetricsSchema = Joi.object({
  prospectsIdentified: Joi.number().integer().min(0).default(0),
  contactAttempts: Joi.number().integer().min(0).default(0),
  conversationsInitiated: Joi.number().integer().min(0).default(0),
  responseRate: Joi.number().min(0).max(100).default(0),
  positiveResponseRate: Joi.number().min(0).max(100).default(0),
  qualificationRate: Joi.number().min(0).max(100).default(0),
  pipelineConversion: Joi.object({
    coldToContacted: Joi.number().min(0).max(100).default(0),
    contactedToInterested: Joi.number().min(0).max(100).default(0),
    interestedToQualified: Joi.number().min(0).max(100).default(0),
    qualifiedToClosed: Joi.number().min(0).max(100).default(0),
  }).required(),
  pipelineValue: Joi.number().min(0).default(0),
  averageDealSize: Joi.number().min(0).default(0),
  costPerQualifiedLead: Joi.number().min(0).default(0),
  averageTimeToFirstContact: Joi.number().min(0).default(0),
  averageTimeToQualification: Joi.number().min(0).default(0),
  averageTimeToClose: Joi.number().min(0).default(0),
  lastCalculated: Joi.date().required(),
});

// Main campaign validation schema
export const campaignSchema = Joi.object<Campaign>({
  id: Joi.string().required(),
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).required(),
  type: campaignTypeSchema.required(),
  status: campaignStatusSchema.required(),
  
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref('startDate')).optional(),
  created: Joi.date().required(),
  updated: Joi.date().required(),
  
  geographic: geographicParametersSchema.required(),
  targeting: targetingCriteriaSchema.required(),
  messaging: messagingTemplatesSchema.required(),
  
  abTesting: Joi.object({
    enabled: Joi.boolean().required(),
    variants: Joi.array().items(abTestVariantSchema).when('enabled', {
      is: true,
      then: Joi.array().min(2).max(5),
      otherwise: Joi.array().max(0),
    }),
    trafficSplit: Joi.object().pattern(/.*/, Joi.number().min(0).max(100)).required(),
    minSampleSize: Joi.number().integer().min(10).max(1000).default(20),
    confidenceLevel: Joi.number().min(80).max(99).default(95),
  }).required(),
  
  metrics: performanceMetricsSchema.required(),
  
  goals: Joi.object({
    dailyProspects: Joi.number().integer().min(1).max(500).required(),
    qualificationRate: Joi.number().min(1).max(50).required(),
    responseRate: Joi.number().min(1).max(30).required(),
    pipelineValue: Joi.number().min(1000).max(1000000).required(),
  }).required(),
  
  filePath: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).default([]),
  prospectIds: Joi.array().items(Joi.string()).default([]),
  
  settings: Joi.object({
    autoQualify: Joi.boolean().default(true),
    autoAdvanceStages: Joi.boolean().default(false),
    enableCompetitorAnalysis: Joi.boolean().default(true),
    maxContactAttempts: Joi.number().integer().min(1).max(10).default(3),
    cooldownPeriod: Joi.number().integer().min(1).max(30).default(7),
  }).required(),
});

// Campaign creation input validation
export const campaignCreationInputSchema = Joi.object<CampaignCreationInput>({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).required(),
  geographic: geographicParametersSchema.required(),
  targeting: targetingCriteriaSchema.required(),
  messaging: messagingTemplatesSchema.optional(),
  goals: Joi.object({
    dailyProspects: Joi.number().integer().min(1).max(500).required(),
    qualificationRate: Joi.number().min(1).max(50).required(),
    responseRate: Joi.number().min(1).max(30).required(),
    pipelineValue: Joi.number().min(1000).max(1000000).required(),
  }).required(),
  startDate: Joi.date().min('now').required(),
  endDate: Joi.date().min(Joi.ref('startDate')).optional(),
});

// Campaign update input validation
export const campaignUpdateInputSchema = Joi.object<CampaignUpdateInput>({
  id: Joi.string().required(),
  updates: Joi.object().min(1).required(),
  updateReason: Joi.string().optional(),
});

// Frontmatter validation schema
export const campaignFrontmatterSchema = Joi.object<CampaignFrontmatter>({
  type: Joi.string().valid('campaign').required(),
  campaign_name: Joi.string().required(),
  campaign_type: campaignTypeSchema.required(),
  status: campaignStatusSchema.required(),
  created: Joi.string().isoDate().required(),
  updated: Joi.string().isoDate().required(),
  start_date: Joi.string().isoDate().required(),
  end_date: Joi.string().isoDate().optional(),
  tags: Joi.array().items(Joi.string()).default([]),
  
  // Geographic targeting
  target_city: Joi.string().required(),
  target_state: Joi.string().length(2).required(),
  target_radius: Joi.number().min(1).max(500).required(),
  
  // Targeting criteria
  target_industries: Joi.array().items(industrySchema).min(1).required(),
  min_employees: Joi.number().integer().min(1).required(),
  max_employees: Joi.number().integer().min(Joi.ref('min_employees')).required(),
  min_revenue: Joi.number().min(0).required(),
  max_revenue: Joi.number().min(Joi.ref('min_revenue')).required(),
  qualification_threshold: Joi.number().min(0).max(100).required(),
  
  // Performance metrics
  prospects_identified: Joi.number().integer().min(0).default(0),
  contact_attempts: Joi.number().integer().min(0).default(0),
  positive_responses: Joi.number().integer().min(0).default(0),
  qualified_leads: Joi.number().integer().min(0).default(0),
  response_rate: Joi.number().min(0).max(100).default(0),
  qualification_rate: Joi.number().min(0).max(100).default(0),
  pipeline_value: Joi.number().min(0).default(0),
  
  // Goals
  daily_target: Joi.number().integer().min(1).required(),
  monthly_pipeline_target: Joi.number().min(1000).required(),
  
  // A/B testing
  ab_testing_enabled: Joi.boolean().default(false),
  active_variants: Joi.number().integer().min(0).max(5).default(0),
}).unknown(); // Allow additional custom fields

/**
 * Custom validation functions
 */

export function validateDateRange(startDate: Date, endDate?: Date): boolean {
  if (!endDate) return true;
  return endDate > startDate;
}

export function validateTrafficSplit(trafficSplit: Record<string, number>): boolean {
  const total = Object.values(trafficSplit).reduce((sum, value) => sum + value, 0);
  return Math.abs(total - 100) < 0.01; // Allow for small floating point errors
}

export function validateGeographicRadius(radius: number, radiusUnits: 'miles' | 'kilometers'): boolean {
  const maxRadius = radiusUnits === 'miles' ? 500 : 800;
  return radius > 0 && radius <= maxRadius;
}

export function validateABTestVariants(variants: any[], enabled: boolean): boolean {
  if (!enabled) return variants.length === 0;
  
  // Must have at least 2 variants when A/B testing is enabled
  if (variants.length < 2) return false;
  
  // Must have exactly one control variant
  const controlCount = variants.filter(v => v.isControl).length;
  return controlCount === 1;
}

export function validateCampaignGoals(goals: any, targeting: any): boolean {
  // Daily prospects should be reasonable for the geographic area
  const { dailyProspects } = goals;
  const { radius } = targeting;
  
  // Rough estimation: larger radius allows more daily prospects
  const maxDailyForRadius = Math.min(500, Math.floor(radius * 2));
  
  return dailyProspects <= maxDailyForRadius;
}