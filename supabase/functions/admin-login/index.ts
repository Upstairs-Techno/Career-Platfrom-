// Resolves the legacy login ID on the server, then delegates password checking
// and session issuance to Supabase Auth. No password or service key reaches the browser.
import { corsResponse, errorResponse, handleOptions } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/auth.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleOptions()
  if (req.method !== 'POST') return errorResponse('Method not allowed', 405)

  try {
    const body = await req.json()
    const loginId = typeof body.loginId === 'string' ? body.loginId.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    if (!loginId || !password || loginId.length > 100 || password.length > 1024) {
      return errorResponse('Invalid login ID or password.', 401)
    }

    const service = createServiceClient()
    const { data: admin } = await service
      .from('admins')
      .select('id, login_id, name, email, role, active, supabase_user_id')
      .eq('login_id', loginId)
      .maybeSingle()

    // Keep the response identical for unknown, disabled, or unmigrated accounts.
    if (!admin?.active || !admin.email || !admin.supabase_user_id) {
      return errorResponse('Invalid login ID or password.', 401)
    }

    const publicKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')
    if (!publicKey) {
      console.error('[ADMIN LOGIN] Supabase public Auth key is not configured for this function.')
      return errorResponse('Administrator sign-in is not configured.', 503)
    }

    const authClient = createClient(Deno.env.get('SUPABASE_URL')!, publicKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { data, error } = await authClient.auth.signInWithPassword({
      email: admin.email,
      password,
    })

    if (error || !data.session || data.user.id !== admin.supabase_user_id) {
      return errorResponse('Invalid login ID or password.', 401)
    }

    return corsResponse({
      admin: {
        id: admin.id,
        loginId: admin.login_id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
    })
  } catch (err) {
    console.error('[ADMIN LOGIN ERROR]', err)
    return errorResponse('Unable to sign in. Please try again.', 500)
  }
})
