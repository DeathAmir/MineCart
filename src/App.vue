<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  ArrowDownToLine, ArrowRight, ArrowUpRight, Boxes, Check, ChevronDown, CircleUserRound,
  CloudUpload, Compass, Download, Gamepad2, Github, Grid2X2, Heart, Layers3, LogIn,
  Menu, Package, Plus, Search, Settings2, ShieldCheck, Sparkles, Upload, X, Zap
} from 'lucide-vue-next'
import { backendReady, supabase } from './lib/supabase'

type Mod = {
  id: string
  title: string
  slug: string
  summary: string
  description?: string
  category: string
  loader: string
  downloads: number
  author: string
  icon_url?: string
  game_versions?: string[]
  mod_versions?: Array<{ id: string; version_number: string; game_versions: string[]; loader: string; file_name: string; file_path: string; release_notes: string; created_at: string }>
}

const categories = ['All mods', 'Adventure', 'Technology', 'Magic', 'Utility', 'World Generation', 'Decoration', 'Performance', 'Food']
const demoMods: Mod[] = [
  { id: '1', title: 'Create: Mechanical Wonders', slug: 'create-mechanical-wonders', summary: 'Build intricate machines, moving contraptions and a world full of automation.', category: 'Technology', loader: 'Forge', downloads: 128400, author: 'CopperWorks' },
  { id: '2', title: 'Lumen Shaders', slug: 'lumen-shaders', summary: 'A warm, cinematic lighting preset with beautiful skies and reflections.', category: 'Visual', loader: 'Iris', downloads: 96300, author: 'AstraLabs' },
  { id: '3', title: 'Wildlands Expanded', slug: 'wildlands-expanded', summary: 'Explore new biomes, ancient ruins and mysterious creatures.', category: 'World Generation', loader: 'Fabric', downloads: 82400, author: 'MossyStudio' },
  { id: '4', title: 'Arcane Archives', slug: 'arcane-archives', summary: 'A deep magic system built around discovery, rituals and rare artifacts.', category: 'Magic', loader: 'NeoForge', downloads: 67100, author: 'RuneSmith' },
  { id: '5', title: 'Inventory Atelier', slug: 'inventory-atelier', summary: 'A cleaner inventory workflow with smart sorting and quick actions.', category: 'Utility', loader: 'Fabric', downloads: 51200, author: 'PixelForge' },
  { id: '6', title: 'Verdant Decor', slug: 'verdant-decor', summary: 'Hundreds of detailed building pieces for cozy and natural spaces.', category: 'Decoration', loader: 'NeoForge', downloads: 43800, author: 'FernAndOak' },
  { id: '7', title: 'Smooth Frames', slug: 'smooth-frames', summary: 'Client-side optimizations for a smoother and more consistent experience.', category: 'Performance', loader: 'Fabric', downloads: 39100, author: 'FrameLabs' },
  { id: '8', title: 'Culinary Journey', slug: 'culinary-journey', summary: 'Discover ingredients, recipes and a whole new way to cook.', category: 'Food', loader: 'Forge', downloads: 28600, author: 'LittlePan' }
]

const activeCategory = ref('All mods')
const search = ref('')
const mods = ref<Mod[]>(demoMods)
const selectedMod = ref<Mod | null>(null)
const page = ref<'home' | 'login' | 'upload' | 'dashboard' | 'detail'>('home')
const user = ref<any>(null)
const mobileMenu = ref(false)
const authMode = ref<'login' | 'signup'>('login')
const email = ref('')
const password = ref('')
const username = ref('')
const authBusy = ref(false)
const authMessage = ref('')
const uploadBusy = ref(false)
const uploadMessage = ref('')
const projectFile = ref<File | null>(null)
const projectIcon = ref<File | null>(null)
const form = ref({ title: '', summary: '', description: '', category: 'Technology', loader: 'NeoForge', version: '1.0.0', gameVersions: '1.21.1', releaseNotes: 'Initial release' })
const myMods = ref<Mod[]>([])
const filteredMods = computed(() => mods.value.filter(m =>
  (activeCategory.value === 'All mods' || m.category === activeCategory.value) &&
  (m.title + ' ' + m.summary + ' ' + m.loader + ' ' + m.author).toLowerCase().includes(search.value.toLowerCase())
))
const formatDownloads = (n: number) => Intl.NumberFormat('en', { notation: n >= 10000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(n || 0)
const initials = (s: string) => s.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()

function navigate(target: typeof page.value) {
  page.value = target
  selectedMod.value = null
  mobileMenu.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
  history.replaceState(null, '', target === 'home' ? '#/' : '#/' + target)
  if (target === 'dashboard') loadMyMods()
}
function openMod(mod: Mod) {
  selectedMod.value = mod
  page.value = 'detail'
  history.replaceState(null, '', '#/mod/' + mod.slug)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
async function loadMods() {
  if (!supabase) return
  const { data } = await supabase.from('mods').select('*, profiles(username), mod_versions(*)').eq('status', 'approved').order('downloads', { ascending: false }).limit(60)
  if (data?.length) mods.value = data.map((m: any) => ({ ...m, author: m.profiles?.username || 'Creator', downloads: Number(m.downloads || 0), mod_versions: m.mod_versions || [] }))
}
async function loadMyMods() {
  if (!supabase || !user.value) return
  const { data } = await supabase.from('mods').select('*, mod_versions(*)').eq('author_id', user.value.id).order('updated_at', { ascending: false })
  myMods.value = (data || []).map((m: any) => ({ ...m, author: username.value || user.value.email, downloads: Number(m.downloads || 0), mod_versions: m.mod_versions || [] }))
}
async function handleAuth() {
  authMessage.value = ''
  if (!supabase) { authMessage.value = 'Connect Supabase to enable accounts. See the setup guide in the repository.'; return }
  authBusy.value = true
  try {
    if (authMode.value === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email: email.value, password: password.value, options: { data: { username: username.value || email.value.split('@')[0] } } })
      if (error) throw error
      if (data.user && data.session) await supabase.from('profiles').upsert({ id: data.user.id, username: username.value || email.value.split('@')[0] })
      authMessage.value = 'Account created. Check your email if confirmation is enabled.'
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
      if (error) throw error
    }
  } catch (e: any) { authMessage.value = e.message || 'Authentication failed.' }
  finally { authBusy.value = false }
}
async function signOut() {
  await supabase?.auth.signOut()
  user.value = null
  myMods.value = []
  navigate('home')
}
async function publishProject() {
  uploadMessage.value = ''
  if (!supabase || !user.value) { uploadMessage.value = 'Sign in and connect Supabase before publishing.'; return }
  if (!projectFile.value) { uploadMessage.value = 'Choose your .jar or .zip file first.'; return }
  if (!form.value.title.trim() || !form.value.summary.trim()) { uploadMessage.value = 'Add a project title and short summary.'; return }
  uploadBusy.value = true
  try {
    const slug = form.value.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 6)
    let iconUrl = null
    if (projectIcon.value) {
      const iconPath = user.value.id + '/' + slug + '-' + projectIcon.value.name
      const iconUpload = await supabase.storage.from('mod-covers').upload(iconPath, projectIcon.value, { upsert: true })
      if (iconUpload.error) throw iconUpload.error
      iconUrl = supabase.storage.from('mod-covers').getPublicUrl(iconPath).data.publicUrl
    }
    const { data: mod, error: modError } = await supabase.from('mods').insert({
      author_id: user.value.id, title: form.value.title, slug, summary: form.value.summary,
      description: form.value.description, category: form.value.category, loader: form.value.loader,
      game_versions: form.value.gameVersions.split(',').map(x => x.trim()).filter(Boolean), icon_url: iconUrl
    }).select().single()
    if (modError) throw modError
    const path = user.value.id + '/' + mod.id + '/' + projectFile.value.name
    const { error: fileError } = await supabase.storage.from('mod-files').upload(path, projectFile.value)
    if (fileError) throw fileError
    const { error: versionError } = await supabase.from('mod_versions').insert({
      mod_id: mod.id, version_number: form.value.version,
      game_versions: form.value.gameVersions.split(',').map(x => x.trim()).filter(Boolean),
      file_path: path, file_name: projectFile.value.name, file_size: projectFile.value.size,
      loader: form.value.loader, release_notes: form.value.releaseNotes
    })
    if (versionError) throw versionError
    uploadMessage.value = 'Project submitted! It will appear publicly after moderation.'
    form.value = { title: '', summary: '', description: '', category: 'Technology', loader: 'NeoForge', version: '1.0.0', gameVersions: '1.21.1', releaseNotes: 'Initial release' }
    projectFile.value = null
    projectIcon.value = null
    await loadMyMods()
  } catch (e: any) { uploadMessage.value = e.message || 'Upload failed.' }
  finally { uploadBusy.value = false }
}
async function downloadVersion(mod: Mod) {
  if (!supabase) { alert('Connect Supabase to download project files.'); return }
  const versions = mod.mod_versions || []
  const version = versions[0]
  if (!version) { alert('No published release found.'); return }
  const { data, error } = await supabase.storage.from('mod-files').createSignedUrl(version.file_path, 60)
  if (error) { alert(error.message); return }
  window.open(data.signedUrl, '_blank', 'noopener')
  await supabase.from('mods').update({ downloads: (mod.downloads || 0) + 1 }).eq('id', mod.id)
  mod.downloads++
}
onMounted(async () => {
  if (supabase) {
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user || null
    username.value = user.value?.user_metadata?.username || user.value?.email?.split('@')[0] || ''
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user || null
      username.value = user.value?.user_metadata?.username || user.value?.email?.split('@')[0] || ''
    })
    await loadMods()
  }
  const hash = location.hash
  if (hash.startsWith('#/mod/')) {
    const slug = hash.slice(6)
    const found = mods.value.find(m => m.slug === slug)
    if (found) openMod(found)
  } else if (hash === '#/login') page.value = 'login'
  else if (hash === '#/upload') page.value = 'upload'
  else if (hash === '#/dashboard') page.value = 'dashboard'
})
</script>

<template>
  <div class="min-h-screen bg-[#0b0912] text-[#f4efff]">
    <header class="sticky top-0 z-40 border-b border-white/[0.07] bg-[#0b0912]/90 backdrop-blur-xl">
      <div class="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
        <button class="flex items-center gap-3" @click="navigate('home')">
          <span class="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-300 to-violet-700 text-xl font-black text-white shadow-lg shadow-violet-900/40">M</span>
          <span class="font-display text-[21px] font-bold tracking-tight">Mine<span class="text-violet-400">Cart</span><span class="ml-2 rounded border border-violet-400/30 px-1.5 py-0.5 align-middle text-[9px] font-bold tracking-[.18em] text-violet-300">BETA</span></span>
        </button>
        <nav class="hidden items-center gap-8 text-[13px] font-semibold text-[#a9a1b8] md:flex">
          <button class="transition hover:text-white" @click="navigate('home')">Discover</button>
          <a href="#categories" @click="navigate('home')" class="transition hover:text-white">Categories</a>
          <button class="transition hover:text-white" @click="navigate('upload')">Publish a project</button>
        </nav>
        <div class="hidden items-center gap-3 md:flex">
          <template v-if="user">
            <button class="rounded-lg border border-white/10 px-3 py-2 text-xs text-[#c8bfd5] hover:border-violet-400/50" @click="navigate('dashboard')">Dashboard</button>
            <button class="flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2.5 text-xs font-bold hover:bg-violet-400" @click="signOut"><CircleUserRound :size="15"/> {{ username || 'Account' }} · Sign out</button>
          </template>
          <template v-else>
            <button class="text-xs font-bold text-[#c8bfd5] hover:text-white" @click="navigate('login')">Log in</button>
            <button class="rounded-lg bg-violet-500 px-4 py-2.5 text-xs font-bold shadow-lg shadow-violet-900/30 hover:bg-violet-400" @click="navigate('login'); authMode='signup'">Create account <ArrowUpRight :size="14" class="inline"/></button>
          </template>
        </div>
        <button class="rounded-lg border border-white/10 p-2 md:hidden" @click="mobileMenu=!mobileMenu"><Menu v-if="!mobileMenu"/><X v-else/></button>
      </div>
      <div v-if="mobileMenu" class="border-t border-white/10 bg-[#100d18] p-4 md:hidden">
        <div class="flex flex-col gap-4 text-sm text-[#c9bfd4]">
          <button @click="navigate('home')">Discover</button><button @click="navigate('upload')">Publish a project</button>
          <button @click="navigate(user ? 'dashboard' : 'login')">{{ user ? 'Dashboard' : 'Log in / Sign up' }}</button>
        </div>
      </div>
    </header>

    <main v-if="page==='home'">
      <section class="hero-grid relative overflow-hidden border-b border-white/[0.06]">
        <div class="pointer-events-none absolute -right-40 top-0 h-[550px] w-[700px] rounded-full bg-violet-700/10 blur-[120px]"></div>
        <div class="relative mx-auto grid min-h-[570px] max-w-[1240px] items-center gap-10 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
          <div>
            <div class="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/[0.08] px-3 py-2 text-[10px] font-bold tracking-[.2em] text-violet-200"><Sparkles :size="13"/> THE MODDING UNIVERSE, CONNECTED</div>
            <h1 class="font-display text-[clamp(3.6rem,7vw,6.6rem)] font-bold leading-[.94] tracking-[-.075em]">Your next<br/><span class="bg-gradient-to-r from-violet-200 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">adventure</span><br/>starts here.</h1>
            <p class="mt-7 max-w-[490px] text-[15px] leading-8 text-[#a79eb5]">Discover the mods that make Minecraft yours. Explore community creations, find your perfect setup, and share what you build.</p>
            <div class="mt-9 flex flex-wrap gap-3">
              <a href="#browse" class="inline-flex items-center gap-3 rounded-lg bg-violet-500 px-6 py-4 text-sm font-bold shadow-xl shadow-violet-950/40 transition hover:-translate-y-0.5 hover:bg-violet-400">Explore mods <ArrowRight :size="17"/></a>
              <button class="inline-flex items-center gap-3 rounded-lg border border-white/15 bg-white/[0.03] px-6 py-4 text-sm font-bold text-[#e3d9ef] transition hover:border-violet-300/50" @click="navigate('upload')"><CloudUpload :size="17"/> Publish your work</button>
            </div>
            <div class="mt-8 flex items-center gap-3 text-[11px] text-[#81788e]"><span class="flex -space-x-2"><i class="h-6 w-6 rounded-full border-2 border-[#0b0912] bg-violet-400"></i><i class="h-6 w-6 rounded-full border-2 border-[#0b0912] bg-fuchsia-400"></i><i class="h-6 w-6 rounded-full border-2 border-[#0b0912] bg-cyan-400"></i></span> Made by players. For players.</div>
          </div>
          <div class="relative mx-auto hidden h-[410px] w-full max-w-[500px] items-center justify-center lg:flex">
            <div class="absolute h-[340px] w-[340px] rounded-full border border-violet-300/15 shadow-[0_0_100px_rgba(139,92,246,.12)]"></div>
            <div class="absolute h-[270px] w-[420px] rotate-[-24deg] rounded-[50%] border border-violet-300/20"></div>
            <div class="relative grid h-52 w-52 rotate-[-8deg] place-items-center rounded-[2.5rem] border border-white/20 bg-gradient-to-br from-violet-300 via-violet-600 to-indigo-900 text-8xl font-black shadow-[24px_28px_0_#321d5f,0_45px_90px_rgba(124,58,237,.45)]">M</div>
            <div class="absolute right-0 top-16 rounded-xl border border-white/10 bg-[#191426]/90 px-4 py-3 text-xs text-violet-100 shadow-2xl"><Sparkles class="mr-2 inline text-violet-300" :size="14"/> Fresh builds, every day</div>
            <div class="absolute bottom-12 left-0 rounded-xl border border-white/10 bg-[#191426]/90 px-4 py-3 text-xs text-[#c5b9d4] shadow-2xl"><Zap class="mr-2 inline text-amber-300" :size="14"/> Made for your next world</div>
          </div>
        </div>
        <div class="mx-auto flex max-w-[1240px] flex-wrap gap-x-12 gap-y-3 border-t border-white/[0.06] px-5 py-6 text-[10px] font-extrabold tracking-[.2em] text-[#5f586b] lg:px-8"><span>MODS</span><span>MODPACKS</span><span>RESOURCE PACKS</span><span>SHADERS</span><span>DATAPACKS</span></div>
      </section>

      <section id="browse" class="mx-auto max-w-[1240px] px-5 py-24 lg:px-8">
        <div class="flex flex-wrap items-end justify-between gap-5"><div><div class="text-[10px] font-extrabold tracking-[.23em] text-violet-300">THE COMMUNITY LIBRARY</div><h2 class="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">Find your <span class="text-violet-400">next favorite.</span></h2><p class="mt-3 text-sm text-[#93899f]">Hand-picked projects and community favorites, all in one place.</p></div><div class="flex items-center gap-2 text-xs text-[#8f849c]"><span class="h-2 w-2 rounded-full" :class="backendReady ? 'bg-emerald-400' : 'bg-amber-400'"></span>{{ backendReady ? 'Live community library' : 'Preview catalog' }}</div></div>
        <div class="mt-9 flex h-14 items-center gap-3 rounded-xl border border-white/10 bg-[#15111e] px-4 text-[#847a92] focus-within:border-violet-400/60"><Search :size="19"/><input v-model="search" class="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-[#71687e]" placeholder="Search mods, creators, loaders..."/><kbd class="hidden rounded border border-white/10 px-2 py-1 text-[10px] sm:block">⌘ K</kbd></div>
        <div class="mt-4 flex flex-wrap gap-2"><button v-for="cat in categories" :key="cat" @click="activeCategory=cat" class="rounded-lg border px-3.5 py-2 text-[11px] font-semibold transition" :class="activeCategory===cat ? 'border-violet-400/60 bg-violet-500/15 text-violet-200' : 'border-white/10 bg-[#14111b] text-[#9b91a7] hover:border-white/25'">{{cat}}</button></div>
        <div class="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <article v-for="(mod,i) in filteredMods" :key="mod.id" @click="openMod(mod)" class="group cursor-pointer rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#191522] to-[#100d17] p-5 transition duration-200 hover:-translate-y-1 hover:border-violet-400/40">
            <div class="flex items-start justify-between"><div class="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-gradient-to-br text-xl font-black" :class="['from-violet-300 to-violet-700','from-sky-300 to-blue-700','from-emerald-300 to-teal-700','from-amber-200 to-orange-700','from-pink-300 to-rose-700','from-cyan-300 to-cyan-800'][i%6]"><img v-if="mod.icon_url" :src="mod.icon_url" class="h-full w-full object-cover"/><span v-else>{{['✧','◈','✦','⌘','◇','◉'][i%6]}}</span></div><span class="rounded-md border border-white/10 px-2 py-1 text-[9px] font-bold text-[#a99eb6]">{{mod.loader}}</span></div>
            <div class="mt-5 text-[9px] font-extrabold uppercase tracking-[.18em] text-violet-300">{{mod.category}}</div><h3 class="mt-2 flex items-center justify-between font-display text-lg font-semibold">{{mod.title}}<ArrowUpRight :size="16" class="text-[#71677d] transition group-hover:text-violet-300"/></h3><p class="mt-2 min-h-[42px] text-xs leading-6 text-[#968ca2]">{{mod.summary}}</p>
            <div class="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4 text-[10px] text-[#81788e]"><span>by {{mod.author}}</span><span class="flex items-center gap-1.5 text-[#bcb0cb]"><Download :size="13"/> {{formatDownloads(mod.downloads)}}</span></div>
          </article>
        </div>
        <div v-if="!filteredMods.length" class="rounded-xl border border-white/10 py-20 text-center text-sm text-[#8f849c]">No projects found. Try another search.</div>
      </section>
      <section id="categories" class="border-y border-white/[0.06] bg-[#100d17]"><div class="mx-auto max-w-[1240px] px-5 py-20 lg:px-8"><div class="text-[10px] font-extrabold tracking-[.23em] text-violet-300">EXPLORE YOUR WAY</div><h2 class="mt-3 font-display text-4xl font-bold tracking-tight">Every world has a <span class="text-violet-400">style.</span></h2><div class="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4"><button v-for="(cat,i) in categories.slice(1)" :key="cat" @click="activeCategory=cat;document.getElementById('browse')?.scrollIntoView({behavior:'smooth'})" class="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#171320] p-4 text-left text-xs font-semibold text-[#ded5e9] transition hover:border-violet-400/40"><span class="grid h-9 w-9 place-items-center rounded-lg bg-violet-500/15 text-lg text-violet-200">{{['⚙','✦','✧','◈','⌘','▦','◇','◉'][i]}}</span>{{cat}}<ArrowUpRight :size="14" class="ml-auto text-[#756b81]"/></button></div></div></section>
      <section class="relative overflow-hidden bg-[#151020] py-20"><div class="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,.18),transparent_65%)]"></div><div class="relative mx-auto max-w-[1240px] px-5 lg:px-8"><div class="text-[10px] font-extrabold tracking-[.23em] text-violet-300">BUILT FOR CREATORS</div><h2 class="mt-4 font-display text-5xl font-bold leading-tight tracking-tight">Made something<br/>worth sharing?</h2><p class="mt-4 max-w-md text-sm leading-7 text-[#a49aae]">Give your project a home. Publish releases, reach players, and keep your community up to date.</p><button @click="navigate('upload')" class="mt-7 inline-flex items-center gap-3 rounded-lg bg-violet-500 px-6 py-4 text-sm font-bold hover:bg-violet-400">Become a creator <ArrowRight :size="17"/></button></div></section>
    </main>

    <main v-else-if="page==='login'" class="grid min-h-[calc(100vh-150px)] place-items-center bg-[radial-gradient(ellipse_at_50%_30%,rgba(124,58,237,.14),transparent_45%)] px-5 py-16">
      <div class="w-full max-w-[440px] rounded-2xl border border-white/10 bg-[#15111e] p-8 shadow-2xl shadow-black/30">
        <button @click="navigate('home')" class="mb-8 flex items-center gap-2 text-xs text-[#9b91a7] hover:text-white">← Back to MineCart</button>
        <div class="text-[10px] font-extrabold tracking-[.22em] text-violet-300">WELCOME TO THE COMMUNITY</div><h1 class="mt-3 font-display text-4xl font-bold">{{authMode==='login'?'Welcome back.':'Create your account.'}}</h1><p class="mt-3 text-xs leading-6 text-[#a49aae]">Sign in to publish projects, manage releases and follow your favorite creators.</p>
        <form class="mt-8 space-y-4" @submit.prevent="handleAuth">
          <label v-if="authMode==='signup'" class="block text-xs font-semibold text-[#c9bfd4]">Username<input v-model="username" required minlength="3" class="mt-2 w-full rounded-lg border border-white/10 bg-[#100d17] px-4 py-3 text-sm outline-none focus:border-violet-400" placeholder="Your creator name"/></label>
          <label class="block text-xs font-semibold text-[#c9bfd4]">Email<input v-model="email" required type="email" class="mt-2 w-full rounded-lg border border-white/10 bg-[#100d17] px-4 py-3 text-sm outline-none focus:border-violet-400" placeholder="you@example.com"/></label>
          <label class="block text-xs font-semibold text-[#c9bfd4]">Password<input v-model="password" required type="password" minlength="6" class="mt-2 w-full rounded-lg border border-white/10 bg-[#100d17] px-4 py-3 text-sm outline-none focus:border-violet-400" placeholder="At least 6 characters"/></label>
          <p v-if="authMessage" class="rounded-lg border border-violet-400/20 bg-violet-400/10 p-3 text-xs text-violet-200">{{authMessage}}</p>
          <button :disabled="authBusy" class="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-500 py-3.5 text-sm font-bold hover:bg-violet-400 disabled:opacity-50">{{authBusy?'Please wait…':authMode==='login'?'Log in':'Create account'}} <ArrowRight :size="16"/></button>
        </form>
        <p class="mt-6 text-center text-xs text-[#8f849c]">{{authMode==='login'?'New to MineCart?':'Already have an account?'}} <button class="font-bold text-violet-300" @click="authMode=authMode==='login'?'signup':'login';authMessage=''">{{authMode==='login'?'Create an account':'Log in'}}</button></p>
        <p v-if="!backendReady" class="mt-5 rounded-lg border border-amber-300/20 bg-amber-300/[0.07] p-3 text-[10px] leading-5 text-amber-100/80">Supabase is not configured yet. Add the two public Supabase environment values in GitHub Actions to activate accounts.</p>
      </div>
    </main>

    <main v-else-if="page==='upload'" class="mx-auto max-w-[960px] px-5 py-14 lg:px-8">
      <button @click="navigate('home')" class="mb-8 flex items-center gap-2 text-xs text-[#9b91a7] hover:text-white">← Back to discovery</button>
      <div class="text-[10px] font-extrabold tracking-[.22em] text-violet-300">CREATOR WORKSPACE</div><h1 class="mt-3 font-display text-5xl font-bold tracking-tight">Publish your <span class="text-violet-400">project.</span></h1><p class="mt-3 text-sm text-[#a49aae]">Share your work with the MineCart community. Your first release will be reviewed before it goes live.</p>
      <div class="mt-9 rounded-2xl border border-white/10 bg-[#15111e] p-6 md:p-8">
        <h2 class="mb-6 flex items-center gap-2 font-display text-lg font-semibold"><Package :size="19" class="text-violet-300"/> Project information</h2>
        <div class="grid gap-5 md:grid-cols-2">
          <label class="text-xs font-semibold text-[#c9bfd4] md:col-span-2">Project name<input v-model="form.title" class="field mt-2" placeholder="e.g. Better Adventures"/></label>
          <label class="text-xs font-semibold text-[#c9bfd4] md:col-span-2">Short description<input v-model="form.summary" maxlength="160" class="field mt-2" placeholder="What makes your project special?"/></label>
          <label class="text-xs font-semibold text-[#c9bfd4]">Category<select v-model="form.category" class="field mt-2"><option v-for="c in categories.slice(1)" :key="c">{{c}}</option></select></label>
          <label class="text-xs font-semibold text-[#c9bfd4]">Mod loader<select v-model="form.loader" class="field mt-2"><option>NeoForge</option><option>Forge</option><option>Fabric</option><option>Quilt</option><option>Quilt</option><option>Resource Pack</option><option>Datapack</option></select></label>
          <label class="text-xs font-semibold text-[#c9bfd4] md:col-span-2">Full description<textarea v-model="form.description" rows="4" class="field mt-2" placeholder="Tell players about features, dependencies and installation…"></textarea></label>
          <label class="text-xs font-semibold text-[#c9bfd4]">Minecraft versions<input v-model="form.gameVersions" class="field mt-2" placeholder="1.21.1, 1.21.2"/></label>
          <label class="text-xs font-semibold text-[#c9bfd4]">Release version<input v-model="form.version" class="field mt-2" placeholder="1.0.0"/></label>
          <label class="text-xs font-semibold text-[#c9bfd4] md:col-span-2">Release notes<textarea v-model="form.releaseNotes" rows="3" class="field mt-2" placeholder="What's new in this release?"></textarea></label>
          <label class="text-xs font-semibold text-[#c9bfd4] md:col-span-2">Project icon (optional)<input type="file" accept="image/png,image/jpeg,image/webp" class="mt-2 block w-full text-xs text-[#a49aae] file:mr-3 file:rounded-lg file:border-0 file:bg-violet-500/20 file:px-4 file:py-2 file:text-xs file:font-bold file:text-violet-200" @change="projectIcon=($event.target as HTMLInputElement).files?.[0]||null"/></label>
          <label class="text-xs font-semibold text-[#c9bfd4] md:col-span-2">Mod file (.jar or .zip)<input type="file" accept=".jar,.zip" required class="mt-2 block w-full rounded-xl border border-dashed border-violet-300/30 bg-violet-400/[0.05] p-5 text-xs text-[#a49aae] file:mr-3 file:rounded-lg file:border-0 file:bg-violet-500 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white" @change="projectFile=($event.target as HTMLInputElement).files?.[0]||null"/><span v-if="projectFile" class="mt-2 block text-[10px] text-emerald-300">Selected: {{projectFile.name}} · {{formatDownloads(projectFile.size)}} bytes</span></label>
        </div>
        <p v-if="uploadMessage" class="mt-5 rounded-lg border border-violet-400/20 bg-violet-400/10 p-3 text-xs text-violet-100">{{uploadMessage}}</p>
        <div class="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.07] pt-6"><span class="text-[10px] leading-5 text-[#81788e]">By publishing, you confirm that you own or have permission to share this content.</span><button @click="publishProject" :disabled="uploadBusy" class="inline-flex items-center gap-2 rounded-lg bg-violet-500 px-5 py-3 text-xs font-bold hover:bg-violet-400 disabled:opacity-50"><Upload :size="15"/> {{uploadBusy?'Uploading…':'Submit project'}}</button></div>
      </div>
      <div v-if="!user" class="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-xs text-amber-100/80">You need to <button class="font-bold underline" @click="navigate('login')">sign in</button> before submitting a project.</div>
    </main>

    <main v-else-if="page==='dashboard'" class="mx-auto max-w-[1100px] px-5 py-14 lg:px-8">
      <div class="flex flex-wrap items-end justify-between gap-4"><div><div class="text-[10px] font-extrabold tracking-[.22em] text-violet-300">YOUR CREATOR SPACE</div><h1 class="mt-3 font-display text-4xl font-bold">Dashboard</h1><p class="mt-2 text-xs text-[#a49aae]">Manage your projects and releases.</p></div><button @click="navigate('upload')" class="inline-flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-3 text-xs font-bold"><Plus :size="15"/> New project</button></div>
      <div class="mt-8 grid gap-3 sm:grid-cols-3"><div class="rounded-xl border border-white/10 bg-[#15111e] p-5"><Layers3 class="text-violet-300"/><div class="mt-4 font-display text-3xl font-bold">{{myMods.length}}</div><div class="mt-1 text-[10px] text-[#93899f]">Total projects</div></div><div class="rounded-xl border border-white/10 bg-[#15111e] p-5"><Download class="text-violet-300"/><div class="mt-4 font-display text-3xl font-bold">{{formatDownloads(myMods.reduce((n,m)=>n+m.downloads,0))}}</div><div class="mt-1 text-[10px] text-[#93899f]">Total downloads</div></div><div class="rounded-xl border border-white/10 bg-[#15111e] p-5"><ShieldCheck class="text-violet-300"/><div class="mt-4 font-display text-3xl font-bold">{{myMods.filter(m=>(m as any).status==='approved').length}}</div><div class="mt-1 text-[10px] text-[#93899f]">Approved projects</div></div></div>
      <div class="mt-10 overflow-hidden rounded-xl border border-white/10 bg-[#15111e]"><div class="border-b border-white/10 px-5 py-4 font-display font-semibold">Your projects</div><div v-if="!myMods.length" class="p-12 text-center text-xs text-[#93899f]">No projects yet. Publish your first creation.</div><div v-for="mod in myMods" :key="mod.id" class="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-4 last:border-0"><div><div class="font-semibold">{{mod.title}}</div><div class="mt-1 text-[10px] text-[#8d8299]">{{mod.loader}} · {{formatDownloads(mod.downloads)}} downloads</div></div><span class="rounded-md px-2.5 py-1 text-[9px] font-bold" :class="(mod as any).status==='approved'?'bg-emerald-400/10 text-emerald-300':(mod as any).status==='rejected'?'bg-rose-400/10 text-rose-300':'bg-amber-300/10 text-amber-200'">{{(mod as any).status || 'pending'}}</span></div></div>
    </main>

    <main v-else-if="page==='detail' && selectedMod" class="mx-auto max-w-[1100px] px-5 py-14 lg:px-8">
      <button @click="navigate('home')" class="mb-9 flex items-center gap-2 text-xs text-[#9b91a7] hover:text-white">← Back to discovery</button>
      <div class="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1b1528] to-[#100d17] p-7 md:p-10">
        <div class="flex flex-wrap items-start gap-5"><div class="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-violet-300 to-violet-800 text-4xl font-black"><img v-if="selectedMod.icon_url" :src="selectedMod.icon_url" class="h-full w-full rounded-2xl object-cover"/><span v-else>✦</span></div><div class="min-w-0 flex-1"><div class="text-[10px] font-bold uppercase tracking-[.2em] text-violet-300">{{selectedMod.category}} · {{selectedMod.loader}}</div><h1 class="mt-2 font-display text-4xl font-bold">{{selectedMod.title}}</h1><p class="mt-2 text-xs text-[#a49aae]">By {{selectedMod.author}} · {{formatDownloads(selectedMod.downloads)}} downloads</p></div><button @click="downloadVersion(selectedMod)" class="inline-flex items-center gap-2 rounded-lg bg-violet-500 px-5 py-3 text-xs font-bold"><ArrowDownToLine :size="16"/> Download</button></div>
        <p class="mt-8 max-w-3xl text-sm leading-8 text-[#c0b6cd]">{{selectedMod.description || selectedMod.summary}}</p>
        <div class="mt-8 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-3"><div><div class="text-[9px] uppercase tracking-widest text-[#81788e]">Mod loader</div><div class="mt-1 text-sm font-semibold">{{selectedMod.loader}}</div></div><div><div class="text-[9px] uppercase tracking-widest text-[#81788e]">Category</div><div class="mt-1 text-sm font-semibold">{{selectedMod.category}}</div></div><div><div class="text-[9px] uppercase tracking-widest text-[#81788e]">Game versions</div><div class="mt-1 text-sm font-semibold">{{selectedMod.game_versions?.join(', ') || 'See release notes'}}</div></div></div>
      </div>
      <div class="mt-8 rounded-xl border border-white/10 bg-[#15111e] p-6"><h2 class="font-display text-lg font-semibold">Versions</h2><div v-if="!selectedMod.mod_versions?.length" class="mt-5 text-xs text-[#93899f]">Release files will appear here once the creator publishes a version.</div><div v-for="version in selectedMod.mod_versions" :key="version.id" class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4"><div><div class="text-sm font-semibold">{{version.version_number}}</div><div class="mt-1 text-[10px] text-[#8f849c]">{{version.file_name}} · {{version.loader}}</div></div><button @click="downloadVersion(selectedMod)" class="rounded-lg border border-white/10 px-4 py-2 text-xs font-bold hover:border-violet-400/50">Download <Download class="ml-1 inline" :size="13"/></button></div></div>
    </main>

    <footer class="border-t border-white/[0.07] bg-[#09070e] px-5 py-8 text-center text-[10px] text-[#71687e]"><div class="mb-2 font-display text-lg font-bold text-[#dcd2e8]">Mine<span class="text-violet-400">Cart</span></div><p>Built for the Minecraft community. Not affiliated with Mojang or Microsoft.</p><p class="mt-2">© 2026 MineCart · Crafted by DeathAmir</p></footer>
  </div>
</template>