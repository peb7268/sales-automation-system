#!/usr/bin/env node

import { mastraOrchestrator } from '../orchestration/MastraOrchestrator';
import { logger } from '@utils/logging';

interface TaskManagerCLIOptions {
  command: 'start' | 'stop' | 'status' | 'trigger' | 'list';
  taskId?: string;
  data?: string;
  verbose?: boolean;
}

class TaskManagerCLI {
  private orchestrator: AgentOrchestrator;

  constructor() {
    this.orchestrator = new AgentOrchestrator();
  }

  async run(options: TaskManagerCLIOptions): Promise<void> {
    try {
      switch (options.command) {
        case 'start':
          await this.startSystem();
          break;
        case 'stop':
          await this.stopSystem();
          break;
        case 'status':
          await this.showStatus(options.verbose);
          break;
        case 'trigger':
          await this.triggerTask(options.taskId!, options.data);
          break;
        case 'list':
          await this.listTasks(options.verbose);
          break;
        default:
          this.showHelp();
      }
    } catch (error) {
      console.error('❌ Command failed:', error.message);
      process.exit(1);
    }
  }

  private async startSystem(): Promise<void> {
    console.log('🚀 Starting MHM JSON Task Management System...\n');
    
    await this.orchestrator.initialize();
    await this.orchestrator.start();
    
    console.log('✅ System started successfully!');
    console.log('📊 All processing will output JSON before Obsidian integration');
    console.log('⏰ Scheduled tasks are now active based on JSON configuration');
    console.log('\nPress Ctrl+C to stop the system gracefully\n');
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Gracefully shutting down...');
      await this.orchestrator.stop();
      console.log('✅ System stopped successfully');
      process.exit(0);
    });

    // Keep the process running
    await new Promise(() => {}); // Run indefinitely
  }

  private async stopSystem(): Promise<void> {
    console.log('🛑 Stopping MHM JSON Task Management System...\n');
    
    await this.orchestrator.stop();
    
    console.log('✅ System stopped successfully');
  }

  private async showStatus(verbose?: boolean): Promise<void> {
    console.log('📊 MHM JSON Task Management System Status\n');
    
    const status = this.orchestrator.getStatus();
    
    console.log(`🔧 Initialized: ${status.initialized ? '✅' : '❌'}`);
    console.log(`🚀 Running: ${status.running ? '✅' : '❌'}`);
    console.log(`📊 JSON Processing: ${status.jsonProcessing ? '✅' : '❌'}`);
    console.log(`⚡ Running Tasks: ${status.runningTasks}`);
    console.log(`📋 Task History: ${status.taskHistory} executions`);
    
    if (verbose) {
      console.log('\n📈 Recent Task Executions:');
      console.log('─────────────────────────────');
      
      const taskHistory = this.orchestrator.getTaskStatus();
      const recentTasks = taskHistory.slice(-10); // Last 10 tasks
      
      if (recentTasks.length === 0) {
        console.log('   No recent task executions');
      } else {
        recentTasks.forEach(task => {
          const status = task.status === 'completed' ? '✅' : 
                        task.status === 'failed' ? '❌' : 
                        task.status === 'running' ? '⚡' : '⏳';
          
          console.log(`   ${status} ${task.task_id} - ${task.started_at.toLocaleString()}`);
        });
      }
    }
    
    console.log('\n💡 Use --verbose for detailed information');
  }

  private async triggerTask(taskId: string, data?: string): Promise<void> {
    if (!taskId) {
      throw new Error('Task ID is required for trigger command');
    }
    
    console.log(`🎯 Triggering task: ${taskId}\n`);
    
    let triggerData: any = undefined;
    if (data) {
      try {
        triggerData = JSON.parse(data);
      } catch (error) {
        throw new Error('Invalid JSON data provided');
      }
    }
    
    await this.orchestrator.triggerTask(taskId, triggerData);
    
    console.log('✅ Task triggered successfully');
    console.log('📊 Check status to monitor execution progress');
  }

  private async listTasks(verbose?: boolean): Promise<void> {
    console.log('📋 Available JSON-Defined Tasks\n');
    
    // Read task definitions from JSON files
    const fs = require('fs/promises');
    const path = require('path');
    
    try {
      const configPath = path.resolve('config/tasks/pipeline-tasks.json');
      const content = await fs.readFile(configPath, 'utf8');
      const taskDefinitions = JSON.parse(content);
      
      const categories = [
        { name: 'Prospecting Tasks', tasks: taskDefinitions.prospecting_tasks },
        { name: 'Outreach Tasks', tasks: taskDefinitions.outreach_tasks },
        { name: 'Pipeline Tasks', tasks: taskDefinitions.pipeline_tasks },
        { name: 'Analytics Tasks', tasks: taskDefinitions.analytics_tasks },
        { name: 'Maintenance Tasks', tasks: taskDefinitions.maintenance_tasks }
      ];
      
      categories.forEach(category => {
        if (category.tasks && category.tasks.length > 0) {
          console.log(`## ${category.name}`);
          console.log('─'.repeat(category.name.length + 3));
          
          category.tasks.forEach((task: any) => {
            const status = task.enabled ? '✅' : '❌';
            const type = task.type === 'scheduled' ? '⏰' : 
                        task.type === 'triggered' ? '🎯' : '👤';
            
            console.log(`   ${status} ${type} ${task.id} - ${task.name}`);
            
            if (verbose) {
              console.log(`      📝 ${task.description}`);
              if (task.schedule) {
                console.log(`      ⏰ Schedule: ${task.schedule}`);
              }
              if (task.trigger) {
                console.log(`      🎯 Trigger: ${task.trigger}`);
              }
              console.log(`      🤖 Agent: ${task.agent}`);
              console.log(`      📊 Output: ${task.output.destination}`);
              console.log('');
            }
          });
          
          console.log('');
        }
      });
      
      if (!verbose) {
        console.log('💡 Use --verbose for detailed task information');
      }
      
    } catch (error) {
      throw new Error('Failed to load task definitions: ' + error.message);
    }
  }

  private showHelp(): void {
    console.log(`
🎯 MHM JSON Task Management CLI

Usage: npm run task-manager <command> [options]

Commands:
  start              Start the JSON task management system
  stop               Stop the task management system  
  status             Show system status
  trigger <taskId>   Manually trigger a specific task
  list               List all available JSON-defined tasks

Options:
  --verbose          Show detailed information
  --data <json>      JSON data to pass to triggered task

Examples:
  npm run task-manager start
  npm run task-manager status --verbose
  npm run task-manager trigger daily_prospect_generation
  npm run task-manager trigger pitch_generation --data '{"prospect_id":"123"}'
  npm run task-manager list --verbose

Features:
  ✅ JSON-based task definitions
  ✅ Local processing only
  ✅ JSON → Obsidian pipeline
  ✅ Scheduled and triggered tasks
  ✅ All dashboards in Obsidian
  ✅ No external dependencies
    `);
  }
}

// Parse command line arguments
function parseArgs(): TaskManagerCLIOptions {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    return { command: 'status' }; // Default command
  }
  
  const command = args[0] as TaskManagerCLIOptions['command'];
  const options: TaskManagerCLIOptions = { command };
  
  // Parse additional arguments
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg === '--data' && i + 1 < args.length) {
      options.data = args[++i];
    } else if (!arg.startsWith('--')) {
      // Assume it's a task ID for trigger command
      options.taskId = arg;
    }
  }
  
  return options;
}

// Run the CLI
if (require.main === module) {
  const cli = new TaskManagerCLI();
  const options = parseArgs();
  
  cli.run(options).catch(error => {
    console.error('💥 CLI failed:', error);
    process.exit(1);
  });
}

export { TaskManagerCLI };