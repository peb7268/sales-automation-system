#!/usr/bin/env tsx
/**
 * Test Complete BCER Prospect Workflow
 */

import dotenv from 'dotenv';
import path from 'path';
// Load .env from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

import { MastraProspectingAgent } from './src/agents/mastra/MastraProspectingAgent';
import { GeographicFilter } from './src/types/prospect';

async function testFullWorkflow() {
  console.log('🎯 Testing Complete BCER Prospect Workflow\n');

  // Verify environment variables are loaded
  console.log('🔑 Environment Check:');
  console.log('GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? '✅ Loaded' : '❌ Missing');
  console.log('FIRECRAWL_API_KEY:', process.env.FIRECRAWL_API_KEY ? '✅ Loaded' : '❌ Missing');
  console.log('PERPLEXITY_API_KEY:', process.env.PERPLEXITY_API_KEY ? '✅ Loaded' : '❌ Missing');
  console.log('');

  // Create agent
  const agent = new MastraProspectingAgent();

  // Test API health first
  console.log('🔍 Running API Health Check...');
  try {
    const healthCheck = await agent.checkApiHealth();
    console.log(`Health Check Result: ${healthCheck.healthy ? '✅' : '❌'} ${healthCheck.action}`);
    
    if (!healthCheck.healthy && healthCheck.action.includes('CRITICAL')) {
      console.log('❌ API health check failed. Stopping workflow.');
      return;
    }
  } catch (error) {
    console.error('❌ Health check error:', error.message);
    return;
  }

  // Run prospect research
  console.log('\n🔄 Starting Prospect Research...');
  const filter: GeographicFilter = {
    businessName: 'BCER Engineering',
    location: 'Colorado',
    industry: 'Engineering',
    limit: 1
  };

  try {
    const results = await agent.prospect(filter);
    console.log('\n✅ Prospect Research Completed!');
    console.log(`Total Prospects: ${results.totalFound}`);
    console.log(`Processing Time: ${results.processingTime}ms`);
    console.log(`API Calls Used:`, results.apiCallsUsed);
  } catch (error) {
    console.error('❌ Prospect research failed:', error.message);
  }
}

// Run the test
testFullWorkflow().catch(console.error);