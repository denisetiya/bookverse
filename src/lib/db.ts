import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../schema/index.ts';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/bookverse',
});

export const db = drizzle(pool, { schema });
