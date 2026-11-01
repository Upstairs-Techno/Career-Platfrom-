const INDIA_MOBILE = /^(?:\+91[\s-]?)?[6-9]\d{9}$/
const EMAIL = /^(?=.{1,150}$)[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/
const PERSON_NAME = /^[\p{L}][\p{L}\p{M} .'-]*$/u

export function isSafePlainText(value) {
  return !/[<>]/.test(value) && ![...value].some((character) => {
    const code = character.charCodeAt(0)
    return code < 32 || code === 127
  })
}

export const fieldRules = {
  name: {
    required: 'Full name is required.',
    validate: (value) => {
      const text = value?.trim() || ''
      if (!text) return 'Full name is required.'
      if (text.length < 2 || text.length > 150) return 'Name must be 2 to 150 characters.'
      return PERSON_NAME.test(text) || 'Use letters, spaces, apostrophes, periods, or hyphens only.'
    },
  },
  mobile: {
    required: 'Mobile number is required.',
    validate: (value) => INDIA_MOBILE.test(value?.trim() || '') || 'Enter a valid Indian number: 10 digits, optionally prefixed with +91.',
  },
  email: {
    required: 'Email address is required.',
    validate: (value) => {
      const text = value?.trim() || ''
      return (text.length <= 150 && EMAIL.test(text)) || 'Enter a valid email address.'
    },
  },
  college: {
    required: 'College name is required.',
    validate: (value) => {
      const text = value?.trim() || ''
      if (!text) return 'College name is required.'
      if (text.length > 200) return 'College name must be 200 characters or fewer.'
      return isSafePlainText(text) || 'Remove unsupported characters from the college name.'
    },
  },
  year: {
    required: 'Academic year is required.',
    validate: (value) => {
      const text = value?.trim() || ''
      if (!text) return 'Academic year is required.'
      if (text.length > 50) return 'Academic year must be 50 characters or fewer.'
      return /^[\p{L}\p{N} .,'’()/&–-]+$/u.test(text) || 'Enter a valid academic year.'
    },
  },
  emailFormat: (value) => EMAIL.test(value?.trim() || '') || 'Enter a valid email address.',
  referralCode: (value) => !value?.trim() || /^[A-Za-z0-9_-]{2,50}$/.test(value.trim()) || 'Use 2–50 letters, numbers, hyphens, or underscores.',
}

export function normalizeIndianMobile(value = '') {
  const digits = value.replace(/\D/g, '')
  return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits
}

export function firstInvalidField(errors, stepFields) {
  return stepFields.findIndex((fields) => fields.some((field) => errors[field]))
}

export async function validateResumeFile(file) {
  if (!file) return null
  const extension = `.${file.name.split('.').pop().toLowerCase()}`
  const allowed = new Set(['.pdf', '.doc', '.docx'])
  if (!allowed.has(extension)) return 'Only PDF, DOC, and DOCX files are allowed.'
  if (file.size <= 0) return 'The selected file is empty.'
  if (file.size > 5 * 1024 * 1024) return 'File size exceeds the 5 MB limit. Please select a smaller file.'
  const bytes = new Uint8Array(await file.slice(0, Math.min(file.size, 1024 * 1024)).arrayBuffer())
  const startsWith = (...signature) => signature.every((byte, index) => bytes[index] === byte)
  if (extension === '.pdf' && new TextDecoder().decode(bytes.slice(0, 5)) !== '%PDF-') {
    return 'The selected file does not contain a valid PDF document.'
  }
  if (extension === '.doc' && !startsWith(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1)) {
    return 'The selected file does not contain a valid DOC document.'
  }
  if (extension === '.docx') {
    if (!startsWith(0x50, 0x4b, 0x03, 0x04)) return 'The selected file does not contain a valid DOCX document.'
    const content = new TextDecoder('latin1').decode(bytes)
    if (!content.includes('[Content_Types].xml') || !content.includes('word/document.xml')) {
      return 'The selected file does not contain a valid DOCX document.'
    }
  }
  return null
}
