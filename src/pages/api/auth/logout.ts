import type { APIRoute } from 'astro';
import { lucia } from '../../../lib/auth.ts';

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  try {
    const sessionId = cookies.get(lucia.sessionCookieName)?.value;
    if (sessionId) {
      await lucia.invalidateSession(sessionId);
    }
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    return new Response(JSON.stringify({ success: true }));
  } catch (e) {
    console.error('Logout error:', e);
    return new Response(JSON.stringify({ error: 'Terjadi kesalahan' }), { status: 500 });
  }
};
