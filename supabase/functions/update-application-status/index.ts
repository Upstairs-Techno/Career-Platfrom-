// supabase/functions/update-application-status/index.ts
// ADMIN protected — updates application status + remarks, records history,
// sends email notifications for SELECTED and COMPLETED transitions.
// Status update + history insert execute in one DB transaction via RPC.
// Email fires AFTER successful DB commit (non-blocking).

import { corsResponse, errorResponse, handleOptions } from '../_shared/cors.ts'
import { requireAdmin, createServiceClient, AuthError } from '../_shared/auth.ts'
import { APPLICATION_STATUSES } from '../_shared/validation.ts'
import { sendSelectionNotification, sendCompletionNotification } from '../_shared/email.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleOptions()
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const admin = await requireAdmin(req)

    const url = new URL(req.url)
    const applicationId = url.searchParams.get('id') || ''

    if (!applicationId) {
      return errorResponse("Query parameter 'id' is required.", 400)
    }

    const body = await req.json()
    const newStatus: string = (body.status || '').trim().toUpperCase()
    const remarks: string = (body.remarks || '').trim()

    if (!(APPLICATION_STATUSES as readonly string[]).includes(newStatus)) {
      return errorResponse(`Invalid status. Must be one of: ${APPLICATION_STATUSES.join(', ')}.`, 400)
    }

    if (!applicationId.startsWith('OJT-') && !applicationId.startsWith('INT-')) {
      return errorResponse('Application not found.', 404)
    }

    const supabase = createServiceClient()
    const { data, error: updateError } = await supabase.rpc('admin_update_application_status', {
      p_application_id: applicationId,
      p_new_status: newStatus,
      p_remarks: remarks,
      p_changed_by: admin.loginId,
    })
    const updated = data?.[0]
    if (updateError || !updated) {
      if (updateError?.message?.includes('APPLICATION_NOT_FOUND')) {
        return errorResponse('Application not found.', 404)
      }
      console.error('[UPDATE STATUS ERROR]', updateError)
      return errorResponse('Failed to update application status.', 500)
    }

    // Send notification email AFTER successful DB commit
    if (newStatus === 'SELECTED') {
      sendSelectionNotification(updated.student_email, updated.student_name, applicationId, updated.application_type === 'OJT' ? 'OJT' : 'INTERNSHIP')
        .catch((e) => console.error('[EMAIL ERROR]', e))
    } else if (newStatus === 'COMPLETED') {
      sendCompletionNotification(updated.student_email, updated.student_name, applicationId, updated.application_type === 'OJT' ? 'OJT' : 'INTERNSHIP')
        .catch((e) => console.error('[EMAIL ERROR]', e))
    }

    return corsResponse({
      applicationId,
      status: newStatus,
      remarks: remarks || null,
      changedBy: admin.loginId,
      message: 'Application status updated successfully.',
      updatedAt: updated.updated_at,
    })

  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, err.status)
    console.error('[UPDATE APPLICATION STATUS ERROR]', err)
    return errorResponse('An unexpected error occurred.', 500)
  }
})
