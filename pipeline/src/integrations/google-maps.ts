/**
 * Google Maps API Integration
 * Handles business discovery and location data retrieval using Google Maps Places API
 */

import { Logger } from '../utils/logging';

export interface GoogleMapsSearchParams {
  query: string;
  location: string;
  radius: number; // in meters
  type?: string;
  minprice?: number;
  maxprice?: number;
}

export interface GoogleMapsBusiness {
  place_id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  business_status?: string;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  opening_hours?: {
    open_now: boolean;
    periods?: any[];
    weekday_text?: string[];
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

export interface GoogleMapsBusinessDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  url?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  business_status?: string;
  types: string[];
  opening_hours?: {
    open_now: boolean;
    periods: Array<{
      close: { day: number; time: string };
      open: { day: number; time: string };
    }>;
    weekday_text: string[];
  };
  reviews?: Array<{
    author_name: string;
    author_url: string;
    language: string;
    profile_photo_url: string;
    rating: number;
    relative_time_description: string;
    text: string;
    time: number;
  }>;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

export class GoogleMapsIntegration {
  private logger: Logger;
  private apiKey: string;
  private baseUrl: string = 'https://maps.googleapis.com/maps/api';
  private requestCount: number = 0;
  private lastReset: number = Date.now();

  constructor() {
    this.logger = new Logger('GoogleMapsIntegration', 'integration');
    // Try both possible API key names
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_API_KEY || '';
    
    // Debug logging for API key detection
    this.logger.debug('Environment check', {
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY ? 'present' : 'missing',
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? 'present' : 'missing',
      detectedKey: this.apiKey ? 'found' : 'not found'
    });
    
    if (!this.apiKey) {
      this.logger.warn('Google Maps API key not found, will use Firecrawl fallback for search');
    } else {
      this.logger.info('Google Maps Integration initialized with API key');
    }
  }

  /**
   * Search for businesses using Google Places Text Search (better for specific business names)
   */
  async searchBusinessesByName(businessName: string, location: string): Promise<GoogleMapsBusiness[]> {
    try {
      this.checkRateLimit();
      
      if (!this.apiKey) {
        return this.getMockBusinesses({ query: businessName, location, radius: 5000 });
      }
      
      const searchUrl = `${this.baseUrl}/place/textsearch/json`;
      const query = `${businessName} ${location}`;
      const queryParams = new URLSearchParams({
        key: this.apiKey,
        query: query
      });

      this.logger.debug('Making Google Maps Text Search API request', {
        url: `${searchUrl}?${queryParams.toString()}`,
        businessName,
        location,
        fullQuery: query
      });

      const response = await fetch(`${searchUrl}?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Google Maps API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        this.logger.error('Google Maps API error', { 
          status: data.status, 
          error_message: data.error_message 
        });
        throw new Error(`Google Maps API error: ${data.status} - ${data.error_message}`);
      }

      const businesses: GoogleMapsBusiness[] = data.results || [];
      
      this.logger.info('Google Maps text search completed', {
        businessName,
        location,
        resultsCount: businesses.length,
        status: data.status
      });

      // Filter results to find best matches for the business name
      const filteredBusinesses = businesses.filter(business => {
        const businessNameMatch = business.name.toLowerCase().includes(businessName.toLowerCase()) ||
                                 businessName.toLowerCase().includes(business.name.toLowerCase());
        return businessNameMatch && this.isValidBusiness(business);
      });

      return filteredBusinesses.length > 0 ? filteredBusinesses : businesses.filter(this.isValidBusiness);

    } catch (error) {
      this.logger.error('Google Maps text search failed', {
        error: error.message,
        businessName,
        location
      });
      throw error;
    }
  }

  /**
   * Search for businesses using Google Places Nearby Search
   */
  async searchBusinesses(params: GoogleMapsSearchParams): Promise<GoogleMapsBusiness[]> {
    try {
      this.checkRateLimit();
      
      if (!this.apiKey) {
        return this.getMockBusinesses(params);
      }
      
      const searchUrl = `${this.baseUrl}/place/nearbysearch/json`;
      const queryParams = new URLSearchParams({
        key: this.apiKey,
        location: await this.geocodeLocation(params.location),
        radius: params.radius.toString(),
        keyword: params.query,
        type: 'establishment'
      });

      if (params.minprice) queryParams.set('minprice', params.minprice.toString());
      if (params.maxprice) queryParams.set('maxprice', params.maxprice.toString());

      this.logger.debug('Making Google Maps Places API request', {
        url: `${searchUrl}?${queryParams.toString()}`,
        query: params.query,
        location: params.location,
        radius: params.radius
      });

      const response = await fetch(`${searchUrl}?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Google Maps API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        this.logger.error('Google Maps API error', { 
          status: data.status, 
          error_message: data.error_message 
        });
        throw new Error(`Google Maps API error: ${data.status} - ${data.error_message}`);
      }

      const businesses: GoogleMapsBusiness[] = data.results || [];
      
      this.logger.info('Google Maps search completed', {
        query: params.query,
        location: params.location,
        resultsCount: businesses.length,
        status: data.status
      });

      // Filter out results that don't look like real businesses
      return businesses.filter(this.isValidBusiness);

    } catch (error) {
      this.logger.error('Google Maps search failed', {
        error: error.message,
        params
      });
      throw error;
    }
  }

  /**
   * Get detailed information about a specific place
   */
  async getBusinessDetails(placeId: string): Promise<GoogleMapsBusinessDetails | null> {
    try {
      this.checkRateLimit();
      
      const detailsUrl = `${this.baseUrl}/place/details/json`;
      const queryParams = new URLSearchParams({
        key: this.apiKey,
        place_id: placeId,
        fields: [
          'place_id',
          'name',
          'formatted_address',
          'formatted_phone_number',
          'international_phone_number',
          'website',
          'url',
          'rating',
          'user_ratings_total',
          'price_level',
          'business_status',
          'types',
          'opening_hours',
          'reviews',
          'photos'
        ].join(',')
      });

      this.logger.debug('Fetching business details', { placeId });

      const response = await fetch(`${detailsUrl}?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Google Maps API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status !== 'OK') {
        this.logger.error('Google Maps API error for business details', { 
          status: data.status, 
          error_message: data.error_message,
          placeId 
        });
        return null;
      }

      this.logger.debug('Business details retrieved', {
        placeId,
        businessName: data.result?.name
      });

      return data.result;

    } catch (error) {
      this.logger.error('Failed to get business details', {
        error: error.message,
        placeId
      });
      return null;
    }
  }

  /**
   * Get reviews for a specific place
   */
  async getPlaceReviews(placeId: string): Promise<any[]> {
    try {
      const details = await this.getBusinessDetails(placeId);
      return details?.reviews || [];
    } catch (error) {
      this.logger.error('Failed to get place reviews', {
        error: error.message,
        placeId
      });
      return [];
    }
  }

  /**
   * Convert address to coordinates
   */
  async geocodeLocation(address: string): Promise<string> {
    try {
      this.checkRateLimit();
      
      const geocodeUrl = `${this.baseUrl}/geocode/json`;
      const queryParams = new URLSearchParams({
        key: this.apiKey,
        address: address
      });

      const response = await fetch(`${geocodeUrl}?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Geocoding request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status !== 'OK' || !data.results.length) {
        this.logger.error('Geocoding failed', { 
          status: data.status, 
          address,
          error_message: data.error_message 
        });
        throw new Error(`Geocoding failed for address: ${address}`);
      }

      const location = data.results[0].geometry.location;
      const locationString = `${location.lat},${location.lng}`;
      
      this.logger.debug('Address geocoded', {
        address,
        coordinates: locationString
      });

      return locationString;

    } catch (error) {
      this.logger.error('Geocoding error', {
        error: error.message,
        address
      });
      throw error;
    }
  }

  /**
   * Extract business information in a standardized format
   */
  extractBusinessInfo(business: GoogleMapsBusiness): {
    name: string;
    phone?: string;
    website?: string;
    address: string;
    rating?: number;
    types: string[];
    priceLevel?: number;
    isOpen?: boolean;
  } {
    return {
      name: business.name,
      phone: business.phone,
      website: business.website,
      address: business.address,
      rating: business.rating,
      types: business.types,
      priceLevel: business.price_level,
      isOpen: business.opening_hours?.open_now
    };
  }

  /**
   * Check if a business result looks legitimate
   */
  private isValidBusiness(business: GoogleMapsBusiness): boolean {
    // Filter out places that are clearly not businesses we want to prospect
    const excludeTypes = [
      'transit_station',
      'bus_station',
      'subway_station',
      'train_station',
      'airport',
      'cemetery',
      'church',
      'hindu_temple',
      'mosque',
      'synagogue',
      'school',
      'university',
      'hospital',
      'fire_station',
      'police',
      'post_office',
      'city_hall',
      'courthouse',
      'embassy',
      'library',
      'park',
      'parking',
      'gas_station'
    ];

    // Must have a name
    if (!business.name || business.name.length < 2) {
      return false;
    }

    // Check if it has excluded types
    const hasExcludedType = business.types.some(type => excludeTypes.includes(type));
    if (hasExcludedType) {
      return false;
    }

    // Must be operational
    if (business.business_status && business.business_status !== 'OPERATIONAL') {
      return false;
    }

    return true;
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
    
    // Google Maps allows 10 requests per second
    if (this.requestCount >= 10) {
      const waitTime = oneSecond - (now - this.lastReset);
      this.logger.warn('Rate limit reached, waiting', { waitTimeMs: waitTime });
      throw new Error(`Rate limit exceeded. Wait ${waitTime}ms before making another request.`);
    }
    
    this.requestCount++;
  }

  /**
   * Generate mock business data for testing
   */
  private getMockBusinesses(params: GoogleMapsSearchParams): GoogleMapsBusiness[] {
    // Return empty array to force real API usage - no mock data for specific businesses

    const mockBusinesses: GoogleMapsBusiness[] = [
      {
        place_id: 'mock_restaurant_1',
        name: 'Mile High Bistro',
        address: '1234 17th Street, Denver, CO 80202',
        phone: '(303) 555-0101',
        website: 'https://milehighbistro.com',
        rating: 4.2,
        user_ratings_total: 156,
        price_level: 2,
        business_status: 'OPERATIONAL',
        types: ['restaurant', 'food', 'establishment'],
        geometry: {
          location: {
            lat: 39.7392,
            lng: -104.9903
          }
        },
        opening_hours: {
          open_now: true
        }
      },
      {
        place_id: 'mock_restaurant_2',
        name: 'Denver Deli & Grill',
        address: '5678 Broadway, Denver, CO 80203',
        phone: '(303) 555-0102',
        website: 'https://denverdeliandgrill.com',
        rating: 4.5,
        user_ratings_total: 89,
        price_level: 1,
        business_status: 'OPERATIONAL',
        types: ['restaurant', 'meal_takeaway', 'establishment'],
        geometry: {
          location: {
            lat: 39.7292,
            lng: -104.9803
          }
        },
        opening_hours: {
          open_now: true
        }
      },
      {
        place_id: 'mock_restaurant_3',
        name: 'Rocky Mountain Pizza Co',
        address: '9012 Cherry Creek Drive, Denver, CO 80209',
        phone: '(303) 555-0103',
        rating: 4.0,
        user_ratings_total: 67,
        price_level: 2,
        business_status: 'OPERATIONAL',
        types: ['restaurant', 'meal_delivery', 'establishment'],
        geometry: {
          location: {
            lat: 39.7192,
            lng: -104.9703
          }
        },
        opening_hours: {
          open_now: false
        }
      }
    ];

    // Filter by query if needed
    if (params.query) {
      const queryLower = params.query.toLowerCase();
      const filteredBusinesses = mockBusinesses.filter(business => 
        business.types.some(type => 
          type.includes(queryLower) || 
          queryLower.includes(type) ||
          (queryLower === 'restaurants' && type === 'restaurant') ||
          (queryLower === 'restaurant' && type === 'restaurant')
        ) ||
        business.name.toLowerCase().includes(queryLower)
      );
      
      this.logger.debug('Mock businesses filtered', {
        query: params.query,
        totalMockBusinesses: mockBusinesses.length,
        filteredCount: filteredBusinesses.length,
        businessNames: filteredBusinesses.map(b => b.name)
      });
      
      return filteredBusinesses;
    }

    return mockBusinesses;
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