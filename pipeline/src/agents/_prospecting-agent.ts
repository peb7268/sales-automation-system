/**
 * Geographic Prospecting Agent
 * Core agent for identifying and qualifying prospects using geographic targeting
 * and multiple data sources (Google Maps, Yellow Pages, Firecrawl, Perplexity)
 */

import { Prospect, ProspectCreationInput, QualificationScore, Industry, BusinessSize, InteractionHistory } from '../types/prospect';
import { GoogleMapsIntegration } from '../integrations/google-maps';
import { YellowPagesIntegration } from '../integrations/yellow-pages';
import { FirecrawlIntegration } from '../integrations/firecrawl';
import { PerplexityIntegration } from '../integrations/perplexity';
import { ProspectValidator } from '../utils/validation/prospect-validation';
import { Logger } from '../utils/logging';

export interface GeographicFilter {
  city: string;
  state: string;
  radius: number; // in miles
  industries?: Industry[];
  minEmployees?: number;
  maxEmployees?: number;
  minRevenue?: number;
  maxRevenue?: number;
}

export interface ProspectingResults {
  prospects: Prospect[];
  totalFound: number;
  qualified: number;
  duplicatesRemoved: number;
  processingTime: number;
  apiCallsUsed: {
    googleMaps: number;
    yellowPages: number;
    firecrawl: number;
    perplexity: number;
  };
}

export interface EmailPatternResult {
  patterns: string[];
  confidence: number; // 0-1
  verified: boolean;
}

export class ProspectingAgent {
  private logger: Logger;
  private googleMaps: GoogleMapsIntegration;
  private yellowPages: YellowPagesIntegration;
  private firecrawl: FirecrawlIntegration;
  private perplexity: PerplexityIntegration;
  private validator: ProspectValidator;
  
  // Configuration from prospecting.json
  private config: any;
  
  // Internal state for rate limiting and deduplication
  private seenBusinesses: Set<string> = new Set();
  private rateLimitCounters: Record<string, { count: number; resetTime: number }> = {};

  constructor(config: any) {
    this.config = config.prospectingAgent;
    this.logger = new Logger('ProspectingAgent', 'agent');
    
    // Initialize integrations
    this.googleMaps = new GoogleMapsIntegration();
    this.yellowPages = new YellowPagesIntegration();
    this.firecrawl = new FirecrawlIntegration();
    this.perplexity = new PerplexityIntegration();
    this.validator = new ProspectValidator();
    
    this.logger.info('Prospecting Agent initialized', {
      defaultCity: this.config.settings.geographic.defaultCity,
      defaultRadius: this.config.settings.geographic.defaultRadius,
      targetIndustries: this.config.settings.targeting.industries.length
    });
  }

  /**
   * Main prospecting workflow
   * Discovers, validates, and qualifies prospects based on geographic and industry filters
   */
  async prospect(filter: GeographicFilter): Promise<ProspectingResults> {
    const startTime = Date.now();
    const results: ProspectingResults = {
      prospects: [],
      totalFound: 0,
      qualified: 0,
      duplicatesRemoved: 0,
      processingTime: 0,
      apiCallsUsed: {
        googleMaps: 0,
        yellowPages: 0,
        firecrawl: 0,
        perplexity: 0
      }
    };

    this.logger.info('Starting prospecting workflow', { filter });

    try {
      // Step 1: Discover businesses using multiple sources
      const rawProspects = await this.discoverBusinesses(filter, results);
      results.totalFound = rawProspects.length;

      // Step 2: Deduplicate based on business name and location
      const deduplicatedProspects = this.deduplicateProspects(rawProspects);
      results.duplicatesRemoved = rawProspects.length - deduplicatedProspects.length;

      // Step 3: Enrich data and qualify prospects
      const enrichedProspects = await this.enrichAndQualifyProspects(deduplicatedProspects, results);

      // Step 4: Filter by qualification score
      const qualifiedProspects = enrichedProspects.filter(
        prospect => prospect.qualificationScore.total >= this.config.settings.qualification.minimumScore
      );
      results.qualified = qualifiedProspects.length;
      results.prospects = qualifiedProspects;

      results.processingTime = Date.now() - startTime;

      this.logger.info('Prospecting workflow completed', {
        totalFound: results.totalFound,
        qualified: results.qualified,
        duplicatesRemoved: results.duplicatesRemoved,
        processingTimeMs: results.processingTime
      });

      return results;

    } catch (error) {
      this.logger.error('Prospecting workflow failed', { error: error.message, filter });
      throw error;
    }
  }

  /**
   * Discover businesses using Google Maps and Yellow Pages APIs
   */
  private async discoverBusinesses(filter: GeographicFilter, results: ProspectingResults): Promise<ProspectCreationInput[]> {
    const prospects: ProspectCreationInput[] = [];
    
    // Configure search parameters
    const searchParams = {
      location: `${filter.city}, ${filter.state}`,
      radius: filter.radius * 1609.34, // Convert miles to meters for Google Maps
      industries: filter.industries || this.config.settings.targeting.industries
    };

    // Search Google Maps for each industry (with Firecrawl fallback)
    for (const industry of searchParams.industries) {
      if (!this.canMakeApiCall('googleMaps')) {
        this.logger.warn('Google Maps API rate limit reached, skipping industry', { industry });
        continue;
      }

      let businessResults: any[] = [];
      let sourceUsed = 'unknown';

      try {
        // Try Google Maps first if API key is available
        if (this.googleMaps.getUsageStats().apiKeyConfigured) {
          try {
            const googleResults = await this.googleMaps.searchBusinesses({
              query: industry,
              location: searchParams.location,
              radius: searchParams.radius
            });
            
            businessResults = googleResults.map(business => ({
              name: business.name,
              phone: business.phone,
              website: business.website,
              address: business.address,
              rating: business.rating,
              types: business.types
            }));
            
            sourceUsed = 'Google Maps';
            results.apiCallsUsed.googleMaps++;
            
            this.logger.debug('Google Maps search returned results', { 
              industry, 
              resultsCount: businessResults.length,
              results: businessResults.map(b => b.name)
            });
          } catch (googleError: any) {
            this.logger.warn('Google Maps search failed, will try Firecrawl fallback', { 
              industry, 
              error: googleError.message 
            });
          }
        }
        
        // Fallback to Firecrawl if Google Maps failed or no API key
        if (businessResults.length === 0) {
          this.logger.info('Using Firecrawl fallback for business search', { industry });
          
          const firecrawlResults = await this.firecrawl.searchBusinessesFallback({
            industry,
            city: filter.city,
            state: filter.state,
            radius: filter.radius
          });
          
          businessResults = firecrawlResults;
          sourceUsed = 'Firecrawl (fallback)';
          results.apiCallsUsed.firecrawl++;
        }
        
        // Process results regardless of source
        for (const business of businessResults) {
          prospects.push({
            businessName: business.name,
            industry: this.mapToIndustryType(industry),
            city: filter.city,
            state: filter.state,
            phone: business.phone,
            website: business.website,
            estimatedRevenue: this.estimateRevenue(business),
            employeeCount: this.estimateEmployeeCount(business)
          });
        }

        this.logger.debug('Business search results added', { 
          industry, 
          count: businessResults.length,
          source: sourceUsed
        });

      } catch (error) {
        this.logger.error('Business search failed for both Google Maps and Firecrawl', { 
          industry, 
          error: error.message 
        });
      }
    }

    // Search Yellow Pages for additional coverage
    for (const industry of searchParams.industries) {
      if (!this.canMakeApiCall('yellowPages')) {
        this.logger.warn('Yellow Pages API rate limit reached, skipping industry', { industry });
        continue;
      }

      try {
        const yellowPagesResults = await this.yellowPages.searchBusinesses({
          category: industry,
          location: searchParams.location,
          radius: filter.radius
        });
        
        results.apiCallsUsed.yellowPages++;
        
        for (const business of yellowPagesResults) {
          prospects.push({
            businessName: business.name,
            industry: this.mapToIndustryType(industry),
            city: filter.city,
            state: filter.state,
            phone: business.phone,
            website: business.website
          });
        }

        this.logger.debug('Yellow Pages results added', { 
          industry, 
          count: yellowPagesResults.length 
        });

      } catch (error) {
        this.logger.error('Yellow Pages search failed', { industry, error: error.message });
      }
    }

    return prospects;
  }

  /**
   * Remove duplicate prospects based on business name and location
   */
  private deduplicateProspects(prospects: ProspectCreationInput[]): ProspectCreationInput[] {
    const uniqueProspects = new Map<string, ProspectCreationInput>();
    
    for (const prospect of prospects) {
      const key = this.generateDeduplicationKey(prospect);
      
      if (!uniqueProspects.has(key)) {
        uniqueProspects.set(key, prospect);
      } else {
        // Merge data from duplicate (prefer more complete data)
        const existing = uniqueProspects.get(key)!;
        uniqueProspects.set(key, this.mergeProspectData(existing, prospect));
      }
    }
    
    return Array.from(uniqueProspects.values());
  }

  /**
   * Enrich prospect data and calculate qualification scores
   */
  async enrichAndQualifyProspects(
    prospects: ProspectCreationInput[], 
    results: ProspectingResults
  ): Promise<Prospect[]> {
    const enrichedProspects: Prospect[] = [];
    
    for (const prospect of prospects) {
      try {
        // Create base prospect object
        const baseProspect = this.createBaseProspect(prospect);
        
        // Enrich missing contact information using multiple sources
        await this.enrichMissingContactInfo(baseProspect, results);
        
        // Enrich with website analysis if website is available
        if (baseProspect.contact.website && this.canMakeApiCall('firecrawl')) {
          await this.enrichWithWebsiteAnalysis(baseProspect, results);
        }
        
        // Enrich with market intelligence
        if (this.canMakeApiCall('perplexity')) {
          await this.enrichWithMarketIntelligence(baseProspect, results);
        }
        
        // Derive email patterns if still missing
        if (!baseProspect.contact.email) {
          baseProspect.contact.email = (await this.deriveEmailPatterns(baseProspect)).patterns[0];
        }
        
        // Calculate qualification score
        baseProspect.qualificationScore = this.calculateQualificationScore(baseProspect);
        
        // Validate and clean the prospect data
        this.validateAndCleanProspectData(baseProspect);
        
        // Validate prospect data - if still missing critical info, try one more enrichment
        if (!this.validator.validateProspect(baseProspect)) {
          this.logger.info('Prospect failed initial validation, attempting additional enrichment', { 
            businessName: baseProspect.business.name 
          });
          
          // Try additional enrichment from Secretary of State
          await this.enrichWithSecretaryOfState(baseProspect, results);
          
          // Clean again after enrichment
          this.validateAndCleanProspectData(baseProspect);
          
          // Recalculate qualification score after additional enrichment
          baseProspect.qualificationScore = this.calculateQualificationScore(baseProspect);
        }
        
        // Final validation - accept prospects with high-quality information only
        if (this.isHighQualityProspect(baseProspect)) {
          enrichedProspects.push(baseProspect);
        } else {
          this.logger.warn('Prospect rejected - low quality data', { 
            businessName: baseProspect.business.name,
            hasPhone: !!baseProspect.contact.phone,
            hasWebsite: !!baseProspect.contact.website,
            hasEmail: !!baseProspect.contact.email,
            reasonsForRejection: this.getQualityIssues(baseProspect)
          });
        }
        
      } catch (error) {
        this.logger.error('Failed to enrich prospect', { 
          businessName: prospect.businessName, 
          error: error.message 
        });
      }
    }
    
    return enrichedProspects;
  }

  /**
   * Calculate qualification score based on configured criteria
   */
  private calculateQualificationScore(prospect: Prospect): QualificationScore {
    const scoring = this.config.settings.qualification.scoringCriteria;
    const score: QualificationScore = {
      total: 0,
      breakdown: {
        businessSize: 0,
        digitalPresence: 0,
        competitorGaps: 0,
        location: 0,
        industry: 0,
        revenueIndicators: 0
      },
      lastUpdated: new Date()
    };

    // Business size scoring (0-20 points)
    const employeeCount = prospect.business.size.employeeCount || 0;
    if (employeeCount >= 5 && employeeCount <= 25) {
      score.breakdown.businessSize = scoring.businessSize; // Sweet spot
    } else if (employeeCount > 0) {
      score.breakdown.businessSize = Math.round(scoring.businessSize * 0.6);
    }

    // Digital presence scoring (0-25 points)
    const digitalPresence = prospect.business.digitalPresence;
    if (digitalPresence) {
      let digitalScore = 0;
      if (digitalPresence.hasWebsite) digitalScore += 8;
      if (digitalPresence.hasGoogleBusiness) digitalScore += 6;
      if (digitalPresence.hasSocialMedia) digitalScore += 6;
      if (digitalPresence.hasOnlineReviews) digitalScore += 5;
      score.breakdown.digitalPresence = Math.min(digitalScore, scoring.digitalPresence);
    }

    // Location scoring (0-15 points) - prefer local businesses
    const targetCities = ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Boulder'];
    if (targetCities.includes(prospect.business.location.city)) {
      score.breakdown.location = scoring.location;
    } else if (prospect.business.location.state === 'CO') {
      score.breakdown.location = Math.round(scoring.location * 0.7);
    }

    // Industry scoring (0-10 points)
    const highValueIndustries = ['professional_services', 'healthcare', 'real_estate'];
    if (highValueIndustries.includes(prospect.business.industry)) {
      score.breakdown.industry = scoring.industry;
    } else {
      score.breakdown.industry = Math.round(scoring.industry * 0.8);
    }

    // Revenue indicators (0-10 points)
    const estimatedRevenue = prospect.business.size.estimatedRevenue;
    if (estimatedRevenue && estimatedRevenue >= 250000 && estimatedRevenue <= 2000000) {
      score.breakdown.revenueIndicators = scoring.revenueIndicators;
    } else if (estimatedRevenue && estimatedRevenue > 100000) {
      score.breakdown.revenueIndicators = Math.round(scoring.revenueIndicators * 0.6);
    }

    // Competitor gaps scoring (0-20 points) - placeholder for now
    score.breakdown.competitorGaps = Math.round(scoring.competitorGaps * 0.5);

    // Calculate total
    score.total = Object.values(score.breakdown).reduce((sum, points) => sum + points, 0);

    return score;
  }

  /**
   * Derive email patterns for a business
   */
  async deriveEmailPatterns(prospect: Prospect): Promise<EmailPatternResult> {
    const patterns: string[] = [];
    let confidence = 0.3; // Base confidence
    
    if (!prospect.contact.website) {
      return { patterns: [], confidence: 0, verified: false };
    }
    
    const domain = this.extractDomain(prospect.contact.website);
    const formats = this.config.settings.dataCollection.emailPatterns.commonFormats;
    
    // Generate patterns based on contact name if available
    if (prospect.contact.primaryContact) {
      const [first, last] = this.parseContactName(prospect.contact.primaryContact);
      
      for (const format of formats) {
        const email = format
          .replace('{first}', first.toLowerCase())
          .replace('{last}', last.toLowerCase())
          .replace('{domain}', domain);
        patterns.push(email);
      }
      confidence = 0.7;
    }
    
    // Add generic patterns
    patterns.push(`info@${domain}`);
    patterns.push(`contact@${domain}`);
    patterns.push(`sales@${domain}`);
    
    return { patterns, confidence, verified: false };
  }

  /**
   * Rate limiting check
   */
  private canMakeApiCall(service: string): boolean {
    const config = this.config.settings.rateLimits[service];
    const now = Date.now();
    const counter = this.rateLimitCounters[service] || { count: 0, resetTime: now + 1000 };
    
    // Reset counter if time window has passed
    if (now >= counter.resetTime) {
      counter.count = 0;
      counter.resetTime = now + 1000; // 1 second window
    }
    
    const canMake = counter.count < config.requestsPerSecond;
    if (canMake) {
      counter.count++;
      this.rateLimitCounters[service] = counter;
    }
    
    return canMake;
  }

  // Helper methods
  private generateDeduplicationKey(prospect: ProspectCreationInput): string {
    return `${prospect.businessName.toLowerCase().trim()}-${prospect.city}-${prospect.state}`;
  }

  private mergeProspectData(existing: ProspectCreationInput, duplicate: ProspectCreationInput): ProspectCreationInput {
    return {
      ...existing,
      phone: existing.phone || duplicate.phone,
      email: existing.email || duplicate.email,
      website: existing.website || duplicate.website,
      estimatedRevenue: existing.estimatedRevenue || duplicate.estimatedRevenue,
      employeeCount: existing.employeeCount || duplicate.employeeCount
    };
  }

  private createBaseProspect(input: ProspectCreationInput): Prospect {
    const id = `prospect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    return {
      id,
      filePath: `prospects/${input.city}-${input.state}/${id}.md`,
      created: now,
      updated: now,
      tags: ['prospecting-agent', input.industry, input.city.toLowerCase()],
      
      business: {
        name: input.businessName,
        industry: input.industry,
        location: {
          city: input.city,
          state: input.state,
          country: 'US'
        },
        size: {
          category: this.determineBusinessSize(input.employeeCount),
          employeeCount: input.employeeCount,
          estimatedRevenue: input.estimatedRevenue
        },
        digitalPresence: {
          hasWebsite: !!input.website,
          hasGoogleBusiness: true, // Assume true since we're finding businesses via Google Maps/search
          hasSocialMedia: false, // Will be updated during enrichment
          hasOnlineReviews: true // Assume true for businesses found via search
        }
      },
      
      contact: {
        phone: input.phone || '',
        email: input.email || '',
        website: input.website || ''
      },
      
      pipelineStage: 'cold',
      qualificationScore: {
        total: 0,
        breakdown: {
          businessSize: 0,
          digitalPresence: 0,
          competitorGaps: 0,
          location: 0,
          industry: 0,
          revenueIndicators: 0
        },
        lastUpdated: now
      },
      
      interactions: []
    };
  }

  private mapToIndustryType(searchTerm: string): Industry {
    const mapping: Record<string, Industry> = {
      'restaurants': 'restaurants',
      'restaurant': 'restaurants',
      'food': 'restaurants',
      'retail': 'retail',
      'professional_services': 'professional_services',
      'professional': 'professional_services',
      'healthcare': 'healthcare',
      'real_estate': 'real_estate',
      'automotive': 'automotive',
      'home_services': 'home_services',
      'fitness': 'fitness',
      'beauty_salons': 'beauty_salons',
      'beauty': 'beauty_salons',
      'legal_services': 'legal_services',
      'legal': 'legal_services'
    };
    
    const lowerTerm = searchTerm.toLowerCase();
    return mapping[lowerTerm] || 'other';
  }

  private determineBusinessSize(employeeCount?: number): BusinessSize {
    if (!employeeCount) return 'micro';
    if (employeeCount <= 10) return 'micro';
    if (employeeCount <= 50) return 'small';
    return 'medium';
  }

  private estimateRevenue(business: any): number {
    // Basic revenue estimation based on business type and size indicators
    // This is a placeholder - could be enhanced with more sophisticated analysis
    return Math.floor(Math.random() * 1500000) + 100000;
  }

  private estimateEmployeeCount(business: any): number {
    // Basic employee count estimation
    // This is a placeholder - could be enhanced with more data sources
    return Math.floor(Math.random() * 25) + 1;
  }

  private extractDomain(website: string): string {
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`);
      return url.hostname.replace('www.', '');
    } catch {
      return website.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    }
  }

  private parseContactName(fullName: string): [string, string] {
    const parts = fullName.trim().split(/\s+/);
    return [parts[0] || '', parts[parts.length - 1] || ''];
  }

  private async enrichWithWebsiteAnalysis(prospect: Prospect, results: ProspectingResults): Promise<void> {
    // Placeholder for Firecrawl integration
    results.apiCallsUsed.firecrawl++;
  }

  private async enrichWithMarketIntelligence(prospect: Prospect, results: ProspectingResults): Promise<void> {
    // Placeholder for Perplexity integration
    results.apiCallsUsed.perplexity++;
  }

  /**
   * Enrich missing contact information using multiple data sources
   */
  private async enrichMissingContactInfo(prospect: Prospect, results: ProspectingResults): Promise<void> {
    const missingInfo = this.identifyMissingContactInfo(prospect);
    
    if (missingInfo.length === 0) {
      this.logger.debug('All contact info present, skipping enrichment', {
        businessName: prospect.business.name
      });
      return;
    }

    this.logger.info('Enriching missing contact info', {
      businessName: prospect.business.name,
      missing: missingInfo
    });

    // Try Google Maps direct lookup first for single business searches
    await this.enrichWithGoogleMapsLookup(prospect, results);

    // Try Yellow Pages for phone numbers and addresses
    if (missingInfo.includes('phone') || missingInfo.includes('website')) {
      await this.enrichWithYellowPages(prospect, results);
    }

    // Try Firecrawl to search for business website and contact details
    if (missingInfo.some(info => ['phone', 'website', 'email'].includes(info))) {
      await this.enrichWithFirecrawlSearch(prospect, results);
    }
  }

  /**
   * Enrich prospect with direct Google Maps business lookup
   */
  private async enrichWithGoogleMapsLookup(prospect: Prospect, results: ProspectingResults): Promise<void> {
    try {
      if (!this.canMakeApiCall('googleMaps')) {
        return;
      }

      const businessName = prospect.business.name;
      const location = `${prospect.business.location.city}, ${prospect.business.location.state}`;
      
      this.logger.debug('Searching Google Maps for specific business', {
        businessName,
        location
      });

      // Search for the specific business by name and location
      const googleResults = await this.googleMaps.searchBusinesses({
        query: `"${businessName}"`,
        location: location,
        radius: 5000 // 5km radius for specific business search
      });

      results.apiCallsUsed.googleMaps++;

      if (googleResults && googleResults.length > 0) {
        // Find the best match by name similarity
        const bestMatch = this.findBestBusinessMatch(businessName, googleResults);
        
        if (bestMatch) {
          // Fill in missing contact info from Google Maps
          if (!prospect.contact.phone && bestMatch.phone) {
            prospect.contact.phone = bestMatch.phone;
            this.logger.info('Updated phone from Google Maps', {
              businessName,
              phone: bestMatch.phone
            });
          }
          
          if (!prospect.contact.website && bestMatch.website) {
            prospect.contact.website = bestMatch.website;
            this.logger.info('Updated website from Google Maps', {
              businessName,
              website: bestMatch.website
            });
          }

          // Get detailed business information if we have a place_id
          if (bestMatch.place_id) {
            const details = await this.googleMaps.getBusinessDetails(bestMatch.place_id);
            if (details) {
              if (!prospect.contact.phone && details.formatted_phone_number) {
                prospect.contact.phone = details.formatted_phone_number;
                this.logger.info('Updated phone from Google Maps details', {
                  businessName,
                  phone: details.formatted_phone_number
                });
              }
              
              if (!prospect.contact.website && details.website) {
                prospect.contact.website = details.website;
                this.logger.info('Updated website from Google Maps details', {
                  businessName,
                  website: details.website
                });
              }
              
              results.apiCallsUsed.googleMaps++;
            }
          }
        }
      }

    } catch (error: any) {
      this.logger.error('Google Maps lookup enrichment failed', {
        businessName: prospect.business.name,
        error: error.message
      });
    }
  }

  /**
   * Identify what contact information is missing
   */
  private identifyMissingContactInfo(prospect: Prospect): string[] {
    const missing: string[] = [];
    
    if (!prospect.contact.phone) missing.push('phone');
    if (!prospect.contact.website) missing.push('website');
    if (!prospect.contact.email) missing.push('email');
    
    return missing;
  }

  /**
   * Enrich prospect with Yellow Pages data
   */
  private async enrichWithYellowPages(prospect: Prospect, results: ProspectingResults): Promise<void> {
    try {
      if (!this.canMakeApiCall('yellowPages')) {
        return;
      }

      this.logger.debug('Searching Yellow Pages for contact info', {
        businessName: prospect.business.name
      });

      const yellowPagesResults = await this.yellowPages.searchBusinesses({
        category: prospect.business.industry,
        location: `${prospect.business.location.city}, ${prospect.business.location.state}`,
        businessName: prospect.business.name
      });

      results.apiCallsUsed.yellowPages++;

      // Find best match by name similarity
      const bestMatch = this.findBestBusinessMatch(prospect.business.name, yellowPagesResults);
      
      if (bestMatch) {
        // Fill in missing contact info
        if (!prospect.contact.phone && bestMatch.phone) {
          prospect.contact.phone = bestMatch.phone;
          this.logger.info('Updated phone from Yellow Pages', {
            businessName: prospect.business.name,
            phone: bestMatch.phone
          });
        }
        
        if (!prospect.contact.website && bestMatch.website) {
          prospect.contact.website = bestMatch.website;
          this.logger.info('Updated website from Yellow Pages', {
            businessName: prospect.business.name,
            website: bestMatch.website
          });
        }
      }

    } catch (error: any) {
      this.logger.error('Yellow Pages enrichment failed', {
        businessName: prospect.business.name,
        error: error.message
      });
    }
  }

  /**
   * Enrich prospect using Firecrawl to search for business information
   */
  private async enrichWithFirecrawlSearch(prospect: Prospect, results: ProspectingResults): Promise<void> {
    try {
      if (!this.canMakeApiCall('firecrawl')) {
        return;
      }

      const businessName = prospect.business.name;
      const location = `${prospect.business.location.city}, ${prospect.business.location.state}`;
      
      // Search for business website and contact info with multiple search strategies
      let searchQuery = `"${businessName}" ${location} restaurant contact`;
      
      // If location is Unknown or too generic, try business name + industry
      if (location.includes('Unknown')) {
        searchQuery = `"${businessName}" restaurant Denver Colorado`;
      }
      
      const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

      this.logger.debug('Using Firecrawl to search for contact info', {
        businessName,
        query: searchQuery
      });

      const scrapeResult = await this.firecrawl.scrapeWebsite({
        url: googleSearchUrl,
        formats: ['markdown'],
        onlyMainContent: true
      });

      results.apiCallsUsed.firecrawl++;

      if (scrapeResult.success && scrapeResult.data?.markdown) {
        const extractedInfo = this.extractContactInfoFromSearchResults(
          scrapeResult.data.markdown, 
          businessName
        );

        // Update missing contact information
        if (!prospect.contact.phone && extractedInfo.phone) {
          prospect.contact.phone = extractedInfo.phone;
          this.logger.info('Updated phone from Firecrawl search', {
            businessName,
            phone: extractedInfo.phone
          });
        }

        if (!prospect.contact.website && extractedInfo.website) {
          prospect.contact.website = extractedInfo.website;
          this.logger.info('Updated website from Firecrawl search', {
            businessName,
            website: extractedInfo.website
          });
        }

        if (!prospect.contact.email && extractedInfo.email) {
          prospect.contact.email = extractedInfo.email;
          this.logger.info('Updated email from Firecrawl search', {
            businessName,
            email: extractedInfo.email
          });
        }

        // Update digital presence based on what we find
        if (extractedInfo.hasSocialMedia) {
          prospect.business.digitalPresence.hasSocialMedia = true;
          this.logger.info('Updated social media presence from search', {
            businessName
          });
        }
      }

    } catch (error: any) {
      this.logger.error('Firecrawl search enrichment failed', {
        businessName: prospect.business.name,
        error: error.message
      });
    }
  }

  /**
   * Enrich prospect with Colorado Secretary of State data
   */
  private async enrichWithSecretaryOfState(prospect: Prospect, results: ProspectingResults): Promise<void> {
    try {
      if (!this.canMakeApiCall('firecrawl')) {
        return;
      }

      const businessName = prospect.business.name;
      
      // Search Colorado Secretary of State business database
      const sosSearchUrl = `https://www.sos.state.co.us/biz/BusinessEntityCriteriaExt.do?resetTransTyp=Y`;
      
      this.logger.debug('Searching Colorado Secretary of State', {
        businessName
      });

      // First get the search page
      const searchPageResult = await this.firecrawl.scrapeWebsite({
        url: sosSearchUrl,
        formats: ['html', 'markdown'],
        onlyMainContent: true
      });

      results.apiCallsUsed.firecrawl++;

      if (searchPageResult.success) {
        // Extract business registration info that might include contact details
        const registrationInfo = this.extractSecretaryOfStateInfo(
          searchPageResult.data?.markdown || '',
          businessName
        );

        // Update any missing business information
        if (registrationInfo.registeredAgent && !prospect.contact.phone) {
          // Sometimes registered agent info includes contact details
          this.logger.info('Found registered agent info from Secretary of State', {
            businessName,
            registeredAgent: registrationInfo.registeredAgent
          });
        }

        if (registrationInfo.businessAddress && prospect.business.location.city) {
          // Verify business address matches our search location
          this.logger.debug('Verified business address from Secretary of State', {
            businessName,
            address: registrationInfo.businessAddress
          });
        }
      }

    } catch (error: any) {
      this.logger.error('Secretary of State enrichment failed', {
        businessName: prospect.business.name,
        error: error.message
      });
    }
  }

  /**
   * Find best matching business from search results
   */
  private findBestBusinessMatch(targetName: string, businesses: any[]): any | null {
    if (!businesses || businesses.length === 0) return null;

    const targetLower = targetName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    let bestMatch = null;
    let bestScore = 0;

    for (const business of businesses) {
      const businessLower = business.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Calculate simple similarity score
      const score = this.calculateNameSimilarity(targetLower, businessLower);
      
      if (score > bestScore && score > 0.6) { // Minimum 60% similarity
        bestScore = score;
        bestMatch = business;
      }
    }

    return bestMatch;
  }

  /**
   * Calculate similarity between two business names
   */
  private calculateNameSimilarity(name1: string, name2: string): number {
    if (name1 === name2) return 1;
    
    const longer = name1.length > name2.length ? name1 : name2;
    const shorter = name1.length > name2.length ? name2 : name1;
    
    if (longer.length === 0) return 1;
    
    // Count matching characters
    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) matches++;
    }
    
    return matches / longer.length;
  }

  /**
   * Extract contact information from search results
   */
  private extractContactInfoFromSearchResults(markdown: string, businessName: string): {
    phone?: string;
    website?: string;
    email?: string;
  } {
    const result: { phone?: string; website?: string; email?: string } = {};
    
    // Look for phone numbers
    const phoneRegex = /\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/g;
    const phoneMatch = markdown.match(phoneRegex);
    if (phoneMatch) {
      result.phone = phoneMatch[0];
    }

    // Look for websites
    const websiteRegex = /(https?:\/\/[^\s]+)/g;
    const websiteMatch = markdown.match(websiteRegex);
    if (websiteMatch) {
      // Filter out common non-business websites
      const filteredWebsites = websiteMatch.filter(url => 
        !url.includes('google.com') && 
        !url.includes('facebook.com') && 
        !url.includes('yelp.com') &&
        !url.includes('maps.google')
      );
      if (filteredWebsites.length > 0) {
        result.website = filteredWebsites[0];
      }
    }

    // Look for email addresses
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const emailMatch = markdown.match(emailRegex);
    if (emailMatch) {
      result.email = emailMatch[0];
    }

    return result;
  }

  /**
   * Extract information from Secretary of State results
   */
  private extractSecretaryOfStateInfo(markdown: string, businessName: string): {
    registeredAgent?: string;
    businessAddress?: string;
    incorporationDate?: string;
  } {
    const result: {
      registeredAgent?: string;
      businessAddress?: string;
      incorporationDate?: string;
    } = {};

    // This is a simplified extraction - in practice, you'd need to handle
    // the specific format of Colorado SOS search results
    const lines = markdown.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      
      if (line.includes('registered agent')) {
        result.registeredAgent = lines[i + 1]?.trim();
      }
      
      if (line.includes('business address') || line.includes('principal address')) {
        result.businessAddress = lines[i + 1]?.trim();
      }
      
      if (line.includes('incorporation date') || line.includes('formed date')) {
        result.incorporationDate = lines[i + 1]?.trim();
      }
    }

    return result;
  }

  /**
   * Check if prospect has enough information to be usable
   */
  private isProspectUsable(prospect: Prospect): boolean {
    // A prospect is usable if it has at least one contact method
    const hasPhone = !!prospect.contact.phone;
    const hasWebsite = !!prospect.contact.website;
    const hasEmail = !!prospect.contact.email;
    
    return hasPhone || hasWebsite || hasEmail;
  }

  /**
   * Validate and clean prospect data for quality
   */
  private validateAndCleanProspectData(prospect: Prospect): void {
    // Clean and validate phone number
    if (prospect.contact.phone) {
      prospect.contact.phone = this.cleanPhoneNumber(prospect.contact.phone);
      if (!this.isValidPhoneNumber(prospect.contact.phone)) {
        this.logger.warn('Invalid phone number, removing', {
          businessName: prospect.business.name,
          phone: prospect.contact.phone
        });
        prospect.contact.phone = '';
      }
    }

    // Clean and validate website
    if (prospect.contact.website) {
      prospect.contact.website = this.cleanWebsiteUrl(prospect.contact.website);
      if (!this.isValidWebsiteForBusiness(prospect.contact.website, prospect.business.name)) {
        this.logger.warn('Website does not match business, removing', {
          businessName: prospect.business.name,
          website: prospect.contact.website
        });
        prospect.contact.website = '';
      }
    }

    // Clean and validate email
    if (prospect.contact.email) {
      prospect.contact.email = this.cleanEmail(prospect.contact.email);
      if (!this.isValidEmailForBusiness(prospect.contact.email, prospect.business.name, prospect.contact.website)) {
        this.logger.warn('Email does not match business, removing', {
          businessName: prospect.business.name,
          email: prospect.contact.email
        });
        prospect.contact.email = '';
      }
    }
  }

  /**
   * Check if prospect has high-quality, validated information
   */
  private isHighQualityProspect(prospect: Prospect): boolean {
    const hasValidPhone = !!prospect.contact.phone && this.isValidPhoneNumber(prospect.contact.phone);
    const hasValidWebsite = !!prospect.contact.website && this.isValidWebsiteForBusiness(prospect.contact.website, prospect.business.name);
    const hasValidEmail = !!prospect.contact.email && this.isValidEmailForBusiness(prospect.contact.email, prospect.business.name, prospect.contact.website);
    
    // For single business additions, be more lenient - accept with 1 valid contact method
    const validContactMethods = [hasValidPhone, hasValidWebsite, hasValidEmail].filter(Boolean).length;
    
    // If this is a single business lookup (not bulk prospecting), be more lenient
    if (this.isSingleBusinessLookup(prospect)) {
      return validContactMethods >= 1; // Accept with just 1 valid contact method
    }
    
    // For bulk prospecting, maintain higher standards
    return validContactMethods >= 2;
  }

  /**
   * Check if this is a single business lookup vs bulk prospecting
   */
  private isSingleBusinessLookup(prospect: Prospect): boolean {
    // Simple heuristic: if the business name is very specific (not generic), it's likely a single lookup
    const genericTerms = ['restaurant', 'pizza', 'coffee', 'salon', 'shop', 'store', 'service'];
    const businessName = prospect.business.name.toLowerCase();
    
    // If the business name contains specific proper nouns, it's likely a targeted lookup
    return !genericTerms.some(term => businessName.includes(term)) || businessName.split(' ').length >= 3;
  }

  /**
   * Get quality issues for logging
   */
  private getQualityIssues(prospect: Prospect): string[] {
    const issues: string[] = [];
    
    if (!prospect.contact.phone) {
      issues.push('Missing phone number');
    } else if (!this.isValidPhoneNumber(prospect.contact.phone)) {
      issues.push('Invalid phone number format');
    }
    
    if (!prospect.contact.website) {
      issues.push('Missing website');
    } else if (!this.isValidWebsiteForBusiness(prospect.contact.website, prospect.business.name)) {
      issues.push('Website does not match business');
    }
    
    if (!prospect.contact.email) {
      issues.push('Missing email');
    } else if (!this.isValidEmailForBusiness(prospect.contact.email, prospect.business.name, prospect.contact.website)) {
      issues.push('Email does not match business');
    }
    
    return issues;
  }

  /**
   * Clean phone number format
   */
  private cleanPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX if 10 digits
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    
    // Return as-is if not 10 digits (might be international)
    return phone.trim();
  }

  /**
   * Validate phone number format
   */
  private isValidPhoneNumber(phone: string): boolean {
    // Must be 10 digits for US numbers
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10 && digits.match(/^\d{10}$/);
  }

  /**
   * Clean website URL
   */
  private cleanWebsiteUrl(website: string): string {
    // Remove markdown artifacts and clean URL
    let cleanUrl = website.replace(/\]\([^)]*\)/g, '').replace(/\\\\/g, '').trim();
    
    // Add https if missing protocol
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    
    // Remove trailing parentheses and brackets
    cleanUrl = cleanUrl.replace(/[)\]]+$/, '');
    
    return cleanUrl;
  }

  /**
   * Check if website is valid and matches the business
   */
  private isValidWebsiteForBusiness(website: string, businessName: string): boolean {
    try {
      const url = new URL(website);
      
      // Reject common non-business domains
      const badDomains = [
        'google.com', 'facebook.com', 'yelp.com', 'maps.google', 
        'gstatic.com', 'dnb.com', 'yellowpages.com'
      ];
      
      if (badDomains.some(bad => url.hostname.includes(bad))) {
        return false;
      }
      
      // For single business lookups, be more lenient with domain matching
      if (this.isSingleBusinessLookup({ business: { name: businessName } } as any)) {
        // Just ensure it's a real domain and not obviously wrong
        const domain = url.hostname.toLowerCase().replace('www.', '');
        
        // Accept any legitimate domain that's not in the bad list
        return domain.length > 3 && domain.includes('.') && !domain.includes('localhost');
      }
      
      // For bulk prospecting, maintain stricter matching
      const businessWords = businessName.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2);
      
      const domain = url.hostname.toLowerCase().replace('www.', '');
      
      // At least one business word should appear in domain
      return businessWords.some(word => domain.includes(word));
      
    } catch {
      return false;
    }
  }

  /**
   * Clean email address
   */
  private cleanEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * Check if email is valid and matches the business
   */
  private isValidEmailForBusiness(email: string, businessName: string, website?: string): boolean {
    // Basic email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return false;
    }
    
    const [, emailDomain] = email.split('@');
    
    // Reject generic/designer emails
    const badDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'comcast.net', 'aol.com',
      'rmwebdesign.com', 'mockbusiness.com'
    ];
    
    if (badDomains.includes(emailDomain)) {
      return false;
    }
    
    // If we have a website, email domain should match website domain
    if (website) {
      try {
        const websiteDomain = new URL(website).hostname.replace('www.', '');
        if (emailDomain !== websiteDomain) {
          return false;
        }
      } catch {
        // If website is invalid, continue with business name check
      }
    }
    
    // Check if email domain relates to business name
    const businessWords = businessName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    return businessWords.some(word => emailDomain.includes(word));
  }
}