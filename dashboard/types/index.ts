/**
 * Dashboard Type Definitions
 * Extends the shared interfaces with dashboard-specific types
 */

// Re-export shared interfaces
export * from '../../shared/interfaces/ISalesPipeline';
export * from '../../shared/interfaces/ISalesCaller';

// Dashboard-specific types
export type TimeFrame = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface DashboardMetrics {
  // Pipeline Metrics
  totalProspects: number;
  newProspectsToday: number;
  qualifiedLeads: number;
  conversionRate: number;
  averageQualificationScore: number;
  
  // Call Metrics
  totalCalls: number;
  activeCallsNow: number;
  callsToday: number;
  meetingsBooked: number;
  connectionRate: number;
  
  // Revenue Metrics
  estimatedPipeline: number;
  closedThisMonth: number;
  averageDealSize: number;
  monthlyRecurring: number;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: 'number' | 'percentage' | 'currency';
  timeframe: TimeFrame;
  category: 'pipeline' | 'calls' | 'revenue';
}

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export interface ChartDataPoint {
  x: string | number | Date;
  y: number;
  label?: string;
  color?: string;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
}