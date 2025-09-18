/**
 * Core data models for Activity entity
 * Tracks all interactions and activities in the sales process
 */

import { PipelineStage } from './prospect';

export type ActivityType = 
  | 'call'
  | 'email'
  | 'meeting'
  | 'research'
  | 'note'
  | 'voicemail'
  | 'linkedin_message'
  | 'website_visit'
  | 'document_sent'
  | 'follow_up_scheduled';

export type ActivityOutcome = 
  | 'positive'
  | 'neutral'
  | 'negative'
  | 'no_contact'
  | 'busy'
  | 'voicemail'
  | 'email_bounce'
  | 'unsubscribed'
  | 'meeting_scheduled'
  | 'demo_requested'
  | 'not_interested';

export type AgentType = 
  | 'prospecting_agent'
  | 'pitch_creator_agent'
  | 'voice_ai_agent'
  | 'email_automation_agent'
  | 'sales_orchestrator_agent'
  | 'human_sales_rep';

export interface ActivityMetadata {
  // Email specific
  emailMetadata?: {
    subject: string;
    template: string;
    opened: boolean;
    clicked: boolean;
    bounced: boolean;
    unsubscribed: boolean;
    deliveryStatus: 'delivered' | 'bounced' | 'spam' | 'pending';
  };
  
  // Call specific  
  callMetadata?: {
    duration: number; // seconds
    answered: boolean;
    voicemailLeft: boolean;
    callQuality: 'excellent' | 'good' | 'fair' | 'poor';
    transcript?: string;
    recordingUrl?: string;
    nextCallScheduled?: Date;
  };
  
  // Meeting specific
  meetingMetadata?: {
    platform: 'zoom' | 'teams' | 'meet' | 'phone' | 'in_person';
    duration: number; // minutes
    attendees: string[];
    agenda: string[];
    outcomes: string[];
    followUpRequired: boolean;
  };
  
  // Research specific
  researchMetadata?: {
    sources: string[];
    keyFindings: string[];
    competitorIntel: boolean;
    digitalPresenceAudit: boolean;
    revenueEstimates: boolean;
  };
}

export interface ActivityImpact {
  qualificationScoreChange?: number;
  stageChange?: {
    from: PipelineStage;
    to: PipelineStage;
    automatic: boolean;
    reason: string;
  };
  nextStepsGenerated: string[];
  buyingSignalsDetected: string[];
  painPointsIdentified: string[];
  opportunitiesDiscovered: string[];
}

export interface Activity {
  // Basic information
  id: string;
  prospectId: string;
  campaignId?: string;
  
  // Activity details
  type: ActivityType;
  outcome: ActivityOutcome;
  date: Date;
  duration?: number; // in minutes
  
  // Agent/user information
  agentResponsible: AgentType;
  humanOverride?: string; // human who modified AI action
  
  // Content
  summary: string;
  notes: string;
  keyDiscussionPoints?: string[];
  
  // Type-specific metadata
  metadata: ActivityMetadata;
  
  // Impact assessment
  impact: ActivityImpact;
  
  // Follow-up
  followUpRequired: boolean;
  followUpDate?: Date;
  followUpType?: ActivityType;
  
  // Automation
  automatedActivity: boolean;
  automationRules?: string[];
  manualReview?: {
    required: boolean;
    completed: boolean;
    reviewedBy?: string;
    reviewDate?: Date;
    reviewNotes?: string;
  };
  
  // Obsidian metadata
  filePath: string;
  created: Date;
  updated: Date;
  tags: string[];
  
  // Relationships
  relatedActivities?: string[]; // IDs of related activities
  triggeredByActivity?: string; // ID of activity that triggered this one
  triggeredActivities?: string[]; // IDs of activities this one triggered
}

/**
 * Frontmatter structure for Obsidian activity files
 */
export interface ActivityFrontmatter {
  type: 'activity';
  prospect: string; // company name or link
  activity_type: ActivityType;
  outcome: ActivityOutcome;
  date: string; // ISO date string
  duration?: number;
  agent_responsible: AgentType;
  created: string; // ISO date string
  updated: string; // ISO date string
  tags: string[];
  
  // Impact tracking
  stage_change_from?: PipelineStage;
  stage_change_to?: PipelineStage;
  qualification_score_change?: number;
  
  // Follow-up
  follow_up_required: boolean;
  follow_up_date?: string; // ISO date string
  follow_up_type?: ActivityType;
  
  // Automation flags
  automated: boolean;
  human_review_required?: boolean;
  human_review_completed?: boolean;
  
  // Email specific frontmatter
  email_opened?: boolean;
  email_clicked?: boolean;
  email_bounced?: boolean;
  email_template?: string;
  
  // Call specific frontmatter
  call_duration?: number;
  call_answered?: boolean;
  voicemail_left?: boolean;
  call_quality?: string;
  
  // Custom fields
  [key: string]: any;
}

export interface ActivityCreationInput {
  prospectId: string;
  campaignId?: string;
  type: ActivityType;
  outcome: ActivityOutcome;
  summary: string;
  notes: string;
  duration?: number;
  agentResponsible: AgentType;
  metadata?: Partial<ActivityMetadata>;
  followUpRequired?: boolean;
  followUpDate?: Date;
}

export interface ActivityUpdateInput {
  id: string;
  updates: Partial<Activity>;
  updateReason?: string;
}

export interface ActivityAnalytics {
  prospectId?: string;
  campaignId?: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  
  // Volume metrics
  totalActivities: number;
  activitiesByType: Record<ActivityType, number>;
  activitiesByOutcome: Record<ActivityOutcome, number>;
  activitiesByAgent: Record<AgentType, number>;
  
  // Effectiveness metrics
  positiveOutcomeRate: number;
  stageAdvancementRate: number;
  followUpCompletionRate: number;
  averageResponseTime: number; // hours
  
  // Quality metrics
  averageActivityDuration: number;
  manualReviewRate: number;
  automationSuccessRate: number;
  
  // Trends
  activityTrends: {
    period: string; // 'daily' | 'weekly' | 'monthly'
    data: Array<{
      date: string;
      count: number;
      positiveRate: number;
    }>;
  };
  
  generatedAt: Date;
}

export interface BuyingSignal {
  id: string;
  prospectId: string;
  activityId: string;
  signal: string;
  strength: 'weak' | 'moderate' | 'strong';
  category: 'intent' | 'timing' | 'budget' | 'authority' | 'need';
  detectedAt: Date;
  confidence: number; // 0-100
  agentDetected: AgentType;
  followUpAction?: string;
}