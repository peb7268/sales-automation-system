#!/usr/bin/env tsx
/**
 * Test API Health Check Functionality
 * Usage: npx tsx test-api-health.ts
 */

import dotenv from 'dotenv';
import path from 'path';
// Load .env from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

import { ApiHealthChecker } from './src/utils/api-health-checker';
import { MastraProspectingAgent } from './src/agents/mastra/MastraProspectingAgent';

async function testApiHealth() {
  console.log('🔍 Testing API Health Check System\n');
  
  // Test 1: Direct API Health Checker
  console.log('='.repeat(60));
  console.log('Test 1: Direct API Health Checker');
  console.log('='.repeat(60));
  
  const healthChecker = new ApiHealthChecker();
  const report = await healthChecker.checkAllApis();
  
  healthChecker.displayHealthReport(report);
  
  if (!report.allHealthy) {
    console.log('⚠️  API issues detected. Testing user prompt functionality...');
    const action = await healthChecker.promptUserOnFailure(report);
    console.log(`User would be prompted with action: ${action}\n`);
  }
  
  // Test 2: Agent Integration
  console.log('='.repeat(60));
  console.log('Test 2: Agent API Health Integration');
  console.log('='.repeat(60));
  
  const agent = new MastraProspectingAgent();
  
  try {
    const healthCheck = await agent.checkApiHealth();
    console.log(`✅ Agent health check result: ${healthCheck.action}`);
    
    if (!healthCheck.healthy) {
      console.log('❌ Agent would halt prospect research due to API failures');
    } else {
      console.log('✅ Agent would proceed with full functionality');
    }
    
  } catch (error) {
    console.log(`❌ Agent would throw error: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('API Health Check Test Complete');
  console.log('='.repeat(60));
}

// Run the test
testApiHealth().catch(console.error);