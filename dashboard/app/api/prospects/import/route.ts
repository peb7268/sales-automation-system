import { NextRequest, NextResponse } from 'next/server'
import { supabaseHelpers } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'crypto'

interface ImportProspect {
  business_name: string
  industry: string
  location: string
  contact_name?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  website?: string | null
  temperature?: 'cold' | 'warm' | 'hot'
  pipeline_stage?: 'cold' | 'contacted' | 'interested' | 'qualified'
  score?: number
  notes?: string | null
  research_data?: any | null
}

interface ImportResult {
  imported: number
  failed: number
  errors: string[]
  prospects: any[]
}

// POST /api/prospects/import - Bulk import prospects
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    if (!body.prospects || !Array.isArray(body.prospects)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: prospects array is required' },
        { status: 400 }
      )
    }

    const prospects: ImportProspect[] = body.prospects
    const batchSize = 100 // Process in batches to avoid overwhelming the database

    const result: ImportResult = {
      imported: 0,
      failed: 0,
      errors: [],
      prospects: []
    }

    // Process prospects in batches
    for (let i = 0; i < prospects.length; i += batchSize) {
      const batch = prospects.slice(i, i + batchSize)

      try {
        // Create prospects in batch
        const importedBatch = await Promise.all(
          batch.map(async (prospect) => {
            try {
              // Generate a unique ID for each prospect
              const id = uuidv4()

              // Create the prospect record
              const newProspect = await supabaseHelpers.createProspect({
                ...prospect,
                id,
              })

              result.imported++
              return newProspect
            } catch (error) {
              result.failed++
              const errorMessage = error instanceof Error ? error.message : 'Unknown error'
              result.errors.push(`Failed to import ${prospect.business_name}: ${errorMessage}`)
              return null
            }
          })
        )

        // Filter out failed imports and add to results
        const successfulImports = importedBatch.filter(p => p !== null)
        result.prospects.push(...successfulImports)

        // Track analytics for successful imports
        for (const prospect of successfulImports) {
          if (prospect) {
            await supabaseHelpers.trackEvent('prospect.bulk_imported', {
              prospect_id: prospect.id,
              industry: prospect.industry,
              location: prospect.location,
              import_batch: i / batchSize + 1,
              total_batch_size: batch.length
            })
          }
        }

      } catch (batchError) {
        // If entire batch fails, record error for all prospects in batch
        result.failed += batch.length
        const errorMessage = batchError instanceof Error ? batchError.message : 'Unknown batch error'
        result.errors.push(`Batch ${i / batchSize + 1} failed: ${errorMessage}`)
      }
    }

    // Log import summary
    await supabaseHelpers.trackEvent('bulk_import.completed', {
      total_attempted: prospects.length,
      total_imported: result.imported,
      total_failed: result.failed,
      timestamp: new Date().toISOString()
    })

    // Return results
    return NextResponse.json({
      success: true,
      data: {
        imported: result.imported,
        failed: result.failed,
        errors: result.errors,
        prospects: result.prospects
      },
      message: `Successfully imported ${result.imported} prospects${result.failed > 0 ? `, ${result.failed} failed` : ''}`
    })

  } catch (error) {
    console.error('Error in bulk import:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process bulk import',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET /api/prospects/import/template - Download CSV template
export async function GET(request: NextRequest) {
  try {
    const csvContent = [
      // Headers
      'Business Name,Industry,Location,Contact Name,Email,Phone,Website,Temperature,Stage,Score,Notes',
      // Sample rows
      '"ABC Restaurant","restaurants","Denver, CO","John Smith","john@abcrestaurant.com","303-555-1234","https://abcrestaurant.com","warm","contacted","75","Interested in marketing services"',
      '"XYZ Retail Store","retail","Boulder, CO","Jane Doe","jane@xyzretail.com","720-555-5678","xyzretail.com","cold","cold","50","New prospect from trade show"',
      '"Professional Services Inc","professional_services","Aurora, CO","","","303-555-9999","","hot","qualified","90","Ready to close deal"'
    ].join('\n')

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="prospect_import_template.csv"'
      }
    })
  } catch (error) {
    console.error('Error generating template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate template' },
      { status: 500 }
    )
  }
}