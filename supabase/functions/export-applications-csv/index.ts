// supabase/functions/export-applications-csv/index.ts
// ADMIN protected — exports OJT or Internship applications as CSV.
// Preserves exact Spring Boot toCsv column format and headers.

import { errorResponse, handleOptions, CORS_HEADERS } from '../_shared/cors.ts'
import { requireAdmin, createServiceClient, AuthError } from '../_shared/auth.ts'
import { csvSafe } from '../_shared/validation.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleOptions()
  if (req.method !== 'GET') return errorResponse('Method not allowed', 405)

  try {
    await requireAdmin(req)

    const url = new URL(req.url)
    const type = (url.searchParams.get('type') || 'ojt').toLowerCase()
    const isOjt = type === 'ojt'
    const table = isOjt ? 'ojt_applications' : 'internship_applications'
    const trackCol = isOjt ? 'track' : 'domain'

    const supabase = createServiceClient()

    let query = supabase
      .from(table)
      .select(`
        id,
        application_id,
        status,
        training_mode,
        mode,
        track,
        domain,
        duration_weeks,
        duration_months,
        resume_path,
        resume_file_name,
        created_at,
        students!inner (
          name,
          email,
          mobile,
          college,
          course
        ),
        referral_codes (
          code
        )
      `)
      .order('created_at', { ascending: false })

    const status = url.searchParams.get('status')
    if (status) {
      query = query.eq('status', status.toUpperCase())
    }

    const trackOrDomain = url.searchParams.get('track') || url.searchParams.get('domain')
    if (trackOrDomain) {
      query = query.eq(trackCol, trackOrDomain.toUpperCase())
    }

    const { data, error } = await query

    if (error) {
      console.error('[EXPORT CSV ERROR]', error)
      return errorResponse('Failed to export applications.', 500)
    }

    const rows: string[] = [
      'Application ID,Student Name,Email,Phone,College,Course,Track/Domain,Duration,Mode,Referral Code,Resume Uploaded,Status,Submitted Date'
    ]

    for (const item of (data || [])) {
      const student = (item as any).students || {}
      const referral = (item as any).referral_codes || {}
      const trackOrDomainVal = isOjt ? item.track : item.domain
      const duration = isOjt
        ? (item.duration_weeks ? `${item.duration_weeks} weeks` : '')
        : (item.duration_months ? `${item.duration_months} months` : '')
      const mode = isOjt ? item.training_mode : item.mode
      const hasResume = Boolean(item.resume_path)
      const resumeText = hasResume ? `Yes (${item.resume_file_name || 'Uploaded'})` : 'No'
      const submittedDate = item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : ''

      const row = [
        csvSafe(item.application_id),
        csvSafe(student.name),
        csvSafe(student.email),
        csvSafe(student.mobile),
        csvSafe(student.college),
        csvSafe(student.course),
        csvSafe(trackOrDomainVal),
        csvSafe(duration),
        csvSafe(mode),
        csvSafe(referral.code || ''),
        csvSafe(resumeText),
        csvSafe(item.status || ''),
        csvSafe(submittedDate)
      ].join(',')

      rows.push(row)
    }

    const csvContent = rows.join('\n')
    const filename = isOjt ? 'ojt-applications.csv' : 'internship-applications.csv'

    return new Response(csvContent, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, err.status)
    console.error('[EXPORT CSV ERROR]', err)
    return errorResponse('An unexpected error occurred.', 500)
  }
})
