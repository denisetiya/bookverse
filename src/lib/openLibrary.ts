// Open Library API helper
export interface OpenLibraryBook {
  key: string; // e.g., "/works/OL12345W"
  title: string;
  authors?: { name: string }[];
  cover_id?: number;
  first_publish_year?: number;
  subject?: string[];
  language?: string[];
}

export async function searchBooks(query: string, limit = 50): Promise<OpenLibraryBook[]> {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}&fields=key,title,author_name,cover_i,first_publish_year,subject,language`;
  
  const res = await fetch(url, {
    headers: { 'User-Agent': 'BookVerse/1.0 (book.denisetiya.site)' }
  });
  
  if (!res.ok) throw new Error(`Open Library API error: ${res.status}`);
  
  const data = await res.json();
  return (data.docs || []).map((doc: any) => ({
    key: doc.key,
    title: doc.title,
    authors: doc.author_name?.map((name: string) => ({ name })) || [],
    cover_id: doc.cover_i,
    first_publish_year: doc.first_publish_year,
    subject: doc.subject || [],
    language: doc.language || [],
  }));
}

export async function getBookContent(workKey: string): Promise<string | null> {
  // Try to get book text from Open Library
  const url = `https://openlibrary.org${workKey}.json`;
  
  const res = await fetch(url, {
    headers: { 'User-Agent': 'BookVerse/1.0 (book.denisetiya.site)' }
  });
  
  if (!res.ok) return null;
  
  const data = await res.json();
  return data.description?.value || data.description || null;
}

export function getCoverUrl(coverId: number, size: 'S' | 'M' | 'L' = 'L'): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

export async function getBooksBySubject(subject: string, limit = 50): Promise<OpenLibraryBook[]> {
  const url = `https://openlibrary.org/subjects/${encodeURIComponent(subject)}.json?limit=${limit}`;
  
  const res = await fetch(url, {
    headers: { 'User-Agent': 'BookVerse/1.0 (book.denisetiya.site)' }
  });
  
  if (!res.ok) throw new Error(`Open Library subjects API error: ${res.status}`);
  
  const data = await res.json();
  return (data.works || []).map((work: any) => ({
    key: work.key,
    title: work.title,
    authors: work.authors?.map((a: any) => ({ name: a.name })) || [],
    cover_id: work.cover_id,
    first_publish_year: work.first_publish_year,
    subject: work.subject || [],
    language: ['en'],
  }));
}

// Project Gutenberg API helper
export interface GutenbergBook {
  id: number;
  title: string;
  authors: { name: string }[];
  subjects: string[];
  languages: string[];
  formats: Record<string, string>;
  download_count: number;
}

export async function searchGutenberg(query: string, limit = 50): Promise<GutenbergBook[]> {
  const url = `https://gutendex.com/books/?search=${encodeURIComponent(query)}&page_size=${limit}`;
  
  const res = await fetch(url);
  
  if (!res.ok) throw new Error(`Gutenberg API error: ${res.status}`);
  
  const data = await res.json();
  return data.results || [];
}

export async function getGutenbergText(bookId: number): Promise<string | null> {
  // Try plain text first
  const url = `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.txt`;
  
  const res = await fetch(url, {
    headers: { 'User-Agent': 'BookVerse/1.0 (book.denisetiya.site)' }
  });
  
  if (!res.ok) return null;
  
  return await res.text();
}
