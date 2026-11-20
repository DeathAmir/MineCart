# MineCart

A community platform for Minecraft mods, resource packs, shaders and modpacks.

## Stack

- Vue 3 + TypeScript + Vite
- Tailwind CSS v4
- Lucide Vue Next
- Rust compiled to WebAssembly for project-search scoring
- Supabase Auth, Postgres and Storage
- GitHub Pages

## Local development

Run npm install, then npm run dev.

For a production build, install Rust, add the wasm32-unknown-unknown target, install wasm-pack, then run npm run build.

## Supabase setup

1. Create a Supabase project.
2. Run supabase/schema.sql in the SQL Editor.
3. Set the Auth site URL and redirect URLs to your GitHub Pages URL.
4. Add these repository Actions variables: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.

The publishable/anon key is designed to be visible in browser code. Protect data with Row Level Security and storage policies. Never use a service_role key, database password, or privileged secret in a frontend build.

Without Supabase configuration, MineCart shows an empty state. It never seeds fake projects, creators, or download statistics.

## GitHub Pages

In repository Settings → Pages, set the source to GitHub Actions. Every push to main builds Vue and deploys the static dist directory.
