'use client';

import { useEffect, useState, useRef } from 'react';
import { Phone, PhoneCall, PhoneOff, Clock, User, Activity, Mic, MicOff, Volume2 } from 'lucide-react';

interface ActiveCall {
  id: string;
  vapi_call_id: string;
  prospect_id?: string;
  business_name?: string;
  contact_name?: string;
  contact_phone?: string;
  status: string;
  started_at: string;
  duration: number;
  assistant_name?: string;
  transcript?: string[];
  is_muted?: boolean;
  volume_level?: number;
}

interface CallEvent {
  type: 'call.started' | 'call.updated' | 'call.ended' | 'transcript.update' | 'status.change';
  callId: string;
  data: any;
  timestamp: string;
}

export default function MonitoringPage() {
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([]);
  const [recentEvents, setRecentEvents] = useState<CallEvent[]>([]);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [selectedCall, setSelectedCall] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    connectWebSocket();
    
    // Fetch initial active calls
    fetchActiveCalls();
    
    // Update call durations every second
    intervalRef.current = setInterval(updateCallDurations, 1000);
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      // In production, this would connect to your actual WebSocket server
      // For now, we'll simulate with a placeholder
      const ws = new WebSocket('ws://localhost:3001/monitoring');
      
      ws.onopen = () => {
        setWsStatus('connected');
        console.log('Connected to monitoring WebSocket');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsStatus('disconnected');
      };
      
      ws.onclose = () => {
        setWsStatus('disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };
      
      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setWsStatus('disconnected');
      // Fallback to polling mode
      startPolling();
    }
  };

  const startPolling = () => {
    // Fallback polling mechanism if WebSocket is unavailable
    setInterval(fetchActiveCalls, 5000);
  };

  const handleWebSocketMessage = (message: any) => {
    const event: CallEvent = {
      type: message.type,
      callId: message.callId,
      data: message.data,
      timestamp: new Date().toISOString()
    };
    
    // Add to recent events
    setRecentEvents(prev => [event, ...prev].slice(0, 50));
    
    // Update active calls based on event type
    switch (message.type) {
      case 'call.started':
        setActiveCalls(prev => [...prev, message.data]);
        break;
      case 'call.updated':
        setActiveCalls(prev => prev.map(call => 
          call.vapi_call_id === message.callId ? { ...call, ...message.data } : call
        ));
        break;
      case 'call.ended':
        setActiveCalls(prev => prev.filter(call => call.vapi_call_id !== message.callId));
        break;
      case 'transcript.update':
        setActiveCalls(prev => prev.map(call => {
          if (call.vapi_call_id === message.callId) {
            return {
              ...call,
              transcript: [...(call.transcript || []), message.data.text]
            };
          }
          return call;
        }));
        break;
    }
  };

  const fetchActiveCalls = async () => {
    try {
      const response = await fetch('/api/vapi/calls?status=in-progress&limit=50');
      const data = await response.json();
      
      // Transform the data to match our ActiveCall interface
      const transformedCalls = data.calls.map((call: any) => ({
        id: call.id,
        vapi_call_id: call.vapi_call_id,
        prospect_id: call.prospect_id,
        business_name: call.business_name,
        contact_name: call.contact_name,
        contact_phone: call.contact_phone,
        status: call.vapi_status,
        started_at: call.created_at,
        duration: call.duration || 0,
        assistant_name: call.assistant_id
      }));
      
      setActiveCalls(transformedCalls);
    } catch (error) {
      console.error('Error fetching active calls:', error);
    }
  };

  const updateCallDurations = () => {
    setActiveCalls(prev => prev.map(call => {
      if (call.status === 'in-progress') {
        const startTime = new Date(call.started_at).getTime();
        const now = new Date().getTime();
        const duration = Math.floor((now - startTime) / 1000);
        return { ...call, duration };
      }
      return call;
    }));
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'text-green-600 bg-green-100';
      case 'ringing':
        return 'text-blue-600 bg-blue-100';
      case 'queued':
        return 'text-yellow-600 bg-yellow-100';
      case 'ended':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-progress':
        return <PhoneCall className="h-4 w-4" />;
      case 'ringing':
        return <Phone className="h-4 w-4 animate-pulse" />;
      case 'ended':
        return <PhoneOff className="h-4 w-4" />;
      default:
        return <Phone className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Real-Time Call Monitoring</h1>
              <p className="text-gray-600 mt-2">Monitor active calls and system activity</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center px-3 py-1 rounded-full ${
                wsStatus === 'connected' ? 'bg-green-100 text-green-800' :
                wsStatus === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                <div className={`h-2 w-2 rounded-full mr-2 ${
                  wsStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                  wsStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium">
                  {wsStatus === 'connected' ? 'Live' :
                   wsStatus === 'connecting' ? 'Connecting...' :
                   'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <PhoneCall className="h-8 w-8 text-green-500" />
              <span className="text-3xl font-bold text-gray-900">
                {activeCalls.filter(c => c.status === 'in-progress').length}
              </span>
            </div>
            <p className="text-gray-600 mt-2">Active Calls</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <Phone className="h-8 w-8 text-blue-500" />
              <span className="text-3xl font-bold text-gray-900">
                {activeCalls.filter(c => c.status === 'ringing').length}
              </span>
            </div>
            <p className="text-gray-600 mt-2">Ringing</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <Clock className="h-8 w-8 text-purple-500" />
              <span className="text-3xl font-bold text-gray-900">
                {activeCalls.filter(c => c.status === 'queued').length}
              </span>
            </div>
            <p className="text-gray-600 mt-2">Queued</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <Activity className="h-8 w-8 text-orange-500" />
              <span className="text-3xl font-bold text-gray-900">
                {recentEvents.length}
              </span>
            </div>
            <p className="text-gray-600 mt-2">Recent Events</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Calls List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Calls</h2>
            {activeCalls.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active calls at the moment</p>
              </div>
            ) : (
              activeCalls.map(call => (
                <div 
                  key={call.vapi_call_id}
                  className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all ${
                    selectedCall === call.vapi_call_id ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedCall(call.vapi_call_id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                          {getStatusIcon(call.status)}
                          <span className="ml-1">{call.status}</span>
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDuration(call.duration)}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900">
                        {call.business_name || 'Unknown Business'}
                      </h3>
                      
                      <div className="mt-2 space-y-1">
                        {call.contact_name && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {call.contact_name}
                          </p>
                        )}
                        {call.contact_phone && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {call.contact_phone}
                          </p>
                        )}
                      </div>
                      
                      {/* Live Transcript Preview */}
                      {call.transcript && call.transcript.length > 0 && (
                        <div className="mt-4 p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-700">
                            "{call.transcript[call.transcript.length - 1]}"
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Audio Indicators */}
                    <div className="flex flex-col items-center space-y-2 ml-4">
                      {call.is_muted ? (
                        <MicOff className="h-5 w-5 text-red-500" />
                      ) : (
                        <Mic className="h-5 w-5 text-green-500" />
                      )}
                      <div className="flex items-center">
                        <Volume2 className="h-4 w-4 text-gray-500 mr-1" />
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${(call.volume_level || 0) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Recent Events */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Events</h2>
            <div className="bg-white rounded-lg shadow max-h-[600px] overflow-y-auto">
              {recentEvents.length === 0 ? (
                <div className="p-8 text-center">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent events</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentEvents.map((event, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {event.type.replace('.', ' ').replace(/_/g, ' ').toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Call ID: {event.callId.slice(0, 8)}...
                          </p>
                          {event.data && event.data.message && (
                            <p className="text-xs text-gray-600 mt-2">
                              {event.data.message}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}