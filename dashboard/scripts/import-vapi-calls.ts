#!/usr/bin/env node

// Script to import historical calls from Vapi API
import { VapiClient } from '../lib/vapi/vapi-client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from the sales root .env file
const envPath = resolve(__dirname, '../../../../.env');
console.log('Loading environment from:', envPath);
const result = config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('Environment loaded successfully');
  // Remove quotes from VAPI_API_KEY if present
  if (process.env.VAPI_API_KEY) {
    process.env.VAPI_API_KEY = process.env.VAPI_API_KEY.replace(/['"]/g, '');
  }
  if (process.env.VAPI_BASE_URL) {
    process.env.VAPI_BASE_URL = process.env.VAPI_BASE_URL.replace(/['"]/g, '');
  }
}

async function importVapiCalls() {
  console.log('🚀 Starting Vapi historical data import...\n');
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const fromArg = args.find(arg => arg.startsWith('--from='));
  const toArg = args.find(arg => arg.startsWith('--to='));
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  
  const fromDate = fromArg ? new Date(fromArg.split('=')[1]) : undefined;
  const toDate = toArg ? new Date(toArg.split('=')[1]) : undefined;
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : undefined;
  
  if (fromDate) {
    console.log(`📅 Importing calls from: ${fromDate.toISOString()}`);
  }
  if (toDate) {
    console.log(`📅 Importing calls until: ${toDate.toISOString()}`);
  }
  if (limit) {
    console.log(`🔢 Limiting to ${limit} calls`);
  }
  
  console.log('\n');
  
  try {
    // Check for API key
    if (!process.env.VAPI_API_KEY) {
      throw new Error('VAPI_API_KEY not found in environment variables');
    }
    
    console.log('🔑 API Key found:', process.env.VAPI_API_KEY?.substring(0, 8) + '...');
    console.log('🌐 Base URL:', process.env.VAPI_BASE_URL || 'https://api.vapi.ai');
    console.log('\n');
    
    // Initialize Vapi client
    const client = new VapiClient(
      process.env.VAPI_API_KEY,
      process.env.VAPI_BASE_URL
    );
    
    // Progress tracking
    let processedCount = 0;
    const startTime = Date.now();
    
    const onProgress = (current: number, total: number) => {
      processedCount = current;
      const percentage = Math.round((current / total) * 100);
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      
      // Only clear line if we're in a TTY environment
      if (process.stdout.isTTY) {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(
          `⏳ Processing: ${current}/${total} (${percentage}%) - Elapsed: ${elapsed}s`
        );
      } else {
        console.log(`⏳ Processing: ${current}/${total} (${percentage}%) - Elapsed: ${elapsed}s`);
      }
    };
    
    // Perform the sync
    console.log('📡 Fetching calls from Vapi API...\n');
    
    const result = await client.syncHistoricalCalls(
      fromDate,
      toDate,
      onProgress
    );
    
    // Clear the progress line if we're in a TTY environment
    if (process.stdout.isTTY) {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
    }
    
    // Calculate statistics
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const totalProcessed = result.imported + result.updated + result.failed;
    const callsPerSecond = totalTime > 0 ? (totalProcessed / totalTime).toFixed(2) : '0';
    
    // Display results
    console.log('\n✅ Import Complete!\n');
    console.log('📊 Results Summary:');
    console.log('─'.repeat(40));
    console.log(`✨ New calls imported:    ${result.imported}`);
    console.log(`🔄 Existing calls updated: ${result.updated}`);
    console.log(`❌ Failed imports:         ${result.failed}`);
    console.log(`⏱️  Total time:            ${totalTime}s`);
    console.log(`🚀 Processing speed:       ${callsPerSecond} calls/s`);
    console.log('─'.repeat(40));
    
    // Show errors if any
    if (result.errors && result.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    // Show next steps
    console.log('\n📝 Next Steps:');
    console.log('   1. Check the dashboard at http://localhost:3000/calls');
    console.log('   2. Verify imported data in the database');
    console.log('   3. Set up webhook for real-time updates');
    console.log('   4. Configure automated sync schedule if needed\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Check your VAPI_API_KEY in the .env file');
    console.error('   2. Ensure database is running: docker compose ps');
    console.error('   3. Verify network connectivity to api.vapi.ai');
    console.error('   4. Check API rate limits\n');
    
    process.exit(1);
  }
}

// Show usage if --help is passed
if (process.argv.includes('--help')) {
  console.log('Usage: npm run vapi:import [options]\n');
  console.log('Options:');
  console.log('  --from=<date>   Import calls from this date (ISO format)');
  console.log('  --to=<date>     Import calls until this date (ISO format)');
  console.log('  --limit=<n>     Limit the number of calls to import');
  console.log('  --help          Show this help message\n');
  console.log('Examples:');
  console.log('  npm run vapi:import');
  console.log('  npm run vapi:import --from="2024-01-01"');
  console.log('  npm run vapi:import --from="2024-01-01" --to="2024-12-31"');
  console.log('  npm run vapi:import --limit=100\n');
  process.exit(0);
}

// Run the import
importVapiCalls();