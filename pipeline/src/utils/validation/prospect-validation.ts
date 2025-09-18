/**
 * Validation schemas for Prospect data model
 */

import Joi from 'joi';
import { 
  Prospect, 
  ProspectCreationInput, 
  ProspectUpdateInput, 
  ProspectFrontmatter,
  PipelineStage,
  Industry,
  BusinessSize 
} from '@/types';

// Enum validation schemas
const pipelineStageSchema = Joi.string().valid(
  'cold', 'contacted', 'interested', 'qualified', 'closed', 'lost', 'frozen'
);

const industrySchema = Joi.string().valid(
  'restaurants', 'retail', 'professional_services', 'healthcare', 
  'real_estate', 'automotive', 'home_services', 'fitness', 
  'beauty_salons', 'legal_services', 'other'
);

const businessSizeSchema = Joi.string().valid('micro', 'small', 'medium');

// Sub-schema validations
const contactDetailsSchema = Joi.object({
  primaryContact: Joi.string().optional(),
  contactTitle: Joi.string().optional(),
  phone: Joi.string().pattern(/^[\+]?[0-9\s\-\(\)]+$/).optional(),
  email: Joi.string().email().optional(),
  website: Joi.string().uri().optional(),
  decisionMaker: Joi.string().optional(),
  socialProfiles: Joi.object({
    linkedin: Joi.string().uri().optional(),
    facebook: Joi.string().uri().optional(),
    instagram: Joi.string().uri().optional(),
    twitter: Joi.string().uri().optional(),
  }).optional(),
});

const businessInfoSchema = Joi.object({
  name: Joi.string().required(),
  industry: industrySchema.required(),
  location: Joi.object({
    city: Joi.string().required(),
    state: Joi.string().length(2).required(),
    country: Joi.string().default('US'),
    zipCode: Joi.string().optional(),
  }).required(),
  size: Joi.object({
    category: businessSizeSchema.required(),
    employeeCount: Joi.number().integer().min(1).max(10000).optional(),
    estimatedRevenue: Joi.number().min(0).optional(),
  }).required(),
  digitalPresence: Joi.object({
    hasWebsite: Joi.boolean().default(false),
    hasGoogleBusiness: Joi.boolean().default(false),
    hasSocialMedia: Joi.boolean().default(false),
    hasOnlineReviews: Joi.boolean().default(false),
  }).optional(),
});

const qualificationScoreSchema = Joi.object({
  total: Joi.number().min(0).max(100).required(),
  breakdown: Joi.object({
    businessSize: Joi.number().min(0).max(20).required(),
    digitalPresence: Joi.number().min(0).max(25).required(),
    competitorGaps: Joi.number().min(0).max(20).required(),
    location: Joi.number().min(0).max(15).required(),
    industry: Joi.number().min(0).max(10).required(),
    revenueIndicators: Joi.number().min(0).max(10).required(),
  }).required(),
  lastUpdated: Joi.date().required(),
});

const interactionHistorySchema = Joi.object({
  id: Joi.string().required(),
  date: Joi.date().required(),
  type: Joi.string().valid('call', 'email', 'meeting', 'research', 'note').required(),
  outcome: Joi.string().valid('positive', 'neutral', 'negative', 'no_contact').required(),
  duration: Joi.number().min(0).optional(),
  agentResponsible: Joi.string().required(),
  notes: Joi.string().required(),
  nextSteps: Joi.array().items(Joi.string()).optional(),
  stageChange: Joi.object({
    from: pipelineStageSchema.required(),
    to: pipelineStageSchema.required(),
  }).optional(),
});

const competitorAnalysisSchema = Joi.object({
  largeNationalCompetitors: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      strengths: Joi.array().items(Joi.string()).required(),
      weaknesses: Joi.array().items(Joi.string()).required(),
      marketShare: Joi.string().optional(),
    })
  ).max(5),
  localCompetitors: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      location: Joi.string().required(),
      strengths: Joi.array().items(Joi.string()).required(),
      weaknesses: Joi.array().items(Joi.string()).required(),
      estimatedSize: Joi.string().optional(),
    })
  ).max(10),
  competitiveGaps: Joi.array().items(Joi.string()).required(),
  opportunityAreas: Joi.array().items(Joi.string()).required(),
  lastUpdated: Joi.date().required(),
});

// Main prospect validation schema
export const prospectSchema = Joi.object<Prospect>({
  id: Joi.string().required(),
  filePath: Joi.string().required(),
  created: Joi.date().required(),
  updated: Joi.date().required(),
  tags: Joi.array().items(Joi.string()).default([]),
  
  business: businessInfoSchema.required(),
  contact: contactDetailsSchema.required(),
  
  pipelineStage: pipelineStageSchema.required(),
  qualificationScore: qualificationScoreSchema.required(),
  
  interactions: Joi.array().items(interactionHistorySchema).default([]),
  competitors: competitorAnalysisSchema.optional(),
  
  customFields: Joi.object().optional(),
  obsidianMeta: Joi.object({
    templateUsed: Joi.string().required(),
    lastSyncDate: Joi.date().required(),
    kanbanPosition: Joi.number().optional(),
  }).optional(),
});

// Prospect creation input validation
export const prospectCreationInputSchema = Joi.object<ProspectCreationInput>({
  businessName: Joi.string().min(2).max(100).required(),
  industry: industrySchema.required(),
  city: Joi.string().min(2).max(50).required(),
  state: Joi.string().length(2).required(),
  phone: Joi.string().pattern(/^[\+]?[0-9\s\-\(\)]+$/).optional(),
  email: Joi.string().email().optional(),
  website: Joi.string().uri().optional(),
  estimatedRevenue: Joi.number().min(0).max(100000000).optional(),
  employeeCount: Joi.number().integer().min(1).max(10000).optional(),
});

// Prospect update input validation
export const prospectUpdateInputSchema = Joi.object<ProspectUpdateInput>({
  id: Joi.string().required(),
  updates: Joi.object().min(1).required(),
  updateReason: Joi.string().optional(),
});

// Frontmatter validation schema
export const prospectFrontmatterSchema = Joi.object<ProspectFrontmatter>({
  type: Joi.string().valid('prospect-profile').required(),
  company: Joi.string().required(),
  industry: industrySchema.required(),
  location: Joi.string().required(),
  qualification_score: Joi.number().min(0).max(100).required(),
  pipeline_stage: pipelineStageSchema.required(),
  created: Joi.string().isoDate().required(),
  updated: Joi.string().isoDate().required(),
  tags: Joi.array().items(Joi.string()).default([]),
  
  // Optional contact fields
  primary_contact: Joi.string().optional(),
  contact_title: Joi.string().optional(),
  phone: Joi.string().optional(),
  email: Joi.string().email().optional(),
  website: Joi.string().uri().optional(),
  decision_maker: Joi.string().optional(),
  
  // Optional business fields
  employee_count: Joi.number().integer().min(1).optional(),
  estimated_revenue: Joi.number().min(0).optional(),
  business_size: businessSizeSchema.optional(),
  
  // Optional digital presence flags
  has_website: Joi.boolean().optional(),
  has_google_business: Joi.boolean().optional(),
  has_social_media: Joi.boolean().optional(),
  has_online_reviews: Joi.boolean().optional(),
  
  // Optional scoring breakdown
  score_business_size: Joi.number().min(0).max(20).optional(),
  score_digital_presence: Joi.number().min(0).max(25).optional(),
  score_competitor_gaps: Joi.number().min(0).max(20).optional(),
  score_location: Joi.number().min(0).max(15).optional(),
  score_industry: Joi.number().min(0).max(10).optional(),
  score_revenue: Joi.number().min(0).max(10).optional(),
}).unknown(); // Allow additional custom fields

/**
 * Custom validation functions
 */

export function validateQualificationScore(breakdown: any): boolean {
  const { businessSize, digitalPresence, competitorGaps, location, industry, revenueIndicators } = breakdown;
  const total = businessSize + digitalPresence + competitorGaps + location + industry + revenueIndicators;
  return total >= 0 && total <= 100;
}

export function validatePipelineStageTransition(from: PipelineStage, to: PipelineStage): boolean {
  const validTransitions: Record<PipelineStage, PipelineStage[]> = {
    cold: ['contacted', 'lost'],
    contacted: ['interested', 'lost', 'frozen'],
    interested: ['qualified', 'lost', 'frozen'],
    qualified: ['closed', 'lost', 'frozen'],
    closed: [], // Terminal state
    lost: [], // Terminal state
    frozen: ['cold', 'contacted', 'interested', 'qualified'], // Can be reactivated
  };
  
  return validTransitions[from]?.includes(to) ?? false;
}

export function validateBusinessSize(employeeCount?: number, category?: BusinessSize): boolean {
  if (!employeeCount || !category) return true;
  
  const sizeMappings = {
    micro: { min: 1, max: 9 },
    small: { min: 10, max: 49 },
    medium: { min: 50, max: 999 },
  };
  
  const range = sizeMappings[category];
  return employeeCount >= range.min && employeeCount <= range.max;
}

/**
 * ProspectValidator class for validating prospect data
 */
export class ProspectValidator {
  
  /**
   * Validate a complete prospect object
   */
  validateProspect(prospect: Prospect): boolean {
    try {
      const { error } = prospectSchema.validate(prospect, { abortEarly: false });
      if (error) {
        console.warn('Prospect validation failed:', error.details.map(d => d.message));
        return false;
      }
      
      // Additional business logic validations
      if (!validateQualificationScore(prospect.qualificationScore.breakdown)) {
        console.warn('Invalid qualification score breakdown');
        return false;
      }
      
      if (!validateBusinessSize(
        prospect.business.size.employeeCount, 
        prospect.business.size.category
      )) {
        console.warn('Business size category does not match employee count');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Prospect validation error:', error);
      return false;
    }
  }
  
  /**
   * Validate prospect creation input
   */
  validateCreationInput(input: ProspectCreationInput): boolean {
    try {
      const { error } = prospectCreationInputSchema.validate(input);
      if (error) {
        console.warn('Creation input validation failed:', error.details.map(d => d.message));
        return false;
      }
      return true;
    } catch (error) {
      console.error('Creation input validation error:', error);
      return false;
    }
  }
  
  /**
   * Validate prospect update input
   */
  validateUpdateInput(input: ProspectUpdateInput): boolean {
    try {
      const { error } = prospectUpdateInputSchema.validate(input);
      if (error) {
        console.warn('Update input validation failed:', error.details.map(d => d.message));
        return false;
      }
      return true;
    } catch (error) {
      console.error('Update input validation error:', error);
      return false;
    }
  }
  
  /**
   * Validate frontmatter data
   */
  validateFrontmatter(frontmatter: ProspectFrontmatter): boolean {
    try {
      const { error } = prospectFrontmatterSchema.validate(frontmatter);
      if (error) {
        console.warn('Frontmatter validation failed:', error.details.map(d => d.message));
        return false;
      }
      return true;
    } catch (error) {
      console.error('Frontmatter validation error:', error);
      return false;
    }
  }
  
  /**
   * Validate pipeline stage transition
   */
  validateStageTransition(from: PipelineStage, to: PipelineStage): boolean {
    return validatePipelineStageTransition(from, to);
  }
}