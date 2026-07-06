![BookVerse](https://img.shields.io/badge/BookVerse-Free%20Online%20Library-6366f1?style=for-the-badge&logo=bookstack&logoColor=white)
![Status](https://img.shields.io/badge/Status-Live-22c55e?style=for-the-badge)
![Books](https://img.shields.io/badge/Books-154+-f59e0b?style=for-the-badge)

# 📚 BookVerse

Platform baca buku online **100% gratis**. Baca langsung di browser tanpa download, tanpa bayar, tanpa registrasi wajib.

**🔗 Live:** [book.denisetiya.site](https://book.denisetiya.site)

---

## ✨ Fitur

| Fitur | Detail |
|-------|--------|
| 📖 **Baca Online** | Internet Archive BookReader embedded — baca langsung di browser |
| 🔍 **Search & Filter** | Cari buku + filter per kategori (Fiksi, Non-Fiksi, Teknologi, Bisnis, Anak, Sastra) |
| ♾️ **Infinite Scroll** | Load 12 buku per halaman, auto-load saat scroll |
| ❤️ **Favorites** | Simpan buku favorit ke database |
| 📊 **Reading Progress** | Track progress baca per buku |
| 💯 **100% Gratis** | Tanpa harga, tanpa keranjang, tanpa checkout |
| 🖼️ **Open Library Covers** | Semua cover dari Open Library cover_i API |
| 📱 **Responsive** | Mobile-first, 2-3 items per row |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | [Astro 5](https://astro.build) (SSR) + [Tailwind CSS v4](https://tailwindcss.com) |
| Backend | Astro API Routes |
| Database | [PostgreSQL 16](https://www.postgresql.org) (Drizzle ORM) |
| Book Data | [Open Library API](https://openlibrary.org/developers/api) |
| Reader | [Internet Archive BookReader](https://archive.org) embed |
| Icons | [Phosphor Icons](https://phosphoricons.com) |
| Deploy | Docker + Nginx reverse proxy |
| CI/CD | GitHub → Docker build |

## 📂 Struktur Project

```
book-store/
├── src/
│   ├── components/
│   │   ├── BookCard.astro      # Card buku (GRATIS badge, Baca btn, Favorite)
│   │   ├── Hero.astro          # Hero section dengan floating covers
│   │   ├── Navbar.astro        # Navigation bar
│   │   └── Footer.astro        # Footer
│   ├── layouts/
│   │   └── Layout.astro        # Base layout
│   ├── lib/
│   │   ├── db.ts               # Drizzle + PostgreSQL connection
│   │   └── openLibrary.ts      # Open Library API helper
│   ├── pages/
│   │   ├── index.astro         # Landing page (Hero, Featured, Categories, Testimonials)
│   │   ├── books/
│   │   │   ├── index.astro     # Katalog + infinite scroll + search + filter
│   │   │   └── [id].astro      # Detail buku
│   │   │   └── [id]/
│   │   │       └── read.astro  # Baca buku (IA BookReader embed)
│   │   ├── favorites.astro     # Halaman favorit
│   │   └── api/
│   │       ├── books/
│   │       │   └── index.ts    # GET /api/books?page=&limit=&category=&search=
│   │       ├── favorites.ts    # POST/GET /api/favorites
│   │       └── reading-progress.ts  # POST/GET /api/reading-progress
│   ├── schema/
│   │   └── index.ts            # Drizzle schema (books, favorites, readingProgress)
│   └── styles/
│       └── global.css          # Tailwind + custom theme
├── scripts/
│   └── seed-books.mjs          # Seed 154 buku dari Open Library
├── Dockerfile                  # Production Docker image
├── astro.config.mjs            # Astro SSR config
├── drizzle.config.ts           # Drizzle ORM config
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Docker (opsional, untuk deploy)

### Development

```bash
# Clone
git clone https://github.com/denisetiya/bookverse.git
cd bookverse

# Install dependencies
npm install

# Setup database
cp .env.example .env
# Edit .env dengan DATABASE_URL kamu

# Push schema ke database
npx drizzle-kit push

# Seed 154 buku (opsional)
node scripts/seed-books.mjs

# Run dev server
npm run dev
# Buka http://localhost:4326
```

### Production (Docker)

```bash
# Build image
docker build -t bookverse:latest .

# Run container
docker run -d \
  --name bookverse \
  --network atomix-dbs_default \
  -p 127.0.0.1:4326:4326 \
  --env-file .env \
  --restart unless-stopped \
  bookverse:latest
```

## 📡 API Endpoints

### Books
```
GET /api/books
  ?page=1         # Halaman (default: 1)
  &limit=12       # Items per page (default: 12)
  &category=Fiksi # Filter kategori
  &search=query   # Search title/author

Response:
{
  "books": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 154,
    "totalPages": 13,
    "hasMore": true
  }
}
```

### Favorites
```
POST /api/favorites
  Body: { "bookId": "uuid" }
  Response: { "favorited": true/false }

GET /api/favorites?userId=...
```

### Reading Progress
```
POST /api/reading-progress
  Body: { "bookId": "uuid", "progress": 45, "lastPosition": "1200" }

GET /api/reading-progress?userId=...
```

## 📊 Database Schema

```sql
-- Books (154 entries, seeded from Open Library)
CREATE TABLE books (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  cover_image TEXT,
  language TEXT DEFAULT 'en',
  open_library_key TEXT,
  gutenberg_id TEXT,
  archive_id TEXT,
  published_year INTEGER,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Favorites
CREATE TABLE favorites (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  book_id UUID REFERENCES books(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reading Progress
CREATE TABLE reading_progress (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  book_id UUID REFERENCES books(id),
  progress INTEGER DEFAULT 0,
  last_position TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 📚 Sumber Buku

Semua buku diambil dari [Open Library API](https://openlibrary.org/developers/api):

| Kategori | Jumlah | Contoh |
|----------|--------|--------|
| Fiksi | ~22 | Ficciones, Dune, 1984, Laskar Pelangi |
| Non-Fiksi | ~27 | Sapiens, Educated, Becoming |
| Teknologi | ~25 | Clean Code, Eloquent JavaScript |
| Bisnis | ~27 | Rich Dad Poor Dad, Think and Grow Rich |
| Anak | ~28 | Harry Potter, Charlotte's Web |
| Sastra | ~25 | The Odyssey, War and Peace |

Cover diambil dari `covers.openlibrary.org/b/id/{cover_id}-L.jpg`.
Baca online via [Internet Archive](https://archive.org) BookReader embed.

## 🏗️ Deploy

Project ini di-deploy di:

- **Server:** `202.155.143.135`
- **Domain:** `book.denisetiya.site`
- **Container:** Docker + Nginx reverse proxy (HTTP/3 QUIC)
- **SSL:** Let's Encrypt (auto-renew)
- **Database:** PostgreSQL 16 (atomix-postgres container)

## 📄 License

MIT

---

**Made with ❤️ by [Deni ᵃʳᵘⁿⁱᵏᵃ](https://github.com/denisetiya)**
