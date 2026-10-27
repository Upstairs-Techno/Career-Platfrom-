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
}): Promise<void> {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  const from = Deno.env.get('APP_EMAIL_FROM') || 'hr@upstairstechno.com'

  if (!apiKey) {
    console.warn('[EMAIL DISABLED] RESEND_API_KEY not set. Would send to:', opts.to, '| Subject:', opts.subject)
    return
  }

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `UPSTAIRS TECHNO <${from}>`,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    // Log error but DO NOT throw — email failure must not roll back DB operations
    console.error(`[EMAIL ERROR] Status ${response.status}: ${body}`)
  }
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
