import { DashboardMetrics, Goal, Notification, ChartDataPoint, ChartSeries, TimeFrame } from '@/types';
import { mockProspects, stageDistribution } from './prospects';
import { mockCalls, callMetrics } from './calls';
import { mockCampaigns } from './campaigns';

// Generate dashboard metrics
export function generateDashboardMetrics(): DashboardMetrics {
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  
  const todaysCalls = mockCalls.filter(c => c.startedAt >= todayStart);
  const qualifiedProspects = mockProspects.filter(p => p.qualificationScore.total >= 70);
  
  return {
    // Pipeline Metrics
    totalProspects: mockProspects.length,
    newProspectsToday: Math.floor(Math.random() * 10) + 5,
    qualifiedLeads: qualifiedProspects.length,
    conversionRate: qualifiedProspects.length / mockProspects.length,
    averageQualificationScore: mockProspects.reduce((sum, p) => sum + p.qualificationScore.total, 0) / mockProspects.length,
    
    // Call Metrics
    totalCalls: mockCalls.length,
    activeCallsNow: Math.floor(Math.random() * 5),
    callsToday: todaysCalls.length || Math.floor(Math.random() * 50) + 20,
    meetingsBooked: callMetrics.meetingsScheduled,
    connectionRate: callMetrics.connected / callMetrics.total,
    
    // Revenue Metrics
    estimatedPipeline: qualifiedProspects.reduce((sum, p) => sum + (p.business.size?.estimatedRevenue || 0), 0) * 0.1,
    closedThisMonth: Math.floor(Math.random() * 50000) + 20000,
    averageDealSize: 5000 + Math.random() * 10000,
    monthlyRecurring: Math.floor(Math.random() * 30000) + 10000,
  };
}

// Generate goals
export function generateGoals(): Goal[] {
  return [
    {
      id: 'goal-1',
      name: 'Qualified Leads',
      target: 100,
      current: 73,
      unit: 'number',
      timeframe: 'month',
      category: 'pipeline',
    },
    {
      id: 'goal-2',
      name: 'Calls Completed',
      target: 500,
      current: 342,
      unit: 'number',
      timeframe: 'week',
      category: 'calls',
    },
    {
      id: 'goal-3',
      name: 'Revenue Generated',
      target: 50000,
      current: 38500,
      unit: 'currency',
      timeframe: 'month',
      category: 'revenue',
    },
    {
      id: 'goal-4',
      name: 'Conversion Rate',
      target: 25,
      current: 18.5,
      unit: 'percentage',
      timeframe: 'quarter',
      category: 'pipeline',
    },
    {
      id: 'goal-5',
      name: 'Meetings Booked',
      target: 50,
      current: 28,
      unit: 'number',
      timeframe: 'week',
      category: 'calls',
    },
  ];
}

// Generate notifications
export function generateNotifications(): Notification[] {
  const now = new Date();
  
  return [
    {
      id: 'notif-1',
      type: 'success',
      title: 'Campaign Completed',
      message: 'Q1 Restaurant Outreach campaign finished with 85% success rate',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      read: false,
      actionUrl: '/dashboard/caller?campaign=1',
    },
    {
      id: 'notif-2',
      type: 'info',
      title: 'New Qualified Lead',
      message: 'Alpine Tech Services scored 92/100 in qualification',
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      read: false,
      actionUrl: '/dashboard/pipeline?prospect=3',
    },
    {
      id: 'notif-3',
      type: 'warning',
      title: 'API Rate Limit',
      message: 'Firecrawl API approaching rate limit (80% used)',
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: 'notif-4',
      type: 'success',
      title: 'Meeting Scheduled',
      message: 'Demo call booked with Denver Dental Care for tomorrow',
      timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000),
      read: true,
    },
  ];
}

// Generate time series data
export function generateTimeSeriesData(days: number = 30): ChartSeries[] {
  const data: ChartDataPoint[][] = [[], [], []];
  const labels = ['Prospects', 'Calls', 'Qualified'];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data[0].push({
      x: date,
      y: Math.floor(Math.random() * 20) + 10,
    });
    
    data[1].push({
      x: date,
      y: Math.floor(Math.random() * 50) + 20,
    });
    
    data[2].push({
      x: date,
      y: Math.floor(Math.random() * 10) + 2,
    });
  }
  
  return [
    { name: labels[0], data: data[0], color: '#3B82F6' },
    { name: labels[1], data: data[1], color: '#10B981' },
    { name: labels[2], data: data[2], color: '#F59E0B' },
  ];
}

// Generate pipeline funnel data
export function generatePipelineFunnelData(): ChartDataPoint[] {
  return [
    { x: 'Cold', y: stageDistribution.cold, color: '#94A3B8' },
    { x: 'Contacted', y: stageDistribution.contacted, color: '#3B82F6' },
    { x: 'Interested', y: stageDistribution.interested, color: '#10B981' },
    { x: 'Qualified', y: stageDistribution.qualified, color: '#F59E0B' },
  ];
}

// Generate call outcome distribution
export function generateCallOutcomeData(): ChartDataPoint[] {
  return [
    { x: 'Qualified', y: 45, color: '#10B981' },
    { x: 'Not Qualified', y: 25, color: '#EF4444' },
    { x: 'Callback', y: 15, color: '#3B82F6' },
    { x: 'Meeting', y: 10, color: '#F59E0B' },
    { x: 'Not Interested', y: 5, color: '#94A3B8' },
  ];
}

// Generate geographic distribution
export function generateGeographicData() {
  const cities = ['Denver', 'Boulder', 'Fort Collins', 'Colorado Springs', 'Aurora'];
  return cities.map(city => ({
    city,
    prospects: mockProspects.filter(p => p.business.location.city === city).length,
    calls: Math.floor(Math.random() * 100) + 20,
    qualified: Math.floor(Math.random() * 20) + 5,
    lat: 39.7392 + (Math.random() - 0.5) * 2,
    lng: -104.9903 + (Math.random() - 0.5) * 2,
  }));
}

// Generate performance metrics by timeframe
export function generatePerformanceByTimeframe(timeframe: TimeFrame) {
  const periods = {
    day: 7,
    week: 4,
    month: 12,
    quarter: 4,
    year: 3,
  };
  
  const count = periods[timeframe];
  const data: ChartDataPoint[] = [];
  
  for (let i = 0; i < count; i++) {
    data.push({
      x: `Period ${i + 1}`,
      y: Math.floor(Math.random() * 100) + 50,
    });
  }
  
  return data;
}

// Mock real-time data updates
export function simulateRealTimeUpdate() {
  const updates = [
    { type: 'new_call', data: { prospectId: 'prospect-1', status: 'connected' } },
    { type: 'call_completed', data: { callId: 'call-123', outcome: 'qualified' } },
    { type: 'prospect_qualified', data: { prospectId: 'prospect-5', score: 85 } },
    { type: 'meeting_scheduled', data: { prospectId: 'prospect-3', date: new Date() } },
  ];
  
  return updates[Math.floor(Math.random() * updates.length)];
}

// Export all mock data
export const mockDashboardMetrics = generateDashboardMetrics();
export const mockGoals = generateGoals();
export const mockNotifications = generateNotifications();
export const mockTimeSeriesData = generateTimeSeriesData();
export const mockPipelineFunnel = generatePipelineFunnelData();
export const mockCallOutcomes = generateCallOutcomeData();
export const mockGeographicData = generateGeographicData();