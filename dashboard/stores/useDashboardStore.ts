import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { DashboardMetrics, Goal, Notification, TimeFrame } from '@/types';
import { 
  mockDashboardMetrics, 
  mockGoals, 
  mockNotifications,
  generateDashboardMetrics,
  simulateRealTimeUpdate 
} from '@/lib/mock-data/analytics';

interface DashboardState {
  // Current tab
  activeTab: 'pipeline' | 'caller' | 'analytics' | 'settings';
  setActiveTab: (tab: DashboardState['activeTab']) => void;
  
  // Metrics
  metrics: DashboardMetrics;
  updateMetrics: () => void;
  
  // Goals
  goals: Goal[];
  timeframe: TimeFrame;
  setTimeframe: (timeframe: TimeFrame) => void;
  updateGoal: (goalId: string, current: number) => void;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  clearNotifications: () => void;
  
  // Real-time simulation
  isRealTimeEnabled: boolean;
  toggleRealTime: () => void;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Filters
  filters: {
    industry?: string;
    stage?: string;
    dateRange?: { start: Date; end: Date };
  };
  setFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  
  // Settings
  notificationPreferences: {
    email: {
      qualifiedLead: boolean;
      meetingScheduled: boolean;
      dailySummary: boolean;
      weeklyReport: boolean;
    };
    inApp: {
      callCompleted: boolean;
      researchComplete: boolean;
      systemErrors: boolean;
      achievements: boolean;
    };
    push: {
      urgentOnly: boolean;
    };
  };
  updateNotificationPreferences: (type: 'email' | 'inApp' | 'push', key: string, value: boolean) => void;
  
  apiSettings: {
    vapiConnected: boolean;
    openAiConnected: boolean;
    googleMapsConnected: boolean;
    firecrawlConnected: boolean;
    supabaseConnected: boolean;
    kafkaConnected: boolean;
  };
  updateApiSettings: (key: string, value: boolean) => void;
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    persist(
      (set, get) => ({
        // Tab management
        activeTab: 'pipeline',
        setActiveTab: (tab) => set({ activeTab: tab }),
        
        // Metrics
        metrics: mockDashboardMetrics,
        updateMetrics: () => set({ metrics: generateDashboardMetrics() }),
        
        // Goals
        goals: mockGoals,
        timeframe: 'month',
        setTimeframe: (timeframe) => set({ timeframe }),
        updateGoal: (goalId, current) => set((state) => ({
          goals: state.goals.map(g => 
            g.id === goalId ? { ...g, current } : g
          )
        })),
        
        // Notifications
        notifications: mockNotifications,
        unreadCount: mockNotifications.filter(n => !n.read).length,
        markAsRead: (notificationId) => set((state) => {
          const notifications = state.notifications.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          );
          return {
            notifications,
            unreadCount: notifications.filter(n => !n.read).length
          };
        }),
        addNotification: (notification) => set((state) => {
          const newNotification: Notification = {
            ...notification,
            id: `notif-${Date.now()}`,
            timestamp: new Date(),
            read: false,
          };
          return {
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          };
        }),
        clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
        
        // Real-time
        isRealTimeEnabled: false,
        toggleRealTime: () => set((state) => ({ 
          isRealTimeEnabled: !state.isRealTimeEnabled 
        })),
        
        // Theme
        theme: 'system',
        setTheme: (theme) => set({ theme }),
        
        // Filters
        filters: {},
        setFilter: (key, value) => set((state) => ({
          filters: { ...state.filters, [key]: value }
        })),
        clearFilters: () => set({ filters: {} }),
        
        // Settings
        notificationPreferences: {
          email: {
            qualifiedLead: true,
            meetingScheduled: true,
            dailySummary: true,
            weeklyReport: false,
          },
          inApp: {
            callCompleted: true,
            researchComplete: true,
            systemErrors: true,
            achievements: true,
          },
          push: {
            urgentOnly: false,
          },
        },
        updateNotificationPreferences: (type, key, value) => set((state) => ({
          notificationPreferences: {
            ...state.notificationPreferences,
            [type]: {
              ...state.notificationPreferences[type],
              [key]: value,
            },
          },
        })),
        
        apiSettings: {
          vapiConnected: true,
          openAiConnected: true,
          googleMapsConnected: true,
          firecrawlConnected: true,
          supabaseConnected: true,
          kafkaConnected: false,
        },
        updateApiSettings: (key, value) => set((state) => ({
          apiSettings: {
            ...state.apiSettings,
            [key]: value,
          },
        })),
      }),
      {
        name: 'dashboard-storage',
        partialize: (state) => ({ 
          theme: state.theme,
          timeframe: state.timeframe,
          isRealTimeEnabled: state.isRealTimeEnabled,
        }),
      }
    )
  )
);

// Real-time simulation effect
if (typeof window !== 'undefined') {
  setInterval(() => {
    const state = useDashboardStore.getState();
    if (state.isRealTimeEnabled) {
      const update = simulateRealTimeUpdate();
      
      // Add notification for the update
      state.addNotification({
        type: 'info',
        title: `Real-time: ${update.type.replace('_', ' ')}`,
        message: `Update received for ${update.data.prospectId || update.data.callId}`,
      });
      
      // Update metrics
      state.updateMetrics();
    }
  }, 5000);
}