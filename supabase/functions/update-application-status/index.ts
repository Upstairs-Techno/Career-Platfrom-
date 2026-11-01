// supabase/functions/update-application-status/index.ts
// ADMIN protected — updates application status + remarks, records history,
// sends email notifications for SELECTED and COMPLETED transitions.
// Status update + history insert execute in one DB transaction via RPC.
// Email fires AFTER successful DB commit (non-blocking).

import { corsResponse, errorResponse, handleOptions } from '../_shared/cors.ts'
import { requireAdmin, createServiceClient, AuthError } from '../_shared/auth.ts'
import { APPLICATION_STATUSES } from '../_shared/validation.ts'
import { sendSelectionNotification, sendCompletionNotification } from '../_shared/email.ts'

function hasUnsafeText(value: string): boolean {
  return /[<>]/.test(value) || [...value].some((character) => {
    const code = character.charCodeAt(0)
    return code < 32 || code === 127
  })
}

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

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return errorResponse('The submitted JSON is malformed.', 400)
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return errorResponse('Invalid update data.', 400)
    const values = body as Record<string, unknown>
    const newStatus = typeof values.status === 'string' ? values.status.trim().toUpperCase() : ''
    const remarks = typeof values.remarks === 'string' ? values.remarks.trim() : ''
    if (values.remarks !== undefined && typeof values.remarks !== 'string') return errorResponse('Remarks must be text.', 422)
    if (remarks.length > 1000 || hasUnsafeText(remarks)) return errorResponse('Remarks must be 1,000 characters or fewer and contain plain text.', 422)

    if (!(APPLICATION_STATUSES as readonly string[]).includes(newStatus)) {
      return errorResponse(`Invalid status. Must be one of: ${APPLICATION_STATUSES.join(', ')}.`, 400)
    }

    if (!/^(OJT|INT)-\d{4}-\d{5}$/.test(applicationId)) {
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
