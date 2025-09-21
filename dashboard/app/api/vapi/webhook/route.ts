import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { VapiWebhookEvent, VapiCall } from '@/lib/vapi/vapi-types';

// Validate webhook signature (optional but recommended for security)
function validateWebhookSignature(request: NextRequest, body: string): boolean {
  const signature = request.headers.get('x-vapi-signature');
  if (!signature || !process.env.VAPI_WEBHOOK_SECRET) {
    // If no secret is configured, allow the request (for development)
    return true;
  }
  
  // TODO: Implement signature validation using VAPI_WEBHOOK_SECRET
  // This would typically involve HMAC verification
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    
    // Validate webhook signature
    if (!validateWebhookSignature(request, body)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    const event: VapiWebhookEvent = JSON.parse(body);
    console.log('Received Vapi webhook event:', event.type);
    
    switch (event.type) {
      case 'call.started':
        await handleCallStarted(event.call);
        break;
        
      case 'call.ended':
        await handleCallEnded(event.call);
        break;
        
      case 'transcript.update':
        await handleTranscriptUpdate(event.call, event.transcript);
        break;
        
      case 'function-call':
        await handleFunctionCall(event.call, event.functionCall);
        break;
        
      case 'status-update':
        await handleStatusUpdate(event.call, event.status);
        break;
        
      case 'end-of-call-report':
        await handleEndOfCallReport(event.call, event.report);
        break;
        
      default:
        console.log('Unhandled webhook event type:', event.type);
    }
    
    // Broadcast event to WebSocket clients for real-time monitoring
    await broadcastToMonitoring(event);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

async function handleCallStarted(call: VapiCall) {
  console.log('Call started:', call.id);
  
  // Check if prospect exists
  let prospectId = null;
  if (call.customer?.number) {
    const prospectResult = await query(
      'SELECT id FROM prospects WHERE contact_phone = $1 LIMIT 1',
      [call.customer.number]
    );
    if (prospectResult.rows.length > 0) {
      prospectId = prospectResult.rows[0].id;
    }
  }
  
  // Insert or update call record
  await query(
    `INSERT INTO calls (
      vapi_call_id,
      prospect_id,
      vapi_status,
      started_at,
      assistant_id,
      phone_number,
      customer_number,
      call_type,
      metadata,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    ON CONFLICT (vapi_call_id) 
    DO UPDATE SET
      vapi_status = EXCLUDED.vapi_status,
      started_at = EXCLUDED.started_at,
      updated_at = NOW()`,
    [
      call.id,
      prospectId,
      call.status,
      call.startedAt || new Date().toISOString(),
      call.assistant?.id,
      call.phoneNumber?.number,
      call.customer?.number,
      call.type,
      JSON.stringify(call)
    ]
  );
}

async function handleCallEnded(call: VapiCall) {
  console.log('Call ended:', call.id);
  
  // Calculate call metrics
  const duration = call.endedAt && call.startedAt 
    ? Math.floor((new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000)
    : 0;
  
  // Update call record with final data
  await query(
    `UPDATE calls SET
      vapi_status = $1,
      ended_at = $2,
      duration = $3,
      recording_url = $4,
      summary = $5,
      cost = $6,
      metadata = $7,
      updated_at = NOW()
    WHERE vapi_call_id = $8`,
    [
      call.status,
      call.endedAt,
      duration,
      call.recordingUrl,
      call.summary,
      call.cost,
      JSON.stringify(call),
      call.id
    ]
  );
  
  // Analyze call for qualification and temperature
  await analyzeCallOutcome(call.id);
}

async function handleTranscriptUpdate(call: VapiCall, transcript: any) {
  console.log('Transcript update for call:', call.id);
  
  // Append transcript to the call record
  await query(
    `UPDATE calls SET
      transcript = COALESCE(transcript, '[]'::jsonb) || $1::jsonb,
      updated_at = NOW()
    WHERE vapi_call_id = $2`,
    [
      JSON.stringify([transcript]),
      call.id
    ]
  );
}

async function handleFunctionCall(call: VapiCall, functionCall: any) {
  console.log('Function call for:', call.id, functionCall.name);
  
  // Handle specific function calls (e.g., qualify_lead, schedule_followup)
  switch (functionCall.name) {
    case 'qualify_lead':
      await updateCallQualification(call.id, functionCall.result);
      break;
    case 'schedule_followup':
      await scheduleFollowup(call.id, functionCall.result);
      break;
    case 'update_prospect_info':
      await updateProspectInfo(call.id, functionCall.result);
      break;
  }
}

async function handleStatusUpdate(call: VapiCall, status: any) {
  console.log('Status update for call:', call.id, status);
  
  // Update call status in database
  await query(
    `UPDATE calls SET
      vapi_status = $1,
      metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{statusHistory}', 
        COALESCE(metadata->'statusHistory', '[]'::jsonb) || $2::jsonb),
      updated_at = NOW()
    WHERE vapi_call_id = $3`,
    [
      status.status,
      JSON.stringify([{ status: status.status, timestamp: new Date().toISOString() }]),
      call.id
    ]
  );
}

async function handleEndOfCallReport(call: VapiCall, report: any) {
  console.log('End of call report for:', call.id);
  
  // Update call with comprehensive report data
  await query(
    `UPDATE calls SET
      summary = $1,
      transcript = $2,
      recording_url = $3,
      cost = $4,
      duration = $5,
      metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{report}', $6::jsonb),
      updated_at = NOW()
    WHERE vapi_call_id = $7`,
    [
      report.summary,
      JSON.stringify(report.transcript || []),
      report.recordingUrl,
      report.cost,
      report.duration,
      JSON.stringify(report),
      call.id
    ]
  );
  
  // Final analysis of the call
  await analyzeCallOutcome(call.id);
}

async function analyzeCallOutcome(callId: string) {
  // Get call data
  const callResult = await query(
    'SELECT * FROM calls WHERE vapi_call_id = $1 LIMIT 1',
    [callId]
  );
  
  if (callResult.rows.length === 0) return;
  
  const call = callResult.rows[0];
  
  // Simple keyword-based analysis (in production, use AI for better analysis)
  let outcome = 'not_qualified';
  let temperature = 'cold';
  let qualificationScore = 0;
  
  const transcriptText = JSON.stringify(call.transcript || '').toLowerCase();
  const summary = (call.summary || '').toLowerCase();
  
  // Analyze for positive indicators
  const positiveKeywords = ['interested', 'yes', 'definitely', 'sounds good', 'tell me more', 'schedule', 'meeting'];
  const negativeKeywords = ['not interested', 'no thanks', 'busy', 'later', 'not now', 'remove'];
  
  const positiveCount = positiveKeywords.filter(kw => transcriptText.includes(kw) || summary.includes(kw)).length;
  const negativeCount = negativeKeywords.filter(kw => transcriptText.includes(kw) || summary.includes(kw)).length;
  
  // Determine outcome and temperature
  if (positiveCount > negativeCount) {
    if (positiveCount >= 3) {
      outcome = 'qualified';
      temperature = 'hot';
      qualificationScore = 8 + Math.min(positiveCount - 3, 2);
    } else if (positiveCount >= 1) {
      outcome = 'interested';
      temperature = 'warm';
      qualificationScore = 5 + positiveCount;
    }
  } else if (negativeCount > 0) {
    outcome = 'not_interested';
    temperature = 'cold';
    qualificationScore = Math.max(0, 3 - negativeCount);
  } else if (call.duration > 120) {
    outcome = 'follow_up';
    temperature = 'cool';
    qualificationScore = 4;
  }
  
  // Update call with analysis results
  await query(
    `UPDATE calls SET
      outcome = $1,
      temperature = $2,
      qualification_score = $3,
      updated_at = NOW()
    WHERE vapi_call_id = $4`,
    [outcome, temperature, qualificationScore, callId]
  );
  
  // Update prospect temperature if linked
  if (call.prospect_id) {
    await query(
      `UPDATE prospects SET
        temperature = $1,
        last_contact = NOW(),
        updated_at = NOW()
      WHERE id = $2`,
      [temperature, call.prospect_id]
    );
  }
}

async function updateCallQualification(callId: string, result: any) {
  await query(
    `UPDATE calls SET
      qualification_score = $1,
      outcome = $2,
      temperature = $3,
      updated_at = NOW()
    WHERE vapi_call_id = $4`,
    [
      result.score || 5,
      result.qualified ? 'qualified' : 'not_qualified',
      result.temperature || 'cool',
      callId
    ]
  );
}

async function scheduleFollowup(callId: string, result: any) {
  await query(
    `UPDATE calls SET
      scheduled_followup = $1,
      outcome = 'follow_up',
      updated_at = NOW()
    WHERE vapi_call_id = $2`,
    [result.scheduledDate, callId]
  );
  
  // TODO: Create a task or calendar event for the followup
}

async function updateProspectInfo(callId: string, info: any) {
  // Get the call to find prospect
  const callResult = await query(
    'SELECT prospect_id FROM calls WHERE vapi_call_id = $1 LIMIT 1',
    [callId]
  );
  
  if (callResult.rows.length > 0 && callResult.rows[0].prospect_id) {
    // Build dynamic update query for prospect
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    const allowedFields = ['business_name', 'contact_name', 'contact_email', 'industry', 'notes'];
    
    for (const field of allowedFields) {
      if (info[field]) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(info[field]);
        paramIndex++;
      }
    }
    
    if (updates.length > 0) {
      values.push(callResult.rows[0].prospect_id);
      await query(
        `UPDATE prospects SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex}`,
        values
      );
    }
  }
}

async function broadcastToMonitoring(event: VapiWebhookEvent) {
  // In a production environment, this would send the event to WebSocket clients
  // For now, we'll just log it
  console.log('Broadcasting to monitoring clients:', {
    type: event.type,
    callId: event.call?.id,
    timestamp: new Date().toISOString()
  });
  
  // TODO: Implement WebSocket broadcasting using a service like Pusher, Socket.io, or native WebSockets
}