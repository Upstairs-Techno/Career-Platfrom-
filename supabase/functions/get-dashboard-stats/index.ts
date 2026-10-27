// supabase/functions/get-dashboard-stats/index.ts
// ADMIN protected — returns dashboard statistics.
// Preserves DashboardService.getStatistics() output exactly.

import { corsResponse, errorResponse, handleOptions } from '../_shared/cors.ts'
import { requireAdmin, createServiceClient, AuthError } from '../_shared/auth.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleOptions()
  if (req.method !== 'GET') return errorResponse('Method not allowed', 405)

  try {
    await requireAdmin(req)

    const supabase = createServiceClient()
    const { data, error } = await supabase.rpc('get_dashboard_statistics')

    if (error) {
      console.error('[DASHBOARD STATS ERROR]', error)
      return errorResponse('Failed to load dashboard statistics.', 500)
    }

    return corsResponse(data)

  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, err.status)
    console.error('[DASHBOARD STATS ERROR]', err)
    return errorResponse('An unexpected error occurred.', 500)
  }
})
