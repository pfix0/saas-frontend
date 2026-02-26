/**
 * ساس — Middleware حماية الصفحات
 * 
 * يتحقق من وجود التوكن في الكوكيز:
 * - /dashboard/* → يعيد توجيه لـ /login إذا ما في توكن
 * - /admin/* → يعيد توجيه لـ /admin/login إذا ما في توكن أدمن
 * - /login, /register → يعيد توجيه لـ /dashboard إذا عنده توكن
 * 
 * ملاحظة: التحقق الفعلي من صلاحية التوكن يتم في Railway backend
 */

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ═══ Admin Routes ═══
  if (pathname.startsWith('/admin')) {
    const adminToken = request.cookies.get('saas_admin_token')?.value;
    const hasAdminToken = !!adminToken && adminToken.length > 10;

    // Login page — redirect if already authenticated
    if (pathname === '/admin/login') {
      if (hasAdminToken) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // Protected admin pages
    if (!hasAdminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
  }

  // ═══ Merchant Dashboard ═══
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('saas_access_token')?.value;
    const hasToken = !!token && token.length > 10;

    if (!hasToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // ═══ Auth Pages — redirect if already logged in ═══
  if (pathname === '/login' || pathname === '/register') {
    const token = request.cookies.get('saas_access_token')?.value;
    if (token && token.length > 10) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};
