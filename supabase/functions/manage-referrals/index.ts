// supabase/functions/manage-referrals/index.ts
// ADMIN protected — CRUD operations for referral codes.
// Preserves ReferralService and AdminReferralController behavior.

import { corsResponse, errorResponse, handleOptions } from '../_shared/cors.ts'
import { requireAdmin, createServiceClient, AuthError } from '../_shared/auth.ts'
import { normalizeIndianMobile } from '../_shared/validation.ts'

const ALPHANUMERIC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function hasUnsafeText(value: string): boolean {
  return /[<>]/.test(value) || [...value].some((character) => {
    const code = character.charCodeAt(0)
    return code < 32 || code === 127
  })
}

function generateUniqueCode(): string {
  let result = 'UPTECH'
  for (let i = 0; i < 4; i++) {
    result += ALPHANUMERIC.charAt(Math.floor(Math.random() * ALPHANUMERIC.length))
  }
  return result
}

function validateReferralRecord(record: Record<string, unknown>, usedCount = 0): string | null {
  const memberName = typeof record.memberName === 'string' ? record.memberName.trim() : ''
  const mobile = typeof record.mobileNumber === 'string' ? record.mobileNumber.trim() : ''
  const email = typeof record.email === 'string' ? record.email.trim() : ''
  if (!/^[\p{L}][\p{L}\p{M} .'-]{1,149}$/u.test(memberName)) return 'Enter a valid team member name.'
  if (!/^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(mobile)) return 'Enter a valid 10-digit Indian mobile number, optionally prefixed with +91.'
  if (email.length > 150 || !/^(?=.{1,150}$)[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/.test(email)) return 'Enter a valid email address.'
  if (!['Male', 'Female', 'Other', 'Prefer not to say'].includes(String(record.gender))) return 'Select a valid gender option.'
  if (record.code !== undefined && record.code !== null && record.code !== '' &&
      (typeof record.code !== 'string' || !/^[A-Z0-9_-]{2,50}$/i.test(record.code.trim()))) return 'Referral code must contain 2–50 letters, numbers, hyphens, or underscores.'
  if (record.description !== undefined && record.description !== null &&
      (typeof record.description !== 'string' || record.description.trim().length > 500 || hasUnsafeText(record.description))) return 'Description must be 500 characters or fewer and contain plain text.'
  const maxUses = record.maxUses
  if (typeof maxUses !== 'number' || !Number.isInteger(maxUses) || maxUses < Math.max(1, usedCount) || maxUses > 1000000) return `Max uses must be a whole number from ${Math.max(1, usedCount)} to 1,000,000.`
  if (record.expiresAt && (typeof record.expiresAt !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)?$/.test(record.expiresAt) || Number.isNaN(Date.parse(record.expiresAt)))) return 'Enter a valid expiry date.'
  if (record.active !== undefined && typeof record.active !== 'boolean') return 'Referral code status is invalid.'
  return null
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleOptions()

  try {
    const admin = await requireAdmin(req)
    const supabase = createServiceClient()
    const url = new URL(req.url)
    const idParam = url.searchParams.get('id')
    const id = idParam ? parseInt(idParam, 10) : null

    // Helper to map DB row to ReferralCodeResponse
    async function mapToResponse(rc: any) {
      const [{ count: ojtCount }, { count: intCount }] = await Promise.all([
        supabase
          .from('ojt_applications')
          .select('*', { count: 'exact', head: true })
          .eq('referral_code_id', rc.id),
        supabase
          .from('internship_applications')
          .select('*', { count: 'exact', head: true })
          .eq('referral_code_id', rc.id)
      ])

      return {
        id: rc.id,
        code: rc.code,
        memberName: rc.member_name,
        mobileNumber: rc.mobile_number,
        email: rc.email,
        gender: rc.gender,
        description: rc.description,
        maxUses: rc.max_uses,
        usedCount: rc.used_count,
        remainingUses: Math.max(0, rc.max_uses - rc.used_count),
        expiresAt: rc.expires_at,
        active: rc.active,
        createdBy: rc.created_by,
        createdAt: rc.created_at,
        ojtApplications: ojtCount || 0,
        internshipApplications: intCount || 0
      }
    }

    // -------------------------------------------------------------------------
    // GET: List all or get single
    // -------------------------------------------------------------------------
    if (req.method === 'GET') {
      if (id) {
        const { data, error } = await supabase
          .from('referral_codes')
          .select('*')
          .eq('id', id)
          .single()

        if (error || !data) {
          return errorResponse('Referral code not found.', 404)
        }
        return corsResponse(await mapToResponse(data))
      }

      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return errorResponse(error.message, 500)
      }

      const responses = await Promise.all((data || []).map(mapToResponse))
      return corsResponse(responses)
    }

    // -------------------------------------------------------------------------
    // POST: Create
    // -------------------------------------------------------------------------
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}))
      if (!body || typeof body !== 'object' || Array.isArray(body)) return errorResponse('Invalid referral data.', 400)
      const validationError = validateReferralRecord({ ...body, maxUses: body.maxUses ?? 100 })
      if (validationError) return errorResponse(validationError, 422)
      let code = body.code ? body.code.trim().toUpperCase() : ''

      if (!code) {
        let unique = false
        while (!unique) {
          code = generateUniqueCode()
          const { count } = await supabase
            .from('referral_codes')
            .select('*', { count: 'exact', head: true })
            .ilike('code', code)
          if (!count || count === 0) {
            unique = true
          }
        }
      } else {
        const { count } = await supabase
          .from('referral_codes')
          .select('*', { count: 'exact', head: true })
          .ilike('code', code)

        if (count && count > 0) {
          return errorResponse('This referral code already exists.', 400)
        }
      }

      const maxUses = body.maxUses ?? 100

      const createdBy = admin.name || admin.loginId || 'ADMIN'

      const insertPayload = {
        code,
        member_name: body.memberName.trim(),
        mobile_number: normalizeIndianMobile(body.mobileNumber.trim()),
        email: body.email.trim().toLowerCase(),
        gender: body.gender || null,
        description: body.description || null,
        max_uses: maxUses,
        used_count: 0,
        expires_at: body.expiresAt || null,
        active: body.active !== undefined ? Boolean(body.active) : true,
        created_by: createdBy
      }

      const { data, error } = await supabase
        .from('referral_codes')
        .insert(insertPayload)
        .select()
        .single()

      if (error) {
        return errorResponse(error.message, 500)
      }

      return corsResponse(await mapToResponse(data), 201)
    }

    // -------------------------------------------------------------------------
    // PUT: Update
    // -------------------------------------------------------------------------
    if (req.method === 'PUT') {
      const body = await req.json().catch(() => ({}))
      if (!body || typeof body !== 'object' || Array.isArray(body)) return errorResponse('Invalid referral data.', 400)
      const targetId = id || body.id
      if (!targetId) {
        return errorResponse('Referral code ID is required for update.', 400)
      }

      const { data: existing, error: findError } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('id', targetId)
        .single()

      if (findError || !existing) {
        return errorResponse('Referral code not found.', 404)
      }

      const candidate = {
        memberName: body.memberName !== undefined ? body.memberName : existing.member_name,
        mobileNumber: body.mobileNumber !== undefined ? body.mobileNumber : existing.mobile_number,
        email: body.email !== undefined ? body.email : existing.email,
        gender: body.gender !== undefined ? body.gender : existing.gender,
        code: body.code !== undefined ? body.code : existing.code,
        description: body.description !== undefined ? body.description : existing.description,
        maxUses: body.maxUses !== undefined ? body.maxUses : existing.max_uses,
        expiresAt: body.expiresAt !== undefined ? body.expiresAt : existing.expires_at,
        active: body.active !== undefined ? body.active : existing.active,
      }
      const validationError = validateReferralRecord(candidate, existing.used_count)
      if (validationError) return errorResponse(validationError, 422)

      const updates: Record<string, any> = {}

      if (typeof body.code === 'string' && body.code.trim()) {
        const newCode = body.code.trim().toUpperCase()
        if (newCode.toLowerCase() !== existing.code.toLowerCase()) {
          const { count } = await supabase
            .from('referral_codes')
            .select('*', { count: 'exact', head: true })
            .ilike('code', newCode)

          if (count && count > 0) {
            return errorResponse('This referral code already exists.', 400)
          }
          updates.code = newCode
        }
      }

      if (body.memberName !== undefined) updates.member_name = body.memberName.trim()
      if (body.mobileNumber !== undefined) updates.mobile_number = normalizeIndianMobile(body.mobileNumber.trim())
      if (body.email !== undefined) updates.email = body.email.trim().toLowerCase()
      if (body.gender !== undefined) updates.gender = body.gender
      if (body.description !== undefined) updates.description = typeof body.description === 'string' ? body.description.trim() || null : null
      if (body.maxUses !== undefined) {
        const maxUses = body.maxUses
        if (maxUses < existing.used_count) {
          return errorResponse(`Max uses cannot be less than the current used count (${existing.used_count}).`, 400)
        }
        updates.max_uses = maxUses
      }
      if (body.expiresAt !== undefined) updates.expires_at = body.expiresAt || null
      if (body.active !== undefined) updates.active = Boolean(body.active)

      const { data: updated, error: updateError } = await supabase
        .from('referral_codes')
        .update(updates)
        .eq('id', targetId)
        .select()
        .single()

      if (updateError) {
        return errorResponse(updateError.message, 500)
      }

      return corsResponse(await mapToResponse(updated))
    }

    // -------------------------------------------------------------------------
    // DELETE: Delete (blocked if used)
    // -------------------------------------------------------------------------
    if (req.method === 'DELETE') {
      if (!id) {
        return errorResponse('Referral code ID is required.', 400)
      }

      const { data: existing, error: findError } = await supabase
        .from('referral_codes')
        .select('id, used_count')
        .eq('id', id)
        .single()

      if (findError || !existing) {
        return errorResponse('Referral code not found.', 404)
      }

      if (existing.used_count > 0) {
        return errorResponse('Cannot delete a referral code that has already been used. Deactivate it instead.', 400)
      }

      const { error: deleteError } = await supabase
        .from('referral_codes')
        .delete()
        .eq('id', id)

      if (deleteError) {
        return errorResponse(deleteError.message, 500)
      }

      return corsResponse({ message: 'Referral code deleted successfully.' })
    }

    return errorResponse('Method not allowed', 405)
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, err.status)
    console.error('[MANAGE REFERRALS ERROR]', err)
    return errorResponse('An unexpected error occurred.', 500)
  }
})
