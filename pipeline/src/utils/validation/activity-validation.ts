/**
 * Validation schemas for Activity data model
 */

import Joi from 'joi';
import { 
  Activity, 
  ActivityCreationInput, 
  ActivityUpdateInput, 
  ActivityFrontmatter,
  ActivityType,
  ActivityOutcome,
  AgentType 
} from '@/types';

// Enum validation schemas
const activityTypeSchema = Joi.string().valid(
  'call', 'email', 'meeting', 'research', 'note', 'voicemail', 
  'linkedin_message', 'website_visit', 'document_sent', 'follow_up_scheduled'
);

const activityOutcomeSchema = Joi.string().valid(
  'positive', 'neutral', 'negative', 'no_contact', 'busy', 'voicemail',
  'email_bounce', 'unsubscribed', 'meeting_scheduled', 'demo_requested', 'not_interested'
);

const agentTypeSchema = Joi.string().valid(
  'prospecting_agent', 'pitch_creator_agent', 'voice_ai_agent', 
  'email_automation_agent', 'sales_orchestrator_agent', 'human_sales_rep'
);

const pipelineStageSchema = Joi.string().valid(
  'cold', 'contacted', 'interested', 'qualified', 'closed', 'lost', 'frozen'
);

// Sub-schema validations
const emailMetadataSchema = Joi.object({
  subject: Joi.string().min(1).max(200).required(),
  template: Joi.string().required(),
  opened: Joi.boolean().default(false),
  clicked: Joi.boolean().default(false),
  bounced: Joi.boolean().default(false),
  unsubscribed: Joi.boolean().default(false),
  deliveryStatus: Joi.string().valid('delivered', 'bounced', 'spam', 'pending').required(),
});

const callMetadataSchema = Joi.object({
  duration: Joi.number().min(0).max(7200).required(), // max 2 hours in seconds
  answered: Joi.boolean().required(),
  voicemailLeft: Joi.boolean().default(false),
  callQuality: Joi.string().valid('excellent', 'good', 'fair', 'poor').optional(),
  transcript: Joi.string().max(10000).optional(),
  recordingUrl: Joi.string().uri().optional(),
  nextCallScheduled: Joi.date().optional(),
});

const meetingMetadataSchema = Joi.object({
  platform: Joi.string().valid('zoom', 'teams', 'meet', 'phone', 'in_person').required(),
  duration: Joi.number().min(5).max(480).required(), // 5 minutes to 8 hours
  attendees: Joi.array().items(Joi.string()).min(1).required(),
  agenda: Joi.array().items(Joi.string()).default([]),
  outcomes: Joi.array().items(Joi.string()).default([]),
  followUpRequired: Joi.boolean().default(false),
});

const researchMetadataSchema = Joi.object({
  sources: Joi.array().items(Joi.string().uri()).min(1).required(),
  keyFindings: Joi.array().items(Joi.string()).min(1).required(),
  competitorIntel: Joi.boolean().default(false),
  digitalPresenceAudit: Joi.boolean().default(false),
  revenueEstimates: Joi.boolean().default(false),
});

const activityMetadataSchema = Joi.object({
  emailMetadata: emailMetadataSchema.optional(),
  callMetadata: callMetadataSchema.optional(),
  meetingMetadata: meetingMetadataSchema.optional(),
  researchMetadata: researchMetadataSchema.optional(),
});

const activityImpactSchema = Joi.object({
  qualificationScoreChange: Joi.number().min(-100).max(100).optional(),
  stageChange: Joi.object({
    from: pipelineStageSchema.required(),
    to: pipelineStageSchema.required(),
    automatic: Joi.boolean().required(),
    reason: Joi.string().min(10).max(500).required(),
  }).optional(),
  nextStepsGenerated: Joi.array().items(Joi.string()).default([]),
  buyingSignalsDetected: Joi.array().items(Joi.string()).default([]),
  painPointsIdentified: Joi.array().items(Joi.string()).default([]),
  opportunitiesDiscovered: Joi.array().items(Joi.string()).default([]),
});

const manualReviewSchema = Joi.object({
  required: Joi.boolean().required(),
  completed: Joi.boolean().default(false),
  reviewedBy: Joi.string().optional(),
  reviewDate: Joi.date().optional(),
  reviewNotes: Joi.string().max(1000).optional(),
});

// Main activity validation schema
export const activitySchema = Joi.object<Activity>({
  id: Joi.string().required(),
  prospectId: Joi.string().required(),
  campaignId: Joi.string().optional(),
  
  type: activityTypeSchema.required(),
  outcome: activityOutcomeSchema.required(),
  date: Joi.date().required(),
  duration: Joi.number().min(0).max(480).optional(), // in minutes
  
  agentResponsible: agentTypeSchema.required(),
  humanOverride: Joi.string().optional(),
  
  summary: Joi.string().min(10).max(500).required(),
  notes: Joi.string().max(2000).required(),
  keyDiscussionPoints: Joi.array().items(Joi.string()).optional(),
  
  metadata: activityMetadataSchema.required(),
  impact: activityImpactSchema.required(),
  
  followUpRequired: Joi.boolean().required(),
  followUpDate: Joi.date().when('followUpRequired', {
    is: true,
    then: Joi.date().min('now').required(),
    otherwise: Joi.optional(),
  }),
  followUpType: activityTypeSchema.when('followUpRequired', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  
  automatedActivity: Joi.boolean().required(),
  automationRules: Joi.array().items(Joi.string()).when('automatedActivity', {
    is: true,
    then: Joi.array().min(1),
    otherwise: Joi.optional(),
  }),
  manualReview: manualReviewSchema.optional(),
  
  filePath: Joi.string().required(),
  created: Joi.date().required(),
  updated: Joi.date().required(),
  tags: Joi.array().items(Joi.string()).default([]),
  
  relatedActivities: Joi.array().items(Joi.string()).optional(),
  triggeredByActivity: Joi.string().optional(),
  triggeredActivities: Joi.array().items(Joi.string()).optional(),
});

// Activity creation input validation
export const activityCreationInputSchema = Joi.object<ActivityCreationInput>({
  prospectId: Joi.string().required(),
  campaignId: Joi.string().optional(),
  type: activityTypeSchema.required(),
  outcome: activityOutcomeSchema.required(),
  summary: Joi.string().min(10).max(500).required(),
  notes: Joi.string().max(2000).required(),
  duration: Joi.number().min(0).max(480).optional(),
  agentResponsible: agentTypeSchema.required(),
  metadata: Joi.object().optional(),
  followUpRequired: Joi.boolean().default(false),
  followUpDate: Joi.date().when('followUpRequired', {
    is: true,
    then: Joi.date().min('now').required(),
    otherwise: Joi.optional(),
  }),
});

// Activity update input validation
export const activityUpdateInputSchema = Joi.object<ActivityUpdateInput>({
  id: Joi.string().required(),
  updates: Joi.object().min(1).required(),
  updateReason: Joi.string().optional(),
});

// Frontmatter validation schema
export const activityFrontmatterSchema = Joi.object<ActivityFrontmatter>({
  type: Joi.string().valid('activity').required(),
  prospect: Joi.string().required(),
  activity_type: activityTypeSchema.required(),
  outcome: activityOutcomeSchema.required(),
  date: Joi.string().isoDate().required(),
  duration: Joi.number().min(0).max(480).optional(),
  agent_responsible: agentTypeSchema.required(),
  created: Joi.string().isoDate().required(),
  updated: Joi.string().isoDate().required(),
  tags: Joi.array().items(Joi.string()).default([]),
  
  // Impact tracking
  stage_change_from: pipelineStageSchema.optional(),
  stage_change_to: pipelineStageSchema.optional(),
  qualification_score_change: Joi.number().min(-100).max(100).optional(),
  
  // Follow-up
  follow_up_required: Joi.boolean().required(),
  follow_up_date: Joi.string().isoDate().optional(),
  follow_up_type: activityTypeSchema.optional(),
  
  // Automation flags
  automated: Joi.boolean().required(),
  human_review_required: Joi.boolean().optional(),
  human_review_completed: Joi.boolean().optional(),
  
  // Email specific frontmatter
  email_opened: Joi.boolean().optional(),
  email_clicked: Joi.boolean().optional(),
  email_bounced: Joi.boolean().optional(),
  email_template: Joi.string().optional(),
  
  // Call specific frontmatter
  call_duration: Joi.number().min(0).optional(),
  call_answered: Joi.boolean().optional(),
  voicemail_left: Joi.boolean().optional(),
  call_quality: Joi.string().valid('excellent', 'good', 'fair', 'poor').optional(),
}).unknown(); // Allow additional custom fields

/**
 * Custom validation functions
 */

export function validateActivityTypeMetadata(type: ActivityType, metadata: any): boolean {
  switch (type) {
    case 'email':
      return !!metadata.emailMetadata;
    case 'call':
    case 'voicemail':
      return !!metadata.callMetadata;
    case 'meeting':
      return !!metadata.meetingMetadata;
    case 'research':
      return !!metadata.researchMetadata;
    default:
      return true; // Other types don't require specific metadata
  }
}

export function validateOutcomeForActivityType(type: ActivityType, outcome: ActivityOutcome): boolean {
  const validOutcomes: Record<ActivityType, ActivityOutcome[]> = {
    call: ['positive', 'neutral', 'negative', 'no_contact', 'busy', 'voicemail'],
    email: ['positive', 'neutral', 'negative', 'email_bounce', 'unsubscribed'],
    meeting: ['positive', 'neutral', 'negative', 'meeting_scheduled'],
    research: ['positive', 'neutral'],
    note: ['positive', 'neutral', 'negative'],
    voicemail: ['positive', 'neutral', 'negative', 'no_contact'],
    linkedin_message: ['positive', 'neutral', 'negative', 'no_contact'],
    website_visit: ['positive', 'neutral'],
    document_sent: ['positive', 'neutral', 'negative'],
    follow_up_scheduled: ['positive', 'neutral'],
  };
  
  return validOutcomes[type]?.includes(outcome) ?? false;
}

export function validateFollowUpLogic(followUpRequired: boolean, followUpDate?: Date, followUpType?: ActivityType): boolean {
  if (!followUpRequired) {
    return !followUpDate && !followUpType;
  }
  
  return !!followUpDate && !!followUpType && followUpDate > new Date();
}

export function validateStageTransition(from?: string, to?: string): boolean {
  if (!from || !to) return true;
  
  const validTransitions: Record<string, string[]> = {
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

export function validateManualReviewLogic(review?: any): boolean {
  if (!review || !review.required) return true;
  
  if (review.completed) {
    return !!review.reviewedBy && !!review.reviewDate;
  }
  
  return true; // Not completed yet is valid
}