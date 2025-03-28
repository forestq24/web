import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export const updateSession = async (request: NextRequest) => {
  try {
    let response = NextResponse.next({ request: { headers: request.headers } });
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );
    const user = await supabase.auth.getUser();
    // Protected Routes: Routes that should only be accessible to authenticated users.
    if (request.nextUrl.pathname.startsWith('/dashboard') && user.error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (request.nextUrl.pathname.startsWith('/profile') && user.error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (request.nextUrl.pathname.startsWith('/settings') && user.error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (
      (request.nextUrl.pathname == '/' ||
        request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/signup') ||
        request.nextUrl.pathname.startsWith('/forgot-password')) &&
      !user.error
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return NextResponse.next({ request: { headers: request.headers } });
  }
};
