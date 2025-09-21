import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const outcome = searchParams.get('outcome');
    const prospectId = searchParams.get('prospectId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';
    
    const offset = (page - 1) * limit;
    
    // Build WHERE clause
    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    let paramIndex = 1;
    
    if (status) {
      conditions.push(`c.vapi_status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    
    if (outcome) {
      conditions.push(`c.outcome = $${paramIndex}`);
      params.push(outcome);
      paramIndex++;
    }
    
    if (prospectId) {
      conditions.push(`c.prospect_id = $${paramIndex}`);
      params.push(prospectId);
      paramIndex++;
    }
    
    if (dateFrom) {
      conditions.push(`c.created_at >= $${paramIndex}`);
      params.push(new Date(dateFrom));
      paramIndex++;
    }
    
    if (dateTo) {
      conditions.push(`c.created_at <= $${paramIndex}`);
      params.push(new Date(dateTo));
      paramIndex++;
    }
    
    const whereClause = conditions.join(' AND ');
    
    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM calls c WHERE ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count);
    
    // Get calls with prospect information
    params.push(limit);
    params.push(offset);
    
    const callsResult = await query(
      `SELECT 
        c.*,
        p.business_name,
        p.contact_name,
        p.contact_phone,
        p.industry,
        p.location,
        p.temperature as prospect_temperature,
        p.pipeline_stage
      FROM calls c
      LEFT JOIN prospects p ON c.prospect_id = p.id
      WHERE ${whereClause}
      ORDER BY c.${sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );
    
    // Calculate statistics
    const statsResult = await query(
      `SELECT 
        COUNT(*) as total_calls,
        COUNT(CASE WHEN c.outcome = 'qualified' THEN 1 END) as qualified_calls,
        COUNT(CASE WHEN c.vapi_status = 'ended' THEN 1 END) as completed_calls,
        AVG(c.duration) as avg_duration,
        SUM(c.cost) as total_cost,
        AVG(c.qualification_score) as avg_qualification_score
      FROM calls c
      WHERE ${whereClause}`,
      params.slice(0, params.length - 2) // Remove limit and offset
    );
    
    const stats = statsResult.rows[0];
    
    return NextResponse.json({
      calls: callsResult.rows,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      statistics: {
        totalCalls: parseInt(stats.total_calls || 0),
        qualifiedCalls: parseInt(stats.qualified_calls || 0),
        completedCalls: parseInt(stats.completed_calls || 0),
        avgDuration: parseFloat(stats.avg_duration || 0),
        totalCost: parseFloat(stats.total_cost || 0),
        avgQualificationScore: parseFloat(stats.avg_qualification_score || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching calls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calls' },
      { status: 500 }
    );
  }
}