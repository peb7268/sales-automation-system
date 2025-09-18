# PRD: Automated Sales Caller v2 - Enhanced Implementation

## Document Info
- **Status**: Active Development - Enhanced Architecture
- **Priority**: High
- **Owner**: MHM Development Team
- **Created**: 2025-09-17
- **Version**: 2.0
- **Previous Version**: [v1-prd.md](./v1-prd.md)

## What's New in v2
- **Simplified Architecture**: Choice between Make.com and n8n (removing complexity)
- **Enhanced Pipeline Tracking**: Additional fields for better lead qualification
- **Google Drive Integration**: Centralized file management strategy
- **Rapid Deployment**: 1-3 hour implementation timeline
- **Improved Data Schema**: Temperature scoring, decision maker tracking, close probability

## Executive Summary

Build a streamlined automated sales calling system that leverages Vapi AI for natural conversations, integrates with Google Drive for centralized management, and provides flexible workflow automation through Make.com or n8n. This system automates outbound calling, qualification, and pipeline management while maintaining simplicity and rapid deployment capability.

## Problem Statement

The original v1 architecture, while comprehensive, introduced unnecessary complexity with multiple integration points and scattered data management. Sales teams need a simpler, faster-to-deploy solution that can be operational in hours, not weeks, while still delivering professional automated calling capabilities.

## Solution Architecture

### Simplified Tech Stack

#### Core Components
1. **Voice AI**: Vapi AI (natural conversation engine)
2. **Telephony**: Twilio (phone infrastructure)
3. **Automation**: Make.com OR n8n (choose one)
4. **Data Storage**: Google Drive + Sheets (unified storage)
5. **Local Sync**: Google Drive File Stream on Mac

#### Architecture Decision
```
Google Drive Folder (Single Source of Truth)
    ├── sales_script.txt (Call scripts)
    ├── sales_pipeline.csv/sheets (Lead tracking)
    └── call_logs/ (Results & recordings)
           ↓
    Make.com/n8n Workflow
           ↓
    Vapi AI + Twilio
           ↓
    Pipeline Updates
```

## Enhanced Data Model

### Pipeline Tracker Schema v2

```csv
Lead Name,Company,Contact Phone,Contact Email,Stage,Opportunity Value,Expected Close Date,Status,Temp,Likelihood to Close,DM,Industry,Last Contact,Call Count,Notes
```

#### New Fields in v2
- **Temp**: Interest temperature (Cold/Warm/Hot)
- **Likelihood to Close**: Percentage score (0-100)
- **DM**: Decision maker name
- **Industry**: For script customization
- **Last Contact**: Timestamp of last interaction
- **Call Count**: Number of attempts made

### Stage Definitions
1. **Lead**: Unqualified prospect
2. **Opportunity**: Qualified, interested
3. **Demo**: Product demonstration scheduled
4. **Quote**: Proposal sent
5. **Negotiation**: Terms discussion
6. **Closed Won/Lost**: Final outcome

## Environment Configuration

### Production URLs & Endpoints

#### Google Drive Assets
- **Sales Folder**: https://drive.google.com/drive/folders/1EJxKtbp65kWMLmXF-nfYURd44H-dtCQS?usp=sharing
- **Access**: Public link (temporary for development)
- **Contents**: sales_script.txt, sales_pipeline.csv, call_logs/

#### Make.com Integration
- **Webhook Name**: sales-caller-webhook  
- **Webhook URL**: https://hook.us2.make.com/gugssi64ofbr3vgny705qg2tdsvrgjlx
- **Purpose**: Handles Vapi call results and pipeline updates
- **Authentication**: API key required via `x-make-apikey` HTTP header
- **Security**: API key authentication enables secure access

#### Required Environment Variables
```bash
# Vapi AI Configuration
VAPI_API_KEY="[from Vapi dashboard]"
VAPI_ASSISTANT_ID="[created assistant ID]"

# Twilio Configuration  
TWILIO_ACCOUNT_SID="[from Twilio dashboard]"
TWILIO_AUTH_TOKEN="[from Twilio dashboard]"
TWILIO_PHONE_NUMBER="[purchased number]"

# Make.com Integration
MAKECOM_WEBHOOK_URL="https://hook.us2.make.com/gugssi64ofbr3vgny705qg2tdsvrgjlx"
MAKECOM_WEBHOOK_NAME="sales-caller-webhook"
MAKECOM_API_KEY="[API key for x-make-apikey header]"

# Google Drive Configuration
GOOGLE_DRIVE_FOLDER_ID="1EJxKtbp65kWMLmXF-nfYURd44H-dtCQS"
GOOGLE_DRIVE_FOLDER_URL="https://drive.google.com/drive/folders/1EJxKtbp65kWMLmXF-nfYURd44H-dtCQS?usp=sharing"
```

## Implementation Requirements

### Phase 1: Rapid Setup (1-3 Hours)

#### Hour 1: Foundation
1. **Google Drive Setup** (20 min)
   - Access Sales-Caller folder: https://drive.google.com/drive/folders/1EJxKtbp65kWMLmXF-nfYURd44H-dtCQS?usp=sharing
   - Upload sales_script.txt template
   - Create sales_pipeline.csv with v2 schema
   - Enable Google Drive sync on Mac

2. **API Configuration** (20 min)
   - Vapi AI account and assistant setup
   - Twilio phone number acquisition
   - Make.com account creation
   - Configure sales-caller-webhook: https://hook.us2.make.com/gugssi64ofbr3vgny705qg2tdsvrgjlx

3. **Basic Workflow** (20 min)
   - Connect Google Sheets/Drive modules
   - Configure Vapi API calls
   - Set up status updates

#### Hour 2: Integration
1. **Script Management** (20 min)
   - Create dynamic script with variables
   - Test personalization tokens
   - Set up context passing

2. **Call Flow** (20 min)
   - Configure call initiation
   - Set up webhook handling
   - Test single call

3. **Pipeline Updates** (20 min)
   - Automatic status changes
   - Temperature scoring logic
   - Note capture

#### Hour 3: Testing & Polish
1. **End-to-End Testing** (30 min)
   - Test with 3-5 sample leads
   - Verify data updates
   - Check call quality

2. **Error Handling** (30 min)
   - Add retry logic
   - Configure notifications
   - Set up monitoring

### Phase 2: Enhancement (Week 1)

#### Advanced Features
1. **Multi-Script Support**
   - Industry-specific scripts
   - A/B testing capability
   - Dynamic script selection

2. **Intelligent Scheduling**
   - Time zone detection
   - Optimal calling windows
   - Callback scheduling

3. **Analytics Dashboard**
   - Call success metrics
   - Conversion tracking
   - ROI calculation

### Phase 3: Scale (Week 2-3)

#### Production Readiness
1. **Volume Testing**
   - 50+ calls per day
   - Batch processing
   - Queue management

2. **Advanced Integration**
   - Linear project creation
   - CRM synchronization
   - Email sequences

## Workflow Automation Details

### Make.com Implementation

#### Scenario Structure
```json
{
  "name": "Sales Caller v2",
  "webhook": {
    "name": "sales-caller-webhook",
    "url": "https://hook.us2.make.com/gugssi64ofbr3vgny705qg2tdsvrgjlx"
  },
  "trigger": "Google Sheets - Watch Rows",
  "actions": [
    "Google Drive - Download sales_script.txt",
    "HTTP - Call Vapi API with context",
    "Webhook - Receive call results via sales-caller-webhook",
    "Router - Handle call outcomes",
    "Google Sheets - Update row with results"
  ]
}
```

#### Vapi Call Payload
```json
{
  "to": "{{phone}}",
  "assistant_id": "{{VAPI_ASSISTANT_ID}}",
  "prompt": "{{script_content}}",
  "context": {
    "lead_name": "{{name}}",
    "company": "{{company}}",
    "dm": "{{decision_maker}}",
    "temp": "{{temperature}}",
    "industry": "{{industry}}",
    "value": "{{opportunity_value}}"
  }
}
```

### n8n Alternative Implementation

#### Workflow Nodes
1. **Schedule Trigger** - Daily at optimal times
2. **Google Sheets** - Read uncontacted leads
3. **Code Node** - Process and filter leads
4. **HTTP Request** - Vapi API call
5. **Switch** - Route based on outcome
6. **Google Sheets** - Update results

## Success Metrics

### Technical KPIs
- **Setup Time**: < 3 hours
- **Call Success Rate**: > 80%
- **Data Sync Accuracy**: > 99%
- **System Uptime**: > 99.5%

### Business KPIs
- **Contact Rate**: 30%+ (vs 25% industry standard)
- **Qualification Rate**: 15%+ (vs 10% industry)
- **Meeting Booking**: 5%+ (vs 3% industry)
- **Cost per Qualified Lead**: < $6

### Quality Metrics
- **Script Adherence**: 95%+
- **Conversation Natural Score**: 4/5
- **Data Capture Completeness**: 90%+
- **Follow-up Execution**: 100%

## Cost Analysis

### Setup Costs
- **Development Time**: 3 hours @ $150 = $450
- **Configuration**: Included in setup
- **Testing**: Included in setup
- **Total One-Time**: $450

### Monthly Operating Costs
- **Vapi AI**: $200 (1,000 minutes @ $0.20/min)
- **Make.com**: $20 (Core plan)
- **Twilio**: $50 (number + usage)
- **Google Workspace**: $12 (if not existing)
- **Total Monthly**: $282

### ROI Calculation
- **Calls per Month**: 1,100
- **Qualified Leads**: 50
- **Cost per Lead**: $5.64
- **Client Conversion**: 15% = 7.5 clients
- **Average Client Value**: $2,500/month
- **Monthly Revenue**: $18,750
- **ROI**: 6,548%

## Risk Mitigation

### Technical Risks
| Risk | Mitigation |
|------|------------|
| API Downtime | Fallback to manual calling queue |
| Data Loss | Google Drive auto-backup + versioning |
| Poor Call Quality | Script optimization, A/B testing |
| Integration Breaks | Webhook monitoring, alerts |

### Business Risks
| Risk | Mitigation |
|------|------------|
| Low Contact Rate | Multi-channel follow-up |
| Compliance Issues | TCPA training, time restrictions |
| Negative Reception | Professional scripts, opt-out handling |
| Scaling Problems | Gradual volume increase |

## Implementation Checklist

### Pre-Setup (30 min)
- [ ] Create Google account (if needed)
- [ ] Install Google Drive on Mac
- [ ] Sign up for Vapi AI
- [ ] Create Twilio account
- [ ] Choose Make.com or n8n

### Hour 1: Foundation
- [ ] Create Google Drive folder structure
- [ ] Upload initial sales_script.txt
- [ ] Create sales_pipeline.csv with v2 schema
- [ ] Configure API keys
- [ ] Set up phone number

### Hour 2: Build
- [ ] Create automation workflow
- [ ] Connect Google Sheets
- [ ] Configure Vapi calls
- [ ] Set up data updates
- [ ] Add error handling

### Hour 3: Test
- [ ] Test with single lead
- [ ] Verify data flow
- [ ] Check call quality
- [ ] Test error scenarios
- [ ] Deploy for production

## Migration Path from v1

### For Existing v1 Users
1. **Data Migration**: Export existing prospect data to v2 schema
2. **Script Consolidation**: Move all scripts to Google Drive
3. **Workflow Simplification**: Replace complex integrations with Make.com/n8n
4. **Testing**: Run parallel for 1 week before cutover

### Key Differences from v1
- **Simpler Architecture**: Single automation platform instead of multiple
- **Faster Deployment**: 3 hours vs 6 weeks
- **Centralized Storage**: Google Drive vs distributed systems
- **Enhanced Tracking**: Temperature and decision maker fields
- **Lower Complexity**: Fewer integration points

## Future Enhancements

### Version 2.1 (Month 2)
- SMS follow-up integration
- Voicemail drop capability
- Call recording transcription
- Sentiment analysis

### Version 2.2 (Month 3)
- Multi-language support
- Advanced lead scoring AI
- Predictive best time to call
- Integration with major CRMs

### Version 3.0 (Month 6)
- Full conversation AI with objection handling
- Automatic meeting scheduling
- Multi-channel orchestration
- Advanced analytics dashboard

## Support & Documentation

### Quick Links
- [Implementation Notes](../implementation-notes.md)
- [Research & Analysis](../research.md)
- [Development Progress](../progress.md)
- [Change Log](../change-log.md)

### Training Resources
- Setup video walkthrough
- Script writing guide
- Best practices document
- Troubleshooting guide

## Conclusion

Version 2 of the Automated Sales Caller represents a significant simplification and enhancement over v1. By leveraging Google Drive as a central hub and choosing a single automation platform, we've reduced setup time from weeks to hours while maintaining professional capability. The enhanced data model with temperature scoring and decision maker tracking provides better qualification, while the simplified architecture ensures reliability and ease of maintenance.

This approach delivers immediate value with minimal investment, allowing sales teams to start automating their outbound calling within a single morning while maintaining the flexibility to scale and enhance as needs grow.

---

**Approval Required From:**
- Sales Team Lead
- Technical Lead
- Operations Manager

**Next Steps:**
1. Review and approve PRD v2
2. Allocate 3 hours for initial setup
3. Begin with 10-lead pilot
4. Scale to full operations