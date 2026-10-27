import { invokeFunction } from './api'

const queryString = (params = {}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value)
  })
  const value = query.toString()
  return value ? `?${value}` : ''
}

export const adminLogin = (payload) => invokeFunction('admin-login', { method: 'POST', body: payload })
export const adminLogout = async () => ({ data: null })
export const getAdminProfile = () => invokeFunction('admin-profile')

export const getDashboardStatistics = () => invokeFunction('get-dashboard-stats')

export const getAdminOjtApplications = (params) =>
  invokeFunction(`list-applications${queryString({ ...params, type: 'ojt' })}`)
export const getAdminInternshipApplications = (params) =>
  invokeFunction(`list-applications${queryString({ ...params, type: 'internship' })}`)
export const getAdminApplicationDetail = (id) =>
  invokeFunction(`get-application-detail${queryString({ id })}`)
export const updateApplicationStatus = (id, payload) =>
  invokeFunction(`update-application-status${queryString({ id })}`, { method: 'PUT', body: payload })

export const exportOjtApplicationsCsv = () =>
  invokeFunction('export-applications-csv?type=ojt', { headers: { Accept: 'text/csv' } })
export const exportInternshipApplicationsCsv = () =>
  invokeFunction('export-applications-csv?type=internship', { headers: { Accept: 'text/csv' } })

export const getApplicationResumeBlob = (id, download = false) =>
  invokeFunction(`get-admin-resume-url${queryString({ id, download: download ? 'true' : 'false' })}`)

export const viewApplicationResume = async (id) => {
  const response = await getApplicationResumeBlob(id, false)
  const contentType = response.headers?.get('x-resume-content-type') || 'application/pdf'
  const blob = new Blob([response.data], { type: contentType })
  const blobUrl = window.URL.createObjectURL(blob)
  window.open(blobUrl, '_blank')
  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000)
}

export const downloadApplicationResume = async (id, fileName) => {
  const response = await getApplicationResumeBlob(id, true)
  const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
  const blobUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.setAttribute('download', fileName || `${id}-resume`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000)
}
