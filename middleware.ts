import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log('미들웨어 실행:', req.nextUrl.pathname);
  
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log('세션 체크 결과:', { 
    hasSession: !!session,
    path: req.nextUrl.pathname 
  });

  // 인증이 필요한 경로 정의
  const authRequired = ['/studies', '/profile', '/api/studies', '/api/members'];

  // 현재 경로가 인증이 필요한 경로인지 확인
  const isAuthRequired = authRequired.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  // 인증이 필요한 경로인데 세션이 없으면 로그인 페이지로 리다이렉트
  if (isAuthRequired && !session) {
    console.log('인증 필요한 페이지 접근 시도 - 리다이렉트');
    const redirectUrl = new URL('/auth', req.url);
    redirectUrl.searchParams.set('redirectTo', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
