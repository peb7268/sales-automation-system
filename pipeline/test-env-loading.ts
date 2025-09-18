#!/usr/bin/env tsx
/**
 * Test environment variable loading
 */

import dotenv from 'dotenv';
import path from 'path';

console.log('Before dotenv config:');
console.log('GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? 'SET' : 'NOT SET');
console.log('FIRECRAWL_API_KEY:', process.env.FIRECRAWL_API_KEY ? 'SET' : 'NOT SET');
console.log('PERPLEXITY_API_KEY:', process.env.PERPLEXITY_API_KEY ? 'SET' : 'NOT SET');

// Load .env from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('\nAfter dotenv config:');
console.log('GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? 'SET' : 'NOT SET');
console.log('FIRECRAWL_API_KEY:', process.env.FIRECRAWL_API_KEY ? 'SET' : 'NOT SET');
console.log('PERPLEXITY_API_KEY:', process.env.PERPLEXITY_API_KEY ? 'SET' : 'NOT SET');

console.log('\nValues:');
console.log('GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY?.substring(0, 10) + '...');
console.log('FIRECRAWL_API_KEY:', process.env.FIRECRAWL_API_KEY?.substring(0, 10) + '...');
console.log('PERPLEXITY_API_KEY:', process.env.PERPLEXITY_API_KEY?.substring(0, 10) + '...');