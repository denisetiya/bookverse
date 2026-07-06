import type { APIRoute } from 'astro';
import { db } from '../../../lib/db.ts';
import { cartItems } from '../../../schema/index.ts';
import { eq, and } from 'drizzle-orm';

export const prerender = false;

export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { id } = params;
    const { quantity } = await request.json();

    await db
      .update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.id, id!), eq(cartItems.userId, user.id)));

    return new Response(JSON.stringify({ success: true }));
  } catch (e) {
    console.error('Cart update error:', e);
    return new Response(JSON.stringify({ error: 'Terjadi kesalahan' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { id } = params;
    await db.delete(cartItems).where(and(eq(cartItems.id, id!), eq(cartItems.userId, user.id)));

    return new Response(JSON.stringify({ success: true }));
  } catch (e) {
    console.error('Cart delete error:', e);
    return new Response(JSON.stringify({ error: 'Terjadi kesalahan' }), { status: 500 });
  }
};
