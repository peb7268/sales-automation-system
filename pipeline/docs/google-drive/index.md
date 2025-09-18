# Google Drive - File Storage and Management

## What is Google Drive?

Google Drive is a cloud storage service that provides file storage, synchronization, and sharing capabilities. It integrates seamlessly with Google Workspace applications and provides API access for automated file management.

### Key Features
- **Cloud Storage**: Secure file storage with automatic backup
- **File Sharing**: Granular sharing controls and permissions
- **API Access**: Full REST API for file operations
- **Version History**: Track file changes and restore previous versions
- **Real-time Collaboration**: Multiple users can work on files simultaneously
- **Search and Organization**: Powerful search and folder organization

## How Google Drive Fits Into Our Sales System

Google Drive serves as the centralized file repository for sales assets and call scripts:

```
Sales Scripts → Google Drive → Make.com Downloads → Vapi AI Calls → Call Recordings → Google Drive
```

### File Flow
1. **Storage**: Sales scripts, templates, and assets stored centrally
2. **Access**: Make.com downloads current scripts for personalization
3. **Processing**: Scripts personalized with prospect data
4. **Distribution**: Personalized scripts sent to Vapi AI for calls
5. **Archival**: Call recordings and logs stored back to Drive

## Step-by-Step Setup Guide

### Prerequisites
- Google account with Drive access
- Basic understanding of file sharing and permissions
- API access for automation (optional)

### Step 1: Create Sales Assets Folder
1. Go to https://drive.google.com
2. Create new folder: "MHM Sales Assets"
3. Create subfolders:
   - `scripts/` - Call scripts and templates
   - `call_logs/` - Call recordings and transcripts
   - `templates/` - Email and document templates
   - `training/` - Sales training materials

### Step 2: Set Up Shared Folder
Our current shared folder configuration:
- **Folder ID**: `1EJxKtbp65kWMLmXF-nfYURd44H-dtCQS`
- **URL**: https://drive.google.com/drive/folders/1EJxKtbp65kWMLmXF-nfYURd44H-dtCQS?usp=sharing
- **Access**: Shared with team members and service accounts

### Step 3: Configure API Access

#### Enable Google Drive API:
1. Go to https://console.cloud.google.com
2. Select your project (or create new one)
3. Enable Google Drive API
4. Create service account credentials
5. Download JSON key file

#### Service Account Setup:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "service-account@project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}
```

### Step 4: Environment Configuration

Add these variables to your `.env` file:

```bash
# Google Drive Configuration
GOOGLE_DRIVE_FOLDER_ID="1EJxKtbp65kWMLmXF-nfYURd44H-dtCQS"
GOOGLE_DRIVE_FOLDER_URL="https://drive.google.com/drive/folders/1EJxKtbp65kWMLmXF-nfYURd44H-dtCQS?usp=sharing"

# Google API Credentials
GOOGLE_CLIENT_EMAIL="service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_PROJECT_ID="your-project-id"
```

## File Organization Structure

### Current Folder Structure
```
MHM Sales Assets/
├── scripts/
│   ├── sales_script.txt          # Main sales call script
│   ├── follow_up_script.txt      # Follow-up call template
│   └── objection_handling.txt    # Objection responses
├── call_logs/
│   ├── 2025-09/                  # Monthly folders
│   │   ├── call_123_transcript.txt
│   │   └── call_123_recording.mp3
│   └── analytics/
│       └── monthly_summary.csv
├── templates/
│   ├── email_follow_up.html      # Email templates
│   ├── meeting_invite.txt        # Calendar invites
│   └── proposal_template.docx    # Proposal documents
└── training/
    ├── sales_methodology.pdf     # Sales training docs
    ├── product_overview.pptx     # Product presentations
    └── competitive_analysis.xlsx # Market research
```

### File Naming Conventions
- **Scripts**: `script_type_version.txt` (e.g., `sales_script_v2.txt`)
- **Call Logs**: `call_{callId}_{type}.{ext}` (e.g., `call_123_transcript.txt`)
- **Templates**: `template_purpose.{ext}` (e.g., `email_follow_up.html`)
- **Training**: `training_topic_date.{ext}` (e.g., `sales_methods_2025-09.pdf`)

## API Integration

### Downloading Files
```javascript
const { google } = require('googleapis');

async function downloadFile(fileId) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly']
  });
  
  const drive = google.drive({ version: 'v3', auth });
  
  const response = await drive.files.export({
    fileId: fileId,
    mimeType: 'text/plain'
  });
  
  return response.data;
}
```

### Uploading Files
```javascript
async function uploadFile(fileName, content, folderId) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY
    },
    scopes: ['https://www.googleapis.com/auth/drive.file']
  });
  
  const drive = google.drive({ version: 'v3', auth });
  
  const fileMetadata = {
    name: fileName,
    parents: [folderId]
  };
  
  const media = {
    mimeType: 'text/plain',
    body: content
  };
  
  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id'
  });
  
  return response.data.id;
}
```

### Listing Files
```javascript
async function listFiles(folderId) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly']
  });
  
  const drive = google.drive({ version: 'v3', auth });
  
  const response = await drive.files.list({
    q: `'${folderId}' in parents`,
    fields: 'files(id, name, modifiedTime, size)'
  });
  
  return response.data.files;
}
```

## Make.com Integration

### Download File Configuration
```json
{
  "module": "google-drive:downloadFile",
  "configuration": {
    "connection": "google-drive",
    "method": "byId",
    "fileId": "FILE_ID_FROM_SHEETS_OR_STATIC",
    "convert": false
  }
}
```

### Upload Call Recording
```json
{
  "module": "google-drive:uploadFile",
  "configuration": {
    "connection": "google-drive",
    "fileName": "call_{{callId}}_recording.mp3",
    "data": "{{vapiWebhook.recordingUrl}}",
    "parents": ["1EJxKtbp65kWMLmXF-nfYURd44H-dtCQS"],
    "mimeType": "audio/mpeg"
  }
}
```

### Create Call Log
```json
{
  "module": "google-drive:createFile", 
  "configuration": {
    "connection": "google-drive",
    "fileName": "call_{{callId}}_transcript.txt",
    "content": "Call Summary: {{vapiWebhook.summary}}\n\nTranscript: {{vapiWebhook.transcript}}\n\nOutcome: {{vapiWebhook.outcome}}\nDuration: {{vapiWebhook.duration}} seconds\nScore: {{vapiWebhook.qualificationScore}}",
    "parents": ["1EJxKtbp65kWMLmXF-nfYURd44H-dtCQS"],
    "mimeType": "text/plain"
  }
}
```

## Sales Script Management

### Script Versioning
```javascript
// Track script versions
const scriptVersions = {
  "sales_script_v1.txt": {
    created: "2025-09-01",
    active: false,
    description: "Initial sales script"
  },
  "sales_script_v2.txt": {
    created: "2025-09-17", 
    active: true,
    description: "Enhanced with qualification scoring"
  }
};

// Get active script
async function getActiveScript() {
  const files = await listFiles(SCRIPTS_FOLDER_ID);
  const activeScript = files.find(file => 
    scriptVersions[file.name] && scriptVersions[file.name].active
  );
  
  return downloadFile(activeScript.id);
}
```

### Dynamic Script Personalization
```javascript
async function personalizeScript(scriptTemplate, prospectData) {
  let personalizedScript = scriptTemplate;
  
  // Replace placeholders
  personalizedScript = personalizedScript
    .replace(/{{lead_name}}/g, prospectData.leadName)
    .replace(/{{company}}/g, prospectData.company)
    .replace(/{{industry}}/g, prospectData.industry)
    .replace(/{{dm}}/g, prospectData.dm)
    .replace(/{{temp}}/g, prospectData.temp);
  
  // Save personalized version
  const fileName = `personalized_script_${prospectData.leadId}_${Date.now()}.txt`;
  await uploadFile(fileName, personalizedScript, SCRIPTS_FOLDER_ID);
  
  return personalizedScript;
}
```

## Call Log Management

### Automated Log Creation
```javascript
async function createCallLog(callData) {
  const logContent = `
CALL LOG - ${callData.callId}
=====================================

Prospect: ${callData.leadName}
Company: ${callData.company}
Phone: ${callData.phone}
Date: ${new Date().toISOString()}

CALL DETAILS:
Duration: ${callData.duration} seconds
Cost: $${callData.cost}
Status: ${callData.callStatus}
Outcome: ${callData.outcome}

QUALIFICATION:
Score: ${callData.qualificationScore}/100
Temperature: ${callData.temperature}
Meeting: ${callData.meetingTime || 'None scheduled'}

SUMMARY:
${callData.summary}

TRANSCRIPT:
${callData.transcript}

NEXT ACTIONS:
${callData.nextActions || 'TBD'}
`;

  const fileName = `call_${callData.callId}_log.txt`;
  const logId = await uploadFile(fileName, logContent, CALL_LOGS_FOLDER_ID);
  
  return logId;
}
```

### Analytics and Reporting
```javascript
async function generateMonthlyReport() {
  const callLogs = await listFiles(CALL_LOGS_FOLDER_ID);
  const thisMonth = callLogs.filter(file => 
    new Date(file.modifiedTime).getMonth() === new Date().getMonth()
  );
  
  const analytics = {
    totalCalls: thisMonth.length,
    totalDuration: 0,
    outcomes: {},
    averageScore: 0
  };
  
  // Process each call log
  for (const logFile of thisMonth) {
    const content = await downloadFile(logFile.id);
    const duration = extractDuration(content);
    const outcome = extractOutcome(content);
    const score = extractScore(content);
    
    analytics.totalDuration += duration;
    analytics.outcomes[outcome] = (analytics.outcomes[outcome] || 0) + 1;
    analytics.averageScore += score;
  }
  
  analytics.averageScore /= thisMonth.length;
  
  // Create report
  const reportContent = generateReportContent(analytics);
  await uploadFile(`monthly_report_${new Date().getMonth() + 1}.txt`, reportContent, ANALYTICS_FOLDER_ID);
  
  return analytics;
}
```

## Security and Permissions

### Access Control
```javascript
// Set file permissions
async function setFilePermissions(fileId, permissions) {
  const drive = google.drive({ version: 'v3', auth });
  
  for (const permission of permissions) {
    await drive.permissions.create({
      fileId: fileId,
      resource: {
        role: permission.role, // 'reader', 'writer', 'owner'
        type: permission.type, // 'user', 'group', 'domain'
        emailAddress: permission.email
      }
    });
  }
}

// Example: Share call log with sales team
await setFilePermissions(callLogId, [
  { role: 'reader', type: 'user', email: 'sales@milehighmarketing.com' },
  { role: 'writer', type: 'user', email: 'manager@milehighmarketing.com' }
]);
```

### Data Retention
```javascript
// Automated cleanup of old files
async function cleanupOldFiles() {
  const cutoffDate = new Date();
  cutoffDate.setMonths(cutoffDate.getMonths() - 6); // 6 months retention
  
  const oldFiles = await drive.files.list({
    q: `modifiedTime < '${cutoffDate.toISOString()}' and parents in '${CALL_LOGS_FOLDER_ID}'`,
    fields: 'files(id, name, modifiedTime)'
  });
  
  for (const file of oldFiles.data.files) {
    // Archive to long-term storage
    await moveToArchive(file.id);
    
    // Delete from active folder
    await drive.files.delete({ fileId: file.id });
  }
}
```

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**:
   - Verify service account has access to folder
   - Check file sharing settings
   - Ensure API scopes are correct

2. **File Not Found**:
   - Verify file ID is correct
   - Check if file has been moved or deleted
   - Ensure folder structure is intact

3. **Upload Failures**:
   - Check file size limits (10GB for Drive)
   - Verify MIME type is supported
   - Ensure sufficient storage quota

4. **API Rate Limits**:
   - Implement exponential backoff
   - Use batch operations when possible
   - Monitor quota usage

### Debug Commands
```bash
# Test API access
curl -H "Authorization: Bearer ACCESS_TOKEN" \
  "https://www.googleapis.com/drive/v3/files?q=parents+in+'1EJxKtbp65kWMLmXF-nfYURd44H-dtCQS'"

# Check file permissions
curl -H "Authorization: Bearer ACCESS_TOKEN" \
  "https://www.googleapis.com/drive/v3/files/FILE_ID/permissions"

# Download file content
curl -H "Authorization: Bearer ACCESS_TOKEN" \
  "https://www.googleapis.com/drive/v3/files/FILE_ID?alt=media"
```

## Performance Optimization

### Caching Strategy
```javascript
// Cache frequently accessed files
const fileCache = new Map();

async function getCachedFile(fileId, maxAge = 3600000) { // 1 hour cache
  const cached = fileCache.get(fileId);
  
  if (cached && Date.now() - cached.timestamp < maxAge) {
    return cached.content;
  }
  
  const content = await downloadFile(fileId);
  fileCache.set(fileId, {
    content: content,
    timestamp: Date.now()
  });
  
  return content;
}
```

### Batch Operations
```javascript
// Upload multiple files efficiently
async function batchUploadFiles(files, folderId) {
  const drive = google.drive({ version: 'v3', auth });
  
  const boundary = 'batch_boundary';
  let batchBody = '';
  
  files.forEach((file, index) => {
    batchBody += `--${boundary}\n`;
    batchBody += `Content-Type: application/http\n`;
    batchBody += `Content-ID: ${index}\n\n`;
    batchBody += `POST /upload/drive/v3/files HTTP/1.1\n`;
    batchBody += `Content-Type: application/json\n\n`;
    batchBody += JSON.stringify({
      name: file.name,
      parents: [folderId]
    }) + '\n';
    batchBody += `--${boundary}\n`;
    batchBody += `Content-Type: ${file.mimeType}\n\n`;
    batchBody += file.content + '\n';
  });
  
  batchBody += `--${boundary}--`;
  
  const response = await drive.request({
    method: 'POST',
    url: 'https://www.googleapis.com/batch/drive/v3',
    headers: {
      'Content-Type': `multipart/mixed; boundary=${boundary}`
    },
    body: batchBody
  });
  
  return response.data;
}
```

## Support Resources

- **Google Drive API**: https://developers.google.com/drive/api
- **Google Cloud Console**: https://console.cloud.google.com
- **API Explorer**: https://developers.google.com/drive/api/v3/reference
- **Community Support**: https://stackoverflow.com/questions/tagged/google-drive-api

---

*For Google Sheets integration, see: [../google-sheets/index.md](../google-sheets/index.md)*
*For Make.com file operations, see: [../../caller/docs/makecom/index.md](../../caller/docs/makecom/index.md)*