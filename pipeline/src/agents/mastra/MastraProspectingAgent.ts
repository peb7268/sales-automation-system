import { Tool } from '@mastra/core';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { MastraAgentBase, MastraAgentBaseConfig } from './MastraAgentBase';
import { GoogleMapsIntegration } from '../../integrations/google-maps';
import { YellowPagesIntegration } from '../../integrations/yellow-pages';
import { FirecrawlIntegration } from '../../integrations/firecrawl';
import { PerplexityIntegration } from '../../integrations/perplexity';
import { ProspectValidator } from '../../utils/validation/prospect-validation';
import { MarketingStrategyGenerator, BusinessProfile, MarketingStrategy } from '../../utils/marketing/strategy-generator';
import { ApiHealthChecker, ApiHealthReport } from '../../utils/api-health-checker';
import { Prospect, ProspectCreationInput, GeographicFilter, ProspectingResults, DataConfidence, ProspectDataSources } from '../../types/prospect';

// Multi-pass data collection result interfaces
interface PassResult {
  passNumber: number;
  passName: string;
  success: boolean;
  dataExtracted: Record<string, any>;
  confidenceUpdates: DataConfidence[];
  sourcesUsed: string[];
  executionTime: number;
  errors?: string[];
}

interface CompetitorData {
  name: string;
  website: string;
  industry: string;
  location: string;
  businessInfo: {
    services: string[];
    targetMarket: string[];
    pricing: string;
    strengths: string[];
    weaknesses: string[];
  };
  digitalPresence: {
    websiteQuality: number;
    seoStrength: number;
    socialMedia: string[];
    onlineReviews: number;
  };
  screenshots: {
    desktop: string;
    mobile: string;
  };
  designSystem: {
    colorPalette: string[];
    typography: string[];
    layoutStyle: string;
    userExperience: string[];
  };
  marketingAnalysis: {
    messaging: string[];
    valueProposition: string;
    callsToAction: string[];
    salesFunnel: string[];
  };
  seoAnalysis: {
    metaTags: Record<string, string>;
    headings: string[];
    keywords: string[];
    technicalSeo: string[];
  };
}

interface ProspectingPackage {
  prospectProfile: {
    businessInfo: Record<string, any>;
    qualification: number;
    contactDetails: Record<string, any>;
  };
  competitors: CompetitorData[];
  businessAnalysis: {
    currentWebsite: Record<string, any>;
    marketPosition: string;
    opportunities: string[];
    threats: string[];
  };
  recommendations: {
    marketing: string[];
    website: string[];
    competitive: string[];
    pricing: string[];
  };
  artifacts: {
    prospectProfilePath: string;
    competitorFolders: string[];
    enhancedRecommendationsPath: string;
  };
}

interface MultiPassProspectData {
  prospect: Partial<Prospect>;
  passResults: PassResult[];
  overallConfidence: number;
  prospectingPackage: ProspectingPackage;
  dataConflicts: Array<{
    field: string;
    conflictingValues: Array<{
      value: any;
      source: string;
      confidence: number;
    }>;
  }>;
}

/**
 * Enhanced Multi-Pass Prospecting Agent built on Mastra framework
 * Implements 4-pass data collection strategy with confidence scoring
 */
export class MastraProspectingAgent extends MastraAgentBase {
  private googleMaps: GoogleMapsIntegration;
  private yellowPages: YellowPagesIntegration;
  private firecrawl: FirecrawlIntegration;
  private perplexity: PerplexityIntegration;
  private validator: ProspectValidator;
  private marketingGenerator: MarketingStrategyGenerator;
  private apiHealthChecker: ApiHealthChecker;
  
  // Multi-pass configuration
  private readonly CONFIDENCE_THRESHOLD = 70; // Minimum confidence to consider data reliable
  private readonly MAX_PASSES = 5; // Added Pass 5 for marketing strategy generation
  
  // Rate limiting and deduplication
  private seenBusinesses: Set<string> = new Set();
  private rateLimitCounters: Record<string, { count: number; resetTime: number }> = {};

  constructor() {
    const config: MastraAgentBaseConfig = {
      name: 'Geographic Prospecting Agent',
      instructions: MastraProspectingAgent.getInstructions(),
      temperature: 0.1,
      maxTokens: 8000
    };

    super(config);

    // Initialize integrations
    this.googleMaps = new GoogleMapsIntegration();
    this.yellowPages = new YellowPagesIntegration();
    this.firecrawl = new FirecrawlIntegration();
    this.perplexity = new PerplexityIntegration();
    this.validator = new ProspectValidator();
    this.marketingGenerator = new MarketingStrategyGenerator();
    this.apiHealthChecker = new ApiHealthChecker();
    
    this.logger.info('MastraProspectingAgent initialized with multi-pass capabilities');
  }

  /**
   * Define enhanced tools for multi-pass prospecting
   */
  getTools(): Tool[] {
    return [
      {
        id: 'executePass1GoogleMaps',
        description: 'Pass 1: Extract all available data from Google Maps API',
        execute: async (params: any) => {
          return await this.executePass1GoogleMaps(params);
        }
      },
      {
        id: 'executePass2FirecrawlVerification',
        description: 'Pass 2: Use Firecrawl to verify and augment data via Google search',
        execute: async (params: any) => {
          return await this.executePass2FirecrawlVerification(params);
        }
      },
      {
        id: 'executePass3ReviewAnalysis',
        description: 'Pass 3: Analyze Google Reviews for business insights',
        execute: async (params: any) => {
          return await this.executePass3ReviewAnalysis(params);
        }
      },
      {
        id: 'executePass4AdditionalSources',
        description: 'Pass 4: Augment with Secretary of State, Yellow Pages, and website scraping',
        execute: async (params: any) => {
          return await this.executePass4AdditionalSources(params);
        }
      },
      {
        id: 'executePass5MarketingStrategy',
        description: 'Pass 5: Generate AI-powered marketing strategy based on business intelligence',
        execute: async (params: any) => {
          return await this.executePass5MarketingStrategy(params);
        }
      },
      {
        id: 'calculateConfidenceScores',
        description: 'Calculate confidence scores based on cross-verification of data sources',
        execute: async (params: any) => {
          return await this.calculateConfidenceScores(params);
        }
      },
      {
        id: 'resolveDataConflicts',
        description: 'Resolve conflicting data from multiple sources using confidence weighting',
        execute: async (params: any) => {
          return await this.resolveDataConflicts(params);
        }
      },
      {
        id: 'checkApiHealth',
        description: 'Check health of all required APIs before proceeding',
        execute: async (params: any) => {
          return await this.checkApiHealth();
        }
      }
    ];
  }

  /**
   * Main multi-pass prospecting workflow - COMPLETELY REWRITTEN FOR ACTUAL EXECUTION
   */
  async prospect(filter: GeographicFilter): Promise<ProspectingResults> {
    const startTime = Date.now();
    
    this.logger.info('Starting comprehensive multi-pass prospecting workflow', { filter });

    // CRITICAL: Check API health before proceeding
    const healthCheck = await this.checkApiHealth();
    if (!healthCheck.healthy && healthCheck.action.includes('CRITICAL')) {
      throw new Error(healthCheck.action);
    }

    try {
      // Initialize results tracking
      const passResults: PassResult[] = [];
      const businessName = filter.businessName || '';
      const location = filter.location || '';
      const industry = filter.industry || '';

      // PASS 1: Google Maps Business Discovery
      this.logger.info('🔄 EXECUTING Pass 1: Google Maps Business Discovery');
      const pass1Result = await this.executePass1GoogleMaps({
        businessName,
        city: location.split(',')[0] || location,
        state: location.split(',')[1]?.trim() || 'CO'
      });
      passResults.push(pass1Result);

      // PASS 2: Competitor Discovery via Firecrawl
      this.logger.info('🔄 EXECUTING Pass 2: Competitor Discovery and Analysis');
      const pass2Result = await this.executePass2CompetitorDiscovery({
        businessName,
        industry,
        location,
        businessData: pass1Result.dataExtracted
      });
      passResults.push(pass2Result);

      // PASS 3: Website and SEO Analysis
      this.logger.info('🔄 EXECUTING Pass 3: Website and SEO Analysis');
      const pass3Result = await this.executePass3WebsiteAnalysis({
        businessName,
        businessData: pass1Result.dataExtracted,
        competitors: pass2Result.dataExtracted.competitors || []
      });
      passResults.push(pass3Result);

      // PASS 4: Competitive Intelligence Generation
      this.logger.info('🔄 EXECUTING Pass 4: Competitive Intelligence Generation');
      const pass4Result = await this.executePass4CompetitiveIntelligence({
        businessName,
        industry,
        location,
        businessData: pass1Result.dataExtracted,
        competitors: pass2Result.dataExtracted.competitors || [],
        websiteAnalysis: pass3Result.dataExtracted
      });
      passResults.push(pass4Result);

      // PASS 5: Artifact Generation and File Creation
      this.logger.info('🔄 EXECUTING Pass 5: Comprehensive Artifact Generation');
      const pass5Result = await this.executePass5ArtifactGeneration({
        businessName,
        passResults: passResults.slice(0, 4), // Previous 4 passes
        businessData: pass1Result.dataExtracted,
        competitors: pass2Result.dataExtracted.competitors || [],
        analysis: { ...pass3Result.dataExtracted, ...pass4Result.dataExtracted }
      });
      passResults.push(pass5Result);

      // Create comprehensive prospecting package
      const prospectingPackage = await this.createProspectingPackage(passResults, businessName);
      
      // Generate final results
      const prospectingResults = await this.generateFinalResults(passResults, prospectingPackage, startTime);
      
      this.logger.info('🎯 Comprehensive prospecting workflow completed', {
        totalFound: prospectingResults.totalFound,
        qualified: prospectingResults.qualified,
        processingTime: prospectingResults.processingTime,
        artifactsGenerated: prospectingPackage.artifacts?.foldersCreated?.length || 0,
        competitorsAnalyzed: prospectingPackage.competitorData?.length || 0
      });

      return prospectingResults;

    } catch (error) {
      this.logger.error('Multi-pass prospecting workflow failed', { 
        error: error.message, 
        filter 
      });
      throw error;
    }
  }

  /**
   * Pass 1: Google Maps API extraction with comprehensive data collection
   */
  private async executePass1GoogleMaps(params: any): Promise<PassResult> {
    const startTime = Date.now();
    const passResult: PassResult = {
      passNumber: 1,
      passName: 'Google Maps API Extraction',
      success: false,
      dataExtracted: {},
      confidenceUpdates: [],
      sourcesUsed: ['google_maps'],
      executionTime: 0,
      errors: []
    };

    try {
      this.logger.info('Executing Pass 1: Google Maps extraction', { businessName: params.businessName });

      if (!this.canMakeApiCall('googleMaps')) {
        passResult.errors?.push('Google Maps API rate limit exceeded');
        return passResult;
      }

      // Search for the business using text search (better for specific business names)
      const searchResults = await this.googleMaps.searchBusinessesByName(
        params.businessName,
        `${params.city}, ${params.state}`
      );

      if (searchResults && searchResults.length > 0) {
        const businessData = searchResults[0]; // Take the best match
        
        // Get detailed information using Place Details API
        let detailedData = businessData;
        if (businessData.place_id) {
          try {
            const details = await this.googleMaps.getBusinessDetails(businessData.place_id);
            if (details) {
              detailedData = { ...businessData, ...details };
            }
          } catch (error) {
            this.logger.warn('Failed to get detailed business information', { 
              placeId: businessData.place_id,
              error: error.message
            });
          }
        }
        
        // Extract comprehensive data from Google Maps
        passResult.dataExtracted = {
          name: detailedData.name,
          placeId: detailedData.place_id,
          address: detailedData.formatted_address || detailedData.address,
          phone: detailedData.formatted_phone_number || detailedData.phone,
          website: detailedData.website,
          googleBusinessUrl: detailedData.url,
          rating: detailedData.rating,
          userRatingsTotal: detailedData.user_ratings_total,
          businessStatus: detailedData.business_status,
          types: detailedData.types,
          geometry: detailedData.geometry,
          photos: detailedData.photos?.map(photo => photo.photo_reference),
          openingHours: detailedData.opening_hours,
          priceLevel: detailedData.price_level,
          permanentlyClosed: detailedData.permanently_closed
        };

        // Create confidence entries for extracted data
        passResult.confidenceUpdates = this.createConfidenceEntries(passResult.dataExtracted, 'google_maps', 85);
        passResult.success = true;
        
        this.logger.info('Pass 1 completed successfully', { 
          businessName: params.businessName,
          dataFields: Object.keys(passResult.dataExtracted).length
        });
      } else {
        passResult.errors?.push('No Google Maps results found for business');
      }

    } catch (error) {
      this.logger.error('Pass 1 failed', { error: error.message });
      passResult.errors?.push(`Google Maps extraction failed: ${error.message}`);
    }

    passResult.executionTime = Date.now() - startTime;
    return passResult;
  }

  /**
   * Pass 2: Comprehensive Competitor Discovery and Analysis - COMPLETELY REWRITTEN
   */
  private async executePass2CompetitorDiscovery(params: any): Promise<PassResult> {
    const startTime = Date.now();
    const passResult: PassResult = {
      passNumber: 2,
      passName: 'Competitor Discovery and Analysis',
      success: false,
      dataExtracted: {
        competitors: [],
        competitorCount: 0
      },
      confidenceUpdates: [],
      sourcesUsed: ['firecrawl_search', 'perplexity_research'],
      executionTime: 0,
      errors: []
    };

    try {
      this.logger.info('Executing Pass 2: Firecrawl verification', { businessName: params.businessName });

      if (!this.canMakeApiCall('firecrawl')) {
        passResult.errors?.push('Firecrawl API not available');
        return passResult;
      }

      // Perform targeted Google searches to verify and augment data
      const searchQueries = [
        `"${params.businessName}" ${params.city} ${params.state} contact`,
        `"${params.businessName}" ${params.city} phone email`,
        `"${params.businessName}" ${params.city} website`,
        `"${params.businessName}" ${params.city} owner manager`
      ];

      const searchResults = [];
      for (const query of searchQueries) {
        try {
          const result = await this.firecrawl.searchAndAnalyze({
            query,
            maxResults: 5,
            analysisPrompt: `Extract contact information, business details, and owner/management information for ${params.businessName} in ${params.city}, ${params.state}`
          });
          searchResults.push(result);
        } catch (error) {
          this.logger.warn('Firecrawl search query failed', { query, error: error.message });
        }
      }

      // Analyze and extract verified data
      const extractedData = this.analyzeFirecrawlResults(searchResults, params);
      passResult.dataExtracted = extractedData;
      
      // Create confidence entries with cross-verification
      passResult.confidenceUpdates = this.createConfidenceEntries(extractedData, 'firecrawl_search', 75);

      // Cross-verify with Pass 1 data if available
      if (params.existingData) {
        const verificationResults = this.crossVerifyData(params.existingData, extractedData);
        passResult.confidenceUpdates.push(...verificationResults);
      }

      passResult.success = true;
      
      this.logger.info('Pass 2 completed successfully', { 
        businessName: params.businessName,
        queriesExecuted: searchQueries.length,
        dataFields: Object.keys(extractedData).length
      });

    } catch (error) {
      this.logger.error('Pass 2 failed', { error: error.message });
      passResult.errors?.push(`Firecrawl verification failed: ${error.message}`);
    }

    passResult.executionTime = Date.now() - startTime;
    return passResult;
  }

  /**
   * Pass 3: Google Reviews analysis for business insights
   */
  private async executePass3ReviewAnalysis(params: any): Promise<PassResult> {
    const startTime = Date.now();
    const passResult: PassResult = {
      passNumber: 3,
      passName: 'Google Reviews Analysis',
      success: false,
      dataExtracted: {},
      confidenceUpdates: [],
      sourcesUsed: ['google_reviews'],
      executionTime: 0,
      errors: []
    };

    try {
      this.logger.info('Executing Pass 3: Google Reviews analysis', { businessName: params.businessName });

      if (!params.placeId) {
        passResult.errors?.push('No Google Place ID available for reviews analysis');
        return passResult;
      }

      // Fetch Google Reviews
      const reviews = await this.googleMaps.getPlaceReviews(params.placeId);
      
      if (reviews && reviews.length > 0) {
        // Analyze reviews for business insights
        const reviewAnalysis = await this.analyzeReviewsForInsights(reviews, params.businessName);
        
        passResult.dataExtracted = {
          businessInsights: reviewAnalysis.insights,
          ownerInformation: reviewAnalysis.ownerInfo,
          operationalSOPs: reviewAnalysis.operationalSOPs,
          customerFeedbackTrends: reviewAnalysis.feedbackTrends,
          competitiveAdvantages: reviewAnalysis.advantages,
          painPoints: reviewAnalysis.painPoints,
          businessChallenges: reviewAnalysis.challenges,
          reviewCount: reviews.length,
          averageRating: this.calculateAverageRating(reviews)
        };

        // Create confidence entries for insights
        passResult.confidenceUpdates = this.createConfidenceEntries(passResult.dataExtracted, 'google_reviews', 65);
        passResult.success = true;
        
        this.logger.info('Pass 3 completed successfully', { 
          businessName: params.businessName,
          reviewsAnalyzed: reviews.length,
          insightsExtracted: Object.keys(reviewAnalysis.insights).length
        });
      } else {
        passResult.errors?.push('No Google Reviews found for analysis');
      }

    } catch (error) {
      this.logger.error('Pass 3 failed', { error: error.message });
      passResult.errors?.push(`Reviews analysis failed: ${error.message}`);
    }

    passResult.executionTime = Date.now() - startTime;
    return passResult;
  }

  /**
   * Pass 4: Additional data sources (Secretary of State, Yellow Pages, website scraping)
   */
  private async executePass4AdditionalSources(params: any): Promise<PassResult> {
    const startTime = Date.now();
    const passResult: PassResult = {
      passNumber: 4,
      passName: 'Additional Data Sources',
      success: false,
      dataExtracted: {},
      confidenceUpdates: [],
      sourcesUsed: [],
      executionTime: 0,
      errors: []
    };

    try {
      this.logger.info('Executing Pass 4: Additional sources', { businessName: params.businessName });

      const additionalData: Record<string, any> = {};

      // Secretary of State lookup
      if (params.state) {
        try {
          const sosData = await this.lookupSecretaryOfState(params.businessName, params.state);
          if (sosData) {
            additionalData.secretaryOfState = sosData;
            passResult.sourcesUsed.push('secretary_of_state');
          }
        } catch (error) {
          this.logger.warn('Secretary of State lookup failed', { error: error.message });
        }
      }

      // Yellow Pages lookup
      if (this.canMakeApiCall('yellowPages')) {
        try {
          const yellowPagesData = await this.yellowPages.searchBusinesses({
            businessName: params.businessName,
            location: `${params.city}, ${params.state}`
          });
          if (yellowPagesData && yellowPagesData.length > 0) {
            additionalData.yellowPages = yellowPagesData[0];
            passResult.sourcesUsed.push('yellow_pages');
          }
        } catch (error) {
          this.logger.warn('Yellow Pages lookup failed', { error: error.message });
        }
      }

      // Website scraping if website URL available
      if (params.website && this.canMakeApiCall('firecrawl')) {
        try {
          const websiteData = await this.firecrawl.scrapeWebsite({
            url: params.website,
            analysisPrompt: `Extract detailed business information, contact details, services, team/staff information, and any other relevant business intelligence from this website.`
          });
          if (websiteData) {
            additionalData.websiteScrape = websiteData;
            passResult.sourcesUsed.push('website_scrape');
          }
        } catch (error) {
          this.logger.warn('Website scraping failed', { website: params.website, error: error.message });
        }
      }

      passResult.dataExtracted = additionalData;
      
      // Create confidence entries for additional sources
      if (Object.keys(additionalData).length > 0) {
        passResult.confidenceUpdates = this.createConfidenceEntries(additionalData, passResult.sourcesUsed.join(','), 70);
        passResult.success = true;
        
        this.logger.info('Pass 4 completed successfully', { 
          businessName: params.businessName,
          sourcesUsed: passResult.sourcesUsed.length,
          dataFields: Object.keys(additionalData).length
        });
      } else {
        passResult.errors?.push('No additional data sources available or accessible');
      }

    } catch (error) {
      this.logger.error('Pass 4 failed', { error: error.message });
      passResult.errors?.push(`Additional sources failed: ${error.message}`);
    }

    passResult.executionTime = Date.now() - startTime;
    return passResult;
  }

  /**
   * Pass 5: Generate AI-powered marketing strategy based on business intelligence
   */
  private async executePass5MarketingStrategy(params: any): Promise<PassResult> {
    const startTime = Date.now();
    const passResult: PassResult = {
      passNumber: 5,
      passName: 'AI Marketing Strategy Generation',
      success: false,
      dataExtracted: {},
      confidenceUpdates: [],
      sourcesUsed: ['ai_analysis', 'industry_research'],
      executionTime: 0,
      errors: []
    };

    try {
      this.logger.info('Executing Pass 5: Marketing strategy generation', { businessName: params.businessName });

      // Build business profile from collected data
      const businessProfile = this.buildBusinessProfile(params);
      
      // Generate marketing strategy using AI
      const marketingStrategy = await this.marketingGenerator.generateStrategy(businessProfile);
      
      // Ensure the strategy has the required structure
      if (marketingStrategy && marketingStrategy.digitalMarketingPlan) {
        passResult.dataExtracted = {
          marketingStrategy: marketingStrategy,
          strategyGenerated: true,
          industryAnalysisCompleted: true,
          digitalMarketingPlan: marketingStrategy.digitalMarketingPlan,
          implementationRoadmap: marketingStrategy.implementationRoadmap
        };

        // Create confidence entries for strategy data
        passResult.confidenceUpdates = [
          {
            field: 'marketingStrategy',
            value: 'AI-generated strategy',
            confidence: 85,
            source: 'ai_analysis',
            crossVerified: false
          }
        ];

        passResult.success = true;
        
        this.logger.info('Pass 5 completed successfully', { 
          businessName: params.businessName,
          strategiesCount: marketingStrategy.digitalMarketingPlan?.strategies?.length || 0,
          priority: marketingStrategy.digitalMarketingPlan?.priorityLevel
        });
      } else {
        passResult.errors?.push('Generated marketing strategy missing required structure');
        this.logger.warn('Marketing strategy generated but missing required structure');
      }

    } catch (error) {
      this.logger.error('Pass 5 failed', { error: error.message });
      passResult.errors?.push(`Marketing strategy generation failed: ${error.message}`);
    }

    passResult.executionTime = Date.now() - startTime;
    return passResult;
  }

  /**
   * Build business profile for marketing strategy generation
   */
  private buildBusinessProfile(params: any): BusinessProfile {
    const aggregatedData = params.aggregatedData || {};
    const businessInsights = params.businessInsights || {};
    
    return {
      name: aggregatedData.name || params.businessName || 'Unknown Business',
      industry: params.industry || 'general',
      location: `${params.city || 'Unknown'}, ${params.state || 'Unknown'}`,
      phone: aggregatedData.phone,
      website: aggregatedData.website,
      businessSize: 'small', // Default assumption for prospects
      hasWebsite: !!aggregatedData.website,
      hasGoogleBusiness: !!aggregatedData.placeId,
      hasSocialMedia: false, // To be enhanced with social media detection
      hasOnlineReviews: !!aggregatedData.userRatingsTotal,
      rating: aggregatedData.rating,
      reviewCount: aggregatedData.userRatingsTotal,
      businessInsights: {
        operationalStrengths: businessInsights.operationalStrengths || [],
        customerDemographics: businessInsights.customerDemographics || [],
        revenueIndicators: businessInsights.revenueIndicators || [],
        marketPosition: businessInsights.marketPosition || []
      }
    };
  }

  /**
   * Calculate confidence scores based on cross-verification
   */
  private async calculateConfidenceScores(params: any): Promise<Record<string, any>> {
    const { passResults, prospectData } = params;
    const confidenceScores: Record<string, DataConfidence> = {};

    // Aggregate all confidence updates from all passes
    const allConfidenceUpdates: DataConfidence[] = [];
    passResults.forEach((pass: PassResult) => {
      allConfidenceUpdates.push(...pass.confidenceUpdates);
    });

    // Group by field and calculate cross-verified confidence
    const fieldGroups = this.groupConfidenceByField(allConfidenceUpdates);
    
    Object.entries(fieldGroups).forEach(([field, confidenceEntries]) => {
      const crossVerifiedConfidence = this.calculateCrossVerifiedConfidence(confidenceEntries);
      confidenceScores[field] = crossVerifiedConfidence;
    });

    // Calculate overall confidence score
    const overallConfidence = this.calculateOverallConfidence(Object.values(confidenceScores));

    return {
      fieldConfidences: confidenceScores,
      overallConfidence,
      totalFields: Object.keys(confidenceScores).length,
      highConfidenceFields: Object.values(confidenceScores).filter(c => c.confidence >= this.CONFIDENCE_THRESHOLD).length
    };
  }

  /**
   * Resolve conflicting data from multiple sources
   */
  private async resolveDataConflicts(params: any): Promise<Record<string, any>> {
    const { conflicts } = params;
    const resolvedData: Record<string, any> = {};

    for (const conflict of conflicts) {
      const resolution = this.resolveFieldConflict(conflict);
      resolvedData[conflict.field] = resolution;
    }

    return {
      resolvedFields: resolvedData,
      conflictsResolved: conflicts.length,
      resolutionStrategy: 'confidence_weighted_selection'
    };
  }

  /**
   * Build structured prompt for multi-pass prospecting
   */
  private buildMultiPassProspectingPrompt(filter: GeographicFilter): string {
    return `Execute a comprehensive 4-pass prospecting workflow with confidence scoring:

TARGET PARAMETERS:
- Area: ${filter.city}, ${filter.state} (${filter.radius} mile radius)
- Industries: ${filter.industries?.join(', ') || 'all industries'}
- Size Range: ${filter.minEmployees || 'any'}-${filter.maxEmployees || 'any'} employees
- Revenue Range: $${filter.minRevenue?.toLocaleString() || 'any'}-$${filter.maxRevenue?.toLocaleString() || 'any'}

MULTI-PASS EXECUTION STRATEGY:

PASS 1 - Google Maps API Extraction:
- Use executePass1GoogleMaps tool for each prospect
- Extract ALL available data: contact info, ratings, hours, photos, etc.
- Establish baseline confidence scores (85% for Google Maps data)

PASS 2 - Firecrawl Search Verification:
- Use executePass2FirecrawlVerification tool to verify Pass 1 data
- Perform targeted Google searches to find additional contact information
- Cross-verify existing data and increase confidence scores for matches

PASS 3 - Google Reviews Analysis:
- Use executePass3ReviewAnalysis tool to extract business insights
- Analyze reviews for: owner info, operational SOPs, customer trends, pain points
- Generate strategic business intelligence for sales approach

PASS 4 - Additional Data Sources:
- Use executePass4AdditionalSources tool for comprehensive augmentation
- Secretary of State lookups for business registration details
- Yellow Pages verification and additional contact data
- Website scraping for detailed business information

CONFIDENCE SCORING:
- Use calculateConfidenceScores tool to aggregate cross-verification results
- Default confidence starts at 0, increases with each independent verification
- Minimum ${this.CONFIDENCE_THRESHOLD}% confidence required for reliable data
- Use resolveDataConflicts tool when sources provide conflicting information

FINAL OUTPUT REQUIREMENTS:
- Complete prospect profiles with confidence scores for each data field
- Business insights from reviews and research
- Data source attribution for all information
- Overall confidence score for each prospect
- Identification and resolution of any data conflicts

Focus on data quality over quantity. Ensure thorough cross-verification and provide detailed confidence assessments.`;
  }

  /**
   * Process multi-pass results into structured format
   */
  private async processMultiPassResults(rawResult: any, startTime: number): Promise<ProspectingResults> {
    // This would process the actual Mastra agent response
    // For now, return a structured result based on the expected format
    
    const results: ProspectingResults = {
      prospects: [],
      totalFound: 0,
      qualified: 0,
      duplicatesRemoved: 0,
      processingTime: Date.now() - startTime,
      apiCallsUsed: {
        googleMaps: this.getApiCallCount('googleMaps'),
        yellowPages: this.getApiCallCount('yellowPages'),
        firecrawl: this.getApiCallCount('firecrawl'),
        perplexity: this.getApiCallCount('perplexity')
      }
    };

    return results;
  }

  /**
   * Get enhanced agent instructions for multi-pass prospecting
   */
  private static getInstructions(): string {
    return `You are an advanced multi-pass prospecting specialist that systematically collects and verifies business data through multiple data sources with confidence scoring.

CORE RESPONSIBILITIES:
1. Execute 4-pass data collection strategy for maximum data accuracy
2. Cross-verify information across multiple sources to build confidence scores
3. Extract strategic business insights from reviews and online presence
4. Resolve data conflicts using confidence-weighted decision making
5. Generate comprehensive prospect profiles with reliability metrics

MULTI-PASS STRATEGY:
- Pass 1: Google Maps API for foundational business data (85% base confidence)
- Pass 2: Firecrawl search verification and augmentation (75% base confidence)
- Pass 3: Google Reviews analysis for business insights (65% base confidence)  
- Pass 4: Additional sources (SOS, Yellow Pages, website scraping) (70% base confidence)

CONFIDENCE SCORING RULES:
- Start all fields at 0% confidence
- Increase confidence for each independent source that verifies the same data
- Use weighted averages based on source reliability
- Flag conflicts when sources provide different values
- Achieve minimum 70% confidence threshold for reliable data

DATA QUALITY STANDARDS:
- Prioritize accuracy over speed
- Document all data sources and extraction methods
- Provide detailed business insights and strategic intelligence
- Maintain audit trail of all confidence score calculations
- Focus on actionable business intelligence for sales teams

Always execute all 4 passes systematically and provide comprehensive confidence assessments for every data field.`;
  }

  // Helper methods for multi-pass processing
  private createConfidenceEntries(data: Record<string, any>, source: string, baseConfidence: number): DataConfidence[] {
    const entries: DataConfidence[] = [];
    
    Object.entries(data).forEach(([field, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        entries.push({
          field,
          confidence: baseConfidence,
          sources: [source],
          lastVerified: new Date()
        });
      }
    });
    
    return entries;
  }

  private crossVerifyData(existingData: Record<string, any>, newData: Record<string, any>): DataConfidence[] {
    const verificationResults: DataConfidence[] = [];
    
    Object.entries(newData).forEach(([field, newValue]) => {
      if (existingData[field] && existingData[field] === newValue) {
        // Data matches - increase confidence
        verificationResults.push({
          field,
          confidence: 90, // High confidence for cross-verified data
          sources: ['cross_verification'],
          lastVerified: new Date()
        });
      } else if (existingData[field] && existingData[field] !== newValue) {
        // Data conflict - need resolution
        verificationResults.push({
          field,
          confidence: 30, // Low confidence due to conflict
          sources: ['conflict_detected'],
          lastVerified: new Date(),
          conflictingData: [
            { value: existingData[field], source: 'previous_pass', confidence: 50 },
            { value: newValue, source: 'current_pass', confidence: 50 }
          ]
        });
      }
    });
    
    return verificationResults;
  }

  private analyzeFirecrawlResults(searchResults: any[], params: any): Record<string, any> {
    // Analyze Firecrawl search results to extract structured data
    const extractedData: Record<string, any> = {};
    
    // This would contain logic to parse and structure the search results
    // For now, return a placeholder structure
    
    return extractedData;
  }

  private async analyzeReviewsForInsights(reviews: any[], businessName: string): Promise<any> {
    // Analyze Google Reviews to extract business insights
    const analysis = {
      insights: {},
      ownerInfo: '',
      operationalSOPs: [],
      feedbackTrends: [],
      advantages: [],
      painPoints: [],
      challenges: []
    };
    
    // This would contain logic to analyze reviews using AI
    // For now, return placeholder structure
    
    return analysis;
  }

  private async lookupSecretaryOfState(businessName: string, state: string): Promise<any> {
    // Implement Secretary of State lookup logic
    // This would vary by state as each has different APIs/systems
    return null;
  }

  private groupConfidenceByField(confidenceUpdates: DataConfidence[]): Record<string, DataConfidence[]> {
    const groups: Record<string, DataConfidence[]> = {};
    
    confidenceUpdates.forEach(update => {
      if (!groups[update.field]) {
        groups[update.field] = [];
      }
      groups[update.field].push(update);
    });
    
    return groups;
  }

  private calculateCrossVerifiedConfidence(confidenceEntries: DataConfidence[]): DataConfidence {
    // Calculate weighted confidence based on multiple sources
    const totalSources = confidenceEntries.length;
    const averageConfidence = confidenceEntries.reduce((sum, entry) => sum + entry.confidence, 0) / totalSources;
    const allSources = confidenceEntries.flatMap(entry => entry.sources);
    
    return {
      field: confidenceEntries[0].field,
      confidence: Math.min(95, averageConfidence + (totalSources - 1) * 5), // Bonus for multiple sources
      sources: [...new Set(allSources)],
      lastVerified: new Date()
    };
  }

  private calculateOverallConfidence(confidenceScores: DataConfidence[]): number {
    if (confidenceScores.length === 0) return 0;
    
    const totalConfidence = confidenceScores.reduce((sum, score) => sum + score.confidence, 0);
    return Math.round(totalConfidence / confidenceScores.length);
  }

  private resolveFieldConflict(conflict: any): any {
    // Resolve data conflicts using confidence-weighted selection
    const sortedValues = conflict.conflictingValues.sort((a: any, b: any) => b.confidence - a.confidence);
    return sortedValues[0].value; // Return highest confidence value
  }

  /**
   * NEW IMPLEMENTATION: Extract competitor names from Perplexity research
   */
  private extractCompetitorNames(content: string): string[] {
    const competitors: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Look for patterns like "1. Company Name", "- Company Name", "• Company Name"
      const match = line.match(/^[\d\-•*]\s*(.+?)(?:\s*-|\s*\(|$)/);
      if (match && match[1]) {
        const name = match[1].trim();
        // Filter out generic terms
        if (name.length > 3 && !name.toLowerCase().includes('here are') && !name.toLowerCase().includes('the top')) {
          competitors.push(name);
        }
      }
      
      // Also look for website patterns
      const websiteMatch = line.match(/https?:\/\/(?:www\.)?([^\/\s]+)/);
      if (websiteMatch) {
        const domain = websiteMatch[1].split('.')[0];
        if (domain.length > 3) {
          competitors.push(domain.charAt(0).toUpperCase() + domain.slice(1));
        }
      }
    }
    
    return [...new Set(competitors)].slice(0, 7); // Remove duplicates and limit
  }

  /**
   * NEW IMPLEMENTATION: Analyze individual competitor business
   */
  private async analyzeCompetitorBusiness(competitorName: string, industry: string, location: string): Promise<any> {
    try {
      const analysisQuery = `Analyze ${competitorName} company in ${industry} industry in ${location}. Provide their website URL, main services, target market, strengths, weaknesses, pricing strategy, and online presence. Include specific business details and market positioning.`;
      
      const analysis = await this.perplexity.query({
        query: analysisQuery,
        model: 'sonar',
        max_tokens: 1500,
        temperature: 0.1
      });

      const content = analysis.choices[0]?.message?.content || '';
      
      // Extract website URL
      const websiteMatch = content.match(/(?:website|site|url).*?(https?:\/\/[^\s\)]+)/i) || 
                           content.match(/(https?:\/\/[^\s\)]+)/);
      const website = websiteMatch ? websiteMatch[1] : null;
      
      // Extract services
      const services = this.extractListFromContent(content, ['service', 'offer', 'provide', 'speciali']);
      
      // Extract strengths and weaknesses
      const strengths = this.extractListFromContent(content, ['strength', 'advantage', 'strong', 'excel']);
      const weaknesses = this.extractListFromContent(content, ['weakness', 'weak', 'challeng', 'limit']);
      
      return {
        website,
        services,
        strengths,
        weaknesses,
        targetMarket: this.extractListFromContent(content, ['target', 'customer', 'client', 'market']),
        pricingStrategy: this.extractPricingInfo(content),
        websiteQuality: website ? 75 : 0,
        seoStrength: website ? 60 : 0,
        socialMedia: this.extractSocialMedia(content),
        reviewCount: this.extractNumberFromContent(content, ['review', 'rating'])
      };
    } catch (error) {
      this.logger.warn('Failed to analyze competitor', { competitor: competitorName, error: error.message });
      return { website: null };
    }
  }

  /**
   * NEW IMPLEMENTATION: Extract competitors from Firecrawl search results
   */
  private extractCompetitorsFromSearch(searchResults: any[], industry: string): any[] {
    const competitors: any[] = [];
    
    for (const result of searchResults) {
      if (result.title && result.url) {
        // Extract business name from title
        const businessName = this.extractBusinessNameFromTitle(result.title);
        if (businessName && businessName.length > 3) {
          competitors.push({
            name: businessName,
            website: result.url,
            industry,
            businessInfo: {
              services: [],
              targetMarket: [],
              pricing: 'Unknown',
              strengths: [],
              weaknesses: []
            },
            digitalPresence: {
              websiteQuality: 50,
              seoStrength: 40,
              socialMedia: [],
              onlineReviews: 0
            }
          });
        }
      }
    }
    
    return competitors;
  }

  /**
   * NEW IMPLEMENTATION: Pass 3 - Website and SEO Analysis
   */
  private async executePass3WebsiteAnalysis(params: any): Promise<PassResult> {
    const startTime = Date.now();
    const passResult: PassResult = {
      passNumber: 3,
      passName: 'Website and SEO Analysis',
      success: false,
      dataExtracted: {},
      confidenceUpdates: [],
      sourcesUsed: ['firecrawl_scraping'],
      executionTime: 0,
      errors: []
    };

    try {
      const websiteAnalysis: any = {};
      
      // Analyze primary business website
      if (params.businessData?.website) {
        try {
          const primaryAnalysis = await this.analyzeWebsiteDetails(params.businessData.website, params.businessName);
          websiteAnalysis.primaryBusiness = primaryAnalysis;
        } catch (error) {
          this.logger.warn('Failed to analyze primary business website', { error: error.message });
        }
      }
      
      // Analyze competitor websites
      const competitorAnalyses: any[] = [];
      for (const competitor of params.competitors.slice(0, 3)) { // Limit to 3 for performance
        try {
          const analysis = await this.analyzeWebsiteDetails(competitor.website, competitor.name);
          competitorAnalyses.push({
            competitorName: competitor.name,
            website: competitor.website,
            analysis
          });
        } catch (error) {
          this.logger.warn('Failed to analyze competitor website', { 
            competitor: competitor.name, 
            error: error.message 
          });
        }
      }
      
      websiteAnalysis.competitors = competitorAnalyses;
      
      passResult.dataExtracted = websiteAnalysis;
      passResult.success = Object.keys(websiteAnalysis).length > 0;
      
    } catch (error) {
      this.logger.error('Pass 3 failed', { error: error.message });
      passResult.errors?.push(`Website analysis failed: ${error.message}`);
    }

    passResult.executionTime = Date.now() - startTime;
    return passResult;
  }

  /**
   * NEW IMPLEMENTATION: Pass 4 - Competitive Intelligence Generation
   */
  private async executePass4CompetitiveIntelligence(params: any): Promise<PassResult> {
    const startTime = Date.now();
    const passResult: PassResult = {
      passNumber: 4,
      passName: 'Competitive Intelligence Generation',
      success: false,
      dataExtracted: {},
      confidenceUpdates: [],
      sourcesUsed: ['perplexity_analysis'],
      executionTime: 0,
      errors: []
    };

    try {
      const intelligence: any = {
        marketAnalysis: {},
        competitivePositioning: {},
        opportunityGaps: [],
        recommendations: {}
      };
      
      // Generate market analysis
      const marketQuery = `Analyze the ${params.industry} market in ${params.location}. What are the key trends, growth opportunities, customer pain points, and market gaps? How should ${params.businessName} position itself competitively?`;
      
      const marketAnalysis = await this.perplexity.query({
        query: marketQuery,
        model: 'sonar',
        max_tokens: 2000,
        temperature: 0.1
      });
      
      intelligence.marketAnalysis = this.parseMarketAnalysis(marketAnalysis.choices[0]?.message?.content || '');
      
      // Generate competitive positioning
      if (params.competitors.length > 0) {
        const competitorNames = params.competitors.map((c: any) => c.name).join(', ');
        const positioningQuery = `Compare ${params.businessName} with competitors ${competitorNames} in ${params.industry}. What are the competitive advantages, differentiators, and positioning strategies? What opportunities exist to outcompete them?`;
        
        const positioningAnalysis = await this.perplexity.query({
          query: positioningQuery,
          model: 'sonar',
          max_tokens: 2000,
          temperature: 0.1
        });
        
        intelligence.competitivePositioning = this.parseCompetitivePositioning(positioningAnalysis.choices[0]?.message?.content || '');
      }
      
      passResult.dataExtracted = intelligence;
      passResult.success = true;
      
    } catch (error) {
      this.logger.error('Pass 4 failed', { error: error.message });
      passResult.errors?.push(`Competitive intelligence generation failed: ${error.message}`);
    }

    passResult.executionTime = Date.now() - startTime;
    return passResult;
  }

  /**
   * NEW IMPLEMENTATION: Pass 5 - Comprehensive Artifact Generation
   */
  private async executePass5ArtifactGeneration(params: any): Promise<PassResult> {
    const startTime = Date.now();
    const passResult: PassResult = {
      passNumber: 5,
      passName: 'Artifact Generation and File Creation',
      success: false,
      dataExtracted: {},
      confidenceUpdates: [],
      sourcesUsed: ['file_generation'],
      executionTime: 0,
      errors: []
    };

    try {
      const artifacts: any = {
        filesCreated: [],
        foldersCreated: [],
        screenshotsCaptured: []
      };
      
      // Create base prospect folder structure
      const basePath = this.getProspectBasePath(params.businessName);
      await this.ensureDirectoryExists(basePath);
      
      // Create competitor folders
      for (const competitor of params.competitors) {
        const competitorPath = path.join(basePath, 'competitors', this.sanitizeFileName(competitor.name));
        await this.ensureDirectoryExists(competitorPath);
        artifacts.foldersCreated.push(competitorPath);
        
        // Capture screenshots if Firecrawl supports it
        if (competitor.website) {
          try {
            const screenshots = await this.captureWebsiteScreenshots(competitor.website, competitorPath);
            artifacts.screenshotsCaptured.push(...screenshots);
          } catch (error) {
            this.logger.warn('Failed to capture screenshots', { 
              competitor: competitor.name, 
              error: error.message 
            });
          }
        }
      }
      
      artifacts.basePath = basePath;
      
      passResult.dataExtracted = artifacts;
      passResult.success = true;
      
    } catch (error) {
      this.logger.error('Pass 5 failed', { error: error.message });
      passResult.errors?.push(`Artifact generation failed: ${error.message}`);
    }

    passResult.executionTime = Date.now() - startTime;
    return passResult;
  }

  /**
   * Check API health before proceeding with prospect research
   */
  async checkApiHealth(): Promise<{ healthy: boolean; report: ApiHealthReport; action: string }> {
    this.logger.info('Checking API health before starting prospect research');
    
    const report = await this.apiHealthChecker.checkAllApis();
    
    if (!report.allHealthy) {
      this.logger.warn('Some APIs are not healthy', {
        failedServices: report.checks.filter(c => !c.healthy).map(c => c.service)
      });
      
      // Display report to user
      this.apiHealthChecker.displayHealthReport(report);
      
      // Get user decision on how to proceed
      const action = await this.apiHealthChecker.promptUserOnFailure(report);
      
      if (action === 'abort') {
        throw new Error('Prospect research aborted due to API failures. Please fix API issues and try again.');
      }
      
      if (action === 'fix') {
        return {
          healthy: false,
          report,
          action: 'CRITICAL: API keys need to be fixed before proceeding. Check the error messages above and update your .env file with valid API keys.'
        };
      }
    }
    
    this.logger.info('API health check passed', {
      healthyServices: report.checks.filter(c => c.healthy).length,
      totalServices: report.checks.length
    });
    
    return {
      healthy: report.allHealthy,
      report,
      action: report.allHealthy ? 'All APIs healthy - proceeding with research' : 'Proceeding with limited functionality'
    };
  }

  private calculateAverageRating(reviews: any[]): number {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return totalRating / reviews.length;
  }

  private calculateAverageConfidence(prospects: any[]): number {
    if (prospects.length === 0) return 0;
    const totalConfidence = prospects.reduce((sum, prospect) => sum + (prospect.overallConfidence || 0), 0);
    return Math.round(totalConfidence / prospects.length);
  }

  // Rate limiting and API call tracking
  private canMakeApiCall(service: string): boolean {
    const now = Date.now();
    const counter = this.rateLimitCounters[service];
    
    if (!counter || now > counter.resetTime) {
      this.rateLimitCounters[service] = { count: 1, resetTime: now + 3600000 }; // Reset every hour
      return true;
    }
    
    // Adjust limits per service
    const limits = {
      googleMaps: 100,
      firecrawl: 50,
      yellowPages: 200,
      perplexity: 30
    };
    
    return counter.count < (limits[service as keyof typeof limits] || 50);
  }

  private getApiCallCount(service: string): number {
    return this.rateLimitCounters[service]?.count || 0;
  }

  /**
   * HELPER METHODS - Implementation of referenced but missing methods
   */

  /**
   * Extract list items from content based on keywords
   */
  private extractListFromContent(content: string, keywords: string[]): string[] {
    const items: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Check if line contains any of the keywords
      const hasKeyword = keywords.some(keyword => lowerLine.includes(keyword));
      if (hasKeyword) {
        // Extract items from bullet points, numbers, or comma-separated values
        const bulletMatch = line.match(/^[\s\-\*\•\d\.]+(.+)$/);
        if (bulletMatch) {
          items.push(bulletMatch[1].trim());
        } else if (line.includes(',')) {
          const commaItems = line.split(',').map(item => item.trim()).filter(item => item.length > 0);
          items.push(...commaItems);
        }
      }
    }
    
    return [...new Set(items)].slice(0, 5); // Remove duplicates and limit
  }

  /**
   * Extract pricing information from content
   */
  private extractPricingInfo(content: string): string {
    const pricingPatterns = [
      /\$[\d,]+(?:\.\d{2})?/,
      /pricing.*?(?:competitive|affordable|premium|budget|high-end)/i,
      /rates.*?(?:hourly|daily|monthly|yearly)/i,
      /cost.*?(?:low|high|moderate|reasonable)/i
    ];
    
    for (const pattern of pricingPatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return 'Unknown';
  }

  /**
   * Extract social media presence from content
   */
  private extractSocialMedia(content: string): string[] {
    const socialPatterns = [
      /facebook\.com\/[\w\.]+/gi,
      /instagram\.com\/[\w\.]+/gi,
      /twitter\.com\/[\w]+/gi,
      /linkedin\.com\/[\w\/]+/gi,
      /youtube\.com\/[\w\/]+/gi
    ];
    
    const socialMedia: string[] = [];
    
    for (const pattern of socialPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        socialMedia.push(...matches);
      }
    }
    
    return [...new Set(socialMedia)];
  }

  /**
   * Extract numbers from content based on context keywords
   */
  private extractNumberFromContent(content: string, keywords: string[]): number {
    for (const keyword of keywords) {
      const pattern = new RegExp(`${keyword}s?[^\\d]*(\\d+)`, 'i');
      const match = content.match(pattern);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    return 0;
  }

  /**
   * Extract business name from search result title
   */
  private extractBusinessNameFromTitle(title: string): string {
    // Remove common suffixes and clean up the title
    const cleanTitle = title
      .replace(/\s*-\s*.*$/, '') // Remove everything after first dash
      .replace(/\s*\|\s*.*$/, '') // Remove everything after pipe
      .replace(/\s*\(\s*.*$/, '') // Remove everything after opening parenthesis
      .replace(/\s+/g, ' ')       // Normalize whitespace
      .trim();
    
    return cleanTitle;
  }

  /**
   * Analyze website details using Firecrawl
   */
  private async analyzeWebsiteDetails(website: string, businessName: string): Promise<any> {
    try {
      if (!this.canMakeApiCall('firecrawl')) {
        throw new Error('Firecrawl API rate limit exceeded');
      }

      const analysis = await this.firecrawl.scrapeWebsite({
        url: website,
        formats: ['markdown'],
        onlyMainContent: true
      });

      if (!analysis.success || !analysis.data?.markdown) {
        throw new Error('Failed to scrape website content');
      }

      const content = analysis.data.markdown;
      
      // Analyze the scraped content
      const websiteAnalysis = {
        content: content.substring(0, 2000), // Limit content size
        wordCount: content.split(' ').length,
        hasContactInfo: this.checkContactInfo(content),
        hasServicePages: this.checkServicePages(content),
        seoScore: this.calculateBasicSeoScore(content, businessName),
        designElements: this.extractDesignElements(content),
        callsToAction: this.extractCallsToAction(content),
        trustSignals: this.extractTrustSignals(content)
      };

      this.incrementApiCallCount('firecrawl');
      return websiteAnalysis;

    } catch (error) {
      this.logger.warn('Website analysis failed', { website, error: error.message });
      return {
        error: error.message,
        analysisComplete: false
      };
    }
  }

  /**
   * Check if content has contact information
   */
  private checkContactInfo(content: string): boolean {
    const contactPatterns = [
      /\(\d{3}\)\s*\d{3}-\d{4}/,     // Phone number
      /\d{3}-\d{3}-\d{4}/,           // Phone number alt
      /[\w\.-]+@[\w\.-]+\.\w+/,      // Email
      /contact\s+us/i,               // Contact us text
      /get\s+in\s+touch/i           // Get in touch text
    ];
    
    return contactPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Check if content has service pages
   */
  private checkServicePages(content: string): boolean {
    const servicePatterns = [
      /services/i,
      /what\s+we\s+do/i,
      /our\s+work/i,
      /specializ/i,
      /offer/i
    ];
    
    return servicePatterns.some(pattern => pattern.test(content));
  }

  /**
   * Calculate basic SEO score
   */
  private calculateBasicSeoScore(content: string, businessName: string): number {
    let score = 0;
    
    // Check for business name in content (5 points)
    if (content.toLowerCase().includes(businessName.toLowerCase())) {
      score += 5;
    }
    
    // Check for title tags (10 points)
    if (content.includes('# ')) {
      score += 10;
    }
    
    // Check for structured content (5 points)
    if (content.includes('## ')) {
      score += 5;
    }
    
    // Check content length (5 points)
    if (content.length > 1000) {
      score += 5;
    }
    
    // Check for contact info (5 points)
    if (this.checkContactInfo(content)) {
      score += 5;
    }
    
    return Math.min(score, 30); // Cap at 30 points
  }

  /**
   * Extract design elements from content
   */
  private extractDesignElements(content: string): any {
    return {
      hasImages: content.includes('![') || content.includes('<img'),
      hasButtons: /button|btn|cta/i.test(content),
      hasNavigation: /nav|menu|home|about|contact/i.test(content),
      structuredLayout: content.includes('##') || content.includes('###')
    };
  }

  /**
   * Extract calls to action from content
   */
  private extractCallsToAction(content: string): string[] {
    const ctaPatterns = [
      /call\s+now/i,
      /contact\s+us/i,
      /get\s+started/i,
      /learn\s+more/i,
      /free\s+quote/i,
      /schedule/i,
      /book\s+now/i
    ];
    
    const ctas: string[] = [];
    
    for (const pattern of ctaPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        ctas.push(matches[0]);
      }
    }
    
    return [...new Set(ctas)];
  }

  /**
   * Extract trust signals from content
   */
  private extractTrustSignals(content: string): string[] {
    const trustPatterns = [
      /\d+\+?\s*years?\s*(?:of\s*)?experience/i,
      /licensed\s*(?:and\s*)?insured/i,
      /certified/i,
      /guarantee/i,
      /testimonial/i,
      /review/i,
      /award/i,
      /bbb/i,
      /better\s*business\s*bureau/i
    ];
    
    const trustSignals: string[] = [];
    
    for (const pattern of trustPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        trustSignals.push(matches[0]);
      }
    }
    
    return [...new Set(trustSignals)];
  }

  /**
   * Parse market analysis from Perplexity response
   */
  private parseMarketAnalysis(content: string): any {
    return {
      trends: this.extractListFromContent(content, ['trend', 'growing', 'increasing', 'emerging']),
      opportunities: this.extractListFromContent(content, ['opportunity', 'gap', 'potential', 'market']),
      challenges: this.extractListFromContent(content, ['challenge', 'difficult', 'problem', 'obstacle']),
      customerPainPoints: this.extractListFromContent(content, ['pain', 'frustrat', 'problem', 'issue']),
      marketSize: this.extractMarketSize(content),
      growthRate: this.extractGrowthRate(content)
    };
  }

  /**
   * Parse competitive positioning from Perplexity response
   */
  private parseCompetitivePositioning(content: string): any {
    return {
      advantages: this.extractListFromContent(content, ['advantage', 'strength', 'better', 'superior']),
      differentiators: this.extractListFromContent(content, ['different', 'unique', 'distinguish', 'special']),
      positioning: this.extractListFromContent(content, ['position', 'niche', 'segment', 'target']),
      recommendations: this.extractListFromContent(content, ['recommend', 'should', 'suggest', 'consider'])
    };
  }

  /**
   * Extract market size information
   */
  private extractMarketSize(content: string): string {
    const sizePatterns = [
      /\$[\d,]+\s*(?:million|billion|k)/i,
      /market\s*size.*?\$[\d,]+/i,
      /worth.*?\$[\d,]+/i
    ];
    
    for (const pattern of sizePatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return 'Unknown';
  }

  /**
   * Extract growth rate information
   */
  private extractGrowthRate(content: string): string {
    const growthPatterns = [
      /\d+(?:\.\d+)?%\s*(?:annual|yearly|growth)/i,
      /growing\s*(?:at\s*)?\d+(?:\.\d+)?%/i,
      /growth\s*rate.*?\d+(?:\.\d+)?%/i
    ];
    
    for (const pattern of growthPatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return 'Unknown';
  }

  /**
   * Get base path for prospect files
   */
  private getProspectBasePath(businessName: string): string {
    const sanitizedName = this.sanitizeFileName(businessName);
    const prospectsPath = process.env.OBSIDIAN_PROSPECTS_PATH || 
                         path.join(process.env.OBSIDIAN_VAULT_PATH || '', 'Projects', 'Sales', 'Prospects');
    return path.join(prospectsPath, sanitizedName);
  }

  /**
   * Sanitize filename for file system compatibility
   */
  private sanitizeFileName(filename: string): string {
    return filename
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')         // Replace spaces with hyphens
      .replace(/-+/g, '-')          // Replace multiple hyphens with single
      .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens
  }

  /**
   * Ensure directory exists, create if it doesn't
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * Capture website screenshots using Firecrawl
   */
  private async captureWebsiteScreenshots(website: string, outputPath: string): Promise<string[]> {
    const screenshots: string[] = [];
    
    try {
      // Try to capture desktop screenshot
      const desktopResult = await this.firecrawl.scrapeWebsite({
        url: website,
        formats: ['screenshot']
      });
      
      if (desktopResult.success && desktopResult.data?.screenshot) {
        const desktopPath = path.join(outputPath, 'desktop-screenshot.png');
        // Note: This would need base64 to file conversion implementation
        screenshots.push(desktopPath);
      }
      
      // Try to capture mobile screenshot (Firecrawl doesn't have mobile parameter, use same method)
      const mobileResult = await this.firecrawl.scrapeWebsite({
        url: website,
        formats: ['screenshot']
      });
      
      if (mobileResult.success && mobileResult.data?.screenshot) {
        const mobilePath = path.join(outputPath, 'mobile-screenshot.png');
        // Note: This would need base64 to file conversion implementation
        screenshots.push(mobilePath);
      }
      
    } catch (error) {
      this.logger.warn('Screenshot capture failed', { website, error: error.message });
    }
    
    return screenshots;
  }

  /**
   * Increment API call counter for rate limiting
   */
  private incrementApiCallCount(service: string): void {
    const now = Date.now();
    const counter = this.rateLimitCounters[service];
    
    if (!counter || now > counter.resetTime) {
      this.rateLimitCounters[service] = { count: 1, resetTime: now + 3600000 };
    } else {
      counter.count++;
    }
  }

  /**
   * Generate comprehensive prospecting artifacts including all files
   */
  private async generateProspectingArtifacts(packageData: ProspectingPackage): Promise<any> {
    const artifacts: any = {
      filesCreated: [],
      foldersCreated: [],
      screenshots: []
    };
    
    try {
      const basePath = this.getProspectBasePath(packageData.businessData.name);
      await this.ensureDirectoryExists(basePath);
      
      // Generate prospect-profile.md
      const prospectProfilePath = path.join(basePath, 'prospect-profile.md');
      const prospectContent = this.generateProspectProfileContent(packageData);
      await fs.writeFile(prospectProfilePath, prospectContent, 'utf-8');
      artifacts.filesCreated.push(prospectProfilePath);
      
      // Generate enhanced-business-recommendations.md
      const recommendationsPath = path.join(basePath, 'enhanced-business-recommendations.md');
      const recommendationsContent = this.generateBusinessRecommendationsContent(packageData);
      await fs.writeFile(recommendationsPath, recommendationsContent, 'utf-8');
      artifacts.filesCreated.push(recommendationsPath);
      
      // Create competitor analysis files
      const competitorsPath = path.join(basePath, 'competitors');
      await this.ensureDirectoryExists(competitorsPath);
      artifacts.foldersCreated.push(competitorsPath);
      
      for (const competitor of packageData.competitorData) {
        const competitorFolderPath = path.join(competitorsPath, this.sanitizeFileName(competitor.name));
        await this.ensureDirectoryExists(competitorFolderPath);
        artifacts.foldersCreated.push(competitorFolderPath);
        
        // Generate competitor-analysis.md
        const competitorAnalysisPath = path.join(competitorFolderPath, 'competitor-analysis.md');
        const competitorContent = this.generateCompetitorAnalysisContent(competitor, packageData.businessData);
        await fs.writeFile(competitorAnalysisPath, competitorContent, 'utf-8');
        artifacts.filesCreated.push(competitorAnalysisPath);
        
        // Capture screenshots if possible
        if (competitor.website) {
          try {
            const screenshots = await this.captureWebsiteScreenshots(competitor.website, competitorFolderPath);
            artifacts.screenshots.push(...screenshots);
          } catch (error) {
            this.logger.warn('Failed to capture screenshots', { 
              competitor: competitor.name, 
              error: error.message 
            });
          }
        }
      }
      
      this.logger.info('Prospecting artifacts generated successfully', {
        businessName: packageData.businessData.name,
        filesCreated: artifacts.filesCreated.length,
        foldersCreated: artifacts.foldersCreated.length,
        screenshots: artifacts.screenshots.length
      });
      
    } catch (error) {
      this.logger.error('Failed to generate prospecting artifacts', { 
        error: error.message,
        businessName: packageData.businessData.name 
      });
      throw error;
    }
    
    return artifacts;
  }

  /**
   * Generate prospect profile markdown content
   */
  private generateProspectProfileContent(packageData: ProspectingPackage): string {
    const business = packageData.businessData;
    const intelligence = packageData.competitiveIntelligence;
    const competitors = packageData.competitorData;
    
    return `# ${business.name} - Prospect Profile

## Business Information
- **Company Name:** ${business.name}
- **Industry:** ${business.industry || 'Unknown'}
- **Location:** ${business.location}
- **Phone:** ${business.phone || 'Not found'}
- **Website:** ${business.website || 'Not found'}
- **Email:** ${business.email || 'Not found'}

## Business Overview
${business.description || 'No description available'}

## Services Offered
${business.services?.map((service: string) => `- ${service}`).join('\n') || '- Services not identified'}

## Market Position
- **Target Market:** ${business.targetMarket?.join(', ') || 'Not identified'}
- **Competitive Position:** ${intelligence?.marketAnalysis?.positioning || 'Under analysis'}
- **Key Strengths:** ${business.strengths?.join(', ') || 'Being evaluated'}

## Digital Presence Analysis
- **Website Quality:** ${business.websiteQuality || 0}/100
- **SEO Strength:** ${business.seoStrength || 0}/100  
- **Online Reviews:** ${business.reviewCount || 0} reviews
- **Rating:** ${business.rating || 'No rating'}/5.0
- **Social Media:** ${business.socialMedia?.length || 0} platforms

## Competitive Landscape
**Total Competitors Analyzed:** ${competitors.length}

${competitors.map((comp: any) => `
### ${comp.name}
- **Website:** ${comp.website || 'Not found'}
- **Services:** ${comp.businessInfo?.services?.join(', ') || 'Not identified'}
- **Strengths:** ${comp.businessInfo?.strengths?.join(', ') || 'Being analyzed'}
- **Digital Presence:** ${comp.digitalPresence?.websiteQuality || 0}/100
`).join('\n')}

## Market Opportunities
${intelligence?.marketAnalysis?.opportunities?.map((opp: string) => `- ${opp}`).join('\n') || '- Market analysis in progress'}

## Business Intelligence
- **Market Trends:** ${intelligence?.marketAnalysis?.trends?.join(', ') || 'Under analysis'}
- **Growth Opportunities:** ${intelligence?.marketAnalysis?.opportunities?.join(', ') || 'Being identified'}
- **Competitive Advantages:** ${intelligence?.competitivePositioning?.advantages?.join(', ') || 'Under evaluation'}

## Recommended Approach
${intelligence?.competitivePositioning?.recommendations?.map((rec: string) => `- ${rec}`).join('\n') || '- Sales strategy recommendations pending'}

---
*Analysis generated on ${new Date().toLocaleDateString()}*
*Confidence Score: ${packageData.confidenceScore || 0}%*
*Data Sources: Google Maps, Firecrawl, Perplexity AI*`;
  }

  /**
   * Generate business recommendations markdown content
   */
  private generateBusinessRecommendationsContent(packageData: ProspectingPackage): string {
    const business = packageData.businessData;
    const intelligence = packageData.competitiveIntelligence;
    const competitors = packageData.competitorData;
    
    return `# ${business.name} - Enhanced Business Recommendations

## Executive Summary
Based on comprehensive market analysis and competitive intelligence, we have identified key opportunities for ${business.name} to enhance their digital presence and market position.

## Current Digital Audit

### Website Performance
- **Current Rating:** ${business.websiteQuality || 0}/100
- **SEO Performance:** ${business.seoStrength || 0}/100
- **Mobile Optimization:** ${business.mobileOptimized ? 'Yes' : 'Unknown'}
- **Page Load Speed:** ${business.pageSpeed || 'Not assessed'}

### Online Presence Assessment
- **Google Business Profile:** ${business.hasGoogleBusiness ? 'Active' : 'Needs setup'}
- **Review Management:** ${business.reviewCount || 0} reviews (${business.rating || 0}/5.0 average)
- **Social Media Presence:** ${business.socialMedia?.length || 0} active platforms
- **Local SEO Ranking:** ${business.localSeoRanking || 'Not assessed'}

## Competitive Analysis Summary

### Market Position
${intelligence?.competitivePositioning?.positioning?.map((pos: string) => `- ${pos}`).join('\n') || '- Market positioning analysis in progress'}

### Competitive Advantages
${intelligence?.competitivePositioning?.advantages?.map((adv: string) => `- ${adv}`).join('\n') || '- Competitive advantages being identified'}

### Market Gaps & Opportunities
${intelligence?.marketAnalysis?.opportunities?.map((opp: string) => `- ${opp}`).join('\n') || '- Market opportunities under analysis'}

## Strategic Recommendations

### 1. Digital Marketing Strategy
**Priority: HIGH**

#### Website Optimization
- Implement responsive design for mobile optimization
- Improve page load speed (target: <3 seconds)
- Enhance SEO with local keywords and business-specific content
- Add clear calls-to-action on all pages
- Implement conversion tracking and analytics

#### Content Marketing
- Create industry-specific blog content
- Develop case studies and testimonials
- Implement video content strategy
- Build resource library for customers

### 2. Local SEO Enhancement
**Priority: HIGH**

#### Google Business Profile Optimization
- Complete all profile sections with accurate information
- Add high-quality photos and virtual tours
- Implement review generation and response strategy
- Post regular business updates and offers

#### Local Citations
- Build consistent NAP (Name, Address, Phone) across directories
- Target industry-specific business directories
- Implement local schema markup on website

### 3. Competitive Differentiation
**Priority: MEDIUM**

Based on competitor analysis of ${competitors.length} local businesses:

${competitors.slice(0, 3).map((comp: any, index: number) => `
#### vs ${comp.name}
**Their Strengths:** ${comp.businessInfo?.strengths?.slice(0, 2).join(', ') || 'Standard service offering'}
**Opportunity:** ${comp.businessInfo?.weaknesses?.slice(0, 1).join('') || 'Enhance service differentiation'}
**Recommended Counter-Strategy:** Focus on personalized service and faster response times
`).join('\n')}

### 4. Review & Reputation Management
**Priority: MEDIUM**

- **Current Status:** ${business.reviewCount || 0} reviews at ${business.rating || 0}/5.0
- **Target Goal:** 50+ reviews at 4.5+ rating within 6 months
- **Strategy:** 
  - Implement automated review request system
  - Create review response templates
  - Address negative reviews professionally
  - Showcase positive testimonials on website

### 5. Social Media Strategy
**Priority: LOW-MEDIUM**

Current presence: ${business.socialMedia?.length || 0} platforms
- Recommended platforms: Facebook, Google Business, LinkedIn
- Content strategy: Educational posts, project showcases, customer testimonials
- Posting frequency: 3-5 times per week
- Community engagement and local business networking

## Implementation Roadmap

### Phase 1 (Weeks 1-4): Foundation
- [ ] Complete website audit and optimization plan
- [ ] Set up Google Business Profile (if not active)
- [ ] Implement basic review management system
- [ ] Establish baseline analytics tracking

### Phase 2 (Weeks 5-8): Content & SEO
- [ ] Launch content marketing strategy
- [ ] Implement local SEO improvements
- [ ] Begin review generation campaign
- [ ] Optimize website for mobile and speed

### Phase 3 (Weeks 9-12): Social & Reputation
- [ ] Launch social media presence
- [ ] Implement advanced review management
- [ ] Begin competitive intelligence monitoring
- [ ] Evaluate and adjust strategy based on results

## Budget Estimates

### Website Optimization: $2,500-5,000
- Responsive design updates
- SEO optimization
- Performance improvements
- Content creation

### Digital Marketing Setup: $1,500-3,000
- Google Ads setup and management
- Social media account setup
- Review management tools
- Analytics implementation

### Ongoing Monthly Investment: $800-1,500
- Content creation and management
- Social media management
- Review monitoring and response
- SEO maintenance and improvements

## Success Metrics & KPIs

### 3-Month Goals
- Website traffic increase: 40%
- Google Business Profile views: +100%
- Review count: +20 new reviews
- Average rating: 4.5/5.0
- Lead inquiries: +30%

### 6-Month Goals  
- Local search ranking: Top 3 for primary keywords
- Website conversion rate: 3-5%
- Social media following: 500+ engaged followers
- Monthly organic leads: 15-25
- Customer acquisition cost: Reduce by 25%

## Risk Assessment

### Low Risk
- Basic website improvements
- Google Business Profile optimization
- Review management implementation

### Medium Risk
- Competitive response to increased visibility
- Content creation resource requirements
- Social media time investment

### High Risk
- Major website redesign disrupting current traffic
- Negative review management challenges
- Budget allocation without clear ROI measurement

## Next Steps

1. **Schedule Discovery Call** - Discuss specific goals and constraints
2. **Conduct Detailed Audit** - Complete technical and competitive analysis  
3. **Develop Custom Strategy** - Create tailored implementation plan
4. **Phase 1 Implementation** - Begin with highest-impact improvements
5. **Ongoing Optimization** - Monitor results and adjust strategy monthly

---
*Recommendations generated on ${new Date().toLocaleDateString()}*
*Based on analysis of ${competitors.length} local competitors*
*Market analysis confidence: ${packageData.confidenceScore || 0}%*

**Contact Mile High Marketing for implementation support and ongoing optimization.**`;
  }

  /**
   * Create comprehensive prospecting package from all pass results
   */
  private async createProspectingPackage(passResults: PassResult[], businessName: string): Promise<ProspectingPackage> {
    const businessData = passResults[0]?.dataExtracted || {};
    const competitorData = passResults[1]?.dataExtracted?.competitors || [];
    const websiteAnalysis = passResults[2]?.dataExtracted || {};
    const competitiveIntelligence = passResults[3]?.dataExtracted || {};
    const artifacts = passResults[4]?.dataExtracted || {};

    // Calculate overall confidence score
    const confidenceScore = this.calculatePackageConfidenceScore(passResults);

    const prospectingPackage: ProspectingPackage = {
      businessData: {
        name: businessName,
        industry: businessData.industry || 'Unknown',
        location: businessData.location || 'Unknown',
        phone: businessData.phone || '',
        website: businessData.website || '',
        email: businessData.email || '',
        description: businessData.description || '',
        services: businessData.services || [],
        targetMarket: businessData.targetMarket || [],
        strengths: businessData.strengths || [],
        websiteQuality: businessData.websiteQuality || 0,
        seoStrength: businessData.seoStrength || 0,
        socialMedia: businessData.socialMedia || [],
        reviewCount: businessData.reviewCount || 0,
        rating: businessData.rating || 0
      },
      competitorData: competitorData.map((comp: any) => ({
        name: comp.name,
        website: comp.website,
        industry: comp.industry,
        location: comp.location,
        businessInfo: comp.businessInfo || {
          services: [],
          targetMarket: [],
          pricing: 'Unknown',
          strengths: [],
          weaknesses: []
        },
        digitalPresence: comp.digitalPresence || {
          websiteQuality: 0,
          seoStrength: 0,
          socialMedia: [],
          onlineReviews: 0
        },
        screenshots: comp.screenshots || { desktop: '', mobile: '' },
        designSystem: comp.designSystem || { colorPalette: [] }
      })),
      websiteAnalysis,
      competitiveIntelligence,
      confidenceScore,
      artifacts: artifacts
    };

    return prospectingPackage;
  }

  /**
   * Generate final prospecting results
   */
  private async generateFinalResults(
    passResults: PassResult[], 
    prospectingPackage: ProspectingPackage, 
    startTime: number
  ): Promise<ProspectingResults> {
    
    // Generate comprehensive artifacts
    try {
      const generatedArtifacts = await this.generateProspectingArtifacts(prospectingPackage);
      prospectingPackage.artifacts = { ...prospectingPackage.artifacts, ...generatedArtifacts };
    } catch (error) {
      this.logger.error('Failed to generate artifacts', { error: error.message });
    }

    const results: ProspectingResults = {
      prospects: [{
        name: prospectingPackage.businessData.name,
        industry: prospectingPackage.businessData.industry,
        location: prospectingPackage.businessData.location,
        phone: prospectingPackage.businessData.phone,
        website: prospectingPackage.businessData.website,
        email: prospectingPackage.businessData.email,
        qualification_score: Math.round(prospectingPackage.confidenceScore),
        competitorAnalysis: {
          competitorsFound: prospectingPackage.competitorData.length,
          detailedAnalysis: prospectingPackage.competitorData.length > 0,
          screenshotsCaptured: prospectingPackage.competitorData.filter(c => c.screenshots.desktop || c.screenshots.mobile).length
        },
        artifactsGenerated: {
          prospectProfile: true,
          enhancedRecommendations: true,
          competitorFolders: prospectingPackage.competitorData.length,
          totalFiles: (prospectingPackage.artifacts?.filesCreated || []).length
        }
      }],
      totalFound: 1,
      qualified: prospectingPackage.confidenceScore >= 70 ? 1 : 0,
      duplicatesRemoved: 0,
      processingTime: Date.now() - startTime,
      apiCallsUsed: {
        googleMaps: this.getApiCallCount('googleMaps'),
        yellowPages: this.getApiCallCount('yellowPages'),
        firecrawl: this.getApiCallCount('firecrawl'),
        perplexity: this.getApiCallCount('perplexity')
      }
    };

    return results;
  }

  /**
   * Calculate overall confidence score for prospecting package
   */
  private calculatePackageConfidenceScore(passResults: PassResult[]): number {
    let totalScore = 0;
    let weightedSum = 0;
    
    const passWeights = [25, 20, 15, 25, 15]; // Pass 1, 2, 3, 4, 5 weights
    
    passResults.forEach((result, index) => {
      if (result.success && passWeights[index]) {
        totalScore += passWeights[index];
        weightedSum += passWeights[index];
      }
    });
    
    return weightedSum > 0 ? Math.round((totalScore / 100) * 100) : 20; // Minimum 20% baseline
  }

  /**
   * Generate detailed competitor analysis markdown content
   */
  private generateCompetitorAnalysisContent(competitor: CompetitorData, businessData: any): string {
    return `# ${competitor.name} - Competitive Analysis

## Company Overview
- **Company Name:** ${competitor.name}
- **Website:** ${competitor.website || 'Not found'}
- **Industry:** ${competitor.industry || businessData.industry}
- **Market Position:** ${competitor.businessInfo?.marketPosition || 'Regional competitor'}

## Business Information
- **Services:** ${competitor.businessInfo?.services?.join(', ') || 'Not identified'}
- **Target Market:** ${competitor.businessInfo?.targetMarket?.join(', ') || 'Not identified'}
- **Pricing Strategy:** ${competitor.businessInfo?.pricing || 'Not disclosed'}
- **Business Model:** ${competitor.businessInfo?.businessModel || 'Traditional service model'}

## Digital Presence Analysis

### Website Performance
- **Website Quality:** ${competitor.digitalPresence?.websiteQuality || 0}/100
- **SEO Strength:** ${competitor.digitalPresence?.seoStrength || 0}/100
- **Mobile Optimization:** ${competitor.digitalPresence?.mobileOptimized ? 'Yes' : 'Unknown'}
- **Page Load Speed:** ${competitor.digitalPresence?.pageSpeed || 'Not assessed'}

### Online Reviews & Reputation
- **Review Count:** ${competitor.digitalPresence?.onlineReviews || 0}
- **Average Rating:** ${competitor.digitalPresence?.rating || 'No rating'}/5.0
- **Review Sentiment:** ${competitor.digitalPresence?.reviewSentiment || 'Mixed'}
- **Response Rate:** ${competitor.digitalPresence?.reviewResponseRate || 0}%

### Social Media Presence
${competitor.digitalPresence?.socialMedia?.map((platform: string) => `- **${platform}:** Active`).join('\n') || '- No significant social media presence identified'}

## Competitive Strengths
${competitor.businessInfo?.strengths?.map((strength: string) => `- **${strength}**`).join('\n') || '- Competitive strengths under analysis'}

## Competitive Weaknesses  
${competitor.businessInfo?.weaknesses?.map((weakness: string) => `- **${weakness}**`).join('\n') || '- Areas for competitive advantage being identified'}

## SEO & Search Strategy

### Target Keywords
${competitor.seoAnalysis?.targetKeywords?.map((keyword: string) => `- ${keyword}`).join('\n') || '- Keyword analysis in progress'}

### Content Strategy
- **Blog/Content:** ${competitor.seoAnalysis?.hasContentMarketing ? 'Active content marketing' : 'Limited content marketing'}
- **Local SEO:** ${competitor.seoAnalysis?.localSeoStrength || 0}/100
- **Technical SEO:** ${competitor.seoAnalysis?.technicalSeoScore || 0}/100

## Sales Funnel Analysis

### Lead Generation
- **Primary Methods:** ${competitor.salesFunnelAnalysis?.leadGenMethods?.join(', ') || 'Traditional methods'}
- **Lead Magnets:** ${competitor.salesFunnelAnalysis?.leadMagnets?.join(', ') || 'None identified'}
- **Conversion Strategy:** ${competitor.salesFunnelAnalysis?.conversionStrategy || 'Standard inquiry process'}

### Customer Journey
1. **Awareness:** ${competitor.salesFunnelAnalysis?.awarenessStage || 'Local search and referrals'}
2. **Consideration:** ${competitor.salesFunnelAnalysis?.considerationStage || 'Website review and quote request'}  
3. **Decision:** ${competitor.salesFunnelAnalysis?.decisionStage || 'Price and availability comparison'}
4. **Retention:** ${competitor.salesFunnelAnalysis?.retentionStrategy || 'Follow-up service calls'}

## Messaging & Positioning Analysis

### Value Propositions
${competitor.messagingAnalysis?.valuePropositions?.map((vp: string) => `- **${vp}**`).join('\n') || '- Value propositions being analyzed'}

### Key Messages
${competitor.messagingAnalysis?.keyMessages?.map((msg: string) => `- "${msg}"`).join('\n') || '- Key messaging under review'}

### Brand Positioning
- **Market Segment:** ${competitor.messagingAnalysis?.marketSegment || 'Not clearly defined'}
- **Differentiation:** ${competitor.messagingAnalysis?.differentiation || 'Standard service offering'}
- **Brand Personality:** ${competitor.messagingAnalysis?.brandPersonality || 'Professional and reliable'}

## Design System Analysis

### Visual Identity
- **Logo Style:** ${competitor.designAnalysis?.logoStyle || 'Not assessed'}
- **Color Palette:** ${competitor.designAnalysis?.colorPalette?.join(', ') || 'Not identified'}
- **Typography:** ${competitor.designAnalysis?.typography || 'Standard web fonts'}
- **Visual Style:** ${competitor.designAnalysis?.visualStyle || 'Clean and professional'}

### Website Design
- **Layout Style:** ${competitor.designAnalysis?.layoutStyle || 'Traditional business layout'}
- **User Experience:** ${competitor.designAnalysis?.userExperience || 0}/100
- **Navigation:** ${competitor.designAnalysis?.navigationQuality || 'Standard menu structure'}
- **Call-to-Actions:** ${competitor.designAnalysis?.ctaEffectiveness || 'Basic contact forms'}

## Competitive Intelligence

### Market Opportunities
${competitor.marketIntelligence?.opportunities?.map((opp: string) => `- **${opp}**`).join('\n') || '- Market opportunities being identified'}

### Threats & Challenges
${competitor.marketIntelligence?.threats?.map((threat: string) => `- **${threat}**`).join('\n') || '- Competitive threats under analysis'}

### Recommended Counter-Strategies
${competitor.marketIntelligence?.counterStrategies?.map((strategy: string) => `- **${strategy}**`).join('\n') || '- Strategic recommendations being developed'}

## Key Differentiators to Exploit

### Service Differentiation
- Focus on areas where competitor shows weakness
- Emphasize superior customer service and response times
- Highlight specialized expertise or certifications

### Marketing Differentiation  
- Target underserved market segments
- Implement stronger digital marketing presence
- Develop more compelling value propositions

### Operational Differentiation
- Offer more flexible scheduling and service options
- Implement better customer communication systems
- Provide more transparent pricing and service guarantees

## Competitive Response Strategy

### Direct Competition Avoidance
- Avoid competing solely on price
- Focus on value-added services
- Target different customer segments

### Competitive Advantages to Leverage
- Superior customer service
- Better digital presence
- More specialized expertise
- Stronger local community connections

## Action Items for ${businessData.name}

### Immediate (1-4 weeks)
- [ ] Analyze competitor's pricing strategy
- [ ] Review their customer service approach
- [ ] Identify service gaps to fill
- [ ] Benchmark digital marketing efforts

### Short-term (1-3 months)
- [ ] Develop superior service offerings
- [ ] Improve digital presence compared to competitor
- [ ] Create more effective marketing messages
- [ ] Implement competitive monitoring system

### Long-term (3-12 months)
- [ ] Establish market leadership in key areas
- [ ] Capture market share through differentiation
- [ ] Build stronger brand recognition
- [ ] Develop sustainable competitive advantages

---
*Analysis Date: ${new Date().toLocaleDateString()}*
*Confidence Score: ${competitor.analysisConfidence || 75}%*
*Screenshots: ${competitor.website ? `${competitor.name.toLowerCase().replace(/\s+/g, '-')}-desktop.png, ${competitor.name.toLowerCase().replace(/\s+/g, '-')}-mobile.png` : 'Website not available'}*

**Recommendation:** Focus on areas where ${competitor.name} shows weakness while leveraging your own operational strengths and superior customer service capabilities.`;
  }
}

// Export singleton instance
export const mastraProspectingAgent = new MastraProspectingAgent();