# Make.com - Workflow Automation Integration

## What is Make.com?

Make.com (formerly Integromat) is a powerful automation platform that connects apps and services to create automated workflows. It uses a visual interface to build complex automation scenarios without coding.

### Key Features
- **Visual Workflow Builder**: Drag-and-drop interface for creating automations
- **Multi-App Integration**: Connects 1000+ apps and services
- **Real-time Triggers**: Instant response to events and data changes
- **Data Processing**: Advanced filtering, routing, and transformation
- **Error Handling**: Built-in error management and retry logic
- **Webhook Support**: Custom HTTP endpoints for external integrations

## How Make.com Fits Into Our Sales System

Make.com serves as the automation orchestrator for our sales calling workflow:

```
Google Sheets (New Prospect) → Make.com → Vapi AI Call → Make.com → Update Records
```

### Integration Flow
1. **Trigger**: New "Uncontacted" prospect added to Google Sheets
2. **Process**: Download sales script, personalize with prospect data
3. **Action**: Initiate Vapi AI call with personalized script
4. **Update**: Mark prospect as "Contacted" in Google Sheets
5. **Listen**: Receive webhook from Vapi with call results
6. **Route**: Update prospect status based on call outcome

## Step-by-Step Setup Guide

### Prerequisites
- Make.com account (free tier available)
- Google account with access to sales pipeline spreadsheet
- Vapi AI account and API key
- Webhook endpoint for receiving call results

### Step 1: Create Make.com Account
1. Go to https://make.com
2. Sign up for account (free tier sufficient for testing)
3. Complete email verification
4. Access the Make.com dashboard

### Step 2: Connect Google Services
1. **Google Sheets Connection**:
   - Go to Connections in Make.com
   - Add new connection for Google Sheets
   - Authorize access to your Google account
   - Test connection

2. **Google Drive Connection**:
   - Add Google Drive connection
   - Authorize same Google account
   - Verify access to shared folder

### Step 3: Create New Scenario
1. Click "Create a new scenario"
2. Name: "Sales Caller v2 - Automated Outbound"
3. Choose blank scenario to start

### Step 4: Build the Workflow (11 Modules)

Follow the complete setup guide in `makecom_manual_setup.md` for detailed module-by-module instructions.

#### Module Overview:
1. **Google Sheets - Watch Rows**: Triggers on new "Uncontacted" prospects
2. **Google Drive - Download File**: Gets current sales script
3. **Text Parser - Replace**: Personalizes script with prospect data
4. **HTTP - Make Request**: Initiates Vapi AI call
5. **Google Sheets - Update Row**: Marks prospect as "Contacted"
6. **Webhook - Custom Webhook**: Receives call results from Vapi
7. **Router**: Routes based on call outcome
8. **Update Row (Meeting)**: Hot leads with meetings scheduled
9. **Update Row (Interested)**: Warm leads for follow-up
10. **Update Row (Not Interested)**: Cold leads for future contact
11. **Update Row (No Answer)**: Retry scenarios

### Step 5: Configure Environment Variables

Set these values in your Make.com scenario:

```bash
# Google Integration
GOOGLE_SHEETS_ID="1DQWtvs4DDWbkVal8LdzGruqfXunpqhQqKeo7dOIS-Ys"
GOOGLE_DRIVE_FOLDER_ID="1EJxKtbp65kWMLmXF-nfYURd44H-dtCQS"

# Vapi AI Integration  
VAPI_API_KEY="your_vapi_api_key"
VAPI_PHONE_NUMBER_ID="your_phone_number_id"

# Make.com Webhook
WEBHOOK_URL="https://hook.us2.make.com/gugssi64ofbr3vgny705qg2tdsvrgjlx"
WEBHOOK_API_KEY="your_makecom_api_key"
```

### Step 6: Test Individual Modules
1. Run each module separately to verify configuration
2. Check data flow between modules
3. Verify Google Sheets updates correctly
4. Test Vapi API call (use test phone number)

### Step 7: Enable Automation
1. Set scenario to run every 15 minutes
2. Enable error notifications
3. Monitor execution history
4. Test with real prospect data

## Files in This Directory

### `makecom_manual_setup.md`
Complete step-by-step setup guide with:
- Detailed module configurations
- Screenshot references
- Troubleshooting tips
- Testing procedures

### `test_webhook.sh`
Comprehensive testing script with:
- 4 different call outcome scenarios
- Proper webhook authentication
- Expected result validation
- Google Sheets verification

## Workflow Configuration Details

### Trigger Configuration
```json
{
  "module": "google-sheets:watchRows",
  "configuration": {
    "spreadsheetId": "1DQWtvs4DDWbkVal8LdzGruqfXunpqhQqKeo7dOIS-Ys",
    "sheetName": "Sheet1",
    "filter": {
      "field": "Status",
      "operator": "equals",
      "value": "Uncontacted"
    }
  }
}
```

### Vapi API Call Configuration
```json
{
  "module": "http:makeRequest",
  "configuration": {
    "url": "https://api.vapi.ai/call",
    "method": "POST",
    "headers": {
      "Authorization": "Bearer {{VAPI_API_KEY}}",
      "Content-Type": "application/json"
    },
    "body": {
      "phoneNumberId": "{{VAPI_PHONE_NUMBER_ID}}",
      "customer": {
        "number": "{{prospect.phone}}"
      },
      "assistant": {
        "firstMessage": "{{personalizedScript}}",
        "model": {
          "provider": "openai",
          "model": "gpt-4",
          "temperature": 0.7
        }
      },
      "metadata": {
        "webhook": "{{WEBHOOK_URL}}"
      }
    }
  }
}
```

### Router Logic
```javascript
// Meeting Scheduled Route
if (webhook.outcome === "meeting-scheduled") {
  return {
    status: "Meeting Scheduled",
    temp: "Hot", 
    likelihood: 90,
    notes: `QUALIFIED: ${webhook.summary} - Meeting: ${webhook.meetingTime}`
  };
}

// Interested Route  
if (webhook.outcome === "interested") {
  return {
    temp: "Warm",
    likelihood: Math.min(100, currentLikelihood + 20),
    notes: `Interested - ${webhook.summary} - Follow up in 1 week`
  };
}

// Not Interested Route
if (webhook.outcome === "not-interested") {
  return {
    status: "Lost",
    temp: "Cold", 
    likelihood: 5,
    notes: `Not interested - ${webhook.reason} - Follow up in 6 months`
  };
}

// No Answer/Voicemail Route
if (webhook.callStatus === "no-answer" || webhook.callStatus === "voicemail") {
  return {
    status: "Follow Up",
    notes: webhook.callStatus === "voicemail" ? "Voicemail left" : "No answer" + " - Retry in 2 business days"
  };
}
```

## Testing & Validation

### Webhook Testing
```bash
# Run comprehensive webhook tests
chmod +x test_webhook.sh
./test_webhook.sh YOUR_MAKECOM_API_KEY

# Expected results:
# - Test 1: Meeting scheduled → "Opportunity" stage, "Hot" temp
# - Test 2: Interested → "Warm" temp, increased likelihood  
# - Test 3: Not interested → "Lost" status, "Cold" temp
# - Test 4: Voicemail → "Follow Up" status for retry
```

### Manual Testing
1. Add test prospect to Google Sheets with "Uncontacted" status
2. Verify Make.com scenario triggers
3. Check Vapi call initiates successfully
4. Confirm webhook receives call results
5. Validate Google Sheets updates correctly

## Troubleshooting

### Common Issues

1. **Scenario Not Triggering**:
   - Check Google Sheets connection
   - Verify "Uncontacted" filter is exact match
   - Ensure scenario is enabled and scheduled

2. **Vapi Call Fails**:
   - Verify API key is correct in HTTP module
   - Check phone number format (+1XXXXXXXXXX)
   - Ensure phone number ID is valid

3. **Webhook Not Receiving Data**:
   - Verify webhook URL matches Vapi metadata
   - Check x-make-apikey header authentication
   - Test webhook endpoint connectivity

4. **Google Sheets Not Updating**:
   - Check Google Sheets connection permissions
   - Verify spreadsheet ID is correct
   - Ensure row number mapping is accurate

### Debug Steps
```bash
# Test webhook connectivity
curl -I https://hook.us2.make.com/gugssi64ofbr3vgny705qg2tdsvrgjlx

# Test Google Sheets API
curl "https://sheets.googleapis.com/v4/spreadsheets/1DQWtvs4DDWbkVal8LdzGruqfXunpqhQqKeo7dOIS-Ys/values/Sheet1" \
  -H "Authorization: Bearer ACCESS_TOKEN"

# Test Vapi API
curl -H "Authorization: Bearer $VAPI_API_KEY" https://api.vapi.ai/account
```

## Performance Optimization

### Scenario Settings
- **Execution Interval**: 15 minutes (balance between responsiveness and API limits)
- **Error Handling**: 3 retry attempts with exponential backoff
- **Timeout Settings**: 30 seconds for API calls, 10 seconds for updates

### Monitoring
1. **Execution History**: Review in Make.com dashboard
2. **Error Notifications**: Email alerts for failed executions
3. **Data Validation**: Regular checks of Google Sheets data integrity
4. **Cost Monitoring**: Track operations usage against Make.com limits

## Advanced Features

### Conditional Logic
```javascript
// Example: Skip weekends and business hours
const now = new Date();
const hour = now.getHours();
const day = now.getDay();

if (day === 0 || day === 6 || hour < 9 || hour > 17) {
  // Skip execution outside business hours
  return { skip: true };
}
```

### Error Recovery
```javascript
// Retry logic for failed calls
if (vapiResponse.error) {
  const retryCount = parseInt(prospect.retryCount || 0);
  if (retryCount < 3) {
    // Schedule retry in 1 hour
    return {
      status: "Retry Scheduled",
      retryCount: retryCount + 1,
      nextRetry: new Date(Date.now() + 3600000).toISOString()
    };
  }
}
```

## Integration Notes

### Data Flow Validation
- **Input Validation**: Verify prospect data completeness before calling
- **Output Verification**: Confirm all webhook data is properly captured
- **Audit Trail**: Maintain complete history of all prospect interactions

### Security Best Practices
1. **API Key Security**: Store in Make.com secure variables
2. **Webhook Authentication**: Use x-make-apikey header
3. **Data Encryption**: Ensure HTTPS for all API calls
4. **Access Control**: Limit Google Sheets/Drive permissions

## Support Resources

- **Make.com Documentation**: https://www.make.com/en/help
- **Google Sheets API**: https://developers.google.com/sheets/api
- **Webhook Testing**: https://webhook.site
- **Scenario Templates**: https://www.make.com/en/templates

---

*For Vapi AI integration details, see: [../vapi/index.md](../vapi/index.md)*
*For Google Sheets configuration, see: [../../pipeline/docs/google-sheets/index.md](../../pipeline/docs/google-sheets/index.md)*