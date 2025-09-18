#!/usr/bin/env npx tsx

/**
 * Prospect Migration Script
 * Migrates existing flat prospect files to new folder-based structure
 * 
 * Usage:
 *   npm run migrate-prospects
 *   npx tsx scripts/migrate-prospects-to-folders.ts
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { prospectFolderManager, sanitizeProspectName, getProspectFolderPath } from '../src/utils/obsidian/prospect-folder-manager';
import { parseFrontmatter } from '../src/utils/obsidian/frontmatter-parser';
import { logger } from '../src/utils/logging';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PROSPECTS_PATH = process.env.OBSIDIAN_PROSPECTS_PATH || '/Users/pbarrick/Documents/Main/Projects/Sales/Prospects';

async function migrateProspects() {
  console.log('🔄 Starting prospect migration to folder structure...\n');
  
  let migrated = 0;
  let skipped = 0;
  let errors = 0;
  
  try {
    // Check if prospects directory exists
    try {
      await fs.access(PROSPECTS_PATH);
    } catch {
      console.log('❌ Prospects directory does not exist. Creating it...');
      await fs.mkdir(PROSPECTS_PATH, { recursive: true });
      console.log('✅ Created prospects directory');
      return;
    }

    const items = await fs.readdir(PROSPECTS_PATH, { withFileTypes: true });
    console.log(`📂 Found ${items.length} items in prospects directory\n`);

    for (const item of items) {
      try {
        // Skip directories (already migrated or other folders)
        if (item.isDirectory()) {
          console.log(`⏭️  Skipping directory: ${item.name}`);
          skipped++;
          continue;
        }

        // Only process .md files
        if (!item.name.endsWith('.md')) {
          console.log(`⏭️  Skipping non-markdown file: ${item.name}`);
          skipped++;
          continue;
        }

        const filePath = path.join(PROSPECTS_PATH, item.name);
        const content = await fs.readFile(filePath, 'utf8');
        const { frontmatter } = parseFrontmatter(content);

        // Only migrate prospect-profile files
        if (frontmatter.type !== 'prospect-profile') {
          console.log(`⏭️  Skipping non-prospect file: ${item.name}`);
          skipped++;
          continue;
        }

        const companyName = frontmatter.company;
        if (!companyName) {
          console.log(`❌ No company name found in ${item.name}, skipping`);
          errors++;
          continue;
        }

        console.log(`🔄 Migrating: ${companyName}`);

        // Create folder structure
        const sanitizedName = sanitizeProspectName(companyName);
        const folderPath = getProspectFolderPath(companyName);
        
        // Check if folder already exists
        try {
          await fs.access(folderPath);
          console.log(`   ⏭️  Folder already exists, skipping: ${sanitizedName}`);
          skipped++;
          continue;
        } catch {
          // Folder doesn't exist, proceed with migration
        }

        // Create the folder
        await fs.mkdir(folderPath, { recursive: true });
        console.log(`   📁 Created folder: ${sanitizedName}`);

        // Move the original file to index.md
        const indexPath = path.join(folderPath, 'index.md');
        
        // Update the content to reference the pitch file
        const updatedContent = content + '\n\n---\n*For custom pitch content, see: [[pitch|Custom Pitch]]*';
        
        await fs.writeFile(indexPath, updatedContent, 'utf8');
        console.log(`   📄 Created index.md`);

        // Create pitch placeholder
        const pitchPath = path.join(folderPath, 'pitch.md');
        const pitchContent = createPitchPlaceholder(frontmatter);
        await fs.writeFile(pitchPath, pitchContent, 'utf8');
        console.log(`   📝 Created pitch.md placeholder`);

        // Remove the original file
        await fs.unlink(filePath);
        console.log(`   🗑️  Removed original file: ${item.name}`);

        migrated++;
        console.log(`   ✅ Successfully migrated: ${companyName}\n`);

      } catch (error) {
        console.error(`❌ Error migrating ${item.name}:`, error);
        errors++;
      }
    }

    // Migration summary
    console.log('📊 Migration Summary:');
    console.log('─────────────────────');
    console.log(`✅ Successfully migrated: ${migrated} prospects`);
    console.log(`⏭️  Skipped: ${skipped} items`);
    console.log(`❌ Errors: ${errors} items`);
    console.log('');

    if (migrated > 0) {
      console.log('🎉 Migration completed successfully!');
      console.log('');
      console.log('📋 Next steps:');
      console.log('1. Update your Dataview queries to point to index files');
      console.log('2. Test the analytics dashboard');
      console.log('3. Verify Kanban board integration');
      console.log('4. Run: npm run analytics:daily');
    } else {
      console.log('ℹ️  No prospects were migrated. They may already be in folder format.');
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
    logger.error('Prospect migration failed:', error);
    process.exit(1);
  }
}

function createPitchPlaceholder(frontmatter: any): string {
  const companyName = frontmatter.company;
  const industry = frontmatter.industry;
  const qualificationScore = frontmatter.qualification_score;
  const businessSize = frontmatter.business_size;
  const estimatedRevenue = frontmatter.estimated_revenue;

  return `---
type: prospect-pitch
company: "${companyName}"
industry: ${industry}
created: "${new Date().toISOString().split('T')[0]}T${new Date().toTimeString().split(' ')[0]}.000Z"
updated: "${new Date().toISOString().split('T')[0]}T${new Date().toTimeString().split(' ')[0]}.000Z"
status: pending
pitch_version: 1.0
tags: [sales, pitch, ${industry}, migrated]
---

# Custom Pitch - ${companyName}

> **This file will be populated by the Pitch Creator Agent**
> 
> The AI agent will analyze the prospect data from the index file and create a customized pitch based on their specific business needs, industry challenges, and growth opportunities.

## 🎯 Pitch Components (To be generated)

### Hook & Attention Grabber
*AI will craft an industry-specific opening that resonates with ${industry} businesses*

### Value Proposition  
*Customized value prop based on their digital presence gaps and revenue potential*

### Proof Points & Case Studies
*Relevant success stories from similar ${industry} businesses*

### ROI Projection
*Specific financial impact projections based on their estimated revenue and business size*

### Call to Action
*Tailored next steps based on their pipeline stage and qualification score*

---

## 📊 Prospect Context for AI Agent

**Qualification Score**: ${qualificationScore}/100
**Business Size**: ${businessSize}
**Revenue Estimate**: $${estimatedRevenue?.toLocaleString() || 'Unknown'}

**Key Opportunity Areas**:
- Website optimization
- Social media presence  
- Online review management
- Local SEO improvements
- Digital advertising strategy

---
*This pitch will be customized by the MHM Pitch Creator Agent*
*Prospect data source: [[index|Prospect Profile]]*`;
}

// Run the migration
migrateProspects().catch(console.error);