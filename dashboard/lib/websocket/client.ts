import { io, Socket } from 'socket.io-client';

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
}

export interface WebSocketEvents {
  // Research events
  'research:started': (data: { prospectId: string; businessName: string }) => void;
  'research:progress': (data: { prospectId: string; stage: string; progress: number }) => void;
  'research:completed': (data: { prospectId: string; success: boolean }) => void;
  
  // Call events
  'call:initiated': (data: { callId: string; prospectId: string }) => void;
  'call:connected': (data: { callId: string; duration: number }) => void;
  'call:ended': (data: { callId: string; outcome: string; duration: number }) => void;
  
  // Campaign events
  'campaign:started': (data: { campaignId: string; name: string }) => void;
  'campaign:progress': (data: { campaignId: string; completed: number; total: number }) => void;
  'campaign:completed': (data: { campaignId: string; success: number; failed: number }) => void;
  
  // System events
  'system:alert': (data: { level: 'info' | 'warning' | 'error'; message: string }) => void;
  'system:metric': (data: { name: string; value: number }) => void;
}

class WebSocketClient {
  private socket: Socket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private listeners: Map<string, Set<Function>> = new Map();
  
  constructor(url: string = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001') {
    this.url = url;
  }
  
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }
      
      this.socket = io(this.url, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });
      
      this.socket.on('connect', () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        resolve();
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Max reconnection attempts reached'));
        }
      });
      
      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        
        // Attempt to reconnect unless explicitly disconnected
        if (reason !== 'io client disconnect') {
          setTimeout(() => this.connect(), this.reconnectDelay);
        }
      });
      
      // Set up event forwarding
      this.setupEventForwarding();
    });
  }
  
  private setupEventForwarding() {
    if (!this.socket) return;
    
    // Forward all custom events to registered listeners
    const events: (keyof WebSocketEvents)[] = [
      'research:started',
      'research:progress',
      'research:completed',
      'call:initiated',
      'call:connected',
      'call:ended',
      'campaign:started',
      'campaign:progress',
      'campaign:completed',
      'system:alert',
      'system:metric'
    ];
    
    events.forEach(event => {
      this.socket!.on(event, (data: any) => {
        this.emit(event, data);
      });
    });
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  emit(event: string, data: any) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }
  
  on<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as Function);
    
    // Also register with socket.io if connected
    if (this.socket?.connected) {
      this.socket.on(event, callback as any);
    }
  }
  
  off<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback as Function);
    }
    
    // Also unregister from socket.io
    if (this.socket) {
      this.socket.off(event, callback as any);
    }
  }
  
  send(type: string, payload: any) {
    if (this.socket?.connected) {
      const message: WebSocketMessage = {
        type,
        payload,
        timestamp: new Date().toISOString()
      };
      this.socket.emit('message', message);
    } else {
      console.warn('WebSocket not connected. Message not sent:', type);
    }
  }
  
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
  
  getConnectionState(): 'connected' | 'disconnected' | 'connecting' {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    return 'connecting';
  }
}

// Export singleton instance
export const wsClient = new WebSocketClient();

// Export hook for React components
import { useEffect, useState } from 'react';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(wsClient.isConnected());
  const [connectionState, setConnectionState] = useState(wsClient.getConnectionState());
  
  useEffect(() => {
    // Connect on mount
    wsClient.connect().catch(console.error);
    
    // Update connection state
    const checkConnection = setInterval(() => {
      setIsConnected(wsClient.isConnected());
      setConnectionState(wsClient.getConnectionState());
    }, 1000);
    
    return () => {
      clearInterval(checkConnection);
    };
  }, []);
  
  return {
    isConnected,
    connectionState,
    on: wsClient.on.bind(wsClient),
    off: wsClient.off.bind(wsClient),
    send: wsClient.send.bind(wsClient),
    disconnect: wsClient.disconnect.bind(wsClient),
    connect: wsClient.connect.bind(wsClient)
  };
}