# MineCart

Minecraft mod discovery and publishing platform with a custom violet interface.

## Stack
Next.js 15, React 19, TypeScript, Supabase Auth/Postgres/Storage, GitHub Actions and Vercel.

## Features
- Responsive mod discovery, search and category filters
- Creator accounts and session-based authentication
- Creator upload studio with metadata and version fields
- Dashboard for projects, download stats and moderation status
- Project pages and release download UI
- Modular app routes, shared components and typed data layer

## Setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env.local` and set the Supabase URL and anon key.
4. Run `npm install` and `npm run dev`.

## Deployment
Import the repository into Vercel and add the Supabase environment variables. The GitHub Actions workflow runs a production build and deploys through Vercel CLI. Add repository Actions secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The deploy job requires the three Vercel secrets. Configure a Supabase project before using accounts, uploads or private file downloads.

The UI includes demo catalog entries until the live database is connected. This repository is a full-stack application and cannot be hosted as a static GitHub Pages site.
