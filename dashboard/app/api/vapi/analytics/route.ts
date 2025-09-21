import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '7'; // days
    const prospectId = searchParams.get('prospectId');
    
    const periodDays = parseInt(period);
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - periodDays);
    
    // Build WHERE clause for filtering
    const conditions: string[] = [`c.created_at >= $1`];
    const params: any[] = [dateFrom];
    let paramIndex = 2;
    
    if (prospectId) {
      conditions.push(`c.prospect_id = $${paramIndex}`);
      params.push(prospectId);
      paramIndex++;
    }
    
    const whereClause = conditions.join(' AND ');
    
    // 1. Call volume over time
    const callVolumeResult = await query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as total,
        COUNT(CASE WHEN outcome = 'qualified' THEN 1 END) as qualified,
        COUNT(CASE WHEN outcome = 'not_qualified' THEN 1 END) as not_qualified,
        COUNT(CASE WHEN outcome = 'interested' THEN 1 END) as interested,
        COUNT(CASE WHEN outcome = 'not_interested' THEN 1 END) as not_interested
      FROM calls c
      WHERE ${whereClause}
      GROUP BY DATE(created_at)
      ORDER BY date ASC`,
      params
    );
    
    // 2. Outcome distribution
    const outcomeDistributionResult = await query(
      `SELECT 
        outcome,
        COUNT(*) as count
      FROM calls c
      WHERE ${whereClause} AND outcome IS NOT NULL
      GROUP BY outcome`,
      params
    );
    
    // 3. Temperature distribution
    const temperatureDistributionResult = await query(
      `SELECT 
        temperature,
        COUNT(*) as count
      FROM calls c
      WHERE ${whereClause} AND temperature IS NOT NULL
      GROUP BY temperature`,
      params
    );
    
    // 4. Call duration statistics
    const durationStatsResult = await query(
      `SELECT 
        DATE(created_at) as date,
        AVG(duration) as avg_duration,
        MIN(duration) as min_duration,
        MAX(duration) as max_duration
      FROM calls c
      WHERE ${whereClause} AND duration IS NOT NULL
      GROUP BY DATE(created_at)
      ORDER BY date ASC`,
      params
    );
    
    // 5. Cost analysis
    const costAnalysisResult = await query(
      `SELECT 
        DATE(created_at) as date,
        SUM(cost) as total_cost,
        AVG(cost) as avg_cost,
        COUNT(*) as call_count
      FROM calls c
      WHERE ${whereClause} AND cost IS NOT NULL
      GROUP BY DATE(created_at)
      ORDER BY date ASC`,
      params
    );
    
    // 6. Qualification score trends
    const qualificationScoreResult = await query(
      `SELECT 
        DATE(created_at) as date,
        AVG(qualification_score) as avg_score,
        MIN(qualification_score) as min_score,
        MAX(qualification_score) as max_score
      FROM calls c
      WHERE ${whereClause} AND qualification_score IS NOT NULL
      GROUP BY DATE(created_at)
      ORDER BY date ASC`,
      params
    );
    
    // 7. Top prospects by call volume
    const topProspectsResult = await query(
      `SELECT 
        p.id,
        p.business_name,
        p.contact_name,
        COUNT(c.id) as call_count,
        AVG(c.qualification_score) as avg_qualification_score,
        MAX(c.temperature) as max_temperature
      FROM calls c
      JOIN prospects p ON c.prospect_id = p.id
      WHERE ${whereClause}
      GROUP BY p.id, p.business_name, p.contact_name
      ORDER BY call_count DESC
      LIMIT 10`,
      params
    );
    
    // 8. Hourly call distribution
    const hourlyDistributionResult = await query(
      `SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count,
        AVG(duration) as avg_duration
      FROM calls c
      WHERE ${whereClause}
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour ASC`,
      params
    );
    
    // 9. Call status distribution
    const statusDistributionResult = await query(
      `SELECT 
        vapi_status,
        COUNT(*) as count
      FROM calls c
      WHERE ${whereClause}
      GROUP BY vapi_status`,
      params
    );
    
    // 10. Summary statistics
    const summaryStatsResult = await query(
      `SELECT 
        COUNT(*) as total_calls,
        COUNT(DISTINCT prospect_id) as unique_prospects,
        COUNT(CASE WHEN outcome = 'qualified' THEN 1 END) as qualified_leads,
        COUNT(CASE WHEN temperature = 'hot' THEN 1 END) as hot_leads,
        AVG(duration) as avg_duration,
        SUM(cost) as total_cost,
        AVG(qualification_score) as avg_qualification_score,
        COUNT(CASE WHEN vapi_status = 'ended' THEN 1 END)::float / 
          NULLIF(COUNT(*), 0) * 100 as completion_rate
      FROM calls c
      WHERE ${whereClause}`,
      params
    );
    
    const summaryStats = summaryStatsResult.rows[0];
    
    return NextResponse.json({
      period: periodDays,
      dateRange: {
        from: dateFrom.toISOString(),
        to: new Date().toISOString()
      },
      summary: {
        totalCalls: parseInt(summaryStats.total_calls || 0),
        uniqueProspects: parseInt(summaryStats.unique_prospects || 0),
        qualifiedLeads: parseInt(summaryStats.qualified_leads || 0),
        hotLeads: parseInt(summaryStats.hot_leads || 0),
        avgDuration: parseFloat(summaryStats.avg_duration || 0),
        totalCost: parseFloat(summaryStats.total_cost || 0),
        avgQualificationScore: parseFloat(summaryStats.avg_qualification_score || 0),
        completionRate: parseFloat(summaryStats.completion_rate || 0)
      },
      charts: {
        callVolume: callVolumeResult.rows,
        outcomeDistribution: outcomeDistributionResult.rows,
        temperatureDistribution: temperatureDistributionResult.rows,
        durationStats: durationStatsResult.rows,
        costAnalysis: costAnalysisResult.rows,
        qualificationScoreTrends: qualificationScoreResult.rows,
        topProspects: topProspectsResult.rows,
        hourlyDistribution: hourlyDistributionResult.rows,
        statusDistribution: statusDistributionResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}