# Make.com Manual Setup Guide - Sales Caller v2

## Overview
This guide provides step-by-step instructions for manually building the Sales Caller automation in Make.com. Due to Make.com's proprietary blueprint format, manual setup is the most reliable approach.

## Prerequisites
- Make.com account (free tier sufficient for testing)
- Google account with access to the shared Drive folder
- Google Sheets with sales pipeline data: `1DQWtvs4DDWbkVal8LdzGruqfXunpqhQqKeo7dOIS-Ys`

## Scenario Setup

### Step 1: Create New Scenario
1. Log into Make.com
2. Click "Create a new scenario"
3. Name it: "Sales Caller v2 - Automated Outbound"

### Step 2: Add Modules in Order

## Module 1: Google Sheets - Watch Rows

**Purpose**: Triggers when new prospects are added with "Uncontacted" status

**Configuration**:
1. **Add Module**: Search for "Google Sheets" → Select "Watch Rows"
2. **Connection**: Create new Google connection
3. **Settings**:
   - **Spreadsheet**: `1DQWtvs4DDWbkVal8LdzGruqfXunpqhQqKeo7dOIS-Ys`
   - **Sheet**: `Sheet1`
   - **Table contains headers**: Yes
   - **Row option**: Added row
   - **Value render option**: Formatted value
   - **Date time render option**: Formatted string
   - **Limit**: 1
   - **Filter**: Add filter where "Status" equals "Uncontacted"

**Expected Output**: Prospect data with all 15 fields

---

## Module 2: Google Drive - Download a File

**Purpose**: Gets the current sales script template

**Configuration**:
1. **Add Module**: Search for "Google Drive" → Select "Download a file"
2. **Connection**: Use same Google connection
3. **Settings**:
   - **Choose a method**: By ID
   - **File ID**: `[Upload sales_script.txt to Drive and get the file ID]`
   - **Convert a document**: No

**To Get File ID**:
1. Upload `sales_script.txt` to: https://drive.google.com/drive/folders/1EJxKtbp65kWMLmXF-nfYURd44H-dtCQS
2. Right-click the file → "Get link"
3. Extract ID from URL: `https://drive.google.com/file/d/FILE_ID_HERE/view`

**Expected Output**: Text content of sales script

---

## Module 3: Text Parser - Replace

**Purpose**: Personalizes the script with prospect data

**Configuration**:
1. **Add Module**: Search for "Text parser" → Select "Replace"
2. **Settings**:
   - **Text**: Select output from Module 2 (script content)
   - **Search string**: `{{lead_name}}`
   - **Replace**: Select "Lead Name" from Module 1
   - **Global match**: Yes

**Repeat for Additional Variables**:
Add more Replace modules for each variable:
- `{{company}}` → Company (Module 1)
- `{{dm}}` → DM (Module 1) 
- `{{industry}}` → Industry (Module 1)
- `{{temp}}` → Temp (Module 1)

**Alternative**: Use single Replace module with multiple patterns or use Set Variable

---

## Module 4: HTTP - Make a Request (Vapi AI Call)

**Purpose**: Initiates the AI voice call

**Configuration**:
1. **Add Module**: Search for "HTTP" → Select "Make a request"
2. **Settings**:
   - **URL**: `https://api.vapi.ai/call`
   - **Method**: POST
   - **Headers**:
     - `Authorization`: `Bearer [YOUR_VAPI_API_KEY]`
     - `Content-Type`: `application/json`
   - **Body type**: Raw
   - **Content type**: JSON (application/json)
   - **Request content**:

```json
{
  "phoneNumberId": "[YOUR_VAPI_PHONE_NUMBER_ID]",
  "customer": {
    "number": "{{1.`Contact Phone`}}"
  },
  "assistant": {
    "firstMessage": "{{3.text}}",
    "model": {
      "provider": "openai",
      "model": "gpt-4",
      "temperature": 0.7,
      "systemMessage": "You are Sarah from Mile High Marketing. You are professional, friendly, and focused on helping businesses grow. Use the provided script as a guide but sound natural. Always qualify prospects based on budget, authority, need, and timeline."
    },
    "voice": {
      "provider": "11labs",
      "voiceId": "sarah"
    },
    "recordingEnabled": true,
    "maxDurationSeconds": 600,
    "silenceTimeoutSeconds": 30
  },
  "metadata": {
    "leadId": "{{1.`Row number`}}",
    "company": "{{1.Company}}",
    "leadName": "{{1.`Lead Name`}}",
    "industry": "{{1.Industry}}",
    "webhook": "https://hook.us2.make.com/gugssi64ofbr3vgny705qg2tdsvrgjlx"
  }
}
```

**Expected Output**: Vapi call ID and status

---

## Module 5: Google Sheets - Update a Row

**Purpose**: Updates prospect status to "Contacted" immediately after call initiation

**Configuration**:
1. **Add Module**: Search for "Google Sheets" → Select "Update a row"
2. **Settings**:
   - **Connection**: Same Google connection
   - **Spreadsheet**: `1DQWtvs4DDWbkVal8LdzGruqfXunpqhQqKeo7dOIS-Ys`
   - **Sheet**: `Sheet1`
   - **Row number**: Select "Row number" from Module 1
   - **Table contains headers**: Yes
   - **Values**:
     - **Status** (Column H): `Contacted`
     - **Last Contact** (Column M): `{{formatDate(now; "YYYY-MM-DD HH:mm:ss")}}`
     - **Call Count** (Column N): `{{add(1.`Call Count`; 1)}}`
     - **Notes** (Column O): `Call initiated - Call ID: {{4.data.id}}`

---

## Module 6: Webhook - Custom Webhook

**Purpose**: Receives call results from Vapi AI

**Configuration**:
1. **Add Module**: Search for "Webhooks" → Select "Custom webhook"
2. **Settings**:
   - **Webhook name**: `sales-caller-webhook`
   - **Restrictions**: Add your IP or leave open for testing
3. **Copy the webhook URL** - this should match: `https://hook.us2.make.com/gugssi64ofbr3vgny705qg2tdsvrgjlx`

**Expected Input**: Call results from Vapi with outcome, summary, etc.

---

## Module 7: Router

**Purpose**: Routes to different actions based on call outcome

**Configuration**:
1. **Add Module**: Search for "Flow control" → Select "Router"
2. **Create 4 Routes**:

### Route 1: Meeting Scheduled
- **Filter**: `{{6.outcome}}` equals `meeting-scheduled`
- **Action**: Google Sheets Update Row
  - **Status**: `Meeting Scheduled`
  - **Temp**: `Hot`
  - **Likelihood to Close**: `90`
  - **Notes**: `QUALIFIED: {{6.summary}} - Meeting: {{6.meetingTime}}`

### Route 2: Interested
- **Filter**: `{{6.outcome}}` equals `interested`
- **Action**: Google Sheets Update Row
  - **Temp**: `Warm`
  - **Likelihood to Close**: `{{add(1.`Likelihood to Close`; 20)}}`
  - **Notes**: `Interested - {{6.summary}} - Follow up in 1 week`

### Route 3: Not Interested
- **Filter**: `{{6.outcome}}` equals `not-interested`
- **Action**: Google Sheets Update Row
  - **Status**: `Lost`
  - **Temp**: `Cold`
  - **Likelihood to Close**: `5`
  - **Notes**: `Not interested - {{6.reason}} - Follow up in 6 months`

### Route 4: No Answer/Voicemail
- **Filter**: `{{6.callStatus}}` equals `no-answer` OR `{{6.callStatus}}` equals `voicemail`
- **Action**: Google Sheets Update Row
  - **Status**: `Follow Up`
  - **Notes**: `{{if(6.callStatus = "voicemail"; "Voicemail left"; "No answer")}} - Retry in 2 business days`

---

## Module 8-11: Google Sheets Update Modules

**Purpose**: One for each router outcome (configured above in Router section)

Each follows the same pattern:
1. **Add Module**: Google Sheets → Update a row
2. **Configure based on router filter** (see Router section above)

---

## Testing & Validation

### Step 1: Test Individual Modules
1. **Run Module 1**: Should detect "Uncontacted" prospects
2. **Run Module 2**: Should download script content
3. **Run Module 3**: Should show personalized script
4. **Run Module 4**: Should return Vapi call ID (test with safe number)

### Step 2: Test Full Scenario
1. **Add test prospect** to Google Sheets with "Uncontacted" status
2. **Run scenario once**
3. **Verify**:
   - Call initiated in Vapi dashboard
   - Google Sheets updated to "Contacted"
   - Webhook receives call results
   - Final status updated based on outcome

### Step 3: Production Setup
1. **Configure scheduling**: Set to run every 15 minutes
2. **Enable error handling**: Add error paths for failed API calls
3. **Set up monitoring**: Enable email notifications for failures

## Environment Variables Needed

Add these to your Make.com scenario settings:
- `VAPI_API_KEY`: Your Vapi AI API key
- `VAPI_PHONE_NUMBER_ID`: Your Vapi phone number ID
- `GOOGLE_SHEETS_ID`: `1DQWtvs4DDWbkVal8LdzGruqfXunpqhQqKeo7dOIS-Ys`

## Troubleshooting

### Common Issues:
1. **Google Sheets connection fails**: Check permissions on shared sheet
2. **Vapi calls fail**: Verify API key and phone number ID
3. **Webhook not receiving**: Check webhook URL matches Vapi metadata
4. **Script personalization broken**: Verify text replacement modules

### Debug Steps:
1. **Run each module individually** to isolate issues
2. **Check execution history** in Make.com for error details
3. **Verify data mapping** between modules
4. **Test webhook** with curl commands from test script

## Success Criteria

✅ **Module 1**: Detects new "Uncontacted" prospects  
✅ **Module 2**: Downloads current sales script  
✅ **Module 3**: Personalizes script with prospect data  
✅ **Module 4**: Successfully initiates Vapi AI calls  
✅ **Module 5**: Updates prospect status to "Contacted"  
✅ **Module 6**: Receives webhook callbacks from Vapi  
✅ **Module 7-11**: Routes and updates based on call outcomes  

The manual setup provides the same functionality as the originally planned blueprint import, ensuring reliable automation deployment.