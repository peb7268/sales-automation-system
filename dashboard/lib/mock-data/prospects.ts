import { IProspect, PipelineStage, Industry } from '@/types';

const industries: Industry[] = [
  'restaurants', 'retail', 'professional_services', 'healthcare',
  'real_estate', 'automotive', 'home_services', 'fitness',
  'beauty_salons', 'legal_services'
];

const cities = [
  { city: 'Denver', state: 'CO' },
  { city: 'Boulder', state: 'CO' },
  { city: 'Fort Collins', state: 'CO' },
  { city: 'Colorado Springs', state: 'CO' },
  { city: 'Aurora', state: 'CO' },
  { city: 'Lakewood', state: 'CO' },
  { city: 'Westminster', state: 'CO' },
  { city: 'Arvada', state: 'CO' },
];

const businessNames = [
  'Summit Peak Solutions', 'Mountain View Cafe', 'Alpine Tech Services',
  'Rocky Mountain Retail', 'Mile High Motors', 'Denver Dental Care',
  'Boulder Beauty Spa', 'Colorado Construction Co', 'Fort Collins Fitness',
  'Springs Legal Group', 'Aurora Auto Repair', 'Lakewood Law Firm',
  'Westminster Wellness', 'Arvada Athletics', 'Denver Diner',
  'Boulder Bookstore', 'Mountain Medical Center', 'Peak Performance Gym',
  'Summit Salon & Spa', 'Colorado Coffee House', 'Rocky Road Restaurant',
  'Mile High Marketing Co', 'Alpine Accounting', 'Denver Design Studio',
  'Boulder Business Solutions', 'Springs Software Inc', 'Aurora Analytics',
  'Lakewood Landscaping', 'Westminster Web Design', 'Arvada Architecture',
];

function generateProspect(index: number): IProspect {
  const business = businessNames[index % businessNames.length];
  const location = cities[index % cities.length];
  const industry = industries[index % industries.length];
  const stage: PipelineStage = ['cold', 'contacted', 'interested', 'qualified'][Math.floor(Math.random() * 4)] as PipelineStage;
  
  const qualificationScore = Math.floor(Math.random() * 100);
  const hasWebsite = Math.random() > 0.3;
  const hasGoogleBusiness = Math.random() > 0.2;
  const hasSocialMedia = Math.random() > 0.4;
  
  return {
    id: `prospect-${index + 1}`,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
    updatedAt: new Date(),
    
    business: {
      name: business,
      industry,
      location: {
        city: location.city,
        state: location.state,
        country: 'USA',
        zipCode: `${80200 + index}`,
        coordinates: {
          lat: 39.7392 + (Math.random() - 0.5) * 0.5,
          lng: -104.9903 + (Math.random() - 0.5) * 0.5,
        },
      },
      size: {
        category: ['micro', 'small', 'medium'][Math.floor(Math.random() * 3)] as any,
        employeeCount: Math.floor(Math.random() * 50) + 5,
        estimatedRevenue: Math.floor(Math.random() * 5000000) + 100000,
      },
      digitalPresence: {
        hasWebsite,
        hasGoogleBusiness,
        hasSocialMedia,
        hasOnlineReviews: Math.random() > 0.3,
        websiteUrl: hasWebsite ? `https://www.${business.toLowerCase().replace(/\s+/g, '')}.com` : undefined,
      },
    },
    
    contact: {
      primaryContact: `John ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][index % 5]}`,
      contactTitle: ['Owner', 'CEO', 'Manager', 'Director'][index % 4],
      phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      email: `contact@${business.toLowerCase().replace(/\s+/g, '')}.com`,
      website: `https://www.${business.toLowerCase().replace(/\s+/g, '')}.com`,
      decisionMaker: 'Yes',
      socialProfiles: {
        linkedin: Math.random() > 0.5 ? `https://linkedin.com/company/${business.toLowerCase().replace(/\s+/g, '-')}` : undefined,
        facebook: Math.random() > 0.3 ? `https://facebook.com/${business.toLowerCase().replace(/\s+/g, '')}` : undefined,
      },
    },
    
    pipelineStage: stage,
    
    qualificationScore: {
      total: qualificationScore,
      breakdown: {
        businessSize: Math.floor(Math.random() * 20),
        digitalPresence: Math.floor(Math.random() * 25),
        competitorGaps: Math.floor(Math.random() * 20),
        location: Math.floor(Math.random() * 15),
        industry: Math.floor(Math.random() * 10),
        revenueIndicators: Math.floor(Math.random() * 10),
      },
      qualificationLevel: qualificationScore > 70 ? 'high' : qualificationScore > 40 ? 'medium' : 'low',
      lastUpdated: new Date(),
    },
    
    researchPasses: [
      {
        passNumber: 1,
        type: 'google_maps',
        status: 'completed',
        completedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        dataCollected: { reviews: Math.floor(Math.random() * 100), rating: (Math.random() * 2 + 3).toFixed(1) },
        retryCount: 0,
        source: { api: 'Google Maps API' },
      },
      {
        passNumber: 2,
        type: 'firecrawl',
        status: Math.random() > 0.2 ? 'completed' : 'failed',
        completedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
        dataCollected: { pagesScraped: Math.floor(Math.random() * 10) + 1 },
        retryCount: Math.floor(Math.random() * 2),
        source: { api: 'Firecrawl' },
      },
    ],
    
    dataConfidence: Math.random() * 30 + 70, // 70-100%
    
    businessInsights: {
      painPoints: [
        'Limited online presence',
        'Manual customer management',
        'No email marketing strategy',
      ],
      competitiveAdvantages: [
        'Strong local reputation',
        'Experienced team',
        'Quality service',
      ],
    },
    
    tags: ['prospect', industry, location.city.toLowerCase()],
  };
}

// Generate 100 mock prospects
export const mockProspects: IProspect[] = Array.from({ length: 100 }, (_, i) => generateProspect(i));

// Helper functions for filtering
export const getProspectsByStage = (stage: PipelineStage) => 
  mockProspects.filter(p => p.pipelineStage === stage);

export const getQualifiedProspects = () => 
  mockProspects.filter(p => p.qualificationScore.total >= 70);

export const getProspectsByIndustry = (industry: Industry) => 
  mockProspects.filter(p => p.business.industry === industry);

// Stage distribution for analytics
export const stageDistribution = {
  cold: mockProspects.filter(p => p.pipelineStage === 'cold').length,
  contacted: mockProspects.filter(p => p.pipelineStage === 'contacted').length,
  interested: mockProspects.filter(p => p.pipelineStage === 'interested').length,
  qualified: mockProspects.filter(p => p.pipelineStage === 'qualified').length,
};