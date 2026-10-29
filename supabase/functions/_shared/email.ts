// supabase/functions/_shared/email.ts
// Email notification via Resend API — preserves existing Spring Mail templates exactly.

const RESEND_API_URL = 'https://api.resend.com/emails'

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]!)
}

async function sendEmail(opts: {
  to: string
  subject: string
  html: string
  text: string
  idempotencyKey?: string
}): Promise<void> {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  const from = Deno.env.get('APP_EMAIL_FROM') || 'hr@upstairstechno.com'

  if (!apiKey) {
    throw new EmailDeliveryError('provider_not_configured')
  }
  if (/[\r\n]/.test(from) || /[\r\n]/.test(opts.to) || /[\r\n]/.test(opts.subject)) {
    throw new EmailDeliveryError('invalid_email_header')
  }

  let response: Response
  try {
    response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(opts.idempotencyKey ? { 'Idempotency-Key': opts.idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from: `UPSTAIRS TECHNO <${from}>`,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      }),
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    throw new EmailDeliveryError('provider_unavailable')
  }

  if (!response.ok) {
    // Provider response bodies can contain submitted data; never log them.
    throw new EmailDeliveryError(`provider_http_${response.status}`)
  }
}

export class EmailDeliveryError extends Error {
  readonly code: string

  constructor(code: string) {
    super('Email notification delivery failed.')
    this.name = 'EmailDeliveryError'
    this.code = code
  }
}

export interface CompanyApplicationNotification {
  notificationId: string
  applicationId: string
  applicationType: 'OJT' | 'INTERNSHIP'
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  programTitle: string
  submittedAt: string
}

function safePlainText(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim()
}

/** Notify the company for a newly persisted application using the durable outbox ID for deduplication. */
export async function sendCompanyApplicationNotification(
  application: CompanyApplicationNotification,
): Promise<void> {
  const recipient = Deno.env.get('APPLICATION_NOTIFICATION_EMAIL')
  if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    throw new EmailDeliveryError('recipient_not_configured')
  }

  const title = safePlainText(application.programTitle)
  const subject = `New Job Application Received – ${title}`
  const safeName = escapeHtml(safePlainText(application.applicantName))
  const safeEmail = escapeHtml(safePlainText(application.applicantEmail))
  const safePhone = escapeHtml(safePlainText(application.applicantPhone))
  const safeTitle = escapeHtml(title)
  const safeApplicationId = escapeHtml(safePlainText(application.applicationId))
  const safeSubmittedAt = escapeHtml(new Date(application.submittedAt).toISOString())
  const text = [
    'A new application has been received.',
    `Applicant: ${safePlainText(application.applicantName)}`,
    `Email: ${safePlainText(application.applicantEmail)}`,
    `Phone: ${safePlainText(application.applicantPhone)}`,
    `Program / job title: ${title}`,
    `Application type: ${application.applicationType}`,
    `Application ID: ${safePlainText(application.applicationId)}`,
    `Submitted: ${safeSubmittedAt}`,
  ].join('\n')
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#172033">
      <h2 style="color:#1e3a5f;margin:0 0 8px">UPSTAIRS TECHNO</h2>
      <p style="color:#475569;margin:0 0 20px">A new application has been received.</p>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0"><strong>Applicant</strong></td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${safeName}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0"><strong>Email</strong></td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${safeEmail}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0"><strong>Phone</strong></td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${safePhone}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0"><strong>Program / job title</strong></td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${safeTitle}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0"><strong>Application type</strong></td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${application.applicationType}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0"><strong>Application ID</strong></td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${safeApplicationId}</td></tr>
        <tr><td style="padding:8px"><strong>Submitted</strong></td><td style="padding:8px">${safeSubmittedAt}</td></tr>
      </table>
      <p style="font-size:12px;color:#64748b;margin-top:20px">Review applicant documents through the authenticated admin portal.</p>
    </div>`

  await sendEmail({
    to: recipient,
    subject,
    html,
    text,
    idempotencyKey: `application-notification-${application.notificationId}`,
  })
}

/** Sent immediately after OJT or Internship application is submitted */
export async function sendApplicationReceived(
  toEmail: string,
  studentName: string,
  applicationId: string,
  programName: 'OJT' | 'INTERNSHIP',
): Promise<void> {
  const programLabel = programName === 'OJT' ? 'OJT' : 'Internship'
  const safeName = escapeHtml(studentName)
  const safeApplicationId = escapeHtml(applicationId)
  const subject = 'UPSTAIRS TECHNO — Application Received'
  const text = `Dear ${studentName},\n\nThank you for applying for the UPSTAIRS TECHNO ${programLabel} program.\nApplication ID: ${applicationId}\n\nOur team will review your application and contact you regarding the next steps.\n\nRegards,\nUPSTAIRS TECHNO`
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#1e3a5f">UPSTAIRS TECHNO</h2>
      <p>Dear <strong>${safeName}</strong>,</p>
      <p>Thank you for applying for the <strong>UPSTAIRS TECHNO ${programLabel}</strong> program.</p>
      <div style="background:#f0f4ff;border-left:4px solid #2563eb;padding:12px 16px;border-radius:4px;margin:16px 0">
        <strong>Application ID:</strong> ${safeApplicationId}
      </div>
      <p>Our team will review your application and contact you regarding the next steps.</p>
      <p>Regards,<br/><strong>UPSTAIRS TECHNO</strong></p>
    </div>`

  await sendEmail({ to: toEmail, subject, html, text })
}

/** Sent when application status changes to SELECTED */
export async function sendSelectionNotification(
  toEmail: string,
  studentName: string,
  applicationId: string,
  programName: 'OJT' | 'INTERNSHIP',
): Promise<void> {
  const programLabel = programName === 'OJT' ? 'OJT' : 'Internship'
  const safeName = escapeHtml(studentName)
  const safeApplicationId = escapeHtml(applicationId)
  const subject = "UPSTAIRS TECHNO — You've Been Selected"
  const text = `Dear ${studentName},\n\nCongratulations! You have been selected for the UPSTAIRS TECHNO ${programLabel} program.\nApplication ID: ${applicationId}\n\nOur team will reach out with joining details shortly.\n\nRegards,\nUPSTAIRS TECHNO`
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#1e3a5f">UPSTAIRS TECHNO</h2>
      <p>Dear <strong>${safeName}</strong>,</p>
      <p>🎉 Congratulations! You have been <strong>selected</strong> for the <strong>UPSTAIRS TECHNO ${programLabel}</strong> program.</p>
      <div style="background:#f0fff4;border-left:4px solid #16a34a;padding:12px 16px;border-radius:4px;margin:16px 0">
        <strong>Application ID:</strong> ${safeApplicationId}
      </div>
      <p>Our team will reach out with joining details shortly.</p>
      <p>Regards,<br/><strong>UPSTAIRS TECHNO</strong></p>
    </div>`

  await sendEmail({ to: toEmail, subject, html, text })
}

/** Sent when application status changes to COMPLETED */
export async function sendCompletionNotification(
  toEmail: string,
  studentName: string,
  applicationId: string,
  programName: 'OJT' | 'INTERNSHIP',
): Promise<void> {
  const programLabel = programName === 'OJT' ? 'OJT' : 'Internship'
  const safeName = escapeHtml(studentName)
  const safeApplicationId = escapeHtml(applicationId)
  const subject = 'UPSTAIRS TECHNO — Program Completed'
  const text = `Dear ${studentName},\n\nCongratulations on completing the UPSTAIRS TECHNO ${programLabel} program.\nApplication ID: ${applicationId}\n\nCompletion documentation, where applicable, will be shared separately.\n\nRegards,\nUPSTAIRS TECHNO`
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#1e3a5f">UPSTAIRS TECHNO</h2>
      <p>Dear <strong>${safeName}</strong>,</p>
      <p>🎓 Congratulations on <strong>completing</strong> the <strong>UPSTAIRS TECHNO ${programLabel}</strong> program!</p>
      <div style="background:#fffbeb;border-left:4px solid #d97706;padding:12px 16px;border-radius:4px;margin:16px 0">
        <strong>Application ID:</strong> ${safeApplicationId}
      </div>
      <p>Completion documentation, where applicable, will be shared separately.</p>
      <p>Regards,<br/><strong>UPSTAIRS TECHNO</strong></p>
    </div>`

  await sendEmail({ to: toEmail, subject, html, text })
}
