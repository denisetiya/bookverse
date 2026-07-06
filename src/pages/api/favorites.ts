import type { APIRoute } from 'astro';
import { db } from '../../lib/db.ts';
import { favorites, books } from '../../schema/index.ts';
import { eq, and } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
  const userId = locals.userId || 'anonymous';
  
  try {
    const { bookId } = await request.json();
    
    if (!bookId) {
      return new Response(JSON.stringify({ error: 'Missing bookId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if already favorited
    const existing = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.bookId, bookId)
        )
      );
    
    if (existing.length > 0) {
      // Remove favorite
      await db
        .delete(favorites)
        .where(
          and(
            eq(favorites.userId, userId),
            eq(favorites.bookId, bookId)
          )
        );
      
      return new Response(JSON.stringify({ favorited: false }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Add favorite
      await db.insert(favorites).values({
        userId,
        bookId,
      });
      
      return new Response(JSON.stringify({ favorited: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
  } catch (error) {
    console.error('Favorite error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const GET: APIRoute = async ({ request, locals }) => {
  const userId = locals.userId || 'anonymous';
  
  try {
    const userFavorites = await db
      .select({
        book: books,
        favoritedAt: favorites.createdAt,
      })
      .from(favorites)
      .innerJoin(books, eq(favorites.bookId, books.id))
      .where(eq(favorites.userId, userId));
    
    return new Response(JSON.stringify(userFavorites), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Get favorites error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
