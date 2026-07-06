import type { APIRoute } from 'astro';
import { db } from '../../../lib/db.ts';
import { users } from '../../../schema/index.ts';
import { lucia } from '../../../lib/auth.ts';
import { verify } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email dan password harus diisi' }), { status: 400 });
    }

    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (user.length === 0) {
      return new Response(JSON.stringify({ error: 'Email atau password salah' }), { status: 400 });
    }

    const validPassword = await verify(user[0].passwordHash, password);
    if (!validPassword) {
      return new Response(JSON.stringify({ error: 'Email atau password salah' }), { status: 400 });
    }

    const session = await lucia.createSession(user[0].id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return new Response(JSON.stringify({ success: true }));
  } catch (e) {
    console.error('Login error:', e);
    return new Response(JSON.stringify({ error: 'Terjadi kesalahan' }), { status: 500 });
  }
};
