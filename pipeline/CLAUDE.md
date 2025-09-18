# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Sales Automation System

An AI-powered sales automation system with geographic prospecting, pitch creation, and multi-channel outreach integrated with Obsidian vault management.

## Essential Commands

### Development
```bash
npm run dev          # Development with hot reload using tsx
npm run build        # TypeScript compilation + path aliasing 
npm run build:watch  # Watch mode compilation
npm run test         # Jest test suite
npm run test:watch   # Jest in watch mode
npm run test:coverage # Coverage report
```

### Code Quality
```bash
npm run lint         # ESLint TypeScript files
npm run lint:fix     # Auto-fix linting issues
npm run format       # Prettier formatting
npm run type-check   # TypeScript type validation (no emit)
```

### Sales Automation Commands
```bash
# Prospect Management
npm run add-prospect                    # Add single prospect (basic)
npm run add-prospect-enhanced          # Enhanced prospect research (5-pass system)
npm run prospect:enhanced              # Alias for enhanced prospecting
npm run prospect:retry                 # Retry failed prospect research
npm run prospect:status                # Check prospect processing status

# Pitch Generation
npm run generate-pitches               # Modern Mastra-based pitch generation
npm run pitches:generate              # Alias for pitch generation
npm run pitches:all                   # Generate all pitches with evaluation
npm run pitches:verbose               # Verbose pitch generation output

# Mastra Agent System
npm run mastra                        # Mastra demo/testing interface
npm run mastra:prospect               # Run Mastra prospecting agent
npm run mastra:pitch                  # Run Mastra pitch creator agent
npm run mastra:evaluate               # Run agent evaluation suite
npm run mastra:status                 # Check Mastra agent status

# Analytics & Monitoring
npm run update-analytics              # Update sales analytics dashboard
npm run analytics:daily               # Daily analytics refresh
npm run sync-kanban                   # Sync Obsidian Kanban boards
npm run kanban:monitor                # Monitor Kanban changes
```

### Agent Management
```bash
npm run agents:start                  # Start agent orchestration system
npm run agents:stop                   # Stop all running agents
npm run tasks:start                   # Task manager CLI interface
npm run tasks:status                  # Task processing status
npm run tasks:list                    # List active tasks
```

## Architecture Overview

### Core Agent System (Mastra Framework)
- **MastraAgentBase**: Common base class for all agents with logging, validation, and execution patterns
- **MastraProspectingAgent**: Geographic business research with multi-source data aggregation
- **MastraPitchCreatorAgent**: Dynamic pitch generation with industry-specific messaging
- **MastraOrchestrator**: Coordinates agent workflows and task distribution

### Data Pipeline Architecture
```
prospect-businesses-mastra.ts → MastraProspectingAgent → Obsidian Files
                                       ↓
                              5-Pass Research System:
                              1. Google Maps data
                              2. Firecrawl web research  
                              3. Reviews analysis
                              4. Additional sources
                              5. Marketing strategy
```

### TypeScript Path Aliases
```typescript
@/*                  // src/*
@agents/*           // src/agents/*
@integrations/*     // src/integrations/*
@orchestration/*    // src/orchestration/*
@utils/*            // src/utils/*
@config/*           // config/*
```

### Key Directories
- `src/agents/mastra/` - Modern Mastra framework agents (primary)
- `src/agents/` - Legacy agent implementations (being phased out)
- `src/commands/` - CLI commands for prospect/pitch operations
- `src/integrations/` - External API integrations (Google Maps, Firecrawl, Perplexity)
- `src/orchestration/` - Agent coordination and task management
- `src/utils/obsidian/` - Obsidian vault integration utilities

## Development Patterns

### Agent Development
- Extend `MastraAgentBase` for new agents
- Use structured logging with `Logger` class
- Implement tool-based architecture with Mastra `Tool` interface
- Follow sanitization patterns for sensitive data logging

### Obsidian Integration
- All prospect data stored as Markdown files with frontmatter
- Use `VaultIntegration` for file operations
- Implement incremental sync with `ProspectFolderManager`
- Maintain Kanban board sync for pipeline management

### API Integration Patterns
- Implement rate limiting with `rate-limiter-flexible`
- Use structured error handling with operation context
- Implement retry logic for external API failures
- Store API configurations in `config/integrations/`

### Type Safety
- Strict TypeScript configuration with comprehensive checks
- Centralized type definitions in `src/types/`
- Validation schemas using Joi and Zod
- Runtime type checking for external API responses

## Testing Strategy

### Test Structure
- Unit tests for individual agents and utilities
- Integration tests for API connections
- End-to-end tests for complete prospect workflows
- Agent evaluation framework in `src/evaluations/`

### Running Specific Tests
```bash
npm test -- --testNamePattern="MastraAgent"     # Test specific pattern
npm test -- src/agents/mastra/                  # Test specific directory  
npm test -- --watch src/utils/                  # Watch specific path
```

## Critical Integration Points

### Environment Variables Required
```bash
OBSIDIAN_VAULT_PATH      # Path to Obsidian vault
GOOGLE_MAPS_API_KEY      # Google Maps/Places API
FIRECRAWL_API_KEY       # Web scraping service
PERPLEXITY_API_KEY      # AI research assistant
ANTHROPIC_API_KEY       # Claude AI integration
```

### Obsidian Dependencies
- Charts plugin for analytics visualization
- Kanban plugin for pipeline management  
- Dataview plugin for dynamic queries
- Templates for consistent prospect formatting

### Agent Orchestration
- RabbitMQ for agent message queuing
- WebSocket server for real-time updates
- Adaptive scheduling for agent workload balancing
- Task persistence with JSON-based storage

## Common Development Tasks

### Adding New Prospect Sources
1. Create integration in `src/integrations/`
2. Add to research pipeline in `MastraProspectingAgent`
3. Update prospect types in `src/types/prospect.ts`
4. Add validation rules in `src/utils/validation/`

### Extending Agent Capabilities  
1. Add tools to agent's `getTools()` method
2. Update agent instructions and prompts
3. Implement tool execution handlers
4. Add agent evaluation tests

### Debugging Agent Issues
- Check agent logs in configured logging directory
- Use `prospect:status` command for pipeline debugging
- Monitor agent orchestration with `agents:start` verbose mode
- Validate Obsidian file generation manually

## Integration Dependencies

### External Services
- **Google Maps API**: Business location and basic info
- **Firecrawl**: Website content extraction and analysis  
- **Perplexity AI**: Market research and competitive analysis
- **Anthropic Claude**: Agent reasoning and content generation

### Development Stack
- **Mastra Framework**: Agent orchestration and tool execution
- **TypeScript**: Strict type safety with path aliases
- **Jest**: Testing framework with coverage reporting
- **ESLint + Prettier**: Code quality and formatting
- **tsx**: TypeScript execution for development and scripts

## Performance Considerations

### Agent Execution
- Each agent runs independently with configurable concurrency
- Rate limiting prevents API quota exhaustion
- Incremental data sync reduces Obsidian vault conflicts
- Background processing with RabbitMQ queuing

### Data Management
- Prospect files use structured frontmatter for metadata
- JSON-based configuration for rapid agent reconfiguration  
- Lazy loading for large prospect datasets
- Batch operations for bulk prospect processing

### Monitoring Points
- Track API usage and rate limit consumption
- Monitor agent execution times and failure rates
- Obsidian file system integration health checks  
- Pipeline progression and conversion metrics