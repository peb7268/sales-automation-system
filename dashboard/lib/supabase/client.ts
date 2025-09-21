import { createClient } from '@supabase/supabase-js'
import { Database } from './types'
import { Pool } from 'pg'

// Since we're using PostgreSQL directly without Supabase services,
// we'll create a hybrid approach using pg for queries and keeping the Supabase types

// PostgreSQL connection
const pgPool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'sales_dashboard',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
})

// For compatibility, we'll keep the supabase client but point it to PostgREST if available
// Otherwise, we'll use direct PostgreSQL queries
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key-for-local-dev'

// Create a dummy client for type safety (won't be used for actual queries)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Export the pg pool for direct queries
export { pgPool }

// Helper functions for common operations using direct PostgreSQL
export const supabaseHelpers = {
  // Prospects
  async getProspects() {
    try {
      const result = await pgPool.query(
        'SELECT * FROM prospects ORDER BY created_at DESC'
      )
      return result.rows
    } catch (error) {
      console.error('Error fetching prospects:', error)
      throw error
    }
  },

  async createProspect(prospect: any) {
    try {
      const columns = Object.keys(prospect).join(', ')
      const values = Object.values(prospect)
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ')

      const result = await pgPool.query(
        `INSERT INTO prospects (${columns}) VALUES (${placeholders}) RETURNING *`,
        values
      )
      return result.rows[0]
    } catch (error) {
      console.error('Error creating prospect:', error)
      throw error
    }
  },

  async updateProspect(id: string, updates: any) {
    try {
      const entries = Object.entries(updates)
      const setClause = entries.map(([key], i) => `${key} = $${i + 2}`).join(', ')
      const values = [id, ...entries.map(([_, value]) => value)]

      const result = await pgPool.query(
        `UPDATE prospects SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
        values
      )
      return result.rows[0]
    } catch (error) {
      console.error('Error updating prospect:', error)
      throw error
    }
  },

  async deleteProspect(id: string) {
    try {
      const result = await pgPool.query(
        'DELETE FROM prospects WHERE id = $1 RETURNING *',
        [id]
      )

      if (result.rowCount === 0) {
        throw new Error('Prospect not found')
      }

      return result.rows[0]
    } catch (error) {
      console.error('Error deleting prospect:', error)
      throw error
    }
  },

  // Campaigns
  async getCampaigns() {
    try {
      const result = await pgPool.query(
        'SELECT * FROM campaigns ORDER BY created_at DESC'
      )
      return result.rows
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      throw error
    }
  },

  async createCampaign(campaign: any) {
    try {
      const columns = Object.keys(campaign).join(', ')
      const values = Object.values(campaign)
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ')

      const result = await pgPool.query(
        `INSERT INTO campaigns (${columns}) VALUES (${placeholders}) RETURNING *`,
        values
      )
      return result.rows[0]
    } catch (error) {
      console.error('Error creating campaign:', error)
      throw error
    }
  },

  // Calls
  async getCalls() {
    try {
      const result = await pgPool.query(`
        SELECT
          c.*,
          p.business_name,
          p.contact_name,
          cam.name as campaign_name
        FROM calls c
        LEFT JOIN prospects p ON c.prospect_id = p.id
        LEFT JOIN campaigns cam ON c.campaign_id = cam.id
        ORDER BY c.created_at DESC
      `)
      return result.rows
    } catch (error) {
      console.error('Error fetching calls:', error)
      throw error
    }
  },

  async createCall(call: any) {
    try {
      const columns = Object.keys(call).join(', ')
      const values = Object.values(call)
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ')

      const result = await pgPool.query(
        `INSERT INTO calls (${columns}) VALUES (${placeholders}) RETURNING *`,
        values
      )
      return result.rows[0]
    } catch (error) {
      console.error('Error creating call:', error)
      throw error
    }
  },

  // Analytics Events
  async trackEvent(type: string, payload: any) {
    try {
      await pgPool.query(
        'INSERT INTO analytics_events (type, payload, timestamp) VALUES ($1, $2, $3)',
        [type, JSON.stringify(payload), new Date().toISOString()]
      )
    } catch (error) {
      console.error('Error tracking event:', error)
      throw error
    }
  },

  // Real-time subscriptions (will use WebSocket when implemented)
  subscribeToProspects(callback: (payload: any) => void) {
    // TODO: Implement WebSocket subscription
    console.log('WebSocket subscription for prospects not yet implemented')
    return {
      unsubscribe: () => {
        console.log('Unsubscribing from prospects')
      }
    }
  },

  subscribeToCalls(callback: (payload: any) => void) {
    // TODO: Implement WebSocket subscription
    console.log('WebSocket subscription for calls not yet implemented')
    return {
      unsubscribe: () => {
        console.log('Unsubscribing from calls')
      }
    }
  },

  subscribeToEvents(callback: (payload: any) => void) {
    // TODO: Implement WebSocket subscription
    console.log('WebSocket subscription for events not yet implemented')
    return {
      unsubscribe: () => {
        console.log('Unsubscribing from events')
      }
    }
  }
}

export default supabase