# Sales Dashboard Context & Implementation Plan

## Current State Analysis
**Date**: 2025-09-19  
**Location**: `/Users/pbarrick/Desktop/dev/MHM/projects/sales/dashboard`

### Project Structure
```
dashboard/
├── app/                    # Next.js 14 App Router
├── components/             
│   ├── pipeline/          # Pipeline components including funnel
│   ├── caller/            # Caller tab components
│   ├── analytics/         # Analytics components
│   └── ui/                # Shadcn UI components
├── lib/                   
│   ├── supabase/          # Empty - needs configuration
│   ├── kafka/             # Empty - needs setup
│   ├── redis/             # Empty - needs client
│   └── mock-data/         # Current data source
├── stores/                # Zustand stores
└── docker/                # Infrastructure containers
```

### Available Libraries
**Charting:**
- Chart.js v4.5.0 with react-chartjs-2
- D3.js v7.9.0 (currently used)
- ApexCharts v5.3.5 with react-apexcharts
- Plotly.js v3.1.0 with react-plotly.js
- Recharts v3.2.1

**Animation:**
- Framer Motion v12.23.16
- Anime.js v4.1.3
- Three.js v0.180.0 with React Three Fiber

**Infrastructure:**
- Supabase client installed
- Kafka.js installed
- Redis client installed
- Socket.io installed
- Docker Compose configured

### Environment Configuration
**APIs Configured:**
- Firecrawl API ✅
- Perplexity API ✅
- Google Maps API ❌ (key missing)
- Vapi AI ✅
- Twilio ✅
- Linear API ✅
- FreshBooks ✅ (partial)
- Anthropic/Claude ✅
- Make.com Webhooks ✅

**Docker Services:**
- Postgres (Supabase) - Port 5432
- Kafka + Zookeeper - Port 9092
- Redis - Port 6379

## Implementation Plan

### Phase 1: Funnel Visualization Redesign
**Target Component**: `components/pipeline/pipeline-funnel-v2.tsx`

#### Current Issues:
1. Complex D3.js implementation with trapezoids
2. Duplicate information (stats panel + icon row)
3. No true funnel shape (left to right narrowing)
4. Limited glass effect/modern aesthetics
5. Tight spacing between stages

#### New Design Requirements:
1. **Shape**: True funnel (wide left → narrow right)
2. **Spacing**: Minimum 50px between stages
3. **Glass Effect**: Modern glassmorphism with backdrop-filter
4. **Animation**: Smooth Framer Motion transitions
5. **Clean Layout**: Remove duplicate information

#### Implementation Approach:
```tsx
// New component structure
<PipelineFunnelV3>
  <FunnelStage width="100%" /> // Cold
  <FunnelStage width="75%" />  // Contacted  
  <FunnelStage width="50%" />  // Interested
  <FunnelStage width="25%" />  // Qualified
</PipelineFunnelV3>
```

### Phase 2: Database Infrastructure

#### Priority: Supabase First
**Reasoning:**
1. Foundation for all data operations
2. Built-in real-time subscriptions
3. Authentication ready
4. Immediate value delivery

#### Database Schema:
```sql
-- Core tables
prospects (
  id, business_name, industry, location, 
  temperature, pipeline_stage, score,
  created_at, updated_at
)

campaigns (
  id, name, status, target_count,
  created_at, updated_at
)

calls (
  id, prospect_id, campaign_id, 
  duration, outcome, transcript,
  created_at
)

analytics_events (
  id, type, payload, timestamp
)
```

#### Implementation Steps:
1. Create Supabase client (`lib/supabase/client.ts`)
2. Define TypeScript types (`lib/supabase/types.ts`)
3. Create API routes (`app/api/prospects/`)
4. Update Zustand stores to use Supabase
5. Implement real-time subscriptions

### Phase 3: WebSocket & Real-time

#### Approach:
1. **Supabase Realtime** for database changes
2. **Socket.io** for custom events
3. **Kafka** for event streaming (Phase 2)

#### Real-time Features:
- Live prospect updates
- Call status changes
- Research progress
- Dashboard metrics

### Phase 4: Kafka Integration (Week 2)

#### Kafka's Role:
- Event streaming between components
- Audit trail
- Microservice communication
- High-volume processing

#### Topics:
```
pipeline.research.started
pipeline.research.completed
pipeline.prospect.qualified
caller.call.initiated
caller.call.completed
analytics.event.tracked
```

## File Creation/Modification List

### New Files to Create:
- `components/pipeline/pipeline-funnel-v3.tsx`
- `lib/supabase/client.ts`
- `lib/supabase/types.ts`
- `lib/supabase/migrations/001_initial.sql`
- `app/api/prospects/route.ts`
- `app/api/campaigns/route.ts`
- `app/api/calls/route.ts`
- `lib/websocket/client.ts`
- `lib/kafka/producer.ts`
- `lib/kafka/consumer.ts`

### Files to Modify:
- `stores/usePipelineStore.ts` - Add Supabase integration
- `components/pipeline/pipeline-dashboard.tsx` - Use new funnel
- `.env.local` - Add Supabase credentials
- `docker/docker-compose.yml` - Add Supabase services

## Success Metrics
- [ ] Funnel renders with glass effect
- [ ] 50px+ spacing between stages
- [ ] No duplicate information
- [ ] Smooth animations on hover/interaction
- [ ] Database connected and populated
- [ ] Real-time updates working
- [ ] WebSocket connections stable
- [ ] Kafka events flowing (Phase 2)

## Next Steps
1. ✅ Create context.md
2. ⏳ Create progress.md
3. ⏳ Implement PipelineFunnelV3 component
4. ⏳ Set up Supabase client
5. ⏳ Create database schema
6. ⏳ Connect stores to database
7. ⏳ Implement real-time features