/**
 * Prospect Folder Management Utilities
 * Handles the new folder-based prospect structure
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { Prospect, ProspectCreationInput } from '@/types';
import { DataModelFactory } from '@utils/data-models';
import { 
  generateSlug,
  formatDateForFrontmatter,
  parseFrontmatter,
  generateFrontmatter
} from '@utils/obsidian/frontmatter-parser';
import { logger } from '@utils/logging';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Configuration for prospect folder management
 */
const PROSPECTS_BASE_PATH = process.env.OBSIDIAN_PROSPECTS_PATH || '/Users/pbarrick/Documents/Main/Projects/Sales/Prospects';

/**
 * Sanitize company name for use as folder name
 */
export function sanitizeProspectName(companyName: string): string {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-')          // Replace multiple hyphens with single
    .replace(/^-|-$/g, '')        // Remove leading/trailing hyphens
    .substring(0, 50);            // Limit length to 50 characters
}

/**
 * Generate prospect folder path
 */
export function getProspectFolderPath(companyName: string): string {
  const sanitizedName = sanitizeProspectName(companyName);
  return path.join(PROSPECTS_BASE_PATH, sanitizedName);
}

/**
 * Generate prospect index file path
 */
export function getProspectIndexPath(companyName: string): string {
  const folderPath = getProspectFolderPath(companyName);
  return path.join(folderPath, 'index.md');
}

/**
 * Generate prospect pitch file path
 */
export function getProspectPitchPath(companyName: string): string {
  const folderPath = getProspectFolderPath(companyName);
  return path.join(folderPath, 'pitch.md');
}

/**
 * Prospect Folder Manager Class
 */
export class ProspectFolderManager {
  
  /**
   * Create a new prospect with folder structure
   */
  async createProspect(input: ProspectCreationInput): Promise<{ prospect: Prospect | null; folderPath: string }> {
    try {
      // Create prospect data using existing factory
      const { prospect, validation } = DataModelFactory.createProspect(input);
      
      if (!validation.isValid || !prospect) {
        throw new Error(`Prospect validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      // Create prospect folder
      const folderPath = getProspectFolderPath(prospect.business.name);
      await fs.mkdir(folderPath, { recursive: true });

      // Create index.md file with prospect data
      const indexPath = getProspectIndexPath(prospect.business.name);
      const frontmatter = DataModelFactory.prospectToFrontmatter(prospect);
      const indexContent = this.generateIndexContent(prospect, frontmatter);
      
      await fs.writeFile(indexPath, indexContent, 'utf8');

      // Create pitch.md placeholder
      const pitchPath = getProspectPitchPath(prospect.business.name);
      const pitchContent = this.generatePitchPlaceholder(prospect);
      
      await fs.writeFile(pitchPath, pitchContent, 'utf8');

      logger.info(`Created prospect folder structure for ${prospect.business.name}`, {
        folderPath,
        indexPath,
        pitchPath
      });

      return { prospect, folderPath };
    } catch (error) {
      logger.error('Failed to create prospect folder structure:', error);
      throw error;
    }
  }

  /**
   * Update an existing prospect
   */
  async updateProspect(companyName: string, updates: Partial<Prospect>): Promise<void> {
    try {
      const indexPath = getProspectIndexPath(companyName);
      
      // Read current prospect data
      const currentContent = await fs.readFile(indexPath, 'utf8');
      const { frontmatter, content } = parseFrontmatter(currentContent);
      
      // Apply updates to frontmatter
      const updatedFrontmatter = {
        ...frontmatter,
        ...updates,
        updated: formatDateForFrontmatter(new Date())
      };
      
      // Regenerate content
      const updatedContent = this.generateIndexContentFromFrontmatter(updatedFrontmatter, content);
      
      await fs.writeFile(indexPath, updatedContent, 'utf8');
      
      logger.info(`Updated prospect: ${companyName}`);
    } catch (error) {
      logger.error(`Failed to update prospect ${companyName}:`, error);
      throw error;
    }
  }

  /**
   * Get all prospects from folder structure
   */
  async getAllProspects(): Promise<Prospect[]> {
    try {
      const prospects: Prospect[] = [];
      
      // Check if prospects directory exists
      try {
        await fs.access(PROSPECTS_BASE_PATH);
      } catch {
        logger.warn('Prospects directory does not exist, returning empty array');
        return prospects;
      }

      const items = await fs.readdir(PROSPECTS_BASE_PATH, { withFileTypes: true });
      
      for (const item of items) {
        if (item.isDirectory()) {
          try {
            const indexPath = path.join(PROSPECTS_BASE_PATH, item.name, 'index.md');
            const content = await fs.readFile(indexPath, 'utf8');
            const { frontmatter } = parseFrontmatter(content);
            
            // Convert frontmatter back to Prospect object
            const prospect = this.frontmatterToProspect(frontmatter);
            if (prospect) {
              prospects.push(prospect);
            }
          } catch (error) {
            logger.warn(`Failed to read prospect folder ${item.name}:`, error);
            // Continue processing other prospects
          }
        }
      }

      return prospects;
    } catch (error) {
      logger.error('Failed to get all prospects:', error);
      throw error;
    }
  }

  /**
   * Get a specific prospect by company name
   */
  async getProspect(companyName: string): Promise<Prospect | null> {
    try {
      const indexPath = getProspectIndexPath(companyName);
      const content = await fs.readFile(indexPath, 'utf8');
      const { frontmatter } = parseFrontmatter(content);
      
      return this.frontmatterToProspect(frontmatter);
    } catch (error) {
      logger.error(`Failed to get prospect ${companyName}:`, error);
      return null;
    }
  }

  /**
   * Delete a prospect folder
   */
  async deleteProspect(companyName: string): Promise<void> {
    try {
      const folderPath = getProspectFolderPath(companyName);
      await fs.rm(folderPath, { recursive: true });
      
      logger.info(`Deleted prospect folder: ${companyName}`);
    } catch (error) {
      logger.error(`Failed to delete prospect ${companyName}:`, error);
      throw error;
    }
  }

  /**
   * Generate index.md content from prospect data
   */
  private generateIndexContent(prospect: Prospect, frontmatter: any): string {
    const frontmatterStr = generateFrontmatter(frontmatter);
    
    return `${frontmatterStr}
# ${prospect.business.name}

## 🏢 Business Overview

**${prospect.business.name}** is a ${prospect.business.industry} business located in ${prospect.business.location.city}, ${prospect.business.location.state}.

### Key Details
- **Industry**: ${prospect.business.industry}
- **Location**: ${prospect.business.location.city}, ${prospect.business.location.state}
- **Business Size**: ${prospect.business.size.category}
- **Employee Count**: ${prospect.business.size.employeeCount || 'Unknown'}
- **Estimated Revenue**: $${prospect.business.size.estimatedRevenue?.toLocaleString() || 'Unknown'}

## 📊 Qualification Score: ${prospect.qualificationScore.total}/100

### Score Breakdown
- **Business Size**: ${prospect.qualificationScore.breakdown.businessSize}/20
- **Digital Presence**: ${prospect.qualificationScore.breakdown.digitalPresence}/20  
- **Market Opportunity**: ${prospect.qualificationScore.breakdown.marketOpportunity}/20
- **Competition Analysis**: ${prospect.qualificationScore.breakdown.competitiveAnalysis}/20
- **Revenue Potential**: ${prospect.qualificationScore.breakdown.revenuePotential}/20

## 📞 Contact Information

- **Primary Contact**: ${prospect.contact.primaryContact || 'Unknown'}
- **Title**: ${prospect.contact.contactTitle || 'Unknown'}
- **Phone**: ${prospect.contact.phone}
- **Email**: ${prospect.contact.email}
- **Website**: ${prospect.contact.website}

## 🎯 Pipeline Status

**Current Stage**: ${prospect.pipelineStage}
**Last Updated**: ${prospect.updated.toLocaleDateString()}

## 📝 Notes

*Add your prospect research, interaction notes, and insights here.*

---
*Prospect managed by MHM Automated Sales System*
*For pitch content, see: [[pitch|Custom Pitch]]*`;
  }

  /**
   * Generate pitch.md placeholder content
   */
  private generatePitchPlaceholder(prospect: Prospect): string {
    return `---
type: prospect-pitch
company: "${prospect.business.name}"
industry: ${prospect.business.industry}
created: "${formatDateForFrontmatter(new Date())}"
updated: "${formatDateForFrontmatter(new Date())}"
status: pending
pitch_version: 1.0
tags: [sales, pitch, ${prospect.business.industry}, ${prospect.business.location.city.toLowerCase()}]
---

# Custom Pitch - ${prospect.business.name}

> **This file will be populated by the Pitch Creator Agent**
> 
> The AI agent will analyze the prospect data from the index file and create a customized pitch based on their specific business needs, industry challenges, and growth opportunities.

## 🎯 Pitch Components (To be generated)

### Hook & Attention Grabber
*AI will craft an industry-specific opening that resonates with ${prospect.business.industry} businesses*

### Value Proposition  
*Customized value prop based on their digital presence gaps and revenue potential*

### Proof Points & Case Studies
*Relevant success stories from similar ${prospect.business.industry} businesses*

### ROI Projection
*Specific financial impact projections based on their estimated revenue and business size*

### Call to Action
*Tailored next steps based on their pipeline stage and qualification score*

---

## 📊 Prospect Context for AI Agent

**Qualification Score**: ${prospect.qualificationScore.total}/100
**Business Size**: ${prospect.business.size.category}
**Digital Gaps**: ${prospect.business.digitalPresence ? 'Multiple opportunities identified' : 'Assessment needed'}
**Revenue Estimate**: $${prospect.business.size.estimatedRevenue?.toLocaleString() || 'Unknown'}

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

  /**
   * Generate content from frontmatter (for updates)
   */
  private generateIndexContentFromFrontmatter(frontmatter: any, existingContent: string): string {
    const frontmatterStr = generateFrontmatter(frontmatter);
    
    // Try to preserve existing content after frontmatter
    const contentLines = existingContent.split('\n');
    const contentStartIndex = contentLines.findIndex(line => line === '---' && contentLines.indexOf(line) > 0) + 1;
    
    if (contentStartIndex > 0 && contentStartIndex < contentLines.length) {
      const preservedContent = contentLines.slice(contentStartIndex).join('\n');
      return `${frontmatterStr}${preservedContent}`;
    }
    
    // If we can't find existing content, generate new
    return frontmatterStr + '\n# ' + frontmatter.company + '\n\n*Prospect data updated*\n';
  }

  /**
   * Convert frontmatter back to Prospect object
   */
  private frontmatterToProspect(frontmatter: any): Prospect | null {
    try {
      // This is a simplified conversion - in a full implementation,
      // you'd want to validate and properly reconstruct the full Prospect object
      const prospect: Prospect = {
        id: frontmatter.id || 'unknown',
        created: new Date(frontmatter.created),
        updated: new Date(frontmatter.updated),
        tags: frontmatter.tags || [],
        
        business: {
          name: frontmatter.company,
          industry: frontmatter.industry,
          location: {
            city: frontmatter.location.split(', ')[0] || '',
            state: frontmatter.location.split(', ')[1] || '',
            country: 'US'
          },
          size: {
            category: frontmatter.business_size,
            employeeCount: frontmatter.employee_count,
            estimatedRevenue: frontmatter.estimated_revenue
          },
          digitalPresence: {
            hasWebsite: frontmatter.has_website,
            hasGoogleBusiness: frontmatter.has_google_business,
            hasSocialMedia: frontmatter.has_social_media,
            hasOnlineReviews: frontmatter.has_online_reviews
          }
        },
        
        contact: {
          primaryContact: frontmatter.primary_contact,
          contactTitle: frontmatter.contact_title,
          phone: frontmatter.phone,
          email: frontmatter.email,
          website: frontmatter.website,
          decisionMaker: frontmatter.decision_maker
        },
        
        pipelineStage: frontmatter.pipeline_stage,
        qualificationScore: {
          total: frontmatter.qualification_score,
          breakdown: {
            businessSize: frontmatter.score_business || 0,
            digitalPresence: frontmatter.score_digital || 0,
            marketOpportunity: frontmatter.score_market || 0,
            competitiveAnalysis: frontmatter.score_competition || 0,
            revenuePotential: frontmatter.score_revenue || 0
          }
        },
        
        interactions: [],
        customFields: {}
      };

      return prospect;
    } catch (error) {
      logger.error('Failed to convert frontmatter to prospect:', error);
      return null;
    }
  }
}

/**
 * Export singleton instance
 */
export const prospectFolderManager = new ProspectFolderManager();