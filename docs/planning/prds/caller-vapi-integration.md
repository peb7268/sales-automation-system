# 📞 Vapi Call Integration Plan for Sales Dashboard

## Executive Summary
This document outlines the comprehensive plan for integrating Vapi AI calling system with the MHM Sales Dashboard to enable real-time call monitoring, historical call data import, and seamless workflow automation.

## Current Situation

### Existing Infrastructure
- **Vapi API Key**: `1fc8850a-d12e-4a75-88e8-d1785699845b` ✅
- **Vapi Base URL**: `https://api.vapi.ai`
- **Database**: PostgreSQL with existing `calls` table
- **Dashboard**: Next.js application running on port 3000
- **Docker Services**: Fully operational (PostgreSQL, Redis, Kafka)
- **Authentication**: Working with admin@milehighmarketing.com

### Available Resources
- Vapi API documentation endpoints identified
- Sample Vapi request/response structures documented
- Existing database schema with calls table
- Working authentication system

## Phase 1: Database Schema Enhancement

### Objectives
Extend the existing calls table to store Vapi-specific data and enable comprehensive call tracking.

### Schema Updates
```sql
-- Add Vapi-specific columns to existing calls table
ALTER TABLE calls 
ADD COLUMN vapi_call_id VARCHAR(255) UNIQUE,
ADD COLUMN vapi_status VARCHAR(50),
ADD COLUMN vapi_metadata JSONB,
ADD COLUMN cost DECIMAL(10,4),
ADD COLUMN qualification_score INTEGER CHECK (qualification_score >= 0 AND qualification_score <= 100),
ADD COLUMN call_type VARCHAR(20) CHECK (call_type IN ('inbound', 'outbound')),
ADD COLUMN assistant_id VARCHAR(255),
ADD COLUMN phone_number_id VARCHAR(255),
ADD COLUMN customer_number VARCHAR(50),
ADD COLUMN started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN ended_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN error_message TEXT;

-- Create indexes for Vapi-specific queries
CREATE INDEX idx_calls_vapi_call_id ON calls(vapi_call_id);
CREATE INDEX idx_calls_vapi_status ON calls(vapi_status);
CREATE INDEX idx_calls_qualification_score ON calls(qualification_score DESC);
CREATE INDEX idx_calls_call_type ON calls(call_type);
```

## Phase 2: API Integration Layer

### 2.1 Vapi Service Module
Location: `dashboard/lib/vapi/`

#### Files to Create:

**vapi-client.ts**
```typescript
// Core API client for Vapi integration
export class VapiClient {
  private apiKey: string;
  private baseUrl: string;
  
  constructor() {
    this.apiKey = process.env.VAPI_API_KEY!;
    this.baseUrl = 'https://api.vapi.ai';
  }
  
  // Methods:
  async listCalls(params?: ListCallsParams): Promise<VapiCall[]>
  async getCall(id: string): Promise<VapiCall>
  async getRecording(url: string): Promise<Buffer>
  async createCall(data: CreateCallData): Promise<VapiCall>
  async syncHistoricalCalls(): Promise<SyncResult>
}
```

**vapi-types.ts**
```typescript
// TypeScript interfaces for Vapi data structures
export interface VapiCall {
  id: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
  type: 'inboundPhoneCall' | 'outboundPhoneCall';
  status: 'queued' | 'ringing' | 'in-progress' | 'completed' | 'failed';
  phoneNumberId: string;
  customerId: string;
  assistantId: string;
  duration?: number;
  cost?: number;
  transcript?: string;
  recordingUrl?: string;
  outcome?: string;
  summary?: string;
  metadata?: Record<string, any>;
}
```

### 2.2 API Routes
Location: `dashboard/app/api/vapi/`

#### Endpoints to Implement:

1. **GET /api/vapi/calls**
   - List all calls with pagination
   - Query parameters: page, limit, status, date_from, date_to
   - Returns: Paginated call list

2. **GET /api/vapi/calls/[id]**
   - Get detailed call information
   - Returns: Full call object with transcript and metadata

3. **POST /api/vapi/sync**
   - Trigger historical data import from Vapi
   - Returns: Sync status and imported count

4. **GET /api/vapi/recordings/[id]**
   - Stream call recording audio
   - Returns: Audio stream with proper headers

## Phase 3: Webhook Integration

### 3.1 Webhook Endpoint
Location: `dashboard/app/api/webhooks/vapi/route.ts`

#### Webhook URL Configuration:
- **Development**: `http://localhost:3000/api/webhooks/vapi`
- **Production**: `https://yourdomain.com/api/webhooks/vapi`

#### Events to Handle:

1. **call.started**
   ```typescript
   {
     event: 'call.started',
     callId: string,
     phoneNumberId: string,
     customerId: string,
     timestamp: string
   }
   ```
   - Create initial call record
   - Update prospect status to "on-call"
   - Emit real-time event to dashboard

2. **call.ended**
   ```typescript
   {
     event: 'call.ended',
     callId: string,
     duration: number,
     outcome: string,
     cost: number,
     timestamp: string
   }
   ```
   - Update call record with final data
   - Calculate qualification score
   - Trigger follow-up workflows

3. **recording.ready**
   ```typescript
   {
     event: 'recording.ready',
     callId: string,
     recordingUrl: string,
     timestamp: string
   }
   ```
   - Store recording URL
   - Enable playback in UI

4. **transcript.ready**
   ```typescript
   {
     event: 'transcript.ready',
     callId: string,
     transcript: string,
     summary: string,
     timestamp: string
   }
   ```
   - Store full transcript
   - Update call summary
   - Analyze for keywords/sentiment

### 3.2 Real-time Updates
Implement Server-Sent Events (SSE) for live updates:

```typescript
// dashboard/app/api/sse/calls/route.ts
export async function GET(req: Request) {
  const stream = new ReadableStream({
    start(controller) {
      // Subscribe to call events
      // Send updates to client
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

## Phase 4: Dashboard UI Components

### 4.1 Calls Dashboard Page
Location: `dashboard/app/calls/page.tsx`

#### Features:
- Filterable call list table
- Status badges (completed, failed, in-progress)
- Quick stats cards (total calls, success rate, avg duration)
- Search by company/lead name
- Export to CSV functionality
- Date range picker

### 4.2 Call Detail View
Location: `dashboard/app/calls/[id]/page.tsx`

#### Components:
- **Call Header**: Status, duration, cost, timestamp
- **Transcript Viewer**: Formatted conversation display
- **Audio Player**: Recording playback with controls
- **Lead Info Card**: Prospect details and history
- **Qualification Score**: Visual score with breakdown
- **Actions Panel**: Edit notes, schedule follow-up, update status

### 4.3 Live Call Monitor
Location: `dashboard/components/live-calls.tsx`

#### Real-time Features:
- Active call cards with duration counters
- Caller information display
- Live status updates
- Quick actions (end call, transfer, add note)
- Visual indicators (pulsing for active calls)

## Phase 5: Historical Data Import

### Import Script
Location: `dashboard/scripts/import-vapi-calls.ts`

#### Process:
1. Fetch all historical calls from Vapi API
2. Match calls with existing prospects by phone number
3. Create/update call records in database
4. Generate analytics from historical data
5. Log import statistics

#### Command:
```bash
npm run vapi:import -- --from="2024-01-01" --to="2024-12-31"
```

## Phase 6: Analytics & Reporting

### 6.1 Call Analytics Dashboard
Location: `dashboard/app/analytics/calls/page.tsx`

#### Metrics to Display:
- **Call Volume**: Daily/weekly/monthly trends
- **Success Rate**: Completed vs failed calls
- **Average Duration**: By outcome type
- **Cost Analysis**: Total spend, cost per successful call
- **Best Performing Scripts**: By qualification score
- **Peak Hours**: Heat map of call times

### 6.2 Integration Points

#### With Sales Pipeline:
- Auto-update prospect status based on call outcomes
- Update temperature (hot/warm/cold) based on call sentiment
- Trigger follow-up sequences for qualified leads

#### With Linear:
- Create tasks for follow-ups
- Update project status for qualified leads

#### With FreshBooks:
- Track billable hours for call time
- Generate reports for client billing

## Implementation Timeline

### Week 1: Foundation
- [ ] Database schema updates
- [ ] Install dependencies (axios, audio player components)
- [ ] Create Vapi service module
- [ ] Basic API routes

### Week 2: Webhook & Real-time
- [ ] Webhook endpoint implementation
- [ ] SSE for real-time updates
- [ ] Test webhook with Vapi sandbox
- [ ] Error handling and logging

### Week 3: UI Development
- [ ] Calls list page
- [ ] Call detail view
- [ ] Live call monitor component
- [ ] Audio player integration

### Week 4: Import & Analytics
- [ ] Historical data import script
- [ ] Analytics dashboard
- [ ] Testing and refinement
- [ ] Documentation

## Environment Configuration

### Required Environment Variables
```bash
# Add to dashboard/.env.local
VAPI_API_KEY=1fc8850a-d12e-4a75-88e8-d1785699845b
VAPI_WEBHOOK_SECRET=<generate-secure-secret>
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional - for advanced features
VAPI_ASSISTANT_ID=<your-assistant-id>
VAPI_PHONE_NUMBER_ID=<your-phone-number-id>
```

### Security Considerations
- Validate webhook signatures to prevent unauthorized requests
- Sanitize and validate all incoming data
- Implement rate limiting on API endpoints
- Use secure storage for recordings and transcripts
- Implement proper access controls based on user roles

## Testing Strategy

### Unit Tests
- Vapi client methods
- Data transformation functions
- Database operations

### Integration Tests
- Webhook event handling
- API endpoint responses
- Real-time updates

### End-to-End Tests
- Complete call flow from webhook to UI update
- Historical import process
- User interactions in dashboard

## Success Metrics

### Technical Metrics
- Webhook reliability: >99.9% successful processing
- Import speed: >100 calls/minute
- Real-time latency: <500ms for updates
- UI performance: <200ms response time

### Business Metrics
- Call data completeness: 100% of calls captured
- Qualification accuracy: >90% match with manual review
- Time savings: 2+ hours/day on call management
- Follow-up rate: >80% of qualified leads contacted within 24h

## Risk Mitigation

### Potential Risks & Solutions
1. **API Rate Limits**
   - Solution: Implement request throttling and caching

2. **Webhook Failures**
   - Solution: Implement retry mechanism and dead letter queue

3. **Large Data Volumes**
   - Solution: Pagination and lazy loading in UI

4. **Recording Storage Costs**
   - Solution: Stream from Vapi, implement retention policies

## Next Steps

1. Review and approve this plan
2. Set up Vapi webhook configuration
3. Create development branch for implementation
4. Begin Phase 1 database updates
5. Schedule weekly progress reviews

## Appendix

### Vapi API Reference
- Base URL: https://api.vapi.ai
- Authentication: Bearer token in Authorization header
- Rate Limits: 100 requests/minute (subject to plan)

### Sample Webhook Payload
```json
{
  "event": "call.ended",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "data": {
    "callId": "call_123abc",
    "orgId": "org_456def",
    "duration": 245,
    "cost": 0.82,
    "outcome": "meeting-scheduled",
    "summary": "Prospect interested in services",
    "qualificationScore": 85,
    "metadata": {
      "leadId": "1",
      "company": "Test Company"
    }
  }
}
```

### Support Resources
- Vapi Documentation: https://docs.vapi.ai
- MHM Internal Docs: /docs/integrations/vapi.md
- Support Contact: support@vapi.ai

---
*Document Version: 1.0*
*Created: 2024-01-20*
*Last Updated: 2024-01-20*
*Author: MHM Development Team*