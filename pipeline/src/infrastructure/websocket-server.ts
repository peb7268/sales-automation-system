/**
 * WebSocket Server - Real-time agent communication
 * Handles immediate communication between agents and orchestration system
 */

import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { logger } from '@utils/logging';

export interface AgentMessage {
  type: 'task_request' | 'task_completion' | 'status_update' | 'error_report' | 'heartbeat';
  agent_id: string;
  task_id?: string;
  data?: any;
  priority: 'high' | 'medium' | 'low';
  requires_response: boolean;
  timestamp: string;
  correlation_id?: string;
}

export interface ConnectedAgent {
  id: string;
  type: 'prospecting' | 'pitch_creator' | 'voice_ai' | 'email_automation' | 'orchestrator' | 'claude_code';
  socket: WebSocket;
  last_heartbeat: Date;
  status: 'active' | 'idle' | 'busy' | 'error';
}

export class WebSocketAgentServer extends EventEmitter {
  private server: WebSocketServer;
  private connectedAgents: Map<string, ConnectedAgent> = new Map();
  private messageQueue: Map<string, AgentMessage[]> = new Map();
  private heartbeatInterval: NodeJS.Timeout;

  constructor(port: number = 8080) {
    super();
    
    this.server = new WebSocketServer({ 
      port,
      perMessageDeflate: false,
      maxPayload: 1024 * 1024 // 1MB max message size
    });

    this.setupServer();
    this.startHeartbeatMonitoring();
    
    logger.info(`🔌 WebSocket Agent Server started on port ${port}`);
  }

  /**
   * Setup WebSocket server event handlers
   */
  private setupServer(): void {
    this.server.on('connection', (socket: WebSocket, request) => {
      logger.info('🔗 New agent connection attempt');
      
      socket.on('message', async (data: Buffer) => {
        try {
          const message: AgentMessage = JSON.parse(data.toString());
          await this.handleMessage(socket, message);
        } catch (error) {
          logger.error('Failed to parse agent message:', error);
          this.sendError(socket, 'Invalid message format');
        }
      });

      socket.on('close', (code: number, reason: Buffer) => {
        const agent = this.findAgentBySocket(socket);
        if (agent) {
          logger.info(`🔌 Agent ${agent.id} disconnected: ${code} - ${reason.toString()}`);
          this.connectedAgents.delete(agent.id);
          this.emit('agent_disconnected', agent);
        }
      });

      socket.on('error', (error: Error) => {
        const agent = this.findAgentBySocket(socket);
        logger.error(`WebSocket error for agent ${agent?.id || 'unknown'}:`, error);
      });

      // Send connection confirmation
      this.sendMessage(socket, {
        type: 'status_update',
        agent_id: 'server',
        data: { status: 'connected', message: 'Please identify yourself' },
        priority: 'high',
        requires_response: true,
        timestamp: new Date().toISOString()
      });
    });

    this.server.on('error', (error: Error) => {
      logger.error('WebSocket server error:', error);
    });
  }

  /**
   * Handle incoming messages from agents
   */
  private async handleMessage(socket: WebSocket, message: AgentMessage): Promise<void> {
    try {
      switch (message.type) {
        case 'heartbeat':
          await this.handleHeartbeat(socket, message);
          break;
          
        case 'task_request':
          await this.handleTaskRequest(socket, message);
          break;
          
        case 'task_completion':
          await this.handleTaskCompletion(socket, message);
          break;
          
        case 'status_update':
          await this.handleStatusUpdate(socket, message);
          break;
          
        case 'error_report':
          await this.handleErrorReport(socket, message);
          break;
          
        default:
          logger.warn(`Unknown message type: ${message.type} from agent ${message.agent_id}`);
      }

      // Emit message for other components to handle
      this.emit('agent_message', { socket, message });
      
    } catch (error) {
      logger.error('Error handling agent message:', error);
      this.sendError(socket, 'Failed to process message');
    }
  }

  /**
   * Handle agent heartbeat messages
   */
  private async handleHeartbeat(socket: WebSocket, message: AgentMessage): Promise<void> {
    const agent = this.connectedAgents.get(message.agent_id);
    
    if (!agent) {
      // New agent registration
      await this.registerAgent(socket, message);
    } else {
      // Update existing agent heartbeat
      agent.last_heartbeat = new Date();
      if (message.data?.status) {
        agent.status = message.data.status;
      }
    }

    // Send heartbeat response
    this.sendMessage(socket, {
      type: 'heartbeat',
      agent_id: 'server',
      data: { status: 'acknowledged', server_time: new Date().toISOString() },
      priority: 'low',
      requires_response: false,
      timestamp: new Date().toISOString(),
      correlation_id: message.correlation_id
    });
  }

  /**
   * Register a new agent
   */
  private async registerAgent(socket: WebSocket, message: AgentMessage): Promise<void> {
    const agentType = message.data?.type || 'unknown';
    
    const agent: ConnectedAgent = {
      id: message.agent_id,
      type: agentType,
      socket,
      last_heartbeat: new Date(),
      status: 'active'
    };

    this.connectedAgents.set(message.agent_id, agent);
    this.messageQueue.set(message.agent_id, []);

    logger.info(`✅ Registered agent: ${message.agent_id} (${agentType})`);
    
    // Send registration confirmation
    this.sendMessage(socket, {
      type: 'status_update',
      agent_id: 'server',
      data: { 
        status: 'registered', 
        message: `Agent ${message.agent_id} registered successfully`,
        agent_count: this.connectedAgents.size
      },
      priority: 'high',
      requires_response: false,
      timestamp: new Date().toISOString()
    });

    this.emit('agent_registered', agent);
  }

  /**
   * Handle task request from agent
   */
  private async handleTaskRequest(socket: WebSocket, message: AgentMessage): Promise<void> {
    logger.info(`📝 Task request from ${message.agent_id}: ${message.task_id}`);
    
    const agent = this.connectedAgents.get(message.agent_id);
    if (agent) {
      agent.status = 'busy';
    }

    // Forward to orchestration system
    this.emit('task_requested', {
      agent_id: message.agent_id,
      task_id: message.task_id,
      data: message.data,
      priority: message.priority
    });

    // Send acknowledgment
    if (message.requires_response) {
      this.sendMessage(socket, {
        type: 'status_update',
        agent_id: 'server',
        data: { status: 'task_acknowledged', task_id: message.task_id },
        priority: 'medium',
        requires_response: false,
        timestamp: new Date().toISOString(),
        correlation_id: message.correlation_id
      });
    }
  }

  /**
   * Handle task completion from agent
   */
  private async handleTaskCompletion(socket: WebSocket, message: AgentMessage): Promise<void> {
    logger.info(`✅ Task completion from ${message.agent_id}: ${message.task_id}`);
    
    const agent = this.connectedAgents.get(message.agent_id);
    if (agent) {
      agent.status = 'idle';
    }

    // Forward to orchestration system
    this.emit('task_completed', {
      agent_id: message.agent_id,
      task_id: message.task_id,
      result: message.data,
      completion_time: message.timestamp
    });

    // Send acknowledgment
    if (message.requires_response) {
      this.sendMessage(socket, {
        type: 'status_update',
        agent_id: 'server',
        data: { status: 'completion_acknowledged', task_id: message.task_id },
        priority: 'medium',
        requires_response: false,
        timestamp: new Date().toISOString(),
        correlation_id: message.correlation_id
      });
    }
  }

  /**
   * Handle status update from agent
   */
  private async handleStatusUpdate(socket: WebSocket, message: AgentMessage): Promise<void> {
    const agent = this.connectedAgents.get(message.agent_id);
    if (agent && message.data?.status) {
      agent.status = message.data.status;
      logger.debug(`📊 Status update from ${message.agent_id}: ${message.data.status}`);
    }

    this.emit('agent_status_updated', {
      agent_id: message.agent_id,
      status: message.data?.status,
      additional_data: message.data
    });
  }

  /**
   * Handle error report from agent
   */
  private async handleErrorReport(socket: WebSocket, message: AgentMessage): Promise<void> {
    logger.error(`❌ Error report from ${message.agent_id}:`, message.data);
    
    const agent = this.connectedAgents.get(message.agent_id);
    if (agent) {
      agent.status = 'error';
    }

    this.emit('agent_error', {
      agent_id: message.agent_id,
      task_id: message.task_id,
      error: message.data,
      timestamp: message.timestamp
    });

    // Send error acknowledgment
    this.sendMessage(socket, {
      type: 'status_update',
      agent_id: 'server',
      data: { status: 'error_acknowledged', message: 'Error logged and being processed' },
      priority: 'high',
      requires_response: false,
      timestamp: new Date().toISOString(),
      correlation_id: message.correlation_id
    });
  }

  /**
   * Send message to specific agent
   */
  sendMessageToAgent(agentId: string, message: Omit<AgentMessage, 'agent_id' | 'timestamp'>): boolean {
    const agent = this.connectedAgents.get(agentId);
    if (!agent || agent.socket.readyState !== WebSocket.OPEN) {
      logger.warn(`Cannot send message to agent ${agentId}: not connected`);
      return false;
    }

    const fullMessage: AgentMessage = {
      ...message,
      agent_id: 'server',
      timestamp: new Date().toISOString()
    };

    return this.sendMessage(agent.socket, fullMessage);
  }

  /**
   * Broadcast message to all connected agents
   */
  broadcastMessage(message: Omit<AgentMessage, 'agent_id' | 'timestamp'>, excludeAgent?: string): number {
    let sentCount = 0;
    
    for (const [agentId, agent] of this.connectedAgents) {
      if (excludeAgent && agentId === excludeAgent) continue;
      
      if (this.sendMessageToAgent(agentId, message)) {
        sentCount++;
      }
    }

    return sentCount;
  }

  /**
   * Send message to specific socket
   */
  private sendMessage(socket: WebSocket, message: AgentMessage): boolean {
    try {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to send WebSocket message:', error);
      return false;
    }
  }

  /**
   * Send error message to socket
   */
  private sendError(socket: WebSocket, errorMessage: string): void {
    this.sendMessage(socket, {
      type: 'error_report',
      agent_id: 'server',
      data: { error: errorMessage },
      priority: 'high',
      requires_response: false,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeatMonitoring(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = new Date();
      const timeoutMs = 60000; // 1 minute timeout
      
      for (const [agentId, agent] of this.connectedAgents) {
        const timeSinceLastHeartbeat = now.getTime() - agent.last_heartbeat.getTime();
        
        if (timeSinceLastHeartbeat > timeoutMs) {
          logger.warn(`💔 Agent ${agentId} heartbeat timeout, removing connection`);
          
          try {
            agent.socket.close();
          } catch (error) {
            // Socket may already be closed
          }
          
          this.connectedAgents.delete(agentId);
          this.messageQueue.delete(agentId);
          this.emit('agent_timeout', agent);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Find agent by socket connection
   */
  private findAgentBySocket(socket: WebSocket): ConnectedAgent | undefined {
    for (const agent of this.connectedAgents.values()) {
      if (agent.socket === socket) {
        return agent;
      }
    }
    return undefined;
  }

  /**
   * Get all connected agents
   */
  getConnectedAgents(): ConnectedAgent[] {
    return Array.from(this.connectedAgents.values());
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): ConnectedAgent | undefined {
    return this.connectedAgents.get(agentId);
  }

  /**
   * Get system status
   */
  getStatus(): {
    connected_agents: number;
    active_agents: number;
    idle_agents: number;
    busy_agents: number;
    error_agents: number;
    uptime: number;
  } {
    const agents = Array.from(this.connectedAgents.values());
    
    return {
      connected_agents: agents.length,
      active_agents: agents.filter(a => a.status === 'active').length,
      idle_agents: agents.filter(a => a.status === 'idle').length,
      busy_agents: agents.filter(a => a.status === 'busy').length,
      error_agents: agents.filter(a => a.status === 'error').length,
      uptime: process.uptime()
    };
  }

  /**
   * Shutdown the WebSocket server
   */
  async shutdown(): Promise<void> {
    logger.info('🛑 Shutting down WebSocket Agent Server...');
    
    // Clear heartbeat interval
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Close all agent connections gracefully
    for (const agent of this.connectedAgents.values()) {
      try {
        this.sendMessage(agent.socket, {
          type: 'status_update',
          agent_id: 'server',
          data: { status: 'server_shutdown', message: 'Server shutting down' },
          priority: 'high',
          requires_response: false,
          timestamp: new Date().toISOString()
        });
        
        agent.socket.close();
      } catch (error) {
        // Ignore errors during shutdown
      }
    }

    // Clear agent maps
    this.connectedAgents.clear();
    this.messageQueue.clear();

    // Close server
    this.server.close();
    
    logger.info('✅ WebSocket Agent Server shutdown complete');
  }
}

export default WebSocketAgentServer;