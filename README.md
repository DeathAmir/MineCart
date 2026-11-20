# MineCart

A Minecraft mod discovery and creator platform with a custom violet interface.

## Stack

- Vue 3 + TypeScript
- Vite
- Tailwind CSS v4
- Lucide Vue icons
- Supabase Auth, Postgres and Storage (optional backend)
- GitHub Actions + GitHub Pages static deployment

## Features

- Responsive mod discovery, search and category filters
- Project detail and release listing
- Supabase email/password account integration
- Creator dashboard and project moderation status
- Project upload flow for JAR/ZIP releases and cover images
- Version metadata, loader and Minecraft version fields
- Demo catalog when Supabase is not configured

## Local development

1. Install Node.js 22 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and add your Supabase project URL and publishable/anon key.
4. Run `npm run dev`.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Configure the Auth email settings and allowed redirect URLs for your deployment.
4. Add the frontend project URL and key to the build environment.

The browser uses only the Supabase publishable/anon key. Never put a Supabase service-role key in frontend code, GitHub Pages variables, or any `VITE_*` variable. Database and Storage access are governed by the included RLS policies.

## GitHub Pages deployment

The workflow in `.github/workflows/deploy.yml` builds the Vue application and deploys `dist/` on every push to `main`.

After the first successful workflow run, open **Repository Settings → Pages** and confirm **Build and deployment → Source: GitHub Actions** if GitHub has not selected it automatically.

The project-site base path is configured as `/MineCart/`, so the expected URL is:

`https://deathamir.github.io/MineCart/`

## Hosting limitation

GitHub Pages serves static files only. It cannot run the application's server-side APIs. This deployment is suitable as a temporary frontend preview. For a public production service that accepts passwords and user uploads, deploy the authenticated application/backend on a suitable application host and keep Supabase RLS enabled. Do not treat GitHub Pages as a secure server-side environment.

## Database moderation

New projects are submitted with `pending` status. Approve a project by changing its `mods.status` to `approved` in Supabase. An admin dashboard can replace this manual step in a later iteration.

---

Made for the Minecraft community · MineCart
