import { z } from "zod"
import { industries, pipelineStages, temperatures } from "./prospect"

// CSV field mapping - maps various column names to our database fields
export const csvFieldMappings: Record<string, string> = {
  // Business name variations
  'business name': 'business_name',
  'business': 'business_name',
  'company name': 'business_name',
  'company': 'business_name',
  'name': 'business_name',
  'business_name': 'business_name',

  // Industry variations
  'industry': 'industry',
  'type': 'industry',
  'business type': 'industry',
  'category': 'industry',

  // Location variations
  'location': 'location',
  'address': 'location',
  'city state': 'location',
  'city, state': 'location',

  // Contact name variations
  'contact name': 'contact_name',
  'contact': 'contact_name',
  'contact person': 'contact_name',
  'primary contact': 'contact_name',
  'contact_name': 'contact_name',

  // Email variations
  'email': 'contact_email',
  'contact email': 'contact_email',
  'email address': 'contact_email',
  'contact_email': 'contact_email',

  // Phone variations
  'phone': 'contact_phone',
  'contact phone': 'contact_phone',
  'phone number': 'contact_phone',
  'telephone': 'contact_phone',
  'contact_phone': 'contact_phone',

  // Website variations
  'website': 'website',
  'url': 'website',
  'web': 'website',
  'site': 'website',
  'website url': 'website',

  // Temperature variations
  'temperature': 'temperature',
  'temp': 'temperature',
  'lead temperature': 'temperature',

  // Pipeline stage variations
  'stage': 'pipeline_stage',
  'pipeline stage': 'pipeline_stage',
  'status': 'pipeline_stage',
  'pipeline_stage': 'pipeline_stage',

  // Score variations
  'score': 'score',
  'lead score': 'score',
  'rating': 'score',
  'qualification score': 'score',

  // Notes variations
  'notes': 'notes',
  'comments': 'notes',
  'description': 'notes',
  'memo': 'notes',
}

// Normalize column names for mapping
export function normalizeColumnName(name: string): string {
  return name.toLowerCase().trim().replace(/[_-]/g, ' ')
}

// Map CSV headers to database fields
export function mapCsvHeaders(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {}

  headers.forEach(header => {
    const normalized = normalizeColumnName(header)
    const dbField = csvFieldMappings[normalized]
    if (dbField) {
      mapping[header] = dbField
    }
  })

  return mapping
}

// CSV row validation schema - more lenient than the main prospect schema
export const csvProspectRowSchema = z.object({
  business_name: z.string()
    .transform(val => val.trim())
    .refine(val => val.length > 0, "Business name is required"),

  industry: z.string()
    .transform(val => val.toLowerCase().trim().replace(/ /g, '_'))
    .transform(val => {
      // Try to match to known industries
      if (industries.includes(val as any)) {
        return val
      }
      // Default to 'other' for unknown industries
      return 'other'
    }),

  location: z.string()
    .transform(val => val.trim())
    .refine(val => val.includes(','), "Location must include city and state separated by comma"),

  contact_name: z.string()
    .transform(val => val.trim())
    .optional()
    .nullable()
    .default(''),

  contact_email: z.string()
    .transform(val => val.trim().toLowerCase())
    .refine(val => !val || val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), "Invalid email format")
    .optional()
    .nullable()
    .default(''),

  contact_phone: z.string()
    .transform(val => val.trim().replace(/[\s\-\(\)\.]/g, ''))
    .refine(val => !val || val === '' || /^\+?[\d]{10,15}$/.test(val), "Invalid phone number")
    .optional()
    .nullable()
    .default(''),

  website: z.string()
    .transform(val => {
      val = val.trim()
      // Add https:// if no protocol specified
      if (val && !val.match(/^https?:\/\//)) {
        val = 'https://' + val
      }
      return val
    })
    .refine(val => !val || val === '' || /^https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=]+$/.test(val), "Invalid website URL")
    .optional()
    .nullable()
    .default(''),

  temperature: z.string()
    .transform(val => val.toLowerCase().trim())
    .transform(val => {
      if (temperatures.includes(val as any)) {
        return val
      }
      return 'cold' // Default temperature
    })
    .optional()
    .nullable()
    .default('cold'),

  pipeline_stage: z.string()
    .transform(val => val.toLowerCase().trim().replace(/ /g, '_'))
    .transform(val => {
      if (pipelineStages.includes(val as any)) {
        return val
      }
      return 'cold' // Default stage
    })
    .optional()
    .nullable()
    .default('cold'),

  score: z.union([
    z.string().transform(val => {
      const num = parseFloat(val)
      return isNaN(num) ? 0 : Math.min(100, Math.max(0, num))
    }),
    z.number()
  ])
    .optional()
    .nullable()
    .default(0),

  notes: z.string()
    .transform(val => val.trim())
    .optional()
    .nullable()
    .default(''),
})

export type CsvProspectRow = z.infer<typeof csvProspectRowSchema>

// Batch validation result
export interface CsvValidationResult {
  valid: CsvProspectRow[]
  invalid: Array<{
    row: number
    data: Record<string, any>
    errors: string[]
  }>
  duplicates: Array<{
    row: number
    data: Record<string, any>
    existingBusinessName: string
  }>
}

// Validate a batch of CSV rows
export function validateCsvBatch(
  rows: Record<string, any>[],
  existingBusinessNames: Set<string> = new Set()
): CsvValidationResult {
  const result: CsvValidationResult = {
    valid: [],
    invalid: [],
    duplicates: []
  }

  const seenBusinessNames = new Set<string>()

  rows.forEach((row, index) => {
    try {
      const validated = csvProspectRowSchema.parse(row)

      // Check for duplicates
      const businessNameLower = validated.business_name.toLowerCase()

      if (existingBusinessNames.has(businessNameLower)) {
        result.duplicates.push({
          row: index + 2, // Add 2 for header row and 1-based indexing
          data: row,
          existingBusinessName: validated.business_name
        })
      } else if (seenBusinessNames.has(businessNameLower)) {
        // Duplicate within the CSV itself
        result.duplicates.push({
          row: index + 2,
          data: row,
          existingBusinessName: validated.business_name
        })
      } else {
        result.valid.push(validated)
        seenBusinessNames.add(businessNameLower)
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        result.invalid.push({
          row: index + 2,
          data: row,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        })
      } else {
        result.invalid.push({
          row: index + 2,
          data: row,
          errors: ['Unknown validation error']
        })
      }
    }
  })

  return result
}

// Generate CSV template
export function generateCsvTemplate(): string {
  const headers = [
    'Business Name',
    'Industry',
    'Location',
    'Contact Name',
    'Email',
    'Phone',
    'Website',
    'Temperature',
    'Stage',
    'Score',
    'Notes'
  ]

  const sampleRows = [
    [
      'ABC Restaurant',
      'restaurants',
      'Denver, CO',
      'John Smith',
      'john@abcrestaurant.com',
      '303-555-1234',
      'https://abcrestaurant.com',
      'warm',
      'contacted',
      '75',
      'Interested in marketing services'
    ],
    [
      'XYZ Retail Store',
      'retail',
      'Boulder, CO',
      'Jane Doe',
      'jane@xyzretail.com',
      '720-555-5678',
      'xyzretail.com',
      'cold',
      'cold',
      '50',
      'New prospect from trade show'
    ],
    [
      'Professional Services Inc',
      'professional_services',
      'Aurora, CO',
      '',
      '',
      '303-555-9999',
      '',
      'hot',
      'qualified',
      '90',
      'Ready to close deal'
    ]
  ]

  const csvContent = [
    headers.join(','),
    ...sampleRows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return csvContent
}

// Export helper to convert validated rows to database format
export function csvRowToDbFormat(row: CsvProspectRow) {
  const [city, state] = row.location.split(',').map(s => s.trim())

  return {
    business_name: row.business_name,
    industry: row.industry,
    location: row.location,
    contact_name: row.contact_name || null,
    contact_email: row.contact_email || null,
    contact_phone: row.contact_phone || null,
    website: row.website || null,
    temperature: row.temperature as 'cold' | 'warm' | 'hot',
    pipeline_stage: row.pipeline_stage as any,
    score: row.score as number,
    notes: row.notes || null,
    // Additional fields for database
    research_data: null,
  }
}