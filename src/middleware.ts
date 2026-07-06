import { defineMiddleware } from 'astro:middleware';
import { lucia } from './lib/auth.ts';

export const onRequest = defineMiddleware(async (context, next) => {
  const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null;

  if (!sessionId) {
    context.locals.user = null;
    context.locals.session = null;
    return next();
  }

  const { session, user } = await lucia.validateSession(sessionId);

  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id);
    context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  }

  if (!session) {
    const sessionCookie = lucia.createBlankSessionCookie();
    context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  }

  context.locals.user = user;
  context.locals.session = session;

  // Protect routes
  const protectedPaths = ['/dashboard', '/cart', '/api/cart', '/api/orders'];
  if (protectedPaths.some((path) => context.url.pathname.startsWith(path))) {
    if (!session) {
      if (context.url.pathname.startsWith('/api/')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }
      return context.redirect('/auth/login');
    }
  }

  return next();
});
