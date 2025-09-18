#!/usr/bin/env node
/**
 * CLI Command for Adding a Single Business by Name
 * Usage: npm run add-business -- --name="Business Name" --industry="restaurants" --city="Denver" --state="CO"
 */

// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import { mastraProspectingAgent } from '../agents/mastra/MastraProspectingAgent';
import { Logger } from '../utils/logging';
import { ObsidianProspectSync } from '../utils/obsidian/prospect-sync';
import { ProspectCreationInput } from '../types/prospect';
import fs from 'fs';
import path from 'path';

interface BusinessInput {
  name: string;
  industry: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  email?: string;
}

interface CLIArgs {
  name: string;
  industry: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  email?: string;
  verbose?: boolean;
  syncObsidian?: boolean;
}

class AddBusinessCLI {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('AddBusinessCLI');
  }

  /**
   * Main CLI entry point
   */
  async run(): Promise<void> {
    try {
      const args = this.parseArguments();
      
      if (args.verbose) {
        console.log('🏢 Adding business to prospecting pipeline...\n');
        console.log('Business Details:', {
          name: args.name,
          industry: args.industry,
          location: args.city && args.state ? `${args.city}, ${args.state}` : 'Not specified',
          hasPhone: !!args.phone,
          hasWebsite: !!args.website,  
          hasEmail: !!args.email
        });
        console.log('\n' + '='.repeat(60) + '\n');
      }

      // Create prospect input from business details
      const prospectInput = this.createProspectInput(args);
      
      // Process through prospecting pipeline
      const startTime = Date.now();
      const enrichedProspect = await this.enrichBusinessDetails(prospectInput);
      const duration = Date.now() - startTime;

      if (!enrichedProspect) {
        console.error('❌ Failed to create viable prospect from business details');
        process.exit(1);
      }

      // Display results
      this.displayResults(enrichedProspect, duration, args);

      // Sync to Obsidian if enabled
      if (args.syncObsidian !== false && process.env.OBSIDIAN_VAULT_PATH) {
        await this.syncToObsidian([enrichedProspect.prospect]);
      }

    } catch (error: any) {
      console.error('❌ Failed to add business:', error.message);
      process.exit(1);
    }
  }

  /**
   * Parse command line arguments
   */
  private parseArguments(): CLIArgs {
    const args = process.argv.slice(2);
    const parsed: Partial<CLIArgs> = {};

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg.startsWith('--')) {
        let key: string;
        let value: string | undefined;
        
        // Handle --key=value format
        if (arg.includes('=')) {
          [key, value] = arg.substring(2).split('=', 2);
          // Remove quotes if present
          if (value && (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
        } 
        // Handle --key value format (next argument is the value)
        else {
          key = arg.substring(2);
          if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
            value = args[i + 1];
            // Remove quotes if present
            if (value && (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            i++; // Skip the next argument since we used it as a value
          }
        }
        
        switch (key) {
          case 'name':
            parsed.name = value;
            break;
          case 'industry':
            parsed.industry = value;
            break;
          case 'city':
            parsed.city = value;
            break;
          case 'state':
            parsed.state = value;
            break;
          case 'phone':
            parsed.phone = value;
            break;
          case 'website':
            parsed.website = value;
            break;
          case 'email':
            parsed.email = value;
            break;
          case 'verbose':
            parsed.verbose = true;
            break;
          case 'sync-obsidian':
            parsed.syncObsidian = value !== 'false';
            break;
        }
      }
    }

    // Validate required arguments
    if (!parsed.name || !parsed.industry) {
      console.error('❌ Missing required arguments: --name, --industry');
      console.log('\nUsage Examples:');
      console.log('  npm run add-business -- --name="Acme Restaurant" --industry="restaurants"');
      console.log('  npm run add-business -- --name="Denver Plumbing Co" --industry="home_services" --city="Denver" --state="CO"');
      console.log('  npm run add-business -- --name="Tech Startup Inc" --industry="professional_services" --website="https://techstartup.com"');
      console.log('\nRequired Options:');
      console.log('  --name NAME           Business name (use quotes for multi-word names)');
      console.log('  --industry INDUSTRY   Business industry category');
      console.log('\nOptional:');
      console.log('  --city CITY           Business city');
      console.log('  --state STATE         Business state (2-letter code)');
      console.log('  --phone PHONE         Business phone number');
      console.log('  --website URL         Business website URL');
      console.log('  --email EMAIL         Business email address');
      console.log('  --verbose             Show detailed progress');
      console.log('  --sync-obsidian BOOL  Sync results to Obsidian vault (default: true)');
      console.log('\nIndustry Options:');
      console.log('  restaurants, retail, professional_services, healthcare, real_estate,');
      console.log('  automotive, home_services, fitness, beauty_salons, legal_services');
      process.exit(1);
    }

    return parsed as CLIArgs;
  }

  /**
   * Create prospect input from business details
   */
  private createProspectInput(args: CLIArgs): ProspectCreationInput {
    // If no city provided but state is CO, default to Denver for better search results
    let city = args.city;
    if (!city && args.state === 'CO') {
      city = 'Denver'; // Default to Denver for Colorado searches
      console.log('🔍 No city specified, defaulting to Denver, CO for search');
    }

    return {
      businessName: args.name,
      industry: args.industry as any,
      city: city || 'Unknown',
      state: args.state || 'Unknown',
      phone: args.phone,
      website: args.website,
      email: args.email
    };
  }

  /**
   * Enrich business details through multi-pass prospecting pipeline
   */
  private async enrichBusinessDetails(prospectInput: ProspectCreationInput): Promise<any | null> {
    try {
      this.logger.info('Starting multi-pass enrichment pipeline', {
        businessName: prospectInput.businessName,
        industry: prospectInput.industry
      });

      // Create a results object to track API usage across all passes
      const totalResults = {
        prospects: [],
        totalFound: 1,
        qualified: 0,
        duplicatesRemoved: 0,
        processingTime: 0,
        apiCallsUsed: {
          googleMaps: 0,
          yellowPages: 0,
          firecrawl: 0,
          perplexity: 0
        }
      };

      let enrichedProspect: any = null;
      const maxPasses = 3;

      for (let pass = 1; pass <= maxPasses; pass++) {
        console.log(`\n🔄 Pass ${pass}/${maxPasses}: ${this.getPassDescription(pass)}`);
        
        const passResults = {
          prospects: [],
          totalFound: 1,
          qualified: 0,
          duplicatesRemoved: 0,
          processingTime: 0,
          apiCallsUsed: {
            googleMaps: 0,
            yellowPages: 0,
            firecrawl: 0,
            perplexity: 0
          }
        };

        // Different strategy per pass
        let passInput = prospectInput;
        if (enrichedProspect) {
          // Use enriched data from previous pass
          passInput = this.convertProspectToInput(enrichedProspect.prospect);
        }

        const passEnriched = await this.performEnrichmentPass(passInput, passResults, pass);
        
        // Accumulate API usage
        Object.keys(totalResults.apiCallsUsed).forEach(key => {
          totalResults.apiCallsUsed[key] += passResults.apiCallsUsed[key];
        });

        if (passEnriched && passEnriched.length > 0) {
          enrichedProspect = {
            prospect: passEnriched[0],
            apiUsage: totalResults.apiCallsUsed
          };

          const completeness = this.calculateCompleteness(passEnriched[0]);
          console.log(`✅ Pass ${pass} completed - Data completeness: ${completeness.percentage}%`);
          console.log(`   Missing: ${completeness.missing.join(', ') || 'None'}`);

          // If we have good enough data, we can stop early
          if (completeness.percentage >= 80) {
            console.log(`🎯 High data completeness achieved, stopping early`);
            break;
          }
        } else {
          console.log(`⚠️  Pass ${pass} yielded no results`);
        }
      }

      if (!enrichedProspect) {
        this.logger.warn('No viable prospect created after all enrichment passes', {
          businessName: prospectInput.businessName
        });
        return null;
      }

      this.logger.info('Multi-pass enrichment completed', {
        businessName: enrichedProspect.prospect.business.name,
        qualificationScore: enrichedProspect.prospect.qualificationScore.total,
        totalApiCalls: Object.values(totalResults.apiCallsUsed).reduce((sum, calls) => sum + calls, 0)
      });

      return enrichedProspect;

    } catch (error: any) {
      this.logger.error('Multi-pass enrichment failed', {
        businessName: prospectInput.businessName,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get description for each pass
   */
  private getPassDescription(pass: number): string {
    switch (pass) {
      case 1: return 'Google Maps lookup + basic enrichment';
      case 2: return 'Targeted Google search + Firecrawl analysis';
      case 3: return 'Deep enrichment + Secretary of State lookup';
      default: return 'Additional enrichment';
    }
  }

  /**
   * Perform a specific enrichment pass with different strategies
   */
  private async performEnrichmentPass(
    prospectInput: ProspectCreationInput, 
    results: any, 
    pass: number
  ): Promise<any[]> {
    // Use the new multi-pass agent approach
    switch (pass) {
      case 1:
        // Pass 1: Google Maps extraction
        const pass1Result = await mastraProspectingAgent.getTools()[0].execute({
          businessName: prospectInput.businessName,
          city: prospectInput.city,
          state: prospectInput.state
        });
        return pass1Result ? [this.convertPassResultToProspect(pass1Result, prospectInput)] : [];
      
      case 2:
        // Pass 2: Firecrawl verification
        const pass2Result = await mastraProspectingAgent.getTools()[1].execute({
          businessName: prospectInput.businessName,
          city: prospectInput.city,
          state: prospectInput.state,
          existingData: results
        });
        return pass2Result ? [this.convertPassResultToProspect(pass2Result, prospectInput)] : [];
      
      case 3:
        // Pass 3: Reviews analysis
        const pass3Result = await mastraProspectingAgent.getTools()[2].execute({
          businessName: prospectInput.businessName,
          city: prospectInput.city,
          state: prospectInput.state,
          placeId: results.placeId
        });
        return pass3Result ? [this.convertPassResultToProspect(pass3Result, prospectInput)] : [];
      
      default:
        return [];
    }
  }

  /**
   * Convert pass result to prospect format
   */
  private convertPassResultToProspect(passResult: any, input: ProspectCreationInput): any {
    // Convert the pass result into a prospect-like structure
    return {
      business: {
        name: passResult.dataExtracted?.name || input.businessName,
        industry: input.industry,
        location: {
          city: input.city,
          state: input.state
        },
        size: {
          category: 'small' // Default assumption
        },
        digitalPresence: {
          hasWebsite: !!passResult.dataExtracted?.website,
          hasGoogleBusiness: !!passResult.dataExtracted?.placeId,
          hasSocialMedia: false,
          hasOnlineReviews: !!passResult.dataExtracted?.userRatingsTotal
        }
      },
      contact: {
        phone: passResult.dataExtracted?.phone || '',
        email: '',
        website: passResult.dataExtracted?.website || ''
      },
      qualificationScore: {
        total: 50, // Default score
        breakdown: {
          businessSize: 10,
          digitalPresence: 15,
          competitorGaps: 10,
          location: 8,
          industry: 5,
          revenueIndicators: 2
        },
        lastUpdated: new Date()
      },
      dataConfidence: passResult.confidenceUpdates || [],
      overallConfidence: passResult.success ? 70 : 30
    };
  }

  /**
   * Perform deep enrichment for Pass 3 - now handled by multi-pass agent
   */
  private async performDeepEnrichment(prospectInput: ProspectCreationInput, results: any): Promise<any[]> {
    console.log(`   🕵️ Performing deep enrichment with all sources`);
    
    // Use Pass 4: Additional sources tool from the multi-pass agent
    const pass4Result = await mastraProspectingAgent.getTools()[3].execute({
      businessName: prospectInput.businessName,
      city: prospectInput.city,
      state: prospectInput.state,
      website: results.website
    });
    
    return pass4Result ? [this.convertPassResultToProspect(pass4Result, prospectInput)] : [];
  }

  /**
   * Convert enriched prospect back to input format for next pass
   */
  private convertProspectToInput(prospect: any): ProspectCreationInput {
    return {
      businessName: prospect.business.name,
      industry: prospect.business.industry,
      city: prospect.business.location.city,
      state: prospect.business.location.state,
      phone: prospect.contact.phone,
      website: prospect.contact.website,
      email: prospect.contact.email
    };
  }

  /**
   * Calculate data completeness percentage
   */
  private calculateCompleteness(prospect: any): { percentage: number; missing: string[] } {
    const fields = [
      { name: 'phone', value: prospect.contact.phone },
      { name: 'website', value: prospect.contact.website },
      { name: 'email', value: prospect.contact.email },
      { name: 'city', value: prospect.business.location.city },
      { name: 'state', value: prospect.business.location.state }
    ];

    const totalFields = fields.length;
    const completedFields = fields.filter(field => field.value && field.value !== 'Unknown').length;
    const missing = fields.filter(field => !field.value || field.value === 'Unknown').map(field => field.name);

    return {
      percentage: Math.round((completedFields / totalFields) * 100),
      missing
    };
  }

  /**
   * Display enrichment results
   */
  private displayResults(result: any, duration: number, args: CLIArgs): void {
    const { prospect, apiUsage } = result;
    
    console.log('🎯 Business Added Successfully\n');
    console.log(`📍 Business: ${prospect.business.name}`);
    console.log(`🏢 Industry: ${prospect.business.industry}`);
    console.log(`📍 Location: ${prospect.business.location.city}, ${prospect.business.location.state}`);
    console.log(`⏱️  Processing Time: ${(duration/1000).toFixed(2)}s`);
    console.log(`🏆 Qualification Score: ${prospect.qualificationScore.total}/100`);
    
    console.log('\n📊 API Usage:');
    console.log(`  • Google Maps: ${apiUsage.googleMaps} calls`);
    console.log(`  • Yellow Pages: ${apiUsage.yellowPages} calls`);
    console.log(`  • Firecrawl: ${apiUsage.firecrawl} calls`);
    console.log(`  • Perplexity: ${apiUsage.perplexity} calls`);
    
    console.log('\n📞 Contact Information:');
    console.log(`  • Phone: ${prospect.contact.phone || 'Not found'}`);
    console.log(`  • Email: ${prospect.contact.email || 'Not found'}`);
    console.log(`  • Website: ${prospect.contact.website || 'Not found'}`);
    
    if (args.verbose) {
      console.log('\n📊 Qualification Score Breakdown:');
      console.log(`  • Business Size: ${prospect.qualificationScore.breakdown.businessSize}/20`);
      console.log(`  • Digital Presence: ${prospect.qualificationScore.breakdown.digitalPresence}/25`);
      console.log(`  • Location: ${prospect.qualificationScore.breakdown.location}/15`);
      console.log(`  • Industry: ${prospect.qualificationScore.breakdown.industry}/10`);
      console.log(`  • Revenue Indicators: ${prospect.qualificationScore.breakdown.revenueIndicators}/10`);
      console.log(`  • Competitor Gaps: ${prospect.qualificationScore.breakdown.competitorGaps}/20`);
      
      console.log('\n🏢 Business Details:');
      console.log(`  • Size Category: ${prospect.business.size.category}`);
      console.log(`  • Employee Count: ${prospect.business.size.employeeCount || 'Unknown'}`);
      console.log(`  • Estimated Revenue: $${prospect.business.size.estimatedRevenue?.toLocaleString() || 'Unknown'}`);
      console.log(`  • Has Website: ${prospect.business.digitalPresence.hasWebsite ? 'Yes' : 'No'}`);
      console.log(`  • Pipeline Stage: ${prospect.pipelineStage}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`✨ Business "${prospect.business.name}" successfully added and enriched!`);
  }

  /**
   * Sync prospect to Obsidian vault
   */
  private async syncToObsidian(prospects: any[]): Promise<void> {
    try {
      const vaultPath = process.env.OBSIDIAN_VAULT_PATH;
      if (!vaultPath) {
        console.log('⚠️  OBSIDIAN_VAULT_PATH not configured, skipping Obsidian sync');
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
      console.log(`📊 Check your daily note and analytics dashboard for updates`);

    } catch (error: any) {
      console.error('❌ Failed to sync to Obsidian:', error.message);
      console.log('💡 Make sure OBSIDIAN_VAULT_PATH is correctly set in your .env file');
    }
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new AddBusinessCLI();
  cli.run().catch(error => {
    console.error('❌ CLI Error:', error);
    process.exit(1);
  });
}

export { AddBusinessCLI };