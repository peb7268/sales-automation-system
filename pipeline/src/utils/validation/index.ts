/**
 * Centralized validation utilities and exports
 */

import { ValidationResult, ValidationError } from '@/types';

// Export all validation schemas
export * from './prospect-validation';
export * from './campaign-validation';
export * from './activity-validation';

/**
 * Generic validation function that wraps Joi validation
 */
export function validateData<T>(schema: any, data: unknown): ValidationResult {
  const { error, value, warning } = schema.validate(data, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });

  const errors: ValidationError[] = error
    ? error.details.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message,
        code: detail.type,
        value: detail.context?.value,
      }))
    : [];

  const warnings: ValidationError[] = warning
    ? warning.details.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message,
        code: detail.type,
        value: detail.context?.value,
      }))
    : [];

  return {
    isValid: !error,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Validation for Obsidian frontmatter parsing
 */
export function validateFrontmatter(frontmatter: any, expectedType: string): ValidationResult {
  if (!frontmatter || typeof frontmatter !== 'object') {
    return {
      isValid: false,
      errors: [
        {
          field: 'frontmatter',
          message: 'Frontmatter must be a valid object',
          code: 'invalid_type',
          value: frontmatter,
        },
      ],
    };
  }

  if (frontmatter.type !== expectedType) {
    return {
      isValid: false,
      errors: [
        {
          field: 'type',
          message: `Expected type '${expectedType}', got '${frontmatter.type}'`,
          code: 'invalid_value',
          value: frontmatter.type,
        },
      ],
    };
  }

  return { isValid: true, errors: [] };
}

/**
 * Validation for required environment variables
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): ValidationResult {
  const errors: ValidationError[] = [];

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push({
        field: String(field),
        message: `${String(field)} is required`,
        code: 'required',
        value: data[field],
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validation for date ranges
 */
export function validateDateRange(
  startDate: Date | string,
  endDate: Date | string,
  fieldNames: { start: string; end: string } = { start: 'startDate', end: 'endDate' }
): ValidationResult {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  const errors: ValidationError[] = [];

  if (isNaN(start.getTime())) {
    errors.push({
      field: fieldNames.start,
      message: 'Invalid start date',
      code: 'invalid_date',
      value: startDate,
    });
  }

  if (isNaN(end.getTime())) {
    errors.push({
      field: fieldNames.end,
      message: 'Invalid end date',
      code: 'invalid_date',
      value: endDate,
    });
  }

  if (errors.length === 0 && end <= start) {
    errors.push({
      field: fieldNames.end,
      message: 'End date must be after start date',
      code: 'invalid_range',
      value: { start: startDate, end: endDate },
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validation for email addresses
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validation for phone numbers (US format)
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Validation for URLs
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validation for UUID format
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Custom validation for business data consistency
 */
export function validateBusinessDataConsistency(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Employee count should match business size category
  if (data.employeeCount && data.businessSize) {
    const sizeMappings = {
      micro: { min: 1, max: 9 },
      small: { min: 10, max: 49 },
      medium: { min: 50, max: 999 },
    };

    const range = sizeMappings[data.businessSize as keyof typeof sizeMappings];
    if (range && (data.employeeCount < range.min || data.employeeCount > range.max)) {
      errors.push({
        field: 'employeeCount',
        message: `Employee count ${data.employeeCount} doesn't match business size '${data.businessSize}'`,
        code: 'inconsistent_data',
        value: { employeeCount: data.employeeCount, businessSize: data.businessSize },
      });
    }
  }

  // Revenue should be reasonable for business size
  if (data.estimatedRevenue && data.employeeCount) {
    const revenuePerEmployee = data.estimatedRevenue / data.employeeCount;
    if (revenuePerEmployee < 10000 || revenuePerEmployee > 1000000) {
      errors.push({
        field: 'estimatedRevenue',
        message: 'Revenue per employee seems unrealistic (should be between $10K-$1M)',
        code: 'unrealistic_data',
        value: { revenuePerEmployee },
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validation for qualification score consistency
 */
export function validateQualificationScoreConsistency(qualificationScore: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!qualificationScore || !qualificationScore.breakdown) {
    return { isValid: true, errors: [] };
  }

  const { breakdown, total } = qualificationScore;
  const calculatedTotal = 
    (breakdown.businessSize || 0) +
    (breakdown.digitalPresence || 0) +
    (breakdown.competitorGaps || 0) +
    (breakdown.location || 0) +
    (breakdown.industry || 0) +
    (breakdown.revenueIndicators || 0);

  if (Math.abs(calculatedTotal - total) > 1) {
    errors.push({
      field: 'qualificationScore.total',
      message: `Total score ${total} doesn't match sum of breakdown scores ${calculatedTotal}`,
      code: 'inconsistent_total',
      value: { total, calculatedTotal, breakdown },
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}