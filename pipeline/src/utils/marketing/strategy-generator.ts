/**
 * AI-Powered Marketing Strategy Generator
 * Creates customized digital marketing strategies for prospects based on business intelligence
 */

import { Logger } from '../logging';

export interface BusinessProfile {
  name: string;
  industry: string;
  location: string;
  phone?: string;
  website?: string;
  businessSize: string;
  hasWebsite: boolean;
  hasGoogleBusiness: boolean;
  hasSocialMedia: boolean;
  hasOnlineReviews: boolean;
  rating?: number;
  reviewCount?: number;
  businessInsights?: {
    operationalStrengths: string[];
    customerDemographics: string[];
    revenueIndicators: string[];
    marketPosition: string[];
  };
}

export interface MarketingStrategy {
  executiveSummary: string;
  industryAnalysis: {
    marketSize: string;
    averageRevenue: string;
    profitMargins: string;
    digitalSpendPercentage: string;
    keyTrends: string[];
  };
  digitalMarketingPlan: {
    priorityLevel: 'high' | 'medium' | 'low';
    timeline: string;
    estimatedBudget: string;
    expectedROI: string;
    strategies: MarketingVector[];
  };
  implementationRoadmap: {
    phase1: string[];
    phase2: string[];
    phase3: string[];
  };
  successMetrics: string[];
}

export interface MarketingVector {
  name: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  stepByStepPlan: string[];
  estimatedCost: string;
  timeframe: string;
  expectedResults: string[];
  tools: string[];
}

export class MarketingStrategyGenerator {
  private logger: Logger;
  private anthropicApiKey: string;
  private perplexityApiKey: string;

  constructor() {
    this.logger = new Logger('MarketingStrategyGenerator', 'marketing');
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY || '';
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY || '';
  }

  /**
   * Generate comprehensive marketing strategy for a business
   */
  async generateStrategy(businessProfile: BusinessProfile): Promise<MarketingStrategy> {
    try {
      this.logger.info('Generating marketing strategy', { 
        business: businessProfile.name,
        industry: businessProfile.industry 
      });

      // Step 1: Industry research and analysis
      const industryData = await this.conductIndustryResearch(businessProfile);
      
      // Step 2: Generate customized marketing strategy
      const strategy = await this.createMarketingStrategy(businessProfile, industryData);
      
      this.logger.info('Marketing strategy generated successfully', {
        business: businessProfile.name,
        strategiesCount: strategy.digitalMarketingPlan?.strategies?.length || 0,
        priority: strategy.digitalMarketingPlan?.priorityLevel || 'unknown'
      });

      return strategy;

    } catch (error) {
      this.logger.error('Failed to generate marketing strategy', {
        error: error.message,
        business: businessProfile.name
      });
      
      // Return fallback strategy instead of throwing
      this.logger.info('Generating fallback marketing strategy');
      return this.generateFallbackStrategy(businessProfile);
    }
  }

  /**
   * Research industry data using Perplexity AI
   */
  private async conductIndustryResearch(profile: BusinessProfile): Promise<any> {
    try {
      if (!this.perplexityApiKey) {
        this.logger.warn('Perplexity API key not available, using fallback data');
        return this.getFallbackIndustryData(profile.industry);
      }

      const researchPrompt = `Research the ${profile.industry} industry in ${profile.location}:
      
1. Market size and growth trends
2. Average revenue for ${profile.businessSize} businesses
3. Typical profit margins
4. Digital marketing spending percentages
5. Key industry trends for 2025
6. Local competition analysis
7. Customer acquisition costs
8. Most effective marketing channels
9. Seasonal patterns and opportunities
10. Technology adoption rates

Focus on actionable data for a ${profile.businessSize} ${profile.industry} business.`;

      const response = await this.callPerplexityAPI(researchPrompt);
      
      return this.parseIndustryResearch(response);

    } catch (error) {
      this.logger.warn('Industry research failed, using fallback data', { error: error.message });
      return this.getFallbackIndustryData(profile.industry);
    }
  }

  /**
   * Create marketing strategy using Claude AI
   */
  private async createMarketingStrategy(profile: BusinessProfile, industryData: any): Promise<MarketingStrategy> {
    try {
      if (!this.anthropicApiKey) {
        throw new Error('Anthropic API key not available');
      }

      const strategyPrompt = this.buildStrategyPrompt(profile, industryData);
      const response = await this.callClaudeAPI(strategyPrompt);
      
      return this.parseMarketingStrategy(response);

    } catch (error) {
      this.logger.error('Claude API strategy generation failed', { error: error.message });
      return this.generateFallbackStrategy(profile);
    }
  }

  /**
   * Build comprehensive strategy prompt for Claude
   */
  private buildStrategyPrompt(profile: BusinessProfile, industryData: any): string {
    return `You are a senior digital marketing strategist creating a local-first digital marketing strategy for a ${profile.industry} business.

BUSINESS PROFILE:
- Name: ${profile.name}
- Industry: ${profile.industry}
- Location: ${profile.location}
- Size: ${profile.businessSize}
- Phone: ${profile.phone || 'Not available'}
- Website: ${profile.hasWebsite ? profile.website : 'No website'}
- Google Business: ${profile.hasGoogleBusiness ? 'Yes' : 'No'}
- Social Media: ${profile.hasSocialMedia ? 'Yes' : 'Limited/None'}
- Online Reviews: ${profile.hasOnlineReviews ? `Yes (${profile.rating}/5, ${profile.reviewCount} reviews)` : 'No'}

BUSINESS INSIGHTS:
${profile.businessInsights ? `
- Operational Strengths: ${profile.businessInsights.operationalStrengths.join(', ')}
- Customer Demographics: ${profile.businessInsights.customerDemographics.join(', ')}
- Revenue Indicators: ${profile.businessInsights.revenueIndicators.join(', ')}
- Market Position: ${profile.businessInsights.marketPosition.join(', ')}
` : 'Limited business insights available'}

INDUSTRY DATA:
${JSON.stringify(industryData, null, 2)}

Create a comprehensive local-first digital marketing strategy with:

1. EXECUTIVE SUMMARY (2-3 sentences on the opportunity)

2. INDUSTRY ANALYSIS:
   - Market size and revenue potential
   - Average profit margins for this industry
   - Digital marketing spend percentages
   - Key trends affecting the industry

3. DIGITAL MARKETING PLAN with these vectors (prioritize based on business needs):
   a) Google Business Profile Optimization
   b) Local SEO Strategy
   c) Social Media Marketing
   d) Review Management System
   e) Email Marketing & Customer Retention
   f) Website Development/Optimization
   g) Paid Advertising (Google Ads, Facebook Ads)
   h) Content Marketing
   i) Influencer/Community Partnerships

For each marketing vector, provide:
- Priority level (high/medium/low)
- Detailed step-by-step implementation plan
- Estimated monthly costs
- Timeline for implementation
- Expected results and ROI
- Recommended tools/platforms

4. IMPLEMENTATION ROADMAP:
   - Phase 1 (Month 1-2): Quick wins and foundation
   - Phase 2 (Month 3-6): Growth and optimization
   - Phase 3 (Month 6-12): Scale and advanced strategies

5. SUCCESS METRICS to track

Format the response as a structured JSON object that matches the MarketingStrategy interface.`;
  }

  /**
   * Call Perplexity API for industry research
   */
  private async callPerplexityAPI(prompt: string): Promise<string> {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.perplexityApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a business research analyst specializing in local market analysis and industry data.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Call Claude API for strategy generation
   */
  private async callClaudeAPI(prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 8000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  /**
   * Parse industry research response
   */
  private parseIndustryResearch(response: string): any {
    // Extract key industry metrics from Perplexity response
    return {
      marketSize: this.extractMetric(response, ['market size', 'industry size']),
      averageRevenue: this.extractMetric(response, ['average revenue', 'typical revenue']),
      profitMargins: this.extractMetric(response, ['profit margin', 'margins']),
      digitalSpend: this.extractMetric(response, ['digital marketing', 'marketing spend']),
      trends: this.extractTrends(response),
      customerAcquisitionCost: this.extractMetric(response, ['acquisition cost', 'CAC']),
      seasonality: this.extractMetric(response, ['seasonal', 'seasonality'])
    };
  }

  /**
   * Parse marketing strategy response from Claude
   */
  private parseMarketingStrategy(response: string): MarketingStrategy {
    try {
      // Try to parse as JSON first
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanResponse);
      
      // Validate that the parsed strategy has required structure
      if (!parsed.digitalMarketingPlan || !parsed.digitalMarketingPlan.strategies) {
        this.logger.warn('Parsed strategy missing required structure, using fallback');
        throw new Error('Invalid strategy structure');
      }
      
      return parsed;
    } catch (error) {
      this.logger.warn('JSON parsing failed, using text parsing fallback', { error: error.message });
      // Fallback to text parsing if JSON parsing fails
      return this.parseStrategyFromText(response);
    }
  }

  /**
   * Extract metrics from research text
   */
  private extractMetric(text: string, keywords: string[]): string {
    for (const keyword of keywords) {
      const regex = new RegExp(`${keyword}[^.]*?([\\d,.$%]+[^.]*?)`, 'gi');
      const match = text.match(regex);
      if (match) {
        return match[0].trim();
      }
    }
    return 'Data not available';
  }

  /**
   * Extract trends from research text
   */
  private extractTrends(text: string): string[] {
    const trendSection = text.match(/trend[s]?[^.]*?(?:\n|$)/gi);
    if (trendSection) {
      return trendSection.slice(0, 5).map(trend => trend.trim());
    }
    return ['Industry trend data not available'];
  }

  /**
   * Parse strategy from text if JSON parsing fails
   */
  private parseStrategyFromText(text: string): MarketingStrategy {
    // Fallback parsing logic for non-JSON responses
    return {
      executiveSummary: this.extractSection(text, 'executive summary') || 'Marketing strategy tailored for local business growth.',
      industryAnalysis: {
        marketSize: 'Industry data pending analysis',
        averageRevenue: 'Revenue data pending analysis',
        profitMargins: 'Margin data pending analysis',
        digitalSpendPercentage: '10-15% typical for industry',
        keyTrends: ['Digital transformation', 'Local market focus', 'Customer experience optimization']
      },
      digitalMarketingPlan: {
        priorityLevel: 'high',
        timeline: '6-12 months',
        estimatedBudget: '$2,000-5,000/month',
        expectedROI: '200-400%',
        strategies: this.getDefaultMarketingVectors()
      },
      implementationRoadmap: {
        phase1: ['Google Business Profile optimization', 'Basic SEO setup', 'Review management'],
        phase2: ['Social media launch', 'Content creation', 'Email marketing'],
        phase3: ['Paid advertising', 'Advanced analytics', 'Scale successful campaigns']
      },
      successMetrics: ['Local search ranking', 'Website traffic', 'Lead generation', 'Customer acquisition cost', 'Revenue growth']
    };
  }

  /**
   * Extract section from text
   */
  private extractSection(text: string, sectionName: string): string | null {
    const regex = new RegExp(`${sectionName}[:\\s]*([^\\n]*(?:\\n(?!\\w+:)[^\\n]*)*)`, 'gi');
    const match = text.match(regex);
    return match ? match[0].replace(new RegExp(sectionName + '[:\\s]*', 'gi'), '').trim() : null;
  }

  /**
   * Get default marketing vectors for fallback
   */
  private getDefaultMarketingVectors(): MarketingVector[] {
    return [
      {
        name: 'Google Business Profile Optimization',
        priority: 'high',
        description: 'Optimize Google Business Profile for local search visibility',
        stepByStepPlan: [
          'Complete all business information fields',
          'Add high-quality photos and videos',
          'Set up posting schedule for updates',
          'Implement review response strategy',
          'Add service/product catalogs'
        ],
        estimatedCost: '$200-500/month',
        timeframe: '2-4 weeks',
        expectedResults: ['50% increase in local search visibility', 'More customer inquiries', 'Better review ratings'],
        tools: ['Google Business Profile', 'Review management software']
      },
      {
        name: 'Local SEO Strategy',
        priority: 'high',
        description: 'Improve local search rankings and online visibility',
        stepByStepPlan: [
          'Keyword research for local terms',
          'Optimize website for local search',
          'Create location-specific content',
          'Build local citations and backlinks',
          'Implement schema markup'
        ],
        estimatedCost: '$500-1,200/month',
        timeframe: '3-6 months',
        expectedResults: ['Top 3 local search rankings', 'Increased organic traffic', 'More qualified leads'],
        tools: ['SEMrush', 'BrightLocal', 'Google Search Console']
      },
      {
        name: 'Social Media Marketing',
        priority: 'medium',
        description: 'Build brand awareness and customer engagement on social platforms',
        stepByStepPlan: [
          'Audit current social media presence',
          'Create content calendar and strategy',
          'Design branded templates and assets',
          'Implement posting schedule',
          'Engage with local community and customers'
        ],
        estimatedCost: '$300-800/month',
        timeframe: '1-3 months setup, ongoing',
        expectedResults: ['Increased brand awareness', 'Higher customer engagement', 'More website traffic'],
        tools: ['Hootsuite', 'Canva', 'Facebook Business Manager']
      }
    ];
  }

  /**
   * Generate fallback strategy when AI APIs fail
   */
  private generateFallbackStrategy(profile: BusinessProfile): MarketingStrategy {
    const industryMultiplier = this.getIndustryMultiplier(profile.industry);
    
    return {
      executiveSummary: `${profile.name} has strong potential for digital marketing growth in the ${profile.industry} sector. Based on business profile analysis, we recommend a local-first strategy focusing on Google Business optimization, local SEO, and customer retention programs.`,
      industryAnalysis: this.getFallbackIndustryData(profile.industry),
      digitalMarketingPlan: {
        priorityLevel: 'high',
        timeline: '6-12 months',
        estimatedBudget: `$${Math.round(2000 * industryMultiplier)}-${Math.round(5000 * industryMultiplier)}/month`,
        expectedROI: '200-400%',
        strategies: this.getCustomizedMarketingVectors(profile)
      },
      implementationRoadmap: {
        phase1: ['Google Business Profile optimization', 'Website audit and basic SEO', 'Review management setup'],
        phase2: ['Social media presence establishment', 'Content marketing launch', 'Email marketing system'],
        phase3: ['Paid advertising campaigns', 'Advanced analytics implementation', 'Scale successful initiatives']
      },
      successMetrics: [
        'Local search ranking improvements',
        'Website traffic growth (25-50%)',
        'Lead generation increase (30-60%)',
        'Customer acquisition cost reduction',
        'Revenue growth tracking'
      ]
    };
  }

  /**
   * Get industry-specific multiplier for costs
   */
  private getIndustryMultiplier(industry: string): number {
    const multipliers: { [key: string]: number } = {
      'restaurants': 1.2,
      'retail': 1.0,
      'professional_services': 1.5,
      'healthcare': 1.3,
      'automotive': 1.1,
      'real_estate': 1.4,
      'fitness': 1.0,
      'beauty': 1.1
    };
    return multipliers[industry] || 1.0;
  }

  /**
   * Get customized marketing vectors based on business profile
   */
  private getCustomizedMarketingVectors(profile: BusinessProfile): MarketingVector[] {
    const vectors = this.getDefaultMarketingVectors();
    
    // Customize based on current digital presence
    if (!profile.hasWebsite) {
      vectors.unshift({
        name: 'Website Development',
        priority: 'high',
        description: 'Create professional website to establish online presence',
        stepByStepPlan: [
          'Design mobile-responsive website',
          'Implement local SEO best practices',
          'Add contact forms and call-to-action buttons',
          'Integrate with Google Business Profile',
          'Set up analytics tracking'
        ],
        estimatedCost: '$2,000-5,000 setup + $100-300/month hosting',
        timeframe: '4-8 weeks',
        expectedResults: ['Professional online presence', 'Lead capture capability', 'Improved credibility'],
        tools: ['WordPress', 'Webflow', 'Google Analytics']
      });
    }

    if (!profile.hasSocialMedia) {
      const socialVector = vectors.find(v => v.name === 'Social Media Marketing');
      if (socialVector) {
        socialVector.priority = 'high';
      }
    }

    return vectors;
  }

  /**
   * Get fallback industry data
   */
  private getFallbackIndustryData(industry: string): any {
    const industryDefaults: { [key: string]: any } = {
      'restaurants': {
        marketSize: '$899 billion (US restaurant industry)',
        averageRevenue: '$300K-$1.2M annually for independent restaurants',
        profitMargins: '3-9% net profit margin',
        digitalSpendPercentage: '3-6% of revenue on marketing',
        keyTrends: [
          'Online ordering and delivery growth',
          'Social media marketing importance',
          'Review management critical',
          'Local SEO dominance',
          'Mobile-first customer experience'
        ]
      }
    };

    return industryDefaults[industry] || {
      marketSize: 'Industry analysis pending',
      averageRevenue: '$250K-$2M annually (typical small business)',
      profitMargins: '10-20% net profit margin',
      digitalSpendPercentage: '5-10% of revenue on marketing',
      keyTrends: [
        'Digital transformation acceleration',
        'Local search optimization importance',
        'Customer experience focus',
        'Data-driven marketing adoption',
        'Multi-channel marketing integration'
      ]
    };
  }
}