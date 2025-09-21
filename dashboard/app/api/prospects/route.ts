import { NextRequest, NextResponse } from 'next/server'
import { supabaseHelpers } from '@/lib/supabase/client'
import { NewProspect, UpdateProspect } from '@/lib/supabase/types'

// GET /api/prospects - Get all prospects
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const stage = searchParams.get('stage')
    const industry = searchParams.get('industry')
    
    const prospects = await supabaseHelpers.getProspects()
    
    // Filter if parameters provided
    let filtered = prospects
    if (stage) {
      filtered = filtered.filter(p => p.pipeline_stage === stage)
    }
    if (industry) {
      filtered = filtered.filter(p => p.industry === industry)
    }
    
    return NextResponse.json({ 
      success: true, 
      data: filtered,
      count: filtered.length 
    })
  } catch (error) {
    console.error('Error fetching prospects:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prospects' },
      { status: 500 }
    )
  }
}

// POST /api/prospects - Create a new prospect
export async function POST(request: NextRequest) {
  try {
    const body: NewProspect = await request.json()
    
    // Validate required fields
    if (!body.business_name || !body.industry || !body.location) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const prospect = await supabaseHelpers.createProspect(body)
    
    // Track analytics event
    await supabaseHelpers.trackEvent('prospect.created', {
      prospect_id: prospect.id,
      industry: prospect.industry,
      location: prospect.location
    })
    
    return NextResponse.json({ 
      success: true, 
      data: prospect 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating prospect:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create prospect' },
      { status: 500 }
    )
  }
}

// PUT /api/prospects - Update a prospect
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Prospect ID required' },
        { status: 400 }
      )
    }
    
    const body: UpdateProspect = await request.json()
    const prospect = await supabaseHelpers.updateProspect(id, body)
    
    // Track analytics event for stage changes
    if (body.pipeline_stage) {
      await supabaseHelpers.trackEvent('prospect.stage_changed', {
        prospect_id: id,
        new_stage: body.pipeline_stage,
        timestamp: new Date().toISOString()
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      data: prospect 
    })
  } catch (error) {
    console.error('Error updating prospect:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update prospect' },
      { status: 500 }
    )
  }
}

// DELETE /api/prospects - Delete a prospect
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Prospect ID required' },
        { status: 400 }
      )
    }

    const deletedProspect = await supabaseHelpers.deleteProspect(id)

    // Track analytics event
    await supabaseHelpers.trackEvent('prospect.deleted', {
      prospect_id: id,
      deleted_at: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      data: deletedProspect
    })
  } catch (error) {
    console.error('Error deleting prospect:', error)

    if (error instanceof Error && error.message === 'Prospect not found') {
      return NextResponse.json(
        { success: false, error: 'Prospect not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete prospect' },
      { status: 500 }
    )
  }
}