#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

/**
 * Obsidian vault setup script
 * Creates necessary folders and templates in the Obsidian vault
 */

const VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH;

if (!VAULT_PATH) {
  console.error('❌ OBSIDIAN_VAULT_PATH environment variable not set');
  process.exit(1);
}

if (!fs.existsSync(VAULT_PATH)) {
  console.error(`❌ Obsidian vault path does not exist: ${VAULT_PATH}`);
  process.exit(1);
}

async function createVaultStructure() {
  console.log('🏗️  Setting up Obsidian vault structure...');

  // Create main directories
  const directories = [
    'Sales',
    'Sales/Prospects',
    'Sales/Campaigns', 
    'Sales/Analytics',
    'Sales/Pipeline',
    'Templates',
    'Dashboards'
  ];

  for (const dir of directories) {
    const dirPath = path.join(VAULT_PATH, dir);
    await fs.ensureDir(dirPath);
    console.log(`✅ Created directory: ${dir}`);
  }
}

async function createTemplates() {
  console.log('📄 Creating Obsidian templates...');

  // Prospect Profile Template
  const prospectTemplate = `---
type: prospect-profile
company: "{{company_name}}"
industry: "{{industry}}"
location: "{{city}}, {{state}}"
qualification_score: 0
pipeline_stage: "cold"
created: {{date}}
updated: {{date}}
tags: [prospect, sales, {{industry}}]
---

# {{company_name}}

## Company Information
- **Industry**: {{industry}}
- **Location**: {{city}}, {{state}}
- **Size**: {{employee_count}} employees
- **Revenue**: ${{estimated_revenue}}
- **Website**: {{website}}

## Contact Information
- **Primary Contact**: {{contact_name}}
- **Title**: {{contact_title}}
- **Phone**: {{phone}}
- **Email**: {{email}}
- **Decision Maker**: {{decision_maker}}

## Qualification Score: {{qualification_score}}/100

### Scoring Breakdown
- **Business Size** (20 points): {{business_size_score}}
- **Digital Presence** (25 points): {{digital_presence_score}}
- **Competitor Gaps** (20 points): {{competitor_gaps_score}}
- **Location** (15 points): {{location_score}}
- **Industry** (10 points): {{industry_score}}
- **Revenue Indicators** (10 points): {{revenue_score}}

## Pipeline Stage: {{pipeline_stage}}

## Interaction History
| Date | Type | Outcome | Next Steps |
|------|------|---------|------------|
|      |      |         |            |

## Notes
- Initial research findings
- Pain points identified
- Opportunities discovered

## Competitors Analysis
1. **Large/National Competitors**:
   - Competitor 1
   - Competitor 2

2. **Local Competitors**:
   - Local Competitor 1
   - Local Competitor 2
   - Local Competitor 3

## Next Actions
- [ ] Initial outreach call
- [ ] Send introductory email
- [ ] Research additional contacts
- [ ] Prepare custom pitch`;

  // Campaign Template
  const campaignTemplate = `---
type: campaign
campaign_name: "{{campaign_name}}"
created: {{date}}
status: "active"
tags: [campaign, sales]
---

# {{campaign_name}}

## Campaign Parameters
- **Geographic Target**: {{city}}, {{state}} ({{radius}} mile radius)
- **Industry Focus**: {{industry}}
- **Start Date**: {{start_date}}
- **End Date**: {{end_date}}
- **Status**: {{status}}

## Target Criteria
- **Business Size**: {{min_employees}} - {{max_employees}} employees
- **Revenue Range**: ${{min_revenue}} - ${{max_revenue}}
- **Qualification Threshold**: {{qualification_threshold}}

## Messaging Strategy
### Hook (30 seconds)
{{hook_message}}

### Value Proposition (60 seconds)
{{value_prop_message}}

### Closing (120 seconds)
{{closing_message}}

## Performance Metrics
- **Prospects Identified**: {{prospects_identified}}
- **Contact Attempts**: {{contact_attempts}}
- **Positive Responses**: {{positive_responses}}
- **Qualified Leads**: {{qualified_leads}}
- **Conversion Rate**: {{conversion_rate}}%

## A/B Testing
| Variant | Hook | Response Rate | Notes |
|---------|------|---------------|-------|
| A       |      |               |       |
| B       |      |               |       |

## Notes
Campaign insights and observations`;

  // Activity Template
  const activityTemplate = `---
type: activity
prospect: "{{prospect_company}}"
activity_type: "{{activity_type}}"
date: {{date}}
outcome: "{{outcome}}"
tags: [activity, {{activity_type}}]
---

# {{activity_type}} - {{prospect_company}}

## Activity Details
- **Date**: {{date}}
- **Type**: {{activity_type}}
- **Duration**: {{duration}} minutes
- **Agent**: {{agent_name}}

## Prospect Information
- **Company**: [[{{prospect_company}}]]
- **Contact**: {{contact_name}}
- **Current Stage**: {{current_stage}}

## Outcome
{{outcome_description}}

## Key Points Discussed
- Point 1
- Point 2
- Point 3

## Prospect Response
{{prospect_response}}

## Next Steps
- [ ] {{next_step_1}}
- [ ] {{next_step_2}}
- [ ] Follow up on {{follow_up_date}}

## Notes
Additional observations and context`;

  // Sales Dashboard
  const salesDashboard = `---
type: dashboard
title: "Sales Analytics Dashboard"
tags: [dashboard, analytics, sales]
---

# Sales Analytics Dashboard

## Daily Metrics
\`\`\`chart
type: bar
labels: [Mon, Tue, Wed, Thu, Fri]
series:
  - title: Prospects Identified
    data: [8, 12, 10, 15, 9]
  - title: Qualified Leads
    data: [3, 5, 4, 7, 4]
\`\`\`

## Pipeline Health
\`\`\`chart
type: pie
labels: [Cold, Contacted, Interested, Qualified, Closed]
data: [45, 25, 15, 10, 5]
\`\`\`

## Conversion Funnel
\`\`\`chart
type: line
labels: [Jan, Feb, Mar, Apr, May]
series:
  - title: Prospects
    data: [300, 350, 400, 380, 420]
  - title: Qualified
    data: [30, 35, 40, 38, 42]
  - title: Closed
    data: [3, 4, 5, 4, 5]
\`\`\`

## Performance Targets
- **Year One Revenue Target**: $50,000
- **Monthly Target**: $4,167
- **Daily Prospects Target**: 10
- **Qualification Rate Target**: 10%
- **Close Rate Target**: 10%

## Recent Activities
\`\`\`dataview
TABLE activity_type, prospect, outcome, date
FROM #activity
SORT date DESC
LIMIT 10
\`\`\`

## Top Performing Industries
\`\`\`dataview
TABLE industry, count(rows) as "Prospects", avg(qualification_score) as "Avg Score"
FROM #prospect
GROUP BY industry
SORT count(rows) DESC
\`\`\``;

  // Write templates
  const templates = [
    { path: 'Templates/Prospect-Profile.md', content: prospectTemplate },
    { path: 'Templates/Campaign.md', content: campaignTemplate },
    { path: 'Templates/Activity.md', content: activityTemplate },
    { path: 'Dashboards/Sales-Dashboard.md', content: salesDashboard }
  ];

  for (const template of templates) {
    const templatePath = path.join(VAULT_PATH, template.path);
    await fs.writeFile(templatePath, template.content);
    console.log(`✅ Created template: ${template.path}`);
  }
}

async function createKanbanBoard() {
  console.log('📋 Creating Kanban board...');

  const kanbanBoard = `---

kanban-plugin: basic

---

## Cold

- [ ] Sample Prospect 1 #prospect


## Contacted

- [ ] Sample Prospect 2 #prospect


## Interested

- [ ] Sample Prospect 3 #prospect


## Qualified

- [ ] Sample Prospect 4 #prospect


## Closed

- [ ] Sample Client 1 #client


## Lost

- [ ] Sample Lost Lead #lost



%% kanban:settings
\`\`\`
{"kanban-plugin":"basic","new-note-folder":"Sales/Prospects","new-note-template":"Templates/Prospect-Profile.md"}
\`\`\`
%%`;

  const kanbanPath = path.join(VAULT_PATH, 'Sales/Pipeline/Sales-Pipeline.md');
  await fs.writeFile(kanbanPath, kanbanBoard);
  console.log('✅ Created Kanban board: Sales/Pipeline/Sales-Pipeline.md');
}

async function main() {
  try {
    console.log(`🎯 Setting up Obsidian vault at: ${VAULT_PATH}`);
    
    await createVaultStructure();
    await createTemplates();
    await createKanbanBoard();
    
    console.log('\n🎉 Obsidian vault setup complete!');
    console.log('\nNext steps:');
    console.log('1. Open Obsidian and ensure the following plugins are installed:');
    console.log('   - Charts plugin');
    console.log('   - Kanban plugin');
    console.log('   - Dataview plugin (recommended)');
    console.log('2. Navigate to Sales/Pipeline/Sales-Pipeline.md to see your Kanban board');
    console.log('3. Check Dashboards/Sales-Dashboard.md for analytics');
    console.log('4. Use Templates/ for creating new prospects, campaigns, and activities');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}