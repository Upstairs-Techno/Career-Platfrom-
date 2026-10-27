import React, { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { getAdminOjtApplications, exportOjtApplicationsCsv } from '../../services/adminService'
import ApplicationsTable from '../../components/ApplicationsTable'
import SearchFilterBar from '../../components/SearchFilterBar'
import { STATUS_LABELS, TRACK_LABELS } from '../../utils/formatters'

const statusOptions = Object.keys(STATUS_LABELS).map((k) => ({ value: k, label: STATUS_LABELS[k] }))
const trackOptions = Object.keys(TRACK_LABELS).map((k) => ({ value: k, label: TRACK_LABELS[k] }))

export default function AdminOjtApplicationsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [track, setTrack] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getAdminOjtApplications({ q: q || undefined, status: status || undefined, track: track || undefined })
      setItems(data)
    } catch {
      toast.error('Failed to load OJT applications.')
    } finally {
      setLoading(false)
    }
  }, [q, status, track])

  useEffect(() => {
    const t = setTimeout(fetchData, 300)
    return () => clearTimeout(t)
  }, [fetchData])

  const handleExport = async () => {
    try {
      const { data } = await exportOjtApplicationsCsv()
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'ojt-applications.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      toast.error('Export failed.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">OJT Applications</h2>
          <p className="text-xs text-slate-500 font-medium">Manage and review candidates applying for On-the-Job Training programs</p>
        </div>
      </div>

      <SearchFilterBar
        q={q}
        onQChange={setQ}
        status={status}
        onStatusChange={setStatus}
        statusOptions={statusOptions}
        onExport={handleExport}
        extra={
          <select value={track} onChange={(e) => setTrack(e.target.value)} className="input-field !py-2 text-sm sm:w-48">
            <option value="">All Tracks</option>
            {trackOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        }
      />

      <ApplicationsTable items={items} loading={loading} trackOrDomainLabel="Track" />
    </div>
  )
}
