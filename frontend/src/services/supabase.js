import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null

function configurationError() {
  const error = new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.')
  error.friendlyMessage = error.message
  return error
}

export async function invokeFunction(name, options = {}) {
  if (!supabase) throw configurationError()

  const { data, error, response } = await supabase.functions.invoke(name, { method: 'GET', ...options })
  if (!error) return { data, headers: response?.headers }

  let payload = data
  const status = error.context?.status
  if (!payload && error.context instanceof Response) {
    try {
      payload = await error.context.clone().json()
    } catch {
      payload = null
    }
  }

  const message = payload?.message || payload?.error || error.message || 'Something went wrong. Please try again later.'
  const normalized = new Error(message)
  normalized.response = { data: payload || { message }, status }
  normalized.friendlyMessage = status === 401
    ? 'Your session has expired. Please login again.'
    : message

  if (status === 401 && supabase.auth && !window.location.pathname.includes('/admin/login')) {
    await supabase.auth.signOut()
    if (window.location.pathname.startsWith('/admin')) window.location.href = '/admin/login'
  }

  throw normalized
}
