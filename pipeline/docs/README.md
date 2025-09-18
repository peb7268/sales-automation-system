# Sales Pipeline Component Documentation

The Sales Pipeline component provides intelligent prospect research, data management, and pipeline tracking for the sales automation system.

## 🎯 Overview

This component handles the data and research portion of the sales automation system, including:
- 5-pass AI-powered prospect research
- Google Sheets pipeline management
- Data quality validation and scoring
- Integration with research APIs and services

## 📖 Documentation Structure

### Core Platforms
- **[Google Sheets Integration](google-sheets/index.md)** - Pipeline tracking and collaboration
- **[Google Drive Integration](google-drive/index.md)** - File storage and asset management

### Research System
- **[Quick Start Guide](QUICK_START.md)** - Get started with the pipeline system
- **[Agent Documentation](agents/pitch-creator-agent.md)** - AI agent for pitch creation

### Legacy Documentation
- **[Task Management System](JSON_TASK_MANAGEMENT.md)** - Historical task management approach
- **[TaskMaster Removal](TASKMASTER_REMOVAL_COMPLETE.md)** - Migration documentation

## 🚀 Quick Start

### Prerequisites
- Google account with Sheets/Drive access
- API keys for research services (Google Maps, Firecrawl, Perplexity)
- Node.js 18+ for running research commands

### Basic Setup
1. **[Configure Google Sheets](google-sheets/index.md#step-by-step-setup-guide)** - Set up pipeline tracking
2. **[Setup Google Drive](google-drive/index.md#step-3-configure-api-access)** - Configure file storage
3. **[Install Dependencies](../README.md#installation)** - Install Node.js packages

## 🛠 Key Features

### Research System
- **5-Pass Research**: Comprehensive business intelligence gathering
- **Google Maps Integration**: Business location and contact data
- **Web Scraping**: Firecrawl-powered website analysis
- **Competitive Analysis**: Perplexity AI market research

### Data Management
- **Google Sheets Pipeline**: Real-time collaborative tracking
- **Data Validation**: Quality checks and formatting rules
- **Automated Scoring**: Qualification and likelihood scoring
- **File Storage**: Centralized asset management

## 🔧 Component Architecture

```
Business Discovery → Research Pipeline → Data Validation → Google Sheets → Calling System
```

### Research Passes
1. **Google Maps**: Basic business information and location data
2. **Firecrawl**: Website content and structure analysis  
3. **Reviews**: Customer feedback and reputation analysis
4. **Additional Sources**: Yellow Pages and directory data
5. **Competitive Analysis**: Market positioning and strategy

## 📊 Data Schema

### Google Sheets Structure (15 fields)
- **Lead Name**: Prospect contact name
- **Company**: Business name
- **Contact Phone**: Primary phone number
- **Contact Email**: Primary email address
- **Stage**: Sales pipeline stage
- **Opportunity Value**: Potential revenue
- **Expected Close Date**: Target close date
- **Status**: Current contact status
- **Temp**: Temperature (Hot/Warm/Cold)
- **Likelihood to Close**: Percentage score
- **DM**: Decision maker name
- **Industry**: Business sector
- **Last Contact**: Last interaction date
- **Call Count**: Number of contact attempts
- **Notes**: Call notes and next actions

## 🆘 Troubleshooting

### Common Issues
1. **API Failures**: Check API keys and quota limits
2. **Google Sheets Access**: Verify sharing permissions
3. **Research Incomplete**: Retry failed research passes
4. **Data Validation**: Check field formatting and required fields

### Support Resources
- **Google Sheets API**: https://developers.google.com/sheets/api
- **Google Drive API**: https://developers.google.com/drive
- **Firecrawl Docs**: https://docs.firecrawl.dev

---

*For complete system overview, see: [../README.md](../README.md)*
*For caller integration, see: [../caller/docs/README.md](../caller/docs/README.md)*