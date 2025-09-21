import { NextRequest, NextResponse } from 'next/server'
import { supabaseHelpers } from '@/lib/supabase/client'
import { NewCampaign, UpdateCampaign } from '@/lib/supabase/types'

// GET /api/campaigns - Get all campaigns
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    
    const campaigns = await supabaseHelpers.getCampaigns()
    
    // Filter by status if provided
    let filtered = campaigns
    if (status) {
      filtered = filtered.filter(c => c.status === status)
    }
    
    return NextResponse.json({ 
      success: true, 
      data: filtered,
      count: filtered.length 
    })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const body: NewCampaign = await request.json()
    
    // Validate required fields
    if (!body.name || !body.type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const campaign = await supabaseHelpers.createCampaign(body)
    
    // Track analytics event
    await supabaseHelpers.trackEvent('campaign.created', {
      campaign_id: campaign.id,
      type: campaign.type,
      status: campaign.status
    })
    
    return NextResponse.json({ 
      success: true, 
      data: campaign 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}