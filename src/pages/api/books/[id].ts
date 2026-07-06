import type { APIRoute } from 'astro';
import { db } from '../../../lib/db.ts';
import { books } from '../../../schema/index.ts';
import { eq } from 'drizzle-orm';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    const book = await db.select().from(books).where(eq(books.id, id!)).limit(1);
    if (book.length === 0) {
      return new Response(JSON.stringify({ error: 'Buku tidak ditemukan' }), { status: 404 });
    }
    return new Response(JSON.stringify(book[0]));
  } catch (e) {
    console.error('Book error:', e);
    return new Response(JSON.stringify({ error: 'Terjadi kesalahan' }), { status: 500 });
  }
};
