# Setup Guide - Automated Sales Caller v1

## Prerequisites

Before setting up the automated sales caller system, ensure you have:

1. **Development Environment**
   - Node.js 18+ installed
   - Git configured
   - Code editor (VS Code recommended)

2. **Required Accounts**
   - Vapi AI account
   - Twilio account with phone number
   - Make.com workspace
   - Google Workspace account
   - Linear workspace
   - AWS or GCP account for production

## Step 1: Repository Setup

```bash
# Clone the repository
git clone <repository-url>
cd automated-caller

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

## Step 2: API Account Provisioning

### Vapi AI Setup

1. Visit [Vapi AI Dashboard](https://dashboard.vapi.ai/)
2. Create a new account or log in
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the key to `.env` file as `VAPI_API_KEY`

**Environment Variables:**
```env
VAPI_API_KEY=vapi_xxx
VAPI_BASE_URL=https://api.vapi.ai
VAPI_SANDBOX_MODE=true
```

### Twilio Configuration

1. Sign up at [Twilio Console](https://console.twilio.com/)
2. Purchase a phone number with voice capabilities
3. Get Account SID and Auth Token from dashboard
4. Configure webhook URLs for call events

**Environment Variables:**
```env
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

### Make.com Workspace Setup

1. Create account at [Make.com](https://make.com/)
2. Create new scenario for call workflow
3. Generate webhook URL for external triggers
4. Configure API access if needed

**Environment Variables:**
```env
MAKE_WEBHOOK_URL=https://hook.make.com/xxxxx
MAKE_API_KEY=xxxxx
```

## Step 3: Google Sheets Integration

1. Enable Google Sheets API in Google Cloud Console
2. Create service account and download credentials
3. Create a new spreadsheet for call tracking
4. Share spreadsheet with service account email

**Environment Variables:**
```env
GOOGLE_SHEETS_ID=spreadsheet_id_here
GOOGLE_API_KEY=google_api_key
GOOGLE_SERVICE_ACCOUNT_EMAIL=service@project.iam.gserviceaccount.com
```

## Step 4: Linear Integration

1. Generate Linear API key from Settings → API
2. Get your team ID from Linear workspace
3. Test API access with a simple query

**Environment Variables:**
```env
LINEAR_API_KEY=lin_api_xxxxx
LINEAR_TEAM_ID=team_id_here
```

## Step 5: Storage Configuration

For production deployment, set up AWS S3 for call recordings:

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-west-2
AWS_S3_BUCKET=your-recordings-bucket
```

## Step 6: Testing Setup

1. Set `VAPI_SANDBOX_MODE=true` in development
2. Use test phone numbers for Twilio
3. Create separate Google Sheet for testing
4. Use Linear test workspace if available

## Security Best Practices

1. **Never commit `.env` file to repository**
2. **Use strong, unique API keys**
3. **Rotate keys regularly**
4. **Use least-privilege access principles**
5. **Enable 2FA on all accounts**

## Troubleshooting

### Common Issues

1. **API Key Authentication Errors**
   - Verify key format and permissions
   - Check account billing status
   - Ensure correct API endpoint URLs

2. **Twilio Phone Number Issues**
   - Verify number has voice capabilities
   - Check geographic restrictions
   - Ensure webhook URLs are accessible

3. **Google Sheets Access Denied**
   - Verify service account permissions
   - Check spreadsheet sharing settings
   - Ensure API is enabled in Google Cloud

## Next Steps

After setup is complete:

1. Test API connections with provided scripts
2. Configure Make.com scenarios
3. Set up Vapi AI conversation scripts
4. Run initial test calls
5. Monitor system performance

For detailed implementation guides, see:
- [API Integration Documentation](integrations.md)
- [Deployment Guide](deployment.md)
- [Monitoring Setup](monitoring.md)