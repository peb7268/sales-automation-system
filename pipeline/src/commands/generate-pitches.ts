#!/usr/bin/env node

import { pitchCreatorAgent } from '../agents/pitch-creator-agent';
import { prospectFolderManager, sanitizeProspectName } from '../utils/obsidian/prospect-folder-manager';

interface GeneratePitchesOptions {
  prospect?: string;
  all?: boolean;
  force?: boolean;
  verbose?: boolean;
}

async function generatePitches(options: GeneratePitchesOptions = {}) {
  console.log('🎯 MHM Pitch Creator Agent');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    if (options.prospect) {
      // Generate pitch for specific prospect
      console.log(`🔄 Generating pitch for: ${options.prospect}`);
      
      const result = await pitchCreatorAgent.generatePitch(options.prospect);
      
      if (result.success) {
        console.log(`✅ Pitch generated successfully`);
        console.log(`📄 Pitch file: ${result.pitchPath}`);
      } else {
        console.error(`❌ Failed to generate pitch: ${result.error}`);
        process.exit(1);
      }
    } else if (options.all) {
      // Generate pitches for all prospects that need them
      console.log('🔄 Generating pitches for all prospects that need them...\n');
      
      const result = await pitchCreatorAgent.generateAllPitches();
      
      if (result.success) {
        console.log('📊 Pitch Generation Summary:');
        console.log('─────────────────────────');
        
        const successful = result.results.filter(r => r.success);
        const failed = result.results.filter(r => !r.success);
        
        console.log(`✅ Successfully generated: ${successful.length} pitches`);
        if (failed.length > 0) {
          console.log(`❌ Failed: ${failed.length} pitches`);
        }
        console.log(`⏭️  Total processed: ${result.results.length} prospects`);
        
        if (options.verbose) {
          console.log('\n📋 Detailed Results:');
          result.results.forEach(r => {
            const status = r.success ? '✅' : '❌';
            console.log(`   ${status} ${r.prospectFolder}${r.error ? ` - ${r.error}` : ''}`);
          });
        }
      } else {
        console.error(`❌ Failed to generate pitches: ${result.error}`);
        process.exit(1);
      }
    } else {
      // Show prospects that need pitch generation
      console.log('📋 Checking prospects that need pitch generation...\n');
      
      const prospects = await prospectFolderManager.getAllProspects();
      console.log(`📂 Found ${prospects.length} total prospects\n`);
      
      console.log('Available prospects:');
      prospects.forEach(prospect => {
        // Handle both old structure (nested) and new structure (flat frontmatter)
        const companyName = prospect.business?.name || prospect.company || 'Unknown Company';
        const folderName = sanitizeProspectName(companyName);
        console.log(`   📁 ${folderName} (${companyName})`);
      });
      
      console.log('\nUsage:');
      console.log('  npm run generate-pitches -- --all              # Generate for all prospects');
      console.log('  npm run generate-pitches -- --prospect=folder  # Generate for specific prospect');
      console.log('  npm run generate-pitches -- --all --verbose    # Show detailed results');
      console.log('  npm run generate-pitches -- --all --force      # Regenerate all pitches');
    }
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
function parseArgs(): GeneratePitchesOptions {
  const args = process.argv.slice(2);
  const options: GeneratePitchesOptions = {};
  
  args.forEach(arg => {
    if (arg === '--all') {
      options.all = true;
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg.startsWith('--prospect=')) {
      options.prospect = arg.split('=')[1];
    }
  });
  
  return options;
}

// Run the command
if (require.main === module) {
  const options = parseArgs();
  generatePitches(options).catch(error => {
    console.error('💥 Command failed:', error);
    process.exit(1);
  });
}

export { generatePitches };