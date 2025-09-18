# Sales Caller v1

AI-powered automated calling system for Mile High Marketing prospect outreach.

## Overview

This system integrates Vapi AI, Twilio, and Make.com to automate cold calling campaigns, qualify prospects, and book meetings for the sales team.

## Features

- Automated prospect calling using Vapi AI
- Real-time conversation intelligence and qualification
- Automatic meeting booking integration
- Call recording and transcription
- CRM integration with Linear
- Performance monitoring and analytics

## Architecture

```
projects/sales/caller/
├── config/           # Configuration files and scripts
├── data/            # Call logs, recordings, transcripts
├── integrations/    # API connections and webhooks
├── workflows/       # Business logic and automation
└── monitoring/      # Performance tracking and alerts
```

## Prerequisites

- Vapi AI account and API key
- Twilio account with phone number
- Make.com workspace
- Google Workspace (for Sheets tracking)
- Linear API access
- AWS/GCP for production deployment

## Getting Started

1. Clone this repository
2. Copy `.env.example` to `.env` and fill in API keys
3. Install dependencies: `npm install`
4. Configure Make.com scenarios
5. Set up Vapi AI conversation scripts
6. Test with development environment

## Documentation

- [Setup Guide](docs/setup.md)
- [API Integration](docs/integrations.md)
- [Deployment](docs/deployment.md)
- [Monitoring](docs/monitoring.md)

## Status

🚧 **In Development** - Phase 1 Foundation Setup

Current focus: Repository setup, API account provisioning, and basic workflow development.