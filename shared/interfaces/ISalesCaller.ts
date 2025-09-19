/**
 * ISalesCaller - Unified interface for the Sales Caller component
 * Handles automated voice calling, lead qualification, and call management
 */

import { IProspect, PipelineStage, Industry, IQualificationScore } from './ISalesPipeline';

// ============================================================
// Core Enums and Types
// ============================================================

export type CallStatus = 
  | 'scheduled'
  | 'in_progress'
  | 'connected'
  | 'voicemail'
  | 'no_answer'
  | 'busy'
  | 'disconnected'
  | 'invalid_number'
  | 'completed'
  | 'failed';

export type InterestLevel = 
  | 'high'
  | 'medium'
  | 'low'
  | 'none'
  | 'hostile';

export type NextAction = 
  | 'schedule_meeting'
  | 'send_follow_up_sms'
  | 'email_info'
  | 'call_back_later'
  | 'remove_from_list'
  | 'escalate_to_human';

export type CallOutcome = 
  | 'qualified'
  | 'not_qualified'
  | 'callback_requested'
  | 'meeting_scheduled'
  | 'not_interested'
  | 'wrong_number'
  | 'do_not_call';

export type ScriptVariant = 
  | 'standard'
  | 'value_focused'
  | 'problem_solving'
  | 'relationship_building'
  | 'competitive_advantage'
  | 'limited_time_offer';

export type ConversationTone = 
  | 'professional'
  | 'friendly'
  | 'enthusiastic'
  | 'consultative'
  | 'urgent';

// ============================================================
// Call Data Structures
// ============================================================

export interface ICallRecord {
  // Identification
  id: string;
  prospectId: string;
  campaignId?: string;
  
  // Timing
  scheduledAt?: Date;
  startedAt: Date;
  endedAt?: Date;
  duration: number; // seconds
  
  // Contact Information
  phoneNumber: string;
  prospectName: string;
  companyName: string;
  industry: Industry;
  
  // Call Details
  status: CallStatus;
  outcome?: CallOutcome;
  qualificationScore?: number; // 1-10
  interestLevel?: InterestLevel;
  nextAction?: NextAction;
  
  // Meeting Scheduling
  meetingScheduled: boolean;
  meetingDate?: Date;
  meetingNotes?: string;
  
  // Recording & Transcript
  recordingUrl?: string;
  transcript?: ICallTranscript;
  
  // AI Analysis
  sentiment?: ISentimentAnalysis;
  keyPoints?: string[];
  objections?: string[];
  opportunities?: string[];
  
  // Metadata
  vapiCallId?: string;
  twilioCallSid?: string;
  assistantId?: string;
  phoneNumberId?: string;
  cost?: number;
  
  // Notes
  aiNotes?: string;
  humanNotes?: string;
}

export interface ICallTranscript {
  fullText: string;
  segments: ITranscriptSegment[];
  summary?: string;
  duration: number;
  wordCount: number;
  speakerTurns: number;
}

export interface ITranscriptSegment {
  speaker: 'agent' | 'prospect';
  text: string;
  timestamp: number; // seconds from start
  sentiment?: 'positive' | 'neutral' | 'negative';
  keywords?: string[];
}

export interface ISentimentAnalysis {
  overall: 'positive' | 'neutral' | 'negative' | 'mixed';
  score: number; // -1 to 1
  breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  timeline: Array<{
    timestamp: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    intensity: number;
  }>;
}

// ============================================================
// Campaign Management
// ============================================================

export interface ICallCampaign {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  
  // Timing
  createdAt: Date;
  startDate: Date;
  endDate?: Date;
  
  // Targeting
  prospectCriteria: {
    industries?: Industry[];
    qualificationScoreMin?: number;
    qualificationScoreMax?: number;
    cities?: string[];
    states?: string[];
    customFilters?: Record<string, any>;
  };
  
  // Configuration
  scriptVariant: ScriptVariant;
  conversationTone: ConversationTone;
  callSettings: ICallSettings;
  
  // Performance
  metrics?: ICampaignMetrics;
  
  // Prospects
  totalProspects: number;
  completedCalls: number;
  remainingCalls: number;
}

export interface ICallSettings {
  maxAttempts: number;
  attemptInterval: number; // hours
  callWindow: {
    startHour: number; // 0-23
    endHour: number;
    timezone: string;
    daysOfWeek: number[]; // 0-6, 0=Sunday
  };
  voicemailSettings: {
    leaveMessage: boolean;
    messageScript?: string;
  };
  complianceSettings: {
    respectDNC: boolean;
    recordCalls: boolean;
    requireConsent: boolean;
  };
}

export interface ICampaignMetrics {
  totalCalls: number;
  successfulConnections: number;
  qualifiedProspects: number;
  meetingsBooked: number;
  
  // Rates
  connectionRate: number;
  qualificationRate: number;
  bookingRate: number;
  
  // Performance
  averageCallDuration: number;
  averageQualificationScore: number;
  totalCallTime: number;
  
  // Cost
  totalCost: number;
  costPerConnection: number;
  costPerQualified: number;
  costPerMeeting: number;
  
  // By outcome
  outcomeDistribution: Record<CallOutcome, number>;
  interestDistribution: Record<InterestLevel, number>;
}

// ============================================================
// Vapi AI Integration
// ============================================================

export interface IVapiAssistant {
  id: string;
  name: string;
  model: string;
  voice: string;
  
  systemPrompt: string;
  firstMessage: string;
  
  tools?: IVapiTool[];
  functions?: IVapiFunction[];
  
  settings: {
    temperature: number;
    maxTokens: number;
    interruptionThreshold?: number;
    silenceTimeout?: number;
    responseTimeout?: number;
  };
}

export interface IVapiTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  required?: string[];
}

export interface IVapiFunction {
  name: string;
  description: string;
  code: string;
  async: boolean;
}

export interface IVapiWebhookPayload {
  event: 'call.started' | 'call.ended' | 'call.failed' | 'transcript.partial' | 'transcript.final';
  callId: string;
  assistantId: string;
  phoneNumberId: string;
  data: Record<string, any>;
  timestamp: Date;
}

// ============================================================
// Script Management
// ============================================================

export interface ICallScript {
  id: string;
  name: string;
  variant: ScriptVariant;
  version: number;
  
  content: {
    opening: string;
    introduction: string;
    valueProposition: string;
    qualificationQuestions: IQualificationQuestion[];
    objectionHandlers: IObjectionHandler[];
    closing: string;
    voicemail?: string;
  };
  
  personalization: {
    tokens: string[]; // e.g., {{lead_name}}, {{company}}, {{pain_point}}
    industryVariations?: Record<Industry, Partial<ICallScript['content']>>;
  };
  
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    author: string;
    performance?: {
      usageCount: number;
      averageQualificationScore: number;
      conversionRate: number;
    };
  };
}

export interface IQualificationQuestion {
  id: string;
  question: string;
  purpose: string;
  scoringWeight: number;
  expectedAnswers?: {
    positive: string[];
    neutral: string[];
    negative: string[];
  };
  followUpQuestions?: IQualificationQuestion[];
}

export interface IObjectionHandler {
  objection: string;
  category: 'price' | 'timing' | 'authority' | 'need' | 'trust' | 'competition';
  responses: Array<{
    response: string;
    effectiveness?: number; // 0-100
  }>;
  fallbackToHuman: boolean;
}

// ============================================================
// Call Operations Interface
// ============================================================

export interface ISalesCallerOperations {
  // Call Management
  initiateCall(prospectId: string, campaignId?: string): Promise<ICallRecord>;
  scheduleCall(prospectId: string, scheduledAt: Date, campaignId?: string): Promise<ICallRecord>;
  cancelCall(callId: string): Promise<boolean>;
  getCall(callId: string): Promise<ICallRecord | null>;
  listCalls(filters?: ICallFilters): Promise<ICallRecord[]>;
  
  // Campaign Management
  createCampaign(input: ICampaignCreationInput): Promise<ICallCampaign>;
  startCampaign(campaignId: string): Promise<ICallCampaign>;
  pauseCampaign(campaignId: string): Promise<ICallCampaign>;
  getCampaignMetrics(campaignId: string): Promise<ICampaignMetrics>;
  
  // Script Management
  createScript(script: Partial<ICallScript>): Promise<ICallScript>;
  updateScript(scriptId: string, updates: Partial<ICallScript>): Promise<ICallScript>;
  getScript(scriptId: string): Promise<ICallScript | null>;
  listScripts(): Promise<ICallScript[]>;
  
  // Vapi Integration
  createAssistant(config: Partial<IVapiAssistant>): Promise<IVapiAssistant>;
  updateAssistant(assistantId: string, updates: Partial<IVapiAssistant>): Promise<IVapiAssistant>;
  handleWebhook(payload: IVapiWebhookPayload): Promise<void>;
  
  // Analytics
  getCallAnalytics(timeframe?: ITimeframe): Promise<ICallAnalytics>;
  getAgentPerformance(): Promise<IAgentPerformance>;
  
  // Qualification
  qualifyLead(callId: string): Promise<IQualificationResult>;
  updateQualification(callId: string, score: number, notes?: string): Promise<ICallRecord>;
  
  // Integration
  syncWithCRM(callId: string): Promise<boolean>;
  exportCallData(filters?: ICallFilters): Promise<string>;
  createLinearProject(callId: string): Promise<string>;
}

// ============================================================
// Supporting Interfaces
// ============================================================

export interface ICallFilters {
  campaignId?: string;
  prospectId?: string;
  status?: CallStatus[];
  outcome?: CallOutcome[];
  interestLevel?: InterestLevel[];
  qualificationScoreMin?: number;
  qualificationScoreMax?: number;
  startDate?: Date;
  endDate?: Date;
  hasRecording?: boolean;
  hasMeeting?: boolean;
}

export interface ICampaignCreationInput {
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  prospectCriteria: ICallCampaign['prospectCriteria'];
  scriptVariant: ScriptVariant;
  conversationTone?: ConversationTone;
  callSettings?: Partial<ICallSettings>;
}

export interface ITimeframe {
  start: Date;
  end: Date;
  granularity?: 'hour' | 'day' | 'week' | 'month';
}

export interface ICallAnalytics {
  summary: {
    totalCalls: number;
    uniqueProspects: number;
    totalDuration: number;
    averageDuration: number;
    totalCost: number;
  };
  
  performance: {
    connectionRate: number;
    qualificationRate: number;
    meetingBookingRate: number;
    conversionRate: number;
  };
  
  outcomes: Record<CallOutcome, number>;
  
  trends: Array<{
    date: Date;
    calls: number;
    connections: number;
    qualified: number;
    meetings: number;
  }>;
  
  topObjections: Array<{
    objection: string;
    count: number;
    handleRate: number;
  }>;
}

export interface IAgentPerformance {
  scriptPerformance: Record<ScriptVariant, {
    usageCount: number;
    avgQualificationScore: number;
    conversionRate: number;
  }>;
  
  bestPerformingHours: Array<{
    hour: number;
    connectionRate: number;
    conversionRate: number;
  }>;
  
  industryPerformance: Record<Industry, {
    callCount: number;
    qualificationRate: number;
    avgCallDuration: number;
  }>;
}

export interface IQualificationResult {
  score: number; // 1-10
  qualified: boolean;
  factors: {
    budget: boolean;
    authority: boolean;
    need: boolean;
    timeline: boolean;
    interest: boolean;
  };
  summary: string;
  recommendedNextSteps: string[];
}

// ============================================================
// Make.com Integration
// ============================================================

export interface IMakeWebhookPayload {
  action: 'process_call' | 'update_sheets' | 'send_follow_up' | 'create_linear_project';
  callData: ICallRecord;
  prospectData?: IProspect;
  additionalData?: Record<string, any>;
}

export interface IMakeScenario {
  id: string;
  name: string;
  trigger: 'call_completed' | 'prospect_qualified' | 'meeting_scheduled';
  actions: Array<{
    type: string;
    config: Record<string, any>;
  }>;
  enabled: boolean;
}

// ============================================================
// Event System
// ============================================================

export interface ICallerEvent {
  id: string;
  timestamp: Date;
  type: ICallerEventType;
  callId?: string;
  campaignId?: string;
  data: Record<string, any>;
  source: string;
}

export type ICallerEventType = 
  | 'call.scheduled'
  | 'call.started'
  | 'call.connected'
  | 'call.completed'
  | 'call.failed'
  | 'prospect.qualified'
  | 'meeting.scheduled'
  | 'campaign.started'
  | 'campaign.completed'
  | 'webhook.received';

// ============================================================
// Configuration
// ============================================================

export interface ISalesCallerConfig {
  vapi: {
    apiKey: string;
    baseUrl: string;
    assistantId: string;
    phoneNumberId: string;
    webhookUrl?: string;
  };
  
  twilio: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
  
  make: {
    webhookUrl: string;
    apiKey: string;
    scenarios: IMakeScenario[];
  };
  
  googleSheets: {
    spreadsheetId: string;
    credentials: Record<string, any>;
  };
  
  calling: {
    maxConcurrentCalls: number;
    defaultCallWindow: ICallSettings['callWindow'];
    qualificationThreshold: number; // 1-10, typically 7
    recordingEnabled: boolean;
    complianceMode: 'strict' | 'standard';
  };
  
  integration: {
    linearEnabled: boolean;
    crmWebhookUrl?: string;
    obsidianVaultPath?: string;
  };
}

export default ISalesCallerOperations;