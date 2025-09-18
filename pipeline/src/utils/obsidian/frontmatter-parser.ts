/**
 * Utilities for parsing and generating Obsidian frontmatter
 */

import yaml from 'yaml';
import { 
  ProspectFrontmatter, 
  CampaignFrontmatter, 
  ActivityFrontmatter,
  ValidationResult 
} from '@/types';
import { validateFrontmatter } from '@utils/validation';
import { logger } from '@utils/logging';

export interface ParsedMarkdownFile {
  frontmatter: any;
  content: string;
  raw: string;
}

/**
 * Parse frontmatter from markdown content
 */
export function parseFrontmatter(markdown: string): ParsedMarkdownFile {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);

  if (!match) {
    return {
      frontmatter: {},
      content: markdown,
      raw: markdown,
    };
  }

  try {
    const frontmatter = yaml.parse(match[1] || '') || {};
    const content = match[2] || '';

    return {
      frontmatter,
      content,
      raw: markdown,
    };
  } catch (error) {
    logger.error('Failed to parse frontmatter:', error);
    return {
      frontmatter: {},
      content: markdown,
      raw: markdown,
    };
  }
}

/**
 * Generate frontmatter YAML string
 */
export function generateFrontmatter(data: any): string {
  try {
    const yamlString = yaml.stringify(data);
    
    return `---\n${yamlString}---\n`;
  } catch (error) {
    logger.error('Failed to generate frontmatter:', error);
    throw new Error('Failed to generate frontmatter');
  }
}

/**
 * Update frontmatter in existing markdown content
 */
export function updateFrontmatter(markdown: string, updates: any): string {
  const parsed = parseFrontmatter(markdown);
  const updatedFrontmatter = { ...parsed.frontmatter, ...updates };
  
  return generateFrontmatter(updatedFrontmatter) + parsed.content;
}

/**
 * Create complete markdown file with frontmatter and content
 */
export function createMarkdownFile(frontmatter: any, content: string): string {
  return generateFrontmatter(frontmatter) + content;
}

/**
 * Parse and validate prospect frontmatter
 */
export function parseProspectFrontmatter(markdown: string): {
  frontmatter: ProspectFrontmatter | null;
  content: string;
  validation: ValidationResult;
} {
  const parsed = parseFrontmatter(markdown);
  const validation = validateFrontmatter(parsed.frontmatter, 'prospect-profile');

  if (!validation.isValid) {
    return {
      frontmatter: null,
      content: parsed.content,
      validation,
    };
  }

  return {
    frontmatter: parsed.frontmatter as ProspectFrontmatter,
    content: parsed.content,
    validation,
  };
}

/**
 * Parse and validate campaign frontmatter
 */
export function parseCampaignFrontmatter(markdown: string): {
  frontmatter: CampaignFrontmatter | null;
  content: string;
  validation: ValidationResult;
} {
  const parsed = parseFrontmatter(markdown);
  const validation = validateFrontmatter(parsed.frontmatter, 'campaign');

  if (!validation.isValid) {
    return {
      frontmatter: null,
      content: parsed.content,
      validation,
    };
  }

  return {
    frontmatter: parsed.frontmatter as CampaignFrontmatter,
    content: parsed.content,
    validation,
  };
}

/**
 * Parse and validate activity frontmatter
 */
export function parseActivityFrontmatter(markdown: string): {
  frontmatter: ActivityFrontmatter | null;
  content: string;
  validation: ValidationResult;
} {
  const parsed = parseFrontmatter(markdown);
  const validation = validateFrontmatter(parsed.frontmatter, 'activity');

  if (!validation.isValid) {
    return {
      frontmatter: null,
      content: parsed.content,
      validation,
    };
  }

  return {
    frontmatter: parsed.frontmatter as ActivityFrontmatter,
    content: parsed.content,
    validation,
  };
}

/**
 * Extract tags from frontmatter, handling various formats
 */
export function extractTags(frontmatter: any): string[] {
  if (!frontmatter.tags) return [];
  
  if (Array.isArray(frontmatter.tags)) {
    return frontmatter.tags.filter((tag: any) => typeof tag === 'string');
  }
  
  if (typeof frontmatter.tags === 'string') {
    return frontmatter.tags.split(',').map((tag: string) => tag.trim());
  }
  
  return [];
}

/**
 * Normalize date fields in frontmatter to ISO strings
 */
export function normalizeDates(frontmatter: any): any {
  const dateFields = ['created', 'updated', 'date', 'start_date', 'end_date', 'follow_up_date'];
  const normalized = { ...frontmatter };

  for (const field of dateFields) {
    if (normalized[field]) {
      const date = new Date(normalized[field]);
      if (!isNaN(date.getTime())) {
        normalized[field] = date.toISOString();
      }
    }
  }

  return normalized;
}

/**
 * Generate a slug from a title for file naming
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .substring(0, 50); // Limit length
}

/**
 * Generate Obsidian-compatible wikilink
 */
export function generateWikilink(title: string, displayText?: string): string {
  if (displayText && displayText !== title) {
    return `[[${title}|${displayText}]]`;
  }
  return `[[${title}]]`;
}

/**
 * Extract wikilinks from content
 */
export function extractWikilinks(content: string): Array<{ link: string; display?: string }> {
  const wikilinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  const links: Array<{ link: string; display?: string }> = [];
  let match;

  while ((match = wikilinkRegex.exec(content)) !== null) {
    links.push({
      link: match[1],
      display: match[2] || undefined,
    });
  }

  return links;
}

/**
 * Generate markdown table from data
 */
export function generateMarkdownTable(
  headers: string[],
  rows: string[][]
): string {
  if (rows.length === 0) {
    return '';
  }

  const headerRow = `| ${headers.join(' | ')} |`;
  const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
  const dataRows = rows.map(row => `| ${row.join(' | ')} |`);

  return [headerRow, separatorRow, ...dataRows].join('\n');
}

/**
 * Generate checkbox list from items
 */
export function generateCheckboxList(items: string[], checked: boolean[] = []): string {
  return items
    .map((item, index) => {
      const isChecked = checked[index] || false;
      const checkbox = isChecked ? '[x]' : '[ ]';
      return `- ${checkbox} ${item}`;
    })
    .join('\n');
}

/**
 * Escape markdown special characters
 */
export function escapeMarkdown(text: string): string {
  return text.replace(/[\\`*_{}[\]()#+\-.!]/g, '\\$&');
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format date for frontmatter
 */
export function formatDateForFrontmatter(date: Date): string {
  return date.toISOString();
}

/**
 * Format date for display in content
 */
export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}