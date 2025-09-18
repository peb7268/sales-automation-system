#!/usr/bin/env npx tsx

/**
 * Fix Dataview Queries Script
 * Scans and fixes any remaining problematic Dataview queries in the dashboard
 */

import * as fs from 'fs/promises';
import * as path from 'path';

const DASHBOARD_PATH = process.env.OBSIDIAN_DASHBOARD_FILE || 
  '/Users/pbarrick/Documents/Main/Projects/Sales/Sales-Analytics-Dashboard.md';

async function fixDataviewQueries() {
  try {
    console.log('🔧 Scanning for problematic Dataview queries...\n');
    
    // Read the dashboard file
    const content = await fs.readFile(DASHBOARD_PATH, 'utf8');
    
    let updatedContent = content;
    let fixCount = 0;
    
    // Fix 1: Replace old path structure
    const oldPathRegex = /FROM "Projects\/Sales\/Prospects"(?!\*)/g;
    const newPath = 'FROM "Projects/Sales/Prospects/*/index"';
    
    if (oldPathRegex.test(content)) {
      updatedContent = updatedContent.replace(oldPathRegex, newPath);
      fixCount++;
      console.log('✅ Fixed: Updated old path structure to use */index pattern');
    }
    
    // Fix 2: Replace count(rows) with length(rows) in GROUP BY queries
    const countRowsRegex = /count\(rows\)/g;
    const lengthRows = 'length(rows)';
    
    if (countRowsRegex.test(updatedContent)) {
      updatedContent = updatedContent.replace(countRowsRegex, lengthRows);
      fixCount++;
      console.log('✅ Fixed: Replaced count(rows) with length(rows)');
    }
    
    // Fix 3: Fix field references in GROUP BY queries to use rows.field
    const fieldReferences = [
      { old: /avg\(qualification_score\)/g, new: 'avg(rows.qualification_score)' },
      { old: /sum\(estimated_revenue\)/g, new: 'sum(rows.estimated_revenue)' },
      { old: /avg\(estimated_revenue\)/g, new: 'avg(rows.estimated_revenue)' }
    ];
    
    fieldReferences.forEach(({ old, new: newField }) => {
      if (old.test(updatedContent)) {
        updatedContent = updatedContent.replace(old, newField);
        fixCount++;
        console.log(`✅ Fixed: Updated field reference to ${newField}`);
      }
    });
    
    // Fix 4: Remove any SELECT subqueries that might still exist
    const selectSubqueryRegex = /\(SELECT[^)]+\)/g;
    if (selectSubqueryRegex.test(updatedContent)) {
      updatedContent = updatedContent.replace(selectSubqueryRegex, '0');
      fixCount++;
      console.log('✅ Fixed: Removed SELECT subqueries');
    }
    
    // Fix 5: Fix any malformed GROUP BY clauses
    const malformedGroupBy = /GROUP BY (.+) as "(.+)"/g;
    updatedContent = updatedContent.replace(malformedGroupBy, (match, field, alias) => {
      fixCount++;
      console.log(`✅ Fixed: Corrected GROUP BY clause for ${field}`);
      return `GROUP BY ${field}`;
    });
    
    // Write the fixed content back to the file
    if (fixCount > 0) {
      await fs.writeFile(DASHBOARD_PATH, updatedContent, 'utf8');
      console.log(`\n🎉 Successfully applied ${fixCount} fixes to the dashboard!`);
      console.log(`📄 Updated file: ${DASHBOARD_PATH}`);
    } else {
      console.log('✅ No issues found - all Dataview queries are already correct!');
    }
    
    // Verify by checking for common error patterns
    console.log('\n🔍 Verification check:');
    const errorPatterns = [
      { pattern: /count\(rows\)/, name: 'count(rows) usage' },
      { pattern: /FROM "Projects\/Sales\/Prospects"(?!\*)/, name: 'old path structure' },
      { pattern: /SELECT[^}]+FROM/, name: 'SELECT subqueries' }
    ];
    
    let hasErrors = false;
    errorPatterns.forEach(({ pattern, name }) => {
      if (pattern.test(updatedContent)) {
        console.log(`❌ Still found: ${name}`);
        hasErrors = true;
      } else {
        console.log(`✅ Clean: No ${name} found`);
      }
    });
    
    if (!hasErrors) {
      console.log('\n🟢 All Dataview queries should now be working correctly!');
    } else {
      console.log('\n🟡 Some issues may still remain - manual review recommended');
    }
    
  } catch (error) {
    console.error('❌ Error fixing Dataview queries:', error);
    process.exit(1);
  }
}

// Run the fix script
if (require.main === module) {
  fixDataviewQueries().catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}

export { fixDataviewQueries };