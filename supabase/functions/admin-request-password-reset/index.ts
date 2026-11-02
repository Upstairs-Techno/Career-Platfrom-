// Handles admin password recovery requests.
// Validates email, enforces rate limits, queries admins table,
// generates a secure time-limited Supabase recovery link, and dispatches the recovery email.
// Protects account existence by returning a generic success message even if email is unknown or inactive.

import { corsResponse, errorResponse, handleOptions } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/auth.ts'
import { sendPasswordResetEmail } from '../_shared/email.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// In-memory rate limiting: max 3 requests per 15 minutes per IP or email.
const rateLimitMap = new Map<string, { count: number; firstSeen: number }>()
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 3

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(key)
  if (!record) {
    rateLimitMap.set(key, { count: 1, firstSeen: now })
    return false
  }

  if (now - record.firstSeen > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, firstSeen: now })
    return false
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true
  }

  record.count += 1
  return false
}

// Cleanup rateLimitMap periodically
function cleanupRateLimitMap() {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value.firstSeen > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(key)
    }
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleOptions()
  if (req.method !== 'POST') return errorResponse('Method not allowed', 405)

  cleanupRateLimitMap()

  try {
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
    const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : ''

    if (!email || !EMAIL_REGEX.test(email) || email.length > 150) {
      return errorResponse('Please provide a valid administrator email address.', 400)
    }

    // Rate limiting by client IP and email
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                     req.headers.get('cf-connecting-ip') ||
                     'unknown-client'

    if (isRateLimited(`ip:${clientIp}`) || isRateLimited(`email:${email}`)) {
      return errorResponse(
        'Too many password recovery attempts. Please wait 15 minutes before trying again.',
        429
      )
    }

    const genericSuccess = {
      success: true,
      message: 'If an active administrator account is associated with this email address, a password recovery link has been sent to your email.',
    }

    const service = createServiceClient()

    // Query admins table for active admin with this email
    const { data: admin, error: dbError } = await service
      .from('admins')
      .select('id, login_id, name, email, active, supabase_user_id')
      .ilike('email', email)
      .maybeSingle()

    if (dbError) {
      console.error('[PASSWORD RESET ERROR] Admin query failure:', dbError)
      // Return generic success to avoid leaking internal errors or user existence
      return corsResponse(genericSuccess)
    }

    // Check account validity without leaking status
    if (!admin || !admin.active || !admin.email || !admin.supabase_user_id) {
      return corsResponse(genericSuccess)
    }

    // Determine site URL for redirect
    const origin = req.headers.get('origin') ||
                   req.headers.get('referer')?.replace(/\/$/, '') ||
                   'https://careers.upstairstechno.com'
    const redirectUrl = `${origin.replace(/\/$/, '')}/admin/reset-password`

    // Generate secure recovery link using Supabase Admin Auth
    const { data: linkData, error: linkError } = await service.auth.admin.generateLink({
      type: 'recovery',
      email: admin.email,
      options: {
        redirectTo: redirectUrl,
      },
    })

    if (linkError || !linkData?.properties?.action_link) {
      console.error('[PASSWORD RESET ERROR] generateLink error:', linkError)
      return corsResponse(genericSuccess)
    }

    const actionLink = linkData.properties.action_link

    // Dispatch recovery email via Resend
    try {
      await sendPasswordResetEmail(admin.email, admin.name, actionLink)
      console.log(`[PASSWORD RESET] Email dispatched successfully to ${admin.email}`)
    } catch (emailErr) {
      console.warn('[PASSWORD RESET] Resend dispatch failed or provider not configured:', emailErr)
      // Fallback: trigger Supabase built-in reset email if Resend is not configured
      try {
        const publicKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')
        if (publicKey) {
          const authClient = createClient(Deno.env.get('SUPABASE_URL')!, publicKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          })
          await authClient.auth.resetPasswordForEmail(admin.email, { redirectTo: redirectUrl })
        }
      } catch (fallbackErr) {
        console.error('[PASSWORD RESET] Fallback auth.resetPasswordForEmail failed:', fallbackErr)
      }
    }

    return corsResponse(genericSuccess)
  } catch (err) {
    console.error('[PASSWORD RESET UNHANDLED ERROR]', err)
    return errorResponse('Unable to process password reset request. Please try again later.', 500)
  }
})

