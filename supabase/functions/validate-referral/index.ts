// supabase/functions/validate-referral/index.ts
// PUBLIC endpoint — validates a referral code without consuming it.
// Preserves exact Spring Boot ReferralService.validate() semantics:
//   - Returns { valid: true, message: "Referral code applied successfully." }
//   - Returns { valid: false, message: "Invalid referral code." }
// Does NOT expose private referral holder information.

import { corsResponse, errorResponse, handleOptions } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/auth.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleOptions()
  if (req.method !== 'POST') return errorResponse('Method not allowed', 405)

  try {
    const body = await req.json()
    const code: string = (body.code || '').trim()

    if (!code) {
      return corsResponse({ valid: false, message: 'Invalid referral code.' })
    }

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('referral_codes')
      .select('id, active, expires_at, used_count, max_uses')
      .ilike('code', code)
      .single()

    if (error || !data) {
      return corsResponse({ valid: false, message: 'Invalid referral code.' })
    }

    // Replicate ReferralCode.isUsable() logic
    if (!data.active) {
      return corsResponse({ valid: false, message: 'Invalid referral code.' })
    }
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return corsResponse({ valid: false, message: 'Invalid referral code.' })
    }
    if (data.used_count >= data.max_uses) {
      return corsResponse({ valid: false, message: 'Invalid referral code.' })
    }

    return corsResponse({ valid: true, message: 'Referral code applied successfully.' })

  } catch (err) {
    console.error('[VALIDATE REFERRAL ERROR]', err)
    return corsResponse({ valid: false, message: 'Invalid referral code.' })
  }
})
