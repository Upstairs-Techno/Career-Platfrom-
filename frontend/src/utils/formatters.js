export function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function titleCase(value) {
  if (!value) return ''
  return value
    .toString()
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export const TRACK_LABELS = {
  WEB_DEVELOPMENT: 'Web Development',
  JAVA_DEVELOPMENT: 'Java Development',
  PYTHON_AI: 'Python & AI',
  CYBERSECURITY: 'Cybersecurity',
  AI_DATA_SCIENCE: 'AI & Data Science',
}

export const DOMAIN_LABELS = {
  WEB_DEVELOPMENT: 'Web Development',
  JAVA_DEVELOPMENT: 'Java Development',
  PYTHON_DEVELOPMENT: 'Python Development',
  AI_MACHINE_LEARNING: 'AI & Machine Learning',
  DATA_SCIENCE: 'Data Science',
  CYBERSECURITY: 'Cybersecurity',
  FULL_STACK_DEVELOPMENT: 'Full Stack Development',
}

export const STATUS_LABELS = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  SELECTED: 'Selected',
  REJECTED: 'Rejected',
  JOINED: 'Joined',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export const STATUS_OPTIONS = Object.keys(STATUS_LABELS)
