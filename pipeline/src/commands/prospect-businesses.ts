#!/usr/bin/env node
/**
 * CLI Command for Testing Prospecting Agent
 * Usage: npm run prospect -- --city="Denver" --state="CO" --radius=25 --industry="restaurants"
 */

// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import { ProspectingAgent, GeographicFilter } from '../agents/prospecting-agent';
import { Logger } from '../utils/logging';
import { ProspectValidator } from '../utils/validation/prospect-validation';
import { ObsidianProspectSync } from '../utils/obsidian/prospect-sync';
import fs from 'fs';
import path from 'path';

interface CLIArgs {
  city: string;
  state: string;
  radius: number;
  industry?: string;
  maxResults?: number;
  output?: string;
  format?: 'json' | 'csv' | 'markdown';
  verbose?: boolean;
  syncObsidian?: boolean;
}

class ProspectingCLI {
  private logger: Logger;
  private agent: ProspectingAgent;
  private validator: ProspectValidator;

  constructor() {
    this.logger = new Logger('ProspectingCLI');
    
    // Load configuration
    const configPath = path.join(__dirname, '../../config/agents/prospecting.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    this.agent = new ProspectingAgent(config);
    this.validator = new ProspectValidator();
  }

  /**
   * Main CLI entry point
   */
  async run(): Promise<void> {
    try {
      const args = this.parseArguments();
      
      if (args.verbose) {
        console.log('🔍 Starting prospecting workflow...\n');
        console.log('Parameters:', {
          location: `${args.city}, ${args.state}`,
          radius: `${args.radius} miles`,
          industry: args.industry || 'all configured industries',
          maxResults: args.maxResults || 'no limit'
        });
        console.log('\n' + '='.repeat(60) + '\n');
      }

      // Build geographic filter
      const filter: GeographicFilter = {
        city: args.city,
        state: args.state,
        radius: args.radius
      };

      if (args.industry) {
        filter.industries = [args.industry as any];
      }

      // Run prospecting
      const startTime = Date.now();
      const results = await this.agent.prospect(filter);
      
      // Limit results for testing/iteration
      if (args.maxResults) {
        results.prospects = results.prospects.slice(0, args.maxResults);
        results.qualified = results.prospects.length;
      }
      
      const duration = Date.now() - startTime;

      // Display results
      this.displayResults(results, duration, args);

      // Save results if output specified
      if (args.output) {
        await this.saveResults(results, args.output, args.format || 'json');
      }

      // Sync to Obsidian if enabled
      if (args.syncObsidian !== false && process.env.OBSIDIAN_VAULT_PATH) {
        await this.syncToObsidian(results.prospects);
      }

    } catch (error) {
      console.error('❌ Prospecting failed:', error.message);
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
          case 'city':
            parsed.city = value;
            break;
          case 'state':
            parsed.state = value;
            break;
          case 'radius':
            parsed.radius = value ? parseInt(value, 10) : undefined;
            break;
          case 'industry':
            parsed.industry = value;
            break;
          case 'max-results':
            parsed.maxResults = value ? parseInt(value, 10) : undefined;
            break;
          case 'output':
            parsed.output = value;
            break;
          case 'format':
            parsed.format = value as 'json' | 'csv' | 'markdown';
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
    if (!parsed.city || !parsed.state || !parsed.radius) {
      console.error('❌ Missing required arguments: --city, --state, --radius');
      console.log('\nUsage Examples:');
      console.log('  npm run prospect -- --city="Denver" --state="CO" --radius=25');
      console.log('  npm run prospect -- --city Denver --state CO --radius 25 --industry "hardwood flooring"');
      console.log('  npm run prospect -- --city=Denver --state=CO --radius=25 --industry=restaurants');
      console.log('\nRequired Options:');
      console.log('  --city CITY           Target city (use quotes for multi-word cities)');
      console.log('  --state STATE         Target state (2-letter code)');
      console.log('  --radius MILES        Search radius in miles');
      console.log('\nOptional:');
      console.log('  --industry INDUSTRY   Specific industry to target (use quotes for multi-word)');
      console.log('  --max-results N       Maximum number of results');
      console.log('  --output FILE         Save results to file');
      console.log('  --format FORMAT       Output format (json|csv|markdown)');
      console.log('  --verbose             Show detailed progress');
      console.log('  --sync-obsidian BOOL  Sync results to Obsidian vault (default: true)');
      process.exit(1);
    }

    return parsed as CLIArgs;
  }

  /**
   * Display prospecting results
   */
  private displayResults(results: any, duration: number, args: CLIArgs): void {
    console.log('🎯 Prospecting Results\n');
    console.log(`📍 Location: ${args.city}, ${args.state} (${args.radius} mile radius)`);
    console.log(`⏱️  Processing Time: ${(duration/1000).toFixed(2)}s`);
    console.log(`🏢 Total Businesses Found: ${results.totalFound}`);
    console.log(`✅ Qualified Prospects: ${results.qualified}`);
    console.log(`🔄 Duplicates Removed: ${results.duplicatesRemoved}`);
    
    console.log('\n📊 API Usage:');
    console.log(`  • Google Maps: ${results.apiCallsUsed.googleMaps} calls`);
    console.log(`  • Yellow Pages: ${results.apiCallsUsed.yellowPages} calls`);
    console.log(`  • Firecrawl: ${results.apiCallsUsed.firecrawl} calls`);
    console.log(`  • Perplexity: ${results.apiCallsUsed.perplexity} calls`);
    
    if (results.prospects.length > 0) {
      console.log('\n🏆 Top Qualified Prospects:\n');
      
      const topProspects = results.prospects
        .sort((a: any, b: any) => b.qualificationScore.total - a.qualificationScore.total)
        .slice(0, 5);
      
      for (const [index, prospect] of topProspects.entries()) {
        console.log(`${index + 1}. ${prospect.business.name}`);
        console.log(`   Score: ${prospect.qualificationScore.total}/100`);
        console.log(`   Industry: ${prospect.business.industry}`);
        console.log(`   Location: ${prospect.business.location.city}, ${prospect.business.location.state}`);
        console.log(`   Contact: ${prospect.contact.phone || 'N/A'} | ${prospect.contact.email || 'N/A'}`);
        console.log(`   Website: ${prospect.contact.website || 'N/A'}`);
        
        if (args.verbose) {
          console.log(`   Score Breakdown:`);
          console.log(`     • Business Size: ${prospect.qualificationScore.breakdown.businessSize}/20`);
          console.log(`     • Digital Presence: ${prospect.qualificationScore.breakdown.digitalPresence}/25`);
          console.log(`     • Location: ${prospect.qualificationScore.breakdown.location}/15`);
          console.log(`     • Industry: ${prospect.qualificationScore.breakdown.industry}/10`);
          console.log(`     • Revenue Indicators: ${prospect.qualificationScore.breakdown.revenueIndicators}/10`);
          console.log(`     • Competitor Gaps: ${prospect.qualificationScore.breakdown.competitorGaps}/20`);
        }
        
        console.log('');
      }
    } else {
      console.log('\n⚠️  No qualified prospects found with current criteria.');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`✨ Prospecting completed! ${results.qualified} qualified prospects identified.`);
  }

  /**
   * Save results to file
   */
  private async saveResults(results: any, outputPath: string, format: string): Promise<void> {
    try {
      let content: string;
      
      switch (format) {
        case 'csv':
          content = this.formatAsCSV(results);
          break;
        case 'markdown':
          content = this.formatAsMarkdown(results);
          break;
        default:
          content = JSON.stringify(results, null, 2);
      }
      
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      fs.writeFileSync(outputPath, content, 'utf8');
      console.log(`💾 Results saved to: ${outputPath}`);
      
    } catch (error) {
      console.error('❌ Failed to save results:', error.message);
    }
  }

  /**
   * Format results as CSV
   */
  private formatAsCSV(results: any): string {
    const headers = [
      'Business Name',
      'Industry',
      'City',
      'State',
      'Phone',
      'Email',
      'Website',
      'Qualification Score',
      'Business Size Score',
      'Digital Presence Score',
      'Location Score',
      'Industry Score',
      'Revenue Score',
      'Competitor Gaps Score'
    ];
    
    const rows = [headers.join(',')];
    
    for (const prospect of results.prospects) {
      const row = [
        `"${prospect.business.name}"`,
        prospect.business.industry,
        prospect.business.location.city,
        prospect.business.location.state,
        prospect.contact.phone || '',
        prospect.contact.email || '',
        prospect.contact.website || '',
        prospect.qualificationScore.total,
        prospect.qualificationScore.breakdown.businessSize,
        prospect.qualificationScore.breakdown.digitalPresence,
        prospect.qualificationScore.breakdown.location,
        prospect.qualificationScore.breakdown.industry,
        prospect.qualificationScore.breakdown.revenueIndicators,
        prospect.qualificationScore.breakdown.competitorGaps
      ];
      
      rows.push(row.join(','));
    }
    
    return rows.join('\n');
  }

  /**
   * Format results as Markdown
   */
  private formatAsMarkdown(results: any): string {
    let markdown = `# Prospecting Results\n\n`;
    markdown += `**Total Found:** ${results.totalFound}\n`;
    markdown += `**Qualified:** ${results.qualified}\n`;
    markdown += `**Processing Time:** ${results.processingTime}ms\n\n`;
    
    markdown += `## API Usage\n\n`;
    markdown += `- Google Maps: ${results.apiCallsUsed.googleMaps} calls\n`;
    markdown += `- Yellow Pages: ${results.apiCallsUsed.yellowPages} calls\n`;
    markdown += `- Firecrawl: ${results.apiCallsUsed.firecrawl} calls\n`;
    markdown += `- Perplexity: ${results.apiCallsUsed.perplexity} calls\n\n`;
    
    markdown += `## Qualified Prospects\n\n`;
    
    for (const prospect of results.prospects) {
      markdown += `### ${prospect.business.name}\n\n`;
      markdown += `- **Industry:** ${prospect.business.industry}\n`;
      markdown += `- **Location:** ${prospect.business.location.city}, ${prospect.business.location.state}\n`;
      markdown += `- **Phone:** ${prospect.contact.phone || 'N/A'}\n`;
      markdown += `- **Email:** ${prospect.contact.email || 'N/A'}\n`;
      markdown += `- **Website:** ${prospect.contact.website || 'N/A'}\n`;
      markdown += `- **Qualification Score:** ${prospect.qualificationScore.total}/100\n\n`;
      
      markdown += `**Score Breakdown:**\n`;
      markdown += `- Business Size: ${prospect.qualificationScore.breakdown.businessSize}/20\n`;
      markdown += `- Digital Presence: ${prospect.qualificationScore.breakdown.digitalPresence}/25\n`;
      markdown += `- Location: ${prospect.qualificationScore.breakdown.location}/15\n`;
      markdown += `- Industry: ${prospect.qualificationScore.breakdown.industry}/10\n`;
      markdown += `- Revenue Indicators: ${prospect.qualificationScore.breakdown.revenueIndicators}/10\n`;
      markdown += `- Competitor Gaps: ${prospect.qualificationScore.breakdown.competitorGaps}/20\n\n`;
      
      markdown += `---\n\n`;
    }
    
    return markdown;
  }

  /**
   * Sync prospects to Obsidian vault
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
  const cli = new ProspectingCLI();
  cli.run().catch(error => {
    console.error('❌ CLI Error:', error);
    process.exit(1);
  });
}

export { ProspectingCLI };