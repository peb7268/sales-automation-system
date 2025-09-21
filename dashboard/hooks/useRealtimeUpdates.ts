import { useEffect, useState } from 'react';
import { useWebSocket } from '@/lib/websocket/client';
import { usePipelineStore } from '@/stores/usePipelineStore';
import { useDashboardStore } from '@/stores/useDashboardStore';

export function useRealtimeUpdates() {
  const { isConnected, on, off, send } = useWebSocket();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    level: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
  }>>([]);

  const pipelineStore = usePipelineStore();
  const dashboardStore = useDashboardStore();

  useEffect(() => {
    if (!isConnected) return;

    // Research event handlers
    const handleResearchStarted = (data: any) => {
      console.log('Research started:', data);
      pipelineStore.addToResearchQueue(data.prospectId);
      pipelineStore.setIsResearching(true);
      setLastUpdate(new Date());
    };

    const handleResearchProgress = (data: any) => {
      console.log('Research progress:', data);
      // Update UI with progress
      setLastUpdate(new Date());
    };

    const handleResearchCompleted = (data: any) => {
      console.log('Research completed:', data);
      pipelineStore.removeFromResearchQueue(data.prospectId);
      
      // Check if more in queue
      if (pipelineStore.researchQueue.length === 0) {
        pipelineStore.setIsResearching(false);
      }
      setLastUpdate(new Date());
    };

    // Call event handlers
    const handleCallInitiated = (data: any) => {
      console.log('Call initiated:', data);
      dashboardStore.incrementMetric('callsToday');
      setLastUpdate(new Date());
    };

    const handleCallEnded = (data: any) => {
      console.log('Call ended:', data);
      
      // Update prospect if qualified or interested
      if (data.outcome === 'qualified' || data.outcome === 'interested') {
        const newStage = data.outcome === 'qualified' ? 'qualified' : 'interested';
        pipelineStore.moveProspect(data.prospectId, newStage);
        
        if (data.outcome === 'qualified') {
          dashboardStore.incrementMetric('qualifiedLeads');
        }
      }
      setLastUpdate(new Date());
    };

    // System event handlers  
    const handleSystemAlert = (data: any) => {
      const alert = {
        id: `alert-${Date.now()}`,
        level: data.level,
        message: data.message,
        timestamp: data.timestamp
      };
      
      setAlerts(prev => [...prev.slice(-9), alert]); // Keep last 10 alerts
      setLastUpdate(new Date());
    };

    const handleSystemMetric = (data: any) => {
      console.log('System metric:', data);
      // Update dashboard metrics
      if (data.name === 'active_connections') {
        dashboardStore.setMetric('activeConnections', data.value);
      }
      setLastUpdate(new Date());
    };

    // Register event listeners
    on('research:started', handleResearchStarted);
    on('research:progress', handleResearchProgress);
    on('research:completed', handleResearchCompleted);
    on('call:initiated', handleCallInitiated);
    on('call:ended', handleCallEnded);
    on('system:alert', handleSystemAlert);
    on('system:metric', handleSystemMetric);

    // Cleanup
    return () => {
      off('research:started', handleResearchStarted);
      off('research:progress', handleResearchProgress);
      off('research:completed', handleResearchCompleted);
      off('call:initiated', handleCallInitiated);
      off('call:ended', handleCallEnded);
      off('system:alert', handleSystemAlert);
      off('system:metric', handleSystemMetric);
    };
  }, [isConnected, pipelineStore, dashboardStore, on, off]);

  // Helper functions
  const startResearch = (prospectId: string, businessName: string) => {
    send('research:start', { prospectId, businessName });
  };

  const startCall = (prospectId: string) => {
    send('call:start', { prospectId });
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  return {
    isConnected,
    lastUpdate,
    alerts,
    startResearch,
    startCall,
    clearAlerts,
    dismissAlert
  };
}