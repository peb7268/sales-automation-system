/**
 * Centralized type exports for the sales automation system
 */

// Prospect types
export type {
  Prospect,
  ProspectFrontmatter,
  ProspectCreationInput,
  ProspectUpdateInput,
  PipelineStage,
  Industry,
  BusinessSize,
  ContactDetails,
  BusinessInfo,
  QualificationScore,
  InteractionHistory,
  CompetitorAnalysis,
} from './prospect';

// Campaign types
export type {
  Campaign,
  CampaignFrontmatter,
  CampaignCreationInput,
  CampaignUpdateInput,
  CampaignAnalytics,
  CampaignStatus,
  CampaignType,
  GeographicParameters,
  TargetingCriteria,
  MessagingTemplates,
  ABTestVariant,
  PerformanceMetrics,
} from './campaign';

// Activity types
export type {
  Activity,
  ActivityFrontmatter,
  ActivityCreationInput,
  ActivityUpdateInput,
  ActivityAnalytics,
  ActivityType,
  ActivityOutcome,
  AgentType,
  ActivityMetadata,
  ActivityImpact,
  BuyingSignal,
} from './activity';

// Common utility types
export interface BaseEntity {
  id: string;
  created: Date;
  updated: Date;
  filePath: string;
  tags: string[];
}

export interface ObsidianMetadata {
  templateUsed: string;
  lastSyncDate: Date;
  kanbanPosition?: number;
  backlinks?: string[];
  linkedMentions?: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
}

export interface DataSyncResult {
  entity: 'prospect' | 'campaign' | 'activity';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'sync';
  success: boolean;
  error?: string;
  timestamp: Date;
}

export interface ObsidianConfig {
  vaultPath: string;
  templatesPath: string;
  prospectsPath: string;
  campaignsPath: string;
  activitiesPath: string;
  dashboardsPath: string;
  autoSync: boolean;
  syncInterval: number; // milliseconds
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
  requestId?: string;
}

export interface PaginatedResponse<T = any> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Agent-specific types
export interface AgentConfig {
  name: string;
  enabled: boolean;
  version: string;
  settings: Record<string, any>;
  dependencies?: string[];
}

export interface AgentStatus {
  name: string;
  status: 'running' | 'stopped' | 'error' | 'initializing';
  lastActivity?: Date;
  processed: {
    today: number;
    total: number;
  };
  errors: {
    count: number;
    lastError?: string;
    lastErrorTime?: Date;
  };
}