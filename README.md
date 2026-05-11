# Pepper — Minecraft Texture Pack Hub

A Modrinth-inspired Minecraft resource pack website built with Next.js, Supabase, and a red/black UI.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Add your Supabase settings in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://wtiahnjkofxrsdipymsf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0aWFobmprb2Z4cnNkaXB5bXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDAxNzcsImV4cCI6MjA5NDA3NjE3N30.vG0lSp027OQevcsPvlv3HK8ZPi-KoxBSxZuVERYn2YU
```

3. Run the app:

```bash
npm run dev
```

4. Open the website:

```text
http://localhost:3000
```

## What’s included

- `app/page.js` - homepage with pack browsing, render setup section, and light/dark mode
- `app/upload/page.js` - upload form with file picker, render guidance, and theme switch
- `lib/supabase.js` - Supabase client using your env variables
- `app/globals.css` - theme variables and global styles

## Supabase requirements

Make sure your Supabase project includes:

- a `projects` table
- a storage bucket named `resource-packs`

If you want, I can also help you create the Supabase table schema and bucket rules.
