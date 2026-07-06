import type { APIRoute } from 'astro';
import { db } from '../../../lib/db.ts';
import { books } from '../../../schema/index.ts';
import { eq, count, ilike, or, and, desc, sql } from 'drizzle-orm';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '12');
  const category = url.searchParams.get('category') || '';
  const search = url.searchParams.get('search') || '';
  
  const offset = (page - 1) * limit;
  
  try {
    // Build conditions
    const conditions = [];
    if (category) {
      conditions.push(eq(books.category, category));
    }
    if (search) {
      conditions.push(
        or(
          ilike(books.title, `%${search}%`),
          ilike(books.author, `%${search}%`)
        )
      );
    }
    
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Get total count
    const totalResult = await db
      .select({ total: count() })
      .from(books)
      .where(where);
    
    const total = totalResult[0]?.total || 0;
    
    // Get paginated books
    const allBooks = await db
      .select()
      .from(books)
      .where(where)
      .orderBy(desc(books.createdAt))
      .limit(limit)
      .offset(offset);
    
    return new Response(JSON.stringify({
      books: allBooks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + limit < total,
      }
    }));
    
  } catch (e) {
    console.error('Books error:', e);
    return new Response(JSON.stringify({ error: 'Terjadi kesalahan' }), { status: 500 });
  }
};
