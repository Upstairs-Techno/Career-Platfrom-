// Protected worker for retrying durable company application notifications.
import { createServiceClient } from '../_shared/auth.ts'
import { dispatchApplicationNotifications } from '../_shared/notification-outbox.ts'
import { corsResponse, errorResponse, handleOptions } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleOptions()
  if (req.method !== 'POST') return errorResponse('Method not allowed.', 405)

  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!serviceRoleKey || req.headers.get('Authorization') !== `Bearer ${serviceRoleKey}`) {
    return errorResponse('Unauthorized.', 401)
  }

  try {
    const supabase = createServiceClient()
    const result = await dispatchApplicationNotifications(supabase, { maxEvents: 20 })
    return corsResponse({ ...result, message: 'Notification queue processed.' })
  } catch (error) {
    console.error('[APPLICATION NOTIFICATION WORKER] failed', error instanceof Error ? error.name : 'unknown_error')
    return errorResponse('Unable to process the notification queue.', 500)
  }
})
