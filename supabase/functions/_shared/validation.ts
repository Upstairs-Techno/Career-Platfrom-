// supabase/functions/_shared/validation.ts
// Input validation utilities matching Spring Boot @Valid constraints exactly.

const MOBILE_REGEX = /^(?:\+91[\s-]?)?[6-9]\d{9}$/
const EMAIL_REGEX  = /^(?=.{1,150}$)[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/
const NAME_REGEX = /^[\p{L}][\p{L}\p{M} .'-]*$/u
const YEAR_REGEX = /^[\p{L}\p{N} .,'’()/&–-]+$/u
const COURSES = ['BCS', 'BCA', 'B.Tech', 'BE', 'Diploma', 'MCA', 'Other'] as const

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

export function normalizeIndianMobile(value: string): string {
  const digits = value.replace(/\D/g, '')
  return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits
}

function validName(value: string): boolean {
  const name = value.trim()
  return name.length >= 2 && name.length <= 150 && NAME_REGEX.test(name)
}

function validEmail(value: string): boolean {
  const email = value.trim()
  return email.length <= 150 && EMAIL_REGEX.test(email)
}

function validText(value: string, max: number): boolean {
  const text = value.trim()
  const hasControlCharacter = [...text].some((character) => {
    const code = character.charCodeAt(0)
    return code < 32 || code === 127
  })
  return text.length > 0 && text.length <= max && !/[<>]/.test(text) && !hasControlCharacter
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

  if (!validName(data.name || '')) {
    errors.push({ field: 'name', message: 'Enter a valid name using letters and common name punctuation (2–150 characters).' })
  }
  if (!data.mobile || !MOBILE_REGEX.test(data.mobile.trim())) {
    errors.push({ field: 'mobile', message: 'Enter a valid Indian mobile number.' })
  }
  if (!data.email || !validEmail(data.email)) {
    errors.push({ field: 'email', message: 'Enter a valid email address.' })
  }
  if (!data.gender || !(GENDERS as readonly string[]).includes(data.gender)) {
    errors.push({ field: 'gender', message: 'Gender is required.' })
  }
  if (!validText(data.college || '', 200)) {
    errors.push({ field: 'college', message: 'College / University name is required.' })
  }
  if (!data.course || !(COURSES as readonly string[]).includes(data.course)) {
    errors.push({ field: 'course', message: 'Course is required.' })
  }
  if (!validText(data.year || '', 50) || !YEAR_REGEX.test(data.year || '')) {
    errors.push({ field: 'year', message: 'Enter a valid academic year.' })
  }
  if (data.referralCode && !/^[A-Za-z0-9_-]{2,50}$/.test(data.referralCode)) {
    errors.push({ field: 'referralCode', message: 'Referral code contains unsupported characters.' })
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

  if (!validName(data.name || '')) {
    errors.push({ field: 'name', message: 'Enter a valid name using letters and common name punctuation (2–150 characters).' })
  }
  if (!data.mobile || !MOBILE_REGEX.test(data.mobile.trim())) {
    errors.push({ field: 'mobile', message: 'Enter a valid Indian mobile number.' })
  }
  if (!data.email || !validEmail(data.email)) {
    errors.push({ field: 'email', message: 'Enter a valid email address.' })
  }
  if (!data.gender || !(GENDERS as readonly string[]).includes(data.gender)) {
    errors.push({ field: 'gender', message: 'Gender is required.' })
  }
  if (!validText(data.college || '', 200)) {
    errors.push({ field: 'college', message: 'College / University name is required.' })
  }
  if (!data.course || !(COURSES as readonly string[]).includes(data.course)) {
    errors.push({ field: 'course', message: 'Course is required.' })
  }
  if (!validText(data.year || '', 50) || !YEAR_REGEX.test(data.year || '')) {
    errors.push({ field: 'year', message: 'Enter a valid academic year.' })
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

export async function validateResumeFile(file: File): Promise<string | null> {
  const extension = `.${file.name.split('.').pop()?.toLowerCase() || ''}`
  if (!['.pdf', '.doc', '.docx'].includes(extension)) return 'Invalid file format. Only PDF, DOC, and DOCX files are allowed.'
  if (!file.size || file.size > 5 * 1024 * 1024) return 'Resume must be smaller than 5 MB and cannot be empty.'

  const bytes = new Uint8Array(await file.arrayBuffer())
  const startsWith = (...signature: number[]) => signature.every((byte, index) => bytes[index] === byte)
  if (extension === '.pdf') {
    const header = new TextDecoder().decode(bytes.slice(0, 5))
    return header === '%PDF-' ? null : 'The selected file does not contain a valid PDF document.'
  }
  if (extension === '.doc') {
    return startsWith(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1)
      ? null
      : 'The selected file does not contain a valid DOC document.'
  }

  if (!startsWith(0x50, 0x4b, 0x03, 0x04)) return 'The selected file does not contain a valid DOCX document.'
  const text = new TextDecoder('latin1').decode(bytes)
  return text.includes('[Content_Types].xml') && text.includes('word/document.xml')
    ? null
    : 'The selected file does not contain a valid DOCX document.'
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
