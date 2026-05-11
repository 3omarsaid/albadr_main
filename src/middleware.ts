import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect all /admin/* routes except the login page itself
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminSessionCookie = request.cookies.get('admin_session'); 
    
    
    if (!adminSessionCookie || !adminSessionCookie.value ) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already authenticated, redirect away from login page
  if (pathname === '/admin/login') {
    const adminSessionCookie = request.cookies.get('admin_session');
    
    if (adminSessionCookie && adminSessionCookie.value) {
      const adminUrl = request.nextUrl.clone();
      adminUrl.pathname = '/admin';
      return NextResponse.redirect(adminUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT static files, images, and Next.js internals.
     * We only need to run auth logic on app routes.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
