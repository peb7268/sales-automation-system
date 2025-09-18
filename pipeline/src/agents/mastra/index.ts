/**
 * Mastra Agent Framework Exports
 * Central export point for all Mastra-based agents and related components
 */

// Base agent class
export { MastraAgentBase } from './MastraAgentBase';
export type { MastraAgentBaseConfig } from './MastraAgentBase';

// Specialized agents
export { MastraProspectingAgent, mastraProspectingAgent } from './MastraProspectingAgent';
export { MastraPitchCreatorAgent, mastraPitchCreatorAgent } from './MastraPitchCreatorAgent';

// Orchestration
export { MastraOrchestrator, mastraOrchestrator } from '../../orchestration/MastraOrchestrator';
export type { 
  AgentStatus, 
  OrchestrationTask, 
  WorkflowResult 
} from '../../orchestration/MastraOrchestrator';

// Evaluations
export { MastraAgentEvaluations, mastraAgentEvaluations } from '../../evaluations/MastraAgentEvaluations';
export type { 
  EvaluationCriterion, 
  EvaluationResult, 
  QualityAssessment 
} from '../../evaluations/MastraAgentEvaluations';

// Re-export types from original agents for compatibility
export type { 
  PitchComponents, 
  ProspectFrontmatter 
} from '../pitch-creator-agent';

export type { 
  GeographicFilter, 
  ProspectingResults,
  EmailPatternResult 
} from '../prospecting-agent';

// Utility functions for agent management
export class MastraAgentUtils {
  /**
   * Get all available Mastra agents
   */
  static getAvailableAgents(): { name: string; agent: any; description: string }[] {
    return [
      {
        name: 'prospecting',
        agent: mastraProspectingAgent,
        description: 'Geographic business discovery and qualification specialist'
      },
      {
        name: 'pitch_creator', 
        agent: mastraPitchCreatorAgent,
        description: 'AI-powered personalized sales pitch generator'
      }
    ];
  }

  /**
   * Initialize all Mastra agents
   */
  static async initializeAllAgents(): Promise<void> {
    const agents = this.getAvailableAgents();
    
    for (const { name, agent } of agents) {
      const status = agent.getStatus();
      if (!status.initialized) {
        throw new Error(`Agent ${name} failed to initialize`);
      }
    }
  }

  /**
   * Get system-wide agent status
   */
  static getSystemStatus(): {
    totalAgents: number;
    initializedAgents: number;
    totalTools: number;
    agents: Array<{
      name: string;
      status: any;
    }>;
  } {
    const agents = this.getAvailableAgents();
    const agentStatuses = agents.map(({ name, agent }) => ({
      name,
      status: agent.getStatus()
    }));

    return {
      totalAgents: agents.length,
      initializedAgents: agentStatuses.filter(a => a.status.initialized).length,
      totalTools: agentStatuses.reduce((sum, a) => sum + a.status.toolCount, 0),
      agents: agentStatuses
    };
  }

  /**
   * Validate agent configuration
   */
  static validateAgentConfiguration(): {
    valid: boolean;
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];
    const agents = this.getAvailableAgents();

    for (const { name, agent } of agents) {
      try {
        const status = agent.getStatus();
        
        if (!status.initialized) {
          issues.push(`Agent ${name} is not initialized`);
        }

        if (status.toolCount === 0) {
          warnings.push(`Agent ${name} has no tools configured`);
        }

        if (!status.model) {
          warnings.push(`Agent ${name} has no model specified`);
        }

      } catch (error: any) {
        issues.push(`Failed to get status for agent ${name}: ${error.message}`);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings
    };
  }
}

// Export utility instance
export const mastraAgentUtils = MastraAgentUtils;