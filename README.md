# Cozyberry

A personal journaling app built with Next.js, Prisma, and NextAuth.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Auth**: NextAuth v5 (credentials-based)
- **Database**: PostgreSQL via [Neon](https://neon.tech)
- **ORM**: Prisma
- **UI**: Tailwind CSS + Radix UI + TipTap (rich text editor)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env` file in the root (used by Prisma):

```env
DATABASE_URL="postgresql://..."
```

Create a `.env.local` file in the root (used by Next.js):

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="your_secret_here"
```

**Database**: Create a free PostgreSQL database at [neon.tech](https://neon.tech) and paste the connection string above.

**AUTH_SECRET**: Generate one with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Apply the database schema

```bash
npx prisma db push
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Commands

| Command | Description |
|---|---|
| `npm run db:push` | Push schema changes to the database |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:studio` | Open Prisma Studio (visual DB editor) |
