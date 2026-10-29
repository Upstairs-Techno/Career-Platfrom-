import { EmailDeliveryError, sendCompanyApplicationNotification } from './email.ts'
import { createServiceClient } from './auth.ts'

type OutboxOptions = {
  applicationId?: string
  maxEvents?: number
}

/** Claim and send persisted events. Failed events remain queued with backoff. */
export async function dispatchApplicationNotifications(
  supabase: ReturnType<typeof createServiceClient>,
  options: OutboxOptions = {},
): Promise<{ delivered: number; queued: number }> {
  let delivered = 0
  let queued = 0
  const maxEvents = Math.max(1, Math.min(options.maxEvents ?? 1, 20))

  for (let i = 0; i < maxEvents; i += 1) {
    const { data: events, error: claimError } = await supabase.rpc('claim_application_notification', {
      p_application_id: options.applicationId ?? null,
    })

    if (claimError) {
      console.error('[APPLICATION NOTIFICATION OUTBOX] claim failed', claimError.code || 'database_error')
      queued += 1
      break
    }

    const event = events?.[0]
    if (!event) break

    try {
      const relation = 'student:students(name,email,mobile)'
      const table = event.application_type === 'OJT' ? 'ojt_applications' : 'internship_applications'
      const titleColumn = event.application_type === 'OJT' ? 'track' : 'domain'
      const { data: application, error: applicationError } = await supabase
        .from(table)
        .select(`application_id, created_at, ${titleColumn}, ${relation}`)
        .eq('application_id', event.application_id)
        .maybeSingle()

      if (applicationError || !application?.student) {
        throw new EmailDeliveryError('application_data_unavailable')
      }

      const student = Array.isArray(application.student) ? application.student[0] : application.student
      if (!student?.name || !student?.email || !student?.mobile) {
        throw new EmailDeliveryError('applicant_data_unavailable')
      }

      const trackOrDomain = application[titleColumn]
        .split('_')
        .map((part: string) => part.charAt(0) + part.slice(1).toLowerCase())
        .join(' ')
      const program = event.application_type === 'OJT' ? 'OJT' : 'Internship'

      await sendCompanyApplicationNotification({
        notificationId: event.id,
        applicationId: event.application_id,
        applicationType: event.application_type,
        applicantName: student.name,
        applicantEmail: student.email,
        applicantPhone: student.mobile,
        programTitle: `${program} — ${trackOrDomain}`,
        submittedAt: application.created_at,
      })

      const { error: markSentError } = await supabase
        .from('application_notification_outbox')
        .update({ status: 'sent', sent_at: new Date().toISOString(), locked_at: null, last_error: null })
        .eq('id', event.id)
        .eq('status', 'processing')

      if (markSentError) {
        // Resend idempotency key makes this safe to retry after an uncertain response.
        console.error('[APPLICATION NOTIFICATION OUTBOX] delivery state update failed', event.id, markSentError.code || 'database_error')
        queued += 1
      } else {
        delivered += 1
      }
    } catch (error) {
      const errorCode = error instanceof EmailDeliveryError ? error.code : 'delivery_failed'
      const retrySeconds = Math.min(21_600, 30 * (2 ** Math.min(Math.max(event.attempts - 1, 0), 10)))
      const { error: retryError } = await supabase
        .from('application_notification_outbox')
        .update({
          status: 'pending',
          locked_at: null,
          next_attempt_at: new Date(Date.now() + retrySeconds * 1000).toISOString(),
          last_error: errorCode,
        })
        .eq('id', event.id)
        .eq('status', 'processing')

      console.error('[APPLICATION NOTIFICATION OUTBOX] delivery queued for retry', event.id, errorCode)
      if (retryError) {
        console.error('[APPLICATION NOTIFICATION OUTBOX] retry state update failed', event.id, retryError.code || 'database_error')
      }
      queued += 1
    }

    if (options.applicationId) break
  }

  return { delivered, queued }
}
