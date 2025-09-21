import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { IProspect, PipelineStage } from '@/types';
import { io, Socket } from 'socket.io-client';

// Database prospect type (from API)
interface DatabaseProspect {
  id: string;
  business_name: string;
  industry: string;
  location: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  temperature: 'cold' | 'warm' | 'hot';
  pipeline_stage: 'cold' | 'contacted' | 'interested' | 'qualified';
  score: number;
  research_data: any;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Convert database prospect to IProspect
const convertToIProspect = (dbProspect: DatabaseProspect): IProspect => {
  return {
    id: dbProspect.id,
    business: {
      name: dbProspect.business_name,
      industry: dbProspect.industry,
      location: {
        address: '',
        city: dbProspect.location.split(',')[0]?.trim() || '',
        state: dbProspect.location.split(',')[1]?.trim() || '',
        zipCode: '',
        country: 'USA',
        coordinates: { lat: 0, lng: 0 }
      },
      website: dbProspect.website || '',
      description: '',
      size: {
        category: 'small' as any,
        employeeCount: 10,
        estimatedRevenue: 500000
      },
      digitalPresence: {
        hasWebsite: !!dbProspect.website,
        hasGoogleBusiness: true,
        hasSocialMedia: false,
        hasOnlineReviews: false,
        websiteUrl: dbProspect.website || undefined
      }
    },
    contact: {
      primaryContact: dbProspect.contact_name || '',
      contactTitle: 'Owner',
      email: dbProspect.contact_email || '',
      phone: dbProspect.contact_phone || '',
      website: dbProspect.website || '',
      decisionMaker: 'Yes',
      socialProfiles: {}
    },
    pipelineStage: dbProspect.pipeline_stage as PipelineStage,
    qualificationScore: {
      total: dbProspect.score,
      breakdown: {
        businessSize: 15,
        digitalPresence: 20,
        competitorGaps: 15,
        location: 10,
        industry: 5,
        revenueIndicators: 5
      },
      qualificationLevel: dbProspect.score > 70 ? 'high' : dbProspect.score > 40 ? 'medium' : 'low',
      lastUpdated: new Date(dbProspect.updated_at)
    },
    researchPasses: [
      {
        passNumber: 1,
        type: 'google_maps',
        status: 'completed',
        completedAt: new Date(dbProspect.created_at),
        dataCollected: {},
        retryCount: 0,
        source: { api: 'Google Maps API' }
      },
      {
        passNumber: 2,
        type: 'firecrawl',
        status: 'completed',
        completedAt: new Date(dbProspect.created_at),
        dataCollected: {},
        retryCount: 0,
        source: { api: 'Firecrawl' }
      }
    ],
    dataConfidence: 85,
    businessInsights: {
      painPoints: ['Limited online presence'],
      competitiveAdvantages: ['Strong local reputation']
    },
    tags: ['prospect', dbProspect.industry],
    createdAt: new Date(dbProspect.created_at),
    updatedAt: new Date(dbProspect.updated_at)
  };
};

interface PipelineState {
  // Prospects
  prospects: IProspect[];
  selectedProspect: IProspect | null;
  setSelectedProspect: (prospect: IProspect | null) => void;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Real-time WebSocket connection
  socket: Socket | null;
  wsConnected: boolean;
  wsConnecting: boolean;

  // Filtering
  stageFilter: PipelineStage | 'all';
  setStageFilter: (stage: PipelineStage | 'all') => void;
  industryFilter: string | 'all';
  setIndustryFilter: (industry: string | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Actions
  fetchProspects: () => Promise<void>;
  moveProspect: (prospectId: string, newStage: PipelineStage) => Promise<void>;
  updateProspectScore: (prospectId: string, score: number) => Promise<void>;
  addProspect: (prospect: Omit<IProspect, 'id'>) => Promise<void>;
  updateProspect: (prospectId: string, updates: any) => Promise<void>;
  deleteProspect: (prospectId: string) => Promise<void>;
  importProspects: (prospects: any[]) => Promise<{ imported: number; failed: number; errors: string[] }>;

  // Real-time WebSocket
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  subscribeToChanges: () => void;
  unsubscribeFromChanges: () => void;

  // Research
  researchQueue: string[];
  addToResearchQueue: (prospectId: string) => void;
  removeFromResearchQueue: (prospectId: string) => void;
  isResearching: boolean;
  setIsResearching: (researching: boolean) => void;

  // Notifications
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: Date;
  }>;
  addNotification: (notification: Omit<PipelineState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;

  // Computed values
  getFilteredProspects: () => IProspect[];
  getStageCount: (stage: PipelineStage) => number;
}

export const usePipelineStoreWithSupabase = create<PipelineState>()(
  devtools(
    (set, get) => ({
      // Prospects
      prospects: [],
      selectedProspect: null,
      setSelectedProspect: (prospect) => set({ selectedProspect: prospect }),

      // Loading states
      isLoading: false,
      error: null,

      // WebSocket connection
      socket: null,
      wsConnected: false,
      wsConnecting: false,
      
      // Filtering
      stageFilter: 'all',
      setStageFilter: (stage) => set({ stageFilter: stage }),
      industryFilter: 'all',
      setIndustryFilter: (industry) => set({ industryFilter: industry }),
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      // Actions
      fetchProspects: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/prospects');
          const result = await response.json();

          if (result.success) {
            const prospects = result.data.map(convertToIProspect);
            set({ prospects, isLoading: false });
          } else {
            set({ error: result.error || 'Failed to fetch prospects', isLoading: false });
          }
        } catch (error) {
          set({ error: 'Failed to fetch prospects', isLoading: false });
          console.error('Error fetching prospects:', error);
        }
      },
      
      moveProspect: async (prospectId, newStage) => {
        try {
          const response = await fetch(`/api/prospects?id=${prospectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pipeline_stage: newStage })
          });

          const result = await response.json();
          if (result.success) {
            // Update local state optimistically
            set((state) => ({
              prospects: state.prospects.map(p =>
                p.id === prospectId ? { ...p, pipelineStage: newStage } : p
              )
            }));
          } else {
            set({ error: result.error || 'Failed to update prospect stage' });
          }
        } catch (error) {
          console.error('Error moving prospect:', error);
          set({ error: 'Failed to update prospect stage' });
        }
      },
      
      updateProspectScore: async (prospectId, score) => {
        try {
          const response = await fetch(`/api/prospects?id=${prospectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score })
          });

          const result = await response.json();
          if (result.success) {
            // Update local state
            set((state) => ({
              prospects: state.prospects.map(p =>
                p.id === prospectId
                  ? {
                      ...p,
                      qualificationScore: {
                        ...p.qualificationScore,
                        total: score,
                        qualificationLevel: score > 70 ? 'high' : score > 40 ? 'medium' : 'low',
                        lastUpdated: new Date()
                      }
                    }
                  : p
              )
            }));
          } else {
            set({ error: result.error || 'Failed to update prospect score' });
          }
        } catch (error) {
          console.error('Error updating prospect score:', error);
          set({ error: 'Failed to update prospect score' });
        }
      },
      
      addProspect: async (prospect) => {
        try {
          const response = await fetch('/api/prospects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              business_name: prospect.business.name,
              industry: prospect.business.industry,
              location: `${prospect.business.location.city}, ${prospect.business.location.state}`,
              contact_name: prospect.contact.primaryContact,
              contact_email: prospect.contact.email,
              contact_phone: prospect.contact.phone,
              website: prospect.business.website,
              temperature: prospect.temperature,
              pipeline_stage: prospect.pipelineStage,
              score: prospect.qualificationScore.total,
              notes: prospect.notes
            })
          });

          const result = await response.json();
          if (result.success) {
            const iProspect = convertToIProspect(result.data);
            set((state) => ({ prospects: [...state.prospects, iProspect] }));

            get().addNotification({
              type: 'success',
              message: `Prospect ${iProspect.business.name} added successfully`
            });
          } else {
            set({ error: result.error || 'Failed to add prospect' });
            get().addNotification({
              type: 'error',
              message: result.error || 'Failed to add prospect'
            });
          }
        } catch (error) {
          console.error('Error adding prospect:', error);
          set({ error: 'Failed to add prospect' });
          get().addNotification({
            type: 'error',
            message: 'Failed to add prospect'
          });
        }
      },

      updateProspect: async (prospectId, updates) => {
        try {
          const response = await fetch(`/api/prospects?id=${prospectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          });

          const result = await response.json();
          if (result.success) {
            const updatedIProspect = convertToIProspect(result.data);
            set((state) => ({
              prospects: state.prospects.map(p =>
                p.id === prospectId ? updatedIProspect : p
              )
            }));

            get().addNotification({
              type: 'success',
              message: `Prospect ${updatedIProspect.business.name} updated successfully`
            });
          } else {
            set({ error: result.error || 'Failed to update prospect' });
            get().addNotification({
              type: 'error',
              message: result.error || 'Failed to update prospect'
            });
          }
        } catch (error) {
          console.error('Error updating prospect:', error);
          set({ error: 'Failed to update prospect' });
          get().addNotification({
            type: 'error',
            message: 'Failed to update prospect'
          });
        }
      },
      
      deleteProspect: async (prospectId) => {
        try {
          const prospect = get().prospects.find(p => p.id === prospectId);

          const response = await fetch(`/api/prospects?id=${prospectId}`, {
            method: 'DELETE'
          });

          const result = await response.json();
          if (result.success) {
            set((state) => ({
              prospects: state.prospects.filter(p => p.id !== prospectId),
              selectedProspect: state.selectedProspect?.id === prospectId ? null : state.selectedProspect
            }));

            get().addNotification({
              type: 'success',
              message: `Prospect ${prospect?.business.name || 'deleted'} removed successfully`
            });
          } else {
            set({ error: result.error || 'Failed to delete prospect' });
            get().addNotification({
              type: 'error',
              message: result.error || 'Failed to delete prospect'
            });
          }
        } catch (error) {
          console.error('Error deleting prospect:', error);
          set({ error: 'Failed to delete prospect' });
          get().addNotification({
            type: 'error',
            message: 'Failed to delete prospect'
          });
        }
      },

      importProspects: async (prospects) => {
        try {
          set({ isLoading: true, error: null });

          const response = await fetch('/api/prospects/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prospects })
          });

          const result = await response.json();

          if (result.success) {
            // Refresh prospects list to include newly imported ones
            await get().fetchProspects();

            const { imported, failed, errors } = result.data;

            // Show success notification
            if (imported > 0) {
              get().addNotification({
                type: 'success',
                message: `Successfully imported ${imported} prospect${imported > 1 ? 's' : ''}`
              });
            }

            // Show warning if some failed
            if (failed > 0) {
              get().addNotification({
                type: 'warning',
                message: `Failed to import ${failed} prospect${failed > 1 ? 's' : ''}`
              });
            }

            set({ isLoading: false });
            return { imported, failed, errors };
          } else {
            set({ error: result.error || 'Failed to import prospects', isLoading: false });
            get().addNotification({
              type: 'error',
              message: result.error || 'Failed to import prospects'
            });
            return { imported: 0, failed: prospects.length, errors: [result.error || 'Import failed'] };
          }
        } catch (error) {
          console.error('Error importing prospects:', error);
          set({ error: 'Failed to import prospects', isLoading: false });
          get().addNotification({
            type: 'error',
            message: 'Failed to import prospects'
          });
          return { imported: 0, failed: prospects.length, errors: ['Import failed'] };
        }
      },
      
      // WebSocket connection management
      connectWebSocket: () => {
        const state = get();
        if (state.socket?.connected || state.wsConnecting) return;

        set({ wsConnecting: true, error: null });

        try {
          const socket = io('http://localhost:3001', {
            transports: ['websocket'],
            timeout: 5000,
            forceNew: true
          });

          socket.on('connect', () => {
            console.log('WebSocket connected to prospect updates');
            set({
              socket,
              wsConnected: true,
              wsConnecting: false,
              error: null
            });

            // Subscribe to changes automatically on connect
            get().subscribeToChanges();
          });

          socket.on('disconnect', (reason) => {
            console.log('WebSocket disconnected:', reason);
            set({ wsConnected: false });
          });

          socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            set({
              wsConnecting: false,
              wsConnected: false,
              error: 'Failed to connect to real-time updates'
            });
          });

          set({ socket });
        } catch (error) {
          console.error('Failed to create WebSocket connection:', error);
          set({
            wsConnecting: false,
            error: 'Failed to initialize real-time updates'
          });
        }
      },

      disconnectWebSocket: () => {
        const state = get();
        if (state.socket) {
          state.socket.disconnect();
          set({
            socket: null,
            wsConnected: false,
            wsConnecting: false
          });
        }
      },

      // Real-time event subscriptions
      subscribeToChanges: () => {
        const state = get();
        if (!state.socket) return;

        // Listen for prospect updates
        state.socket.on('prospect:updated', (data) => {
          const { prospectId, updates } = data;
          set((state) => ({
            prospects: state.prospects.map(p =>
              p.id === prospectId ? { ...p, ...updates } : p
            )
          }));

          get().addNotification({
            type: 'info',
            message: `Prospect ${updates.business?.name || prospectId} updated`
          });
        });

        // Listen for prospect stage changes
        state.socket.on('prospect:stage_changed', (data) => {
          const { prospectId, newStage, oldStage } = data;
          set((state) => ({
            prospects: state.prospects.map(p =>
              p.id === prospectId ? { ...p, pipelineStage: newStage } : p
            )
          }));

          get().addNotification({
            type: 'success',
            message: `Prospect moved from ${oldStage} to ${newStage}`
          });
        });

        // Listen for new prospects
        state.socket.on('prospect:created', (data) => {
          const newProspect = convertToIProspect(data.prospect);
          set((state) => ({
            prospects: [...state.prospects, newProspect]
          }));

          get().addNotification({
            type: 'success',
            message: `New prospect added: ${newProspect.business.name}`
          });
        });

        // Listen for research progress
        state.socket.on('research:progress', (data) => {
          const { prospectId, stage, progress } = data;

          get().addNotification({
            type: 'info',
            message: `Research ${stage} (${progress}%) for prospect ${prospectId}`
          });
        });

        state.socket.on('research:completed', (data) => {
          const { prospectId, success } = data;

          if (success) {
            // Refresh prospect data
            get().fetchProspects();

            get().addNotification({
              type: 'success',
              message: `Research completed for prospect ${prospectId}`
            });
          }
        });

        // System alerts
        state.socket.on('system:alert', (data) => {
          const { level, message } = data;
          get().addNotification({
            type: level === 'error' ? 'error' : level === 'warning' ? 'warning' : 'info',
            message
          });
        });

        console.log('Subscribed to real-time prospect updates');
      },

      unsubscribeFromChanges: () => {
        const state = get();
        if (state.socket) {
          state.socket.off('prospect:updated');
          state.socket.off('prospect:stage_changed');
          state.socket.off('prospect:created');
          state.socket.off('research:progress');
          state.socket.off('research:completed');
          state.socket.off('system:alert');
          console.log('Unsubscribed from real-time updates');
        }
      },
      
      // Research
      researchQueue: [],
      addToResearchQueue: (prospectId) => set((state) => ({
        researchQueue: [...state.researchQueue, prospectId]
      })),
      removeFromResearchQueue: (prospectId) => set((state) => ({
        researchQueue: state.researchQueue.filter(id => id !== prospectId)
      })),
      isResearching: false,
      setIsResearching: (researching) => set({ isResearching: researching }),

      // Notifications
      notifications: [],
      addNotification: (notification) => {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newNotification = {
          ...notification,
          id,
          timestamp: new Date()
        };

        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }));

        // Auto-remove info notifications after 5 seconds
        if (notification.type === 'info') {
          setTimeout(() => {
            get().removeNotification(id);
          }, 5000);
        } else if (notification.type === 'success') {
          setTimeout(() => {
            get().removeNotification(id);
          }, 3000);
        }
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      },
      
      // Computed values
      getFilteredProspects: () => {
        const state = get();
        let filtered = [...state.prospects];
        
        // Stage filter
        if (state.stageFilter !== 'all') {
          filtered = filtered.filter(p => p.pipelineStage === state.stageFilter);
        }
        
        // Industry filter
        if (state.industryFilter !== 'all') {
          filtered = filtered.filter(p => p.business.industry === state.industryFilter);
        }
        
        // Search
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase();
          filtered = filtered.filter(p => 
            p.business.name.toLowerCase().includes(query) ||
            p.contact.primaryContact.toLowerCase().includes(query) ||
            p.business.location.city.toLowerCase().includes(query)
          );
        }
        
        return filtered;
      },
      
      getStageCount: (stage) => {
        const state = get();
        if (stage === 'cold') {
          return state.prospects.filter(p => p.temperature === 'cold').length;
        }
        return state.prospects.filter(p => p.pipelineStage === stage).length;
      },
    }),
    {
      name: 'pipeline-store'
    }
  )
);