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

/** Sent when an admin requests a password reset link */
export async function sendPasswordResetEmail(
  toEmail: string,
  adminName: string,
  resetLink: string,
): Promise<void> {
  const safeName = escapeHtml(adminName || 'Administrator')
  const safeResetLink = escapeHtml(resetLink)
  const subject = 'UPSTAIRS TECHNO — Password Reset Request'
  const text = `Hello ${adminName || 'Administrator'},\n\nWe received a request to reset your password for your UPSTAIRS TECHNO Admin account.\n\nPlease reset your password using the secure link below:\n${resetLink}\n\nThis link is valid for 1 hour. If you did not make this request, you can safely ignore this email.\n\nRegards,\nUPSTAIRS TECHNO Support Team`

  const html = `
    <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:580px;margin:0 auto;padding:32px 24px;background-color:#ffffff;color:#1e293b;border:1px solid #e2e8f0;border-radius:16px;">
      <div style="text-align:center;margin-bottom:28px;">
        <h2 style="color:#0077EE;font-size:24px;font-weight:800;letter-spacing:1px;margin:0 0 4px 0;">UPSTAIRS TECHNO</h2>
        <span style="display:inline-block;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#64748b;background:#f1f5f9;padding:4px 10px;border-radius:999px;">Admin Portal</span>
      </div>

      <div style="border-top:1px solid #f1f5f9;padding-top:24px;">
        <h3 style="color:#0f172a;font-size:18px;font-weight:700;margin:0 0 12px 0;">Password Reset Request</h3>
        <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 16px 0;">
          Hello <strong>${safeName}</strong>,
        </p>
        <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 24px 0;">
          We received a request to reset the password for your administrator account. Click the button below to choose a new, secure password:
        </p>

        <div style="text-align:center;margin:32px 0;">
          <a href="${safeResetLink}" style="display:inline-block;background:linear-gradient(135deg, #0077EE 0%, #0055BB 100%);color:#ffffff;font-size:14px;font-weight:700;padding:14px 28px;text-decoration:none;border-radius:12px;box-shadow:0 4px 12px rgba(0, 119, 238, 0.35);">
            Reset Admin Password
          </a>
        </div>

        <div style="background-color:#f8fafc;border-left:4px solid #0077EE;padding:14px 16px;border-radius:8px;margin:24px 0;">
          <p style="color:#64748b;font-size:13px;line-height:1.5;margin:0;">
            ⏳ <strong>Notice:</strong> This recovery link is time-limited and will expire in <strong>1 hour</strong>. For your security, do not forward or share this email with anyone.
          </p>
        </div>

        <p style="color:#94a3b8;font-size:12px;line-height:1.5;margin:24px 0 0 0;">
          If the button above does not work, copy and paste this URL into your browser:<br/>
          <a href="${safeResetLink}" style="color:#0077EE;word-break:break-all;">${safeResetLink}</a>
        </p>

        <p style="color:#94a3b8;font-size:12px;line-height:1.5;margin:16px 0 0 0;">
          If you did not request a password reset, you can safely ignore this email. Your existing credentials remain unchanged.
        </p>
      </div>

      <div style="border-top:1px solid #f1f5f9;margin-top:32px;padding-top:20px;text-align:center;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">
          &copy; ${new Date().getFullYear()} UPSTAIRS TECHNO. All rights reserved.
        </p>
      </div>
    </div>
  `

  await sendEmail({ to: toEmail, subject, html, text })
}
