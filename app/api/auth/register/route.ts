import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// Define the Master Admin Email here
const SUPER_ADMIN_EMAIL = 'joshikaushald1596@gmail.com'; // Change this to your actual email

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    // 1. Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // for the password manage
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: 'Password does not meet security requirements.' },
        { status: 400 }
      );
    }

    // 2. Role Security Check (Super Admin Logic)
    let assignedRole = role;

    if (email === SUPER_ADMIN_EMAIL) {
      // Force admin role for the system owner
      assignedRole = 'admin';
    } else if (role === 'admin') {
      // Block anyone else trying to register as an admin
      return NextResponse.json(
        { error: 'Unauthorized: Only the system owner can hold this role.' },
        { status: 403 }
      );
    }

    // 3. Check if user already exists
    const user = await prisma.users.findUnique({ where: { email } });
    
    if (user) {
      
      let errorMessage = 'This email is already registered. Please go to the Login page.';
      
      // Give a helpful hint if they previously signed up with Google
      if (user.google_id && !user.password_hash) {
        errorMessage = 'This email was registered using Google. Please click "Continue with Google" on the Login page.';
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 409 }
      );
    }

    // 4. Hash the password (Security)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Insert into Database using the safe 'assignedRole'
    // Ensure they are inserted as unverified
    const createdUser = await prisma.users.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
        role: assignedRole,
        is_verified: false,
      }
    });

    // 6. Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // 7. Save OTP to verification_codes table
    await prisma.verification_codes.deleteMany({ where: { email } });
    await prisma.verification_codes.create({
      data: {
        email,
        code: otpCode,
        expires_at: expiresAt
      }
    });

    // 8. Send the OTP via Email
    const { sendOTP } = await import('@/lib/email');
    await sendOTP(email, otpCode);

    return NextResponse.json(
      { message: 'Registration initiated. Please verify your email.', user: createdUser, requiresVerification: true },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}