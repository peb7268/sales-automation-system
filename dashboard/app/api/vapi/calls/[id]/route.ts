import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const callId = params.id;
    
    // Get call with prospect information
    const callResult = await query(
      `SELECT 
        c.*,
        p.business_name,
        p.contact_name,
        p.contact_email,
        p.contact_phone,
        p.industry,
        p.location,
        p.website,
        p.temperature as prospect_temperature,
        p.pipeline_stage,
        p.score as prospect_score,
        p.notes as prospect_notes
      FROM calls c
      LEFT JOIN prospects p ON c.prospect_id = p.id
      WHERE c.id = $1 OR c.vapi_call_id = $1
      LIMIT 1`,
      [callId]
    );
    
    if (callResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Call not found' },
        { status: 404 }
      );
    }
    
    const call = callResult.rows[0];
    
    // Get related calls from the same prospect
    let relatedCalls = [];
    if (call.prospect_id) {
      const relatedResult = await query(
        `SELECT 
          id,
          vapi_call_id,
          created_at,
          duration,
          outcome,
          vapi_status,
          qualification_score
        FROM calls
        WHERE prospect_id = $1 AND id != $2
        ORDER BY created_at DESC
        LIMIT 5`,
        [call.prospect_id, call.id]
      );
      relatedCalls = relatedResult.rows;
    }
    
    return NextResponse.json({
      call,
      relatedCalls
    });
  } catch (error) {
    console.error('Error fetching call details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call details' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const callId = params.id;
    const updates = await request.json();
    
    // Build update query dynamically
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    // Allowed fields to update
    const allowedFields = [
      'notes',
      'outcome',
      'qualification_score',
      'temperature',
      'scheduled_followup',
      'summary'
    ];
    
    for (const field of allowedFields) {
      if (field in updates) {
        updateFields.push(`${field} = $${paramIndex}`);
        values.push(updates[field]);
        paramIndex++;
      }
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }
    
    // Add updated_at
    updateFields.push(`updated_at = NOW()`);
    
    // Add the ID parameter
    values.push(callId);
    
    const updateQuery = `
      UPDATE calls 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex} OR vapi_call_id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await query(updateQuery, values);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Call not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      call: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating call:', error);
    return NextResponse.json(
      { error: 'Failed to update call' },
      { status: 500 }
    );
  }
}