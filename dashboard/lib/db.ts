import { Pool } from 'pg';

// Create a PostgreSQL connection pool
// When running in Docker, DATABASE_URL will use 'postgres' as host
// When running locally, it will use 'localhost'
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/sales_dashboard',
  ssl: false
});

// Helper function to query the database
export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}