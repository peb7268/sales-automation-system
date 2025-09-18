import { Tool } from '@mastra/core';
import { z } from 'zod';
import { MastraAgentBase, MastraAgentBaseConfig } from './MastraAgentBase';
import { PitchComponents, ProspectFrontmatter } from '../pitch-creator-agent';
import { prospectFolderManager, sanitizeProspectName } from '../../utils/obsidian/prospect-folder-manager';
import { parseFrontmatter } from '../../utils/obsidian/frontmatter-parser';
import { join } from 'path';
import { readFile, writeFile } from 'fs/promises';
import PitchABTestingFramework from './PitchABTestingFramework';

// Pipeline stages for stage-aware messaging
type PipelineStage = 'cold' | 'warm' | 'interested' | 'qualified';

// Time-boxed pitch structures
interface PitchTiming {
  hook: number; // 30 seconds
  valueProposition: number; // 60 seconds
  close: number; // 120 seconds
}

// Stage-aware message templates
interface StageAwareMessages {
  cold: {
    hook: string;
    approach: string;
    callToAction: string;
  };
  warm: {
    hook: string;
    approach: string;
    callToAction: string;
  };
  interested: {
    hook: string;
    approach: string;
    callToAction: string;
  };
  qualified: {
    hook: string;
    approach: string;
    callToAction: string;
  };
}

// Competitor analysis structure
interface CompetitorAnalysis {
  large: Array<{ name: string; marketShare: number; strengths: string[]; weaknesses: string[] }>;
  national: Array<{ name: string; marketShare: number; strengths: string[]; weaknesses: string[] }>;
  local: Array<{ name: string; location: string; strengths: string[]; weaknesses: string[] }>;
}

// Zod schemas for tool parameters
const prospectAnalysisSchema = z.object({
  prospectData: z.record(z.any()),
  analysisType: z.enum(['business_profile', 'digital_presence', 'market_position', 'competitor_analysis']).optional()
});

const industryInsightsSchema = z.object({
  industry: z.string(),
  location: z.string(),
  businessSize: z.string(),
  competitors: z.array(z.string()).optional()
});

const pitchCreationSchema = z.object({
  prospectData: z.record(z.any()),
  insights: z.record(z.any()),
  template: z.enum(['standard', 'executive', 'technical']).optional(),
  focusAreas: z.array(z.string()).optional(),
  pipelineStage: z.enum(['cold', 'warm', 'interested', 'qualified']).optional(),
  timeBoxed: z.boolean().optional()
});

const pitchValidationSchema = z.object({
  pitchContent: z.string(),
  prospectData: z.record(z.any()),
  qualityCriteria: z.record(z.any()).optional()
});

/**
 * Enhanced Pitch Creator Agent built on Mastra framework
 * Specializes in creating personalized sales pitches with AI-powered insights
 */
export class MastraPitchCreatorAgent extends MastraAgentBase {
  private readonly obsidianVaultPath: string;
  private industryKnowledgeBase: Map<string, any> = new Map();
  private caseStudyDatabase: Map<string, any> = new Map();
  private competitorDatabase: Map<string, CompetitorAnalysis> = new Map();
  private stageAwareTemplates: StageAwareMessages;
  private pitchTiming: PitchTiming;
  private abTestingFramework: PitchABTestingFramework;

  constructor() {
    const config: MastraAgentBaseConfig = {
      name: 'AI Pitch Creator Agent',
      instructions: MastraPitchCreatorAgent.getInstructions(),
      temperature: 0.3, // Balanced creativity and consistency
      maxTokens: 8000
    };

    super(config);

    this.obsidianVaultPath = process.env.OBSIDIAN_VAULT_PATH || '/Users/pbarrick/Documents/Main';
    
    // Initialize timing constraints for time-boxed pitches
    this.pitchTiming = {
      hook: 30,        // 30 seconds
      valueProposition: 60,  // 60 seconds
      close: 120       // 120 seconds (2 minutes)
    };

    // Initialize stage-aware messaging templates
    this.stageAwareTemplates = this.initializeStageTemplates();
    
    // Initialize A/B testing framework
    this.abTestingFramework = new PitchABTestingFramework('./data/pitch-ab-testing');

    // Initialize knowledge bases
    this.initializeKnowledgeBases();
    this.initializeCompetitorDatabase();
    
    this.logger.info('MastraPitchCreatorAgent initialized with stage-aware messaging, competitor analysis, and A/B testing framework');
  }

  /**
   * Define agent-specific tools for pitch creation operations
   */
  getTools(): Tool[] {
    return [
      {
        id: 'analyzeProspectData',
        description: 'Analyze prospect business profile and identify opportunities',
        execute: async (params: any) => {
          return await this.executeProspectAnalysis(params.prospectData, params.analysisType);
        }
      },
      {
        id: 'generateIndustryInsights',
        description: 'Generate industry-specific insights and market intelligence',
        execute: async (params: any) => {
          return await this.executeIndustryAnalysis(params);
        }
      },
      {
        id: 'createCustomPitch',
        description: 'Create personalized sales pitch with ROI projections',
        execute: async (params: any) => {
          return await this.executePitchCreation(params);
        }
      },
      {
        id: 'validatePitchQuality',
        description: 'Validate pitch quality and relevance',
        execute: async (params: any) => {
          return await this.executePitchValidation(params);
        }
      },
      {
        id: 'generateROIProjection',
        description: 'Generate realistic ROI projections based on business data',
        execute: async (params: any) => {
          return await this.executeROIProjection(params);
        }
      },
      {
        id: 'findRelevantCaseStudies',
        description: 'Find relevant case studies and proof points',
        execute: async (params: any) => {
          return await this.executeCaseStudyLookup(params);
        }
      },
      {
        id: 'analyzeCompetitors',
        description: 'Analyze competitors (2 large/national, 3 local) for competitive positioning',
        execute: async (params: any) => {
          return await this.executeCompetitorAnalysis(params);
        }
      },
      {
        id: 'generateStageAwarePitch',
        description: 'Generate pitch customized for specific pipeline stage (cold, warm, interested, qualified)',
        execute: async (params: any) => {
          return await this.executeStageAwarePitchGeneration(params);
        }
      },
      {
        id: 'createTimeBoxedPitch',
        description: 'Create time-boxed pitch components (30s hook, 60s value prop, 120s close)',
        execute: async (params: any) => {
          return await this.executeTimeBoxedPitchCreation(params);
        }
      },
      {
        id: 'createABTest',
        description: 'Create A/B test for pitch optimization targeting 15%+ response rate',
        execute: async (params: any) => {
          return await this.executeABTestCreation(params);
        }
      },
      {
        id: 'getOptimalVariant',
        description: 'Get optimal pitch variant for prospect based on A/B test results',
        execute: async (params: any) => {
          return await this.executeOptimalVariantSelection(params);
        }
      },
      {
        id: 'analyzeABTestResults',
        description: 'Analyze A/B test results and provide optimization recommendations',
        execute: async (params: any) => {
          return await this.executeABTestAnalysis(params);
        }
      }
    ];
  }

  /**
   * Generate a complete custom pitch for a prospect using Mastra workflow with stage-aware messaging
   */
  async generatePitch(prospectFolder: string, options: any = {}): Promise<{
    success: boolean;
    pitchPath?: string;
    error?: string;
  }> {
    try {
      this.logger.info('Starting enhanced Mastra-powered pitch generation', { prospectFolder, options });

      // Load prospect data
      const prospectData = await this.loadProspectData(prospectFolder);
      if (!prospectData) {
        return { success: false, error: `Prospect not found: ${prospectFolder}` };
      }

      // Determine pipeline stage from prospect data or options
      const pipelineStage = this.determinePipelineStage(prospectData, options);
      
      // Enable time-boxed pitches by default
      const timeBoxed = options.timeBoxed !== false;

      // Create comprehensive pitch generation prompt with stage-aware messaging
      const pitchPrompt = this.buildStageAwarePitchPrompt(prospectData, pipelineStage, {
        ...options,
        timeBoxed
      });
      
      // Execute through Mastra agent with enhanced context
      const result = await this.executeWithData({
        prospectData,
        pipelineStage,
        timeBoxed,
        options,
        operation: 'stage_aware_pitch_generation'
      }, pitchPrompt);

      // Process the result and create the pitch file
      const pitchPath = await this.processPitchResult(result, prospectFolder, prospectData, {
        pipelineStage,
        timeBoxed
      });

      this.logger.info('Enhanced Mastra pitch generation completed', { 
        prospectFolder,
        pipelineStage,
        timeBoxed,
        pitchPath
      });

      return { success: true, pitchPath };

    } catch (error) {
      this.logger.error('Enhanced Mastra pitch generation failed', { 
        prospectFolder,
        error: error.message 
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate pitches for all prospects that need them
   */
  async generateAllPitches(): Promise<{
    success: boolean;
    results: Array<{ prospectFolder: string; success: boolean; error?: string }>;
  }> {
    try {
      this.logger.info('Starting batch pitch generation with Mastra');

      const prospects = await prospectFolderManager.getAllProspects();
      const results = [];

      // Process prospects in batches to avoid overwhelming the system
      const batchSize = 5;
      for (let i = 0; i < prospects.length; i += batchSize) {
        const batch = prospects.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (prospect) => {
          const companyName = prospect.business?.name || (prospect as any).company || 'Unknown Company';
          const folderName = sanitizeProspectName(companyName);
          
          const needsGeneration = await this.needsPitchGeneration(folderName);
          
          if (needsGeneration) {
            return await this.generatePitch(folderName);
          }
          
          return { success: true, prospectFolder: folderName, skipped: true };
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults.map((result, index) => ({
          prospectFolder: batch[index].business?.name || (batch[index] as any).company || 'Unknown',
          success: result.success,
          error: result.error
        })));
      }

      return { success: true, results };

    } catch (error) {
      this.logger.error('Batch pitch generation failed', { error: error.message });
      return { success: false, results: [] };
    }
  }

  /**
   * Execute prospect analysis
   */
  private async executeProspectAnalysis(prospectData: any, analysisType?: string): Promise<any> {
    this.logger.info('Executing prospect analysis', { 
      businessName: prospectData.company || prospectData.businessName,
      analysisType
    });

    const analysis = {
      businessProfile: {},
      digitalPresence: {},
      opportunities: [],
      challenges: [],
      marketPosition: {},
      recommendations: []
    };

    try {
      // Analyze business profile
      analysis.businessProfile = {
        size: prospectData.business_size || 'unknown',
        revenue: prospectData.estimated_revenue || 0,
        employees: prospectData.employee_count || 0,
        industry: prospectData.industry || 'unknown',
        location: prospectData.location || `${prospectData.city || ''}, ${prospectData.state || ''}`
      };

      // Analyze digital presence
      analysis.digitalPresence = {
        hasWebsite: prospectData.has_website || false,
        hasGoogleBusiness: prospectData.has_google_business || false,
        hasSocialMedia: prospectData.has_social_media || false,
        hasOnlineReviews: prospectData.has_online_reviews || false,
        websiteQuality: this.assessWebsiteQuality(prospectData.website),
        overallScore: this.calculateDigitalPresenceScore(prospectData)
      };

      // Identify opportunities
      analysis.opportunities = this.identifyOpportunities(prospectData);
      
      // Identify challenges
      analysis.challenges = this.identifyChallenges(prospectData);

      // Market position analysis
      analysis.marketPosition = await this.analyzeMarketPosition(prospectData);

      // Generate recommendations
      analysis.recommendations = this.generateRecommendations(analysis);

      this.logger.info('Prospect analysis completed', { 
        businessName: prospectData.company || prospectData.businessName,
        opportunitiesFound: analysis.opportunities.length,
        digitalScore: analysis.digitalPresence.overallScore
      });

      return analysis;

    } catch (error) {
      this.logger.error('Prospect analysis failed', { error: error.message });
      return analysis;
    }
  }

  /**
   * Execute industry analysis
   */
  private async executeIndustryAnalysis(params: any): Promise<any> {
    this.logger.info('Executing industry analysis', { 
      industry: params.industry,
      location: params.location
    });

    const insights = {
      industryOverview: {},
      marketTrends: [],
      competitiveLandscape: {},
      opportunities: [],
      bestPractices: [],
      benchmarks: {}
    };

    try {
      // Get industry-specific insights from knowledge base
      const industryData = this.industryKnowledgeBase.get(params.industry) || {};
      
      insights.industryOverview = {
        size: industryData.marketSize || 'Unknown',
        growth: industryData.growthRate || 'Unknown',
        keyPlayers: industryData.keyPlayers || [],
        challenges: industryData.commonChallenges || []
      };

      // Market trends analysis
      insights.marketTrends = this.getMarketTrends(params.industry, params.location);

      // Competitive landscape
      insights.competitiveLandscape = await this.analyzeCompetitiveLandscape(params);

      // Digital marketing opportunities
      insights.opportunities = this.identifyIndustryOpportunities(params);

      // Best practices
      insights.bestPractices = this.getBestPractices(params.industry);

      // Industry benchmarks
      insights.benchmarks = this.getIndustryBenchmarks(params.industry);

      this.logger.info('Industry analysis completed', { 
        industry: params.industry,
        trendsFound: insights.marketTrends.length,
        opportunitiesFound: insights.opportunities.length
      });

      return insights;

    } catch (error) {
      this.logger.error('Industry analysis failed', { error: error.message });
      return insights;
    }
  }

  /**
   * Execute pitch creation
   */
  private async executePitchCreation(params: any): Promise<PitchComponents> {
    this.logger.info('Executing pitch creation', { 
      businessName: params.prospectData.company || params.prospectData.businessName
    });

    try {
      const { prospectData, insights } = params;
      const template = params.template || 'standard';

      // Generate each component of the pitch
      const hook = await this.generateHook(prospectData, insights);
      const valueProposition = await this.generateValueProposition(prospectData, insights);
      const proofPoints = await this.generateProofPoints(prospectData, insights);
      const roiProjection = await this.generateROIProjection(prospectData, insights);
      const callToAction = await this.generateCallToAction(prospectData, insights);

      const pitchComponents: PitchComponents = {
        hook,
        valueProposition,
        proofPoints,
        roiProjection,
        callToAction
      };

      this.logger.info('Pitch creation completed', { 
        businessName: prospectData.company || prospectData.businessName,
        template,
        componentsGenerated: Object.keys(pitchComponents).length
      });

      return pitchComponents;

    } catch (error) {
      this.logger.error('Pitch creation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Execute pitch validation
   */
  private async executePitchValidation(params: any): Promise<any> {
    this.logger.info('Executing pitch validation');

    const validation = {
      qualityScore: 0,
      personalizationScore: 0,
      valuePropositionScore: 0,
      roiRealism: 0,
      callToActionEffectiveness: 0,
      overallGrade: 'F',
      suggestions: [] as string[],
      errors: [] as string[],
      warnings: [] as string[]
    };

    try {
      const { pitchContent, prospectData } = params;

      // Validate personalization
      validation.personalizationScore = this.validatePersonalization(pitchContent, prospectData);

      // Validate value proposition
      validation.valuePropositionScore = this.validateValueProposition(pitchContent, prospectData);

      // Validate ROI realism
      validation.roiRealism = this.validateROIRealism(pitchContent, prospectData);

      // Validate call to action
      validation.callToActionEffectiveness = this.validateCallToAction(pitchContent);

      // Calculate overall quality score
      validation.qualityScore = (
        validation.personalizationScore +
        validation.valuePropositionScore +
        validation.roiRealism +
        validation.callToActionEffectiveness
      ) / 4;

      // Assign letter grade
      validation.overallGrade = this.calculateLetterGrade(validation.qualityScore);

      // Generate suggestions
      validation.suggestions = this.generateImprovementSuggestions(validation, prospectData);

      this.logger.info('Pitch validation completed', { 
        qualityScore: validation.qualityScore,
        grade: validation.overallGrade
      });

      return validation;

    } catch (error) {
      this.logger.error('Pitch validation failed', { error: error.message });
      return validation;
    }
  }

  /**
   * Execute ROI projection
   */
  private async executeROIProjection(params: any): Promise<any> {
    this.logger.info('Executing ROI projection');

    const { prospectData } = params;
    const serviceOffering = params.serviceOffering || 'comprehensive_digital_marketing';
    const timeframe = params.timeframe || 12; // months

    const projection = {
      investment: {
        setup: 0,
        monthly: 0,
        annual: 0
      },
      projectedGains: {
        monthly: 0,
        annual: 0,
        breakdown: {}
      },
      roi: {
        percentage: 0,
        breakEvenMonth: 0,
        paybackPeriod: 0
      },
      confidence: 0.7, // Default confidence level
      assumptions: [] as string[]
    };

    try {
      // Calculate investment based on business size and service offering
      projection.investment = this.calculateInvestment(prospectData, serviceOffering);

      // Project gains based on industry benchmarks
      projection.projectedGains = this.calculateProjectedGains(prospectData, serviceOffering, timeframe);

      // Calculate ROI metrics
      projection.roi = this.calculateROIMetrics(projection.investment, projection.projectedGains);

      // Assess confidence level
      projection.confidence = this.assessProjectionConfidence(prospectData);

      // Document assumptions
      projection.assumptions = this.documentAssumptions(prospectData, serviceOffering);

      this.logger.info('ROI projection completed', { 
        roi: projection.roi.percentage,
        breakEven: projection.roi.breakEvenMonth,
        confidence: projection.confidence
      });

      return projection;

    } catch (error) {
      this.logger.error('ROI projection failed', { error: error.message });
      return projection;
    }
  }

  /**
   * Execute case study lookup
   */
  private async executeCaseStudyLookup(params: any): Promise<any> {
    this.logger.info('Executing case study lookup', { 
      industry: params.industry,
      businessSize: params.businessSize
    });

    const caseStudies = {
      relevant: [],
      similar: [],
      industry: [],
      generalApplicable: []
    };

    try {
      // Find directly relevant case studies
      caseStudies.relevant = this.findRelevantCaseStudies(params);

      // Find similar case studies
      caseStudies.similar = this.findSimilarCaseStudies(params);

      // Find industry-specific case studies
      caseStudies.industry = this.findIndustryCaseStudies(params.industry);

      // Find generally applicable case studies
      caseStudies.generalApplicable = this.findGeneralCaseStudies();

      this.logger.info('Case study lookup completed', { 
        relevant: caseStudies.relevant.length,
        similar: caseStudies.similar.length,
        industry: caseStudies.industry.length
      });

      return caseStudies;

    } catch (error) {
      this.logger.error('Case study lookup failed', { error: error.message });
      return caseStudies;
    }
  }

  /**
   * Build comprehensive pitch generation prompt
   */
  private buildPitchGenerationPrompt(prospectData: ProspectFrontmatter, options: any): string {
    return `Create a comprehensive, personalized sales pitch for the following prospect:

Company: ${prospectData.company}
Industry: ${prospectData.industry}
Location: ${prospectData.location}
Business Size: ${prospectData.business_size}
Estimated Revenue: $${prospectData.estimated_revenue?.toLocaleString()}
Qualification Score: ${prospectData.qualification_score}/100

Digital Presence:
- Website: ${prospectData.has_website ? 'Yes' : 'No'}
- Google Business: ${prospectData.has_google_business ? 'Yes' : 'No'}
- Social Media: ${prospectData.has_social_media ? 'Yes' : 'No'}
- Online Reviews: ${prospectData.has_online_reviews ? 'Yes' : 'No'}

Contact Information:
- Phone: ${prospectData.phone || 'Not available'}
- Email: ${prospectData.email || 'Not available'}
- Website: ${prospectData.website || 'Not available'}

Please execute the following steps using your available tools:

1. Use analyzeProspectData to thoroughly analyze the business profile and identify opportunities
2. Use generateIndustryInsights to gather industry-specific intelligence and market trends
3. Use findRelevantCaseStudies to identify relevant proof points and success stories
4. Use generateROIProjection to create realistic financial projections
5. Use createCustomPitch to generate all pitch components (hook, value proposition, proof points, ROI, call-to-action)
6. Use validatePitchQuality to ensure the pitch meets quality standards

Requirements:
- Highly personalized to this specific business
- Address identified digital marketing gaps
- Include realistic ROI projections with clear assumptions
- Provide compelling proof points from similar businesses
- Create an appropriate call-to-action based on qualification score
- Ensure professional tone and clear value proposition

Focus on digital marketing services that would most benefit this specific business based on their current digital presence gaps and industry characteristics.`;
  }

  /**
   * Process pitch result and create file
   */
  private async processPitchResult(result: any, prospectFolder: string, prospectData: ProspectFrontmatter): Promise<string> {
    // Extract pitch components from Mastra result
    // This would need to be adapted based on actual Mastra response format
    
    const pitchComponents: PitchComponents = {
      hook: "Generated hook",
      valueProposition: "Generated value proposition", 
      proofPoints: "Generated proof points",
      roiProjection: "Generated ROI projection",
      callToAction: "Generated call to action"
    };

    // Format the complete pitch content
    const pitchContent = await this.formatPitchContent(prospectData, pitchComponents);

    // Write to file
    const pitchPath = await this.writePitchFile(prospectFolder, pitchContent);

    return pitchPath;
  }

  /**
   * Get agent instructions for pitch creation
   */
  private static getInstructions(): string {
    return `You are an expert sales pitch creator specializing in digital marketing services for small to medium businesses.

Your expertise includes:
1. Analyzing prospect business profiles and identifying digital marketing gaps
2. Creating compelling, personalized sales pitches with industry-specific insights  
3. Calculating realistic ROI projections based on business size and industry benchmarks
4. Tailoring messaging to specific decision-maker personas and pain points
5. Finding relevant case studies and proof points from similar businesses

Pitch quality standards:
- Highly personalized to specific business and industry
- Data-driven ROI projections with clear assumptions
- Clear value propositions addressing identified gaps
- Professional tone with compelling call-to-action
- Include relevant proof points and case studies
- Address specific pain points and opportunities

When creating pitches:
- Always use available tools to gather comprehensive data
- Focus on the prospect's specific digital marketing gaps
- Provide realistic financial projections
- Include industry-specific insights and trends
- Reference relevant case studies and success stories
- Maintain a consultative, professional tone
- Create clear, actionable next steps

Your goal is to create pitches that resonate with the prospect's specific situation and demonstrate clear value from digital marketing services.`;
  }

  /**
   * Initialize stage-aware messaging templates
   */
  private initializeStageTemplates(): StageAwareMessages {
    return {
      cold: {
        hook: "Hi {contact}, I noticed {company} has impressive {strength}, but I spotted an opportunity that could increase your revenue by 25-40% through better digital marketing.",
        approach: "research-based, value-focused, non-pushy",
        callToAction: "I'd like to send you a free 5-minute digital marketing analysis for {company}. Should I send it to this email?"
      },
      warm: {
        hook: "Hi {contact}, following up on our previous conversation about {company}'s digital marketing potential.",
        approach: "relationship-building, consultative, solution-oriented", 
        callToAction: "I'd like to schedule a 15-minute call to show you exactly how we can achieve those results we discussed. When works better for you - Tuesday or Wednesday?"
      },
      interested: {
        hook: "Hi {contact}, I have the specific ROI projections and implementation plan ready for {company}.",
        approach: "solution-focused, detailed, confidence-building",
        callToAction: "I can present the full strategy in a 30-minute meeting. I have Tuesday at 2pm or Friday at 10am available - which works better?"
      },
      qualified: {
        hook: "Hi {contact}, based on our discussions, I've prepared a detailed proposal that shows how {company} can achieve ${roi} in additional revenue.",
        approach: "partnership-focused, results-oriented, implementation-ready",
        callToAction: "Let's schedule a 45-minute meeting to finalize the strategy and discuss next steps. I can do this Thursday or Friday - what's your preference?"
      }
    };
  }

  /**
   * Initialize competitor database with industry data
   */
  private async initializeCompetitorDatabase(): Promise<void> {
    // Restaurant industry competitors
    this.competitorDatabase.set('restaurants', {
      large: [
        {
          name: 'McDonald\'s',
          marketShare: 20.4,
          strengths: ['Brand recognition', 'Marketing budget', 'Technology integration'],
          weaknesses: ['Generic messaging', 'Limited local focus', 'Corporate constraints']
        },
        {
          name: 'Starbucks', 
          marketShare: 15.2,
          strengths: ['Digital loyalty program', 'Mobile ordering', 'Social media presence'],
          weaknesses: ['Premium pricing', 'Limited local customization', 'Corporate branding']
        }
      ],
      national: [
        {
          name: 'Chipotle',
          marketShare: 3.8,
          strengths: ['Digital ordering', 'Health positioning', 'Mobile app'],
          weaknesses: ['Limited menu customization', 'Generic local marketing', 'Corporate messaging']
        }
      ],
      local: [
        {
          name: 'Local Bistro Chain',
          location: 'Denver Metro',
          strengths: ['Local knowledge', 'Community connections', 'Personal service'],
          weaknesses: ['Limited digital presence', 'Inconsistent messaging', 'Small marketing budget']
        },
        {
          name: 'Family Restaurant Group',
          location: 'Colorado Springs',
          strengths: ['Established customer base', 'Local reputation', 'Multiple locations'],
          weaknesses: ['Outdated website', 'Poor social media', 'No online ordering']
        },
        {
          name: 'Independent Café Network',
          location: 'Boulder County', 
          strengths: ['Unique atmosphere', 'Local sourcing', 'Community events'],
          weaknesses: ['No digital marketing', 'Limited online presence', 'Inconsistent branding']
        }
      ]
    });

    // Add more industries as needed
    this.competitorDatabase.set('retail', {
      large: [
        { name: 'Amazon', marketShare: 38.7, strengths: ['E-commerce dominance', 'AI personalization', 'Logistics'], weaknesses: ['Generic experience', 'No local connection', 'Price focus'] },
        { name: 'Walmart', marketShare: 6.3, strengths: ['Price leadership', 'Omnichannel', 'Local presence'], weaknesses: ['Limited personalization', 'Generic messaging', 'Corporate constraints'] }
      ],
      national: [
        { name: 'Target', marketShare: 4.4, strengths: ['Brand positioning', 'Digital integration', 'Customer experience'], weaknesses: ['Limited local customization', 'Corporate messaging', 'Generic approach'] }
      ],
      local: [
        { name: 'Local Retail Chain', location: 'Regional', strengths: ['Local knowledge', 'Personal service', 'Community connection'], weaknesses: ['Limited digital presence', 'Small marketing budget', 'Inconsistent online experience'] }
      ]
    });
  }

  /**
   * Determine pipeline stage from prospect data
   */
  private determinePipelineStage(prospectData: ProspectFrontmatter, options: any): PipelineStage {
    // Check if stage is explicitly provided in options
    if (options.pipelineStage && ['cold', 'warm', 'interested', 'qualified'].includes(options.pipelineStage)) {
      return options.pipelineStage as PipelineStage;
    }

    // Determine stage from prospect data
    if (prospectData.pipeline_stage) {
      return prospectData.pipeline_stage as PipelineStage;
    }

    // Infer stage from qualification score
    const score = prospectData.qualification_score || 0;
    if (score >= 80) return 'qualified';
    if (score >= 60) return 'interested'; 
    if (score >= 40) return 'warm';
    return 'cold';
  }

  /**
   * Build stage-aware pitch generation prompt
   */
  private buildStageAwarePitchPrompt(prospectData: ProspectFrontmatter, pipelineStage: PipelineStage, options: any): string {
    const stageTemplate = this.stageAwareTemplates[pipelineStage];
    
    return `Create a comprehensive, stage-aware sales pitch for the following prospect:

Company: ${prospectData.company}
Industry: ${prospectData.industry}
Location: ${prospectData.location}
Business Size: ${prospectData.business_size}
Estimated Revenue: $${prospectData.estimated_revenue?.toLocaleString()}
Qualification Score: ${prospectData.qualification_score}/100
Pipeline Stage: ${pipelineStage}

Contact Information:
- Primary Contact: ${prospectData.primary_contact || 'Not specified'}
- Phone: ${prospectData.phone || 'Not available'}
- Email: ${prospectData.email || 'Not available'}
- Website: ${prospectData.website || 'Not available'}

Digital Presence Analysis:
- Website: ${prospectData.has_website ? 'Yes' : 'No'}
- Google Business: ${prospectData.has_google_business ? 'Yes' : 'No'}
- Social Media: ${prospectData.has_social_media ? 'Yes' : 'No'}
- Online Reviews: ${prospectData.has_online_reviews ? 'Yes' : 'No'}

STAGE-AWARE MESSAGING REQUIREMENTS:
Pipeline Stage: ${pipelineStage.toUpperCase()}
- Hook Template: "${stageTemplate.hook}"
- Approach: ${stageTemplate.approach}
- Call-to-Action Template: "${stageTemplate.callToAction}"

${options.timeBoxed ? `
TIME-BOXED PITCH STRUCTURE:
- Hook: Maximum ${this.pitchTiming.hook} seconds (30 words max)
- Value Proposition: Maximum ${this.pitchTiming.valueProposition} seconds (60 words max)  
- Close/CTA: Maximum ${this.pitchTiming.close} seconds (120 words max)
` : ''}

Please execute the following steps using your available tools:

1. Use analyzeProspectData with analysisType="competitor_analysis" to identify competitive positioning opportunities
2. Use analyzeCompetitors to get specific competitor insights (2 large/national, 3 local competitors)
3. Use generateIndustryInsights to gather market intelligence and trends
4. Use findRelevantCaseStudies to identify proof points from similar businesses
5. Use generateROIProjection to create realistic financial projections
6. ${options.timeBoxed ? 'Use createTimeBoxedPitch' : 'Use createCustomPitch'} to generate all pitch components
7. Use generateStageAwarePitch to customize messaging for ${pipelineStage} stage
8. Use validatePitchQuality to ensure the pitch meets quality standards

REQUIREMENTS:
- Customize messaging specifically for ${pipelineStage} pipeline stage
- Address competitive advantages vs 2 large/national and 3 local competitors
- Include industry-specific insights and market positioning
- Provide realistic ROI projections with clear assumptions
${options.timeBoxed ? '- Adhere to time-boxed structure (30s/60s/120s components)' : ''}
- Create appropriate call-to-action for ${pipelineStage} stage
- Focus on digital marketing gaps and opportunities
- Use professional, consultative tone

Target 15%+ positive response rate through personalized, stage-appropriate messaging.`;
  }

  /**
   * Execute competitor analysis
   */
  private async executeCompetitorAnalysis(params: any): Promise<CompetitorAnalysis> {
    this.logger.info('Executing competitor analysis', { 
      industry: params.industry,
      location: params.location
    });

    const { industry, location } = params;
    
    // Get base competitor data for industry
    let competitorData = this.competitorDatabase.get(industry.toLowerCase());
    
    if (!competitorData) {
      // Create generic competitor structure if industry not found
      competitorData = {
        large: [
          { name: 'Major National Player 1', marketShare: 25, strengths: ['Brand recognition', 'Marketing budget'], weaknesses: ['Generic messaging', 'Limited local focus'] },
          { name: 'Major National Player 2', marketShare: 18, strengths: ['Technology', 'Scale'], weaknesses: ['Corporate constraints', 'One-size-fits-all'] }
        ],
        national: [
          { name: 'Regional Chain', marketShare: 8, strengths: ['Regional presence', 'Standardized operations'], weaknesses: ['Limited customization', 'Corporate messaging'] }
        ],
        local: [
          { name: 'Local Competitor 1', location: location || 'Local area', strengths: ['Local knowledge', 'Personal service'], weaknesses: ['Limited digital presence', 'Small marketing budget'] },
          { name: 'Local Competitor 2', location: location || 'Local area', strengths: ['Community connections', 'Established base'], weaknesses: ['Outdated marketing', 'Poor online presence'] },
          { name: 'Local Competitor 3', location: location || 'Local area', strengths: ['Niche positioning', 'Local reputation'], weaknesses: ['Inconsistent branding', 'Limited reach'] }
        ]
      };
    }

    // Enhance with location-specific insights
    if (location && location.toLowerCase().includes('denver')) {
      competitorData.local = competitorData.local.map(comp => ({
        ...comp,
        location: comp.location.includes('Denver') ? comp.location : `${location} area`
      }));
    }

    this.logger.info('Competitor analysis completed', {
      industry,
      large: competitorData.large.length,
      national: competitorData.national.length, 
      local: competitorData.local.length
    });

    return competitorData;
  }

  /**
   * Execute stage-aware pitch generation
   */
  private async executeStageAwarePitchGeneration(params: any): Promise<any> {
    this.logger.info('Executing stage-aware pitch generation', { 
      stage: params.pipelineStage,
      businessName: params.prospectData.company
    });

    const { prospectData, pipelineStage } = params;
    const template = this.stageAwareTemplates[pipelineStage];
    
    if (!template) {
      throw new Error(`Invalid pipeline stage: ${pipelineStage}`);
    }

    // Customize template with prospect data
    const customizedHook = template.hook
      .replace('{contact}', prospectData.primary_contact || 'there')
      .replace('{company}', prospectData.company)
      .replace('{strength}', this.identifyBusinessStrength(prospectData))
      .replace('{roi}', this.calculateQuickROI(prospectData));

    const customizedCTA = template.callToAction
      .replace('{contact}', prospectData.primary_contact || 'there') 
      .replace('{company}', prospectData.company);

    const stageAwarePitch = {
      stage: pipelineStage,
      hook: customizedHook,
      approach: template.approach,
      callToAction: customizedCTA,
      toneMods: this.getStageToneModifications(pipelineStage),
      urgency: this.getStageUrgency(pipelineStage),
      trustBuilding: this.getStageTrustElements(pipelineStage)
    };

    this.logger.info('Stage-aware pitch generation completed', { 
      stage: pipelineStage,
      approach: template.approach
    });

    return stageAwarePitch;
  }

  /**
   * Execute time-boxed pitch creation
   */
  private async executeTimeBoxedPitchCreation(params: any): Promise<any> {
    this.logger.info('Executing time-boxed pitch creation');

    const { prospectData, insights } = params;
    
    // Generate time-constrained components
    const hook = await this.generateTimeBoxedHook(prospectData, insights);
    const valueProposition = await this.generateTimeBoxedValueProp(prospectData, insights);
    const close = await this.generateTimeBoxedClose(prospectData, insights);

    const timeBoxedPitch = {
      timing: this.pitchTiming,
      components: {
        hook: {
          content: hook,
          targetTime: this.pitchTiming.hook,
          wordCount: hook.split(' ').length
        },
        valueProposition: {
          content: valueProposition, 
          targetTime: this.pitchTiming.valueProposition,
          wordCount: valueProposition.split(' ').length
        },
        close: {
          content: close,
          targetTime: this.pitchTiming.close,
          wordCount: close.split(' ').length
        }
      },
      totalEstimatedTime: this.pitchTiming.hook + this.pitchTiming.valueProposition + this.pitchTiming.close
    };

    this.logger.info('Time-boxed pitch creation completed', { 
      totalTime: timeBoxedPitch.totalEstimatedTime,
      components: Object.keys(timeBoxedPitch.components).length
    });

    return timeBoxedPitch;
  }

  /**
   * Execute A/B test creation
   */
  private async executeABTestCreation(params: any): Promise<any> {
    this.logger.info('Creating A/B test for pitch optimization');

    const { testType, customConfig } = params;
    
    let testConfig;
    
    // Use predefined test configurations or custom
    switch (testType) {
      case 'stage_awareness':
        testConfig = PitchABTestingFramework.createStageAwarenessTest();
        break;
      case 'time_boxing':
        testConfig = PitchABTestingFramework.createTimeBoxingTest();
        break;
      case 'competitor_focus':
        testConfig = PitchABTestingFramework.createCompetitorFocusTest();
        break;
      default:
        testConfig = customConfig;
    }

    if (!testConfig) {
      throw new Error(`Invalid test type: ${testType}`);
    }

    const testId = await this.abTestingFramework.createTest(testConfig);
    
    this.logger.info('A/B test created', { 
      testId,
      testName: testConfig.testName,
      variants: testConfig.variants.length
    });

    return {
      testId,
      testName: testConfig.testName,
      description: testConfig.description,
      variants: testConfig.variants.map(v => ({
        id: v.id,
        name: v.name,
        description: v.description,
        weight: v.weightPercentage
      })),
      targetSampleSize: testConfig.targetSampleSize,
      targetResponseRate: testConfig.targetResponseRate,
      duration: testConfig.duration,
      status: 'created'
    };
  }

  /**
   * Execute optimal variant selection for prospect
   */
  private async executeOptimalVariantSelection(params: any): Promise<any> {
    this.logger.info('Selecting optimal pitch variant for prospect');

    const { testId, prospectId, prospectData } = params;
    
    try {
      // Get variant assignment for this prospect
      const variantId = await this.abTestingFramework.getVariantForProspect(testId, prospectId);
      
      // Get test details to understand variant configuration
      const testStatus = await this.abTestingFramework.getTestStatus(testId);
      const variant = testStatus.test.variants.find(v => v.id === variantId);
      
      if (!variant) {
        throw new Error(`Variant ${variantId} not found in test ${testId}`);
      }

      this.logger.info('Optimal variant selected', {
        testId,
        prospectId,
        variantId,
        variantName: variant.name
      });

      return {
        variantId,
        variantName: variant.name,
        variantDescription: variant.description,
        template: variant.template,
        modifications: variant.modifications,
        testConfiguration: {
          testId,
          testName: testStatus.test.testName,
          currentMetrics: testStatus.currentMetrics[variantId] || this.initializeABMetrics()
        }
      };

    } catch (error) {
      this.logger.error('Failed to select optimal variant', { error: error.message });
      
      // Fallback to default variant
      return {
        variantId: 'default',
        variantName: 'Default Pitch',
        variantDescription: 'Standard stage-aware pitch',
        template: 'stage_aware',
        modifications: {
          hookStyle: 'research_based',
          valueProposition: 'problem_solution', 
          callToAction: 'consultation_style',
          personalisation: 'high',
          tone: 'professional'
        }
      };
    }
  }

  /**
   * Execute A/B test analysis
   */
  private async executeABTestAnalysis(params: any): Promise<any> {
    this.logger.info('Analyzing A/B test results');

    const { testId } = params;
    
    try {
      const results = await this.abTestingFramework.analyzeTest(testId);
      const testStatus = await this.abTestingFramework.getTestStatus(testId);

      this.logger.info('A/B test analysis completed', {
        testId,
        winner: results.winner,
        confidence: results.confidence
      });

      return {
        testId,
        testName: testStatus.test.testName,
        analysis: results,
        summary: {
          winner: results.winner ? 
            testStatus.test.variants.find(v => v.id === results.winner)?.name : 
            'No clear winner',
          winningResponseRate: results.winner ? 
            (results.variants[results.winner]?.metrics.positiveResponseRate * 100).toFixed(1) + '%' :
            'N/A',
          confidence: (results.confidence * 100).toFixed(1) + '%',
          targetAchieved: results.winner ? 
            results.variants[results.winner]?.metrics.positiveResponseRate >= 0.15 :
            false,
          samplesProcessed: Object.values(testStatus.currentMetrics)
            .reduce((sum, metrics) => sum + metrics.sent, 0)
        },
        recommendations: results.recommendations,
        insights: results.insights,
        nextActions: results.nextActions
      };

    } catch (error) {
      this.logger.error('A/B test analysis failed', { error: error.message });
      return {
        testId,
        error: error.message,
        recommendations: [
          'Ensure sufficient sample size before analysis',
          'Check that test has been running for adequate time',
          'Verify test data integrity'
        ]
      };
    }
  }

  /**
   * Generate pitch with A/B testing integration
   */
  async generateOptimizedPitch(prospectFolder: string, options: any = {}): Promise<{
    success: boolean;
    pitchPath?: string;
    variantUsed?: string;
    testId?: string;
    error?: string;
  }> {
    try {
      this.logger.info('Starting optimized pitch generation with A/B testing', { prospectFolder, options });

      // Load prospect data
      const prospectData = await this.loadProspectData(prospectFolder);
      if (!prospectData) {
        return { success: false, error: `Prospect not found: ${prospectFolder}` };
      }

      let variantConfig = null;
      let testId = null;

      // If A/B testing is enabled and testId provided
      if (options.abTest && options.testId) {
        testId = options.testId;
        try {
          variantConfig = await this.executeOptimalVariantSelection({
            testId,
            prospectId: prospectFolder,
            prospectData
          });
        } catch (error) {
          this.logger.warn('A/B test variant selection failed, using default', { error: error.message });
        }
      }

      // Determine pitch configuration
      const pipelineStage = this.determinePipelineStage(prospectData, variantConfig?.modifications || options);
      const timeBoxed = variantConfig?.template === 'time_boxed' || options.timeBoxed;
      
      // Apply variant modifications if available
      const pitchOptions = {
        ...options,
        ...(variantConfig?.modifications || {}),
        pipelineStage,
        timeBoxed,
        variantId: variantConfig?.variantId
      };

      // Generate the pitch
      const result = await this.generatePitch(prospectFolder, pitchOptions);

      // Record A/B test metrics if applicable
      if (testId && variantConfig && result.success) {
        try {
          await this.abTestingFramework.recordPitchSent(
            testId,
            variantConfig.variantId,
            prospectFolder,
            `pitch_${Date.now()}_${prospectFolder}`
          );
        } catch (error) {
          this.logger.warn('Failed to record A/B test metrics', { error: error.message });
        }
      }

      return {
        success: result.success,
        pitchPath: result.pitchPath,
        variantUsed: variantConfig?.variantName,
        testId,
        error: result.error
      };

    } catch (error) {
      this.logger.error('Optimized pitch generation failed', { 
        prospectFolder,
        error: error.message 
      });
      return { success: false, error: error.message };
    }
  }

  // Helper method for A/B testing metrics
  private initializeABMetrics(): any {
    return {
      sent: 0,
      opened: 0,
      replied: 0,
      positiveReplies: 0,
      meetings: 0,
      conversionRate: 0,
      responseRate: 0,
      positiveResponseRate: 0,
      meetingConversionRate: 0,
      averageResponseTime: 0,
      qualityScore: 0
    };
  }

  // Helper methods and implementations
  private async initializeKnowledgeBases(): Promise<void> {
    // Initialize industry knowledge base
    this.industryKnowledgeBase.set('restaurants', {
      marketSize: '$899B',
      growthRate: '3.2%',
      keyPlayers: ['McDonald\'s', 'Starbucks', 'Subway'],
      commonChallenges: ['Online ordering', 'Review management', 'Social media presence']
    });

    // Initialize case study database
    this.caseStudyDatabase.set('restaurants_small', {
      businessName: 'Local Bistro',
      industry: 'restaurants',
      size: 'small',
      results: {
        revenueIncrease: '45%',
        customerAcquisition: '300%',
        timeframe: '6 months'
      }
    });
  }

  private async loadProspectData(prospectFolder: string): Promise<ProspectFrontmatter | null> {
    try {
      const indexPath = join(
        this.obsidianVaultPath,
        'Projects/Sales/Prospects',
        prospectFolder,
        'index.md'
      );

      const content = await readFile(indexPath, 'utf8');
      const { frontmatter } = parseFrontmatter(content);

      return frontmatter as ProspectFrontmatter;
    } catch (error) {
      this.logger.error(`Error loading prospect data for ${prospectFolder}:`, error);
      return null;
    }
  }

  private async needsPitchGeneration(prospectFolder: string): Promise<boolean> {
    try {
      const pitchPath = join(
        this.obsidianVaultPath,
        'Projects/Sales/Prospects', 
        prospectFolder,
        'pitch.md'
      );

      const content = await readFile(pitchPath, 'utf8');
      return content.includes('To be generated') || content.includes('This file will be populated');
    } catch (error) {
      return true; // File doesn't exist, needs generation
    }
  }

  private async formatPitchContent(prospect: ProspectFrontmatter, components: PitchComponents): Promise<string> {
    const now = new Date().toISOString();
    
    return `---
type: prospect-pitch
company: "${prospect.company}"
industry: ${prospect.industry}
created: "${now}"
updated: "${now}"
status: generated
pitch_version: 1.0
qualification_score: ${prospect.qualification_score}
tags: [sales, pitch, ${prospect.industry}, ai-generated, mastra-agent]
---

# Custom Pitch - ${prospect.company}

> **AI-Generated Sales Pitch (Mastra-Enhanced)**
> 
> This pitch has been customized using Mastra AI agents based on the prospect's business profile, digital presence analysis, and industry best practices.

## 🎯 Opening Hook

${components.hook}

## 💎 Value Proposition

${components.valueProposition}

## 📊 Proof Points & Case Studies

${components.proofPoints}

## 💰 ROI Projection

${components.roiProjection}

## 🚀 Next Steps

${components.callToAction}

---

## 📋 Pitch Customization Notes

**Based on Mastra Agent Analysis:**
- **Qualification Score**: ${prospect.qualification_score}/100
- **Business Size**: ${prospect.business_size}
- **Estimated Revenue**: $${prospect.estimated_revenue?.toLocaleString()}
- **Pipeline Stage**: ${prospect.pipeline_stage}

**Digital Presence Analysis:**
${!prospect.has_social_media ? '- No social media presence\n' : ''}${!prospect.has_website ? '- Missing professional website\n' : ''}${!prospect.has_google_business ? '- Google Business not optimized\n' : ''}${!prospect.has_online_reviews ? '- Limited online review management\n' : ''}

**AI Agent Recommendations:**
- Industry-specific digital marketing strategy
- Local market penetration improvement  
- Customer acquisition cost optimization
- Revenue stream diversification

---

*This pitch was generated by the MHM Mastra Pitch Creator Agent*
*Prospect data source: [[index|Prospect Profile]]*
*Last updated: ${now}*`;
  }

  private async writePitchFile(prospectFolder: string, content: string): Promise<string> {
    const pitchPath = join(
      this.obsidianVaultPath,
      'Projects/Sales/Prospects',
      prospectFolder, 
      'pitch.md'
    );

    await writeFile(pitchPath, content, 'utf8');
    return pitchPath;
  }

  // Additional helper methods would be implemented here...
  private assessWebsiteQuality(website: string): string {
    return website ? 'basic' : 'none';
  }

  private calculateDigitalPresenceScore(prospectData: any): number {
    let score = 0;
    if (prospectData.has_website) score += 25;
    if (prospectData.has_google_business) score += 25;
    if (prospectData.has_social_media) score += 25;
    if (prospectData.has_online_reviews) score += 25;
    return score;
  }

  private identifyOpportunities(prospectData: any): string[] {
    const opportunities = [];
    if (!prospectData.has_social_media) opportunities.push('Social media marketing');
    if (!prospectData.has_website) opportunities.push('Professional website development');
    if (!prospectData.has_google_business) opportunities.push('Google Business optimization');
    return opportunities;
  }

  private identifyChallenges(prospectData: any): string[] {
    return ['Limited online visibility', 'Competitive market', 'Digital marketing gaps'];
  }

  private async analyzeMarketPosition(prospectData: any): Promise<any> {
    return {
      competitiveStrength: 'moderate',
      marketShare: 'local',
      growthPotential: 'high'
    };
  }

  private generateRecommendations(analysis: any): string[] {
    return [
      'Implement comprehensive digital marketing strategy',
      'Optimize Google Business profile',
      'Develop social media presence'
    ];
  }

  private getMarketTrends(industry: string, location: string): string[] {
    return ['Digital transformation', 'Online ordering growth', 'Review importance'];
  }

  private async analyzeCompetitiveLandscape(params: any): Promise<any> {
    return {
      competitorCount: 'moderate',
      digitalMaturity: 'mixed',
      opportunities: ['Better online presence', 'Improved customer engagement']
    };
  }

  private identifyIndustryOpportunities(params: any): string[] {
    return ['Local SEO optimization', 'Social media marketing', 'Online reputation management'];
  }

  private getBestPractices(industry: string): string[] {
    return ['Consistent online presence', 'Customer review management', 'Local SEO optimization'];
  }

  private getIndustryBenchmarks(industry: string): any {
    return {
      averageDigitalSpend: '$2,500/month',
      typicalROI: '250%',
      customerAcquisitionCost: '$45'
    };
  }

  private async generateHook(prospectData: any, insights: any): Promise<string> {
    return `Hi ${prospectData.primary_contact || 'there'}, I noticed ${prospectData.company} has a solid local presence, but you're missing out on significant digital marketing opportunities that could increase your revenue by 25-40%.`;
  }

  private async generateValueProposition(prospectData: any, insights: any): Promise<string> {
    return `I'll help ${prospectData.company} leverage digital marketing to capture more customers, increase revenue, and compete more effectively in your local market through targeted strategies that address your specific industry challenges.`;
  }

  private async generateProofPoints(prospectData: any, insights: any): Promise<string> {
    return `Similar ${prospectData.industry} businesses have seen 40-70% increases in qualified leads and 25-35% revenue growth within 6 months of implementing comprehensive digital marketing strategies.`;
  }

  private async generateROIProjection(prospectData: any, insights: any): Promise<string> {
    const investment = 12000; // Annual investment
    const revenue = prospectData.estimated_revenue || 500000;
    const increase = revenue * 0.25; // 25% increase
    const roi = ((increase - investment) / investment * 100).toFixed(0);
    
    return `**Investment**: $12,000 annually\n**Projected Revenue Increase**: $${increase.toLocaleString()}\n**ROI**: ${roi}% return on investment`;
  }

  private async generateCallToAction(prospectData: any, insights: any): Promise<string> {
    return `I'd like to schedule a 15-minute call to show you exactly how this would work for ${prospectData.company}. When would be a good time for a brief conversation this week?`;
  }

  // Validation helper methods
  private validatePersonalization(pitchContent: string, prospectData: any): number {
    const businessName = prospectData.company || prospectData.businessName;
    return pitchContent.includes(businessName) ? 0.8 : 0.3;
  }

  private validateValueProposition(pitchContent: string, prospectData: any): number {
    return 0.7; // Simplified scoring
  }

  private validateROIRealism(pitchContent: string, prospectData: any): number {
    return 0.8; // Simplified scoring
  }

  private validateCallToAction(pitchContent: string): number {
    return pitchContent.includes('call') || pitchContent.includes('meeting') ? 0.8 : 0.4;
  }

  private calculateLetterGrade(score: number): string {
    if (score >= 0.9) return 'A';
    if (score >= 0.8) return 'B';
    if (score >= 0.7) return 'C'; 
    if (score >= 0.6) return 'D';
    return 'F';
  }

  private generateImprovementSuggestions(validation: any, prospectData: any): string[] {
    const suggestions = [];
    if (validation.personalizationScore < 0.7) {
      suggestions.push('Include more specific business details and industry insights');
    }
    if (validation.valuePropositionScore < 0.7) {
      suggestions.push('Strengthen the value proposition with more specific benefits');
    }
    return suggestions;
  }

  // ROI calculation helper methods
  private calculateInvestment(prospectData: any, serviceOffering: string): any {
    const baseInvestment = { setup: 2500, monthly: 1000, annual: 12000 };
    // Adjust based on business size
    return baseInvestment;
  }

  private calculateProjectedGains(prospectData: any, serviceOffering: string, timeframe: number): any {
    const revenue = prospectData.estimated_revenue || 500000;
    const increasePercent = 0.25; // 25% increase
    const annual = revenue * increasePercent;
    
    return {
      monthly: annual / 12,
      annual,
      breakdown: {
        newCustomers: annual * 0.6,
        customerRetention: annual * 0.4
      }
    };
  }

  private calculateROIMetrics(investment: any, gains: any): any {
    const roi = ((gains.annual - investment.annual) / investment.annual) * 100;
    const breakEvenMonth = Math.ceil(investment.setup / (gains.monthly - investment.monthly));
    
    return {
      percentage: roi,
      breakEvenMonth,
      paybackPeriod: breakEvenMonth
    };
  }

  private assessProjectionConfidence(prospectData: any): number {
    let confidence = 0.5; // Base confidence
    if (prospectData.estimated_revenue > 200000) confidence += 0.1;
    if (prospectData.has_website) confidence += 0.1;
    if (prospectData.qualification_score > 70) confidence += 0.2;
    return Math.min(confidence, 0.9);
  }

  private documentAssumptions(prospectData: any, serviceOffering: string): string[] {
    return [
      '25% revenue increase based on industry benchmarks',
      'Business maintains current operations',
      'Market conditions remain stable',
      'Digital marketing strategies are implemented consistently'
    ];
  }

  // Case study helper methods
  private findRelevantCaseStudies(params: any): any[] {
    // Implementation for finding relevant case studies
    return [];
  }

  private findSimilarCaseStudies(params: any): any[] {
    // Implementation for finding similar case studies
    return [];
  }

  private findIndustryCaseStudies(industry: string): any[] {
    // Implementation for finding industry case studies
    return [];
  }

  private findGeneralCaseStudies(): any[] {
    // Implementation for finding general case studies
    return [];
  }

  // New helper methods for stage-aware and time-boxed pitches
  private identifyBusinessStrength(prospectData: any): string {
    if (prospectData.has_website && prospectData.has_google_business) {
      return 'established online presence';
    }
    if (prospectData.estimated_revenue > 500000) {
      return 'strong revenue foundation';
    }
    if (prospectData.qualification_score > 70) {
      return 'business growth potential';
    }
    return 'local market position';
  }

  private calculateQuickROI(prospectData: any): string {
    const revenue = prospectData.estimated_revenue || 300000;
    const increase = Math.round(revenue * 0.25);
    return `$${increase.toLocaleString()}`;
  }

  private getStageToneModifications(stage: PipelineStage): any {
    const toneMods = {
      cold: { formality: 'professional', assertiveness: 'low', personalization: 'medium' },
      warm: { formality: 'conversational', assertiveness: 'medium', personalization: 'high' },
      interested: { formality: 'consultative', assertiveness: 'high', personalization: 'high' },
      qualified: { formality: 'partnership', assertiveness: 'confident', personalization: 'maximum' }
    };
    return toneMods[stage];
  }

  private getStageUrgency(stage: PipelineStage): string {
    const urgency = {
      cold: 'none',
      warm: 'subtle',
      interested: 'moderate',
      qualified: 'appropriate'
    };
    return urgency[stage];
  }

  private getStageTrustElements(stage: PipelineStage): string[] {
    const trustElements = {
      cold: ['industry expertise', 'no-obligation analysis', 'proven track record'],
      warm: ['previous conversation reference', 'specific insights', 'relevant case studies'],
      interested: ['detailed projections', 'implementation timeline', 'risk mitigation'],
      qualified: ['partnership approach', 'success guarantees', 'ongoing support']
    };
    return trustElements[stage];
  }

  private async generateTimeBoxedHook(prospectData: any, insights: any): Promise<string> {
    // 30 words max for 30-second delivery
    const company = prospectData.company;
    const opportunity = this.identifyTopOpportunity(prospectData);
    const impact = this.calculateQuickROI(prospectData);
    
    return `Hi, I noticed ${company} could increase revenue by ${impact} through better digital marketing. ${opportunity} represents your biggest opportunity.`;
  }

  private async generateTimeBoxedValueProp(prospectData: any, insights: any): Promise<string> {
    // 60 words max for 60-second delivery
    const company = prospectData.company;
    const industry = prospectData.industry;
    const gaps = this.identifyDigitalGaps(prospectData);
    const roi = this.calculateQuickROI(prospectData);
    
    return `I help ${industry} businesses like ${company} generate ${roi} in additional revenue through targeted digital marketing. ${gaps} Your competitors are missing these opportunities, which means you can capture their market share while they're still figuring it out.`;
  }

  private async generateTimeBoxedClose(prospectData: any, insights: any): Promise<string> {
    // 120 words max for 2-minute delivery
    const company = prospectData.company;
    const contact = prospectData.primary_contact || 'there';
    const stage = this.determinePipelineStage(prospectData, {});
    
    let close = `${contact}, here's what I recommend: Let me create a custom digital marketing strategy for ${company} that shows exactly how to capture this ${this.calculateQuickROI(prospectData)} opportunity. `;
    
    if (stage === 'cold') {
      close += `I'll send you a free 5-minute analysis of your current digital presence and the three biggest opportunities I see. No obligation, just valuable insights you can use immediately. Should I send that to this email address?`;
    } else if (stage === 'qualified') {
      close += `I can present the complete implementation plan and ROI projections in a 30-minute meeting this week. I have Tuesday at 2pm or Friday at 10am available. Which works better for your schedule?`;
    } else {
      close += `I'd like to schedule a brief 15-minute call to show you the specific opportunities and how we can implement them. When would be a good time this week for a quick conversation?`;
    }
    
    return close;
  }

  private identifyTopOpportunity(prospectData: any): string {
    if (!prospectData.has_google_business) return 'Local SEO optimization';
    if (!prospectData.has_social_media) return 'Social media marketing';
    if (!prospectData.has_online_reviews) return 'Online reputation management';
    return 'Digital marketing integration';
  }

  private identifyDigitalGaps(prospectData: any): string {
    const gaps = [];
    if (!prospectData.has_google_business) gaps.push('missing Google Business optimization');
    if (!prospectData.has_social_media) gaps.push('no social media presence');
    if (!prospectData.has_online_reviews) gaps.push('limited review management');
    
    if (gaps.length === 0) return 'Through optimization of your existing digital presence,';
    if (gaps.length === 1) return `By addressing ${gaps[0]},`;
    return `By fixing ${gaps.slice(0, 2).join(' and ')},`;
  }

  // Update processPitchResult to handle new parameters
  private async processPitchResult(result: any, prospectFolder: string, prospectData: ProspectFrontmatter, options: any = {}): Promise<string> {
    // Extract pitch components from Mastra result
    // This would need to be adapted based on actual Mastra response format
    
    const pitchComponents: PitchComponents = {
      hook: "Generated stage-aware hook",
      valueProposition: "Generated value proposition with competitor analysis", 
      proofPoints: "Generated proof points with industry insights",
      roiProjection: "Generated ROI projection with assumptions",
      callToAction: "Generated stage-appropriate call to action"
    };

    // Format the complete pitch content with enhanced features
    const pitchContent = await this.formatEnhancedPitchContent(prospectData, pitchComponents, options);

    // Write to file
    const pitchPath = await this.writePitchFile(prospectFolder, pitchContent);

    return pitchPath;
  }

  private async formatEnhancedPitchContent(prospect: ProspectFrontmatter, components: PitchComponents, options: any): Promise<string> {
    const now = new Date().toISOString();
    const stage = options.pipelineStage || 'cold';
    const timeBoxed = options.timeBoxed || false;
    
    return `---
type: prospect-pitch
company: "${prospect.company}"
industry: ${prospect.industry}
pipeline_stage: ${stage}
time_boxed: ${timeBoxed}
created: "${now}"
updated: "${now}"
status: generated
pitch_version: 2.0
qualification_score: ${prospect.qualification_score}
tags: [sales, pitch, ${prospect.industry}, ai-generated, mastra-agent, stage-aware, ${timeBoxed ? 'time-boxed' : 'full-format'}]
---

# Enhanced Stage-Aware Pitch - ${prospect.company}

> **AI-Generated Sales Pitch (Mastra-Enhanced v2.0)**
> 
> This pitch uses advanced stage-aware messaging, competitor analysis, and ${timeBoxed ? 'time-boxed delivery structure' : 'comprehensive format'} optimized for ${stage} pipeline stage.

## 📊 Pitch Overview

**Pipeline Stage**: ${stage.toUpperCase()}
**Target Response Rate**: 15%+
**Delivery Format**: ${timeBoxed ? 'Time-boxed (30s/60s/120s)' : 'Full presentation'}

${timeBoxed ? `
## ⏱️ Time-Boxed Structure

**30-Second Hook** (Target: 30 words)
${components.hook}

**60-Second Value Proposition** (Target: 60 words)  
${components.valueProposition}

**2-Minute Close** (Target: 120 words)
${components.callToAction}

---
` : `
## 🎯 Opening Hook

${components.hook}

## 💎 Value Proposition

${components.valueProposition}

## 📊 Proof Points & Case Studies

${components.proofPoints}

## 💰 ROI Projection

${components.roiProjection}

## 🚀 Next Steps

${components.callToAction}

---
`}

## 🏆 Competitive Analysis Summary

**Large/National Competitors**: McDonald's, Starbucks
- **Their weaknesses**: Generic messaging, limited local focus, corporate constraints
- **Your advantage**: Personalized local approach, agile implementation, community focus

**Local Competitors**: 3 identified with limited digital presence
- **Common gaps**: Poor online presence, inconsistent branding, small marketing budgets
- **Market opportunity**: Capture market share through superior digital marketing

## 📋 Stage-Aware Messaging Notes

**Pipeline Stage**: ${stage}
- **Tone**: ${this.getStageToneModifications(stage).formality}
- **Approach**: ${this.stageAwareTemplates[stage]?.approach}
- **Trust Elements**: ${this.getStageTrustElements(stage).join(', ')}
- **Urgency Level**: ${this.getStageUrgency(stage)}

## 🎯 Personalization Details

**Business Profile Analysis:**
- **Qualification Score**: ${prospect.qualification_score}/100
- **Business Size**: ${prospect.business_size}
- **Estimated Revenue**: $${prospect.estimated_revenue?.toLocaleString()}
- **Pipeline Stage**: ${prospect.pipeline_stage}

**Digital Presence Gaps:**
${!prospect.has_social_media ? '- No social media presence\n' : ''}${!prospect.has_website ? '- Missing professional website\n' : ''}${!prospect.has_google_business ? '- Google Business not optimized\n' : ''}${!prospect.has_online_reviews ? '- Limited online review management\n' : ''}

**AI Agent Recommendations:**
- Stage-appropriate messaging for ${stage} prospects
- Competitor-differentiated value proposition
- ${timeBoxed ? 'Time-optimized delivery structure' : 'Comprehensive presentation format'}
- 15%+ response rate optimization targeting

---

*This enhanced pitch was generated by the MHM Mastra Pitch Creator Agent v2.0*
*Features: Stage-aware messaging, competitor analysis, ${timeBoxed ? 'time-boxed structure' : 'full format'}*
*Prospect data source: [[index|Prospect Profile]]*
*Last updated: ${now}*`;
  }
}

// Export singleton instance
export const mastraPitchCreatorAgent = new MastraPitchCreatorAgent();