# Google Sheets - Sales Pipeline Management

## What is Google Sheets?

Google Sheets is a cloud-based spreadsheet application that's part of Google Workspace. It provides real-time collaboration, powerful formulas, and API access for automation and integration with other tools.

### Key Features
- **Real-time Collaboration**: Multiple users can edit simultaneously
- **API Access**: Full REST API for reading and writing data
- **Formula Support**: Advanced calculations and data processing
- **Data Validation**: Ensure data integrity with validation rules
- **Import/Export**: Connect with various data sources
- **Automation**: Integrate with Google Apps Script and external tools

## How Google Sheets Fits Into Our Sales System

Google Sheets serves as the central data repository for our sales pipeline:

```
Sales Research → Google Sheets (Pipeline) → Make.com Triggers → Vapi Calls → Updated Records
```

### Data Flow
1. **Input**: Manual prospect entry or automated research import
2. **Storage**: Centralized prospect and call tracking
3. **Triggers**: Make.com monitors for "Uncontacted" prospects
4. **Updates**: Real-time call results and status changes
5. **Reporting**: Analytics and performance tracking

## Step-by-Step Setup Guide

### Prerequisites
- Google account with Sheets access
- Basic understanding of spreadsheet formulas
- API access for automation (optional)

### Step 1: Create Sales Pipeline Spreadsheet
1. Go to https://sheets.google.com
2. Create new spreadsheet
3. Name it: "Sales Pipeline - MHM"
4. Set up proper column headers

### Step 2: Configure Data Schema

#### Required Columns (15 fields):
```
A: Lead Name          - Full name of prospect contact
B: Company           - Business/organization name  
C: Contact Phone     - Primary phone number (+1XXXXXXXXXX format)
D: Contact Email     - Primary email address
E: Stage             - Sales stage (Lead, Opportunity, Customer)
F: Opportunity Value - Potential revenue amount ($)
G: Expected Close Date - Target close date (YYYY-MM-DD)
H: Status            - Call status (Uncontacted, Contacted, Meeting Scheduled, Lost)
I: Temp              - Temperature (Hot, Warm, Cold)
J: Likelihood to Close - Percentage (0-100)
K: DM                - Decision maker name
L: Industry          - Business industry/sector
M: Last Contact      - Last interaction date (YYYY-MM-DD HH:MM:SS)
N: Call Count        - Number of call attempts
O: Notes             - Call notes and next actions
```

### Step 3: Set Up Data Validation

#### Phone Number Validation:
1. Select column C (Contact Phone)
2. Data → Data validation
3. Criteria: Custom formula
4. Formula: `=REGEXMATCH(C:C,"^\+1[0-9]{10}$")`
5. Error message: "Phone must be +1XXXXXXXXXX format"

#### Temperature Validation:
1. Select column I (Temp)
2. Data → Data validation  
3. Criteria: List of items
4. Items: `Hot, Warm, Cold`

#### Status Validation:
1. Select column H (Status)
2. Data → Data validation
3. Criteria: List of items  
4. Items: `Uncontacted, Contacted, Meeting Scheduled, Follow Up, Lost`

### Step 4: Configure Conditional Formatting

#### Temperature Color Coding:
```javascript
// Hot prospects (Green)
=I:I="Hot" 
// Format: Green background, white text

// Warm prospects (Yellow)  
=I:I="Warm"
// Format: Yellow background, black text

// Cold prospects (Blue)
=I:I="Cold" 
// Format: Light blue background, black text
```

#### Status Color Coding:
```javascript
// Uncontacted (Red)
=H:H="Uncontacted"
// Format: Light red background

// Meeting Scheduled (Dark Green)
=H:H="Meeting Scheduled"  
// Format: Dark green background, white text

// Follow Up (Orange)
=H:H="Follow Up"
// Format: Orange background, black text
```

### Step 5: Add Calculated Fields

#### Days Since Last Contact:
```javascript
// In column P (optional)
=IF(M2="","",TODAY()-M2)
```

#### Conversion Probability Score:
```javascript  
// In column Q (optional)
=IF(J2="","",J2*(VALUE(SUBSTITUTE(E2,"$",""))/1000))
```

### Step 6: Configure API Access (For Automation)

#### Enable Google Sheets API:
1. Go to https://console.cloud.google.com
2. Create new project or select existing
3. Enable Google Sheets API
4. Create credentials (Service Account)
5. Download JSON key file

#### Service Account Setup:
1. Share spreadsheet with service account email
2. Grant "Editor" permissions
3. Copy spreadsheet ID from URL
4. Configure environment variables

## Current Pipeline Configuration

### Spreadsheet Details
- **ID**: `1DQWtvs4DDWbkVal8LdzGruqfXunpqhQqKeo7dOIS-Ys`
- **URL**: https://docs.google.com/spreadsheets/d/1DQWtvs4DDWbkVal8LdzGruqfXunpqhQqKeo7dOIS-Ys/edit?usp=sharing
- **Sheet Name**: `Sheet1`
- **Headers**: Row 1 contains field names

### Sample Data Structure
```csv
Lead Name,Company,Contact Phone,Contact Email,Stage,Opportunity Value,Expected Close Date,Status,Temp,Likelihood to Close,DM,Industry,Last Contact,Call Count,Notes
Jane Smith,Prospect Industries,+15551234567,jane@prospect.com,Lead,2500,2025-10-15,Uncontacted,Warm,40,Rebecca Olson,Manufacturing,2025-09-17,0,Researched via Google Maps - good online presence
Mike Jones,Acme Restaurant,+15559876543,mike@acmerest.com,Lead,1500,2025-10-20,Uncontacted,Cold,25,Mike Jones,Restaurant,2025-09-17,0,Family-owned Italian restaurant - needs digital marketing
```

## Files in This Directory

### `sales_pipeline.csv`
Master template with:
- Complete 15-field schema
- Sample prospect data
- Proper formatting examples
- Data validation reference

## API Integration

### Reading Data with Google Sheets API
```javascript
const { GoogleSpreadsheet } = require('google-spreadsheet');

async function getProspects() {
  const doc = new GoogleSpreadsheet('1DQWtvs4DDWbkVal8LdzGruqfXunpqhQqKeo7dOIS-Ys');
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY
  });
  
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();
  
  return rows.filter(row => row.Status === 'Uncontacted');
}
```

### Updating Records
```javascript
async function updateProspectStatus(rowIndex, updates) {
  const doc = new GoogleSpreadsheet('1DQWtvs4DDWbkVal8LdzGruqfXunpqhQqKeo7dOIS-Ys');
  await doc.useServiceAccountAuth(credentials);
  
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();
  
  const row = rows[rowIndex - 2]; // Adjust for header row
  Object.assign(row, updates);
  await row.save();
}
```

### Batch Updates
```javascript
async function batchUpdateProspects(updates) {
  const doc = new GoogleSpreadsheet('1DQWtvs4DDWbkVal8LdzGruqfXunpqhQqKeo7dOIS-Ys');
  await doc.useServiceAccountAuth(credentials);
  
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  
  const requests = updates.map(update => ({
    updateCells: {
      rows: [{
        values: update.values.map(val => ({ userEnteredValue: { stringValue: val } }))
      }],
      fields: 'userEnteredValue',
      start: {
        sheetId: sheet.sheetId,
        rowIndex: update.rowIndex,
        columnIndex: 0
      }
    }
  }));
  
  await doc.batchUpdate(requests);
}
```

## Make.com Integration

### Watch Rows Configuration
```json
{
  "module": "google-sheets:watchRows",
  "configuration": {
    "connection": "google-sheets",
    "spreadsheetId": "1DQWtvs4DDWbkVal8LdzGruqfXunpqhQqKeo7dOIS-Ys",
    "sheetName": "Sheet1",
    "tableContainsHeaders": true,
    "rowOption": "addedRow",
    "valueRenderOption": "FORMATTED_VALUE",
    "filter": {
      "field": "Status",
      "operator": "equals", 
      "value": "Uncontacted"
    }
  }
}
```

### Update Row Configuration
```json
{
  "module": "google-sheets:updateRow",
  "configuration": {
    "connection": "google-sheets",
    "spreadsheetId": "1DQWtvs4DDWbkVal8LdzGruqfXunpqhQqKeo7dOIS-Ys",
    "sheetName": "Sheet1",
    "tableContainsHeaders": true,
    "rowNumber": "{{trigger.rowNumber}}",
    "values": {
      "Status": "Contacted",
      "Last Contact": "{{formatDate(now; 'YYYY-MM-DD HH:mm:ss')}}",
      "Call Count": "{{add(trigger.callCount; 1)}}",
      "Notes": "Call initiated - Call ID: {{vapiResponse.id}}"
    }
  }
}
```

## Data Management Best Practices

### Data Entry Standards
1. **Phone Numbers**: Always use +1XXXXXXXXXX format
2. **Dates**: Use YYYY-MM-DD or YYYY-MM-DD HH:MM:SS format
3. **Currency**: Use $X,XXX format for opportunity values
4. **Text Fields**: Use sentence case, avoid all caps
5. **Notes**: Include date stamp and next actions

### Data Quality Checks
```javascript
// Validation formulas for data quality
// Duplicate phone numbers
=COUNTIF(C:C,C2)>1

// Missing required fields  
=OR(A2="",B2="",C2="",H2="")

// Invalid phone format
=NOT(REGEXMATCH(C2,"^\+1[0-9]{10}$"))

// Future dates in past fields
=M2>TODAY()
```

### Regular Maintenance
1. **Weekly**: Review data quality and duplicates
2. **Monthly**: Archive completed deals and lost prospects
3. **Quarterly**: Analyze conversion rates and performance
4. **Annually**: Review schema and add new fields as needed

## Reporting and Analytics

### Key Metrics Dashboard
```javascript
// Conversion rate by temperature
=COUNTIFS(I:I,"Hot",H:H,"Meeting Scheduled")/COUNTIF(I:I,"Hot")

// Average deal size
=AVERAGE(FILTER(F:F,H:H="Meeting Scheduled"))

// Call efficiency
=COUNTIF(H:H,"Meeting Scheduled")/SUM(N:N)

// Pipeline value
=SUMIF(H:H,"Opportunity",F:F)
```

### Performance Tracking
1. **Daily**: New prospects added, calls completed
2. **Weekly**: Conversion rates, pipeline movement
3. **Monthly**: Revenue generated, cost per acquisition
4. **Quarterly**: ROI analysis, strategy adjustments

## Troubleshooting

### Common Issues

1. **API Permission Errors**:
   - Verify service account has editor access
   - Check spreadsheet sharing settings
   - Confirm API credentials are correct

2. **Data Validation Failures**:
   - Review validation rule setup
   - Check for conflicting formats
   - Verify formula syntax

3. **Make.com Sync Issues**:
   - Confirm spreadsheet ID is correct
   - Verify sheet name matches exactly
   - Check field name spelling and case

4. **Performance Problems**:
   - Reduce number of volatile formulas
   - Use ARRAYFORMULA for bulk calculations
   - Consider data archiving for large datasets

### Debug Commands
```bash
# Test API access
curl -H "Authorization: Bearer ACCESS_TOKEN" \
  "https://sheets.googleapis.com/v4/spreadsheets/1DQWtvs4DDWbkVal8LdzGruqfXunpqhQqKeo7dOIS-Ys"

# Validate spreadsheet structure
curl -H "Authorization: Bearer ACCESS_TOKEN" \
  "https://sheets.googleapis.com/v4/spreadsheets/1DQWtvs4DDWbkVal8LdzGruqfXunpqhQqKeo7dOIS-Ys/values/Sheet1!1:1"
```

## Security and Compliance

### Access Control
1. **Sharing Settings**: Limit to specific users/groups
2. **Edit Permissions**: Use "Commenter" for view-only access
3. **API Access**: Restrict service account permissions
4. **Audit Trail**: Enable activity tracking

### Data Protection
1. **PII Handling**: Follow GDPR/CCPA guidelines
2. **Backup Strategy**: Regular exports and version history
3. **Encryption**: Data encrypted in transit and at rest
4. **Retention Policy**: Archive old data per compliance requirements

## Advanced Features

### Google Apps Script Integration
```javascript
// Automated data processing
function processNewProspects() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  data.forEach((row, index) => {
    if (index === 0) return; // Skip header
    
    if (row[7] === 'Uncontacted') { // Status column
      // Trigger external automation
      const webhook = 'https://hook.us2.make.com/gugssi64ofbr3vgny705qg2tdsvrgjlx';
      UrlFetchApp.fetch(webhook, {
        method: 'POST',
        headers: { 'x-make-apikey': 'YOUR_API_KEY' },
        payload: JSON.stringify({
          leadId: index + 1,
          leadName: row[0],
          company: row[1],
          phone: row[2]
        })
      });
    }
  });
}
```

### Custom Functions
```javascript
// Calculate lead score
function LEAD_SCORE(industry, value, temp) {
  let score = 0;
  
  // Industry multiplier
  const industryScores = {
    'Technology': 1.5,
    'Healthcare': 1.3,
    'Manufacturing': 1.2,
    'Restaurant': 0.8
  };
  
  score += (industryScores[industry] || 1.0) * (value / 1000);
  
  // Temperature bonus
  if (temp === 'Hot') score += 20;
  else if (temp === 'Warm') score += 10;
  
  return Math.round(score);
}
```

## Support Resources

- **Google Sheets Help**: https://support.google.com/docs/topic/9054603
- **Sheets API Documentation**: https://developers.google.com/sheets/api
- **Apps Script Guide**: https://developers.google.com/apps-script/guides/sheets
- **Community Forum**: https://support.google.com/docs/community

---

*For Google Drive integration, see: [../google-drive/index.md](../google-drive/index.md)*
*For Make.com automation, see: [../../caller/docs/makecom/index.md](../../caller/docs/makecom/index.md)*