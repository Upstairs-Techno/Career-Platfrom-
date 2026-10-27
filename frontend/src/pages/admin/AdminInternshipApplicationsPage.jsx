import React, { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { getAdminInternshipApplications, exportInternshipApplicationsCsv } from '../../services/adminService'
import ApplicationsTable from '../../components/ApplicationsTable'
import SearchFilterBar from '../../components/SearchFilterBar'
import { STATUS_LABELS, DOMAIN_LABELS } from '../../utils/formatters'

const statusOptions = Object.keys(STATUS_LABELS).map((k) => ({ value: k, label: STATUS_LABELS[k] }))
const domainOptions = Object.keys(DOMAIN_LABELS).map((k) => ({ value: k, label: DOMAIN_LABELS[k] }))

export default function AdminInternshipApplicationsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [domain, setDomain] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getAdminInternshipApplications({ q: q || undefined, status: status || undefined, domain: domain || undefined })
      setItems(data)
    } catch {
      toast.error('Failed to load Internship applications.')
    } finally {
      setLoading(false)
    }
  }, [q, status, domain])

  useEffect(() => {
    const t = setTimeout(fetchData, 300)
    return () => clearTimeout(t)
  }, [fetchData])

  const handleExport = async () => {
    try {
      const { data } = await exportInternshipApplicationsCsv()
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'internship-applications.csv')
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
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Internship Applications</h2>
          <p className="text-xs text-slate-500 font-medium">Manage and review candidates applying for domain internships</p>
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
          <select value={domain} onChange={(e) => setDomain(e.target.value)} className="input-field !py-2 text-sm sm:w-48">
            <option value="">All Domains</option>
            {domainOptions.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        }
      />

      <ApplicationsTable items={items} loading={loading} trackOrDomainLabel="Domain" />
    </div>
  )
}
