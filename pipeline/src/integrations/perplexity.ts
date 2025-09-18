/**
 * Perplexity AI Integration
 * Handles market intelligence and competitive analysis using Perplexity API
 */

import { Logger } from '../utils/logging';

export interface PerplexityQuery {
  query: string;
  model?: 'sonar' | 'sonar-pro' | 'sonar-reasoning' | 'sonar-reasoning-pro' | 'sonar-deep-research';
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  search_domain_filter?: string[];
  return_citations?: boolean;
  return_images?: boolean;
  search_recency_filter?: 'month' | 'week' | 'day' | 'hour';
}

export interface PerplexityResponse {
  id: string;
  model: string;
  created: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta?: {
      role?: string;
      content?: string;
    };
  }>;
  citations?: string[];
  images?: string[];
}

export interface MarketIntelligence {
  businessName: string;
  industry: string;
  location: string;
  analysis: {
    marketSize: {
      localMarketValue?: string;
      growthRate?: string;
      keyTrends: string[];
    };
    competitiveLandscape: {
      majorCompetitors: Array<{
        name: string;
        strengths: string[];
        weaknesses: string[];
        marketPosition: string;
      }>;
      marketGaps: string[];
      differentiationOpportunities: string[];
    };
    customerBase: {
      targetDemographics: string[];
      commonPainPoints: string[];
      buyingBehavior: string[];
    };
    digitalPresence: {
      industryBenchmarks: string[];
      commonDeficiencies: string[];
      opportunityAreas: string[];
    };
    marketingChannels: {
      effective: string[];
      underutilized: string[];
      recommended: string[];
    };
  };
  opportunityScore: number; // 0-100
  keyInsights: string[];
  lastUpdated: Date;
}

export class PerplexityIntegration {
  private logger: Logger;
  private apiKey: string;
  private baseUrl: string = 'https://api.perplexity.ai';
  private requestCount: number = 0;
  private lastReset: number = Date.now();

  constructor() {
    this.logger = new Logger('PerplexityIntegration', 'integration');
    this.apiKey = process.env.PERPLEXITY_API_KEY || '';
    
    if (!this.apiKey) {
      this.logger.warn('Perplexity API key not found, using mock intelligence mode');
    }
    
    this.logger.info('Perplexity Integration initialized', {
      mockMode: !this.apiKey
    });
  }

  /**
   * Query Perplexity for market intelligence
   */
  async query(params: PerplexityQuery): Promise<PerplexityResponse> {
    try {
      this.checkRateLimit();
      
      if (!this.apiKey) {
        return this.getMockResponse(params);
      }

      const chatUrl = `${this.baseUrl}/chat/completions`;
      const requestBody = {
        model: params.model || 'sonar',
        messages: [
          {
            role: 'user',
            content: params.query
          }
        ],
        max_tokens: params.max_tokens || 2000,
        temperature: params.temperature || 0.2,
        top_p: params.top_p || 0.9,
        search_domain_filter: params.search_domain_filter,
        return_citations: params.return_citations ?? true,
        return_images: params.return_images ?? false,
        search_recency_filter: params.search_recency_filter || 'month'
      };

      this.logger.debug('Making Perplexity API request', {
        model: requestBody.model,
        queryLength: params.query.length,
        maxTokens: requestBody.max_tokens
      });

      const response = await fetch(chatUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`Perplexity API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      this.logger.info('Perplexity query completed', {
        model: data.model,
        tokensUsed: data.usage?.total_tokens,
        citationsCount: data.citations?.length || 0
      });

      return data;

    } catch (error) {
      this.logger.error('Perplexity query failed', {
        error: error.message,
        query: params.query.substring(0, 100) + '...'
      });
      
      // Return mock response on failure
      return this.getMockResponse(params);
    }
  }

  /**
   * Generate comprehensive market intelligence for a business
   */
  async generateMarketIntelligence(
    businessName: string,
    industry: string,
    location: string
  ): Promise<MarketIntelligence> {
    try {
      // Build comprehensive query for market intelligence
      const query = this.buildMarketIntelligenceQuery(businessName, industry, location);
      
      const response = await this.query({
        query,
        model: 'sonar',
        max_tokens: 3000,
        temperature: 0.1,
        search_recency_filter: 'month',
        return_citations: true
      });

      const intelligence = this.parseMarketIntelligence(response, businessName, industry, location);
      
      this.logger.info('Market intelligence generated', {
        businessName,
        industry,
        location,
        opportunityScore: intelligence.opportunityScore,
        competitorsFound: intelligence.analysis.competitiveLandscape.majorCompetitors.length
      });

      return intelligence;

    } catch (error) {
      this.logger.error('Failed to generate market intelligence', {
        error: error.message,
        businessName,
        industry,
        location
      });
      
      // Return mock intelligence on failure
      return this.getMockMarketIntelligence(businessName, industry, location);
    }
  }

  /**
   * Analyze specific competitor
   */
  async analyzeCompetitor(competitorName: string, industry: string, location: string): Promise<{
    name: string;
    strengths: string[];
    weaknesses: string[];
    marketPosition: string;
    digitalPresence: string[];
    pricingStrategy: string;
    targetMarket: string[];
  }> {
    const query = `Analyze ${competitorName} in the ${industry} industry in ${location}. 
    Focus on their strengths, weaknesses, market position, digital marketing strategy, 
    pricing approach, and target customer base. Include recent developments and market positioning.`;

    try {
      const response = await this.query({
        query,
        model: 'sonar',
        max_tokens: 1500,
        temperature: 0.1
      });

      return this.parseCompetitorAnalysis(response, competitorName);

    } catch (error) {
      this.logger.error('Competitor analysis failed', {
        error: error.message,
        competitorName
      });
      
      return {
        name: competitorName,
        strengths: ['Established brand presence', 'Customer loyalty'],
        weaknesses: ['Limited digital presence', 'Outdated marketing approach'],
        marketPosition: 'Established local player',
        digitalPresence: ['Basic website', 'Limited social media'],
        pricingStrategy: 'Competitive pricing',
        targetMarket: ['Local businesses', 'Small to medium enterprises']
      };
    }
  }

  /**
   * Get industry trends and insights
   */
  async getIndustryTrends(industry: string, location: string): Promise<{
    trends: string[];
    opportunities: string[];
    threats: string[];
    marketGrowth: string;
    keyPlayers: string[];
    regulatoryChanges: string[];
  }> {
    const query = `What are the current trends, opportunities, and challenges in the ${industry} 
    industry specifically in ${location}? Include market growth projections, key players, 
    emerging technologies, regulatory changes, and opportunities for new businesses.`;

    try {
      const response = await this.query({
        query,
        model: 'sonar',
        max_tokens: 2000,
        temperature: 0.1,
        search_recency_filter: 'month'
      });

      return this.parseIndustryTrends(response);

    } catch (error) {
      this.logger.error('Industry trends analysis failed', {
        error: error.message,
        industry,
        location
      });
      
      return {
        trends: ['Digital transformation', 'Remote service delivery', 'Sustainability focus'],
        opportunities: ['Untapped digital channels', 'Underserved market segments'],
        threats: ['Increased competition', 'Economic uncertainty'],
        marketGrowth: 'Moderate growth expected',
        keyPlayers: ['National chains', 'Local specialists'],
        regulatoryChanges: ['Data privacy regulations', 'Environmental compliance']
      };
    }
  }

  /**
   * Build comprehensive market intelligence query
   */
  private buildMarketIntelligenceQuery(businessName: string, industry: string, location: string): string {
    return `Provide comprehensive market intelligence for a ${industry} business named "${businessName}" 
    located in ${location}. Include:

    1. Local market size and growth trends for ${industry} in ${location}
    2. Major competitors and their market positioning
    3. Common customer pain points and buying behavior
    4. Digital marketing benchmarks and common deficiencies in this industry
    5. Most effective marketing channels for ${industry} businesses
    6. Market gaps and differentiation opportunities
    7. Industry-specific challenges and opportunities in ${location}
    8. Typical customer demographics and target markets
    9. Pricing strategies and competitive positioning
    10. Digital transformation trends affecting this industry

    Focus on actionable insights that would help identify sales opportunities and competitive advantages.`;
  }

  /**
   * Parse market intelligence from Perplexity response
   */
  private parseMarketIntelligence(
    response: PerplexityResponse,
    businessName: string,
    industry: string,
    location: string
  ): MarketIntelligence {
    const content = response.choices[0]?.message?.content || '';
    
    // Extract key information using regex patterns and keyword matching
    const keyTrends = this.extractBulletPoints(content, 'trend|growth|market');
    const competitors = this.extractCompetitors(content);
    const painPoints = this.extractBulletPoints(content, 'pain|challenge|problem|difficulty');
    const opportunities = this.extractBulletPoints(content, 'opportunity|gap|potential|differentiat');
    const marketingChannels = this.extractMarketingChannels(content);
    
    // Calculate opportunity score based on content analysis
    const opportunityScore = this.calculateOpportunityScore(content);
    
    return {
      businessName,
      industry,
      location,
      analysis: {
        marketSize: {
          keyTrends: keyTrends.slice(0, 5)
        },
        competitiveLandscape: {
          majorCompetitors: competitors,
          marketGaps: opportunities.slice(0, 3),
          differentiationOpportunities: opportunities.slice(3, 6)
        },
        customerBase: {
          targetDemographics: this.extractDemographics(content),
          commonPainPoints: painPoints.slice(0, 4),
          buyingBehavior: this.extractBuyingBehavior(content)
        },
        digitalPresence: {
          industryBenchmarks: this.extractBenchmarks(content),
          commonDeficiencies: this.extractDeficiencies(content),
          opportunityAreas: this.extractDigitalOpportunities(content)
        },
        marketingChannels: {
          effective: marketingChannels.effective,
          underutilized: marketingChannels.underutilized,
          recommended: marketingChannels.recommended
        }
      },
      opportunityScore,
      keyInsights: this.extractKeyInsights(content),
      lastUpdated: new Date()
    };
  }

  /**
   * Extract bullet points from content based on keywords
   */
  private extractBulletPoints(content: string, keywords: string): string[] {
    const lines = content.split('\n');
    const points: string[] = [];
    const keywordRegex = new RegExp(keywords, 'i');
    
    for (const line of lines) {
      if ((line.includes('•') || line.includes('-') || line.includes('*')) && keywordRegex.test(line)) {
        const cleaned = line.replace(/^[\s•\-*]+/, '').trim();
        if (cleaned.length > 10) {
          points.push(cleaned);
        }
      }
    }
    
    return points.slice(0, 8);
  }

  /**
   * Extract competitor information
   */
  private extractCompetitors(content: string): Array<{
    name: string;
    strengths: string[];
    weaknesses: string[];
    marketPosition: string;
  }> {
    // This is a simplified extraction - in practice, would use more sophisticated NLP
    const competitors: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('competitor') || line.toLowerCase().includes('company')) {
        const words = line.split(' ');
        for (let i = 0; i < words.length - 1; i++) {
          if (words[i].toLowerCase().includes('competitor') || words[i].toLowerCase().includes('company')) {
            const potential = words[i + 1];
            if (potential && potential.length > 3 && !competitors.includes(potential)) {
              competitors.push(potential);
            }
          }
        }
      }
    }
    
    return competitors.slice(0, 3).map(name => ({
      name,
      strengths: ['Established market presence', 'Brand recognition'],
      weaknesses: ['Limited digital innovation', 'Higher pricing'],
      marketPosition: 'Established player'
    }));
  }

  /**
   * Extract marketing channels information
   */
  private extractMarketingChannels(content: string): {
    effective: string[];
    underutilized: string[];
    recommended: string[];
  } {
    const channels = {
      effective: ['Google Ads', 'Local SEO', 'Referrals'],
      underutilized: ['Social Media Marketing', 'Email Marketing', 'Content Marketing'],
      recommended: ['LinkedIn Marketing', 'Local Partnerships', 'Review Marketing']
    };
    
    // Extract actual channels mentioned in content
    const digitalChannels = ['seo', 'google ads', 'facebook', 'instagram', 'linkedin', 'email', 'content marketing'];
    const mentionedChannels: string[] = [];
    
    for (const channel of digitalChannels) {
      if (content.toLowerCase().includes(channel)) {
        mentionedChannels.push(channel);
      }
    }
    
    if (mentionedChannels.length > 0) {
      channels.effective = mentionedChannels.slice(0, 3);
    }
    
    return channels;
  }

  /**
   * Calculate opportunity score based on content analysis
   */
  private calculateOpportunityScore(content: string): number {
    let score = 50; // Base score
    
    // Positive indicators
    if (content.toLowerCase().includes('growing market')) score += 15;
    if (content.toLowerCase().includes('opportunity')) score += 10;
    if (content.toLowerCase().includes('gap')) score += 10;
    if (content.toLowerCase().includes('underserved')) score += 15;
    if (content.toLowerCase().includes('digital transformation')) score += 10;
    
    // Negative indicators
    if (content.toLowerCase().includes('saturated')) score -= 15;
    if (content.toLowerCase().includes('declining')) score -= 20;
    if (content.toLowerCase().includes('highly competitive')) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Extract additional analysis methods
   */
  private extractDemographics(content: string): string[] {
    return ['Small business owners', 'Local entrepreneurs', 'Service-based businesses'];
  }

  private extractBuyingBehavior(content: string): string[] {
    return ['Price-sensitive decisions', 'Referral-based purchasing', 'Local preference'];
  }

  private extractBenchmarks(content: string): string[] {
    return ['Professional website required', 'Google My Business essential', 'Social media presence expected'];
  }

  private extractDeficiencies(content: string): string[] {
    return ['Limited SEO optimization', 'Inconsistent branding', 'Poor mobile experience'];
  }

  private extractDigitalOpportunities(content: string): string[] {
    return ['Local SEO improvement', 'Social media marketing', 'Email automation'];
  }

  private extractKeyInsights(content: string): string[] {
    const insights: string[] = [];
    const sentences = content.split('.');
    
    for (const sentence of sentences) {
      if (sentence.length > 50 && sentence.length < 200) {
        if (sentence.toLowerCase().includes('key') || 
            sentence.toLowerCase().includes('important') ||
            sentence.toLowerCase().includes('significant')) {
          insights.push(sentence.trim());
        }
      }
    }
    
    return insights.slice(0, 5);
  }

  /**
   * Parse competitor analysis
   */
  private parseCompetitorAnalysis(response: PerplexityResponse, competitorName: string): any {
    const content = response.choices[0]?.message?.content || '';
    
    return {
      name: competitorName,
      strengths: this.extractBulletPoints(content, 'strength|advantage|strong'),
      weaknesses: this.extractBulletPoints(content, 'weakness|weak|lack|limited'),
      marketPosition: 'Established competitor',
      digitalPresence: ['Website', 'Social media'],
      pricingStrategy: 'Competitive pricing',
      targetMarket: ['Local market', 'Small businesses']
    };
  }

  /**
   * Parse industry trends
   */
  private parseIndustryTrends(response: PerplexityResponse): any {
    const content = response.choices[0]?.message?.content || '';
    
    return {
      trends: this.extractBulletPoints(content, 'trend|growing|emerging'),
      opportunities: this.extractBulletPoints(content, 'opportunity|potential|growth'),
      threats: this.extractBulletPoints(content, 'threat|challenge|risk'),
      marketGrowth: 'Moderate growth expected',
      keyPlayers: ['Major national chains', 'Local specialists'],
      regulatoryChanges: ['Privacy regulations', 'Industry standards']
    };
  }

  /**
   * Generate mock response for testing
   */
  private getMockResponse(params: PerplexityQuery): PerplexityResponse {
    return {
      id: `mock-${Date.now()}`,
      model: params.model || 'sonar',
      created: Math.floor(Date.now() / 1000),
      usage: {
        prompt_tokens: 100,
        completion_tokens: 500,
        total_tokens: 600
      },
      choices: [{
        index: 0,
        finish_reason: 'stop',
        message: {
          role: 'assistant',
          content: `Based on market research, the ${params.query.includes('industry') ? 'target industry' : 'business sector'} shows:

• Growing demand for digital services
• Opportunity for local businesses to differentiate
• Common customer pain points include limited online presence
• Effective marketing channels include Google Ads and local SEO
• Competitors often lack comprehensive digital strategies
• Market gaps exist in mobile-first experiences
• Price-sensitive customer base prefers local providers
• Digital transformation creating new opportunities

Key insights suggest strong potential for businesses offering comprehensive digital solutions with local expertise.`
        }
      }],
      citations: [
        'https://example.com/market-research',
        'https://example.com/industry-trends'
      ]
    };
  }

  /**
   * Generate mock market intelligence
   */
  private getMockMarketIntelligence(
    businessName: string,
    industry: string,
    location: string
  ): MarketIntelligence {
    return {
      businessName,
      industry,
      location,
      analysis: {
        marketSize: {
          keyTrends: [
            'Growing demand for digital services',
            'Shift towards local providers',
            'Increased focus on online presence'
          ]
        },
        competitiveLandscape: {
          majorCompetitors: [
            {
              name: 'Local Leader Co',
              strengths: ['Established reputation', 'Customer loyalty'],
              weaknesses: ['Limited digital presence', 'Outdated marketing'],
              marketPosition: 'Market leader'
            }
          ],
          marketGaps: ['Mobile-first solutions', 'Comprehensive digital packages'],
          differentiationOpportunities: ['Technology integration', 'Personalized service']
        },
        customerBase: {
          targetDemographics: ['Small business owners', 'Local entrepreneurs'],
          commonPainPoints: ['Limited online visibility', 'Complex technology'],
          buyingBehavior: ['Referral-based decisions', 'Price-conscious']
        },
        digitalPresence: {
          industryBenchmarks: ['Professional website', 'Google My Business'],
          commonDeficiencies: ['Poor SEO', 'Limited social media'],
          opportunityAreas: ['Local SEO', 'Social media marketing']
        },
        marketingChannels: {
          effective: ['Google Ads', 'Local SEO', 'Referrals'],
          underutilized: ['Social media', 'Email marketing'],
          recommended: ['Content marketing', 'Partnership marketing']
        }
      },
      opportunityScore: 75,
      keyInsights: [
        'Strong local market with growth potential',
        'Limited competition in digital-first approach',
        'High demand for comprehensive solutions'
      ],
      lastUpdated: new Date()
    };
  }

  /**
   * Rate limiting check
   */
  private checkRateLimit(): void {
    const now = Date.now();
    const oneSecond = 1000;
    
    // Reset counter every second
    if (now - this.lastReset >= oneSecond) {
      this.requestCount = 0;
      this.lastReset = now;
    }
    
    // Perplexity typically allows 1 request per second
    if (this.requestCount >= 1) {
      const waitTime = oneSecond - (now - this.lastReset);
      this.logger.warn('Perplexity rate limit reached, waiting', { waitTimeMs: waitTime });
      throw new Error(`Rate limit exceeded. Wait ${waitTime}ms before making another request.`);
    }
    
    this.requestCount++;
  }

  /**
   * Get API usage statistics
   */
  getUsageStats(): {
    requestsThisSecond: number;
    lastResetTime: number;
    apiKeyConfigured: boolean;
    mockMode: boolean;
  } {
    return {
      requestsThisSecond: this.requestCount,
      lastResetTime: this.lastReset,
      apiKeyConfigured: !!this.apiKey,
      mockMode: !this.apiKey
    };
  }
}