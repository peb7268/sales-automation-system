#!/usr/bin/env node
/**
 * CLI Command for Mastra Pitch Generation
 * Enhanced version using the new Mastra architecture
 * Usage: npm run pitches:mastra -- --all --verbose --evaluate
 */

// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import { mastraOrchestrator } from '../orchestration/MastraOrchestrator';
import { mastraPitchCreatorAgent } from '../agents/mastra/MastraPitchCreatorAgent';
import { mastraAgentEvaluations } from '../evaluations/MastraAgentEvaluations';
import { Logger } from '../utils/logging';
import { prospectFolderManager } from '../utils/obsidian/prospect-folder-manager';
import fs from 'fs';
import path from 'path';

interface CLIArgs {
  all?: boolean;
  prospect?: string;
  template?: 'standard' | 'executive' | 'technical';
  focusAreas?: string[];
  verbose?: boolean;
  evaluate?: boolean;
  output?: string;
  dryRun?: boolean;
}

class MastraPitchGenerationCLI {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('MastraPitchGenerationCLI');
  }

  /**
   * Main CLI entry point using Mastra architecture
   */
  async run(): Promise<void> {
    try {
      const args = this.parseArguments();
      
      this.logger.info('🚀 Starting Mastra Pitch Generation', { args });
      console.log('✍️ Mastra Enhanced Pitch Generator');
      console.log('===================================\n');

      // Initialize Mastra orchestrator
      await this.initializeSystem();

      // Display generation parameters
      this.displayParameters(args);

      let results: any[] = [];

      if (args.all) {
        // Generate pitches for all prospects
        console.log('\n⚡ Generating pitches for all prospects...');
        results = await this.generateAllPitches(args);
      } else if (args.prospect) {
        // Generate pitch for specific prospect
        console.log(`\n⚡ Generating pitch for ${args.prospect}...`);
        const result = await this.generateSinglePitch(args.prospect, args);
        results = [result];
      } else {
        throw new Error('Must specify either --all or --prospect=<folder-name>');
      }

      // Display results
      this.displayResults(results);

      // Evaluate quality if requested
      if (args.evaluate && results.length > 0) {
        await this.evaluateResults(results);
      }

      // Save output if requested
      if (args.output) {
        await this.saveOutput(results, args);
      }

      console.log('\n✅ Mastra pitch generation completed successfully!');

    } catch (error: any) {
      this.logger.error('Mastra pitch generation failed', { error: error.message });
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
    const parsed: CLIArgs = {};

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg === '--all') {
        parsed.all = true;
      } else if (arg.startsWith('--prospect=')) {
        parsed.prospect = arg.split('=')[1].replace(/"/g, '');
      } else if (arg.startsWith('--template=')) {
        parsed.template = arg.split('=')[1].replace(/"/g, '') as 'standard' | 'executive' | 'technical';
      } else if (arg.startsWith('--focus=')) {
        parsed.focusAreas = arg.split('=')[1].replace(/"/g, '').split(',');
      } else if (arg.startsWith('--output=')) {
        parsed.output = arg.split('=')[1].replace(/"/g, '');
      } else if (arg === '--verbose') {
        parsed.verbose = true;
      } else if (arg === '--evaluate') {
        parsed.evaluate = true;
      } else if (arg === '--dry-run') {
        parsed.dryRun = true;
      }
    }

    return parsed;
  }

  /**
   * Display generation parameters
   */
  private displayParameters(args: CLIArgs): void {
    console.log('📋 Generation Parameters:');
    console.log(`   Mode: ${args.all ? 'All Prospects' : `Single (${args.prospect})`}`);
    console.log(`   Template: ${args.template || 'standard'}`);
    if (args.focusAreas) {
      console.log(`   Focus Areas: ${args.focusAreas.join(', ')}`);
    }
    console.log(`   Evaluate Quality: ${args.evaluate ? 'Yes' : 'No'}`);
    console.log(`   Dry Run: ${args.dryRun ? 'Yes' : 'No'}`);
  }

  /**
   * Generate pitches for all prospects
   */
  private async generateAllPitches(args: CLIArgs): Promise<any[]> {
    const result = await mastraOrchestrator.executeBatchPitchGeneration();
    
    if (!result.success) {
      throw new Error(`Batch pitch generation failed: ${result.error}`);
    }

    return result.result?.results || [];
  }

  /**
   * Generate pitch for single prospect
   */
  private async generateSinglePitch(prospectFolder: string, args: CLIArgs): Promise<any> {
    const options = {
      template: args.template || 'standard',
      focusAreas: args.focusAreas
    };

    const result = await mastraOrchestrator.executePitchGeneration(prospectFolder, options);
    
    return {
      prospectFolder,
      success: result.success,
      error: result.error,
      pitchPath: result.result?.pitchPath,
      executionTime: result.executionTime
    };
  }

  /**
   * Display generation results
   */
  private displayResults(results: any[]): void {
    console.log('\n📊 Generation Results:');
    console.log('======================');
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📝 Total Processed: ${results.length}`);

    if (failed > 0) {
      console.log('\n❌ Failed Generations:');
      results.filter(r => !r.success).forEach(result => {
        console.log(`   • ${result.prospectFolder}: ${result.error}`);
      });
    }

    if (successful > 0) {
      console.log('\n✅ Successful Generations:');
      results.filter(r => r.success).slice(0, 10).forEach(result => {
        const time = result.executionTime ? ` (${result.executionTime}ms)` : '';
        console.log(`   • ${result.prospectFolder}${time}`);
      });
      
      if (successful > 10) {
        console.log(`   ... and ${successful - 10} more`);
      }
    }
  }

  /**
   * Evaluate pitch quality
   */
  private async evaluateResults(results: any[]): Promise<void> {
    console.log('\n📊 Evaluating Pitch Quality...');
    
    const successfulResults = results.filter(r => r.success && r.pitchPath);
    if (successfulResults.length === 0) {
      console.log('⚠️  No successful pitches to evaluate');
      return;
    }

    try {
      const evaluations = [];
      
      // Evaluate a sample of pitches
      const sampleSize = Math.min(5, successfulResults.length);
      const sample = successfulResults.slice(0, sampleSize);
      
      for (const result of sample) {
        try {
          // Read pitch content
          const pitchContent = await fs.promises.readFile(result.pitchPath, 'utf8');
          
          // Mock prospect data for evaluation (in real implementation, would load from prospect folder)
          const mockProspectData = {
            company: result.prospectFolder.replace(/-/g, ' '),
            industry: 'restaurants',
            business_size: 'small',
            qualification_score: 75
          };

          const evaluation = await mastraAgentEvaluations.evaluatePitchQuality(pitchContent, mockProspectData);
          evaluations.push({
            prospect: result.prospectFolder,
            ...evaluation
          });

        } catch (error: any) {
          console.log(`⚠️  Failed to evaluate ${result.prospectFolder}: ${error.message}`);
        }
      }

      if (evaluations.length > 0) {
        // Calculate aggregate metrics
        const avgScore = evaluations.reduce((sum, e) => sum + e.overall_score, 0) / evaluations.length;
        const passRate = evaluations.filter(e => e.passed).length / evaluations.length;

        console.log('\n🎯 Quality Assessment:');
        console.log(`   Average Score: ${avgScore.toFixed(2)}`);
        console.log(`   Pass Rate: ${(passRate * 100).toFixed(1)}%`);
        console.log(`   Sample Size: ${evaluations.length} pitches`);

        // Show individual grades
        console.log('\n📊 Individual Grades:');
        evaluations.forEach(evaluation => {
          const status = evaluation.passed ? '✅' : '❌';
          console.log(`   ${status} ${evaluation.prospect}: ${evaluation.letter_grade} (${evaluation.overall_score.toFixed(2)})`);
        });

        // Common recommendations
        const allRecommendations = evaluations.flatMap(e => e.recommendations);
        const uniqueRecommendations = [...new Set(allRecommendations)];
        
        if (uniqueRecommendations.length > 0) {
          console.log('\n💡 Common Recommendations:');
          uniqueRecommendations.slice(0, 5).forEach(rec => {
            console.log(`   • ${rec}`);
          });
        }
      }

    } catch (error: any) {
      console.log(`⚠️  Quality evaluation failed: ${error.message}`);
    }
  }

  /**
   * Save output to file
   */
  private async saveOutput(results: any[], args: CLIArgs): Promise<void> {
    console.log(`\n💾 Saving output to ${args.output}...`);
    
    try {
      const summary = {
        timestamp: new Date().toISOString(),
        parameters: args,
        results: {
          total: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        },
        details: results
      };

      await fs.promises.writeFile(args.output, JSON.stringify(summary, null, 2), 'utf8');
      console.log(`✅ Output saved to ${args.output}`);
      
    } catch (error: any) {
      console.log(`⚠️  Save failed: ${error.message}`);
    }
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  const cli = new MastraPitchGenerationCLI();
  cli.run().catch(console.error);
}

export { MastraPitchGenerationCLI };