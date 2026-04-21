import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and OTP code are required' }, { status: 400 });
    }

    // 1. Find the code in the DB
    const verificationRecord = await prisma.verification_codes.findFirst({
      where: { email, code },
      orderBy: { expires_at: 'desc' }
    });

    if (!verificationRecord) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
    }

    // 2. Check if expired
    if (new Date() > new Date(verificationRecord.expires_at)) {
      return NextResponse.json({ error: 'Verification code has expired' }, { status: 400 });
    }

    // 3. Mark user as verified
    const user = await prisma.users.update({
      where: { email },
      data: { is_verified: true }
    });

    // 4. Delete the code to prevent reuse
    await prisma.verification_codes.deleteMany({ where: { email } });

    // 5. Generate JWT token to immediately log them in
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    return NextResponse.json(
      { message: 'Email verified successfully', token, user },
      { status: 200 }
    );

  } catch (error) {
    console.error('OTP Verification Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
