#!/usr/bin/env tsx

/**
 * Mastra Agent Demo CLI
 * Demonstrates the new Mastra-based agent architecture
 */

import { Command } from 'commander';
import { mastraOrchestrator } from '../orchestration/MastraOrchestrator';
import { mastraProspectingAgent } from '../agents/mastra/MastraProspectingAgent';
import { mastraPitchCreatorAgent } from '../agents/mastra/MastraPitchCreatorAgent';
import { mastraAgentEvaluations } from '../evaluations/MastraAgentEvaluations';
import { Logger } from '../utils/logging';

const logger = new Logger('MastraDemo', 'cli');
const program = new Command();

program
  .name('mastra-demo')
  .description('Demonstrate Mastra-based agent capabilities')
  .version('1.0.0');

/**
 * Initialize Mastra orchestrator
 */
program
  .command('init')
  .description('Initialize Mastra orchestrator and agents')
  .action(async () => {
    try {
      console.log('🚀 Initializing Mastra Agent System...\n');

      await mastraOrchestrator.initialize();
      console.log('✅ Mastra orchestrator initialized');

      await mastraOrchestrator.start();
      console.log('✅ Mastra orchestrator started');

      const status = mastraOrchestrator.getStatus();
      console.log('\n📊 System Status:');
      console.log(`- Initialized: ${status.initialized}`);
      console.log(`- Running: ${status.running}`);
      console.log(`- Agent Count: ${status.agentCount}`);
      console.log(`- Active Tasks: ${status.activeTasks}`);

      console.log('\n🤖 Agent Details:');
      status.agents.forEach(agent => {
        console.log(`- ${agent.name}:`);
        console.log(`  - Initialized: ${agent.initialized}`);
        console.log(`  - Tools: ${agent.toolCount}`);
        console.log(`  - Model: ${agent.model}`);
        console.log(`  - Executions: ${agent.executionCount}`);
      });

      console.log('\n✨ Mastra system ready for operations!');

    } catch (error) {
      console.error('❌ Failed to initialize Mastra system:', error.message);
      process.exit(1);
    }
  });

/**
 * Run prospecting workflow
 */
program
  .command('prospect')
  .description('Run Mastra prospecting workflow')
  .option('-c, --city <city>', 'Target city', 'Denver')
  .option('-s, --state <state>', 'Target state', 'CO')
  .option('-r, --radius <radius>', 'Search radius in miles', '10')
  .option('-i, --industries <industries>', 'Target industries (comma-separated)', 'restaurants,retail')
  .option('--min-employees <min>', 'Minimum employees')
  .option('--max-employees <max>', 'Maximum employees')
  .option('--min-revenue <min>', 'Minimum revenue')
  .option('--max-revenue <max>', 'Maximum revenue')
  .action(async (options) => {
    try {
      console.log('🔍 Starting Mastra Prospecting Workflow...\n');

      // Parse options
      const filter = {
        city: options.city,
        state: options.state,
        radius: parseInt(options.radius),
        industries: options.industries.split(',').map((i: string) => i.trim()),
        minEmployees: options.minEmployees ? parseInt(options.minEmployees) : undefined,
        maxEmployees: options.maxEmployees ? parseInt(options.maxEmployees) : undefined,
        minRevenue: options.minRevenue ? parseInt(options.minRevenue) : undefined,
        maxRevenue: options.maxRevenue ? parseInt(options.maxRevenue) : undefined
      };

      console.log('📋 Prospecting Parameters:');
      console.log(`- Location: ${filter.city}, ${filter.state}`);
      console.log(`- Radius: ${filter.radius} miles`);
      console.log(`- Industries: ${filter.industries.join(', ')}`);
      if (filter.minEmployees) console.log(`- Employee Range: ${filter.minEmployees} - ${filter.maxEmployees || 'unlimited'}`);
      if (filter.minRevenue) console.log(`- Revenue Range: $${filter.minRevenue.toLocaleString()} - $${filter.maxRevenue?.toLocaleString() || 'unlimited'}`);

      // Initialize orchestrator if needed
      await ensureOrchestratorReady();

      // Execute prospecting workflow
      console.log('\n⚡ Executing prospecting workflow...');
      const result = await mastraOrchestrator.executeProspectingWorkflow(filter);

      if (result.success) {
        console.log('\n✅ Prospecting completed successfully!');
        console.log('\n📊 Results Summary:');
        console.log(`- Task ID: ${result.taskId}`);
        console.log(`- Execution Time: ${result.executionTime}ms`);
        console.log(`- Agents Used: ${result.agentsUsed.join(', ')}`);
        
        if (result.result) {
          console.log(`- Total Found: ${result.result.totalFound}`);
          console.log(`- Qualified: ${result.result.qualified}`);
          console.log(`- Duplicates Removed: ${result.result.duplicatesRemoved}`);
          console.log('\n📞 API Calls Used:');
          Object.entries(result.result.apiCallsUsed).forEach(([service, count]) => {
            console.log(`  - ${service}: ${count}`);
          });
        }
      } else {
        console.error('\n❌ Prospecting failed:', result.error);
      }

    } catch (error) {
      console.error('❌ Prospecting workflow error:', error.message);
      process.exit(1);
    }
  });

/**
 * Generate pitch for a prospect
 */
program
  .command('pitch')
  .description('Generate pitch using Mastra pitch creator agent')
  .argument('<prospect-folder>', 'Prospect folder name')
  .option('-t, --template <template>', 'Pitch template (standard, executive, technical)', 'standard')
  .option('--focus <areas>', 'Focus areas (comma-separated)')
  .option('--verbose', 'Show detailed output')
  .action(async (prospectFolder, options) => {
    try {
      console.log('✍️ Starting Mastra Pitch Generation...\n');

      console.log('📋 Generation Parameters:');
      console.log(`- Prospect Folder: ${prospectFolder}`);
      console.log(`- Template: ${options.template}`);
      if (options.focus) console.log(`- Focus Areas: ${options.focus}`);

      // Parse options
      const pitchOptions = {
        template: options.template,
        focusAreas: options.focus ? options.focus.split(',').map((f: string) => f.trim()) : undefined
      };

      // Initialize orchestrator if needed
      await ensureOrchestratorReady();

      // Execute pitch generation
      console.log('\n⚡ Generating pitch...');
      const result = await mastraOrchestrator.executePitchGeneration(prospectFolder, pitchOptions);

      if (result.success) {
        console.log('\n✅ Pitch generation completed successfully!');
        console.log('\n📊 Results Summary:');
        console.log(`- Task ID: ${result.taskId}`);
        console.log(`- Execution Time: ${result.executionTime}ms`);
        console.log(`- Agents Used: ${result.agentsUsed.join(', ')}`);
        
        if (result.result.pitchPath) {
          console.log(`- Pitch File: ${result.result.pitchPath}`);
        }

        if (options.verbose && result.result) {
          console.log('\n📝 Generation Details:');
          console.log(JSON.stringify(result.result, null, 2));
        }
      } else {
        console.error('\n❌ Pitch generation failed:', result.error);
      }

    } catch (error) {
      console.error('❌ Pitch generation error:', error.message);
      process.exit(1);
    }
  });

/**
 * Run combined workflow (prospecting + pitch generation)
 */
program
  .command('workflow')
  .description('Run combined prospecting and pitch generation workflow')
  .option('-c, --city <city>', 'Target city', 'Denver')
  .option('-s, --state <state>', 'Target state', 'CO')
  .option('-r, --radius <radius>', 'Search radius in miles', '10')
  .option('-i, --industries <industries>', 'Target industries (comma-separated)', 'restaurants')
  .option('-t, --template <template>', 'Pitch template', 'standard')
  .option('--limit <limit>', 'Limit prospects for pitch generation', '5')
  .action(async (options) => {
    try {
      console.log('🚀 Starting Combined Mastra Workflow...\n');

      // Parse options
      const filter = {
        city: options.city,
        state: options.state,
        radius: parseInt(options.radius),
        industries: options.industries.split(',').map((i: string) => i.trim())
      };

      const pitchOptions = {
        template: options.template,
        limit: parseInt(options.limit)
      };

      console.log('📋 Workflow Parameters:');
      console.log(`- Location: ${filter.city}, ${filter.state}`);
      console.log(`- Radius: ${filter.radius} miles`);
      console.log(`- Industries: ${filter.industries.join(', ')}`);
      console.log(`- Pitch Template: ${pitchOptions.template}`);
      console.log(`- Prospect Limit: ${pitchOptions.limit}`);

      // Initialize orchestrator if needed
      await ensureOrchestratorReady();

      // Execute combined workflow
      console.log('\n⚡ Executing combined workflow...');
      const result = await mastraOrchestrator.executeCombinedWorkflow(filter, pitchOptions);

      if (result.success) {
        console.log('\n✅ Combined workflow completed successfully!');
        console.log('\n📊 Results Summary:');
        console.log(`- Task ID: ${result.taskId}`);
        console.log(`- Execution Time: ${result.executionTime}ms`);
        console.log(`- Agents Used: ${result.agentsUsed.join(', ')}`);
        
        if (result.result) {
          console.log(`- Total Prospects: ${result.result.summary.totalProspects}`);
          console.log(`- Qualified Prospects: ${result.result.summary.qualifiedProspects}`);
          console.log(`- Pitches Generated: ${result.result.summary.pitchesGenerated}`);
          console.log(`- Errors: ${result.result.summary.errors.length}`);

          if (result.result.summary.errors.length > 0) {
            console.log('\n⚠️ Errors encountered:');
            result.result.summary.errors.forEach((error: string, index: number) => {
              console.log(`  ${index + 1}. ${error}`);
            });
          }
        }
      } else {
        console.error('\n❌ Combined workflow failed:', result.error);
      }

    } catch (error) {
      console.error('❌ Combined workflow error:', error.message);
      process.exit(1);
    }
  });

/**
 * Evaluate agent performance
 */
program
  .command('evaluate')
  .description('Evaluate agent performance and output quality')
  .option('-t, --type <type>', 'Evaluation type (prospecting, pitch, workflow)', 'prospecting')
  .option('-f, --file <file>', 'Data file to evaluate')
  .option('--batch', 'Run batch evaluation')
  .action(async (options) => {
    try {
      console.log('📊 Starting Mastra Agent Evaluation...\n');

      console.log('📋 Evaluation Parameters:');
      console.log(`- Type: ${options.type}`);
      if (options.file) console.log(`- Data File: ${options.file}`);
      console.log(`- Batch Mode: ${options.batch ? 'Yes' : 'No'}`);

      let evaluation;

      switch (options.type) {
        case 'prospecting':
          if (options.batch) {
            console.log('\n⚡ Running batch prospect evaluation...');
            // Mock data for demonstration
            const mockProspects = generateMockProspects(5);
            evaluation = await mastraAgentEvaluations.batchEvaluateProspects(mockProspects);
            
            console.log('\n✅ Batch evaluation completed!');
            console.log('\n📊 Aggregate Results:');
            console.log(`- Average Score: ${evaluation.aggregate.averageScore.toFixed(2)}`);
            console.log(`- Pass Rate: ${(evaluation.aggregate.passRate * 100).toFixed(1)}%`);
            console.log(`- Common Issues: ${evaluation.aggregate.commonIssues.join(', ')}`);
            
            console.log('\n💡 Recommendations:');
            evaluation.aggregate.recommendations.forEach((rec: string, index: number) => {
              console.log(`  ${index + 1}. ${rec}`);
            });
          } else {
            // Single prospect evaluation
            const mockProspect = generateMockProspects(1)[0];
            evaluation = await mastraAgentEvaluations.evaluateProspectingQuality(mockProspect);
            
            console.log('\n✅ Prospect evaluation completed!');
            displayEvaluationResults(evaluation);
          }
          break;

        case 'pitch':
          const mockPitch = generateMockPitch();
          const mockProspectData = generateMockProspects(1)[0];
          evaluation = await mastraAgentEvaluations.evaluatePitchQuality(mockPitch, mockProspectData);
          
          console.log('\n✅ Pitch evaluation completed!');
          displayEvaluationResults(evaluation);
          break;

        case 'workflow':
          evaluation = await mastraAgentEvaluations.evaluateWorkflowPerformance(
            'prospecting',
            5000, // 5 second execution time
            { totalFound: 10, qualified: 8 },
            ['Minor data enrichment error']
          );
          
          console.log('\n✅ Workflow evaluation completed!');
          displayEvaluationResults(evaluation);
          break;

        default:
          throw new Error(`Unknown evaluation type: ${options.type}`);
      }

    } catch (error) {
      console.error('❌ Evaluation error:', error.message);
      process.exit(1);
    }
  });

/**
 * Show system status
 */
program
  .command('status')
  .description('Show Mastra system status and metrics')
  .option('--detailed', 'Show detailed information')
  .action(async (options) => {
    try {
      console.log('📊 Mastra System Status\n');

      // Orchestrator status
      const status = mastraOrchestrator.getStatus();
      console.log('🎭 Orchestrator Status:');
      console.log(`- Initialized: ${status.initialized ? '✅' : '❌'}`);
      console.log(`- Running: ${status.running ? '✅' : '❌'}`);
      console.log(`- Active Tasks: ${status.activeTasks}`);
      console.log(`- Completed Tasks: ${status.completedTasks}`);
      console.log(`- Failed Tasks: ${status.failedTasks}`);

      console.log('\n🤖 Agent Status:');
      status.agents.forEach(agent => {
        console.log(`\n  ${agent.name}:`);
        console.log(`  - Status: ${agent.initialized ? '✅ Ready' : '❌ Not Ready'}`);
        console.log(`  - Model: ${agent.model}`);
        console.log(`  - Tools: ${agent.toolCount}`);
        console.log(`  - Executions: ${agent.executionCount}`);
        if (agent.averageExecutionTime > 0) {
          console.log(`  - Avg Execution Time: ${agent.averageExecutionTime.toFixed(0)}ms`);
        }
        if (agent.lastExecuted) {
          console.log(`  - Last Executed: ${agent.lastExecuted.toLocaleString()}`);
        }
      });

      if (options.detailed) {
        console.log('\n📈 Recent Task History:');
        const taskHistory = mastraOrchestrator.getTaskHistory(5);
        if (taskHistory.length === 0) {
          console.log('  No recent tasks');
        } else {
          taskHistory.forEach(task => {
            const statusIcon = task.status === 'completed' ? '✅' : 
                              task.status === 'failed' ? '❌' : 
                              task.status === 'running' ? '⚡' : '⏳';
            console.log(`  ${statusIcon} ${task.type} (${task.id}) - ${task.status}`);
            if (task.executionTime) {
              console.log(`     Execution Time: ${task.executionTime}ms`);
            }
            if (task.error) {
              console.log(`     Error: ${task.error}`);
            }
          });
        }
      }

    } catch (error) {
      console.error('❌ Status check error:', error.message);
    }
  });

/**
 * Helper functions
 */

async function ensureOrchestratorReady(): Promise<void> {
  const status = mastraOrchestrator.getStatus();
  if (!status.initialized) {
    console.log('🔧 Initializing Mastra orchestrator...');
    await mastraOrchestrator.initialize();
  }
  if (!status.running) {
    console.log('▶️ Starting Mastra orchestrator...');
    await mastraOrchestrator.start();
  }
}

function displayEvaluationResults(evaluation: any): void {
  console.log('\n📊 Evaluation Results:');
  console.log(`- Overall Score: ${evaluation.overall_score.toFixed(2)} (${evaluation.letter_grade})`);
  console.log(`- Passed: ${evaluation.passed ? '✅' : '❌'}`);
  
  console.log('\n📋 Detailed Scores:');
  evaluation.results.forEach((result: any) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`  ${icon} ${result.criterion}: ${result.score.toFixed(2)} (weight: ${result.weight})`);
    if (result.explanation) {
      console.log(`     ${result.explanation}`);
    }
  });

  if (evaluation.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    evaluation.recommendations.forEach((rec: string, index: number) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }
}

function generateMockProspects(count: number): any[] {
  const mockProspects = [];
  const businesses = ['Joe\'s Pizza', 'Denver Deli', 'Mountain View Cafe', 'Colorado Cleaners', 'Rocky Mountain Fitness'];
  const industries = ['restaurants', 'retail', 'professional_services', 'fitness', 'food'];

  for (let i = 0; i < count; i++) {
    mockProspects.push({
      business: {
        name: businesses[i % businesses.length],
        industry: industries[i % industries.length],
        location: {
          city: 'Denver',
          state: 'CO',
          country: 'US'
        },
        size: {
          category: 'small',
          employeeCount: Math.floor(Math.random() * 20) + 5,
          estimatedRevenue: Math.floor(Math.random() * 500000) + 100000
        }
      },
      contact: {
        phone: '(303) 555-0123',
        email: 'contact@business.com',
        website: 'https://www.business.com'
      },
      qualificationScore: Math.floor(Math.random() * 40) + 60,
      pipelineStage: 'cold'
    });
  }

  return mockProspects;
}

function generateMockPitch(): string {
  return `Hi John, I noticed Joe's Pizza has excellent reviews on Google, but you're missing out on a huge opportunity to turn those happy customers into a steady stream of new business through strategic social media and online ordering.

Here's what I can do for Joe's Pizza: I'll build on your existing website foundation to address your social media presence and online review management, creating a comprehensive digital marketing system that generates consistent leads and increases revenue by 20-40% within 6 months.

Similar restaurant businesses have seen 40-70% increases in qualified leads and 25-35% revenue growth within 6 months of implementing comprehensive digital marketing strategies.

Here's the financial impact for Joe's Pizza:
Investment: $2,500 setup + $1,000/month = $14,500 first year
Projected Revenue Increase: $125,000 annually ($10,416/month)
Net ROI: 762% return on investment in year one
Break-even: Month 3

I'd like to schedule a 15-minute call this week to show you exactly how this would work for Joe's Pizza. When would be a good time for a brief call?`;
}

// Parse command line arguments
program.parse();

export {};