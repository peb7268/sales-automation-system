#!/usr/bin/env node
/**
 * CLI Command for Testing Mastra Prospecting Agent
 * Enhanced version using the new Mastra architecture
 * Usage: npm run prospect:mastra -- --city="Denver" --state="CO" --radius=25 --industry="restaurants"
 */

// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import { mastraOrchestrator } from '../orchestration/MastraOrchestrator';
import { mastraProspectingAgent } from '../agents/mastra/MastraProspectingAgent';
import { mastraAgentEvaluations } from '../evaluations/MastraAgentEvaluations';
import { GeographicFilter } from '../types/prospect';
import { Logger } from '../utils/logging';
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
  evaluate?: boolean;
}

class MastraProspectingCLI {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('MastraProspectingCLI');
  }

  /**
   * Main CLI entry point using Mastra architecture
   */
  async run(): Promise<void> {
    try {
      const args = this.parseArguments();
      
      this.logger.info('🚀 Starting Mastra Prospecting Agent', { args });
      console.log('🔍 Mastra Enhanced Prospecting Agent');
      console.log('=====================================\n');

      // Initialize Mastra orchestrator
      await this.initializeSystem();

      // Build geographic filter
      const filter = this.buildGeographicFilter(args);
      
      // Display search parameters
      this.displaySearchParameters(filter);

      // Execute prospecting workflow
      console.log('\n⚡ Executing prospecting workflow...');
      const result = await mastraOrchestrator.executeProspectingWorkflow(filter);

      if (!result.success) {
        throw new Error(`Prospecting failed: ${result.error}`);
      }

      // Display results
      this.displayResults(result);

      // Evaluate quality if requested
      if (args.evaluate && result.result?.prospects?.length > 0) {
        await this.evaluateResults(result.result.prospects);
      }

      // Sync to Obsidian if requested
      if (args.syncObsidian && result.result?.prospects?.length > 0) {
        await this.syncToObsidian(result.result.prospects);
      }

      // Save output if requested
      if (args.output) {
        await this.saveOutput(result, args);
      }

      console.log('\n✅ Mastra prospecting completed successfully!');

    } catch (error: any) {
      this.logger.error('Mastra prospecting failed', { error: error.message });
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }

  /**
   * Initialize Mastra system
   */
  private async initializeSystem(): Promise<void> {
    console.log('🔧 Initializing Mastra system...');
    
    await mastraOrchestrator.initialize();
    await mastraOrchestrator.start();
    
    const status = mastraOrchestrator.getStatus();
    console.log(`✅ System ready - ${status.agentCount} agents initialized\n`);
  }

  /**
   * Parse command line arguments
   */
  private parseArguments(): CLIArgs {
    const args = process.argv.slice(2);
    const parsed: CLIArgs = {
      city: 'Denver',
      state: 'CO', 
      radius: 10
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg.startsWith('--city=')) {
        parsed.city = arg.split('=')[1].replace(/"/g, '');
      } else if (arg.startsWith('--state=')) {
        parsed.state = arg.split('=')[1].replace(/"/g, '');
      } else if (arg.startsWith('--radius=')) {
        parsed.radius = parseInt(arg.split('=')[1]);
      } else if (arg.startsWith('--industry=')) {
        parsed.industry = arg.split('=')[1].replace(/"/g, '');
      } else if (arg.startsWith('--max-results=')) {
        parsed.maxResults = parseInt(arg.split('=')[1]);
      } else if (arg.startsWith('--output=')) {
        parsed.output = arg.split('=')[1].replace(/"/g, '');
      } else if (arg.startsWith('--format=')) {
        parsed.format = arg.split('=')[1].replace(/"/g, '') as 'json' | 'csv' | 'markdown';
      } else if (arg === '--verbose') {
        parsed.verbose = true;
      } else if (arg === '--sync-obsidian') {
        parsed.syncObsidian = true;
      } else if (arg === '--evaluate') {
        parsed.evaluate = true;
      }
    }

    return parsed;
  }

  /**
   * Build geographic filter from CLI arguments
   */
  private buildGeographicFilter(args: CLIArgs): GeographicFilter {
    const industries = args.industry ? [args.industry] : ['restaurants', 'retail', 'professional_services'];
    
    return {
      city: args.city,
      state: args.state,
      radius: args.radius,
      industries,
      maxEmployees: args.maxResults ? args.maxResults * 2 : undefined // Rough estimation
    };
  }

  /**
   * Display search parameters
   */
  private displaySearchParameters(filter: GeographicFilter): void {
    console.log('📍 Search Parameters:');
    console.log(`   Location: ${filter.city}, ${filter.state}`);
    console.log(`   Radius: ${filter.radius} miles`);
    console.log(`   Industries: ${filter.industries?.join(', ') || 'All'}`);
    if (filter.maxEmployees) {
      console.log(`   Max Employees: ${filter.maxEmployees}`);
    }
  }

  /**
   * Display prospecting results
   */
  private displayResults(result: any): void {
    console.log('\n📊 Prospecting Results:');
    console.log('======================');
    console.log(`✅ Success: ${result.success}`);
    console.log(`⏱️  Execution Time: ${result.executionTime}ms`);
    console.log(`🤖 Agents Used: ${result.agentsUsed.join(', ')}`);
    
    if (result.result) {
      console.log(`📈 Total Found: ${result.result.totalFound}`);
      console.log(`⭐ Qualified: ${result.result.qualified}`);
      console.log(`🔄 Duplicates Removed: ${result.result.duplicatesRemoved}`);
      
      console.log('\n📞 API Usage:');
      Object.entries(result.result.apiCallsUsed).forEach(([service, count]) => {
        console.log(`   ${service}: ${count} calls`);
      });

      if (result.result.prospects && result.result.prospects.length > 0) {
        console.log('\n🏢 Top Qualified Prospects:');
        result.result.prospects.slice(0, 5).forEach((prospect: any, index: number) => {
          const name = prospect.business?.name || prospect.businessName || 'Unknown Business';
          const score = prospect.qualificationScore?.total || 0;
          const phone = prospect.contact?.phone || 'No phone';
          console.log(`   ${index + 1}. ${name} (Score: ${score}, Phone: ${phone})`);
        });
      }
    }
  }

  /**
   * Evaluate results quality
   */
  private async evaluateResults(prospects: any[]): Promise<void> {
    console.log('\n📊 Evaluating Results Quality...');
    
    try {
      const evaluation = await mastraAgentEvaluations.batchEvaluateProspects(prospects);
      
      console.log('\n🎯 Quality Assessment:');
      console.log(`   Average Score: ${evaluation.aggregate.averageScore.toFixed(2)}`);
      console.log(`   Pass Rate: ${(evaluation.aggregate.passRate * 100).toFixed(1)}%`);
      
      if (evaluation.aggregate.commonIssues.length > 0) {
        console.log('\n⚠️  Common Issues:');
        evaluation.aggregate.commonIssues.forEach(issue => {
          console.log(`   • ${issue}`);
        });
      }

      if (evaluation.aggregate.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        evaluation.aggregate.recommendations.forEach(rec => {
          console.log(`   • ${rec}`);
        });
      }

    } catch (error: any) {
      console.log(`⚠️  Evaluation failed: ${error.message}`);
    }
  }

  /**
   * Sync results to Obsidian
   */
  private async syncToObsidian(prospects: any[]): Promise<void> {
    console.log('\n🔄 Syncing to Obsidian...');
    
    try {
      const obsidianSync = new ObsidianProspectSync();
      
      for (const prospect of prospects) {
        await obsidianSync.syncProspectToObsidian(prospect);
      }
      
      console.log(`✅ Synced ${prospects.length} prospects to Obsidian`);
      
    } catch (error: any) {
      console.log(`⚠️  Obsidian sync failed: ${error.message}`);
    }
  }

  /**
   * Save output to file
   */
  private async saveOutput(result: any, args: CLIArgs): Promise<void> {
    console.log(`\n💾 Saving output to ${args.output}...`);
    
    try {
      const format = args.format || 'json';
      let content: string;

      switch (format) {
        case 'json':
          content = JSON.stringify(result, null, 2);
          break;
        case 'csv':
          content = this.convertToCSV(result.result?.prospects || []);
          break;
        case 'markdown':
          content = this.convertToMarkdown(result);
          break;
        default:
          content = JSON.stringify(result, null, 2);
      }

      await fs.promises.writeFile(args.output, content, 'utf8');
      console.log(`✅ Output saved as ${format.toUpperCase()}`);
      
    } catch (error: any) {
      console.log(`⚠️  Save failed: ${error.message}`);
    }
  }

  /**
   * Convert prospects to CSV format
   */
  private convertToCSV(prospects: any[]): string {
    if (prospects.length === 0) return 'No prospects found';

    const headers = ['Business Name', 'Industry', 'City', 'State', 'Phone', 'Website', 'Qualification Score'];
    const rows = prospects.map(prospect => [
      prospect.business?.name || prospect.businessName || '',
      prospect.business?.industry || prospect.industry || '',
      prospect.business?.location?.city || prospect.city || '',
      prospect.business?.location?.state || prospect.state || '',
      prospect.contact?.phone || prospect.phone || '',
      prospect.contact?.website || prospect.website || '',
      prospect.qualificationScore?.total || 0
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Convert results to Markdown format
   */
  private convertToMarkdown(result: any): string {
    let markdown = '# Mastra Prospecting Results\n\n';
    
    markdown += `**Execution Time:** ${result.executionTime}ms\n`;
    markdown += `**Total Found:** ${result.result?.totalFound || 0}\n`;
    markdown += `**Qualified:** ${result.result?.qualified || 0}\n\n`;

    if (result.result?.prospects?.length > 0) {
      markdown += '## Qualified Prospects\n\n';
      
      result.result.prospects.forEach((prospect: any, index: number) => {
        const name = prospect.business?.name || prospect.businessName || 'Unknown Business';
        const score = prospect.qualificationScore?.total || 0;
        const phone = prospect.contact?.phone || 'No phone';
        const website = prospect.contact?.website || 'No website';
        
        markdown += `### ${index + 1}. ${name}\n`;
        markdown += `- **Score:** ${score}\n`;
        markdown += `- **Phone:** ${phone}\n`;
        markdown += `- **Website:** ${website}\n\n`;
      });
    }

    return markdown;
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  const cli = new MastraProspectingCLI();
  cli.run().catch(console.error);
}

export { MastraProspectingCLI };