#!/usr/bin/env tsx
/**
 * Test Complete BCER Comprehensive Prospect Generation
 * This will generate the full competitive intelligence package
 */

import dotenv from 'dotenv';
import path from 'path';
// Load .env from current directory
dotenv.config({ path: path.join(__dirname, '.env') });

import { MastraProspectingAgent } from './src/agents/mastra/MastraProspectingAgent';
import { GeographicFilter } from './src/types/prospect';

async function testBCERComprehensive() {
  console.log('🎯 Testing Complete BCER Comprehensive Prospect Generation\n');

  // Verify environment variables are loaded
  console.log('🔑 Environment Check:');
  console.log('GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? '✅ Loaded' : '❌ Missing');
  console.log('FIRECRAWL_API_KEY:', process.env.FIRECRAWL_API_KEY ? '✅ Loaded' : '❌ Missing');
  console.log('PERPLEXITY_API_KEY:', process.env.PERPLEXITY_API_KEY ? '✅ Loaded' : '❌ Missing');
  console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✅ Loaded' : '❌ Missing');
  console.log('OBSIDIAN_VAULT_PATH:', process.env.OBSIDIAN_VAULT_PATH ? '✅ Loaded' : '❌ Missing');
  console.log('');

  // Create agent
  const agent = new MastraProspectingAgent();

  console.log('🔄 Starting Comprehensive BCER Prospect Research...');
  const filter: GeographicFilter = {
    businessName: 'BCER Engineering',
    location: 'Colorado',
    industry: 'Engineering',
    limit: 1
  };

  try {
    const results = await agent.prospect(filter);
    console.log('\n✅ BCER Comprehensive Research Completed!');
    console.log(`Total Prospects: ${results.totalFound}`);
    console.log(`Processing Time: ${results.processingTime}ms`);
    console.log(`API Calls Used:`, results.apiCallsUsed);
    
    console.log('\n🔍 Checking Generated Files...');
    
    // Check if comprehensive files were generated
    const fs = require('fs');
    const prospectPath = '/Users/pbarrick/Documents/Main/Projects/Sales/Prospects/bcer-engineering';
    
    console.log('\n📁 File Structure Generated:');
    
    try {
      const files = fs.readdirSync(prospectPath, { withFileTypes: true });
      for (const file of files) {
        if (file.isDirectory()) {
          console.log(`📁 ${file.name}/`);
          const subFiles = fs.readdirSync(path.join(prospectPath, file.name));
          for (const subFile of subFiles) {
            console.log(`  📄 ${subFile}`);
          }
        } else {
          console.log(`📄 ${file.name}`);
        }
      }
    } catch (error) {
      console.log('❌ Could not read prospect directory:', error.message);
    }
    
  } catch (error) {
    console.error('❌ BCER comprehensive research failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testBCERComprehensive().catch(console.error);