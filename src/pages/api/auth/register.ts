import type { APIRoute } from 'astro';
import { db } from '../../../lib/db.ts';
import { users } from '../../../schema/index.ts';
import { lucia } from '../../../lib/auth.ts';
import { hash } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: 'Semua field harus diisi' }), { status: 400 });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ error: 'Password minimal 6 karakter' }), { status: 400 });
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return new Response(JSON.stringify({ error: 'Email sudah terdaftar' }), { status: 400 });
    }

    const passwordHash = await hash(password);
    const userId = crypto.randomUUID();

    await db.insert(users).values({
      id: userId,
      name,
      email,
      passwordHash,
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return new Response(JSON.stringify({ success: true }));
  } catch (e) {
    console.error('Register error:', e);
    return new Response(JSON.stringify({ error: 'Terjadi kesalahan' }), { status: 500 });
  }
};
