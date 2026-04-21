import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Validate input
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    // 2. Find user in database
    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 2.5 Check if user signed up with Google (no password)
    if (!user.password_hash) {
      return NextResponse.json({ error: 'Please sign in with Google' }, { status: 401 });
    }

    // 2.6 Check verification status
    if (!user.is_verified) {
      return NextResponse.json({ 
        error: 'Email not verified. Please check your email.',
        requiresVerification: true 
      }, { status: 403 });
    }

    // 3. Check Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 4. Generate JWT Token (The "Session")
    const token = jwt.sign(
      { userId: user.id, role: user.role }, // Data inside the token
      process.env.JWT_SECRET!,              // Your Secret Key
      { expiresIn: '1d' }                   // Token lasts for 1 day
    );

    // 5. Send success response with token
    const response = NextResponse.json(
      { 
        message: 'Login successful', 
        token, 
        user: { id: user.id, name: user.name, role: user.role } 
      },
      { status: 200 }
    );
    response.cookies.set('userEmail', email, { path: '/', maxAge: 60 * 60 * 24 });
    return response;

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}