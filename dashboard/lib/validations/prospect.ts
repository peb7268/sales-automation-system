import { z } from "zod"

// Basic validation schemas
// Updated regex to accept common US phone formats with parentheses, spaces, and dashes
export const phoneRegex = /^[\+]?[1-9]?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const urlRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*)$/

// Industry options
export const industries = [
  'restaurants',
  'retail',
  'professional_services',
  'healthcare',
  'real_estate',
  'automotive',
  'home_services',
  'fitness',
  'beauty_salons',
  'legal_services',
  'technology',
  'consulting',
  'manufacturing',
  'health',
  'other'
] as const

// Pipeline stage options
export const pipelineStages = [
  'cold',
  'contacted',
  'interested',
  'qualified',
  'closed_won',
  'closed_lost',
  'frozen'
] as const

// Temperature options
export const temperatures = ['cold', 'warm', 'hot'] as const

// Core prospect validation schema
export const prospectSchema = z.object({
  // Required basic information
  business_name: z.string()
    .min(1, "Business name is required")
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must be less than 100 characters"),

  industry: z.enum(industries, {
    errorMap: () => ({ message: "Please select a valid industry" })
  }),

  location: z.string()
    .min(1, "Location is required")
    .regex(/^.+,\s*.+$/, "Location must be in format 'City, State'"),

  // Optional contact information
  contact_name: z.string()
    .max(100, "Contact name must be less than 100 characters")
    .optional()
    .or(z.literal("")),

  contact_email: z.string()
    .email("Please enter a valid email address")
    .max(100, "Email must be less than 100 characters")
    .optional()
    .or(z.literal("")),

  contact_phone: z.string()
    .regex(phoneRegex, "Please enter a valid phone number")
    .max(20, "Phone number must be less than 20 characters")
    .optional()
    .or(z.literal("")),

  website: z.string()
    .url("Please enter a valid website URL")
    .max(200, "Website URL must be less than 200 characters")
    .optional()
    .or(z.literal("")),

  // Pipeline information
  temperature: z.enum(temperatures).default('cold'),

  pipeline_stage: z.enum(pipelineStages).default('cold'),

  score: z.number()
    .min(0, "Score must be between 0 and 100")
    .max(100, "Score must be between 0 and 100")
    .default(0),

  // Optional fields
  notes: z.string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
})

// Quick add prospect schema (minimal required fields)
export const quickAddProspectSchema = z.object({
  business_name: z.string()
    .min(1, "Business name is required")
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must be less than 100 characters"),

  industry: z.enum(industries, {
    errorMap: () => ({ message: "Please select a valid industry" })
  }),

  location: z.string()
    .min(1, "Location is required")
    .regex(/^.+,\s*.+$/, "Location must be in format 'City, State'"),

  contact_phone: z.string()
    .regex(phoneRegex, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
})

// Update prospect schema (all fields optional except id)
export const updateProspectSchema = prospectSchema.partial()

// Type exports
export type ProspectFormData = z.infer<typeof prospectSchema>
export type QuickAddProspectData = z.infer<typeof quickAddProspectSchema>
export type UpdateProspectData = z.infer<typeof updateProspectSchema>

// Helper functions for validation
export const validateEmail = (email: string): boolean => {
  return emailRegex.test(email)
}

export const validatePhone = (phone: string): boolean => {
  return phoneRegex.test(phone)
}

export const validateUrl = (url: string): boolean => {
  return urlRegex.test(url)
}

export const formatLocation = (location: string): { city: string; state: string } => {
  const [city, state] = location.split(',').map(s => s.trim())
  return { city: city || '', state: state || '' }
}

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')

  // Format as (XXX) XXX-XXXX for US numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  // Return as-is for international numbers
  return phone
}

// Default form values
export const defaultProspectValues: Partial<ProspectFormData> = {
  business_name: "",
  industry: "other",
  location: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  website: "",
  temperature: "cold",
  pipeline_stage: "cold",
  score: 0,
  notes: "",
}