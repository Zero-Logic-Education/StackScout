import { NextRequest, NextResponse } from 'next/server';

// Функция для парсинга JWT и извлечения роли
const parseJWT = (token: string): { role?: string } => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    return {};
  }
};

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Защита админ маршрутов (кроме /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('auth-token')?.value;

    // Если нет токена - редирект на админ логин
    if (!token || token.trim() === '') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Проверяем что токен - это валидный JWT с ролью ADMIN
    try {
      const decoded = parseJWT(token);
      if (decoded.role !== 'ADMIN') {
        // Если не администратор - редирект на админ логин
        const loginUrl = new URL('/admin/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      // Если токен невалидный - редирект на админ логин
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
