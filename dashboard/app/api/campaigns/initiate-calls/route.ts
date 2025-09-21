import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getVapiClient } from '@/lib/vapi/vapi-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      campaignId, 
      prospectIds,
      assistantId,
      maxConcurrent = 1,
      delayBetweenCalls = 30000, // 30 seconds default
      callSettings = {}
    } = body;
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }
    
    // Get campaign details
    const campaignResult = await query(
      'SELECT * FROM campaigns WHERE id = $1 LIMIT 1',
      [campaignId]
    );
    
    if (campaignResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }
    
    const campaign = campaignResult.rows[0];
    
    // Get prospects to call
    let prospectsToCall: any[] = [];
    
    if (prospectIds && prospectIds.length > 0) {
      // Get specific prospects
      const placeholders = prospectIds.map((_, i) => `$${i + 2}`).join(',');
      const prospectsResult = await query(
        `SELECT p.*, cp.id as assignment_id
        FROM prospects p
        JOIN campaign_prospects cp ON p.id = cp.prospect_id
        WHERE cp.campaign_id = $1 AND p.id IN (${placeholders})
        AND cp.status = 'pending'`,
        [campaignId, ...prospectIds]
      );
      prospectsToCall = prospectsResult.rows;
    } else {
      // Get all pending prospects in the campaign
      const prospectsResult = await query(
        `SELECT p.*, cp.id as assignment_id
        FROM prospects p
        JOIN campaign_prospects cp ON p.id = cp.prospect_id
        WHERE cp.campaign_id = $1 AND cp.status = 'pending'
        ORDER BY p.score DESC, p.temperature DESC
        LIMIT 50`, // Limit to prevent overwhelming the system
        [campaignId]
      );
      prospectsToCall = prospectsResult.rows;
    }
    
    if (prospectsToCall.length === 0) {
      return NextResponse.json(
        { error: 'No prospects available to call' },
        { status: 400 }
      );
    }
    
    // Initialize Vapi client
    const vapiClient = getVapiClient();
    
    // Initiate calls
    const callResults = [];
    const errors = [];
    let callsInitiated = 0;
    
    for (let i = 0; i < prospectsToCall.length; i++) {
      const prospect = prospectsToCall[i];
      
      // Rate limiting - wait between calls if not the first call
      if (i > 0 && i % maxConcurrent === 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
      }
      
      try {
        // Prepare call parameters
        const callParams = {
          assistant: assistantId || campaign.assistant_config?.assistantId,
          customer: {
            number: prospect.contact_phone,
            name: prospect.contact_name || prospect.business_name
          },
          phoneNumber: {
            twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
            twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
            twilioAuthToken: process.env.TWILIO_AUTH_TOKEN
          },
          ...callSettings,
          metadata: {
            campaignId: campaignId,
            prospectId: prospect.id,
            businessName: prospect.business_name,
            industry: prospect.industry,
            ...callSettings.metadata
          }
        };
        
        // Initiate the call through Vapi
        const vapiCall = await vapiClient.calls.create(callParams);
        
        // Record the call in our database
        await query(
          `INSERT INTO calls (
            vapi_call_id,
            prospect_id,
            campaign_id,
            vapi_status,
            started_at,
            assistant_id,
            phone_number,
            customer_number,
            call_type,
            metadata,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
          [
            vapiCall.id,
            prospect.id,
            campaignId,
            'queued',
            new Date().toISOString(),
            callParams.assistant,
            process.env.TWILIO_PHONE_NUMBER,
            prospect.contact_phone,
            'outboundPhoneCall',
            JSON.stringify(callParams.metadata)
          ]
        );
        
        // Update campaign_prospects status
        await query(
          `UPDATE campaign_prospects 
          SET status = 'calling', last_called = NOW() 
          WHERE id = $1`,
          [prospect.assignment_id]
        );
        
        callResults.push({
          prospectId: prospect.id,
          businessName: prospect.business_name,
          vapiCallId: vapiCall.id,
          status: 'initiated'
        });
        
        callsInitiated++;
        
      } catch (error: any) {
        console.error(`Error initiating call for prospect ${prospect.id}:`, error);
        errors.push({
          prospectId: prospect.id,
          businessName: prospect.business_name,
          error: error.message
        });
        
        // Update campaign_prospects status to error
        await query(
          `UPDATE campaign_prospects 
          SET status = 'error', notes = $1 
          WHERE id = $2`,
          [error.message, prospect.assignment_id]
        );
      }
    }
    
    // Update campaign status if this is the first batch of calls
    if (campaign.status === 'draft' || campaign.status === 'ready') {
      await query(
        `UPDATE campaigns 
        SET status = 'active', updated_at = NOW() 
        WHERE id = $1`,
        [campaignId]
      );
    }
    
    return NextResponse.json({
      success: true,
      summary: {
        totalProspects: prospectsToCall.length,
        callsInitiated,
        errors: errors.length
      },
      calls: callResults,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Error initiating calls:', error);
    return NextResponse.json(
      { error: 'Failed to initiate calls' },
      { status: 500 }
    );
  }
}

// GET endpoint to check the status of campaign calls
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get('campaignId');
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }
    
    // Get call statistics for the campaign
    const statsResult = await query(
      `SELECT 
        COUNT(*) as total_calls,
        COUNT(CASE WHEN vapi_status = 'queued' THEN 1 END) as queued,
        COUNT(CASE WHEN vapi_status = 'ringing' THEN 1 END) as ringing,
        COUNT(CASE WHEN vapi_status = 'in-progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN vapi_status = 'ended' THEN 1 END) as completed,
        COUNT(CASE WHEN outcome = 'qualified' THEN 1 END) as qualified,
        AVG(duration) as avg_duration,
        SUM(cost) as total_cost
      FROM calls
      WHERE campaign_id = $1`,
      [campaignId]
    );
    
    const stats = statsResult.rows[0];
    
    // Get recent calls
    const recentCallsResult = await query(
      `SELECT 
        c.*,
        p.business_name,
        p.contact_name
      FROM calls c
      JOIN prospects p ON c.prospect_id = p.id
      WHERE c.campaign_id = $1
      ORDER BY c.created_at DESC
      LIMIT 20`,
      [campaignId]
    );
    
    return NextResponse.json({
      stats: {
        totalCalls: parseInt(stats.total_calls || 0),
        queued: parseInt(stats.queued || 0),
        ringing: parseInt(stats.ringing || 0),
        inProgress: parseInt(stats.in_progress || 0),
        completed: parseInt(stats.completed || 0),
        qualified: parseInt(stats.qualified || 0),
        avgDuration: parseFloat(stats.avg_duration || 0),
        totalCost: parseFloat(stats.total_cost || 0)
      },
      recentCalls: recentCallsResult.rows
    });
  } catch (error) {
    console.error('Error fetching campaign call status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call status' },
      { status: 500 }
    );
  }
}