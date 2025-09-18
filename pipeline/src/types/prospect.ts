/**
 * Core data models for Prospect entity
 * Designed to work with Obsidian frontmatter and markdown structure
 */

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

export type BusinessSize = 'micro' | 'small' | 'medium';

export interface ContactDetails {
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

export interface DataConfidence {
  field: string;
  confidence: number; // 0-100
  sources: string[]; // Array of sources that verified this data
  lastVerified: Date;
  conflictingData?: Array<{
    value: any;
    source: string;
    confidence: number;
  }>;
}

export interface ProspectDataSources {
  googleMaps?: {
    placeId?: string;
    dataExtracted: string[];
    lastUpdated: Date;
  };
  firecrawlSearch?: {
    searchQueries: string[];
    resultsAnalyzed: number;
    lastUpdated: Date;
  };
  googleReviews?: {
    reviewCount: number;
    insightsExtracted: string[];
    lastUpdated: Date;
  };
  secretaryOfState?: {
    filingNumber?: string;
    entityStatus?: string;
    lastUpdated: Date;
  };
  yellowPages?: {
    listingId?: string;
    lastUpdated: Date;
  };
  websiteScrape?: {
    url: string;
    pagesCrawled: string[];
    lastUpdated: Date;
  };
}

export interface BusinessInfo {
  name: string;
  industry: Industry;
  location: {
    city: string;
    state: string;
    country?: string;
    zipCode?: string;
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
  };
}

export interface QualificationScore {
  total: number; // 0-100
  breakdown: {
    businessSize: number; // 0-20 points
    digitalPresence: number; // 0-25 points
    competitorGaps: number; // 0-20 points
    location: number; // 0-15 points
    industry: number; // 0-10 points
    revenueIndicators: number; // 0-10 points
  };
  lastUpdated: Date;
}

export interface InteractionHistory {
  id: string;
  date: Date;
  type: 'call' | 'email' | 'meeting' | 'research' | 'note';
  outcome: 'positive' | 'neutral' | 'negative' | 'no_contact';
  duration?: number; // in minutes
  agentResponsible: string;
  notes: string;
  nextSteps?: string[];
  stageChange?: {
    from: PipelineStage;
    to: PipelineStage;
  };
}

export interface CompetitorAnalysis {
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

export interface Prospect {
  // Obsidian metadata
  id: string;
  filePath: string;
  created: Date;
  updated: Date;
  tags: string[];
  
  // Core business information
  business: BusinessInfo;
  contact: ContactDetails;
  
  // Sales pipeline data
  pipelineStage: PipelineStage;
  qualificationScore: QualificationScore;
  
  // Data quality and confidence tracking
  dataConfidence: DataConfidence[];
  dataSources: ProspectDataSources;
  overallConfidence: number; // 0-100 aggregate confidence score
  
  // Business insights from reviews and research
  businessInsights?: {
    ownerInformation?: string;
    operationalSOPs?: string[];
    customerFeedbackTrends?: string[];
    competitiveAdvantages?: string[];
    painPoints?: string[];
    businessChallenges?: string[];
  };
  
  // Interaction tracking
  interactions: InteractionHistory[];
  
  // Competitive analysis
  competitors?: CompetitorAnalysis;
  
  // Custom fields for additional data
  customFields?: Record<string, any>;
  
  // Obsidian-specific fields
  obsidianMeta?: {
    templateUsed: string;
    lastSyncDate: Date;
    kanbanPosition?: number;
  };
}

/**
 * Frontmatter structure for Obsidian prospect files
 */
export interface ProspectFrontmatter {
  type: 'prospect-profile';
  company: string;
  industry: Industry;
  location: string;
  qualification_score: number;
  pipeline_stage: PipelineStage;
  created: string; // ISO date string
  updated: string; // ISO date string
  tags: string[];
  
  // Contact information
  primary_contact?: string;
  contact_title?: string;
  phone?: string;
  email?: string;
  website?: string;
  decision_maker?: string;
  
  // Business details
  employee_count?: number;
  estimated_revenue?: number;
  business_size?: BusinessSize;
  
  // Digital presence flags
  has_website?: boolean;
  has_google_business?: boolean;
  has_social_media?: boolean;
  has_online_reviews?: boolean;
  
  // Scoring breakdown
  score_business_size?: number;
  score_digital_presence?: number;
  score_competitor_gaps?: number;
  score_location?: number;
  score_industry?: number;
  score_revenue?: number;
  
  // Custom fields
  [key: string]: any;
}

export interface ProspectCreationInput {
  businessName: string;
  industry: Industry;
  city: string;
  state: string;
  phone?: string;
  email?: string;
  website?: string;
  estimatedRevenue?: number;
  employeeCount?: number;
}

export interface ProspectUpdateInput {
  id: string;
  updates: Partial<Prospect>;
  updateReason?: string;
}