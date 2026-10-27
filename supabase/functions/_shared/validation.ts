// supabase/functions/_shared/validation.ts
// Input validation utilities matching Spring Boot @Valid constraints exactly.

const MOBILE_REGEX = /^[6-9]\d{9}$/ // Indian mobile: starts 6-9, 10 digits
const EMAIL_REGEX  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const OJT_TRACKS = [
  'WEB_DEVELOPMENT', 'JAVA_DEVELOPMENT', 'PYTHON_AI', 'CYBERSECURITY', 'AI_DATA_SCIENCE',
] as const

export const INTERNSHIP_DOMAINS = [
  'WEB_DEVELOPMENT', 'JAVA_DEVELOPMENT', 'PYTHON_DEVELOPMENT',
  'AI_MACHINE_LEARNING', 'DATA_SCIENCE', 'CYBERSECURITY', 'FULL_STACK_DEVELOPMENT',
] as const

export const TRAINING_MODES = ['ONLINE', 'OFFLINE'] as const

export const GENDERS = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] as const

export const OJT_DURATIONS   = [4, 6, 8, 12]        // weeks
export const INTERNSHIP_DURATIONS = [1, 2, 3, 6]     // months

export const APPLICATION_STATUSES = [
  'SUBMITTED', 'UNDER_REVIEW', 'SELECTED', 'REJECTED',
  'JOINED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED',
] as const

export interface ValidationError {
  field: string
  message: string
}

export interface OjtApplicationInput {
  name: string
  mobile: string
  email: string
  gender: string
  college: string
  course: string
  year?: string
  durationWeeks: number
  trainingMode: string
  track: string
  referralCode?: string
}

export interface InternshipApplicationInput {
  name: string
  mobile: string
  email: string
  gender: string
  college: string
  course: string
  year?: string
  durationMonths: number
  mode: string
  domain: string
  referralCode?: string
}

export function validateOjtApplication(data: OjtApplicationInput): ValidationError[] {
  const errors: ValidationError[] = []

  if (!data.name || data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Full name is required (min 2 characters).' })
  }
  if (!data.mobile || !MOBILE_REGEX.test(data.mobile.trim())) {
    errors.push({ field: 'mobile', message: 'Enter a valid Indian mobile number.' })
  }
  if (!data.email || !EMAIL_REGEX.test(data.email.trim())) {
    errors.push({ field: 'email', message: 'Enter a valid email address.' })
  }
  if (!data.gender || !(GENDERS as readonly string[]).includes(data.gender)) {
    errors.push({ field: 'gender', message: 'Gender is required.' })
  }
  if (!data.college || data.college.trim().length === 0) {
    errors.push({ field: 'college', message: 'College / University name is required.' })
  }
  if (!data.course || data.course.trim().length === 0) {
    errors.push({ field: 'course', message: 'Course is required.' })
  }
  if (!data.durationWeeks || !OJT_DURATIONS.includes(data.durationWeeks)) {
    errors.push({ field: 'durationWeeks', message: `OJT duration must be one of: ${OJT_DURATIONS.join(', ')} weeks.` })
  }
  if (!data.trainingMode || !(TRAINING_MODES as readonly string[]).includes(data.trainingMode)) {
    errors.push({ field: 'trainingMode', message: 'Training mode must be ONLINE or OFFLINE.' })
  }
  if (!data.track || !(OJT_TRACKS as readonly string[]).includes(data.track)) {
    errors.push({ field: 'track', message: `Invalid OJT track. Choose from: ${OJT_TRACKS.join(', ')}.` })
  }

  return errors
}

export function validateInternshipApplication(data: InternshipApplicationInput): ValidationError[] {
  const errors: ValidationError[] = []

  if (!data.name || data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Full name is required (min 2 characters).' })
  }
  if (!data.mobile || !MOBILE_REGEX.test(data.mobile.trim())) {
    errors.push({ field: 'mobile', message: 'Enter a valid Indian mobile number.' })
  }
  if (!data.email || !EMAIL_REGEX.test(data.email.trim())) {
    errors.push({ field: 'email', message: 'Enter a valid email address.' })
  }
  if (!data.gender || !(GENDERS as readonly string[]).includes(data.gender)) {
    errors.push({ field: 'gender', message: 'Gender is required.' })
  }
  if (!data.college || data.college.trim().length === 0) {
    errors.push({ field: 'college', message: 'College / University name is required.' })
  }
  if (!data.course || data.course.trim().length === 0) {
    errors.push({ field: 'course', message: 'Course is required.' })
  }
  if (!data.durationMonths || !INTERNSHIP_DURATIONS.includes(data.durationMonths)) {
    errors.push({ field: 'durationMonths', message: `Internship duration must be one of: ${INTERNSHIP_DURATIONS.join(', ')} months.` })
  }
  if (!data.mode || !(TRAINING_MODES as readonly string[]).includes(data.mode)) {
    errors.push({ field: 'mode', message: 'Training mode must be ONLINE or OFFLINE.' })
  }
  if (!data.domain || !(INTERNSHIP_DOMAINS as readonly string[]).includes(data.domain)) {
    errors.push({ field: 'domain', message: `Invalid internship domain. Choose from: ${INTERNSHIP_DOMAINS.join(', ')}.` })
  }

  return errors
}

/** Sanitize a string to prevent CSV formula injection */
export function csvSafe(value: string | null | undefined): string {
  if (value == null) return ''
  const str = String(value)
  // Escape quotes
  const escaped = str.replace(/"/g, '""')
  // Prevent formula injection: if starts with =, +, -, @, tab, CR
  const sanitized = escaped.replace(/^[\t\r=+\-@]/, "'$&")
  return `"${sanitized}"`
}
