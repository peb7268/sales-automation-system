# Vapi AI - Voice Calling Integration

## What is Vapi AI?

Vapi AI is a conversational AI platform that enables businesses to create and deploy voice agents for phone calls. It combines speech-to-text, natural language processing, and text-to-speech technologies to create human-like voice interactions.

### Key Features
- **Natural Conversations**: GPT-4 powered conversations that sound human
- **ElevenLabs Voice**: High-quality voice synthesis
- **Real-time Processing**: Low-latency voice interactions
- **Webhook Integration**: Real-time call updates and results
- **Call Recording**: Automatic transcription and recording
- **Custom Instructions**: Tailored conversation scripts for your business

## How Vapi Fits Into Our Sales System

Vapi AI serves as the voice engine for our automated sales calling system:

```
Sales Pipeline → Prospect Data → Vapi AI Call → Qualification Results → Make.com Automation
```

### Integration Points
1. **Input**: Prospect data from sales pipeline (name, company, industry, etc.)
2. **Processing**: AI-powered qualification conversation
3. **Output**: Call results, qualification scores, and next actions
4. **Automation**: Webhook triggers Make.com workflows for follow-up

## Step-by-Step Setup Guide

### Prerequisites
- Vapi AI account (https://vapi.ai)
- OpenAI API key (for GPT-4)
- ElevenLabs API key (for voice synthesis)
- Phone number from Vapi or Twilio integration

### Step 1: Create Vapi Account
1. Go to https://vapi.ai
2. Sign up for an account
3. Verify your email and complete onboarding
4. Navigate to the Dashboard

### Step 2: Get API Keys
1. **Vapi API Key**:
   - Go to Settings → API Keys
   - Create new API key
   - Copy the key (starts with `vapi_...`)

2. **Phone Number**:
   - Go to Phone Numbers
   - Purchase a phone number or integrate with Twilio
   - Copy the Phone Number ID

### Step 3: Configure Assistant
1. **Go to Assistants** in Vapi dashboard
2. **Create New Assistant**:
   - Name: "MHM Sales Qualifier"
   - Model: OpenAI GPT-4
   - Voice: ElevenLabs "Sarah"
   - Temperature: 0.7

3. **System Message**:
```
You are Sarah from Mile High Marketing. You are professional, friendly, and focused on helping businesses grow. Use the provided script as a guide but sound natural. Always qualify prospects based on budget, authority, need, and timeline.

Qualification Scoring:
- Interested in growth (+20 points)
- Has budget/authority (+30 points) 
- Has timeline (+20 points)
- Current challenges (+15 points)
- Meeting scheduled (+40 points)

Temperature Ranges:
- Hot: 85+ points
- Warm: 50-84 points  
- Cold: <50 points
```

4. **Voice Settings**:
   - Provider: ElevenLabs
   - Voice ID: sarah
   - Speed: 1.0
   - Stability: 0.5

### Step 4: Environment Configuration

Add these variables to your `.env` file:

```bash
# Vapi AI Configuration
VAPI_API_KEY="your_vapi_api_key_here"
VAPI_ASSISTANT_ID="asst_your_assistant_id"
VAPI_PHONE_NUMBER_ID="pn_your_phone_number_id"

# OpenAI (for Vapi assistant)
OPENAI_API_KEY="sk-your_openai_key"

# ElevenLabs Voice (for Vapi)
ELEVENLABS_API_KEY="your_elevenlabs_key"
ELEVENLABS_VOICE_ID="sarah"
```

### Step 5: Test Configuration

Use the sample request file to test your setup:

```bash
# Test with sample data
curl -X POST "https://api.vapi.ai/call" \
  -H "Authorization: Bearer YOUR_VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @vapi_request_sample.json
```

## Files in This Directory

### `vapi_request_sample.json`
Complete example of API request format with:
- Phone number configuration
- Assistant settings
- Voice configuration  
- Metadata for tracking
- Expected response format

### `sales_script.txt`
Comprehensive sales script template with:
- Personalization tokens ({{lead_name}}, {{company}}, etc.)
- Qualification questions
- Objection handling
- Scoring logic

## API Integration

### Making a Call
```javascript
const response = await fetch('https://api.vapi.ai/call', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${VAPI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    phoneNumberId: VAPI_PHONE_NUMBER_ID,
    customer: { number: "+15551234567" },
    assistant: {
      firstMessage: "Hi John, this is Sarah from Mile High Marketing...",
      model: {
        provider: "openai",
        model: "gpt-4",
        temperature: 0.7,
        systemMessage: "Your system message here..."
      },
      voice: {
        provider: "11labs", 
        voiceId: "sarah"
      }
    },
    metadata: {
      leadId: "123",
      company: "Acme Corp",
      webhook: "https://your-webhook-url.com"
    }
  })
});
```

### Webhook Response
Vapi will send call results to your webhook:
```json
{
  "callId": "call_123abc",
  "callStatus": "completed",
  "outcome": "meeting-scheduled",
  "duration": 245,
  "cost": 0.82,
  "summary": "Prospect interested...",
  "qualificationScore": 95,
  "temperature": "Hot",
  "meetingTime": "2025-09-19T14:00:00.000Z"
}
```

## Troubleshooting

### Common Issues

1. **Call Fails to Connect**:
   - Verify phone number ID is correct
   - Check if number is properly purchased/configured
   - Ensure customer number format is correct (+1XXXXXXXXXX)

2. **Poor Voice Quality**:
   - Check ElevenLabs API key
   - Try different voice IDs
   - Adjust voice speed and stability settings

3. **Assistant Not Following Script**:
   - Review system message instructions
   - Adjust temperature (lower for more consistency)
   - Provide more specific examples in system message

4. **Webhook Not Receiving Data**:
   - Verify webhook URL is accessible
   - Check webhook responds with 200 status
   - Review webhook authentication if required

### Testing Commands

```bash
# Test API connectivity
curl -H "Authorization: Bearer $VAPI_API_KEY" https://api.vapi.ai/account

# Test phone numbers
curl -H "Authorization: Bearer $VAPI_API_KEY" https://api.vapi.ai/phone-number

# Test assistants
curl -H "Authorization: Bearer $VAPI_API_KEY" https://api.vapi.ai/assistant
```

## Support Resources

- **Vapi Documentation**: https://docs.vapi.ai
- **ElevenLabs Voices**: https://elevenlabs.io/voice-library
- **OpenAI GPT-4**: https://platform.openai.com/docs
- **Webhook Testing**: https://webhook.site (for testing webhook endpoints)

## Security Considerations

1. **API Keys**: Keep all API keys secure and never commit to version control
2. **Webhook Authentication**: Implement proper webhook authentication
3. **Call Recording**: Ensure compliance with local recording laws
4. **Data Privacy**: Follow GDPR/CCPA guidelines for call data storage

## Performance Optimization

1. **Call Latency**: Use optimal voice settings for your region
2. **Cost Management**: Monitor call duration and implement timeouts
3. **Quality Monitoring**: Regular review of call transcripts and outcomes
4. **A/B Testing**: Test different scripts and voice settings for better results

---

*For integration with Make.com workflows, see: [../makecom/index.md](../makecom/index.md)*
*For Twilio integration, see: [../twilio/index.md](../twilio/index.md)*