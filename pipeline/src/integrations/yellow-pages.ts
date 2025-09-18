/**
 * Yellow Pages API Integration
 * Handles business discovery using Yellow Pages/YP.com business directory API
 * Note: This is a mock implementation as Yellow Pages API access varies
 */

import { Logger } from '../utils/logging';

export interface YellowPagesSearchParams {
  category: string;
  location: string;
  radius?: number; // in miles
  businessName?: string; // for targeted searches
  sort?: 'distance' | 'name' | 'rating';
  limit?: number;
}

export interface YellowPagesBusiness {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    fullAddress: string;
  };
  phone?: string | undefined;
  website?: string | undefined;
  email?: string | undefined;
  categories: string[];
  rating?: {
    average: number;
    count: number;
  } | undefined;
  businessHours?: {
    [day: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  description?: string;
  yearEstablished?: number;
  employeeCount?: string;
  annualRevenue?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export interface YellowPagesResponse {
  businesses: YellowPagesBusiness[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
  searchParams: YellowPagesSearchParams;
}

export class YellowPagesIntegration {
  private logger: Logger;
  private apiKey: string;
  private baseUrl: string = 'https://api.yellowpages.com';
  private requestCount: number = 0;
  private lastReset: number = Date.now();

  constructor() {
    this.logger = new Logger('YellowPagesIntegration', 'integration');
    this.apiKey = process.env.YELLOW_PAGES_API_KEY || '';
    
    if (!this.apiKey) {
      this.logger.warn('Yellow Pages API key not found, using mock data mode');
    }
    
    this.logger.info('Yellow Pages Integration initialized', {
      mockMode: !this.apiKey
    });
  }

  /**
   * Search for businesses using Yellow Pages directory
   */
  async searchBusinesses(params: YellowPagesSearchParams): Promise<YellowPagesBusiness[]> {
    try {
      this.checkRateLimit();
      
      if (!this.apiKey) {
        return this.getMockBusinesses(params);
      }

      const searchUrl = `${this.baseUrl}/search`;
      const queryParams = new URLSearchParams({
        api_key: this.apiKey,
        term: params.category,
        location: params.location,
        sort_by: params.sort || 'distance',
        limit: (params.limit || 20).toString(),
        radius: params.radius.toString()
      });

      this.logger.debug('Making Yellow Pages API request', {
        url: `${searchUrl}?${queryParams.toString()}`,
        category: params.category,
        location: params.location,
        radius: params.radius
      });

      const response = await fetch(`${searchUrl}?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MHM-Sales-Automation/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Yellow Pages API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
      
      if (!data.businesses) {
        this.logger.warn('No businesses found in Yellow Pages response', { params });
        return [];
      }

      const businesses: YellowPagesBusiness[] = this.normalizeBusinessData(data.businesses);
      
      this.logger.info('Yellow Pages search completed', {
        category: params.category,
        location: params.location,
        resultsCount: businesses.length
      });

      return businesses.filter(this.isValidBusiness);

    } catch (error) {
      this.logger.error('Yellow Pages search failed', {
        error: error.message,
        params
      });
      
      // Fallback to mock data on API failure
      this.logger.info('Falling back to mock data due to API failure');
      return this.getMockBusinesses(params);
    }
  }

  /**
   * Get detailed information about a specific business
   */
  async getBusinessDetails(businessId: string): Promise<YellowPagesBusiness | null> {
    try {
      this.checkRateLimit();
      
      if (!this.apiKey) {
        return this.getMockBusinessDetails(businessId);
      }

      const detailsUrl = `${this.baseUrl}/details/${businessId}`;
      const queryParams = new URLSearchParams({
        api_key: this.apiKey
      });

      this.logger.debug('Fetching Yellow Pages business details', { businessId });

      const response = await fetch(`${detailsUrl}?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MHM-Sales-Automation/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Yellow Pages API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
      
      this.logger.debug('Yellow Pages business details retrieved', {
        businessId,
        businessName: data.name
      });

      return this.normalizeBusinessData([data])[0] || null;

    } catch (error: any) {
      this.logger.error('Failed to get Yellow Pages business details', {
        error: error.message,
        businessId
      });
      return this.getMockBusinessDetails(businessId);
    }
  }

  /**
   * Extract standardized business information
   */
  extractBusinessInfo(business: YellowPagesBusiness): {
    name: string;
    phone?: string | undefined;
    website?: string | undefined;
    email?: string | undefined;
    address: string;
    categories: string[];
    rating?: number | undefined;
    employeeCount?: string | undefined;
    revenue?: string | undefined;
  } {
    return {
      name: business.name,
      phone: business.phone,
      website: business.website,
      email: business.email,
      address: business.address.fullAddress,
      categories: business.categories,
      rating: business.rating?.average,
      employeeCount: business.employeeCount,
      revenue: business.annualRevenue
    };
  }

  /**
   * Generate mock business data for testing/demo purposes
   */
  private getMockBusinesses(params: YellowPagesSearchParams): YellowPagesBusiness[] {
    const mockBusinesses: Partial<YellowPagesBusiness>[] = [
      {
        name: 'Denver Digital Marketing',
        address: {
          street: '1234 17th Street',
          city: 'Denver',
          state: 'CO',
          zipCode: '80202',
          fullAddress: '1234 17th Street, Denver, CO 80202'
        },
        phone: '(303) 555-0101',
        website: 'https://denverdigitalmarketing.com',
        categories: ['marketing', 'advertising', 'digital_services'],
        rating: { average: 4.2, count: 18 },
        employeeCount: '5-10',
        annualRevenue: '$250K-$500K'
      },
      {
        name: 'Rocky Mountain Web Design',
        address: {
          street: '5678 Broadway',
          city: 'Denver',
          state: 'CO',
          zipCode: '80203',
          fullAddress: '5678 Broadway, Denver, CO 80203'
        },
        phone: '(303) 555-0102',
        website: 'https://rmwebdesign.com',
        categories: ['web_design', 'development', 'professional_services'],
        rating: { average: 4.5, count: 32 },
        employeeCount: '10-25',
        annualRevenue: '$500K-$1M'
      },
      {
        name: 'Mile High Consulting',
        address: {
          street: '9012 Cherry Creek Drive',
          city: 'Denver',
          state: 'CO',
          zipCode: '80209',
          fullAddress: '9012 Cherry Creek Drive, Denver, CO 80209'
        },
        phone: '(303) 555-0103',
        categories: ['consulting', 'business_services', 'professional_services'],
        rating: { average: 4.0, count: 15 },
        employeeCount: '1-5',
        annualRevenue: '$100K-$250K'
      }
    ];

    // Filter mock data based on search category
    const filtered = mockBusinesses.filter(business => 
      business.categories?.some(cat => 
        cat.toLowerCase().includes(params.category.toLowerCase()) ||
        params.category.toLowerCase().includes(cat.toLowerCase())
      )
    );

    return filtered.map((business, index) => ({
      id: `mock-${params.category}-${index}`,
      name: business.name!,
      address: business.address!,
      phone: business.phone,
      website: business.website,
      email: this.generateMockEmail(business.name!, business.website || undefined),
      categories: business.categories!,
      rating: business.rating,
      employeeCount: business.employeeCount,
      annualRevenue: business.annualRevenue,
      description: `A ${params.category} business located in ${params.location}`,
      yearEstablished: 2015 + Math.floor(Math.random() * 8)
    }));
  }

  /**
   * Generate mock business details
   */
  private getMockBusinessDetails(businessId: string): YellowPagesBusiness {
    return {
      id: businessId,
      name: 'Mock Business Details',
      address: {
        street: '1234 Mock Street',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
        fullAddress: '1234 Mock Street, Denver, CO 80202'
      },
      phone: '(303) 555-9999',
      website: 'https://mockbusiness.com',
      email: 'info@mockbusiness.com',
      categories: ['professional_services'],
      rating: { average: 4.0, count: 10 },
      employeeCount: '5-10',
      annualRevenue: '$250K-$500K',
      description: 'Mock business for testing purposes',
      yearEstablished: 2018
    };
  }

  /**
   * Normalize business data from Yellow Pages API response
   */
  private normalizeBusinessData(businesses: any[]): YellowPagesBusiness[] {
    return businesses.map(business => ({
      id: business.id || business.listingId || `yp-${Date.now()}-${Math.random()}`,
      name: business.name || business.businessName,
      address: {
        street: business.address?.street || business.streetAddress || '',
        city: business.address?.city || business.city || '',
        state: business.address?.state || business.state || '',
        zipCode: business.address?.zipCode || business.zip || '',
        fullAddress: business.address?.fullAddress || business.fullAddress || 
          `${business.streetAddress || ''}, ${business.city || ''}, ${business.state || ''} ${business.zip || ''}`.trim()
      },
      phone: business.phone || business.phoneNumber,
      website: business.website || business.websiteUrl,
      email: business.email || this.deriveEmailFromWebsite(business.website),
      categories: business.categories || business.businessCategories || [business.category].filter(Boolean),
      rating: business.rating ? {
        average: business.rating.average || business.averageRating,
        count: business.rating.count || business.reviewCount
      } : undefined,
      businessHours: business.businessHours || business.hours,
      description: business.description || business.businessDescription,
      yearEstablished: business.yearEstablished || business.founded,
      employeeCount: business.employeeCount || business.employees,
      annualRevenue: business.annualRevenue || business.revenue,
      socialMedia: business.socialMedia || {
        facebook: business.facebookUrl,
        twitter: business.twitterUrl,
        linkedin: business.linkedinUrl,
        instagram: business.instagramUrl
      }
    }));
  }

  /**
   * Check if a business result is valid
   */
  private isValidBusiness(business: YellowPagesBusiness): boolean {
    // Must have a name
    if (!business.name || business.name.length < 2) {
      return false;
    }

    // Must have an address
    if (!business.address.city || !business.address.state) {
      return false;
    }

    // Filter out obvious non-businesses
    const excludeNames = [
      'government',
      'city hall',
      'post office',
      'dmv',
      'library',
      'school district',
      'fire department',
      'police department'
    ];

    const lowerName = business.name.toLowerCase();
    if (excludeNames.some(exclude => lowerName.includes(exclude))) {
      return false;
    }

    return true;
  }

  /**
   * Generate mock email from business name and website
   */
  private generateMockEmail(name: string, website?: string): string {
    if (website) {
      const domain = this.extractDomain(website);
      return `info@${domain}`;
    }
    
    const cleanName = name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '')
      .substring(0, 15);
    
    return `info@${cleanName}.com`;
  }

  /**
   * Derive email from website domain
   */
  private deriveEmailFromWebsite(website?: string): string | undefined {
    if (!website) return undefined;
    
    const domain = this.extractDomain(website);
    return `info@${domain}`;
  }

  /**
   * Extract domain from website URL
   */
  private extractDomain(website: string): string {
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`);
      return url.hostname.replace('www.', '');
    } catch {
      return website.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    }
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
    
    // Yellow Pages typically allows 5 requests per second
    if (this.requestCount >= 5) {
      const waitTime = oneSecond - (now - this.lastReset);
      this.logger.warn('Yellow Pages rate limit reached, waiting', { waitTimeMs: waitTime });
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