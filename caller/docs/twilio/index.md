# Twilio - Telephony Integration

## What is Twilio?

Twilio is a cloud communications platform that provides APIs for voice, messaging, and video communications. It enables developers to programmatically make and receive phone calls, send text messages, and build communication applications.

### Key Features
- **Voice API**: Make and receive phone calls programmatically
- **Phone Numbers**: Purchase and manage phone numbers globally
- **Call Recording**: Automatic recording and transcription
- **Call Analytics**: Detailed call metrics and reporting
- **Webhooks**: Real-time notifications for call events
- **Global Coverage**: Phone numbers and calling in 100+ countries

## How Twilio Fits Into Our Sales System

Twilio can serve as an alternative or complement to Vapi AI's built-in telephony:

### Integration Options

#### Option 1: Vapi + Twilio (Recommended)
```
Make.com → Vapi AI (with Twilio numbers) → Call Processing → Webhook Results
```
- **Best of Both Worlds**: Vapi's AI + Twilio's reliability
- **Better Call Quality**: Twilio's proven telephony infrastructure
- **More Control**: Direct access to call logs and analytics

#### Option 2: Direct Twilio Integration
```
Make.com → Twilio API → TwiML Voice Apps → Call Processing → Webhook Results
```
- **Full Control**: Custom call flows and processing
- **Advanced Features**: Call routing, IVR, conferencing
- **Cost Optimization**: Direct Twilio pricing

#### Option 3: Hybrid Approach
```
Make.com → Twilio (Initiate) → Vapi AI (Process) → Twilio (Complete) → Results
```
- **Maximum Flexibility**: Best features from both platforms
- **Fallback Options**: Redundancy for critical calls

## Step-by-Step Setup Guide

### Prerequisites
- Twilio account (free trial available)
- Valid phone number for verification
- Credit card for purchasing phone numbers (small cost)
- Basic understanding of webhooks

### Step 1: Create Twilio Account
1. Go to https://twilio.com
2. Sign up for a free trial account
3. Verify your phone number
4. Complete account setup

### Step 2: Get Twilio Credentials
1. **Account SID and Auth Token**:
   - Go to Twilio Console Dashboard
   - Find "Account Info" section
   - Copy Account SID (starts with `AC...`)
   - Copy Auth Token (click to reveal)

2. **Purchase Phone Number**:
   - Go to Phone Numbers → Manage → Buy a number
   - Choose country and area code
   - Select a number and purchase (~$1/month)
   - Copy the phone number

### Step 3: Environment Configuration

Add these variables to your `.env` file:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID="AC_your_account_sid_here"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_PHONE_NUMBER="+1234567890"

# Webhook Configuration
TWILIO_WEBHOOK_URL="https://your-webhook-url.com/twilio"
```

### Step 4: Configure Vapi + Twilio Integration

#### In Vapi Dashboard:
1. Go to Phone Numbers
2. Click "Connect Twilio Number"
3. Enter your Twilio credentials:
   - Account SID
   - Auth Token
   - Phone Number
4. Test the connection

#### Webhook Configuration:
```javascript
// Vapi request with Twilio number
{
  "phoneNumberId": "your_twilio_connected_number_id",
  "customer": {
    "number": "+15551234567"
  },
  "assistant": {
    // ... your assistant configuration
  },
  "twilioConfig": {
    "record": true,
    "recordingChannels": "dual",
    "recordingStatusCallback": "https://your-webhook-url.com/recording"
  }
}
```

### Step 5: Direct Twilio Integration (Alternative)

#### Basic Call Initiation:
```javascript
const twilio = require('twilio');
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

async function initiateCall(prospectPhone, scriptUrl) {
  try {
    const call = await client.calls.create({
      url: scriptUrl, // TwiML URL for call script
      to: prospectPhone,
      from: TWILIO_PHONE_NUMBER,
      record: true,
      recordingStatusCallback: 'https://your-webhook-url.com/recording'
    });
    
    return call.sid;
  } catch (error) {
    console.error('Call failed:', error);
    throw error;
  }
}
```

#### TwiML Voice Script:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">
    Hi {{prospect_name}}, this is Sarah from Mile High Marketing calling for {{company}}.
  </Say>
  
  <Gather input="speech" timeout="10" speechTimeout="auto" action="/process-response">
    <Say voice="alice">
      I've been researching {{industry}} businesses in your area and noticed you could benefit from our digital marketing services. How are you currently attracting new customers?
    </Say>
  </Gather>
  
  <Say voice="alice">
    I didn't catch that. Let me leave you my callback number.
  </Say>
</Response>
```

## Integration Configurations

### Configuration 1: Vapi + Twilio (Recommended)

#### Advantages:
- **AI Conversations**: Natural language processing with GPT-4
- **Reliable Telephony**: Twilio's proven call infrastructure
- **Easy Setup**: Minimal configuration required
- **Rich Analytics**: Both Vapi and Twilio call data

#### Setup Steps:
1. Connect Twilio number to Vapi
2. Configure Vapi assistant with Twilio webhooks
3. Use existing Make.com workflow
4. Enhanced call quality and reliability

### Configuration 2: Direct Twilio Integration

#### Advantages:
- **Full Control**: Complete customization of call flow
- **Cost Optimization**: Direct Twilio pricing
- **Advanced Features**: IVR, call routing, conferencing
- **Custom Logic**: Complex qualification workflows

#### Required Components:
- **TwiML Applications**: Voice call scripts
- **Webhook Handlers**: Process call responses
- **Speech Recognition**: Convert speech to text
- **AI Processing**: Analyze responses and route calls

### Configuration 3: Hybrid Approach

#### Workflow:
1. **Twilio initiates call** with basic greeting
2. **Transfer to Vapi** for AI conversation
3. **Return to Twilio** for call completion
4. **Combined analytics** from both platforms

## API Integration Examples

### Making Calls with Twilio
```javascript
// Basic call with TwiML
const call = await client.calls.create({
  url: 'https://your-server.com/twiml/sales-script',
  to: '+15551234567',
  from: TWILIO_PHONE_NUMBER,
  record: true,
  timeout: 60,
  statusCallback: 'https://your-webhook.com/status'
});
```

### Processing Call Results
```javascript
// Webhook handler for call completion
app.post('/twilio/webhook', (req, res) => {
  const {
    CallSid,
    CallStatus,
    CallDuration,
    RecordingUrl,
    From,
    To
  } = req.body;
  
  // Process call results
  updateProspectStatus({
    callId: CallSid,
    status: CallStatus,
    duration: CallDuration,
    recording: RecordingUrl,
    prospect: From
  });
  
  res.status(200).send('OK');
});
```

### Speech Recognition
```javascript
// TwiML with speech gathering
const twiml = new VoiceResponse();

twiml.gather({
  input: 'speech',
  timeout: 10,
  speechTimeout: 'auto',
  action: '/process-speech'
}, (gather) => {
  gather.say({
    voice: 'alice'
  }, 'What is your biggest challenge with marketing?');
});

twiml.say('Thank you for your time. We\'ll follow up via email.');
```

## Troubleshooting

### Common Issues

1. **Call Quality Problems**:
   - Check internet connection stability
   - Verify Twilio number configuration
   - Test with different regions/numbers
   - Monitor call quality metrics

2. **Webhook Authentication Failures**:
   - Verify webhook URL is accessible
   - Check Twilio signature validation
   - Ensure HTTPS is properly configured
   - Test webhook with Twilio debugger

3. **Number Purchasing Issues**:
   - Verify account has sufficient credit
   - Check if number type is supported
   - Ensure compliance with local regulations
   - Contact Twilio support for restricted numbers

4. **Recording/Transcription Problems**:
   - Verify recording permissions
   - Check webhook URL for recording status
   - Ensure proper file format support
   - Test transcription accuracy

### Debug Commands
```bash
# Test Twilio API connectivity
curl -X GET "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID.json" \
  -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN

# List purchased phone numbers
curl -X GET "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/IncomingPhoneNumbers.json" \
  -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN

# Check call logs
curl -X GET "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Calls.json" \
  -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN
```

## Cost Optimization

### Pricing Understanding
- **Phone Numbers**: ~$1/month per number
- **Outbound Calls**: $0.013/minute in US
- **Recording**: $0.0025/minute
- **Transcription**: $0.05/minute

### Cost-Saving Strategies
1. **Call Duration Limits**: Set maximum call length
2. **Smart Routing**: Use local numbers for better connection rates
3. **Bulk Purchasing**: Consider volume discounts
4. **Recording Optimization**: Only record qualified calls

### Budget Monitoring
```javascript
// Monitor monthly usage
const usage = await client.usage.records.list({
  category: 'calls-outbound',
  startDate: new Date('2025-09-01'),
  endDate: new Date('2025-09-30')
});

console.log(`Total outbound calls: ${usage.length}`);
console.log(`Total cost: $${usage.reduce((sum, record) => sum + parseFloat(record.price), 0)}`);
```

## Advanced Features

### Call Recording Analysis
```javascript
// Download and analyze recordings
const recording = await client.recordings(recordingSid).fetch();
const audioUrl = `https://api.twilio.com${recording.uri.replace('.json', '.mp3')}`;

// Send to transcription service
const transcript = await transcribeAudio(audioUrl);
const sentiment = await analyzeSentiment(transcript);
```

### Call Routing
```xml
<!-- Advanced TwiML with routing -->
<Response>
  <Gather input="dtmf speech" numDigits="1" timeout="10">
    <Say>Press 1 for sales, 2 for support, or say your reason for calling</Say>
  </Gather>
  
  <Switch>
    <Case condition="Digits == '1'">
      <Dial>+15551234567</Dial>
    </Case>
    <Case condition="SpeechResult contains 'marketing'">
      <Redirect>/marketing-qualification</Redirect>
    </Case>
    <Default>
      <Say>Let me connect you to our general line</Say>
    </Default>
  </Switch>
</Response>
```

### Integration with CRM
```javascript
// Sync call data with CRM
async function syncCallToCRM(callData) {
  const crmData = {
    contactPhone: callData.to,
    callDuration: callData.duration,
    callStatus: callData.status,
    recordingUrl: callData.recordingUrl,
    callDate: new Date(callData.dateCreated),
    notes: callData.transcript
  };
  
  await crmAPI.updateContact(crmData);
}
```

## Security Best Practices

### Webhook Security
```javascript
const crypto = require('crypto');

function validateTwilioSignature(signature, url, params, authToken) {
  const data = Object.keys(params)
    .sort()
    .reduce((acc, key) => acc + key + params[key], url);
    
  const expectedSignature = crypto
    .createHmac('sha1', authToken)
    .update(Buffer.from(data, 'utf-8'))
    .digest('base64');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from('sha1=' + expectedSignature)
  );
}
```

### Data Protection
1. **Encryption**: Encrypt call recordings at rest
2. **Access Control**: Limit API key permissions
3. **Compliance**: Follow PCI DSS for payment data
4. **Retention**: Implement data retention policies

## Support Resources

- **Twilio Documentation**: https://www.twilio.com/docs
- **TwiML Reference**: https://www.twilio.com/docs/voice/twiml
- **Twilio Console**: https://console.twilio.com
- **Community Support**: https://support.twilio.com
- **API Explorer**: https://www.twilio.com/console/dev-tools/api-explorer

## Migration Guide

### From Vapi-Only to Vapi+Twilio
1. Purchase Twilio number
2. Connect number to Vapi
3. Update webhook configurations
4. Test call quality improvements

### From Other Platforms
1. Export existing call data
2. Import contacts to new system
3. Configure number porting if needed
4. Update integration workflows

---

*For Vapi AI integration, see: [../vapi/index.md](../vapi/index.md)*
*For Make.com automation, see: [../makecom/index.md](../makecom/index.md)*