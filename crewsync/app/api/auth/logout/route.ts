import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  
  // Clear the authentication cookie
  response.cookies.set('userEmail', '', {
    path: '/',
    expires: new Date(0), // Expire instantly
  });

  return response;
}
