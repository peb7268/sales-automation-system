#!/usr/bin/env node

const { Pool } = require('pg');

// Database connection configuration
const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'sales_dashboard',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
});

async function testConnection() {
  console.log('Testing PostgreSQL connection...');
  console.log('Configuration:');
  console.log(`  Host: ${pool.options.host}`);
  console.log(`  Port: ${pool.options.port}`);
  console.log(`  Database: ${pool.options.database}`);
  console.log(`  User: ${pool.options.user}`);
  console.log('');

  try {
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL!');

    // Get database version
    const versionResult = await client.query('SELECT version()');
    console.log('Database version:', versionResult.rows[0].version);
    console.log('');

    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    if (tablesResult.rows.length > 0) {
      console.log('Existing tables:');
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.tablename}`);
      });
    } else {
      console.log('No tables found. You may need to run migrations.');
    }
    console.log('');

    // Check for specific tables we expect
    const expectedTables = ['prospects', 'campaigns', 'calls', 'analytics_events'];
    const missingTables = [];

    for (const table of expectedTables) {
      const checkResult = await client.query(
        'SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = $1)',
        [table]
      );
      if (!checkResult.rows[0].exists) {
        missingTables.push(table);
      }
    }

    if (missingTables.length > 0) {
      console.log('⚠️  Missing expected tables:', missingTables.join(', '));
      console.log('Run migrations to create these tables.');
    } else {
      console.log('✅ All expected tables exist!');

      // Count records in each table
      for (const table of expectedTables) {
        const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`  ${table}: ${countResult.rows[0].count} records`);
      }
    }

    client.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL:');
    console.error(error.message);
    console.error('');
    console.error('Make sure:');
    console.error('1. Docker is running');
    console.error('2. PostgreSQL container is started');
    console.error('3. Run: cd docker && docker compose up -d');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();