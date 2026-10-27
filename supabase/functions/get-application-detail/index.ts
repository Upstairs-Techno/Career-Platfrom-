// supabase/functions/get-application-detail/index.ts
// ADMIN protected — gets full application detail including status history.
// Query param: id=OJT-2026-00001 or INT-2026-00001
// Preserves ApplicationDetailResponse shape exactly.

import { corsResponse, errorResponse, handleOptions } from '../_shared/cors.ts'
import { requireAdmin, createServiceClient, AuthError } from '../_shared/auth.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleOptions()
  if (req.method !== 'GET') return errorResponse('Method not allowed', 405)

  try {
    await requireAdmin(req)

    const url = new URL(req.url)
    const applicationId = url.searchParams.get('id') || ''

    if (!applicationId) {
      return errorResponse("Query parameter 'id' is required.", 400)
    }

    const isOjt        = applicationId.startsWith('OJT')
    const isInternship = applicationId.startsWith('INT')

    if (!isOjt && !isInternship) {
      return errorResponse('Application not found.', 404)
    }

    const supabase  = createServiceClient()
    const table     = isOjt ? 'ojt_applications' : 'internship_applications'
    const filterCol = isOjt ? 'track' : 'domain'
    const modeCol   = isOjt ? 'training_mode' : 'mode'
    const durCol    = isOjt ? 'duration_weeks' : 'duration_months'
    const appType   = isOjt ? 'OJT' : 'INTERNSHIP'

    const { data: app, error: appError } = await supabase
      .from(table)
      .select(`
        application_id,
        ${durCol},
        ${modeCol},
        ${filterCol},
        status,
        remarks,
        resume_path,
        resume_file_name,
        resume_file_size,
        created_at,
        students!inner (
          name, email, mobile, gender, college, course, year
        ),
        referral_codes (
          code
        )
      `)
      .eq('application_id', applicationId)
      .single()

    if (appError || !app) {
      return errorResponse('Application not found.', 404)
    }

    // Fetch status history
    const { data: history } = await supabase
      .from('application_status_history')
      .select('old_status, new_status, remarks, changed_by, changed_at')
      .eq('application_type', appType)
      .eq('application_id', applicationId)
      .order('changed_at', { ascending: true })

    const student = app.students as Record<string, unknown>
    const referral = app.referral_codes as Record<string, unknown> | null

    const detail = {
      applicationId: app.application_id,
      applicationType: appType,
      name:     student.name,
      mobile:   student.mobile,
      email:    student.email,
      gender:   student.gender,
      college:  student.college,
      course:   student.course,
      year:     student.year,
      trackOrDomain: isOjt ? app.track : app.domain,
      duration: isOjt ? app.duration_weeks : app.duration_months,
      mode:     isOjt ? app.training_mode : app.mode,
      referralCode: referral?.code || null,
      status:   app.status,
      remarks:  app.remarks,
      hasResume: Boolean(app.resume_path),
      resumeFileName: app.resume_file_name,
      resumeFileSize: app.resume_file_size,
      submittedDate: app.created_at,
      statusHistory: (history || []).map((h: Record<string, unknown>) => ({
        oldStatus:  h.old_status,
        newStatus:  h.new_status,
        remarks:    h.remarks,
        changedBy:  h.changed_by,
        changedAt:  h.changed_at,
      })),
    }

    return corsResponse(detail)

  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, err.status)
    console.error('[GET APPLICATION DETAIL ERROR]', err)
    return errorResponse('An unexpected error occurred.', 500)
  }
})
