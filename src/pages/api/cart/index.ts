import type { APIRoute } from 'astro';
import { db } from '../../../lib/db.ts';
import { cartItems, books } from '../../../schema/index.ts';
import { eq, and } from 'drizzle-orm';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  try {
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const items = await db
      .select({
        id: cartItems.id,
        bookId: cartItems.bookId,
        quantity: cartItems.quantity,
        book: {
          id: books.id,
          title: books.title,
          author: books.author,
          price: books.price,
          coverImage: books.coverImage,
        },
      })
      .from(cartItems)
      .leftJoin(books, eq(cartItems.bookId, books.id))
      .where(eq(cartItems.userId, user.id));

    return new Response(JSON.stringify(items));
  } catch (e) {
    console.error('Cart GET error:', e);
    return new Response(JSON.stringify({ error: 'Terjadi kesalahan' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { bookId } = await request.json();
    if (!bookId) {
      return new Response(JSON.stringify({ error: 'Book ID required' }), { status: 400 });
    }

    const existing = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, user.id), eq(cartItems.bookId, bookId)))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(cartItems)
        .set({ quantity: existing[0].quantity + 1 })
        .where(eq(cartItems.id, existing[0].id));
    } else {
      await db.insert(cartItems).values({
        userId: user.id,
        bookId,
        quantity: 1,
      });
    }

    return new Response(JSON.stringify({ success: true }));
  } catch (e) {
    console.error('Cart POST error:', e);
    return new Response(JSON.stringify({ error: 'Terjadi kesalahan' }), { status: 500 });
  }
};
