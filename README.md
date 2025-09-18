# Mile High Marketing Sales Automation System

A comprehensive AI-powered sales automation platform that combines intelligent prospect research, automated voice calling, pipeline management, and seamless client conversion workflows.

## 🎯 System Overview

The MHM Sales Automation System automates the complete B2B sales process from prospect discovery through client onboarding, leveraging AI agents, voice automation, and intelligent pipeline management.

### Architecture Components

```
projects/sales/
├── pipeline/              # Prospect research & data management
├── caller/                # AI voice calling system  
├── clients/              # CRM data repository
├── bin/                  # Automation scripts
└── integrations/         # External service connectors
```

### Data Flow

```
Prospect Discovery → Research Pipeline → Voice Outreach → Qualification → Client Conversion
```

## 📋 Complete Setup Guide

Follow this guide sequentially to understand and set up the entire system.

### 1. Understanding the Components

#### Sales Pipeline Component (`pipeline/`)
**Purpose**: Intelligent prospect research and data management
- 5-pass AI research system
- Google Sheets integration for collaboration
- Data quality validation and scoring

📚 **[Read Pipeline Documentation →](pipeline/docs/README.md)**

#### Sales Caller Component (`caller/`)  
**Purpose**: Automated voice outreach and qualification
- AI-powered conversation handling
- Call recording and analysis
- Automated follow-up scheduling

📚 **[Read Caller Documentation →](caller/docs/README.md)**

### 2. Understanding the Technology Stack

#### Voice Calling Platform: Vapi AI
**What it does**: Powers natural AI conversations for prospect qualification
**Why we use it**: Human-like voice interactions with GPT-4 intelligence
**Setup difficulty**: Medium - requires API keys and phone number

📚 **[Complete Vapi Setup Guide →](caller/docs/vapi/index.md)**

#### Telephony Service: Twilio  
**What it does**: Provides reliable phone infrastructure
**Why we use it**: Better call quality and global coverage
**Setup difficulty**: Easy - purchase number and configure

📚 **[Complete Twilio Setup Guide →](caller/docs/twilio/index.md)**

#### Workflow Automation: Make.com
**What it does**: Orchestrates the entire calling workflow
**Why we use it**: Visual automation without coding
**Setup difficulty**: Medium - requires manual configuration

📚 **[Complete Make.com Setup Guide →](caller/docs/makecom/index.md)**

#### Data Storage: Google Sheets
**What it does**: Centralized pipeline tracking and collaboration
**Why we use it**: Real-time collaboration with sales team
**Setup difficulty**: Easy - shared spreadsheet with API access

📚 **[Complete Google Sheets Setup Guide →](pipeline/docs/google-sheets/index.md)**

#### File Management: Google Drive
**What it does**: Stores sales scripts, call recordings, and assets
**Why we use it**: Centralized file access for automation
**Setup difficulty**: Easy - shared folder with API access

📚 **[Complete Google Drive Setup Guide →](pipeline/docs/google-drive/index.md)**

## 🚀 Quick Start (30 minutes)

### Prerequisites Check
- [ ] Node.js 18+ installed
- [ ] Google account with Sheets/Drive access
- [ ] Basic understanding of API keys
- [ ] 30 minutes for initial setup

### Step 1: Environment Setup (5 minutes)
```bash
# Navigate to project
cd /Users/pbarrick/Desktop/dev/MHM/projects/sales

# Install dependencies
cd pipeline && npm install && cd ..
cd caller && npm install && cd ..

# Copy environment template
cp environment.env .env
```

### Step 2: Configure Core Services (15 minutes)

#### Required API Keys:
```bash
# Edit .env file with these required keys:

# Vapi AI (Voice calling)
VAPI_API_KEY="your_vapi_key"
VAPI_PHONE_NUMBER_ID="your_phone_number_id"

# Google Services (Pipeline & Storage)  
GOOGLE_SHEETS_ID="1DQWtvs4DDWbkVal8LdzGruqfXunpqhQqKeo7dOIS-Ys"
GOOGLE_DRIVE_FOLDER_ID="1EJxKtbp65kWMLmXF-nfYURd44H-dtCQS"

# Make.com (Automation)
MAKECOM_WEBHOOK_URL="https://hook.us2.make.com/gugssi64ofbr3vgny705qg2tdsvrgjlx"
MAKECOM_API_KEY="your_makecom_key"
```

**🔗 Get API Keys:**
- **Vapi AI**: [Sign up at vapi.ai](https://vapi.ai) → Dashboard → API Keys
- **Make.com**: [Sign up at make.com](https://make.com) → Account → API Keys  
- **Google APIs**: [Google Cloud Console](https://console.cloud.google.com) → Enable APIs

### Step 3: Test System Health (5 minutes)
```bash
# Test all API connections
./test_webhook.sh your_makecom_api_key

# Verify Google Sheets access
curl "https://docs.google.com/spreadsheets/d/1DQWtvs4DDWbkVal8LdzGruqfXunpqhQqKeo7dOIS-Ys/edit"

# Test Vapi connectivity  
curl -H "Authorization: Bearer $VAPI_API_KEY" https://api.vapi.ai/account
```

### Step 4: First Test Call (5 minutes)
```bash
# Use test data to verify end-to-end workflow
cd caller/docs/makecom
./test_webhook.sh your_makecom_api_key
# This tests all 4 call outcome scenarios
```

## 📖 Progressive Learning Path

### Beginner: Understanding the Basics (30 minutes)

1. **[What is Vapi AI?](caller/docs/vapi/index.md)** (10 min)
   - Learn about AI voice calling
   - Understand conversation flows
   - See sample API requests

2. **[What is Make.com?](caller/docs/makecom/index.md)** (10 min)
   - Visual workflow automation
   - Trigger and action concepts
   - Webhook integrations

3. **[What is Google Sheets Integration?](pipeline/docs/google-sheets/index.md)** (10 min)
   - Pipeline tracking structure
   - Data validation rules
   - Real-time collaboration

### Intermediate: Setting Up Services (60 minutes)

4. **[Complete Vapi Setup](caller/docs/vapi/index.md#step-by-step-setup-guide)** (20 min)
   - Create account and get API keys
   - Configure assistant with GPT-4
   - Set up voice and phone number

5. **[Complete Make.com Workflow](caller/docs/makecom/makecom_manual_setup.md)** (30 min)
   - Build 11-module automation scenario
   - Configure all triggers and actions
   - Test individual modules

6. **[Configure Twilio Integration](caller/docs/twilio/index.md)** (10 min)
   - Purchase phone number
   - Connect to Vapi for better call quality
   - Test call connectivity

### Advanced: Full Integration (90 minutes)

7. **[Google Drive File Management](pipeline/docs/google-drive/index.md)** (20 min)
   - Set up shared folder structure
   - Configure API access
   - Upload sales scripts

8. **[Google Sheets Data Schema](pipeline/docs/google-sheets/index.md#step-2-configure-data-schema)** (20 min)
   - 15-field prospect tracking
   - Data validation rules
   - Conditional formatting

9. **[End-to-End Testing](caller/docs/makecom/index.md#testing--validation)** (30 min)
   - Test complete workflow
   - Verify data updates
   - Monitor call results

10. **[Production Deployment](caller/docs/deployment_guide.md)** (20 min)
    - Enable live calling
    - Monitor performance
    - Set up error alerts

## 🔧 System Components Deep Dive

### Sales Pipeline Component
**Location**: `pipeline/`
**Purpose**: Prospect research and data management

#### Key Features:
- **5-Pass Research System**: Comprehensive business intelligence
- **Google Sheets Integration**: Real-time pipeline collaboration  
- **Data Quality Validation**: Ensures accuracy and completeness

#### Commands:
```bash
cd pipeline
npm run prospect:enhanced    # Full research
npm run analytics:update     # Update dashboards
```

📚 **[Complete Pipeline Guide →](pipeline/docs/README.md)**

### Sales Caller Component  
**Location**: `caller/`
**Purpose**: Automated voice outreach and qualification

#### Key Features:
- **Vapi AI Integration**: Natural conversation AI
- **Dynamic Scripts**: Personalized based on research
- **Call Recording**: Quality assurance and compliance

#### Commands:
```bash
cd caller
npm run test:vapi           # Test voice system
./test_webhook.sh          # Test automation
```

📚 **[Complete Caller Guide →](caller/docs/README.md)**

## 🛠 Tool-Specific Documentation

### Voice & Telephony
- **[Vapi AI Complete Guide](caller/docs/vapi/index.md)** - AI conversation platform
- **[Twilio Integration Guide](caller/docs/twilio/index.md)** - Professional telephony
- **[Make.com Automation Guide](caller/docs/makecom/index.md)** - Workflow orchestration

### Data & Storage  
- **[Google Sheets Integration](pipeline/docs/google-sheets/index.md)** - Pipeline tracking
- **[Google Drive File Management](pipeline/docs/google-drive/index.md)** - Asset storage

### Each guide includes:
- ✅ **What the tool does** and why we use it
- ✅ **Step-by-step setup** with screenshots
- ✅ **API integration examples** with code
- ✅ **Troubleshooting guide** for common issues
- ✅ **Security best practices** and compliance
- ✅ **Performance optimization** tips

## 📊 Current System Status

### Deployed Assets ✅
- **Sales Script**: Comprehensive call template with personalization
- **Google Sheets**: Pipeline with 15-field schema and sample data
- **Make.com Setup**: Complete 11-module manual configuration guide
- **Testing Framework**: 4-scenario webhook validation
- **Environment Config**: All URLs and API endpoints configured

### Ready for Deployment 🚀
1. **Upload sales script** to Google Drive folder
2. **Configure Make.com scenario** using manual setup guide (30 min)
3. **Test with webhook script** using your API key
4. **Enable live calling** and monitor results

### System URLs
- **Google Sheets**: https://docs.google.com/spreadsheets/d/1DQWtvs4DDWbkVal8LdzGruqfXunpqhQqKeo7dOIS-Ys/edit
- **Google Drive**: https://drive.google.com/drive/folders/1EJxKtbp65kWMLmXF-nfYURd44H-dtCQS
- **Webhook URL**: https://hook.us2.make.com/gugssi64ofbr3vgny705qg2tdsvrgjlx

## 🆘 Troubleshooting Quick Reference

### API Connection Issues
```bash
# Test all services
curl -I https://hook.us2.make.com/gugssi64ofbr3vgny705qg2tdsvrgjlx  # Should return 401
curl -H "Authorization: Bearer $VAPI_API_KEY" https://api.vapi.ai/account
```

### Common Problems
1. **Webhook 401 Error**: Check x-make-apikey header in Make.com
2. **Vapi Call Fails**: Verify API key and phone number ID  
3. **Google Sheets Access**: Confirm sharing permissions
4. **Make.com Not Triggering**: Check "Uncontacted" filter exact match

### Support Resources
- **Make.com Docs**: https://www.make.com/en/help
- **Vapi AI Docs**: https://docs.vapi.ai  
- **Twilio Docs**: https://www.twilio.com/docs
- **Google APIs**: https://developers.google.com

## 🎯 Next Steps

### After Setup (Choose your path):

#### Option 1: Sales Team Member
- [ ] **[Learn Vapi basics](caller/docs/vapi/index.md)** - Understand the voice AI
- [ ] **[Review call scripts](caller/docs/vapi/sales_script.txt)** - Learn the conversation flow
- [ ] **[Practice with Google Sheets](pipeline/docs/google-sheets/index.md)** - Update prospect data
- [ ] Start with manual prospecting and calling

#### Option 2: Technical Implementer  
- [ ] **[Complete Make.com setup](caller/docs/makecom/makecom_manual_setup.md)** - Build the automation
- [ ] **[Configure all APIs](caller/docs/makecom/index.md#step-5-configure-environment-variables)** - Get proper keys
- [ ] **[Run full testing](caller/docs/makecom/test_webhook.sh)** - Validate everything works
- [ ] Deploy to production environment

#### Option 3: System Administrator
- [ ] **[Review security guides](caller/docs/vapi/index.md#security-considerations)** - Understand compliance
- [ ] **[Set up monitoring](caller/docs/makecom/index.md#performance-optimization)** - Track system health
- [ ] **[Configure backups](pipeline/docs/google-drive/index.md#data-retention)** - Protect data
- [ ] Establish operational procedures

---

**Version**: 2.0.0  
**Last Updated**: September 17, 2025  
**Maintained By**: Mile High Marketing Development Team

📧 **Need Help?** Each component has detailed troubleshooting guides and the documentation includes step-by-step instructions assuming no prior knowledge of the tools.