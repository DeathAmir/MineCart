import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

// Publishable keys are intended for browser use. Never expose a service_role key here.
export const supabase = url && publishableKey ? createClient(url, publishableKey) : null
export const backendReady = Boolean(supabase)
