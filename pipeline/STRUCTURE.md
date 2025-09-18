# Sales Automation System Directory Structure

This document outlines the directory structure for the Automated Agentic Sales Team system.

## Root Structure

```
sales-automation/
├── src/                          # Source code
│   ├── agents/                   # AI agent implementations
│   │   ├── prospecting/          # Geographic prospecting agent
│   │   ├── pitch-creator/        # Dynamic pitch generation agent
│   │   ├── voice-ai/            # Cold calling automation agent
│   │   ├── email-automation/     # Email campaign agent
│   │   └── orchestrator/         # Sales orchestrator agent
│   ├── integrations/            # External API integrations
│   │   ├── google-maps/         # Google Maps API integration
│   │   ├── yellow-pages/        # Yellow Pages API integration
│   │   ├── firecrawl/           # Website analysis integration
│   │   ├── perplexity/          # Market intelligence integration
│   │   ├── freshbooks/          # Billing system integration
│   │   └── linear/              # Project management integration
│   ├── orchestration/           # Agent coordination and workflow
│   │   ├── pipeline-manager/    # Pipeline state management
│   │   ├── workflow-engine/     # Task orchestration
│   │   └── event-handlers/      # Event processing
│   └── utils/                   # Shared utilities
│       ├── data-validation/     # Data validation utilities
│       ├── logging/             # Logging utilities
│       └── config/              # Configuration utilities
├── config/                      # Configuration files
│   ├── agents/                  # Agent-specific configurations
│   ├── integrations/            # API integration configurations
│   └── environment/             # Environment-specific configs
├── obsidian/                    # Obsidian-specific files
│   ├── templates/               # Customer profile templates
│   │   ├── prospect-profile/    # Prospect profile templates
│   │   ├── campaign/            # Campaign templates
│   │   └── activity/            # Activity logging templates
│   ├── dashboards/              # Analytics dashboard files
│   │   ├── sales-dashboard/     # Main sales analytics dashboard
│   │   ├── pipeline-health/     # Pipeline monitoring dashboard
│   │   └── performance-metrics/ # Performance tracking dashboard
│   └── plugins/                 # Obsidian plugin configurations
│       ├── kanban-config/       # Kanban plugin configuration
│       └── charts-config/       # Charts plugin configuration
├── scripts/                     # Automation and deployment scripts
│   ├── setup/                   # Initial setup scripts
│   ├── deployment/              # Deployment automation
│   └── maintenance/             # Maintenance utilities
├── data/                        # Data storage (gitignored)
│   ├── prospects/               # Prospect data cache
│   ├── campaigns/               # Campaign data
│   └── analytics/               # Analytics data cache
├── tests/                       # Test files
│   ├── unit/                    # Unit tests
│   ├── integration/             # Integration tests
│   └── e2e/                     # End-to-end tests
├── docs/                        # Documentation
│   ├── api/                     # API documentation
│   ├── setup/                   # Setup guides
│   └── user-guides/             # User documentation
└── logs/                        # Application logs (gitignored)
    ├── agents/                  # Agent-specific logs
    ├── integrations/            # Integration logs
    └── system/                  # System logs
```

## Key Design Principles

1. **Modularity**: Each agent is self-contained in its own directory
2. **Separation of Concerns**: Clear separation between agents, integrations, and orchestration
3. **Obsidian Integration**: Dedicated obsidian/ directory for templates and dashboards
4. **Configuration Management**: Centralized config/ directory with environment-specific settings
5. **Data Isolation**: Separate data/ directory (gitignored) for runtime data storage
6. **Testing Structure**: Comprehensive test organization supporting different test types
7. **Documentation**: Clear documentation structure for APIs, setup, and user guides

## Environment Variables Required

- `OBSIDIAN_VAULT_PATH` - Path to the Obsidian vault
- `GOOGLE_MAPS_API_KEY` - Google Maps API key
- `YELLOW_PAGES_API_KEY` - Yellow Pages API key
- `FIRECRAWL_API_KEY` - Firecrawl API key
- `PERPLEXITY_API_KEY` - Perplexity API key
- `ANTHROPIC_API_KEY` - Claude API key for agents
- `FRESHBOOKS_API_KEY` - FreshBooks integration key
- `LINEAR_API_KEY` - Linear project management API key