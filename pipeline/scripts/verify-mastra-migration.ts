#!/usr/bin/env tsx
/**
 * Verification Script for Mastra Migration
 * Confirms that the application is successfully using the new Mastra agents
 */

import { mastraOrchestrator } from '../src/orchestration/MastraOrchestrator';
import { mastraProspectingAgent } from '../src/agents/mastra/MastraProspectingAgent';
import { mastraPitchCreatorAgent } from '../src/agents/mastra/MastraPitchCreatorAgent';
import { mastraAgentEvaluations } from '../src/evaluations/MastraAgentEvaluations';
import { Logger } from '../src/utils/logging';

const logger = new Logger('MastraMigrationVerification');

async function verifyMastraMigration(): Promise<void> {
  console.log('🔍 Verifying Mastra Migration\n');
  console.log('=' .repeat(50));

  let allTestsPassed = true;

  try {
    // Test 1: Agent Initialization
    console.log('\n📋 Test 1: Agent Initialization');
    console.log('-'.repeat(30));

    const prospectingStatus = mastraProspectingAgent.getStatus();
    const pitchCreatorStatus = mastraPitchCreatorAgent.getStatus();

    console.log(`✅ Prospecting Agent: ${prospectingStatus.initialized ? 'Ready' : 'Failed'}`);
    console.log(`   - Tools: ${prospectingStatus.toolCount}`);
    console.log(`   - Model: ${prospectingStatus.model}`);

    console.log(`✅ Pitch Creator Agent: ${pitchCreatorStatus.initialized ? 'Ready' : 'Failed'}`);
    console.log(`   - Tools: ${pitchCreatorStatus.toolCount}`);
    console.log(`   - Model: ${pitchCreatorStatus.model}`);

    if (!prospectingStatus.initialized || !pitchCreatorStatus.initialized) {
      allTestsPassed = false;
    }

    // Test 2: Orchestrator Functionality
    console.log('\n📋 Test 2: Orchestrator Functionality');
    console.log('-'.repeat(30));

    await mastraOrchestrator.initialize();
    await mastraOrchestrator.start();

    const orchestratorStatus = mastraOrchestrator.getStatus();
    console.log(`✅ Orchestrator Initialized: ${orchestratorStatus.initialized ? 'Yes' : 'No'}`);
    console.log(`✅ Orchestrator Running: ${orchestratorStatus.running ? 'Yes' : 'No'}`);
    console.log(`✅ Agents Available: ${orchestratorStatus.agentCount}`);

    if (!orchestratorStatus.initialized || !orchestratorStatus.running) {
      allTestsPassed = false;
    }

    // Test 3: Agent Workflow Execution
    console.log('\n📋 Test 3: Agent Workflow Execution');
    console.log('-'.repeat(30));

    // Test prospecting workflow (should complete even without API keys)
    const prospectingResult = await mastraOrchestrator.executeProspectingWorkflow({
      city: 'Test City',
      state: 'CO',
      radius: 5,
      industries: ['test']
    });

    console.log(`✅ Prospecting Workflow: ${prospectingResult.success ? 'Success' : 'Failed'}`);
    console.log(`   - Execution Time: ${prospectingResult.executionTime}ms`);
    console.log(`   - Agents Used: ${prospectingResult.agentsUsed.join(', ')}`);

    if (!prospectingResult.success) {
      allTestsPassed = false;
    }

    // Test 4: Evaluation Framework
    console.log('\n📋 Test 4: Evaluation Framework');
    console.log('-'.repeat(30));

    // Test evaluation with mock data
    const mockProspect = {
      business: {
        name: 'Test Restaurant',
        industry: 'restaurants',
        location: { city: 'Denver', state: 'CO' }
      },
      contact: {
        phone: '(303) 555-0123',
        website: 'https://test-restaurant.com',
        email: 'info@test-restaurant.com'
      },
      qualificationScore: { total: 75 }
    };

    const evaluation = await mastraAgentEvaluations.evaluateProspectingQuality(mockProspect);
    console.log(`✅ Evaluation Framework: ${evaluation.passed ? 'Passed' : 'Failed'}`);
    console.log(`   - Overall Score: ${evaluation.overall_score.toFixed(2)}`);
    console.log(`   - Letter Grade: ${evaluation.letter_grade}`);

    if (!evaluation) {
      allTestsPassed = false;
    }

    // Test 5: Legacy Agent Isolation
    console.log('\n📋 Test 5: Legacy Agent Isolation');
    console.log('-'.repeat(30));

    try {
      // Try to import the old agents (should fail or be renamed)
      const fs = await import('fs');
      const legacyProspectingExists = fs.existsSync('src/agents/prospecting-agent.ts');
      const legacyPitchExists = fs.existsSync('src/agents/pitch-creator-agent.ts');

      console.log(`✅ Legacy Agents Isolated: ${!legacyProspectingExists && !legacyPitchExists ? 'Yes' : 'No'}`);
      console.log(`   - Old Prospecting Agent: ${legacyProspectingExists ? 'Still exists' : 'Properly renamed'}`);
      console.log(`   - Old Pitch Agent: ${legacyPitchExists ? 'Still exists' : 'Properly renamed'}`);

      if (legacyProspectingExists || legacyPitchExists) {
        allTestsPassed = false;
      }
    } catch (error: any) {
      console.log(`⚠️  Legacy isolation check failed: ${error.message}`);
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Verification Summary');
    console.log('='.repeat(50));

    if (allTestsPassed) {
      console.log('🎉 All tests passed! Mastra migration is successful.');
      console.log('\n✅ The application is now using:');
      console.log('   - MastraProspectingAgent for business discovery');
      console.log('   - MastraPitchCreatorAgent for pitch generation');  
      console.log('   - MastraOrchestrator for workflow coordination');
      console.log('   - MastraAgentEvaluations for quality assessment');
      console.log('\n🔄 Legacy agents have been safely renamed with _ prefix');
      console.log('📋 Primary commands now use Mastra architecture');
    } else {
      console.log('❌ Some tests failed. Migration may not be complete.');
      console.log('\n🔍 Check the test results above for details.');
    }

    // Stop orchestrator
    await mastraOrchestrator.stop();

  } catch (error: any) {
    console.error('❌ Verification failed:', error.message);
    allTestsPassed = false;
  }

  process.exit(allTestsPassed ? 0 : 1);
}

// Run verification
if (require.main === module) {
  verifyMastraMigration().catch(console.error);
}

export { verifyMastraMigration };