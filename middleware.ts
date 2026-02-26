/**
 * ساس — Middleware حماية الصفحات
 * 
 * يتحقق من وجود التوكن في الكوكيز:
 * - /dashboard/* → يعيد توجيه لـ /login إذا ما في توكن
 * - /login, /register → يعيد توجيه لـ /dashboard إذا عنده توكن
 * 
 * ملاحظة: التحقق الفعلي من صلاحية التوكن يتم في Railway backend
 * هنا نتحقق من وجوده فقط لتحسين تجربة المستخدم
 */

import { NextRequest, NextResponse } from 'next/server';

// صفحات محمية
const PROTECTED = ['/dashboard'];

// صفحات المصادقة (يعاد توجيه المسجلين بعيدًا عنها)
const AUTH_PAGES = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some(p => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some(p => pathname === p);

  if (!isProtected && !isAuthPage) {
    return NextResponse.next();
  }

  // تحقق من وجود التوكن في الكوكيز
  const token = request.cookies.get('saas_access_token')?.value;
  const hasToken = !!token && token.length > 10;

  // ═══ حماية الداشبورد ═══
  if (isProtected && !hasToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ═══ إعادة توجيه المسجلين من صفحات المصادقة ═══
  if (isAuthPage && hasToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
  ],
};
