// supabase/functions/submit-application/index.ts
// PUBLIC endpoint — no auth required.
// Handles both OJT and Internship application submissions.
// Accepts multipart/form-data (with optional resume file) or JSON.
// Uses PostgreSQL transactional functions for atomic submission.

import { corsResponse, errorResponse, handleOptions, CORS_HEADERS } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/auth.ts'
import {
  validateOjtApplication, validateInternshipApplication,
  OjtApplicationInput, InternshipApplicationInput,
} from '../_shared/validation.ts'
import { sendApplicationReceived } from '../_shared/email.ts'

const MAX_RESUME_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx']
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleOptions()
  if (req.method !== 'POST') return errorResponse('Method not allowed', 405)

  try {
    const contentType = req.headers.get('content-type') || ''
    const isMultipart = contentType.includes('multipart/form-data')
    const url = new URL(req.url)
    const type = url.searchParams.get('type') // 'ojt' or 'internship'

    if (!type || !['ojt', 'internship'].includes(type)) {
      return errorResponse("Query parameter 'type' must be 'ojt' or 'internship'.", 400)
    }

    let fields: Record<string, string> = {}
    let resumeFile: File | null = null

    if (isMultipart) {
      const formData = await req.formData()
      for (const [key, value] of formData.entries()) {
        if (key === 'resume' && value instanceof File) {
          resumeFile = value
        } else {
          fields[key] = String(value)
        }
      }
    } else {
      fields = await req.json()
    }

    // ── Validate input ──────────────────────────────────────────────────────
    let validationErrors: { field: string; message: string }[] = []

    if (type === 'ojt') {
      const input: OjtApplicationInput = {
        name:          (fields.name || '').trim(),
        mobile:        (fields.mobile || '').trim(),
        email:         (fields.email || '').trim().toLowerCase(),
        gender:        (fields.gender || '').trim(),
        college:       (fields.college || '').trim(),
        course:        (fields.course || '').trim(),
        year:          (fields.year || '').trim(),
        durationWeeks: parseInt(fields.durationWeeks || '0', 10),
        trainingMode:  (fields.trainingMode || '').trim(),
        track:         (fields.track || '').trim(),
        referralCode:  (fields.referralCode || '').trim() || undefined,
      }
      validationErrors = validateOjtApplication(input)
    } else {
      const input: InternshipApplicationInput = {
        name:           (fields.name || '').trim(),
        mobile:         (fields.mobile || '').trim(),
        email:          (fields.email || '').trim().toLowerCase(),
        gender:         (fields.gender || '').trim(),
        college:        (fields.college || '').trim(),
        course:         (fields.course || '').trim(),
        year:           (fields.year || '').trim(),
        durationMonths: parseInt(fields.durationMonths || '0', 10),
        mode:           (fields.mode || '').trim(),
        domain:         (fields.domain || '').trim(),
        referralCode:   (fields.referralCode || '').trim() || undefined,
      }
      validationErrors = validateInternshipApplication(input)
    }

    if (validationErrors.length > 0) {
      return corsResponse({ errors: validationErrors, message: validationErrors[0].message }, 422)
    }

    // ── Validate resume (if provided) ───────────────────────────────────────
    let validatedResume: { file: File; ext: string; contentType: string } | null = null
    if (resumeFile && resumeFile.size > 0) {
      if (resumeFile.size > MAX_RESUME_BYTES) {
        return errorResponse('Resume file size exceeds the 5 MB limit. Please upload a smaller file.', 400)
      }
      const nameParts = (resumeFile.name || '').toLowerCase().split('.')
      const ext = '.' + (nameParts.pop() || '')
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return errorResponse('Invalid file format. Only PDF, DOC, and DOCX files are allowed.', 400)
      }
      let contentType = resumeFile.type || ''
      if (!contentType || !ALLOWED_MIME_TYPES.includes(contentType)) {
        contentType = ext === '.pdf' ? 'application/pdf'
          : ext === '.doc' ? 'application/msword'
          : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }
      validatedResume = { file: resumeFile, ext, contentType }
    }

    const supabase = createServiceClient()

    // ── Call transactional DB function ──────────────────────────────────────
    let applicationId: string
    let studentName: string
    let referralMessage: string | null = null

    if (type === 'ojt') {
      const { data, error } = await supabase.rpc('submit_ojt_application', {
        p_name:           fields.name.trim(),
        p_mobile:         fields.mobile.trim(),
        p_email:          fields.email.trim().toLowerCase(),
        p_gender:         fields.gender.trim(),
        p_college:        fields.college.trim(),
        p_course:         fields.course.trim(),
        p_year:           fields.year?.trim() || null,
        p_duration_weeks: parseInt(fields.durationWeeks, 10),
        p_training_mode:  fields.trainingMode.trim(),
        p_track:          fields.track.trim(),
        p_referral_code:  fields.referralCode?.trim() || null,
      })

      if (error) {
        return _handleDbError(error)
      }
      applicationId   = data[0].application_id
      studentName     = data[0].student_name
      referralMessage = data[0].referral_message
    } else {
      const { data, error } = await supabase.rpc('submit_internship_application', {
        p_name:             fields.name.trim(),
        p_mobile:           fields.mobile.trim(),
        p_email:            fields.email.trim().toLowerCase(),
        p_gender:           fields.gender.trim(),
        p_college:          fields.college.trim(),
        p_course:           fields.course.trim(),
        p_year:             fields.year?.trim() || null,
        p_duration_months:  parseInt(fields.durationMonths, 10),
        p_mode:             fields.mode.trim(),
        p_domain:           fields.domain.trim(),
        p_referral_code:    fields.referralCode?.trim() || null,
      })

      if (error) {
        return _handleDbError(error)
      }
      applicationId   = data[0].application_id
      studentName     = data[0].student_name
      referralMessage = data[0].referral_message
    }

    // ── Upload resume to Supabase Storage ───────────────────────────────────
    if (validatedResume) {
      const storagePath = `${applicationId}/${applicationId}-resume${validatedResume.ext}`
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(storagePath, validatedResume.file, {
          contentType: validatedResume.contentType,
          upsert: false,
        })

      if (uploadError) {
        // Log but don't fail — application is already committed
        console.error('[RESUME UPLOAD ERROR]', uploadError.message)
      } else {
        // Update application record with storage path
        await supabase.rpc('update_resume_path', {
          p_application_id:       applicationId,
          p_resume_path:          storagePath,
          p_resume_file_name:     validatedResume.file.name,
          p_resume_content_type:  validatedResume.contentType,
          p_resume_file_size:     validatedResume.file.size,
        })
      }
    }

    // ── Send confirmation email (non-blocking) ──────────────────────────────
    const programName = type === 'ojt' ? 'OJT' : 'INTERNSHIP'
    sendApplicationReceived(
      fields.email.trim().toLowerCase(),
      studentName,
      applicationId,
      programName as 'OJT' | 'INTERNSHIP',
    ).catch((e) => console.error('[EMAIL ERROR]', e))

    return corsResponse({
      applicationId,
      applicationType: type.toUpperCase(),
      status: 'SUBMITTED',
      submittedDate: new Date().toISOString(),
      studentName,
      referralMessage: referralMessage || null,
      message: 'Application submitted successfully.',
    }, 201)

  } catch (err) {
    console.error('[SUBMIT APPLICATION ERROR]', err)
    return errorResponse('An unexpected error occurred. Please try again.', 500)
  }
})

function _handleDbError(error: { message: string; code?: string }): Response {
  const msg = error.message || ''
  if (msg.includes('DUPLICATE_APPLICATION')) {
    return corsResponse({ message: msg.replace('DUPLICATE_APPLICATION: ', '') }, 409)
  }
  if (msg.includes('INVALID_REFERRAL')) {
    return corsResponse({ message: msg.replace('INVALID_REFERRAL: ', '') }, 400)
  }
  console.error('[DB ERROR]', error)
  return errorResponse('Failed to submit application. Please try again.', 500)
}
