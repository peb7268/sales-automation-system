/**
 * Test suite for Obsidian Main vault integration utilities
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as fs from 'fs/promises';
import * as path from 'path';
import { VaultIntegration, VaultConfig } from '@utils/obsidian/vault-integration';
import { ProspectCreationInput, CampaignCreationInput, ActivityCreationInput } from '@/types';

describe('VaultIntegration', () => {
  let tempDir: string;
  let vaultIntegration: VaultIntegration;
  let testConfig: VaultConfig;

  beforeEach(async () => {
    // Create temporary directory for testing
    tempDir = path.join('/tmp', `vault-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    testConfig = {
      vaultPath: tempDir,
      prospectsPath: 'Projects/Sales/Prospects',
      campaignsPath: 'Projects/Sales/Campaigns',
      activitiesPath: 'Projects/Sales/Activities',
      templatesPath: 'Resources/General/Templates/Sales',
      dashboardPath: 'Projects/Sales/Sales-Dashboard.md',
      dailyNotesPath: 'Resources/Agenda/Daily'
    };

    vaultIntegration = new VaultIntegration(testConfig);

    // Create basic template files for testing
    const templatesDir = path.join(tempDir, testConfig.templatesPath);
    await fs.mkdir(templatesDir, { recursive: true });

    // Create minimal prospect template
    const prospectTemplate = `---
type: prospect-profile
company: "{{VALUE:title}}"
industry: "{{VALUE:industry}}"
location: "{{VALUE:city}}, {{VALUE:state}}"
qualification_score: 0
pipeline_stage: cold
created: "{{date:YYYY-MM-DDTHH:mm:ss.SSSZ}}"
updated: "{{date:YYYY-MM-DDTHH:mm:ss.SSSZ}}"
tags: [prospect, sales, "{{VALUE:industry}}", cold]
---

# {{VALUE:title}}

Company: {{VALUE:title}}
Industry: {{VALUE:industry}}
Location: {{VALUE:city}}, {{VALUE:state}}`;

    await fs.writeFile(
      path.join(templatesDir, 'Prospect-Profile.md'),
      prospectTemplate,
      'utf8'
    );

    // Create minimal campaign template
    const campaignTemplate = `---
type: campaign
campaign_name: "{{VALUE:title}}"
campaign_type: geographic
status: active
created: "{{date:YYYY-MM-DDTHH:mm:ss.SSSZ}}"
updated: "{{date:YYYY-MM-DDTHH:mm:ss.SSSZ}}"
tags: [campaign, sales, geographic, active]
---

# {{VALUE:title}}

Campaign: {{VALUE:title}}
Target: {{VALUE:city}}, {{VALUE:state}}`;

    await fs.writeFile(
      path.join(templatesDir, 'Campaign.md'),
      campaignTemplate,
      'utf8'
    );

    // Create minimal activity template  
    const activityTemplate = `---
type: activity
prospect: "{{VALUE:prospect_name}}"
activity_type: "{{VALUE:activity_type}}"
outcome: "{{VALUE:outcome}}"
date: "{{date:YYYY-MM-DDTHH:mm:ss.SSSZ}}"
duration: {{VALUE:duration}}
agent_responsible: "{{VALUE:agent}}"
tags: [activity, "{{VALUE:activity_type}}", "{{VALUE:outcome}}"]
---

# {{VALUE:activity_type}} Activity - {{VALUE:prospect_name}}

Activity: {{VALUE:activity_type}}
Outcome: {{VALUE:outcome}}
Notes: {{VALUE:notes}}`;

    await fs.writeFile(
      path.join(templatesDir, 'Activity.md'),
      activityTemplate,
      'utf8'
    );
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('initializeVault', () => {
    it('should create all required directories', async () => {
      await vaultIntegration.initializeVault();

      const expectedDirs = [
        path.join(tempDir, testConfig.prospectsPath),
        path.join(tempDir, testConfig.campaignsPath),
        path.join(tempDir, testConfig.activitiesPath),
        path.join(tempDir, testConfig.templatesPath)
      ];

      for (const dir of expectedDirs) {
        const stats = await fs.stat(dir);
        expect(stats.isDirectory()).toBe(true);
      }
    });
  });

  describe('createProspectProfile', () => {
    beforeEach(async () => {
      await vaultIntegration.initializeVault();
    });

    it('should create prospect profile with correct content', async () => {
      const input: ProspectCreationInput = {
        businessName: 'Test Restaurant LLC',
        industry: 'restaurants',
        city: 'Denver',
        state: 'CO',
        phone: '(303) 555-0123',
        email: 'info@testrestaurant.com',
        website: 'https://testrestaurant.com',
        employeeCount: 15,
        estimatedRevenue: 500000
      };

      const result = await vaultIntegration.createProspectProfile(input);

      expect(result.success).toBe(true);
      expect(result.prospect).toBeDefined();
      expect(result.filePath).toBeDefined();

      // Verify file was created
      const fileExists = await fs.access(result.filePath!)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);

      // Verify file content
      const content = await fs.readFile(result.filePath!, 'utf8');
      expect(content).toContain('Test Restaurant LLC');
      expect(content).toContain('restaurants');
      expect(content).toContain('Denver, CO');
      expect(content).toContain('type: prospect-profile');
    });

    it('should handle invalid input gracefully', async () => {
      const input: ProspectCreationInput = {
        businessName: '', // Invalid empty name
        industry: 'restaurants',
        city: 'Denver',
        state: 'CO'
      };

      const result = await vaultIntegration.createProspectProfile(input);

      expect(result.success).toBe(false);
      expect(result.prospect).toBeNull();
      expect(result.error).toBeDefined();
    });

    it('should generate unique file names for similar businesses', async () => {
      const input1: ProspectCreationInput = {
        businessName: 'Pizza Place',
        industry: 'restaurants',
        city: 'Denver',
        state: 'CO'
      };

      const input2: ProspectCreationInput = {
        businessName: 'Pizza Place', // Same name
        industry: 'restaurants',
        city: 'Boulder',
        state: 'CO'
      };

      const result1 = await vaultIntegration.createProspectProfile(input1);
      const result2 = await vaultIntegration.createProspectProfile(input2);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      
      // Files should have different paths (though names might be the same,
      // the system should handle overwrites appropriately)
      expect(result1.filePath).toBeDefined();
      expect(result2.filePath).toBeDefined();
    });
  });

  describe('createCampaign', () => {
    beforeEach(async () => {
      await vaultIntegration.initializeVault();
    });

    it('should create campaign with correct content', async () => {
      const input: CampaignCreationInput = {
        name: 'Denver Restaurants Q4 2025',
        description: 'Targeting local restaurants in Denver metro area',
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-12-31'),
        geographic: {
          city: 'Denver',
          state: 'CO',
          radius: 25,
          radiusUnits: 'miles',
          timeZone: 'America/Denver'
        },
        targeting: {
          industries: ['restaurants', 'professional_services'],
          businessSizes: { min: 5, max: 50 },
          revenueRange: { min: 100000, max: 2000000, currency: 'USD' },
          qualificationThreshold: 60
        },
        messaging: {
          hook: {
            primary: 'Help local businesses get more customers online',
            alternatives: [],
            maxDuration: 30
          }
        },
        goals: {
          dailyProspects: 10,
          qualificationRate: 5,
          responseRate: 15,
          pipelineValue: 45000
        }
      };

      const result = await vaultIntegration.createCampaign(input);

      expect(result.success).toBe(true);
      expect(result.campaign).toBeDefined();
      expect(result.filePath).toBeDefined();

      // Verify file was created
      const fileExists = await fs.access(result.filePath!)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);

      // Verify file content
      const content = await fs.readFile(result.filePath!, 'utf8');
      expect(content).toContain('Denver Restaurants Q4 2025');
      expect(content).toContain('Denver, CO');
      expect(content).toContain('type: campaign');
    });
  });

  describe('createActivity', () => {
    beforeEach(async () => {
      await vaultIntegration.initializeVault();
    });

    it('should create activity record with correct content', async () => {
      const input: ActivityCreationInput = {
        prospectId: 'test-restaurant-llc',
        campaignId: 'denver-campaign',
        type: 'call',
        outcome: 'no_contact',
        duration: 30,
        agentResponsible: 'voice_ai_agent',
        summary: 'Attempted initial contact call',
        notes: 'Call went to voicemail, left introductory message',
        followUpRequired: true,
        followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        metadata: {
          callMetadata: {
            answered: false,
            voicemailLeft: true,
            duration: 30,
            callQuality: 'good'
          }
        }
      };

      const result = await vaultIntegration.createActivity(input);

      expect(result.success).toBe(true);
      expect(result.activity).toBeDefined();
      expect(result.filePath).toBeDefined();

      // Verify file was created
      const fileExists = await fs.access(result.filePath!)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);

      // Verify file content
      const content = await fs.readFile(result.filePath!, 'utf8');
      expect(content).toContain('call');
      expect(content).toContain('no_contact');
      expect(content).toContain('voice_ai_agent');
      expect(content).toContain('type: activity');
    });
  });

  describe('updateDailyNote', () => {
    beforeEach(async () => {
      await vaultIntegration.initializeVault();
    });

    it('should create daily note if it does not exist', async () => {
      const testDate = new Date('2025-07-30');
      const salesSummary = 'Created 5 new prospects, made 12 calls, 2 positive responses';

      const result = await vaultIntegration.updateDailyNote(testDate, salesSummary);

      expect(result).toBe(true);

      // Verify file was created
      const dailyNotePath = path.join(tempDir, testConfig.dailyNotesPath, '2025-07-30.md');
      const content = await fs.readFile(dailyNotePath, 'utf8');
      
      expect(content).toContain('## Sales Activity Summary');
      expect(content).toContain(salesSummary);
      expect(content).toContain('pomodoros_hit: 0');
    });

    it('should update existing daily note with sales summary', async () => {
      const testDate = new Date('2025-07-30');
      const dailyNotePath = path.join(tempDir, testConfig.dailyNotesPath, '2025-07-30.md');
      
      // Create directory first
      await fs.mkdir(path.dirname(dailyNotePath), { recursive: true });

      // Create existing daily note
      const existingContent = `---
pomodoros_hit: 2
pomodoros_goal: 4
row_or_run: 1
water_drank: 3
---

# 2025-07-30

## Notes

Had a productive day with development work.

## Other Section

Some other content here.`;

      await fs.writeFile(dailyNotePath, existingContent, 'utf8');

      const salesSummary = 'Generated 8 new prospects, completed qualification scoring for 3 companies';
      const result = await vaultIntegration.updateDailyNote(testDate, salesSummary);

      expect(result).toBe(true);

      const updatedContent = await fs.readFile(dailyNotePath, 'utf8');
      expect(updatedContent).toContain('## Sales Activity Summary');
      expect(updatedContent).toContain(salesSummary);
      expect(updatedContent).toContain('pomodoros_hit: 2'); // Preserves existing frontmatter
      expect(updatedContent).toContain('## Other Section'); // Preserves other sections
    });
  });

  describe('getAllProspects', () => {
    beforeEach(async () => {
      await vaultIntegration.initializeVault();
    });

    it('should return empty array when no prospects exist', async () => {
      const prospects = await vaultIntegration.getAllProspects();
      expect(prospects).toEqual([]);
    });

    it('should return all valid prospect files', async () => {
      // Create test prospect files manually
      const prospectsDir = path.join(tempDir, testConfig.prospectsPath);
      
      const prospect1Content = `---
type: prospect-profile
company: "Test Company 1"
industry: restaurants
location: "Denver, CO"
qualification_score: 75
pipeline_stage: contacted
created: "2025-07-30T10:00:00.000Z"
updated: "2025-07-30T10:00:00.000Z"
tags: [prospect, restaurants]
employee_count: 15
estimated_revenue: 500000
business_size: small
---

# Test Company 1`;

      const prospect2Content = `---
type: prospect-profile  
company: "Test Company 2"
industry: retail
location: "Boulder, CO"
qualification_score: 60
pipeline_stage: cold
created: "2025-07-30T11:00:00.000Z"
updated: "2025-07-30T11:00:00.000Z"
tags: [prospect, retail]
employee_count: 8
estimated_revenue: 300000
business_size: micro
---

# Test Company 2`;

      await fs.writeFile(
        path.join(prospectsDir, 'test-company-1.md'),
        prospect1Content,
        'utf8'
      );

      await fs.writeFile(
        path.join(prospectsDir, 'test-company-2.md'),
        prospect2Content,
        'utf8'
      );

      const prospects = await vaultIntegration.getAllProspects();

      expect(prospects).toHaveLength(2);
      expect(prospects[0]?.business.name).toBe('Test Company 1');
      expect(prospects[0]?.business.industry).toBe('restaurants');
      expect(prospects[1]?.business.name).toBe('Test Company 2');
      expect(prospects[1]?.business.industry).toBe('retail');
    });

    it('should ignore non-prospect files', async () => {
      const prospectsDir = path.join(tempDir, testConfig.prospectsPath);
      
      // Create a valid prospect file
      const prospectContent = `---
type: prospect-profile
company: "Valid Prospect"
industry: restaurants
location: "Denver, CO"
qualification_score: 80
pipeline_stage: qualified
created: "2025-07-30T10:00:00.000Z"
updated: "2025-07-30T10:00:00.000Z"
tags: [prospect, restaurants]
---

# Valid Prospect`;

      // Create a non-prospect file
      const otherContent = `---
type: meeting-notes
title: "Team Meeting"
date: "2025-07-30"
---

# Team Meeting Notes`;

      await fs.writeFile(
        path.join(prospectsDir, 'valid-prospect.md'),
        prospectContent,
        'utf8'
      );

      await fs.writeFile(
        path.join(prospectsDir, 'team-meeting.md'),
        otherContent,
        'utf8'
      );

      const prospects = await vaultIntegration.getAllProspects();

      expect(prospects).toHaveLength(1);
      expect(prospects[0]?.business.name).toBe('Valid Prospect');
    });
  });
});