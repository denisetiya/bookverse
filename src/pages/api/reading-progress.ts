import type { APIRoute } from 'astro';
import { db } from '../../lib/db.ts';
import { readingProgress } from '../../schema/index.ts';
import { eq, and } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
  // Get user from session (simplified - in production use proper auth)
  const userId = locals.userId || 'anonymous';
  
  try {
    const { bookId, progress, lastPosition } = await request.json();
    
    if (!bookId || progress === undefined) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if progress exists
    const existing = await db
      .select()
      .from(readingProgress)
      .where(
        and(
          eq(readingProgress.userId, userId),
          eq(readingProgress.bookId, bookId)
        )
      );
    
    if (existing.length > 0) {
      // Update
      await db
        .update(readingProgress)
        .set({
          progress,
          lastPosition,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(readingProgress.userId, userId),
            eq(readingProgress.bookId, bookId)
          )
        );
    } else {
      // Insert
      await db.insert(readingProgress).values({
        userId,
        bookId,
        progress,
        lastPosition,
      });
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Reading progress error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const GET: APIRoute = async ({ request, locals }) => {
  const userId = locals.userId || 'anonymous';
  const url = new URL(request.url);
  const bookId = url.searchParams.get('bookId');
  
  try {
    if (bookId) {
      const progress = await db
        .select()
        .from(readingProgress)
        .where(
          and(
            eq(readingProgress.userId, userId),
            eq(readingProgress.bookId, bookId)
          )
        );
      
      return new Response(JSON.stringify(progress[0] || { progress: 0 }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get all progress
    const allProgress = await db
      .select()
      .from(readingProgress)
      .where(eq(readingProgress.userId, userId));
    
    return new Response(JSON.stringify(allProgress), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Get progress error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
