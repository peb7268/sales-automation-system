#!/usr/bin/env tsx
/**
 * Utility to check prospect processing status and manage retries
 * Usage: npm run prospect:status [business-name] [--retry-all]
 */

import dotenv from 'dotenv';
dotenv.config();

import { IncrementalProspectSync } from '../utils/obsidian/incremental-prospect-sync';
import { Logger } from '../utils/logging';

class ProspectStatusCLI {
  private logger: Logger;
  private incrementalSync: IncrementalProspectSync;

  constructor() {
    this.logger = new Logger('ProspectStatusCLI');
    
    const vaultPath = process.env.OBSIDIAN_VAULT_PATH;
    if (!vaultPath) {
      throw new Error('OBSIDIAN_VAULT_PATH environment variable is required');
    }
    
    this.incrementalSync = new IncrementalProspectSync(vaultPath);
  }

  async run(): Promise<void> {
    try {
      const args = process.argv.slice(2);
      
      if (args.includes('--help')) {
        this.showHelp();
        return;
      }

      if (args.includes('--retry-all')) {
        await this.showRetryAllStatus();
      } else if (args.length > 0) {
        await this.showBusinessStatus(args[0]);
      } else {
        await this.showOverallStatus();
      }

    } catch (error: any) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  }

  private showHelp(): void {
    console.log(`
🔍 Prospect Processing Status Utility

Usage:
  npm run prospect:status                    # Show overall status
  npm run prospect:status "Business Name"   # Show specific business status
  npm run prospect:status --retry-all       # Show all prospects needing retry

Examples:
  npm run prospect:status "Farro"
  npm run prospect:status --retry-all
    `);
  }

  private async showBusinessStatus(businessName: string): Promise<void> {
    console.log(`🔍 Checking status for: ${businessName}\n`);

    const status = await this.incrementalSync.getProcessingStatus(businessName);
    
    if (!status) {
      console.log(`❌ No processing history found for "${businessName}"`);
      console.log(`💡 Add this prospect with: npm run add-prospect-enhanced "${businessName}"`);
      return;
    }

    console.log(`📊 Processing History:`);
    console.log(`   - Total Attempts: ${status.totalAttempts}`);
    console.log(`   - Last Attempt: ${new Date(status.lastAttempt).toLocaleString()}`);
    console.log(`   - Successful Passes: [${status.successfulPasses.join(', ') || 'none'}]`);
    console.log(`   - Failed Passes: [${status.failedPasses.join(', ') || 'none'}]`);
    console.log(`   - Next Retry Passes: [${status.nextRetryPasses.join(', ') || 'none'}]`);

    if (status.attempts.length > 0) {
      const lastAttempt = status.attempts[status.attempts.length - 1];
      console.log(`\n📋 Last Attempt Details:`);
      console.log(`   - Status: ${lastAttempt.status}`);
      console.log(`   - Timestamp: ${new Date(lastAttempt.timestamp).toLocaleString()}`);
      console.log(`   - Data Extracted: [${lastAttempt.dataExtracted.join(', ') || 'none'}]`);
      if (lastAttempt.errors.length > 0) {
        console.log(`   - Errors: ${lastAttempt.errors.join(', ')}`);
      }
    }

    // Provide recommendations
    console.log(`\n💡 Recommendations:`);
    if (status.nextRetryPasses.length > 0) {
      console.log(`   🔄 Retry needed for passes: ${status.nextRetryPasses.join(', ')}`);
      console.log(`   📝 Command: npm run add-prospect-enhanced "${businessName}" --retry`);
    } else if (status.successfulPasses.length === 5) {
      console.log(`   ✅ All passes completed successfully - no action needed`);
    } else if (status.failedPasses.length > 0) {
      console.log(`   ⚠️ Some passes failed permanently - manual research may be needed`);
      console.log(`   🔄 Try retry anyway: npm run add-prospect-enhanced "${businessName}" --retry`);
    }
  }

  private async showOverallStatus(): Promise<void> {
    console.log('📊 Overall Prospect Processing Status\n');

    const prospectsNeedingRetry = await this.incrementalSync.getProspectsNeedingRetry();
    
    console.log(`🔄 Prospects Needing Retry: ${prospectsNeedingRetry.length}`);
    
    if (prospectsNeedingRetry.length > 0) {
      console.log('\nProspects with failed passes:');
      prospectsNeedingRetry.forEach(prospect => {
        console.log(`  - ${prospect.businessName}: passes [${prospect.nextRetryPasses.join(', ')}]`);
      });

      console.log('\n💡 Retry Commands:');
      prospectsNeedingRetry.slice(0, 5).forEach(prospect => {
        const displayName = prospect.businessName.split('-').map(w => 
          w.charAt(0).toUpperCase() + w.slice(1)
        ).join(' ');
        console.log(`  npm run add-prospect-enhanced "${displayName}" --retry`);
      });

      if (prospectsNeedingRetry.length > 5) {
        console.log(`  ... and ${prospectsNeedingRetry.length - 5} more`);
      }
    } else {
      console.log('\n✅ No prospects currently need retry processing');
    }

    console.log('\n📝 Quick Commands:');
    console.log('  npm run prospect:status --retry-all     # Show detailed retry status');
    console.log('  npm run prospect:status "Business Name" # Check specific business');
    console.log('  npm run add-prospect-enhanced "Name"    # Add new prospect');
  }

  private async showRetryAllStatus(): Promise<void> {
    console.log('🔄 Detailed Retry Status for All Prospects\n');

    const prospectsNeedingRetry = await this.incrementalSync.getProspectsNeedingRetry();
    
    if (prospectsNeedingRetry.length === 0) {
      console.log('✅ No prospects currently need retry processing');
      return;
    }

    console.log(`Found ${prospectsNeedingRetry.length} prospects needing retry:\n`);

    for (const prospect of prospectsNeedingRetry) {
      const displayName = prospect.businessName.split('-').map(w => 
        w.charAt(0).toUpperCase() + w.slice(1)
      ).join(' ');

      console.log(`📋 ${displayName}`);
      console.log(`   - Failed Passes: [${prospect.nextRetryPasses.join(', ')}]`);
      
      const status = await this.incrementalSync.getProcessingStatus(prospect.businessName);
      if (status) {
        console.log(`   - Total Attempts: ${status.totalAttempts}`);
        console.log(`   - Last Attempt: ${new Date(status.lastAttempt).toLocaleString()}`);
        
        if (status.attempts.length > 0) {
          const lastAttempt = status.attempts[status.attempts.length - 1];
          if (lastAttempt.errors.length > 0) {
            console.log(`   - Last Errors: ${lastAttempt.errors.slice(0, 2).join(', ')}`);
          }
        }
      }
      console.log(`   - Retry: npm run add-prospect-enhanced "${displayName}" --retry\n`);
    }

    console.log('💡 To retry all failed prospects, run each command above individually.');
  }
}

// Run if called directly
if (require.main === module) {
  const cli = new ProspectStatusCLI();
  cli.run().catch(console.error);
}