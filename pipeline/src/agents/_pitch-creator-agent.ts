import { Prospect } from '../types/prospect';
import { prospectFolderManager, sanitizeProspectName } from '../utils/obsidian/prospect-folder-manager';
import { parseFrontmatter } from '../utils/obsidian/frontmatter-parser';
import { join } from 'path';
import { readFile, writeFile } from 'fs/promises';

export interface PitchComponents {
  hook: string;
  valueProposition: string;
  proofPoints: string;
  roiProjection: string;
  callToAction: string;
}

// Interface for the actual frontmatter structure in migrated prospects
export interface ProspectFrontmatter {
  company: string;
  industry: string;
  location: string;
  qualification_score: number;
  pipeline_stage: string;
  primary_contact?: string;
  contact_title?: string;
  phone: string;
  email: string;
  website: string;
  decision_maker?: string;
  employee_count?: number;
  estimated_revenue?: number;
  business_size: string;
  has_website: boolean;
  has_google_business: boolean;
  has_social_media: boolean;
  has_online_reviews: boolean;
  score_business?: number;
  score_digital?: number;
  score_market?: number;
  score_competition?: number;
  score_revenue?: number;
}

export interface PitchGenerationOptions {
  prospectFolder: string;
  industry?: string;
  focusAreas?: string[];
  template?: 'standard' | 'executive' | 'technical';
}

export class PitchCreatorAgent {
  private readonly obsidianVaultPath: string;

  constructor() {
    this.obsidianVaultPath = process.env.OBSIDIAN_VAULT_PATH || '/Users/pbarrick/Documents/Main';
  }

  /**
   * Generate a complete custom pitch for a prospect
   */
  async generatePitch(prospectFolder: string, options: Partial<PitchGenerationOptions> = {}): Promise<{
    success: boolean;
    pitchPath?: string;
    error?: string;
  }> {
    try {
      // Load prospect data from index.md
      const prospect = await this.loadProspectData(prospectFolder);
      if (!prospect) {
        return { success: false, error: `Prospect not found: ${prospectFolder}` };
      }

      // Generate pitch components based on prospect data
      const pitchComponents = await this.generatePitchComponents(prospect, options);

      // Create the complete pitch content
      const pitchContent = await this.formatPitchContent(prospect, pitchComponents);

      // Write to pitch.md file
      const pitchPath = await this.writePitchFile(prospectFolder, pitchContent);

      return { success: true, pitchPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate pitches for all prospects that don't have custom content yet
   */
  async generateAllPitches(): Promise<{
    success: boolean;
    results: Array<{ prospectFolder: string; success: boolean; error?: string }>;
  }> {
    try {
      const prospects = await prospectFolderManager.getAllProspects();
      const results = [];

      for (const prospect of prospects) {
        // Handle both old structure (nested) and new structure (flat frontmatter)
        const companyName = prospect.business?.name || (prospect as any).company || 'Unknown Company';
        const folderName = sanitizeProspectName(companyName);
        
        // Check if pitch needs to be generated
        const needsGeneration = await this.needsPitchGeneration(folderName);
        
        if (needsGeneration) {
          const result = await this.generatePitch(folderName);
          results.push({
            prospectFolder: folderName,
            success: result.success,
            error: result.error
          });
        }
      }

      return { success: true, results };
    } catch (error) {
      return { success: false, results: [], error: error.message };
    }
  }

  /**
   * Load prospect data from index.md file
   */
  private async loadProspectData(prospectFolder: string): Promise<ProspectFrontmatter | null> {
    try {
      const indexPath = join(
        this.obsidianVaultPath,
        'Projects/Sales/Prospects',
        prospectFolder,
        'index.md'
      );

      const content = await readFile(indexPath, 'utf8');
      const { frontmatter } = parseFrontmatter(content);

      return frontmatter as ProspectFrontmatter;
    } catch (error) {
      console.error(`Error loading prospect data for ${prospectFolder}:`, error);
      return null;
    }
  }

  /**
   * Generate pitch components based on prospect analysis
   */
  private async generatePitchComponents(prospect: ProspectFrontmatter, options: Partial<PitchGenerationOptions>): Promise<PitchComponents> {
    const industry = prospect.industry || 'business';
    const qualificationScore = prospect.qualification_score || 50;
    const revenue = prospect.estimated_revenue || 500000;
    const businessSize = prospect.business_size || 'small';

    // Generate industry-specific hook
    const hook = this.generateHook(industry, prospect);

    // Create value proposition based on digital presence gaps
    const valueProposition = this.generateValueProposition(prospect);

    // Generate relevant proof points and case studies
    const proofPoints = this.generateProofPoints(industry, businessSize);

    // Calculate ROI projection based on revenue and business size
    const roiProjection = this.generateROIProjection(revenue, businessSize, prospect);

    // Create tailored call to action based on pipeline stage
    const callToAction = this.generateCallToAction(prospect.pipeline_stage, qualificationScore);

    return {
      hook,
      valueProposition,
      proofPoints,
      roiProjection,
      callToAction
    };
  }

  /**
   * Generate industry-specific hook
   */
  private generateHook(industry: string, prospect: ProspectFrontmatter): string {
    const industryHooks = {
      restaurants: `Hi ${prospect.primary_contact || 'there'}, I noticed ${prospect.company} has excellent reviews on Google, but you're missing out on a huge opportunity to turn those happy customers into a steady stream of new business through strategic social media and online ordering.`,
      
      retail: `${prospect.primary_contact || 'Hello'}, I came across ${prospect.company} and was impressed by your local presence in ${prospect.location}. However, I noticed you could be capturing significantly more online sales with some targeted digital marketing improvements.`,
      
      'professional-services': `Hi ${prospect.primary_contact || 'there'}, I've been researching successful ${industry} firms in ${prospect.location}, and ${prospect.company} clearly has strong fundamentals. What caught my attention is the untapped potential I see in your digital presence.`,
      
      healthcare: `${prospect.primary_contact || 'Hello'}, I noticed ${prospect.company} provides excellent service in ${prospect.location}, but you might be missing potential patients who are searching online for your services.`,
      
      default: `Hi ${prospect.primary_contact || 'there'}, I came across ${prospect.company} while researching successful businesses in ${prospect.location}. What stood out to me is the opportunity to amplify your existing success through strategic digital marketing.`
    };

    return industryHooks[industry] || industryHooks.default;
  }

  /**
   * Generate value proposition based on digital presence analysis
   */
  private generateValueProposition(prospect: ProspectFrontmatter): string {
    const gaps = [];
    const strengths = [];

    // Analyze digital presence gaps
    if (!prospect.has_social_media) gaps.push('social media presence');
    if (!prospect.has_website) gaps.push('professional website');
    if (!prospect.has_google_business) gaps.push('Google Business optimization');
    if (!prospect.has_online_reviews) gaps.push('online review management');

    // Identify strengths
    if (prospect.has_website) strengths.push('existing website foundation');
    if (prospect.has_google_business) strengths.push('Google Business profile');
    if (prospect.has_online_reviews) strengths.push('positive online reputation');

    const gapsList = gaps.length > 0 ? gaps.join(', ') : 'digital optimization opportunities';
    const strengthsList = strengths.length > 0 ? strengths.join(' and ') : 'business fundamentals';

    return `Here's what I can do for ${prospect.company}: I'll build on your ${strengthsList} to address your ${gapsList}, creating a comprehensive digital marketing system that generates consistent leads and increases revenue by 20-40% within 6 months.`;
  }

  /**
   * Generate industry-specific proof points
   */
  private generateProofPoints(industry: string, businessSize: string): string {
    const proofPoints = {
      restaurants: {
        small: "Just last month, I helped Milano's Bistro (similar size to yours) increase their takeout orders by 65% and boost weekend reservations by 40% through targeted social media campaigns and online ordering optimization.",
        medium: "I recently worked with Copper Creek Restaurant Group, where we implemented a comprehensive digital strategy that increased their overall revenue by $180,000 in the first year through social media marketing, review management, and online ordering systems.",
        large: "For restaurant chains like yours, I've helped increase system-wide digital sales by 25-35%. One client saw a $450,000 revenue increase across their locations through coordinated social media, local SEO, and online ordering optimization."
      },
      retail: {
        small: "A boutique clothing store similar to yours saw a 200% increase in online sales and 45% boost in foot traffic within 4 months of implementing my digital marketing strategy.",
        medium: "I helped a regional retail chain increase their online revenue by $320,000 annually while driving 30% more qualified foot traffic to their physical locations.",
        large: "For larger retailers, my strategies typically generate 25-40% increases in omnichannel sales, with one client achieving $1.2M in additional revenue through improved digital presence and customer engagement."
      },
      'professional-services': {
        small: "A local law firm I worked with went from 2-3 new clients per month to 12-15, with 70% of new business coming from online sources within 6 months.",
        medium: "I helped a regional accounting firm increase their client base by 85% and boost average client value by 40% through strategic content marketing and local SEO optimization.",
        large: "For established professional service firms, I typically see 30-50% increases in qualified leads and 20-25% improvement in client retention through comprehensive digital marketing strategies."
      },
      default: {
        small: "Similar businesses in your market have seen 40-70% increases in qualified leads and 25-35% revenue growth within 6 months of implementing my digital marketing strategies.",
        medium: "I've helped medium-sized businesses like yours achieve an average of $250,000 in additional annual revenue through comprehensive digital marketing optimization.",
        large: "For established businesses, my strategies typically generate 20-40% increases in qualified leads and 15-25% improvement in conversion rates."
      }
    };

    const industryProofs = proofPoints[industry] || proofPoints.default;
    return industryProofs[businessSize] || industryProofs.small;
  }

  /**
   * Generate ROI projection based on business metrics
   */
  private generateROIProjection(revenue: number, businessSize: string, prospect: ProspectFrontmatter): string {
    // Calculate investment based on business size
    let monthlyInvestment = 800; // Base monthly
    let setupCost = 2500; // Base setup

    if (businessSize === 'medium') {
      monthlyInvestment = 1200;
      setupCost = 3500;
    } else if (businessSize === 'large') {
      monthlyInvestment = 1800;
      setupCost = 5000;
    }

    // Calculate projected revenue increase (conservative estimate)
    const revenueIncreasePercent = businessSize === 'large' ? 0.15 : businessSize === 'medium' ? 0.20 : 0.25;
    const projectedIncrease = revenue * revenueIncreasePercent;
    const monthlyIncrease = projectedIncrease / 12;

    // Calculate ROI
    const annualInvestment = setupCost + (monthlyInvestment * 12);
    const roi = ((projectedIncrease - annualInvestment) / annualInvestment * 100).toFixed(0);

    return `Here's the financial impact for ${prospect.company}:

**Investment**: $${setupCost.toLocaleString()} setup + $${monthlyInvestment}/month = $${annualInvestment.toLocaleString()} first year

**Projected Revenue Increase**: $${projectedIncrease.toLocaleString()} annually ($${Math.round(monthlyIncrease).toLocaleString()}/month)

**Net ROI**: ${roi}% return on investment in year one

**Break-even**: Month ${Math.ceil(setupCost / (monthlyIncrease - monthlyInvestment))}

This projection is based on similar ${prospect.industry} businesses with comparable revenue. Most clients see results within 60-90 days, with full impact realized by month 6.`;
  }

  /**
   * Generate call to action based on pipeline stage
   */
  private generateCallToAction(stage: string, score: number): string {
    if (score >= 80) {
      return `Given your strong business fundamentals and clear growth potential, I'd like to schedule a 15-minute call this week to show you exactly how this would work for ${stage === 'interested' ? 'your business' : 'you'}. I have case studies from similar businesses and can walk you through a customized strategy.

When would be a good time for a brief call? I'm available Tuesday-Thursday this week between 10 AM and 4 PM.`;
    } else if (score >= 60) {
      return `I'd love to share more details about how this approach has worked for similar businesses in your area. Would you be interested in a brief 10-minute call to discuss your specific situation and see if this might be a good fit?

I'm available for a quick conversation Monday-Friday between 10 AM and 5 PM. What works best for your schedule?`;
    } else {
      return `If this sounds interesting, I'd be happy to send you a brief case study from a similar business that shows exactly how we achieved these results. 

Would you like me to email you the details, or would you prefer a quick 5-minute call to discuss how this might apply to your situation?`;
    }
  }

  /**
   * Format the complete pitch content with frontmatter
   */
  private async formatPitchContent(prospect: ProspectFrontmatter, components: PitchComponents): Promise<string> {
    const now = new Date().toISOString();
    
    return `---
type: prospect-pitch
company: "${prospect.company}"
industry: ${prospect.industry}
created: "${now}"
updated: "${now}"
status: generated
pitch_version: 1.0
qualification_score: ${prospect.qualification_score}
tags: [sales, pitch, ${prospect.industry}, ai-generated]
---

# Custom Pitch - ${prospect.company}

> **AI-Generated Sales Pitch**
> 
> This pitch has been customized based on the prospect's business profile, digital presence analysis, and industry best practices.

## 🎯 Opening Hook

${components.hook}

## 💎 Value Proposition

${components.valueProposition}

## 📊 Proof Points & Case Studies

${components.proofPoints}

## 💰 ROI Projection

${components.roiProjection}

## 🚀 Next Steps

${components.callToAction}

---

## 📋 Pitch Customization Notes

**Based on Prospect Analysis:**
- **Qualification Score**: ${prospect.qualification_score}/100
- **Business Size**: ${prospect.business_size}
- **Estimated Revenue**: $${prospect.estimated_revenue?.toLocaleString()}
- **Pipeline Stage**: ${prospect.pipeline_stage}

**Digital Presence Gaps Identified:**
${!prospect.has_social_media ? '- No social media presence\n' : ''}${!prospect.has_website ? '- Missing professional website\n' : ''}${!prospect.has_google_business ? '- Google Business not optimized\n' : ''}${!prospect.has_online_reviews ? '- Limited online review management\n' : ''}

**Key Opportunity Areas:**
- Industry-specific digital marketing strategy
- Local market penetration improvement
- Customer acquisition cost optimization
- Revenue stream diversification

---

*This pitch was generated by the MHM Pitch Creator Agent*
*Prospect data source: [[index|Prospect Profile]]*
*Last updated: ${now}*`;
  }

  /**
   * Write the pitch content to the pitch.md file
   */
  private async writePitchFile(prospectFolder: string, content: string): Promise<string> {
    const pitchPath = join(
      this.obsidianVaultPath,
      'Projects/Sales/Prospects',
      prospectFolder,
      'pitch.md'
    );

    await writeFile(pitchPath, content, 'utf8');
    return pitchPath;
  }

  /**
   * Check if a prospect needs pitch generation
   */
  private async needsPitchGeneration(prospectFolder: string): Promise<boolean> {
    try {
      const pitchPath = join(
        this.obsidianVaultPath,
        'Projects/Sales/Prospects',
        prospectFolder,
        'pitch.md'
      );

      const content = await readFile(pitchPath, 'utf8');
      
      // Check if it's still a placeholder (contains "To be generated")
      return content.includes('To be generated') || content.includes('This file will be populated');
    } catch (error) {
      // File doesn't exist, needs generation
      return true;
    }
  }

  /**
   * Update existing pitch with new data
   */
  async updatePitch(prospectFolder: string, forceRegenerate: boolean = false): Promise<{
    success: boolean;
    updated: boolean;
    pitchPath?: string;
    error?: string;
  }> {
    try {
      const needsUpdate = forceRegenerate || await this.needsPitchGeneration(prospectFolder);
      
      if (!needsUpdate) {
        return { success: true, updated: false };
      }

      const result = await this.generatePitch(prospectFolder);
      return {
        success: result.success,
        updated: result.success,
        pitchPath: result.pitchPath,
        error: result.error
      };
    } catch (error) {
      return { success: false, updated: false, error: error.message };
    }
  }
}

export const pitchCreatorAgent = new PitchCreatorAgent();