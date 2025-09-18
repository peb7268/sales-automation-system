/**
 * Test suite for Kanban integration utilities
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as fs from 'fs/promises';
import * as path from 'path';
import { KanbanIntegration, KANBAN_STAGES, LANE_TO_STAGE } from '@utils/obsidian/kanban-integration';
import { Prospect, PipelineStage } from '@/types';

describe('KanbanIntegration', () => {
  let tempDir: string;
  let kanbanIntegration: KanbanIntegration;
  let testKanbanFile: string;
  let testProspectsDir: string;

  beforeEach(async () => {
    // Create temporary directory for testing
    tempDir = path.join('/tmp', `kanban-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    testKanbanFile = path.join(tempDir, 'test-kanban.md');
    testProspectsDir = path.join(tempDir, 'prospects');
    
    await fs.mkdir(testProspectsDir, { recursive: true });

    kanbanIntegration = new KanbanIntegration(testKanbanFile, testProspectsDir);

    // Create basic Kanban file structure
    const kanbanContent = `---
kanban-plugin: basic
---

## 🧊 Cold



## 📞 Contacted



## 💬 Interested



## ✅ Qualified



## 💰 Closed Won



## ❌ Closed Lost



## 🧊 Frozen


`;
    await fs.writeFile(testKanbanFile, kanbanContent, 'utf8');
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('KANBAN_STAGES mapping', () => {
    it('should have correct stage to lane mapping', () => {
      expect(KANBAN_STAGES.cold).toBe('🧊 Cold');
      expect(KANBAN_STAGES.contacted).toBe('📞 Contacted');
      expect(KANBAN_STAGES.interested).toBe('💬 Interested');
      expect(KANBAN_STAGES.qualified).toBe('✅ Qualified');
      expect(KANBAN_STAGES.closed_won).toBe('💰 Closed Won');
      expect(KANBAN_STAGES.closed_lost).toBe('❌ Closed Lost');
      expect(KANBAN_STAGES.frozen).toBe('🧊 Frozen');
    });

    it('should have correct reverse lane to stage mapping', () => {
      expect(LANE_TO_STAGE['🧊 Cold']).toBe('cold');
      expect(LANE_TO_STAGE['📞 Contacted']).toBe('contacted');
      expect(LANE_TO_STAGE['💬 Interested']).toBe('interested');
      expect(LANE_TO_STAGE['✅ Qualified']).toBe('qualified');
      expect(LANE_TO_STAGE['💰 Closed Won']).toBe('closed_won');
      expect(LANE_TO_STAGE['❌ Closed Lost']).toBe('closed_lost');
      expect(LANE_TO_STAGE['🧊 Frozen']).toBe('frozen');
    });
  });

  describe('generateKanbanCard', () => {
    it('should generate properly formatted Kanban card', () => {
      const mockProspect: Prospect = {
        id: 'test-id',
        filePath: 'test-restaurant.md',
        created: new Date('2025-07-30T10:00:00Z'),
        updated: new Date('2025-07-30T15:00:00Z'),
        tags: ['prospect', 'restaurants', 'cold'],
        business: {
          name: 'Test Restaurant',
          industry: 'restaurants',
          location: {
            city: 'Denver',
            state: 'CO',
            country: 'US'
          },
          size: {
            category: 'small',
            employeeCount: 15,
            estimatedRevenue: 500000
          },
          digitalPresence: {
            hasWebsite: true,
            hasGoogleBusiness: false,
            hasSocialMedia: false,
            hasOnlineReviews: false
          }
        },
        contact: {
          phone: '(303) 555-0123',
          email: 'info@testrestaurant.com',
          website: 'https://testrestaurant.com'
        },
        pipelineStage: 'cold',
        qualificationScore: {
          total: 45,
          breakdown: {
            businessSize: 15,
            digitalPresence: 10,
            competitorGaps: 0,
            location: 15,
            industry: 5,
            revenueIndicators: 0
          },
          lastUpdated: new Date('2025-07-30T15:00:00Z')
        },
        interactions: [],
        obsidianMeta: {
          templateUsed: 'prospect-profile-template',
          lastSyncDate: new Date('2025-07-30T15:00:00Z')
        }
      };

      const card = kanbanIntegration.generateKanbanCard(mockProspect);

      expect(card).toContain('🍽️ **[[Test Restaurant]]**');
      expect(card).toContain('#prospect #cold');
      expect(card).toContain('📍 Denver, CO');
      expect(card).toContain('⭐ Score: 45/100');
      expect(card).toContain('📅 Updated: 2025-07-30');
    });

    it('should use correct industry emoji', () => {
      const retailProspect: Prospect = {
        id: 'retail-test',
        filePath: 'retail-store.md',
        created: new Date(),
        updated: new Date(),
        tags: ['prospect'],
        business: {
          name: 'Retail Store',
          industry: 'retail',
          location: { city: 'Boulder', state: 'CO', country: 'US' },
          size: { category: 'small' },
          digitalPresence: {
            hasWebsite: false,
            hasGoogleBusiness: false,
            hasSocialMedia: false,
            hasOnlineReviews: false
          }
        },
        contact: {
          phone: '',
          email: '',
          website: ''
        },
        pipelineStage: 'cold',
        qualificationScore: {
          total: 30,
          breakdown: {
            businessSize: 0, digitalPresence: 0, competitorGaps: 0,
            location: 0, industry: 0, revenueIndicators: 0
          },
          lastUpdated: new Date()
        },
        interactions: [],
        obsidianMeta: { templateUsed: 'prospect-profile-template', lastSyncDate: new Date() }
      };

      const card = kanbanIntegration.generateKanbanCard(retailProspect);
      expect(card).toContain('🛍️ **[[Retail Store]]**');
    });

    it('should use correct score emoji based on qualification score', () => {
      const highScoreProspect: Prospect = {
        id: 'high-score',
        filePath: 'high-score.md',
        created: new Date(),
        updated: new Date(),
        tags: ['prospect'],
        business: {
          name: 'High Score Business',
          industry: 'professional_services',
          location: { city: 'Denver', state: 'CO', country: 'US' },
          size: { category: 'medium' },
          digitalPresence: {
            hasWebsite: false,
            hasGoogleBusiness: false,
            hasSocialMedia: false,
            hasOnlineReviews: false
          }
        },
        contact: {
          phone: '',
          email: '',
          website: ''
        },
        pipelineStage: 'qualified',
        qualificationScore: {
          total: 92,
          breakdown: {
            businessSize: 20, digitalPresence: 15, competitorGaps: 25,
            location: 15, industry: 15, revenueIndicators: 2
          },
          lastUpdated: new Date()
        },
        interactions: [],
        obsidianMeta: { templateUsed: 'prospect-profile-template', lastSyncDate: new Date() }
      };

      const card = kanbanIntegration.generateKanbanCard(highScoreProspect);
      expect(card).toContain('⭐ Score: 92/100 🔥'); // 90+ gets fire emoji
    });
  });

  describe('handleStageTransition', () => {
    beforeEach(async () => {
      // Create a test prospect file
      const prospectContent = `---
type: prospect-profile
company: "Test Company"
industry: restaurants
pipeline_stage: cold
updated: "2025-07-30T10:00:00.000Z"
tags: [prospect, restaurants, cold]
---

# Test Company

Test prospect content.`;

      await fs.writeFile(
        path.join(testProspectsDir, 'test-company.md'),
        prospectContent,
        'utf8'
      );
    });

    it('should update prospect frontmatter when stage changes', async () => {
      const transition = {
        prospectId: 'test-company',
        fromStage: 'cold' as PipelineStage,
        toStage: 'contacted' as PipelineStage,
        timestamp: new Date(),
        triggeredBy: 'manual' as const
      };

      const result = await kanbanIntegration.handleStageTransition(transition);
      expect(result).toBe(true);

      // Verify the file was updated
      const updatedContent = await fs.readFile(
        path.join(testProspectsDir, 'test-company.md'),
        'utf8'
      );

      expect(updatedContent).toContain('pipeline_stage: contacted');
      expect(updatedContent).toContain('tags: [prospect, restaurants, contacted]');
      expect(updatedContent).not.toContain('tags: [prospect, restaurants, cold]');
    });

    it('should handle missing prospect file gracefully', async () => {
      const transition = {
        prospectId: 'non-existent-prospect',
        fromStage: 'cold' as PipelineStage,
        toStage: 'contacted' as PipelineStage,
        timestamp: new Date(),
        triggeredBy: 'manual' as const
      };

      const result = await kanbanIntegration.handleStageTransition(transition);
      expect(result).toBe(false);
    });
  });

  describe('generatePipelineMetrics', () => {
    beforeEach(async () => {
      // Create test prospect files with different stages and scores
      const prospects = [
        { name: 'cold-prospect-1', stage: 'cold', score: 25 },
        { name: 'cold-prospect-2', stage: 'cold', score: 35 },
        { name: 'contacted-prospect-1', stage: 'contacted', score: 55 },
        { name: 'interested-prospect-1', stage: 'interested', score: 70 },
        { name: 'qualified-prospect-1', stage: 'qualified', score: 85 },
        { name: 'won-prospect-1', stage: 'closed_won', score: 95 }
      ];

      for (const prospect of prospects) {
        const content = `---
type: prospect-profile
company: "${prospect.name}"
industry: restaurants
pipeline_stage: ${prospect.stage}
qualification_score: ${prospect.score}
updated: "2025-07-30T10:00:00.000Z"
tags: [prospect, restaurants, ${prospect.stage}]
---

# ${prospect.name}`;

        await fs.writeFile(
          path.join(testProspectsDir, `${prospect.name}.md`),
          content,
          'utf8'
        );
      }
    });

    it('should calculate correct stage distribution', async () => {
      // Mock the vaultIntegration.getAllProspects method
      const originalGetAllProspects = require('@utils/obsidian/vault-integration').vaultIntegration.getAllProspects;
      
      // Create mock prospects based on test files
      const mockProspects = [
        { pipelineStage: 'cold', qualificationScore: { total: 25 }, updated: new Date(), business: { name: 'cold-1' } },
        { pipelineStage: 'cold', qualificationScore: { total: 35 }, updated: new Date(), business: { name: 'cold-2' } },
        { pipelineStage: 'contacted', qualificationScore: { total: 55 }, updated: new Date(), business: { name: 'contacted-1' } },
        { pipelineStage: 'interested', qualificationScore: { total: 70 }, updated: new Date(), business: { name: 'interested-1' } },
        { pipelineStage: 'qualified', qualificationScore: { total: 85 }, updated: new Date(), business: { name: 'qualified-1' } },
        { pipelineStage: 'closed_won', qualificationScore: { total: 95 }, updated: new Date(), business: { name: 'won-1' } }
      ];

      require('@utils/obsidian/vault-integration').vaultIntegration.getAllProspects = jest.fn().mockResolvedValue(mockProspects);

      const metrics = await kanbanIntegration.generatePipelineMetrics();

      expect(metrics.stageDistribution.cold).toBe(2);
      expect(metrics.stageDistribution.contacted).toBe(1);
      expect(metrics.stageDistribution.interested).toBe(1);
      expect(metrics.stageDistribution.qualified).toBe(1);
      expect(metrics.stageDistribution.closed_won).toBe(1);
      expect(metrics.stageDistribution.closed_lost).toBe(0);
      expect(metrics.stageDistribution.frozen).toBe(0);

      expect(metrics.averageScoreByStage.cold).toBe(30); // (25 + 35) / 2
      expect(metrics.averageScoreByStage.contacted).toBe(55);
      expect(metrics.averageScoreByStage.qualified).toBe(85);

      // Restore original method
      require('@utils/obsidian/vault-integration').vaultIntegration.getAllProspects = originalGetAllProspects;
    });
  });

  describe('syncAllProspectsToKanban', () => {
    it('should update Kanban board with prospect cards', async () => {
      // Mock getAllProspects to return test data
      const mockProspects: Prospect[] = [
        {
          id: 'prospect-1',
          filePath: 'prospect-1.md',
          created: new Date(),
          updated: new Date(),
          tags: ['prospect', 'cold'],
          business: {
            name: 'Test Restaurant',
            industry: 'restaurants',
            location: { city: 'Denver', state: 'CO', country: 'US' },
            size: { category: 'small' },
            digitalPresence: {
            hasWebsite: false,
            hasGoogleBusiness: false,
            hasSocialMedia: false,
            hasOnlineReviews: false
          }
          },
          contact: {
          phone: '',
          email: '',
          website: ''
        },
          pipelineStage: 'cold',
          qualificationScore: {
            total: 45,
            breakdown: { businessSize: 0, digitalPresence: 0, competitorGaps: 0, location: 0, industry: 0, revenueIndicators: 0 },
            lastUpdated: new Date()
          },
          interactions: [],
          obsidianMeta: { templateUsed: 'prospect-profile-template', lastSyncDate: new Date() }
        }
      ];

      require('@utils/obsidian/vault-integration').vaultIntegration.getAllProspects = jest.fn().mockResolvedValue(mockProspects);

      await kanbanIntegration.syncAllProspectsToKanban();

      const kanbanContent = await fs.readFile(testKanbanFile, 'utf8');
      expect(kanbanContent).toContain('🍽️ **[[Test Restaurant]]**');
      expect(kanbanContent).toContain('⭐ Score: 45/100');
    });
  });
});

// Mock the vault integration module
jest.mock('@utils/obsidian/vault-integration', () => ({
  vaultIntegration: {
    getAllProspects: jest.fn().mockResolvedValue([]),
    createActivity: jest.fn().mockResolvedValue({ success: true, activity: {}, filePath: 'test.md' })
  }
}));

// Mock the logger
jest.mock('@utils/logging', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}));