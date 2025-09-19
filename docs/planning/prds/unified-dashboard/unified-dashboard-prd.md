# PRD: Unified Sales Automation Dashboard

## Document Information
- **Version**: 1.0.0
- **Created**: 2024-09-19
- **Status**: Planning
- **Owner**: Mile High Marketing Development Team
- **Priority**: High
- **Target Release**: Q4 2024

## Executive Summary

This PRD outlines the development of a Unified Sales Automation Dashboard that consolidates the Pipeline and Caller components into a single, modern web application. The dashboard will provide real-time monitoring, analytics, and control over the entire sales automation system through an intuitive tab-based interface.

### Key Objectives
1. **Unification**: Single dashboard for all sales automation features
2. **Real-time Monitoring**: Live updates for pipeline and calling activities
3. **Rich Visualizations**: Comprehensive charts and analytics
4. **Modern Stack**: React/Next.js with cutting-edge visualization libraries
5. **Offline Capability**: Full functionality during flights/disconnected states

## Problem Statement

### Current Challenges
1. **Fragmented Interface**: Pipeline and Caller components operate independently
2. **Limited Visualization**: No unified view of sales performance
3. **Manual Monitoring**: Requires checking multiple systems for status
4. **No Real-time Updates**: Delayed feedback on calling campaigns
5. **Poor Mobile Experience**: Not optimized for on-the-go monitoring

### User Needs
- Sales managers need a single view of pipeline health and calling performance
- Real-time visibility into ongoing calling campaigns
- Interactive analytics to identify trends and opportunities
- Mobile-responsive design for remote monitoring
- Offline capability for disconnected environments

## Solution Overview

### Core Concept
A modern, single-page application built with Next.js that provides comprehensive monitoring and control over the sales automation system through intuitive tabbed interfaces.

### Architecture Approach
```
Unified Dashboard (Next.js)
├── Pipeline Tab
│   ├── Prospect Research Monitor
│   ├── Pipeline Analytics
│   └── Mastra Agent Control
├── Caller Tab
│   ├── Live Call Monitor
│   ├── Campaign Management
│   └── Voice Analytics
└── Shared Components
    ├── Real-time Updates (Kafka/WebSocket)
    ├── Data Visualizations
    └── Database (Supabase)
```

## Detailed Requirements

### 1. Dashboard Shell

#### 1.1 Navigation Structure
- **Tab-based Navigation**:
  - Pipeline Management
  - Caller Operations
  - Analytics Overview
  - Settings & Configuration

#### 1.2 Global Features
- Real-time notification system
- Global search across all data
- User authentication and permissions
- Theme switching (light/dark mode)
- Responsive design (mobile-first)

### 2. Pipeline Tab

#### 2.1 Prospect Research Dashboard
**Purpose**: Monitor and control prospect research operations

**Features**:
- Live research progress indicators
- 5-pass research status for each prospect
- API health monitors (Google Maps, Firecrawl, Perplexity)
- Research queue management
- Failed research retry controls

**Visualizations**:
- Research completion funnel (D3.js)
- Geographic heat map of prospects (Plotly)
- API usage charts (Chart.js)
- Research timeline (ApexCharts)

#### 2.2 Pipeline Analytics
**Purpose**: Comprehensive view of sales pipeline health

**Features**:
- Pipeline stage distribution
- Conversion rate tracking
- Revenue forecasting
- Lead scoring visualization
- Temperature distribution (Hot/Warm/Cold)

**Visualizations**:
- Sankey diagram for stage flow (D3.js)
- Revenue waterfall chart (Chart.js)
- Animated pipeline funnel (Framer Motion)
- 3D scatter plot for lead clustering (Three.js)

#### 2.3 Mastra Agent Control Panel
**Purpose**: Monitor and control AI agents

**Features**:
- Agent status indicators
- Task queue visualization
- Performance metrics
- Manual agent triggers
- Log streaming

### 3. Caller Tab

#### 3.1 Live Call Monitor
**Purpose**: Real-time monitoring of active calls

**Features**:
- Active call dashboard
- Live transcription display
- Call quality indicators
- Sentiment analysis visualization
- Call recording playback

**Visualizations**:
- Real-time waveform (Three.js)
- Sentiment timeline (D3.js)
- Call duration histogram (Chart.js)
- Geographic call map (Plotly)

#### 3.2 Campaign Management
**Purpose**: Control calling campaigns

**Features**:
- Campaign creation wizard
- Call list management
- Schedule configuration
- Script management
- A/B testing controls

**Visualizations**:
- Campaign performance comparison (ApexCharts)
- Call outcome distribution (Chart.js)
- Time-series campaign metrics (D3.js)

#### 3.3 Voice Analytics
**Purpose**: Analyze call performance and quality

**Features**:
- Call outcome analytics
- Conversion tracking
- Agent performance metrics
- Script effectiveness analysis
- Objection tracking

**Visualizations**:
- Word cloud of common objections (D3.js)
- Conversion funnel by script variant (Chart.js)
- Call duration vs outcome correlation (Plotly)

### 4. Shared Infrastructure

#### 4.1 Data Layer
- **Supabase**: Primary database for all application data
- **Redis**: Caching layer for real-time data
- **Kafka**: Event streaming for real-time updates

#### 4.2 Real-time Communication
- **WebSockets**: Live updates to dashboard
- **Server-Sent Events**: Fallback for real-time data
- **Polling**: Ultimate fallback for compatibility

#### 4.3 Authentication & Security
- **NextAuth.js**: Authentication management
- **Role-based Access Control**: Granular permissions
- **API Key Management**: Secure credential storage
- **Audit Logging**: Complete activity tracking

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **State Management**: Zustand + React Query

### Visualization Libraries
- **Chart.js**: Standard charts and graphs
- **D3.js**: Complex custom visualizations
- **Plotly.js**: Scientific and geographic plots
- **ApexCharts**: Business intelligence charts

### Animation Libraries
- **Framer Motion**: UI animations and transitions
- **Three.js**: 3D visualizations
- **Anime.js**: Complex animation sequences
- **Remotion**: Video generation for reports

### Backend Services
- **Supabase**: PostgreSQL database and real-time subscriptions
- **Kafka**: Event streaming and message queuing
- **Redis**: Caching and session storage
- **Bull**: Background job processing

### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Local development environment
- **Nginx**: Reverse proxy and static serving

### MCP Servers (Claude Integration)
- **Filesystem MCP**: File operations
- **GitHub MCP**: Repository integration
- **PostgreSQL MCP**: Database operations
- **Search MCP**: Web search capabilities

## Project Structure

```
sales/
├── dashboard/                      # Main dashboard application
│   ├── app/                       # Next.js app directory
│   │   ├── (auth)/               # Authentication pages
│   │   ├── dashboard/
│   │   │   ├── pipeline/         # Pipeline tab pages
│   │   │   ├── caller/           # Caller tab pages
│   │   │   └── analytics/        # Analytics tab pages
│   │   ├── api/                  # API routes
│   │   └── layout.tsx            # Root layout
│   ├── components/
│   │   ├── ui/                   # Shadcn components
│   │   ├── charts/               # Chart components
│   │   │   ├── ChartjsWrapper.tsx
│   │   │   ├── D3Container.tsx
│   │   │   ├── PlotlyChart.tsx
│   │   │   └── ApexChart.tsx
│   │   ├── animations/           # Animation components
│   │   │   ├── FramerAnimations.tsx
│   │   │   ├── ThreeScene.tsx
│   │   │   └── AnimeSequence.tsx
│   │   ├── pipeline/             # Pipeline-specific components
│   │   ├── caller/               # Caller-specific components
│   │   └── shared/               # Shared components
│   ├── lib/
│   │   ├── supabase/            # Supabase client and utilities
│   │   ├── kafka/               # Kafka producers/consumers
│   │   ├── redis/               # Redis client
│   │   └── utils/               # Utility functions
│   ├── hooks/                    # Custom React hooks
│   ├── stores/                   # Zustand stores
│   ├── types/                    # TypeScript definitions
│   └── public/                   # Static assets
├── pipeline/                      # Existing pipeline component
├── caller/                        # Existing caller component
├── shared/                        # Shared libraries
│   ├── types/                    # Shared TypeScript types
│   ├── utils/                    # Shared utilities
│   └── constants/                # Shared constants
├── docker/                        # Docker configurations
│   ├── postgres/                 # PostgreSQL/Supabase
│   ├── kafka/                    # Kafka setup
│   ├── redis/                    # Redis configuration
│   └── docker-compose.yml        # Orchestration
└── integrations/                  # Enhanced integrations
    ├── supabase/                 # Database integration
    ├── kafka/                    # Event streaming
    └── mcp-servers/              # Claude MCP servers
```

## Data Flow Architecture

### Real-time Data Flow
```
Pipeline Component → Kafka Topics → Dashboard Consumer → WebSocket → UI Updates
Caller Component → Kafka Topics → Dashboard Consumer → WebSocket → UI Updates
```

### Database Architecture
```
Supabase PostgreSQL
├── prospects table
├── calls table
├── campaigns table
├── analytics_events table
└── real-time subscriptions → Dashboard
```

### Event Streaming Topics
```
Kafka Topics:
├── pipeline.research.started
├── pipeline.research.completed
├── pipeline.prospect.qualified
├── caller.call.initiated
├── caller.call.completed
└── analytics.event.tracked
```

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Set up Next.js project with TypeScript
- Configure Tailwind CSS and Shadcn/ui
- Implement authentication with NextAuth.js
- Set up Supabase database and tables
- Create basic tab navigation structure

### Phase 2: Pipeline Tab (Week 3-4)
- Implement prospect research monitor
- Create pipeline analytics with Chart.js
- Add D3.js visualizations for complex data
- Integrate with existing pipeline component
- Set up Kafka consumers for pipeline events

### Phase 3: Caller Tab (Week 5-6)
- Build live call monitoring interface
- Implement campaign management features
- Create voice analytics dashboards
- Integrate with existing caller component
- Add WebSocket connections for real-time updates

### Phase 4: Advanced Visualizations (Week 7-8)
- Implement Three.js 3D visualizations
- Add Framer Motion animations
- Create Plotly geographic visualizations
- Build ApexCharts business intelligence dashboards
- Implement Remotion for report generation

### Phase 5: Infrastructure & Testing (Week 9-10)
- Set up Docker development environment
- Configure Kafka event streaming
- Implement Redis caching layer
- Add comprehensive error handling
- Perform load testing and optimization

### Phase 6: Polish & Deployment (Week 11-12)
- UI/UX refinements
- Performance optimization
- Security audit
- Documentation completion
- Production deployment

## Success Metrics

### Performance KPIs
- Page load time < 2 seconds
- Real-time update latency < 100ms
- Chart rendering time < 500ms
- 99.9% uptime availability

### User Experience KPIs
- Task completion time reduced by 50%
- User satisfaction score > 4.5/5
- Mobile responsiveness score > 95
- Accessibility score > 90

### Business KPIs
- 30% increase in pipeline visibility
- 25% reduction in response time to issues
- 40% improvement in campaign effectiveness
- 20% increase in qualified leads

## Security Considerations

### Data Protection
- End-to-end encryption for sensitive data
- PII masking in logs and analytics
- GDPR/CCPA compliance
- Regular security audits

### Access Control
- Multi-factor authentication
- Role-based permissions
- API key rotation
- Session management

### Infrastructure Security
- Container security scanning
- Network isolation
- Rate limiting
- DDoS protection

## Offline Capabilities

### Local Development
- Docker Compose for complete local environment
- Seed data for testing
- Offline mode with local storage
- Service worker for PWA functionality

### Data Synchronization
- Conflict resolution strategies
- Queue for offline actions
- Automatic sync on reconnection
- Local-first architecture

## Testing Strategy

### Unit Testing
- Jest for component testing
- React Testing Library for UI tests
- 80% code coverage target

### Integration Testing
- API endpoint testing
- WebSocket connection testing
- Database integration tests

### E2E Testing
- Playwright for user flow testing
- Performance testing with Lighthouse
- Load testing with K6

## Documentation Requirements

### Developer Documentation
- API documentation with OpenAPI
- Component storybook
- Architecture decision records
- Setup and deployment guides

### User Documentation
- User manual with screenshots
- Video tutorials
- FAQ section
- Troubleshooting guide

## Risk Analysis

### Technical Risks
- **Risk**: Complex integration between multiple libraries
  - **Mitigation**: Incremental integration with fallbacks
  
- **Risk**: Real-time performance at scale
  - **Mitigation**: Implement caching and pagination

- **Risk**: Browser compatibility issues
  - **Mitigation**: Progressive enhancement approach

### Business Risks
- **Risk**: User adoption challenges
  - **Mitigation**: Phased rollout with training

- **Risk**: Data migration complexities
  - **Mitigation**: Parallel run with existing systems

## Appendices

### A. Dependency List
See [dependencies.md](./dependencies.md) for complete package list

### B. Architecture Diagrams
See [architecture-diagram.md](./architecture-diagram.md) for visual representations

### C. Setup Checklist
See [setup-checklist.md](./setup-checklist.md) for pre-flight preparation

---

**Document Status**: Ready for Review
**Next Steps**: Technical review and approval
**Questions**: Contact development team