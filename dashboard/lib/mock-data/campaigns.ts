import { ICallCampaign, ScriptVariant, ConversationTone, ICampaignMetrics, CallOutcome, InterestLevel } from '@/types';

const campaignNames = [
  'Q1 Restaurant Outreach',
  'Healthcare Digital Transformation',
  'Retail Holiday Campaign',
  'Professional Services Expansion',
  'Local Business Blitz',
  'Spring Fitness Studios',
  'Beauty Salon Modernization',
  'Legal Services Upgrade',
];

const scriptVariants: ScriptVariant[] = [
  'standard',
  'value_focused',
  'problem_solving',
  'relationship_building',
  'competitive_advantage',
];

const conversationTones: ConversationTone[] = [
  'professional',
  'friendly',
  'enthusiastic',
  'consultative',
];

function generateCampaignMetrics(): ICampaignMetrics {
  const totalCalls = Math.floor(Math.random() * 500) + 100;
  const successfulConnections = Math.floor(totalCalls * (0.3 + Math.random() * 0.4));
  const qualifiedProspects = Math.floor(successfulConnections * (0.2 + Math.random() * 0.3));
  const meetingsBooked = Math.floor(qualifiedProspects * (0.3 + Math.random() * 0.4));
  
  return {
    totalCalls,
    successfulConnections,
    qualifiedProspects,
    meetingsBooked,
    
    connectionRate: successfulConnections / totalCalls,
    qualificationRate: qualifiedProspects / successfulConnections,
    bookingRate: meetingsBooked / qualifiedProspects,
    
    averageCallDuration: 120 + Math.random() * 180,
    averageQualificationScore: 5 + Math.random() * 3,
    totalCallTime: totalCalls * 150,
    
    totalCost: totalCalls * 0.35,
    costPerConnection: (totalCalls * 0.35) / successfulConnections,
    costPerQualified: (totalCalls * 0.35) / qualifiedProspects,
    costPerMeeting: (totalCalls * 0.35) / meetingsBooked,
    
    outcomeDistribution: {
      qualified: qualifiedProspects,
      not_qualified: successfulConnections - qualifiedProspects,
      callback_requested: Math.floor(successfulConnections * 0.1),
      meeting_scheduled: meetingsBooked,
      not_interested: Math.floor(successfulConnections * 0.2),
      wrong_number: Math.floor(totalCalls * 0.05),
      do_not_call: Math.floor(totalCalls * 0.02),
    } as Record<CallOutcome, number>,
    
    interestDistribution: {
      high: Math.floor(qualifiedProspects * 0.3),
      medium: Math.floor(qualifiedProspects * 0.4),
      low: Math.floor(qualifiedProspects * 0.3),
      none: Math.floor(successfulConnections * 0.2),
      hostile: Math.floor(successfulConnections * 0.05),
    } as Record<InterestLevel, number>,
  };
}

function generateCampaign(index: number): ICallCampaign {
  const name = campaignNames[index % campaignNames.length];
  const status = ['active', 'paused', 'completed'][Math.floor(Math.random() * 3)] as any;
  const createdAt = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
  const startDate = new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
  
  const totalProspects = Math.floor(Math.random() * 200) + 50;
  const completedCalls = status === 'completed' ? totalProspects : Math.floor(totalProspects * Math.random());
  
  return {
    id: `campaign-${index + 1}`,
    name: `${name} ${index + 1}`,
    description: `Automated calling campaign targeting ${name.toLowerCase()} segment`,
    status,
    
    createdAt,
    startDate,
    endDate: status === 'completed' ? new Date(startDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
    
    prospectCriteria: {
      industries: index % 2 === 0 ? ['restaurants', 'retail'] : ['healthcare', 'professional_services'],
      qualificationScoreMin: 40,
      qualificationScoreMax: 100,
      cities: ['Denver', 'Boulder', 'Fort Collins'],
      states: ['CO'],
    },
    
    scriptVariant: scriptVariants[index % scriptVariants.length],
    conversationTone: conversationTones[index % conversationTones.length],
    
    callSettings: {
      maxAttempts: 3,
      attemptInterval: 24,
      callWindow: {
        startHour: 9,
        endHour: 17,
        timezone: 'America/Denver',
        daysOfWeek: [1, 2, 3, 4, 5],
      },
      voicemailSettings: {
        leaveMessage: true,
        messageScript: 'Hi, this is Sarah from Mile High Marketing...',
      },
      complianceSettings: {
        respectDNC: true,
        recordCalls: true,
        requireConsent: false,
      },
    },
    
    metrics: status !== 'draft' ? generateCampaignMetrics() : undefined,
    
    totalProspects,
    completedCalls,
    remainingCalls: totalProspects - completedCalls,
  };
}

// Generate 20 mock campaigns
export const mockCampaigns: ICallCampaign[] = Array.from({ length: 20 }, (_, i) => generateCampaign(i));

// Helper functions
export const getActiveCampaigns = () => 
  mockCampaigns.filter(c => c.status === 'active');

export const getCampaignsByStatus = (status: string) => 
  mockCampaigns.filter(c => c.status === status);

export const getCampaignMetrics = (campaignId: string) => {
  const campaign = mockCampaigns.find(c => c.id === campaignId);
  return campaign?.metrics || null;
};

// Campaign performance summary
export const campaignSummary = {
  total: mockCampaigns.length,
  active: mockCampaigns.filter(c => c.status === 'active').length,
  paused: mockCampaigns.filter(c => c.status === 'paused').length,
  completed: mockCampaigns.filter(c => c.status === 'completed').length,
  totalProspects: mockCampaigns.reduce((sum, c) => sum + c.totalProspects, 0),
  totalCompletedCalls: mockCampaigns.reduce((sum, c) => sum + c.completedCalls, 0),
};