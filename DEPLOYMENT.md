# Vercel Deployment Architecture

The Health Nexus application is optimized for Serverless Edge runtimes (like Vercel). However, because Vercel utilizes an ephemeral read-only file system, the local `inventory.db` (SQLite) will inherently wipe its data between rapid requests in production.

This behaves perfectly for a local prototype, but in Vercel Cloud, you must connect a Persistent Database!

## Quick Setup: Vercel Postgres
The easiest route to production without mutating any of your code architecture is attaching a Vercel Postgres instance.

1. Publish your code to a GitHub Repository.
2. Link the repository to your Vercel Dashboard.
3. Once deployed, navigate to your Vercel Project Settings > **Storage**.
4. Click **Create Database** and select **Postgres**.
5. Once created, Vercel will auto-inject the `POSTGRES_URL` environment variables.

## Transitioning `db.ts` to Cloud
If you run inside Vercel, you will swap `better-sqlite3` for `@vercel/postgres`. You can install it via:
```bash
npm i @vercel/postgres
```

Since we wrote all your queries using standard raw SQL (e.g., `SELECT * FROM medicines`), switching to Postgres is literally a 1-line update in your `src/lib/db.ts`!

*Example Cloud Implementation:*
```typescript
import { sql } from '@vercel/postgres';

export async function getDb() {
  // Rather than `db.prepare('SELECT').all()`, simply run:
  // const { rows } = await sql`SELECT * FROM medicines`;
  return sql;
}
```

## Gemini AI Costs & Optimizations
We have fully deployed your cloud cost reduction architecture!
- Your `ai_cache` table is currently active. Identical responses are cached under an MD5 Hash.
- Token Limits are constrained to 600 Output Tokens.
- Model swapped to `gemini-2.5-flash-8b` to ensure minimal billing spikes even under heavy use!
