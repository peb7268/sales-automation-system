import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingResult = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const insertResult = await query(
      `INSERT INTO users (email, password_hash, name, provider) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, name`,
      [email, hashedPassword, name, 'credentials']
    );

    const data = insertResult.rows[0];

    if (!data) {
      console.error('Error creating user');
      return NextResponse.json(
        { message: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Return success (without password)
    return NextResponse.json({
      user: {
        id: data.id,
        email: data.email,
        name: data.name
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}