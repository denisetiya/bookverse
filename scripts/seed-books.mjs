#!/usr/bin/env node
// Seed script: Fetch100+ books from Open Library API
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { books } from '../src/schema/index.ts';
import { desc } from 'drizzle-orm';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://bookverse:bookverse@127.0.0.1:5432/bookverse',
});

const db = drizzle(pool);

// Categories with Open Library subjects
const CATEGORIES = [
  { name: 'Fiksi', subject: 'fiction', queries: ['indonesian fiction', 'literary fiction', 'adventure fiction'] },
  { name: 'Non-Fiksi', subject: 'nonfiction', queries: ['biography', 'history', 'science'] },
  { name: 'Teknologi', subject: 'technology', queries: ['computer science', 'programming', 'engineering'] },
  { name: 'Bisnis', subject: 'business', queries: ['economics', 'management', 'entrepreneurship'] },
  { name: 'Anak', subject: 'children', queries: ['children stories', 'fairy tales', 'young adult'] },
  { name: 'Sastra', subject: 'literature', queries: ['classic literature', 'poetry', 'philosophy'] },
];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchBooksWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'BookVerse/1.0 (book.denisetiya.site)' }
      });
      if (res.status === 429) {
        console.log(`Rate limited, waiting 2s...`);
        await delay(2000);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      console.log(`Retry ${i + 1}/${retries}...`);
      await delay(1000);
    }
  }
}

async function fetchBooksForCategory(category, targetCount = 20) {
  const fetched = [];
  
  for (const query of category.queries) {
    if (fetched.length >= targetCount) break;
    
    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${targetCount}&fields=key,title,author_name,cover_i,first_publish_year,subject`;
      const data = await fetchBooksWithRetry(url);
      
      for (const doc of (data.docs || [])) {
        if (fetched.length >= targetCount) break;
        if (!doc.title || !doc.author_name) continue;
        if (!doc.cover_i) continue; // Must have cover
        
        fetched.push({
          title: doc.title,
          author: doc.author_name[0],
          description: `A ${category.name.toLowerCase()} book by ${doc.author_name[0]}. Published ${doc.first_publish_year || 'unknown'}.`,
          coverImage: `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`,
          category: category.name,
          openLibraryKey: doc.key,
          language: (doc.language && doc.language[0]) || 'en',
          publishedYear: doc.first_publish_year || null,
          featured: fetched.length < 3,
        });
      }
      
      await delay(500); // Rate limit
    } catch (e) {
      console.error(`Error fetching ${query}:`, e.message);
    }
  }
  
  return fetched;
}

async function seed() {
  console.log('Fetching books from Open Library API...');
  
  const allBooks = [];
  
  for (const category of CATEGORIES) {
    console.log(`\nFetching ${category.name} books...`);
    const books = await fetchBooksForCategory(category, 20);
    console.log(`  Found ${books.length} books`);
    allBooks.push(...books);
  }
  
  console.log(`\nTotal books to insert: ${allBooks.length}`);
  
  // Check existing books
  const existing = await db.select().from(books);
  console.log(`Existing books in DB: ${existing.length}`);
  
  if (existing.length > 0) {
    console.log('Clearing existing books...');
    await db.delete(books);
  }
  
  // Insert in batches
  const batchSize = 20;
  for (let i = 0; i < allBooks.length; i += batchSize) {
    const batch = allBooks.slice(i, i + batchSize);
    await db.insert(books).values(batch);
    console.log(`Inserted ${Math.min(i + batchSize, allBooks.length)}/${allBooks.length}`);
  }
  
  console.log('\nDone! Seeded', allBooks.length, 'books');
  
  // Verify
  const final = await db.select().from(books);
  const byCategory = {};
  final.forEach(b => {
    byCategory[b.category] = (byCategory[b.category] || 0) + 1;
  });
  console.log('\nBooks by category:');
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`);
  });
  
  await pool.end();
}

seed().catch(console.error);
