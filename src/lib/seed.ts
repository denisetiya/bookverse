import { db } from './db.js';
import { books } from '../schema/index.js';

const sampleBooks = [
  {
    title: 'Laskar Pelangi',
    author: 'Andrea Hirata',
    description: 'Novel tentang perjuangan anak-anak miskin di Belitung untuk mendapatkan pendidikan. Kisah inspiratif tentang persahabatan, mimpi, dan keteguhan hati.',
    price: '89000',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9789793062792-L.jpg',
    category: 'Fiksi',
    stock: 25,
  },
  {
    title: 'Bumi Manusia',
    author: 'Pramoedya Ananta Toer',
    description: 'Novel pertama tetralogi Buru yang mengisahkan kehidupan Minke, seorang pribumi cerdas di era kolonial Belanda.',
    price: '95000',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9789799731233-L.jpg',
    category: 'Fiksi',
    stock: 30,
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    description: 'Panduan praktis membangun kebiasaan baik dan menghilangkan kebiasaan buruk melalui perubahan kecil yang berdampak besar.',
    price: '115000',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
    category: 'Non-Fiksi',
    stock: 40,
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    description: 'Perjalanan sejarah umat manusia dari era pemburu-pengumpul hingga abad ke-21, mengungkap bagaimana Homo sapiens mendominasi dunia.',
    price: '135000',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg',
    category: 'Non-Fiksi',
    stock: 20,
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    description: 'Panduan menulis kode yang bersih, mudah dibaca, dan dipelihara. Essential reading untuk setiap software developer.',
    price: '185000',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
    category: 'Teknologi',
    stock: 15,
  },
  {
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    description: 'Deep dive ke arsitektur sistem data modern — database, message queue, stream processing, dan distributed systems.',
    price: '195000',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9781449373320-L.jpg',
    category: 'Teknologi',
    stock: 12,
  },
  {
    title: 'Rich Dad Poor Dad',
    author: 'Robert T. Kiyosaki',
    description: 'Pelajaran tentang keuangan dari dua perspektif berbeda — bagaimana uang bekerja untuk Anda, bukan sebaliknya.',
    price: '99000',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg',
    category: 'Bisnis',
    stock: 35,
  },
  {
    title: 'The Lean Startup',
    author: 'Eric Ries',
    description: 'Metodologi membangun startup yang efisien — build, measure, learn. Cocok untuk entrepreneur dan innovator.',
    price: '125000',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg',
    category: 'Bisnis',
    stock: 22,
  },
  {
    title: 'Harry Potter and the Sorcerer\'s Stone',
    author: 'J.K. Rowling',
    description: 'Petualangan Harry Potter menemukan dunia sihir di Hogwarts. Awal dari saga fantasi terlaris sepanjang masa.',
    price: '109000',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780590353427-L.jpg',
    category: 'Anak',
    stock: 50,
  },
  {
    title: 'Si Kecil dan Kawan Kawan',
    author: 'Anindita S. Thayf',
    description: 'Kumpulan cerita pendek untuk anak-anak tentang petualangan dan persahabatan.',
    price: '65000',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9786020335148-L.jpg',
    category: 'Anak',
    stock: 18,
  },
  {
    title: 'Sang Pemimpi',
    author: 'Andrea Hirata',
    description: 'Sekuel Laskar Pelangi. Kisah tiga pemuda dari Belitung yang bermimpi besar dan berjuang meraih pendidikan tinggi.',
    price: '85000',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9789793062822-L.jpg',
    category: 'Sastra',
    stock: 28,
  },
  {
    title: 'The Midnight Library',
    author: 'Matt Haig',
    description: 'Nora Seed menemukan perpustakaan di antara hidup dan mati, di mana setiap buku membuka kehidupan alternatif.',
    price: '119000',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg',
    category: 'Sastra',
    stock: 24,
  },
];

async function seed() {
  console.log('Seeding books...');
  
  // Clear existing
  const { Pool } = await import('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/bookverse',
  });
  
  await pool.query('DELETE FROM books');
  console.log('Cleared existing books');
  
  for (const book of sampleBooks) {
    await pool.query(
      `INSERT INTO books (title, author, description, price, cover_image, category, stock) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [book.title, book.author, book.description, book.price, book.coverImage, book.category, book.stock]
    );
    console.log(`  + ${book.title}`);
  }
  
  console.log(`\nSeeded ${sampleBooks.length} books`);
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
