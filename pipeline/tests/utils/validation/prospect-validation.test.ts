/**
 * Test suite for prospect validation utilities
 */

import { describe, it, expect } from '@jest/globals';
import {
  prospectCreationInputSchema,
  prospectFrontmatterSchema,
  validateQualificationScore,
  validatePipelineStageTransition,
  validateBusinessSize,
} from '@utils/validation/prospect-validation';
import { ProspectCreationInput, ProspectFrontmatter } from '@/types';

describe('Prospect Validation', () => {
  describe('prospectCreationInputSchema', () => {
    it('should validate valid prospect creation input', () => {
      const validInput: ProspectCreationInput = {
        businessName: 'Test Restaurant LLC',
        industry: 'restaurants',
        city: 'Denver',
        state: 'CO',
        phone: '303-555-0123',
        email: 'contact@testrestaurant.com',
        website: 'https://testrestaurant.com',
        estimatedRevenue: 500000,
        employeeCount: 15,
      };

      const { error } = prospectCreationInputSchema.validate(validInput);
      expect(error).toBeUndefined();
    });

    it('should reject invalid business name', () => {
      const invalidInput: Partial<ProspectCreationInput> = {
        businessName: 'X', // Too short
        industry: 'restaurants',
        city: 'Denver',
        state: 'CO',
      };

      const { error } = prospectCreationInputSchema.validate(invalidInput);
      expect(error).toBeDefined();
      expect(error?.details[0]?.path).toContain('businessName');
    });

    it('should reject invalid industry', () => {
      const invalidInput = {
        businessName: 'Test Business',
        industry: 'invalid_industry',
        city: 'Denver',
        state: 'CO',
      };

      const { error } = prospectCreationInputSchema.validate(invalidInput);
      expect(error).toBeDefined();
      expect(error?.details[0]?.path).toContain('industry');
    });

    it('should reject invalid state code', () => {
      const invalidInput = {
        businessName: 'Test Business',
        industry: 'restaurants',
        city: 'Denver',
        state: 'Colorado', // Should be 2-letter code
      };

      const { error } = prospectCreationInputSchema.validate(invalidInput);
      expect(error).toBeDefined();
      expect(error?.details[0]?.path).toContain('state');
    });

    it('should reject invalid email format', () => {
      const invalidInput = {
        businessName: 'Test Business',
        industry: 'restaurants',
        city: 'Denver',
        state: 'CO',
        email: 'invalid-email',
      };

      const { error } = prospectCreationInputSchema.validate(invalidInput);
      expect(error).toBeDefined();
      expect(error?.details[0]?.path).toContain('email');
    });
  });

  describe('prospectFrontmatterSchema', () => {
    it('should validate valid frontmatter', () => {
      const validFrontmatter: ProspectFrontmatter = {
        type: 'prospect-profile',
        company: 'Test Restaurant LLC',
        industry: 'restaurants',
        location: 'Denver, CO',
        qualification_score: 75,
        pipeline_stage: 'contacted',
        created: '2024-01-15T10:00:00.000Z',
        updated: '2024-01-15T10:00:00.000Z',
        tags: ['prospect', 'restaurants', 'contacted'],
      };

      const { error } = prospectFrontmatterSchema.validate(validFrontmatter);
      expect(error).toBeUndefined();
    });

    it('should reject invalid type', () => {
      const invalidFrontmatter = {
        type: 'invalid-type',
        company: 'Test Restaurant LLC',
        industry: 'restaurants',
        location: 'Denver, CO',
        qualification_score: 75,
        pipeline_stage: 'contacted',
        created: '2024-01-15T10:00:00.000Z',
        updated: '2024-01-15T10:00:00.000Z',
        tags: ['prospect'],
      };

      const { error } = prospectFrontmatterSchema.validate(invalidFrontmatter);
      expect(error).toBeDefined();
      expect(error?.details[0]?.path).toContain('type');
    });

    it('should reject invalid qualification score', () => {
      const invalidFrontmatter = {
        type: 'prospect-profile',
        company: 'Test Restaurant LLC',
        industry: 'restaurants',
        location: 'Denver, CO',
        qualification_score: 150, // Over 100
        pipeline_stage: 'contacted',
        created: '2024-01-15T10:00:00.000Z',
        updated: '2024-01-15T10:00:00.000Z',
        tags: ['prospect'],
      };

      const { error } = prospectFrontmatterSchema.validate(invalidFrontmatter);
      expect(error).toBeDefined();
      expect(error?.details[0]?.path).toContain('qualification_score');
    });

    it('should reject invalid pipeline stage', () => {
      const invalidFrontmatter = {
        type: 'prospect-profile',
        company: 'Test Restaurant LLC',
        industry: 'restaurants',
        location: 'Denver, CO',
        qualification_score: 75,
        pipeline_stage: 'invalid_stage',
        created: '2024-01-15T10:00:00.000Z',
        updated: '2024-01-15T10:00:00.000Z',
        tags: ['prospect'],
      };

      const { error } = prospectFrontmatterSchema.validate(invalidFrontmatter);
      expect(error).toBeDefined();
      expect(error?.details[0]?.path).toContain('pipeline_stage');
    });
  });

  describe('validateQualificationScore', () => {
    it('should validate correct qualification score breakdown', () => {
      const breakdown = {
        businessSize: 15,
        digitalPresence: 20,
        competitorGaps: 18,
        location: 12,
        industry: 8,
        revenueIndicators: 9,
      };

      const isValid = validateQualificationScore(breakdown);
      expect(isValid).toBe(true);
    });

    it('should reject qualification score breakdown that exceeds 100', () => {
      const breakdown = {
        businessSize: 20,
        digitalPresence: 25,
        competitorGaps: 20,
        location: 15,
        industry: 10,
        revenueIndicators: 15, // Total would be 105
      };

      const isValid = validateQualificationScore(breakdown);
      expect(isValid).toBe(false);
    });

    it('should reject negative qualification scores', () => {
      const breakdown = {
        businessSize: -5,
        digitalPresence: 25,
        competitorGaps: 20,
        location: 15,
        industry: 10,
        revenueIndicators: 10,
      };

      const isValid = validateQualificationScore(breakdown);
      expect(isValid).toBe(false);
    });
  });

  describe('validatePipelineStageTransition', () => {
    it('should allow valid stage transitions', () => {
      expect(validatePipelineStageTransition('cold', 'contacted')).toBe(true);
      expect(validatePipelineStageTransition('contacted', 'interested')).toBe(true);
      expect(validatePipelineStageTransition('interested', 'qualified')).toBe(true);
      expect(validatePipelineStageTransition('qualified', 'closed_won')).toBe(true);
      expect(validatePipelineStageTransition('frozen', 'contacted')).toBe(true);
    });

    it('should reject invalid stage transitions', () => {
      expect(validatePipelineStageTransition('cold', 'qualified')).toBe(false);
      expect(validatePipelineStageTransition('closed_won', 'interested')).toBe(false);
      expect(validatePipelineStageTransition('closed_lost', 'contacted')).toBe(false);
    });

    it('should reject transitions from terminal states', () => {
      expect(validatePipelineStageTransition('closed_won', 'contacted')).toBe(false);
      expect(validatePipelineStageTransition('closed_lost', 'qualified')).toBe(false);
    });
  });

  describe('validateBusinessSize', () => {
    it('should validate correct employee count for business size', () => {
      expect(validateBusinessSize(5, 'micro')).toBe(true);
      expect(validateBusinessSize(25, 'small')).toBe(true);
      expect(validateBusinessSize(100, 'medium')).toBe(true);
    });

    it('should reject incorrect employee count for business size', () => {
      expect(validateBusinessSize(50, 'micro')).toBe(false);
      expect(validateBusinessSize(5, 'small')).toBe(false);
      expect(validateBusinessSize(25, 'medium')).toBe(false);
    });

    it('should return true when either parameter is missing', () => {
      expect(validateBusinessSize(undefined, 'small')).toBe(true);
      expect(validateBusinessSize(25, undefined)).toBe(true);
      expect(validateBusinessSize(undefined, undefined)).toBe(true);
    });
  });
});