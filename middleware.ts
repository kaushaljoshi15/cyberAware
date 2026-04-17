import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware exclusively applies to all /cyber pages
export function middleware(request: NextRequest) {
  // Check if we have the auth cookie
  const userEmail = request.cookies.get('userEmail');

  // If the user tries to access /cyber but isn't logged in
  if (!userEmail) {
    // Redirect securely to the newly branded CyberAware login page
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow the request to proceed if valid
  return NextResponse.next();
}

// Ensure the middleware only runs for paths under /cyber
export const config = {
  matcher: ['/cyber/:path*'],
};
