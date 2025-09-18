# Automated Agentic Sales Team

A comprehensive AI-powered sales automation system designed to streamline and scale digital marketing agency prospecting, outreach, and lead nurturing through intelligent automation and Obsidian integration.

## 🎯 Overview

The Automated Agentic Sales Team deploys five specialized AI agents that work together to:

- **Identify & Qualify Prospects** - Geographic-based prospecting with multi-source data aggregation
- **Create Dynamic Pitches** - Stage-aware, industry-specific value propositions with ROI calculations
- **Automate Voice Outreach** - Two-tiered AI calling system for different deal complexities
- **Manage Email Campaigns** - Multi-touch sequences with personalization and deliverability optimization
- **Orchestrate Sales Pipeline** - Intelligent prospect progression and buying signal detection

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 8+
- Docker and Docker Compose (optional)
- Obsidian vault with Charts and Kanban plugins
- Required API keys (see Configuration section)

### Installation

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd sales-automation
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and Obsidian vault path
   ```

3. **Build and Start**
   ```bash
   npm run build
   npm start
   ```

### Docker Development

```bash
# Development with hot reload
docker-compose -f docker-compose.dev.yml up

# Production deployment
docker-compose up -d
```

## 📋 Configuration

### Required Environment Variables

```bash
# Obsidian Integration
OBSIDIAN_VAULT_PATH=/path/to/your/obsidian/vault

# Core API Keys
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
YELLOW_PAGES_API_KEY=your_yellow_pages_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
ANTHROPIC_API_KEY=your_claude_api_key

# Optional Integrations
FRESHBOOKS_API_KEY=your_freshbooks_key
LINEAR_API_KEY=your_linear_key
SENDGRID_API_KEY=your_sendgrid_key
```

See `.env.example` for complete configuration options.

## 🤖 Agent System

### 1. Prospecting Agent
- **Purpose**: Geographic-based lead generation and customer profile building
- **Capabilities**: Multi-source data aggregation, email pattern derivation, qualification scoring
- **Target**: 10+ qualified prospects per day
- **Data Sources**: Google Maps, Yellow Pages, Firecrawl, Perplexity

### 2. Pitch Creator Agent
- **Purpose**: Dynamic, stage-aware sales pitch generation
- **Capabilities**: Industry-specific messaging, ROI calculations, competitor analysis
- **Structure**: 30s hook, 60s value prop, 120s close
- **Target**: 15%+ positive response rate

### 3. Voice AI Agent
- **Purpose**: Automated voice outreach execution
- **Capabilities**: Two-tier calling system, dynamic script delivery, outcome tracking
- **Tiers**: Low-cost for initial contact, premium for high-value deals ($15K+)
- **Target**: 5%+ qualified lead conversion

### 4. Email Automation Agent
- **Purpose**: Multi-touch email campaigns and follow-up sequences
- **Capabilities**: Triggered sequences, personalization, A/B testing, deliverability optimization
- **Integration**: SendGrid/Mailgun with engagement tracking

### 5. Sales Orchestrator Agent
- **Purpose**: Pipeline management and closing strategy coordination
- **Capabilities**: Buying signal detection, next-step recommendations, deal risk assessment
- **Integration**: Claude Code role for intelligent decision making

## 📊 Obsidian Integration

### Dashboard Structure
- **Sales Analytics Dashboard** - Real-time metrics and performance tracking
- **Pipeline Health Monitor** - Conversion rates and stage analysis
- **Customer Profiles** - Standardized prospect information with interaction history

### Required Plugins
- **Charts Plugin** - For analytics visualization
- **Kanban Plugin** - For pipeline management
- **Dataview** - For dynamic data queries

### Pipeline Stages
- Cold → Contacted → Interested → Qualified → Closed/Lost/Frozen

## 🛠 Development

### Available Scripts

```bash
npm run dev          # Development with hot reload
npm run build        # Build production bundle
npm run test         # Run test suite
npm run test:watch   # Run tests in watch mode
npm run lint         # Lint TypeScript code
npm run type-check   # TypeScript type checking
```

### Project Structure

```
src/
├── agents/           # AI agent implementations
│   ├── prospecting/  # Geographic prospecting
│   ├── pitch-creator/# Dynamic pitch generation
│   ├── voice-ai/     # Cold calling automation
│   ├── email-automation/ # Email campaigns
│   └── orchestrator/ # Sales orchestration
├── integrations/     # External API integrations
├── orchestration/    # Agent coordination
└── utils/           # Shared utilities
```

## 📈 Performance Targets

### Year One Goals
- **Revenue Target**: $50,000
- **Daily Prospects**: 10+ qualified leads
- **Conversion Rate**: 5%+ from outreach to qualified
- **Pipeline Value**: $50,000+ monthly generation

### Success Metrics
- **Volume**: Prospects identified, contacts attempted, conversations initiated
- **Quality**: Qualification scores, response rates, pipeline conversion
- **Revenue**: Pipeline value, close rates, average deal size
- **Efficiency**: Cost per qualified lead, time to first contact

## 🔒 Compliance

### TCPA Compliance
- Opt-out list management
- Consent tracking
- Frequency caps

### CAN-SPAM Compliance
- Unsubscribe mechanisms
- Sender identification
- Truthful subject lines

## 🏗 Architecture

### Core Components
- **Agent Orchestration Engine** - Central coordination system
- **Data Lake** - Obsidian-based prospect and interaction storage
- **Workflow Engine** - Prospect progression through pipeline stages
- **Analytics Engine** - Real-time reporting and optimization

### External Integrations
- **Business Data**: Google Maps, Yellow Pages APIs
- **Intelligence**: Firecrawl, Perplexity for market research
- **Communication**: Voice AI platforms, SendGrid/Mailgun
- **Business Tools**: FreshBooks, Linear project management

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the [documentation](docs/) folder
- Review the [troubleshooting guide](docs/troubleshooting.md)

---

**Mile High Marketing** - Scaling digital marketing through intelligent automation