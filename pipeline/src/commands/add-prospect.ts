#!/usr/bin/env tsx
/**
 * Streamlined CLI Command for Adding Prospects by Name
 * Usage: npm run add-prospect "Business Name" [industry] [city] [state]
 * Examples:
 *   npm run add-prospect "Farro Italian"
 *   npm run add-prospect "Farro Italian" restaurants
 *   npm run add-prospect "Farro Italian" restaurants Denver CO
 */

import dotenv from 'dotenv';
dotenv.config();

import { Logger } from '../utils/logging';
import { ObsidianProspectSync } from '../utils/obsidian/prospect-sync';
import { ProspectCreationInput, Industry } from '../types/prospect';

interface ProspectInput {
  name: string;
  industry?: Industry;
  city?: string;
  state?: string;
}

class AddProspectCLI {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('AddProspectCLI');
  }

  /**
   * Main CLI entry point
   */
  async run(): Promise<void> {
    try {
      const input = this.parseArguments();
      
      console.log('🎯 Adding prospect to pipeline...\n');
      console.log(`📋 Prospect: ${input.name}`);
      console.log(`🏢 Industry: ${input.industry || 'auto-detect'}`);
      console.log(`📍 Location: ${input.city || 'auto-detect'}, ${input.state || 'auto-detect'}`);
      
      // Check API key availability and prompt user
      await this.checkApiKeysAndPrompt();
      
      console.log('\n' + '='.repeat(60) + '\n');

      // Execute multi-pass prospecting for the specific business
      const startTime = Date.now();
      const prospectData = await this.executeMultiPassProspecting(input);
      const duration = Date.now() - startTime;

      if (!prospectData) {
        console.error('❌ Failed to create prospect - no data found');
        process.exit(1);
      }

      // Display results
      this.displayResults(prospectData, duration);

      // Sync to Obsidian if configured
      if (process.env.OBSIDIAN_VAULT_PATH) {
        await this.syncToObsidian([prospectData]);
      }

      console.log('\n✅ Prospect added successfully!');

    } catch (error: any) {
      console.error('❌ Failed to add prospect:', error.message);
      process.exit(1);
    }
  }

  /**
   * Check API keys and prompt user for fallback options
   */
  private async checkApiKeysAndPrompt(): Promise<void> {
    const hasGoogleMaps = !!(process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_API_KEY);
    const hasFirecrawl = !!(process.env.FIRECRAWL_API_KEY || process.env.FIRE_CRAWK_KEY);
    const hasPerplexity = !!process.env.PERPLEXITY_API_KEY;
    
    console.log('\n🔑 API Key Status:');
    console.log(`   Google Maps: ${hasGoogleMaps ? '✅ Available' : '❌ Missing'}`);
    console.log(`   Firecrawl: ${hasFirecrawl ? '✅ Available' : '❌ Missing'}`);
    console.log(`   Perplexity: ${hasPerplexity ? '✅ Available' : '❌ Missing'}`);
    
    if (!hasGoogleMaps || !hasFirecrawl) {
      console.log('\n⚠️  Warning: Some API keys are missing. This will limit data quality.');
      console.log('   - Without Google Maps: No place details, reviews, or accurate business info');
      console.log('   - Without Firecrawl: No web search verification or website analysis');
      console.log('   - Mock data will be used as fallback');
      
      if (hasGoogleMaps) {
        console.log('\n💡 Suggestion: The Google Maps API key is available, so basic business data should be found.');
      } else {
        console.log('\n💡 Suggestion: Add GOOGLE_API_KEY to .env file for much better results.');
      }
      
      // For demo purposes, continue automatically
      // In production, you might want to prompt the user
      console.log('\n⏳ Continuing with available APIs and mock fallbacks...');
    } else {
      console.log('\n🚀 All primary APIs available - expecting high-quality results!');
    }
  }

  /**
   * Parse command line arguments
   */
  private parseArguments(): ProspectInput {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.error('❌ Business name is required');
      this.showUsage();
      process.exit(1);
    }

    // Remove quotes from business name if present
    let businessName = args[0];
    if (businessName.startsWith('"') && businessName.endsWith('"')) {
      businessName = businessName.slice(1, -1);
    } else if (businessName.startsWith("'") && businessName.endsWith("'")) {
      businessName = businessName.slice(1, -1);
    }

    const input: ProspectInput = {
      name: businessName,
      industry: args[1] as Industry || undefined,
      city: args[2] || undefined,
      state: args[3] || undefined
    };

    return input;
  }

  /**
   * Execute multi-pass prospecting for the specific business
   */
  private async executeMultiPassProspecting(input: ProspectInput): Promise<any> {
    this.logger.info('Starting targeted multi-pass prospecting', { businessName: input.name });

    try {
      // Dynamic import to ensure environment variables are loaded
      const { mastraProspectingAgent } = await import('../agents/mastra/MastraProspectingAgent');
      
      // Create prospect input with intelligent defaults
      const prospectInput = await this.prepareProspectInput(input);
      
      console.log('🔄 Executing 5-pass data collection with AI strategy generation...\n');

      // Execute all passes sequentially
      const passResults = [];
      let aggregatedData: any = {};

      // Pass 1: Google Maps extraction
      console.log('📍 Pass 1: Google Maps API extraction...');
      try {
        const pass1Result = await mastraProspectingAgent.getTools().find(t => t.id === 'executePass1GoogleMaps')?.execute({
          businessName: prospectInput.businessName,
          city: prospectInput.city,
          state: prospectInput.state
        });
        
        if (pass1Result?.success) {
          passResults.push(pass1Result);
          aggregatedData = { ...aggregatedData, ...pass1Result.dataExtracted };
          console.log(`   ✅ Found ${Object.keys(pass1Result.dataExtracted).length} data fields`);
        } else {
          console.log('   ⚠️  No Google Maps data found');
        }
      } catch (error) {
        console.log(`   ❌ Google Maps lookup failed: ${error.message}`);
      }

      // Pass 2: Firecrawl search verification
      console.log('🔍 Pass 2: Web search verification...');
      try {
        const pass2Result = await mastraProspectingAgent.getTools().find(t => t.id === 'executePass2FirecrawlVerification')?.execute({
          businessName: prospectInput.businessName,
          city: prospectInput.city,
          state: prospectInput.state,
          existingData: aggregatedData
        });
        
        if (pass2Result?.success) {
          passResults.push(pass2Result);
          aggregatedData = { ...aggregatedData, ...pass2Result.dataExtracted };
          console.log(`   ✅ Verified and augmented with ${Object.keys(pass2Result.dataExtracted).length} additional fields`);
        } else {
          console.log('   ⚠️  Web search verification incomplete');
        }
      } catch (error) {
        console.log(`   ❌ Web search failed: ${error.message}`);
      }

      // Pass 3: Google Reviews analysis
      console.log('⭐ Pass 3: Reviews and insights analysis...');
      try {
        const pass3Result = await mastraProspectingAgent.getTools().find(t => t.id === 'executePass3ReviewAnalysis')?.execute({
          businessName: prospectInput.businessName,
          city: prospectInput.city,
          state: prospectInput.state,
          placeId: aggregatedData.placeId
        });
        
        if (pass3Result?.success) {
          passResults.push(pass3Result);
          aggregatedData = { ...aggregatedData, ...pass3Result.dataExtracted };
          console.log(`   ✅ Extracted business insights and review analysis`);
        } else {
          console.log('   ⚠️  No reviews data available for analysis');
        }
      } catch (error) {
        console.log(`   ❌ Reviews analysis failed: ${error.message}`);
      }

      // Pass 4: Additional sources
      console.log('🕵️ Pass 4: Additional data sources...');
      try {
        const pass4Result = await mastraProspectingAgent.getTools().find(t => t.id === 'executePass4AdditionalSources')?.execute({
          businessName: prospectInput.businessName,
          city: prospectInput.city,
          state: prospectInput.state,
          website: aggregatedData.website
        });
        
        if (pass4Result?.success) {
          passResults.push(pass4Result);
          aggregatedData = { ...aggregatedData, ...pass4Result.dataExtracted };
          console.log(`   ✅ Augmented with additional source data`);
        } else {
          console.log('   ⚠️  Additional sources not accessible');
        }
      } catch (error) {
        console.log(`   ❌ Additional sources failed: ${error.message}`);
      }

      // Pass 5: AI Marketing Strategy Generation
      console.log('🧠 Pass 5: AI marketing strategy generation...');
      try {
        const pass5Result = await mastraProspectingAgent.getTools().find(t => t.id === 'executePass5MarketingStrategy')?.execute({
          businessName: prospectInput.businessName,
          industry: prospectInput.industry,
          city: prospectInput.city,
          state: prospectInput.state,
          aggregatedData: aggregatedData,
          businessInsights: aggregatedData.businessInsights
        });
        
        if (pass5Result?.success) {
          passResults.push(pass5Result);
          aggregatedData = { ...aggregatedData, ...pass5Result.dataExtracted };
          console.log(`   ✅ Generated comprehensive marketing strategy`);
        } else {
          console.log('   ⚠️  Marketing strategy generation not available');
        }
      } catch (error) {
        console.log(`   ❌ Marketing strategy generation failed: ${error.message}`);
      }

      // Calculate confidence scores
      console.log('📊 Calculating confidence scores...');
      try {
        const confidenceResult = await mastraProspectingAgent.getTools().find(t => t.id === 'calculateConfidenceScores')?.execute({
          passResults,
          prospectData: aggregatedData
        });
        
        if (confidenceResult) {
          aggregatedData.confidence = confidenceResult;
          console.log(`   ✅ Overall confidence: ${confidenceResult.overallConfidence}%`);
        }
      } catch (error) {
        console.log(`   ❌ Confidence calculation failed: ${error.message}`);
      }

      // Create final prospect structure
      const prospect = await this.buildProspectFromData(prospectInput, aggregatedData, passResults);
      
      this.logger.info('Multi-pass prospecting completed', {
        businessName: input.name,
        passesExecuted: passResults.length,
        overallConfidence: prospect.overallConfidence
      });

      return prospect;

    } catch (error) {
      this.logger.error('Multi-pass prospecting failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Prepare prospect input with intelligent defaults
   */
  private async prepareProspectInput(input: ProspectInput): Promise<ProspectCreationInput> {
    // Auto-detect industry if not provided
    let industry = input.industry;
    if (!industry) {
      industry = this.detectIndustryFromName(input.name);
      console.log(`🤖 Auto-detected industry: ${industry}`);
    }

    // Default location if not provided (assuming Denver, CO for this use case)
    const city = input.city || 'Denver';
    const state = input.state || 'CO';
    
    if (!input.city || !input.state) {
      console.log(`📍 Using default location: ${city}, ${state}`);
    }

    return {
      businessName: input.name,
      industry,
      city,
      state
    };
  }

  /**
   * Auto-detect industry from business name
   */
  private detectIndustryFromName(businessName: string): Industry {
    const name = businessName.toLowerCase();
    
    // Restaurant indicators
    if (name.includes('restaurant') || name.includes('cafe') || name.includes('coffee') || 
        name.includes('pizza') || name.includes('italian') || name.includes('mexican') ||
        name.includes('bar') || name.includes('grill') || name.includes('bistro') ||
        name.includes('deli') || name.includes('bakery') || name.includes('farro')) {
      return 'restaurants';
    }
    
    // Retail indicators
    if (name.includes('store') || name.includes('shop') || name.includes('market') ||
        name.includes('boutique') || name.includes('retail')) {
      return 'retail';
    }
    
    // Professional services indicators
    if (name.includes('law') || name.includes('legal') || name.includes('consulting') ||
        name.includes('accounting') || name.includes('financial')) {
      return 'professional_services';
    }
    
    // Healthcare indicators
    if (name.includes('dental') || name.includes('medical') || name.includes('clinic') ||
        name.includes('health') || name.includes('therapy')) {
      return 'healthcare';
    }
    
    // Home services indicators
    if (name.includes('plumbing') || name.includes('electric') || name.includes('hvac') ||
        name.includes('cleaning') || name.includes('landscaping')) {
      return 'home_services';
    }
    
    // Default to restaurants for ambiguous cases
    return 'restaurants';
  }

  /**
   * Build final prospect structure from collected data
   */
  private async buildProspectFromData(input: ProspectCreationInput, data: any, passResults: any[]): Promise<any> {
    const prospect = {
      id: `prospect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created: new Date(),
      updated: new Date(),
      tags: ['prospect', 'multi-pass', input.industry],
      
      business: {
        name: data.name || input.businessName,
        industry: input.industry,
        location: {
          city: data.city || input.city,
          state: data.state || input.state,
          zipCode: data.zipCode,
          address: data.address
        },
        size: {
          category: this.estimateBusinessSize(data),
          employeeCount: data.employeeCount,
          estimatedRevenue: data.estimatedRevenue
        },
        digitalPresence: {
          hasWebsite: !!data.website,
          hasGoogleBusiness: !!data.placeId,
          hasSocialMedia: !!(data.socialProfiles && Object.keys(data.socialProfiles).length > 0),
          hasOnlineReviews: !!data.userRatingsTotal
        }
      },
      
      contact: {
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        primaryContact: data.primaryContact,
        decisionMaker: data.decisionMaker
      },
      
      pipelineStage: 'cold' as const,
      
      qualificationScore: {
        total: this.calculateQualificationScore(data),
        breakdown: {
          businessSize: this.scoreBusinessSize(data),
          digitalPresence: this.scoreDigitalPresence(data),
          competitorGaps: 10, // Default
          location: this.scoreLocation(data, input),
          industry: this.scoreIndustry(input.industry),
          revenueIndicators: this.scoreRevenueIndicators(data)
        },
        lastUpdated: new Date()
      },
      
      // Multi-pass specific data
      dataConfidence: this.extractConfidenceData(passResults),
      dataSources: this.extractDataSources(passResults),
      overallConfidence: data.confidence?.overallConfidence || this.calculateOverallConfidence(passResults),
      
      businessInsights: {
        ownerInformation: data.ownerInformation,
        operationalSOPs: data.operationalSOPs || [],
        customerFeedbackTrends: data.customerFeedbackTrends || [],
        competitiveAdvantages: data.competitiveAdvantages || [],
        painPoints: data.painPoints || [],
        businessChallenges: data.businessChallenges || []
      },
      
      marketingStrategy: data.marketingStrategy,
      
      interactions: [],
      
      obsidianMeta: {
        templateUsed: 'multi-pass-prospect',
        lastSyncDate: new Date()
      }
    };

    return prospect;
  }

  /**
   * Display comprehensive results
   */
  private displayResults(prospect: any, duration: number): void {
    console.log('\n🎯 Prospect Added Successfully\n');
    console.log(`📋 Business: ${prospect.business.name}`);
    console.log(`🏢 Industry: ${prospect.business.industry}`);
    console.log(`📍 Location: ${prospect.business.location.city}, ${prospect.business.location.state}`);
    console.log(`⏱️  Processing Time: ${(duration/1000).toFixed(2)}s`);
    console.log(`🏆 Qualification Score: ${prospect.qualificationScore.total}/100`);
    console.log(`📊 Overall Confidence: ${prospect.overallConfidence}%`);
    
    console.log('\n📞 Contact Information:');
    console.log(`  • Phone: ${prospect.contact.phone || 'Not found'}`);
    console.log(`  • Email: ${prospect.contact.email || 'Not found'}`);
    console.log(`  • Website: ${prospect.contact.website || 'Not found'}`);
    
    console.log('\n🏢 Business Profile:');
    console.log(`  • Size: ${prospect.business.size.category}`);
    console.log(`  • Has Website: ${prospect.business.digitalPresence.hasWebsite ? 'Yes' : 'No'}`);
    console.log(`  • Google Business: ${prospect.business.digitalPresence.hasGoogleBusiness ? 'Yes' : 'No'}`);
    console.log(`  • Online Reviews: ${prospect.business.digitalPresence.hasOnlineReviews ? 'Yes' : 'No'}`);
    
    if (prospect.businessInsights && (prospect.businessInsights.painPoints.length > 0 || prospect.businessInsights.competitiveAdvantages.length > 0)) {
      console.log('\n💡 Business Insights:');
      if (prospect.businessInsights.competitiveAdvantages.length > 0) {
        console.log(`  • Advantages: ${prospect.businessInsights.competitiveAdvantages.slice(0, 2).join(', ')}`);
      }
      if (prospect.businessInsights.painPoints.length > 0) {
        console.log(`  • Pain Points: ${prospect.businessInsights.painPoints.slice(0, 2).join(', ')}`);
      }
    }
    
    if (prospect.marketingStrategy) {
      console.log('\n🚀 Marketing Strategy:');
      console.log(`  • Priority Level: ${prospect.marketingStrategy.digitalMarketingPlan?.priorityLevel?.toUpperCase() || 'PENDING'}`);
      console.log(`  • Budget Range: ${prospect.marketingStrategy.digitalMarketingPlan?.estimatedBudget || 'Analysis pending'}`);
      console.log(`  • Expected ROI: ${prospect.marketingStrategy.digitalMarketingPlan?.expectedROI || 'Calculating'}`);
      
      const highPriorityStrategies = prospect.marketingStrategy.digitalMarketingPlan?.strategies?.filter(s => s.priority === 'high') || [];
      if (highPriorityStrategies.length > 0) {
        console.log(`  • Top Recommendations: ${highPriorityStrategies.slice(0, 2).map(s => s.name).join(', ')}`);
      }
    }
    
    console.log('\n📊 Data Sources:');
    const sources = Object.keys(prospect.dataSources || {});
    if (sources.length > 0) {
      sources.forEach(source => console.log(`  • ${source.charAt(0).toUpperCase() + source.slice(1)}`));
    } else {
      console.log('  • Basic extraction (API keys needed for full sources)');
    }
  }

  /**
   * Sync prospect to Obsidian vault
   */
  private async syncToObsidian(prospects: any[]): Promise<void> {
    try {
      const vaultPath = process.env.OBSIDIAN_VAULT_PATH;
      if (!vaultPath) {
        console.log('\n⚠️  OBSIDIAN_VAULT_PATH not configured, skipping Obsidian sync');
        return;
      }

      console.log('\n📝 Syncing to Obsidian...');
      
      const obsidianSync = new ObsidianProspectSync(vaultPath);
      await obsidianSync.syncProspects(prospects, {
        createDailyNote: true,
        updateKanban: true,
        generateAnalytics: true
      });

      console.log('✅ Successfully synced to Obsidian vault');
      console.log(`📁 Vault location: ${vaultPath}`);

    } catch (error: any) {
      console.error('❌ Failed to sync to Obsidian:', error.message);
    }
  }

  /**
   * Show usage instructions
   */
  private showUsage(): void {
    console.log(`
🎯 Add Prospect - Manual Prospect Addition Tool

Usage: npm run add-prospect "Business Name" [industry] [city] [state]

Examples:
  npm run add-prospect "Farro Italian"                           # Auto-detect industry and location
  npm run add-prospect "Farro Italian" restaurants               # Specify industry
  npm run add-prospect "Farro Italian" restaurants Denver CO     # Full specification

Supported Industries:
  restaurants, retail, professional_services, healthcare, 
  real_estate, automotive, home_services, fitness, 
  beauty_salons, legal_services

Features:
  ✅ 5-pass data collection (Google Maps, Web Search, Reviews, Additional Sources, AI Marketing Strategy)
  ✅ Confidence scoring with cross-verification
  ✅ Business insights extraction from reviews
  ✅ AI-powered marketing strategy generation
  ✅ Industry research and competitive analysis
  ✅ Auto-detection of industry and location
  ✅ Obsidian vault integration
  ✅ Comprehensive prospect profiling
    `);
  }

  // Helper scoring methods
  private estimateBusinessSize(data: any): 'micro' | 'small' | 'medium' {
    if (data.employeeCount) {
      if (data.employeeCount < 10) return 'micro';
      if (data.employeeCount < 50) return 'small';
      return 'medium';
    }
    // Default assumption for restaurants/small businesses
    return 'small';
  }

  private calculateQualificationScore(data: any): number {
    return this.scoreBusinessSize(data) + 
           this.scoreDigitalPresence(data) + 
           10 + // competitorGaps default
           this.scoreLocation(data, null) + 
           this.scoreIndustry('restaurants') + 
           this.scoreRevenueIndicators(data);
  }

  private scoreBusinessSize(data: any): number {
    if (data.employeeCount && data.employeeCount > 5) return 15;
    if (data.userRatingsTotal && data.userRatingsTotal > 50) return 12;
    return 8;
  }

  private scoreDigitalPresence(data: any): number {
    let score = 0;
    if (data.website) score += 8;
    if (data.placeId) score += 7;
    if (data.userRatingsTotal && data.userRatingsTotal > 0) score += 5;
    if (data.rating && data.rating > 4.0) score += 5;
    return Math.min(score, 25);
  }

  private scoreLocation(data: any, input: any): number {
    // Denver area gets higher score for local targeting
    if (data.city === 'Denver' || input?.city === 'Denver') return 12;
    if (data.state === 'CO' || input?.state === 'CO') return 10;
    return 8;
  }

  private scoreIndustry(industry: string): number {
    // Restaurants are high-priority for digital marketing
    if (industry === 'restaurants') return 8;
    if (industry === 'retail') return 7;
    if (industry === 'professional_services') return 6;
    return 5;
  }

  private scoreRevenueIndicators(data: any): number {
    if (data.priceLevel && data.priceLevel > 2) return 8;
    if (data.userRatingsTotal && data.userRatingsTotal > 100) return 6;
    return 4;
  }

  private extractConfidenceData(passResults: any[]): any[] {
    const confidenceData = [];
    for (const result of passResults) {
      if (result.confidenceUpdates) {
        confidenceData.push(...result.confidenceUpdates);
      }
    }
    return confidenceData;
  }

  private extractDataSources(passResults: any[]): any {
    const sources: any = {};
    for (const result of passResults) {
      if (result.sourcesUsed) {
        for (const source of result.sourcesUsed) {
          sources[source] = {
            lastUpdated: new Date(),
            passNumber: result.passNumber
          };
        }
      }
    }
    return sources;
  }

  private calculateOverallConfidence(passResults: any[]): number {
    if (passResults.length === 0) return 0;
    
    const successfulPasses = passResults.filter(p => p.success).length;
    const baseConfidence = (successfulPasses / 4) * 70; // 70% max from pass success
    
    // Bonus for data richness
    const totalDataFields = passResults.reduce((sum, p) => sum + Object.keys(p.dataExtracted || {}).length, 0);
    const dataBonus = Math.min(totalDataFields * 2, 30); // Up to 30% bonus
    
    return Math.min(Math.round(baseConfidence + dataBonus), 95);
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new AddProspectCLI();
  cli.run().catch(error => {
    console.error('\n❌ CLI Error:', error.message);
    process.exit(1);
  });
}

export { AddProspectCLI };