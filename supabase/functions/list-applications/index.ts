// supabase/functions/list-applications/index.ts
// ADMIN protected — lists OJT or Internship applications with filters.
// Query params: type=ojt|internship, status=, track=|domain=, q= (search)
// Preserves OjtService.listAll() and InternshipService.listAll() output shape.

import { corsResponse, errorResponse, handleOptions } from '../_shared/cors.ts'
import { requireAdmin, createServiceClient, AuthError } from '../_shared/auth.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleOptions()
  if (req.method !== 'GET') return errorResponse('Method not allowed', 405)

  try {
    await requireAdmin(req)

    const url    = new URL(req.url)
    const type   = url.searchParams.get('type') || 'ojt'
    const status = url.searchParams.get('status') || ''
    const filter = url.searchParams.get('track') || url.searchParams.get('domain') || ''
    const q      = url.searchParams.get('q') || ''

    if (!['ojt', 'internship'].includes(type)) {
      return errorResponse("Parameter 'type' must be 'ojt' or 'internship'.", 400)
    }

    const supabase = createServiceClient()
    const table    = type === 'ojt' ? 'ojt_applications' : 'internship_applications'
    const filterCol = type === 'ojt' ? 'track' : 'domain'
    const durationCol = type === 'ojt' ? 'duration_weeks' : 'duration_months'
    const modeCol  = type === 'ojt' ? 'training_mode' : 'mode'

    let query = supabase
      .from(table)
      .select(`
        application_id,
        ${durationCol},
        ${modeCol},
        ${filterCol},
        referral_code_id,
        status,
        remarks,
        resume_path,
        resume_file_name,
        resume_file_size,
        created_at,
        students!inner (
          name, email, mobile, college, course
        ),
        referral_codes (
          code
        )
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status.toUpperCase())
    }
    if (filter) {
      query = query.eq(filterCol, filter.toUpperCase())
    }
    if (q) {
      const like = `%${q.toLowerCase()}%`
      // Filter server-side by search term across multiple student fields
      query = query.or(
        `application_id.ilike.${like},` +
        `students.name.ilike.${like},` +
        `students.email.ilike.${like},` +
        `students.mobile.ilike.${like},` +
        `students.college.ilike.${like}`
      )
    }

    const { data, error } = await query

    if (error) {
      console.error('[LIST APPLICATIONS ERROR]', error)
      return errorResponse('Failed to fetch applications.', 500)
    }

    // Shape to match ApplicationListItem DTO
    const items = (data || []).map((row: Record<string, unknown>) => {
      const student = row.students as Record<string, unknown>
      const referral = row.referral_codes as Record<string, unknown> | null
      const isOjt = type === 'ojt'
      const dur = isOjt
        ? `${row.duration_weeks} Weeks`
        : `${row.duration_months} Months`

      return {
        applicationId: row.application_id,
        studentName:   student?.name,
        email:         student?.email,
        phone:         student?.mobile,
        college:       student?.college,
        course:        student?.course,
        trackOrDomain: isOjt ? row.track : row.domain,
        duration:      dur,
        mode:          isOjt ? row.training_mode : row.mode,
        referralCode:  referral?.code || null,
        hasResume:     Boolean(row.resume_path),
        resumeFileName: row.resume_file_name || null,
        status:        row.status,
        submittedDate: row.created_at,
      }
    })

    return corsResponse(items)

  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, err.status)
    console.error('[LIST APPLICATIONS ERROR]', err)
    return errorResponse('An unexpected error occurred.', 500)
  }
})
