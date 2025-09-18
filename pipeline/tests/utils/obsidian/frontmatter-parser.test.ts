/**
 * Test suite for Obsidian frontmatter parsing utilities
 */

import { describe, it, expect } from '@jest/globals';
import {
  parseFrontmatter,
  generateFrontmatter,
  updateFrontmatter,
  createMarkdownFile,
  parseProspectFrontmatter,
  extractTags,
  normalizeDates,
  generateSlug,
  generateWikilink,
  extractWikilinks,
  generateMarkdownTable,
  generateCheckboxList,
} from '@utils/obsidian/frontmatter-parser';

describe('Frontmatter Parser', () => {
  describe('parseFrontmatter', () => {
    it('should parse valid frontmatter', () => {
      const markdown = `---
type: prospect-profile
company: Test Company
tags: [prospect, test]
---

# Test Company

This is the content.`;

      const result = parseFrontmatter(markdown);
      
      expect(result.frontmatter.type).toBe('prospect-profile');
      expect(result.frontmatter.company).toBe('Test Company');
      expect(result.frontmatter.tags).toEqual(['prospect', 'test']);
      expect(result.content).toBe('\n# Test Company\n\nThis is the content.');
    });

    it('should handle markdown without frontmatter', () => {
      const markdown = '# Test Company\n\nThis is just content.';
      
      const result = parseFrontmatter(markdown);
      
      expect(result.frontmatter).toEqual({});
      expect(result.content).toBe(markdown);
    });

    it('should handle empty frontmatter', () => {
      const markdown = `---
---

# Test Company`;

      const result = parseFrontmatter(markdown);
      
      expect(result.frontmatter).toEqual({});
      expect(result.content).toBe('\n# Test Company');
    });

    it('should handle malformed YAML gracefully', () => {
      const markdown = `---
type: prospect-profile
invalid: [unclosed array
---

# Test Company`;

      const result = parseFrontmatter(markdown);
      
      expect(result.frontmatter).toEqual({});
      expect(result.content).toBe(markdown);
    });
  });

  describe('generateFrontmatter', () => {
    it('should generate valid YAML frontmatter', () => {
      const data = {
        type: 'prospect-profile',
        company: 'Test Company',
        tags: ['prospect', 'test'],
        score: 75,
      };

      const result = generateFrontmatter(data);
      
      expect(result).toContain('---');
      expect(result).toContain('type: prospect-profile');
      expect(result).toContain('company: "Test Company"');
      expect(result.endsWith('---\n')).toBe(true);
    });

    it('should handle nested objects', () => {
      const data = {
        type: 'prospect-profile',
        contact: {
          name: 'John Doe',
          email: 'john@test.com',
        },
      };

      const result = generateFrontmatter(data);
      
      expect(result).toContain('contact:');
      expect(result).toContain('name: "John Doe"');
      expect(result).toContain('email: john@test.com');
    });
  });

  describe('updateFrontmatter', () => {
    it('should update existing frontmatter', () => {
      const markdown = `---
type: prospect-profile
company: Old Company
score: 50
---

# Content`;

      const updates = {
        company: 'New Company',
        score: 75,
        tags: ['updated'],
      };

      const result = updateFrontmatter(markdown, updates);
      const parsed = parseFrontmatter(result);
      
      expect(parsed.frontmatter.company).toBe('New Company');
      expect(parsed.frontmatter.score).toBe(75);
      expect(parsed.frontmatter.tags).toEqual(['updated']);
      expect(parsed.frontmatter.type).toBe('prospect-profile'); // Should preserve existing
    });
  });

  describe('createMarkdownFile', () => {
    it('should create complete markdown file', () => {
      const frontmatter = {
        type: 'prospect-profile',
        company: 'Test Company',
      };
      const content = '# Test Company\n\nContent here.';

      const result = createMarkdownFile(frontmatter, content);
      
      expect(result).toContain('---');
      expect(result).toContain('type: prospect-profile');
      expect(result).toContain('# Test Company');
      expect(result).toContain('Content here.');
    });
  });

  describe('parseProspectFrontmatter', () => {
    it('should parse and validate prospect frontmatter', () => {
      const markdown = `---
type: prospect-profile
company: Test Restaurant
industry: restaurants
location: Denver, CO
qualification_score: 75
pipeline_stage: contacted
created: "2024-01-15T10:00:00.000Z"
updated: "2024-01-15T10:00:00.000Z"
tags: [prospect, restaurants]
---

# Test Restaurant`;

      const result = parseProspectFrontmatter(markdown);
      
      expect(result.validation.isValid).toBe(true);
      expect(result.frontmatter).toBeDefined();
      expect(result.frontmatter?.company).toBe('Test Restaurant');
      expect(result.frontmatter?.industry).toBe('restaurants');
    });

    it('should handle invalid prospect frontmatter', () => {
      const markdown = `---
type: invalid-type
company: Test Restaurant
---

# Test Restaurant`;

      const result = parseProspectFrontmatter(markdown);
      
      expect(result.validation.isValid).toBe(false);
      expect(result.frontmatter).toBeNull();
      expect(result.validation.errors).toHaveLength(1);
    });
  });

  describe('extractTags', () => {
    it('should extract tags from array format', () => {
      const frontmatter = { tags: ['prospect', 'test', 'restaurants'] };
      const tags = extractTags(frontmatter);
      expect(tags).toEqual(['prospect', 'test', 'restaurants']);
    });

    it('should extract tags from string format', () => {
      const frontmatter = { tags: 'prospect, test, restaurants' };
      const tags = extractTags(frontmatter);
      expect(tags).toEqual(['prospect', 'test', 'restaurants']);
    });

    it('should handle missing tags', () => {
      const frontmatter = {};
      const tags = extractTags(frontmatter);
      expect(tags).toEqual([]);
    });

    it('should filter non-string values from array', () => {
      const frontmatter = { tags: ['prospect', 123, 'test', null, 'restaurants'] };
      const tags = extractTags(frontmatter);
      expect(tags).toEqual(['prospect', 'test', 'restaurants']);
    });
  });

  describe('normalizeDates', () => {
    it('should normalize date fields to ISO strings', () => {
      const frontmatter = {
        created: new Date('2024-01-15T10:00:00.000Z'),
        updated: '2024-01-15T11:00:00.000Z',
        follow_up_date: '2024-01-16',
        other_field: 'not a date',
      };

      const normalized = normalizeDates(frontmatter);
      
      expect(normalized.created).toBe('2024-01-15T10:00:00.000Z');
      expect(normalized.updated).toBe('2024-01-15T11:00:00.000Z');
      expect(normalized.follow_up_date).toBe('2024-01-16T00:00:00.000Z');
      expect(normalized.other_field).toBe('not a date');
    });

    it('should handle invalid dates gracefully', () => {
      const frontmatter = {
        created: 'invalid-date',
        updated: '2024-01-15T10:00:00.000Z',
      };

      const normalized = normalizeDates(frontmatter);
      
      expect(normalized.created).toBe('invalid-date'); // Should remain unchanged
      expect(normalized.updated).toBe('2024-01-15T10:00:00.000Z');
    });
  });

  describe('generateSlug', () => {
    it('should generate valid slug from title', () => {
      expect(generateSlug('Test Restaurant LLC')).toBe('test-restaurant-llc');
      expect(generateSlug('Mile High Marketing & Co.')).toBe('mile-high-marketing--co');
      expect(generateSlug('   Multiple   Spaces   ')).toBe('multiple-spaces');
    });

    it('should handle special characters', () => {
      expect(generateSlug('Company @ 123 Main St.')).toBe('company--123-main-st');
      expect(generateSlug('Test & Development Co!')).toBe('test--development-co');
    });

    it('should limit length', () => {
      const longTitle = 'This is a very long company name that should be trimmed to a reasonable length';
      const slug = generateSlug(longTitle);
      expect(slug.length).toBeLessThanOrEqual(50);
    });
  });

  describe('generateWikilink', () => {
    it('should generate simple wikilink', () => {
      expect(generateWikilink('Test Company')).toBe('[[Test Company]]');
    });

    it('should generate wikilink with display text', () => {
      expect(generateWikilink('test-company-file', 'Test Company')).toBe('[[test-company-file|Test Company]]');
    });

    it('should not add display text if same as title', () => {
      expect(generateWikilink('Test Company', 'Test Company')).toBe('[[Test Company]]');
    });
  });

  describe('extractWikilinks', () => {
    it('should extract simple wikilinks', () => {
      const content = 'See [[Company A]] and [[Company B]] for details.';
      const links = extractWikilinks(content);
      
      expect(links).toHaveLength(2);
      expect(links[0]).toEqual({ link: 'Company A' });
      expect(links[1]).toEqual({ link: 'Company B' });
    });

    it('should extract wikilinks with display text', () => {
      const content = 'Visit [[company-a-file|Company A]] website.';
      const links = extractWikilinks(content);
      
      expect(links).toHaveLength(1);
      expect(links[0]).toEqual({ link: 'company-a-file', display: 'Company A' });
    });

    it('should handle mixed wikilink formats', () => {
      const content = 'See [[Simple Link]] and [[file-name|Display Text]] for more.';
      const links = extractWikilinks(content);
      
      expect(links).toHaveLength(2);
      expect(links[0]).toEqual({ link: 'Simple Link' });
      expect(links[1]).toEqual({ link: 'file-name', display: 'Display Text' });
    });
  });

  describe('generateMarkdownTable', () => {
    it('should generate markdown table', () => {
      const headers = ['Name', 'Score', 'Status'];
      const rows = [
        ['Company A', '85', 'Qualified'],
        ['Company B', '72', 'Contacted'],
      ];

      const table = generateMarkdownTable(headers, rows);
      
      expect(table).toContain('| Name | Score | Status |');
      expect(table).toContain('| --- | --- | --- |');
      expect(table).toContain('| Company A | 85 | Qualified |');
      expect(table).toContain('| Company B | 72 | Contacted |');
    });

    it('should handle empty rows', () => {
      const headers = ['Name', 'Score'];
      const rows: string[][] = [];

      const table = generateMarkdownTable(headers, rows);
      expect(table).toBe('');
    });
  });

  describe('generateCheckboxList', () => {
    it('should generate checkbox list', () => {
      const items = ['Task 1', 'Task 2', 'Task 3'];
      const checked = [true, false, true];

      const list = generateCheckboxList(items, checked);
      
      expect(list).toContain('- [x] Task 1');
      expect(list).toContain('- [ ] Task 2');
      expect(list).toContain('- [x] Task 3');
    });

    it('should default to unchecked', () => {
      const items = ['Task 1', 'Task 2'];
      const list = generateCheckboxList(items);
      
      expect(list).toContain('- [ ] Task 1');
      expect(list).toContain('- [ ] Task 2');
    });
  });
});