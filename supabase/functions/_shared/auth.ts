// supabase/functions/_shared/auth.ts
// Admin authentication helper — verifies caller is an active admin in our admins table.
// Used by all protected Edge Functions.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface AdminCaller {
  adminId: number
  loginId: string
  name: string
  role: string
}

/**
 * Verifies the Authorization bearer token is a valid Supabase Auth JWT,
 * then checks that the corresponding user_id exists in the admins table
 * with active = true.
 *
 * Returns the admin record or throws with an appropriate HTTP status.
 */
export async function requireAdmin(request: Request): Promise<AdminCaller> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError('Missing or malformed Authorization header.', 401)
  }

  const token = authHeader.replace('Bearer ', '').trim()

  // Create a client scoped to the caller's token for auth verification
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = getServerSecretKey()

  // Use service role to verify token and look up admin
  const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Verify the JWT with Supabase Auth
  const { data: { user }, error: authError } = await adminClient.auth.getUser(token)

  if (authError || !user) {
    throw new AuthError('Invalid or expired authentication token.', 401)
  }

  // Look up the admin record matching the Supabase Auth user ID
  const { data: admin, error: dbError } = await adminClient
    .from('admins')
    .select('id, login_id, name, role, active')
    .eq('supabase_user_id', user.id)
    .single()

  if (dbError || !admin) {
    throw new AuthError('Administrator account not found.', 403)
  }

  if (!admin.active) {
    throw new AuthError('This administrator account has been deactivated.', 403)
  }

  return {
    adminId: admin.id,
    loginId: admin.login_id,
    name: admin.name,
    role: admin.role,
  }
}

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * Creates a service-role Supabase client (bypasses RLS).
 * Only use inside Edge Functions for privileged operations after auth check.
 */
export function createServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    getServerSecretKey(),
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

function getServerSecretKey(): string {
  const key = Deno.env.get('SUPABASE_SECRET_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!key) throw new Error('Supabase server-side secret is not configured.')
  return key
}
