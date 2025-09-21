import { NextRequest, NextResponse } from 'next/server'
import { supabaseHelpers } from '@/lib/supabase/client'
import { NewCall } from '@/lib/supabase/types'

// GET /api/calls - Get all calls
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const prospectId = searchParams.get('prospect_id')
    const campaignId = searchParams.get('campaign_id')
    const outcome = searchParams.get('outcome')
    
    const calls = await supabaseHelpers.getCalls()
    
    // Apply filters
    let filtered = calls
    if (prospectId) {
      filtered = filtered.filter(c => c.prospect_id === prospectId)
    }
    if (campaignId) {
      filtered = filtered.filter(c => c.campaign_id === campaignId)
    }
    if (outcome) {
      filtered = filtered.filter(c => c.outcome === outcome)
    }
    
    return NextResponse.json({ 
      success: true, 
      data: filtered,
      count: filtered.length 
    })
  } catch (error) {
    console.error('Error fetching calls:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calls' },
      { status: 500 }
    )
  }
}

// POST /api/calls - Create a new call record
export async function POST(request: NextRequest) {
  try {
    const body: NewCall = await request.json()
    
    // Validate required fields
    if (!body.prospect_id || !body.outcome) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const call = await supabaseHelpers.createCall(body)
    
    // Track analytics event
    await supabaseHelpers.trackEvent('call.completed', {
      call_id: call.id,
      prospect_id: call.prospect_id,
      outcome: call.outcome,
      duration: call.duration
    })
    
    // If call was successful, update prospect stage
    if (call.outcome === 'interested' || call.outcome === 'qualified') {
      const newStage = call.outcome === 'qualified' ? 'qualified' : 'interested'
      await supabaseHelpers.updateProspect(call.prospect_id, {
        pipeline_stage: newStage,
        temperature: call.outcome === 'qualified' ? 'hot' : 'warm'
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      data: call 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating call:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create call' },
      { status: 500 }
    )
  }
}