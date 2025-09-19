/**
 * ISalesPipeline - Unified interface for the Sales Pipeline component
 * Handles prospect research, qualification, and sales automation
 */

// ============================================================
// Core Enums and Types
// ============================================================

export type PipelineStage = 
  | 'cold' 
  | 'contacted' 
  | 'interested' 
  | 'qualified' 
  | 'closed_won' 
  | 'closed_lost' 
  | 'frozen';

export type Industry = 
  | 'restaurants'
  | 'retail'
  | 'professional_services'
  | 'healthcare'
  | 'real_estate'
  | 'automotive'
  | 'home_services'
  | 'fitness'
  | 'beauty_salons'
  | 'legal_services'
  | 'other';

export type BusinessSize = 'micro' | 'small' | 'medium' | 'large';

export type ResearchPassType = 
  | 'google_maps'
  | 'firecrawl'
  | 'reviews'
  | 'additional_sources'
  | 'marketing_strategy';

export type AgentType = 
  | 'prospecting'
  | 'pitch_creator'
  | 'orchestrator';

// ============================================================
// Data Structures
// ============================================================

export interface IContactDetails {
  primaryContact?: string;
  contactTitle?: string;
  phone: string;
  email: string;
  website: string;
  decisionMaker?: string;
  socialProfiles?: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface IBusinessInfo {
  name: string;
  industry: Industry;
  location: {
    address?: string;
    city: string;
    state: string;
    country?: string;
    zipCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  size: {
    category: BusinessSize;
    employeeCount?: number;
    estimatedRevenue?: number;
  };
  digitalPresence?: {
    hasWebsite: boolean;
    hasGoogleBusiness: boolean;
    hasSocialMedia: boolean;
    hasOnlineReviews: boolean;
    websiteUrl?: string;
    googleBusinessUrl?: string;
  };
}

export interface IQualificationScore {
  total: number; // 0-100
  breakdown: {
    businessSize: number;
    digitalPresence: number;
    competitorGaps: number;
    location: number;
    industry: number;
    revenueIndicators: number;
  };
  qualificationLevel: 'high' | 'medium' | 'low' | 'disqualified';
  lastUpdated: Date;
}

export interface ICompetitorAnalysis {
  largeNationalCompetitors: Array<{
    name: string;
    strengths: string[];
    weaknesses: string[];
    marketShare?: string;
  }>;
  localCompetitors: Array<{
    name: string;
    location: string;
    strengths: string[];
    weaknesses: string[];
    estimatedSize?: string;
  }>;
  competitiveGaps: string[];
  opportunityAreas: string[];
  lastUpdated: Date;
}

export interface IMarketingStrategy {
  targetAudience: string[];
  valueProposition: string;
  keyMessages: string[];
  channels: Array<{
    channel: string;
    priority: 'high' | 'medium' | 'low';
    tactics: string[];
  }>;
  competitiveDifferentiators: string[];
  estimatedBudget?: {
    min: number;
    max: number;
  };
  expectedOutcomes: string[];
  nextSteps: string[];
}

export interface IResearchPass {
  passNumber: number;
  type: ResearchPassType;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  dataCollected: Record<string, any>;
  errors?: string[];
  retryCount: number;
  source: {
    api?: string;
    url?: string;
    method?: string;
  };
}

// ============================================================
// Main Prospect Interface
// ============================================================

export interface IProspect {
  // Identification
  id: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Core Information
  business: IBusinessInfo;
  contact: IContactDetails;
  
  // Sales Process
  pipelineStage: PipelineStage;
  qualificationScore: IQualificationScore;
  
  // Research Data
  researchPasses: IResearchPass[];
  dataConfidence: number; // 0-100
  
  // Analysis
  businessInsights?: {
    ownerInformation?: string;
    operationalSOPs?: string[];
    customerFeedbackTrends?: string[];
    competitiveAdvantages?: string[];
    painPoints?: string[];
    businessChallenges?: string[];
  };
  competitorAnalysis?: ICompetitorAnalysis;
  marketingStrategy?: IMarketingStrategy;
  
  // Metadata
  tags: string[];
  customFields?: Record<string, any>;
  obsidianFilePath?: string;
}

// ============================================================
// Agent Interfaces
// ============================================================

export interface IAgent {
  id: string;
  type: AgentType;
  name: string;
  status: 'idle' | 'active' | 'error' | 'disabled';
  capabilities: string[];
  
  execute(input: any): Promise<any>;
  validate(input: any): boolean;
  getMetrics(): IAgentMetrics;
}

export interface IAgentMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  lastExecutionTime?: Date;
  errorRate: number;
}

export interface IProspectingAgent extends IAgent {
  type: 'prospecting';
  
  researchBusiness(businessName: string, location: string): Promise<IProspect>;
  performResearchPass(prospect: IProspect, passType: ResearchPassType): Promise<IResearchPass>;
  enrichProspectData(prospect: IProspect): Promise<IProspect>;
  generateMarketingStrategy(prospect: IProspect): Promise<IMarketingStrategy>;
}

export interface IPitchCreatorAgent extends IAgent {
  type: 'pitch_creator';
  
  generatePitch(prospect: IProspect, template?: string): Promise<IPitch>;
  customizePitch(pitch: IPitch, customization: IPitchCustomization): Promise<IPitch>;
  evaluatePitch(pitch: IPitch): Promise<IPitchEvaluation>;
}

// ============================================================
// Pitch Generation
// ============================================================

export interface IPitch {
  id: string;
  prospectId: string;
  version: number;
  createdAt: Date;
  
  content: {
    subject: string;
    introduction: string;
    valueProposition: string;
    body: string;
    callToAction: string;
    signature: string;
  };
  
  personalization: {
    businessName: string;
    industry: string;
    painPoints: string[];
    benefits: string[];
  };
  
  metadata: {
    template?: string;
    tone: 'professional' | 'casual' | 'enthusiastic';
    length: 'short' | 'medium' | 'long';
    channel: 'email' | 'sms' | 'call_script';
  };
}

export interface IPitchCustomization {
  tone?: 'professional' | 'casual' | 'enthusiastic';
  emphasis?: string[];
  includeTestimonials?: boolean;
  includePricing?: boolean;
  urgency?: 'low' | 'medium' | 'high';
}

export interface IPitchEvaluation {
  score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  expectedConversionRate: number;
}

// ============================================================
// Pipeline Operations
// ============================================================

export interface ISalesPipelineOperations {
  // Prospect Management
  createProspect(input: IProspectCreationInput): Promise<IProspect>;
  updateProspect(id: string, updates: Partial<IProspect>): Promise<IProspect>;
  getProspect(id: string): Promise<IProspect | null>;
  listProspects(filters?: IProspectFilters): Promise<IProspect[]>;
  deleteProspect(id: string): Promise<boolean>;
  
  // Research Operations
  performFullResearch(businessName: string, location: string): Promise<IProspect>;
  retryFailedResearch(prospectId: string): Promise<IProspect>;
  enrichProspectData(prospectId: string): Promise<IProspect>;
  
  // Pipeline Management
  moveToStage(prospectId: string, stage: PipelineStage): Promise<IProspect>;
  qualifyProspect(prospectId: string): Promise<IQualificationScore>;
  
  // Analytics
  getPipelineMetrics(): Promise<IPipelineMetrics>;
  getConversionRates(): Promise<IConversionMetrics>;
  
  // Integration
  syncWithObsidian(): Promise<ISyncResult>;
  exportToCSV(filters?: IProspectFilters): Promise<string>;
}

// ============================================================
// Supporting Interfaces
// ============================================================

export interface IProspectCreationInput {
  businessName: string;
  industry?: Industry;
  city: string;
  state: string;
  phone?: string;
  email?: string;
  website?: string;
  additionalInfo?: Record<string, any>;
}

export interface IProspectFilters {
  industry?: Industry[];
  pipelineStage?: PipelineStage[];
  qualificationScoreMin?: number;
  qualificationScoreMax?: number;
  city?: string;
  state?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  tags?: string[];
}

export interface IPipelineMetrics {
  totalProspects: number;
  prospectsByStage: Record<PipelineStage, number>;
  averageQualificationScore: number;
  researchCompletionRate: number;
  averageResearchTime: number;
  topPerformingIndustries: Industry[];
}

export interface IConversionMetrics {
  coldToContacted: number;
  contactedToInterested: number;
  interestedToQualified: number;
  qualifiedToClosedWon: number;
  overallConversion: number;
  averageSalesCycleLength: number;
}

export interface ISyncResult {
  success: boolean;
  syncedProspects: number;
  errors: string[];
  lastSyncTime: Date;
}

// ============================================================
// Event System
// ============================================================

export interface IPipelineEvent {
  id: string;
  timestamp: Date;
  type: IPipelineEventType;
  prospectId?: string;
  data: Record<string, any>;
  source: string;
}

export type IPipelineEventType = 
  | 'prospect.created'
  | 'prospect.updated'
  | 'prospect.qualified'
  | 'prospect.stage_changed'
  | 'research.started'
  | 'research.completed'
  | 'research.failed'
  | 'pitch.generated'
  | 'pitch.sent'
  | 'integration.synced';

// ============================================================
// Configuration
// ============================================================

export interface ISalesPipelineConfig {
  apis: {
    googleMaps: {
      apiKey: string;
      rateLimit: number;
    };
    firecrawl: {
      apiKey: string;
      baseUrl: string;
    };
    perplexity: {
      apiKey: string;
      model: string;
    };
    anthropic: {
      apiKey: string;
      model: string;
    };
  };
  
  obsidian: {
    vaultPath: string;
    templatesPath: string;
    prospectsPath: string;
  };
  
  pipeline: {
    defaultIndustry: Industry;
    qualificationThreshold: number;
    maxResearchRetries: number;
    researchTimeout: number;
  };
  
  agents: {
    concurrency: number;
    retryPolicy: {
      maxRetries: number;
      backoffMultiplier: number;
    };
  };
}

export default ISalesPipelineOperations;