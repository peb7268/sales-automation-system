# Unified Dashboard Architecture Diagrams

## System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[Dashboard UI - Next.js]
        UI --> PT[Pipeline Tab]
        UI --> CT[Caller Tab]
        UI --> AT[Analytics Tab]
        UI --> ST[Settings Tab]
    end
    
    subgraph "Visualization Layer"
        PT --> CH[Chart.js]
        PT --> D3[D3.js]
        CT --> PL[Plotly.js]
        AT --> AP[ApexCharts]
        AT --> TH[Three.js]
    end
    
    subgraph "State Management"
        UI --> ZS[Zustand Store]
        UI --> RQ[React Query]
        ZS --> LC[Local Cache]
    end
    
    subgraph "Real-time Communication"
        UI --> WS[WebSocket Server]
        UI --> SSE[Server-Sent Events]
        WS --> KF[Kafka Consumer]
    end
    
    subgraph "Backend Services"
        API[Next.js API Routes]
        API --> SB[Supabase]
        API --> RD[Redis Cache]
        API --> KP[Kafka Producer]
    end
    
    subgraph "Existing Components"
        PC[Pipeline Component]
        CC[Caller Component]
        PC --> KP
        CC --> KP
        PC --> SB
        CC --> SB
    end
    
    subgraph "Infrastructure"
        SB --> PG[(PostgreSQL)]
        KF --> KT[Kafka Topics]
        KP --> KT
        RD --> RC[(Redis)]
    end
```

## Component Architecture

```mermaid
graph LR
    subgraph "Dashboard Application"
        subgraph "App Directory Structure"
            APP[app/]
            APP --> AUTH[(auth)]
            APP --> DASH[dashboard/]
            DASH --> PIPE[pipeline/]
            DASH --> CALL[caller/]
            DASH --> ANAL[analytics/]
            APP --> API[api/]
        end
        
        subgraph "Components"
            COMP[components/]
            COMP --> UI[ui/]
            COMP --> CHARTS[charts/]
            COMP --> ANIM[animations/]
            COMP --> SHARED[shared/]
        end
        
        subgraph "Libraries"
            LIB[lib/]
            LIB --> SUP[supabase/]
            LIB --> KAF[kafka/]
            LIB --> RED[redis/]
            LIB --> UTIL[utils/]
        end
        
        subgraph "State & Hooks"
            STORES[stores/]
            HOOKS[hooks/]
            STORES --> PIPE_STORE[pipelineStore]
            STORES --> CALL_STORE[callerStore]
            HOOKS --> USE_RT[useRealtime]
            HOOKS --> USE_CH[useCharts]
        end
    end
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Dashboard UI
    participant WS as WebSocket
    participant API as API Routes
    participant K as Kafka
    participant S as Supabase
    participant P as Pipeline
    participant C as Caller
    
    U->>UI: Navigate to Pipeline Tab
    UI->>API: Fetch Initial Data
    API->>S: Query Prospects
    S-->>API: Return Data
    API-->>UI: Send Data
    UI->>WS: Subscribe to Updates
    
    P->>K: Publish Research Complete
    K->>WS: Consume Event
    WS->>UI: Push Update
    UI->>UI: Update Charts
    
    U->>UI: Trigger Call Campaign
    UI->>API: Start Campaign
    API->>C: Initiate Calls
    C->>K: Publish Call Events
    K->>WS: Consume Events
    WS->>UI: Real-time Updates
```

## Pipeline Tab Architecture

```mermaid
graph TD
    subgraph "Pipeline Tab Components"
        PM[Pipeline Manager]
        PM --> RD[Research Dashboard]
        PM --> PA[Pipeline Analytics]
        PM --> AC[Agent Control]
        
        RD --> RM[Research Monitor]
        RD --> AH[API Health]
        RD --> RQ[Research Queue]
        
        PA --> SF[Stage Funnel - D3]
        PA --> HM[Heat Map - Plotly]
        PA --> TS[Timeline - Chart.js]
        
        AC --> AS[Agent Status]
        AC --> TQ[Task Queue]
        AC --> PM2[Performance Metrics]
    end
    
    subgraph "Data Sources"
        RD --> KT1[pipeline.research.*]
        PA --> DB1[(Prospects Table)]
        AC --> KT2[pipeline.agent.*]
    end
    
    subgraph "Visualizations"
        SF --> D3V[D3.js Sankey]
        HM --> PLV[Plotly Geo]
        TS --> CJV[Chart.js Line]
    end
```

## Caller Tab Architecture

```mermaid
graph TD
    subgraph "Caller Tab Components"
        CM[Caller Manager]
        CM --> LM[Live Monitor]
        CM --> CP[Campaign Panel]
        CM --> VA[Voice Analytics]
        
        LM --> CD[Call Display]
        LM --> TR[Transcription]
        LM --> SA[Sentiment Analysis]
        
        CP --> CW[Campaign Wizard]
        CP --> CL[Call Lists]
        CP --> SC[Schedules]
        
        VA --> CO[Call Outcomes]
        VA --> CV[Conversion Tracking]
        VA --> SE[Script Effectiveness]
    end
    
    subgraph "Real-time Data"
        LM --> WS1[WebSocket]
        TR --> KT3[caller.transcript.*]
        SA --> AI[AI Analysis]
    end
    
    subgraph "Visualizations"
        CD --> TH3[Three.js Waveform]
        CO --> AC3[ApexCharts]
        CV --> CJ3[Chart.js Funnel]
    end
```

## Database Schema

```mermaid
erDiagram
    PROSPECTS ||--o{ CALLS : receives
    PROSPECTS ||--o{ RESEARCH_PASSES : has
    CAMPAIGNS ||--o{ CALLS : contains
    CALLS ||--o{ CALL_EVENTS : generates
    
    PROSPECTS {
        uuid id PK
        string lead_name
        string company
        string phone
        string email
        string stage
        decimal opportunity_value
        date expected_close
        string status
        string temp
        int likelihood_score
        string decision_maker
        string industry
        timestamp last_contact
        int call_count
        text notes
    }
    
    CALLS {
        uuid id PK
        uuid prospect_id FK
        uuid campaign_id FK
        string call_sid
        timestamp initiated_at
        timestamp completed_at
        int duration_seconds
        string outcome
        text transcript
        float sentiment_score
        decimal cost
        string recording_url
    }
    
    CAMPAIGNS {
        uuid id PK
        string name
        string script_variant
        timestamp start_date
        timestamp end_date
        json settings
        string status
    }
    
    RESEARCH_PASSES {
        uuid id PK
        uuid prospect_id FK
        int pass_number
        string source
        json data
        string status
        timestamp completed_at
    }
    
    CALL_EVENTS {
        uuid id PK
        uuid call_id FK
        string event_type
        json payload
        timestamp occurred_at
    }
```

## Kafka Topic Architecture

```mermaid
graph LR
    subgraph "Pipeline Topics"
        PT1[pipeline.research.started]
        PT2[pipeline.research.completed]
        PT3[pipeline.prospect.qualified]
        PT4[pipeline.agent.status]
    end
    
    subgraph "Caller Topics"
        CT1[caller.call.initiated]
        CT2[caller.call.completed]
        CT3[caller.transcript.chunk]
        CT4[caller.sentiment.update]
    end
    
    subgraph "Analytics Topics"
        AT1[analytics.event.tracked]
        AT2[analytics.metric.calculated]
        AT3[analytics.report.generated]
    end
    
    subgraph "Consumers"
        DC[Dashboard Consumer]
        AC[Analytics Consumer]
        NC[Notification Consumer]
    end
    
    PT1 --> DC
    PT2 --> DC
    PT3 --> DC
    CT1 --> DC
    CT2 --> DC
    CT3 --> DC
    
    PT2 --> AC
    CT2 --> AC
    AT1 --> AC
    
    PT3 --> NC
    CT2 --> NC
```

## Animation & Interaction Flow

```mermaid
graph TD
    subgraph "User Interactions"
        UI1[User Hovers Chart]
        UI2[User Clicks Pipeline Stage]
        UI3[User Drags 3D View]
        UI4[User Filters Data]
    end
    
    subgraph "Animation Libraries"
        FM[Framer Motion]
        TJ[Three.js]
        AJ[Anime.js]
        RM[Remotion]
    end
    
    subgraph "Animation Effects"
        UI1 --> FM
        FM --> AE1[Tooltip Fade In]
        
        UI2 --> AJ
        AJ --> AE2[Stage Transition]
        
        UI3 --> TJ
        TJ --> AE3[3D Rotation]
        
        UI4 --> FM
        FM --> AE4[List Reorder]
    end
    
    subgraph "Report Generation"
        RG[Generate Report]
        RG --> RM
        RM --> VID[Video Export]
        RM --> PDF[PDF Export]
    end
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development Environment"
        DEV[Local Development]
        DEV --> DC1[Docker Compose]
        DC1 --> LC[Local Containers]
        LC --> LP[Postgres]
        LC --> LK[Kafka]
        LC --> LR[Redis]
    end
    
    subgraph "Production Environment"
        PROD[Production]
        PROD --> VPS[Vercel/Next.js]
        PROD --> SBC[Supabase Cloud]
        PROD --> KC[Confluent Kafka]
        PROD --> RC[Redis Cloud]
    end
    
    subgraph "CI/CD Pipeline"
        GH[GitHub]
        GH --> GA[GitHub Actions]
        GA --> TEST[Run Tests]
        TEST --> BUILD[Build Docker Images]
        BUILD --> DEPLOY[Deploy to Production]
    end
    
    DEV --> GH
    DEPLOY --> PROD
```

## Security Architecture

```mermaid
graph TD
    subgraph "Authentication Layer"
        AUTH[NextAuth.js]
        AUTH --> PROV[Providers]
        PROV --> CRED[Credentials]
        PROV --> OAUTH[OAuth]
        PROV --> SAML[SAML SSO]
    end
    
    subgraph "Authorization"
        RBAC[Role-Based Access]
        RBAC --> ADMIN[Admin Role]
        RBAC --> MGR[Manager Role]
        RBAC --> USER[User Role]
    end
    
    subgraph "Data Security"
        ENC[Encryption]
        ENC --> TLS[TLS in Transit]
        ENC --> AES[AES at Rest]
        
        MASK[PII Masking]
        MASK --> LOGS[Log Masking]
        MASK --> ANAL[Analytics Masking]
    end
    
    subgraph "API Security"
        RATE[Rate Limiting]
        CORS[CORS Policy]
        CSP[Content Security Policy]
        JWT[JWT Tokens]
    end
    
    AUTH --> RBAC
    RBAC --> API[API Access]
    API --> RATE
    API --> JWT
```

## Performance Optimization Strategy

```mermaid
graph LR
    subgraph "Frontend Optimization"
        LAZY[Lazy Loading]
        LAZY --> COMP[Components]
        LAZY --> CHARTS[Chart Libraries]
        
        CACHE[Caching]
        CACHE --> SWR[SWR Strategy]
        CACHE --> RQ[React Query]
        
        BUNDLE[Bundle Optimization]
        BUNDLE --> SPLIT[Code Splitting]
        BUNDLE --> TREE[Tree Shaking]
    end
    
    subgraph "Backend Optimization"
        REDIS[Redis Cache]
        REDIS --> FREQ[Frequent Queries]
        REDIS --> SESS[Sessions]
        
        IDX[Database Indexing]
        IDX --> PROS[Prospects Index]
        IDX --> CALL[Calls Index]
        
        BATCH[Batch Processing]
        BATCH --> BULK[Bulk Updates]
        BATCH --> QUEUE[Job Queue]
    end
    
    subgraph "Real-time Optimization"
        DEBOUNCE[Debouncing]
        THROTTLE[Throttling]
        PAGINATION[Pagination]
        
        DEBOUNCE --> WS[WebSocket Events]
        THROTTLE --> UPDATE[UI Updates]
        PAGINATION --> DATA[Large Datasets]
    end
```

---

**Note**: These diagrams represent the complete architecture of the Unified Sales Dashboard. Each component is designed for scalability, maintainability, and optimal performance. The architecture supports both real-time updates and offline capabilities through strategic caching and local-first design patterns.