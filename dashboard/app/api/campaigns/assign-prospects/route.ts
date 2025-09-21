import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, prospectIds, filters } = body;
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }
    
    let prospectsToAssign: string[] = [];
    
    // If specific prospect IDs are provided
    if (prospectIds && prospectIds.length > 0) {
      prospectsToAssign = prospectIds;
    } 
    // If filters are provided, find matching prospects
    else if (filters) {
      const conditions: string[] = ['1=1'];
      const params: any[] = [];
      let paramIndex = 1;
      
      if (filters.temperature) {
        conditions.push(`temperature = $${paramIndex}`);
        params.push(filters.temperature);
        paramIndex++;
      }
      
      if (filters.industry) {
        conditions.push(`industry = $${paramIndex}`);
        params.push(filters.industry);
        paramIndex++;
      }
      
      if (filters.location) {
        conditions.push(`location ILIKE $${paramIndex}`);
        params.push(`%${filters.location}%`);
        paramIndex++;
      }
      
      if (filters.pipeline_stage) {
        conditions.push(`pipeline_stage = $${paramIndex}`);
        params.push(filters.pipeline_stage);
        paramIndex++;
      }
      
      if (filters.score_min) {
        conditions.push(`score >= $${paramIndex}`);
        params.push(filters.score_min);
        paramIndex++;
      }
      
      if (filters.never_contacted === true) {
        conditions.push(`NOT EXISTS (SELECT 1 FROM calls WHERE calls.prospect_id = prospects.id)`);
      }
      
      const whereClause = conditions.join(' AND ');
      
      const prospectsResult = await query(
        `SELECT id FROM prospects WHERE ${whereClause} LIMIT ${filters.limit || 100}`,
        params
      );
      
      prospectsToAssign = prospectsResult.rows.map(r => r.id);
    }
    
    if (prospectsToAssign.length === 0) {
      return NextResponse.json(
        { error: 'No prospects to assign' },
        { status: 400 }
      );
    }
    
    // Create campaign-prospect assignments
    const assignments = await Promise.all(
      prospectsToAssign.map(async (prospectId) => {
        try {
          // Check if already assigned
          const existingResult = await query(
            'SELECT id FROM campaign_prospects WHERE campaign_id = $1 AND prospect_id = $2',
            [campaignId, prospectId]
          );
          
          if (existingResult.rows.length > 0) {
            return { prospectId, status: 'already_assigned' };
          }
          
          // Create assignment
          await query(
            `INSERT INTO campaign_prospects (
              campaign_id,
              prospect_id,
              status,
              created_at
            ) VALUES ($1, $2, 'pending', NOW())`,
            [campaignId, prospectId]
          );
          
          return { prospectId, status: 'assigned' };
        } catch (error) {
          console.error(`Error assigning prospect ${prospectId}:`, error);
          return { prospectId, status: 'error' };
        }
      })
    );
    
    // Count results
    const assigned = assignments.filter(a => a.status === 'assigned').length;
    const alreadyAssigned = assignments.filter(a => a.status === 'already_assigned').length;
    const errors = assignments.filter(a => a.status === 'error').length;
    
    return NextResponse.json({
      success: true,
      summary: {
        assigned,
        alreadyAssigned,
        errors,
        total: assignments.length
      },
      assignments
    });
  } catch (error) {
    console.error('Error assigning prospects:', error);
    return NextResponse.json(
      { error: 'Failed to assign prospects' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve prospects assigned to a campaign
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get('campaignId');
    const status = searchParams.get('status');
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }
    
    // Build WHERE clause
    const conditions: string[] = [`cp.campaign_id = $1`];
    const params: any[] = [campaignId];
    let paramIndex = 2;
    
    if (status) {
      conditions.push(`cp.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    
    const whereClause = conditions.join(' AND ');
    
    // Get assigned prospects with their details and call history
    const result = await query(
      `SELECT 
        cp.*,
        p.business_name,
        p.contact_name,
        p.contact_phone,
        p.contact_email,
        p.industry,
        p.location,
        p.temperature,
        p.pipeline_stage,
        p.score,
        COUNT(c.id) as total_calls,
        MAX(c.created_at) as last_call_date,
        COUNT(CASE WHEN c.outcome = 'qualified' THEN 1 END) as qualified_calls
      FROM campaign_prospects cp
      JOIN prospects p ON cp.prospect_id = p.id
      LEFT JOIN calls c ON p.id = c.prospect_id AND c.campaign_id = cp.campaign_id
      WHERE ${whereClause}
      GROUP BY cp.id, cp.campaign_id, cp.prospect_id, cp.status, cp.created_at, cp.last_called, cp.call_count, cp.notes,
               p.business_name, p.contact_name, p.contact_phone, p.contact_email, 
               p.industry, p.location, p.temperature, p.pipeline_stage, p.score
      ORDER BY cp.created_at DESC`,
      params
    );
    
    return NextResponse.json({
      prospects: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching campaign prospects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign prospects' },
      { status: 500 }
    );
  }
}