import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, Eye, Download, FileText, FileX } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getAdminApplicationDetail,
  updateApplicationStatus,
  viewApplicationResume,
  downloadApplicationResume,
} from '../../services/adminService'
import StatusBadge from '../../components/StatusBadge'
import { formatDate, formatDateTime, STATUS_OPTIONS, STATUS_LABELS, TRACK_LABELS, DOMAIN_LABELS } from '../../utils/formatters'

export default function AdminApplicationDetailPage() {
  const { id } = useParams()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newStatus, setNewStatus] = useState('')
  const [remarks, setRemarks] = useState('')
  const [updating, setUpdating] = useState(false)
  const [viewingResume, setViewingResume] = useState(false)
  const [downloadingResume, setDownloadingResume] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await getAdminApplicationDetail(id)
      setDetail(data)
      setNewStatus(data.status)
    } catch {
      toast.error('Failed to load application.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdate = async () => {
    setUpdating(true)
    try {
      const { data } = await updateApplicationStatus(id, { status: newStatus, remarks: remarks || undefined })
      setDetail(data)
      setRemarks('')
      toast.success('Status updated.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.')
    } finally {
      setUpdating(false)
    }
  }

  const handleViewResume = async () => {
    setViewingResume(true)
    try {
      await viewApplicationResume(id)
    } catch {
      toast.error('Failed to view resume.')
    } finally {
      setViewingResume(false)
    }
  }

  const handleDownloadResume = async () => {
    setDownloadingResume(true)
    try {
      await downloadApplicationResume(id, detail?.resumeFileName)
      toast.success('Resume download started.')
    } catch {
      toast.error('Failed to download resume.')
    } finally {
      setDownloadingResume(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    )
  }

  if (!detail) return null

  const trackLabel = detail.applicationType === 'OJT'
    ? (TRACK_LABELS[detail.trackOrDomain] || detail.trackOrDomain)
    : (DOMAIN_LABELS[detail.trackOrDomain] || detail.trackOrDomain)

  const durationLabel = detail.applicationType === 'OJT'
    ? `${detail.duration} Weeks`
    : `${detail.duration} Months`

  return (
    <div className="space-y-6">
      <Link
        to={detail.applicationType === 'OJT' ? '/admin/ojt' : '/admin/internships'}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-blue-700 transition"
      >
        <ArrowLeft size={16} /> Back to {detail.applicationType === 'OJT' ? 'OJT' : 'Internship'} Applications
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              {detail.applicationId}
            </h2>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-bold text-slate-700">
              {detail.applicationType === 'OJT' ? 'OJT Program' : 'Internship'}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">Candidate Profile and Application Lifecycle Details</p>
        </div>
        <StatusBadge status={detail.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Student Profile (2 Cols) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card lg:col-span-2">
          <h3 className="text-lg font-extrabold text-slate-900">Student Profile</h3>
          <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
            {[
              ['Candidate Name', detail.name],
              ['Mobile Number', detail.mobile],
              ['Email Address', detail.email],
              ['Gender', detail.gender],
              ['College / Institute', detail.college],
              ['Degree / Course', detail.course],
              ['Graduation Year', detail.year || '—'],
              [detail.applicationType === 'OJT' ? 'Selected Track' : 'Selected Domain', trackLabel],
              ['Program Duration', durationLabel],
              ['Training Mode', detail.mode],
              ['Referral Code Used', detail.referralCode || 'None (Direct)'],
              ['Submission Date', formatDate(detail.submittedDate)],
            ].map(([label, val]) => (
              <div key={label} className="border-b border-slate-100 pb-2">
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</dt>
                <dd className="mt-0.5 font-bold text-slate-900 text-sm">{val}</dd>
              </div>
            ))}
          </dl>
          {detail.remarks && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="font-bold text-slate-700 text-xs uppercase tracking-wider">Latest Remarks</p>
              <p className="mt-1 text-slate-800 font-medium">{detail.remarks}</p>
            </div>
          )}
        </div>

        {/* Update Status (1 Col) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card">
          <h3 className="text-lg font-extrabold text-slate-900">Update Status</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">Change evaluation state and notify history log</p>
          <div className="mt-5 space-y-4">
            <div>
              <label className="label-field font-bold text-slate-900">Evaluation State</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="input-field text-sm font-semibold"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-field font-bold text-slate-900">Admin Remarks (Optional)</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Cleared interview, offer sent..."
                rows={3}
                className="input-field text-sm"
              />
            </div>

            <button
              onClick={handleUpdate}
              disabled={updating}
              className="btn-navy w-full text-sm font-bold !py-3"
            >
              {updating ? <Loader2 size={16} className="animate-spin" /> : 'Save Status Update'}
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Resume Section */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card">
        <h3 className="text-lg font-extrabold text-slate-900">Candidate Resume</h3>
        <p className="text-xs text-slate-500 font-medium mt-1">Uploaded document associated with this application</p>

        <div className="mt-5">
          {detail.hasResume ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xs">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 text-sm sm:text-base">
                      {detail.resumeFileName || 'Candidate Resume'}
                    </p>
                    <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                      Uploaded
                    </span>
                  </div>
                  {detail.resumeFileSize && (
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      File Size: {formatFileSize(detail.resumeFileSize)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleViewResume}
                  disabled={viewingResume}
                  className="btn-primary !px-4 !py-2 text-xs sm:text-sm font-bold gap-1.5"
                >
                  {viewingResume ? <Loader2 size={15} className="animate-spin" /> : <Eye size={15} />}
                  <span>View Resume</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadResume}
                  disabled={downloadingResume}
                  className="btn-secondary !px-4 !py-2 text-xs sm:text-sm font-bold gap-1.5"
                >
                  {downloadingResume ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  <span>Download Resume</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 text-slate-600">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-500">
                <FileX size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">No Resume Uploaded</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  The candidate did not upload a resume with this application. Resume submission is optional.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status History */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card">
        <h3 className="text-lg font-extrabold text-slate-900">Status History Log</h3>
        <div className="mt-5 space-y-4">
          {detail.statusHistory && detail.statusHistory.length > 0 ? (
            detail.statusHistory.map((h, i) => (
              <div key={i} className="flex items-start gap-3 border-l-2 border-blue-500/40 pl-4">
                <div className="-ml-[22px] mt-1 h-3 w-3 rounded-full bg-blue-600 shadow-xs" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={h.newStatus} />
                    {h.oldStatus && (
                      <span className="text-xs font-medium text-slate-500">from {STATUS_LABELS[h.oldStatus]}</span>
                    )}
                  </div>
                  {h.remarks && <p className="mt-1 text-sm font-medium text-slate-700">{h.remarks}</p>}
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDateTime(h.changedAt)} {h.changedBy ? `· by ${h.changedBy}` : ''}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No status changes recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
