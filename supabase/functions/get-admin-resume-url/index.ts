// supabase/functions/get-admin-resume-url/index.ts
// ADMIN protected — retrieves resume from Supabase Storage for an application.
// Query params:
//   id: application_id (e.g. OJT-2026-00001 or INT-2026-00001)
//   download: "true" | "false" (sets Content-Disposition)
//   mode: "stream" (default, streams file blob) | "json" (returns signed URL)

import { corsResponse, errorResponse, handleOptions, CORS_HEADERS } from '../_shared/cors.ts'
import { requireAdmin, createServiceClient, AuthError } from '../_shared/auth.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleOptions()
  if (req.method !== 'GET') return errorResponse('Method not allowed', 405)

  try {
    await requireAdmin(req)

    const url = new URL(req.url)
    const applicationId = url.searchParams.get('id')
    const download = url.searchParams.get('download') === 'true'
    const mode = url.searchParams.get('mode') || 'stream'

    if (!applicationId) {
      return errorResponse('Application ID is required', 400)
    }

    const supabase = createServiceClient()
    const isOjt = applicationId.toUpperCase().startsWith('OJT')
    const table = isOjt ? 'ojt_applications' : 'internship_applications'

    const { data: app, error: dbError } = await supabase
      .from(table)
      .select('resume_path, resume_file_name, resume_content_type, resume_file_size')
      .eq('application_id', applicationId)
      .single()

    if (dbError || !app) {
      return errorResponse('Application not found', 404)
    }

    if (!app.resume_path) {
      return errorResponse('No resume uploaded for this application', 404)
    }

    const bucket = 'resumes'
    const fileName = app.resume_file_name || `${applicationId}-resume.pdf`
    const contentType = app.resume_content_type || 'application/pdf'

    if (mode === 'json') {
      const { data: signedData, error: signError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(app.resume_path, 3600, {
          download: download ? fileName : undefined
        })

      if (signError || !signedData?.signedUrl) {
        return errorResponse('Failed to generate signed resume URL', 500)
      }

      return corsResponse({
        applicationId,
        fileName,
        contentType,
        signedUrl: signedData.signedUrl,
        expiresInSeconds: 3600
      })
    }

    // Stream binary blob directly
    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(app.resume_path)

    if (downloadError || !fileBlob) {
      return errorResponse('Failed to retrieve file from storage', 500)
    }

    const disposition = download ? `attachment; filename="${fileName}"` : `inline; filename="${fileName}"`

    return new Response(fileBlob, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/octet-stream',
        'X-Resume-Content-Type': contentType,
        'Content-Disposition': disposition,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate'
      }
    })
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, err.status)
    console.error('[GET RESUME ERROR]', err)
    return errorResponse('An unexpected error occurred.', 500)
  }
})
