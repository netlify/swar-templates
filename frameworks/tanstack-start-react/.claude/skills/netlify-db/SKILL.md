---
name: netlify-db
description: Use Netlify DB, a managed Postgres database powered by Neon. Use when you need relational database capabilities, SQL queries, or persistent structured data storage on Netlify.
license: Apache-2.0
metadata:
  author: netlify
  version: "1.0"
---

# Netlify DB

Netlify DB provides instant Postgres database instances powered by Neon. It auto-connects to your functions with zero configuration.

## When to Use

- Relational data storage
- Complex queries with joins
- ACID transactions
- Structured data with schemas
- SQL-based data access

## Quick Setup

```bash
# Initialize Netlify DB for your project
netlify db:init

# This creates:
# - A Neon Postgres database
# - DATABASE_URL environment variable
# - drizzle.config.ts (if using Drizzle)
```

## Using with Drizzle ORM (Recommended)

### Installation

```bash
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
```

### Schema Definition

```typescript
// src/db/schema.ts
import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  published: boolean("published").default(false),
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### Drizzle Configuration

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Database Client

```typescript
// src/db/index.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

export { schema };
```

### Migrations

```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Push schema directly to database (development)
npx drizzle-kit push

# Run migrations
npx drizzle-kit migrate
```

## Basic Queries with Drizzle

### Create

```typescript
import { db, schema } from "./db";

// Insert single record
const newUser = await db.insert(schema.users).values({
  email: "alice@example.com",
  name: "Alice",
}).returning();

// Insert multiple records
await db.insert(schema.posts).values([
  { title: "First Post", authorId: newUser[0].id },
  { title: "Second Post", authorId: newUser[0].id },
]);
```

### Read

```typescript
import { db, schema } from "./db";
import { eq, and, like, desc } from "drizzle-orm";

// Get all users
const allUsers = await db.select().from(schema.users);

// Get user by ID
const user = await db
  .select()
  .from(schema.users)
  .where(eq(schema.users.id, 1));

// Get with conditions
const publishedPosts = await db
  .select()
  .from(schema.posts)
  .where(
    and(
      eq(schema.posts.published, true),
      like(schema.posts.title, "%Tutorial%")
    )
  )
  .orderBy(desc(schema.posts.createdAt))
  .limit(10);

// Join tables
const postsWithAuthors = await db
  .select({
    postTitle: schema.posts.title,
    authorName: schema.users.name,
  })
  .from(schema.posts)
  .leftJoin(schema.users, eq(schema.posts.authorId, schema.users.id));
```

### Update

```typescript
import { db, schema } from "./db";
import { eq } from "drizzle-orm";

// Update single field
await db
  .update(schema.posts)
  .set({ published: true })
  .where(eq(schema.posts.id, 1));

// Update multiple fields
await db
  .update(schema.users)
  .set({ 
    name: "Alice Smith",
    updatedAt: new Date(),
  })
  .where(eq(schema.users.email, "alice@example.com"));
```

### Delete

```typescript
import { db, schema } from "./db";
import { eq, lt } from "drizzle-orm";

// Delete single record
await db.delete(schema.posts).where(eq(schema.posts.id, 1));

// Delete with condition
await db
  .delete(schema.posts)
  .where(
    and(
      eq(schema.posts.published, false),
      lt(schema.posts.createdAt, thirtyDaysAgo)
    )
  );
```

## Using in Netlify Functions

```typescript
// netlify/functions/users.ts
import type { Context } from "@netlify/functions";
import { db, schema } from "../../src/db";
import { eq } from "drizzle-orm";

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  
  switch (request.method) {
    case "GET": {
      const id = url.searchParams.get("id");
      
      if (id) {
        const user = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, parseInt(id)));
        
        if (!user.length) {
          return new Response("User not found", { status: 404 });
        }
        return Response.json(user[0]);
      }
      
      const users = await db.select().from(schema.users);
      return Response.json(users);
    }
    
    case "POST": {
      const body = await request.json();
      const newUser = await db
        .insert(schema.users)
        .values(body)
        .returning();
      
      return Response.json(newUser[0], { status: 201 });
    }
    
    case "DELETE": {
      const id = url.searchParams.get("id");
      if (!id) {
        return new Response("ID required", { status: 400 });
      }
      
      await db.delete(schema.users).where(eq(schema.users.id, parseInt(id)));
      return new Response(null, { status: 204 });
    }
    
    default:
      return new Response("Method not allowed", { status: 405 });
  }
};
```

## Using Raw SQL (Without ORM)

```typescript
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// Simple query
const users = await sql`SELECT * FROM users`;

// Parameterized query (safe from SQL injection)
const user = await sql`
  SELECT * FROM users WHERE id = ${userId}
`;

// Insert
await sql`
  INSERT INTO users (email, name) 
  VALUES (${email}, ${name})
`;

// Transaction
const result = await sql.transaction([
  sql`INSERT INTO users (email, name) VALUES (${email}, ${name}) RETURNING id`,
  sql`INSERT INTO profiles (user_id, bio) VALUES (${userId}, ${bio})`,
]);
```

## Transactions with Drizzle

```typescript
import { db, schema } from "./db";

// Transaction ensures all operations succeed or none do
await db.transaction(async (tx) => {
  const [user] = await tx
    .insert(schema.users)
    .values({ email: "bob@example.com", name: "Bob" })
    .returning();
  
  await tx.insert(schema.posts).values({
    title: "Bob's First Post",
    authorId: user.id,
  });
  
  // If any operation fails, all are rolled back
});
```

## Common Patterns

### Soft Deletes

```typescript
// Schema with soft delete
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Query only non-deleted
const activePosts = await db
  .select()
  .from(schema.posts)
  .where(isNull(schema.posts.deletedAt));

// Soft delete
await db
  .update(schema.posts)
  .set({ deletedAt: new Date() })
  .where(eq(schema.posts.id, postId));
```

### Pagination

```typescript
async function getPaginatedPosts(page: number, pageSize: number = 10) {
  const offset = (page - 1) * pageSize;
  
  const [posts, countResult] = await Promise.all([
    db
      .select()
      .from(schema.posts)
      .orderBy(desc(schema.posts.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.posts),
  ]);
  
  return {
    data: posts,
    page,
    pageSize,
    total: countResult[0].count,
    totalPages: Math.ceil(countResult[0].count / pageSize),
  };
}
```

### Full-Text Search

```typescript
// Use PostgreSQL's full-text search
const results = await sql`
  SELECT * FROM posts 
  WHERE to_tsvector('english', title || ' ' || content) 
        @@ plainto_tsquery('english', ${searchQuery})
  ORDER BY ts_rank(
    to_tsvector('english', title || ' ' || content),
    plainto_tsquery('english', ${searchQuery})
  ) DESC
  LIMIT 20
`;
```

## CLI Commands

```bash
# Initialize database
netlify db:init

# Open database in Neon console
netlify db:open

# Run migrations
netlify db:migrate

# Pull schema from existing database
netlify db:pull

# Push schema to database
netlify db:push
```

## Environment Variables

- `DATABASE_URL` - Automatically set by Netlify DB
- Format: `postgres://user:password@host/database?sslmode=require`

## Local Development

```bash
# Run with Netlify Dev (auto-connects to database)
netlify dev

# Or set DATABASE_URL in .env for local testing
DATABASE_URL=postgres://user:pass@localhost:5432/mydb
```

## Limits

- Based on Neon's Postgres offering
- Connection pooling handled automatically
- Serverless-optimized (connections close between requests)
- See Neon documentation for specific limits
