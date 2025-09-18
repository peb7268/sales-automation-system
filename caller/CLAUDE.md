# CLAUDE.md - Sales Caller Component

## Component Status: 🚧 IN TRANSITION

**IMPORTANT**: This component provides automated voice calling capabilities for the sales automation system.

## Current Situation

### Location
- **Path**: `/Users/pbarrick/Desktop/dev/MHM/projects/sales/caller/`
- **Status**: Contains all working code, configurations, and test results
- **Task Status**: Task 8 (Vapi AI) Complete ✅, Task 9 (Make.com) In Progress 🔄

## Component Overview

The Sales Caller component provides AI-powered voice calling for prospect qualification and lead engagement.

### Key Features
- **Vapi AI Integration**: Natural conversation engine for lead qualification
- **Prospect Personalization**: Dynamic conversation scripts based on lead data
- **Qualification Scoring**: Automated lead scoring and next-action recommendations
- **Make.com Workflows**: Post-call automation and CRM integration

### Current Implementation Status
- ✅ **Vapi AI Scripts**: Complete conversation system with personalization
- ✅ **API Integration**: Working Vapi AI connectivity and webhook handling
- ✅ **Testing Framework**: Comprehensive test suite for all components
- 🔄 **Make.com Setup**: In progress - workflow automation configuration
- 📋 **Documentation**: Needs to be migrated from projects/ location

## Component Structure

### Files Organization
```bash
# Core application files
caller/config/           # Configuration files
caller/integrations/     # External integrations  
caller/scripts/          # Test and automation scripts
caller/data/             # Data storage

# Configuration files
caller/package.json      # Dependencies
caller/node_modules/     # Installed packages

# Documentation
caller/docs/             # Component documentation
```

## Environment Configuration

**IMPORTANT**: All environment variables are still configured in the root MHM .env file:
- Path: `/Users/pbarrick/Desktop/dev/MHM/.env`
- No changes needed for API keys or configuration

### Key Variables
```bash
# Vapi AI Configuration
VAPI_API_KEY="1fc8850a-d12e-4a75-88e8-d1785699845b"
VAPI_BASE_URL="https://api.vapi.ai"

# Google Sheets Integration  
GOOGLE_SHEETS_ID="1gR8WVKwvLmOqqYW7_cY9c_08aFNzlkeS8qd1h2oQask"

# Make.com Integration (Task 9 - In Progress)
MAKECOM_WEBHOOK_URL="[to be configured]"
MAKECOM_API_KEY="[to be configured]"
```

## Integration with Sales Pipeline Component

### Data Flow
```
Sales Pipeline Component → Lead Data → Sales Caller Component → Qualification Results → CRM/Linear
```

### Component Interface
- **Input**: Prospect data from Sales Pipeline component
- **Processing**: AI voice qualification and scoring
- **Output**: Qualified leads with scores and next actions

## Task Status & Next Steps

### Current Task: Task 9 - Make.com Integration
- **Documentation**: [Make.com Setup Guide](./docs/integrations/makecom-setup.md) *(after migration)*
- **Status**: Ready for implementation with complete documentation
- **Requirements**: Make.com account setup and webhook configuration

### Next Tasks
1. **Continue Task 9**: Complete Make.com integration using existing documentation
2. **Test Component**: Verify all functionality continues to work
3. **Update Documentation**: Keep documentation current with implementation

## Testing & Verification

### Current Test Status (Task 8)
```bash
# Test commands
cd /Users/pbarrick/Desktop/dev/MHM/projects/sales/caller
npm run test:vapi           # ✅ All tests passing
node scripts/test-vapi-script.js  # ✅ Full integration test complete
```

### Testing
```bash
# Run from current location:
cd /Users/pbarrick/Desktop/dev/MHM/projects/sales/caller
npm install                 # Install dependencies if needed
npm run test:vapi          # Verify Vapi AI integration
node scripts/test-vapi-script.js  # Full integration test
```

## Development Instructions

### Working with This Component
1. **Development**: Work directly in `/projects/sales/caller/`
2. **Git Worktrees**: Can use worktree strategy for parallel development
3. **Integration**: Coordinates with pipeline component for prospect data

### Component Development
- All API keys and configuration remain in root MHM .env
- Component has independent package.json and dependencies
- Full documentation and testing within component directory
- Integration points clearly defined with other components

## Integration Architecture

### Component Relationships
- **Sales Pipeline Component**: Provides prospect research and lead data
- **Make.com Workflows**: Handles post-call automation and follow-up
- **Linear Integration**: Creates projects for qualified leads
- **Main MHM System**: Central orchestration and data management

## Permissions & Access

Claude Code has full access to:
- All files in this component directory (after migration)
- Component-specific documentation and configuration
- Integration with other MHM components and services

---
*Component Status: Active*
*Location: /Users/pbarrick/Desktop/dev/MHM/projects/sales/caller/*
*Last Updated: 2025-08-25*