// Validates recovery session token and updates the administrator's password securely.
// Verifies caller identity against both Supabase Auth and the active admins table.

import { corsResponse, errorResponse, handleOptions } from '../_shared/cors.ts'
import { createServiceClient, getServerSecretKey } from '../_shared/auth.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleOptions()
  if (req.method !== 'POST') return errorResponse('Method not allowed', 405)

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse('Invalid or expired password reset session. Please request a new link.', 401)
    }

    const token = authHeader.replace('Bearer ', '').trim()
    if (!token) {
      return errorResponse('Missing reset session token.', 401)
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return errorResponse('Invalid request body.', 400)
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return errorResponse('Invalid request payload.', 400)
    }

    const payload = body as Record<string, unknown>
    const newPassword = typeof payload.newPassword === 'string' ? payload.newPassword : ''

    if (!newPassword || newPassword.length < 8) {
      return errorResponse('Password must be at least 8 characters long.', 400)
    }

    if (newPassword.length > 128) {
      return errorResponse('Password must be 128 characters or fewer.', 400)
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return errorResponse(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
        400
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const service = createServiceClient()

    // Verify token with Supabase Auth
    const { data: { user }, error: authError } = await service.auth.getUser(token)
    if (authError || !user) {
      return errorResponse('Your password reset link is invalid or has expired. Please request a new link.', 401)
    }

    // Verify user is an active administrator in the admins table
    const { data: admin, error: adminError } = await service
      .from('admins')
      .select('id, login_id, email, active, supabase_user_id')
      .eq('supabase_user_id', user.id)
      .maybeSingle()

    if (adminError || !admin) {
      console.error('[ADMIN RESET PASSWORD] Admin row not found for user ID:', user.id)
      return errorResponse('Administrator account not found.', 403)
    }

    if (!admin.active) {
      return errorResponse('This administrator account has been deactivated. Please contact support.', 403)
    }

    // Update password via Supabase Admin Auth
    const { error: updateError } = await service.auth.admin.updateUserById(user.id, {
      password: newPassword,
    })

    if (updateError) {
      console.error('[ADMIN RESET PASSWORD] updateUserById failed:', updateError)
      return errorResponse('Unable to update password. Please try again.', 500)
    }

    return corsResponse({
      success: true,
      message: 'Password has been successfully updated. You can now sign in with your new password.',
    })
  } catch (err) {
    console.error('[ADMIN RESET PASSWORD UNHANDLED ERROR]', err)
    return errorResponse('Unable to reset password. Please try again later.', 500)
  }
})

