// Returns the caller's administrator profile only after server-side JWT and
// active-account verification.
import { corsResponse, errorResponse, handleOptions } from '../_shared/cors.ts'
import { requireAdmin, createServiceClient, AuthError } from '../_shared/auth.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleOptions()
  if (req.method !== 'GET') return errorResponse('Method not allowed', 405)

  try {
    const caller = await requireAdmin(req)
    const { data, error } = await createServiceClient()
      .from('admins')
      .select('id, login_id, name, email, role, active')
      .eq('id', caller.adminId)
      .single()

    if (error || !data?.active) return errorResponse('Administrator account not found.', 403)
    return corsResponse({
      id: data.id,
      loginId: data.login_id,
      name: data.name,
      email: data.email,
      role: data.role,
    })
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, err.status)
    console.error('[ADMIN PROFILE ERROR]', err)
    return errorResponse('Unable to load administrator profile.', 500)
  }
})
