#!/bin/bash

# Test script for Sales Caller v2 webhook
# Usage: ./test_webhook.sh [api_key]

WEBHOOK_URL="https://hook.us2.make.com/gugssi64ofbr3vgny705qg2tdsvrgjlx"
API_KEY="${1:-your_api_key_here}"

echo "Testing Sales Caller Webhook..."
echo "Webhook URL: $WEBHOOK_URL"
echo "API Key: $API_KEY"
echo ""

# Test 1: Meeting Scheduled
echo "Test 1: Meeting Scheduled Outcome"
curl -X POST "$WEBHOOK_URL" \
  -H "x-make-apikey: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "callId": "test_call_001",
    "orgId": "test_org",
    "callStatus": "completed",
    "outcome": "meeting-scheduled",
    "duration": 245,
    "cost": 0.82,
    "summary": "Prospect interested in digital marketing services. Has budget of $2500/month. Scheduled demo for Thursday 2pm.",
    "qualificationScore": 95,
    "temperature": "Hot",
    "meetingTime": "2025-09-19T14:00:00.000Z",
    "metadata": {
      "leadId": "1",
      "company": "Test Company",
      "leadName": "Jane Smith",
      "industry": "Manufacturing"
    }
  }'

echo -e "\n\n"

# Test 2: Interested but No Meeting
echo "Test 2: Interested but No Meeting"
curl -X POST "$WEBHOOK_URL" \
  -H "x-make-apikey: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "callId": "test_call_002",
    "orgId": "test_org",
    "callStatus": "completed",
    "outcome": "interested",
    "duration": 156,
    "cost": 0.52,
    "summary": "Prospect showed interest but wants to think about it. Has some marketing budget. Follow up in 1 week.",
    "qualificationScore": 65,
    "temperature": "Warm",
    "metadata": {
      "leadId": "2",
      "company": "Test Restaurant",
      "leadName": "Mike Jones",
      "industry": "Restaurant"
    }
  }'

echo -e "\n\n"

# Test 3: Not Interested
echo "Test 3: Not Interested"
curl -X POST "$WEBHOOK_URL" \
  -H "x-make-apikey: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "callId": "test_call_003",
    "orgId": "test_org",
    "callStatus": "completed",
    "outcome": "not-interested",
    "duration": 45,
    "cost": 0.15,
    "summary": "Not interested in marketing services at this time.",
    "qualificationScore": 10,
    "temperature": "Cold",
    "reason": "Budget constraints",
    "metadata": {
      "leadId": "3",
      "company": "Test Construction",
      "leadName": "Chris Lee",
      "industry": "Construction"
    }
  }'

echo -e "\n\n"

# Test 4: Voicemail
echo "Test 4: Voicemail Left"
curl -X POST "$WEBHOOK_URL" \
  -H "x-make-apikey: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "callId": "test_call_004",
    "orgId": "test_org",
    "callStatus": "voicemail",
    "outcome": "voicemail",
    "duration": 30,
    "cost": 0.10,
    "summary": "Voicemail left with callback information.",
    "metadata": {
      "leadId": "4",
      "company": "Test Consulting",
      "leadName": "Sarah Kim",
      "industry": "Professional Services"
    }
  }'

echo -e "\n\n"

echo "Webhook tests completed!"
echo ""
echo "Expected Results:"
echo "- Test 1: Should update to 'Opportunity' stage with 'Hot' temperature"
echo "- Test 2: Should update temperature to 'Warm' and increase likelihood"
echo "- Test 3: Should mark as 'Lost' with 'Cold' temperature"
echo "- Test 4: Should mark as 'Follow Up' for retry in 2 business days"
echo ""
echo "Check your Google Sheets pipeline to verify updates!"