import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ICallRecord, ICallCampaign, CallStatus, CallOutcome } from '@/types';
import { mockCalls, getRecentCalls } from '@/lib/mock-data/calls';
import { mockCampaigns, getActiveCampaigns } from '@/lib/mock-data/campaigns';

interface CallerState {
  // Calls
  calls: ICallRecord[];
  activeCalls: ICallRecord[];
  selectedCall: ICallRecord | null;
  setSelectedCall: (call: ICallRecord | null) => void;
  
  // Campaigns
  campaigns: ICallCampaign[];
  selectedCampaign: ICallCampaign | null;
  setSelectedCampaign: (campaign: ICallCampaign | null) => void;
  
  // Filtering
  statusFilter: CallStatus | 'all';
  setStatusFilter: (status: CallStatus | 'all') => void;
  outcomeFilter: CallOutcome | 'all';
  setOutcomeFilter: (outcome: CallOutcome | 'all') => void;
  campaignFilter: string | 'all';
  setCampaignFilter: (campaignId: string | 'all') => void;
  dateRange: { start: Date; end: Date } | null;
  setDateRange: (range: { start: Date; end: Date } | null) => void;
  
  // Live monitoring
  isMonitoring: boolean;
  toggleMonitoring: () => void;
  currentTranscript: string;
  updateTranscript: (text: string) => void;
  
  // Campaign actions
  startCampaign: (campaignId: string) => void;
  pauseCampaign: (campaignId: string) => void;
  stopCampaign: (campaignId: string) => void;
  
  // Call actions
  initiateCall: (prospectId: string, campaignId?: string) => void;
  endCall: (callId: string, outcome: CallOutcome) => void;
  scheduleCallback: (callId: string, date: Date) => void;
  
  // Analytics view
  analyticsView: 'overview' | 'campaigns' | 'performance' | 'scripts';
  setAnalyticsView: (view: CallerState['analyticsView']) => void;
  
  // Script testing
  testScriptId: string | null;
  setTestScriptId: (scriptId: string | null) => void;
  testResults: Array<{ scriptId: string; score: number; feedback: string }>;
  addTestResult: (result: { scriptId: string; score: number; feedback: string }) => void;
  
  // Computed values
  getFilteredCalls: () => ICallRecord[];
  getCallsByStatus: (status: CallStatus) => ICallRecord[];
  getActiveCampaignsCount: () => number;
  getTodaysCalls: () => ICallRecord[];
}

export const useCallerStore = create<CallerState>()(
  devtools(
    (set, get) => ({
      // Calls
      calls: mockCalls,
      activeCalls: [],
      selectedCall: null,
      setSelectedCall: (call) => set({ selectedCall: call }),
      
      // Campaigns
      campaigns: mockCampaigns,
      selectedCampaign: null,
      setSelectedCampaign: (campaign) => set({ selectedCampaign: campaign }),
      
      // Filtering
      statusFilter: 'all',
      setStatusFilter: (status) => set({ statusFilter: status }),
      outcomeFilter: 'all',
      setOutcomeFilter: (outcome) => set({ outcomeFilter: outcome }),
      campaignFilter: 'all',
      setCampaignFilter: (campaignId) => set({ campaignFilter: campaignId }),
      dateRange: null,
      setDateRange: (range) => set({ dateRange: range }),
      
      // Live monitoring
      isMonitoring: false,
      toggleMonitoring: () => set((state) => ({ isMonitoring: !state.isMonitoring })),
      currentTranscript: '',
      updateTranscript: (text) => set({ currentTranscript: text }),
      
      // Campaign actions
      startCampaign: (campaignId) => set((state) => ({
        campaigns: state.campaigns.map(c => 
          c.id === campaignId ? { ...c, status: 'active' as const } : c
        )
      })),
      
      pauseCampaign: (campaignId) => set((state) => ({
        campaigns: state.campaigns.map(c => 
          c.id === campaignId ? { ...c, status: 'paused' as const } : c
        )
      })),
      
      stopCampaign: (campaignId) => set((state) => ({
        campaigns: state.campaigns.map(c => 
          c.id === campaignId ? { ...c, status: 'completed' as const } : c
        )
      })),
      
      // Call actions
      initiateCall: (prospectId, campaignId) => {
        const newCall: ICallRecord = {
          id: `call-${Date.now()}`,
          prospectId,
          campaignId,
          startedAt: new Date(),
          duration: 0,
          phoneNumber: '+1234567890',
          prospectName: 'New Prospect',
          companyName: 'New Company',
          industry: 'retail',
          status: 'in_progress',
          meetingScheduled: false,
        };
        
        set((state) => ({
          calls: [...state.calls, newCall],
          activeCalls: [...state.activeCalls, newCall],
        }));
      },
      
      endCall: (callId, outcome) => set((state) => ({
        calls: state.calls.map(c => 
          c.id === callId 
            ? { ...c, status: 'completed' as CallStatus, outcome, endedAt: new Date() }
            : c
        ),
        activeCalls: state.activeCalls.filter(c => c.id !== callId),
      })),
      
      scheduleCallback: (callId, date) => set((state) => ({
        calls: state.calls.map(c => 
          c.id === callId 
            ? { ...c, scheduledAt: date, nextAction: 'call_back_later' as const }
            : c
        )
      })),
      
      // Analytics
      analyticsView: 'overview',
      setAnalyticsView: (view) => set({ analyticsView: view }),
      
      // Script testing
      testScriptId: null,
      setTestScriptId: (scriptId) => set({ testScriptId: scriptId }),
      testResults: [],
      addTestResult: (result) => set((state) => ({
        testResults: [...state.testResults, result]
      })),
      
      // Computed values
      getFilteredCalls: () => {
        const state = get();
        let filtered = [...state.calls];
        
        // Status filter
        if (state.statusFilter !== 'all') {
          filtered = filtered.filter(c => c.status === state.statusFilter);
        }
        
        // Outcome filter
        if (state.outcomeFilter !== 'all') {
          filtered = filtered.filter(c => c.outcome === state.outcomeFilter);
        }
        
        // Campaign filter
        if (state.campaignFilter !== 'all') {
          filtered = filtered.filter(c => c.campaignId === state.campaignFilter);
        }
        
        // Date range filter
        if (state.dateRange) {
          filtered = filtered.filter(c => 
            c.startedAt >= state.dateRange!.start && 
            c.startedAt <= state.dateRange!.end
          );
        }
        
        // Sort by most recent first
        filtered.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
        
        return filtered;
      },
      
      getCallsByStatus: (status) => {
        const state = get();
        return state.calls.filter(c => c.status === status);
      },
      
      getActiveCampaignsCount: () => {
        const state = get();
        return state.campaigns.filter(c => c.status === 'active').length;
      },
      
      getTodaysCalls: () => {
        const state = get();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return state.calls.filter(c => c.startedAt >= today);
      },
    })
  )
);

// Simulate live calls
if (typeof window !== 'undefined') {
  setInterval(() => {
    const state = useCallerStore.getState();
    
    // Simulate transcript updates for active calls
    if (state.isMonitoring && state.activeCalls.length > 0) {
      const phrases = [
        'Thank you for taking my call today...',
        'I understand you\'re busy, so I\'ll be brief...',
        'We help businesses like yours improve their online presence...',
        'Would you be interested in learning more?',
        'What challenges are you currently facing with your marketing?',
      ];
      
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      state.updateTranscript(state.currentTranscript + '\n' + randomPhrase);
    }
    
    // Simulate call status updates
    if (state.activeCalls.length > 0 && Math.random() > 0.7) {
      const randomCall = state.activeCalls[Math.floor(Math.random() * state.activeCalls.length)];
      const outcomes: CallOutcome[] = ['qualified', 'not_qualified', 'callback_requested', 'meeting_scheduled'];
      const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      
      state.endCall(randomCall.id, randomOutcome);
    }
  }, 3000);
}