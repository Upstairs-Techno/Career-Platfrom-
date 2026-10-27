import React from 'react'
import { Link } from 'react-router-dom'
import { Eye, FileText } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { formatDate } from '../utils/formatters'
import EmptyState from './EmptyState'
import { TableSkeleton } from './LoadingSkeleton'

export default function ApplicationsTable({ items, loading, trackOrDomainLabel = 'Track' }) {
  if (loading) {
    return (
      <div className="card">
        <TableSkeleton rows={6} cols={7} />
      </div>
    )
  }

  if (!items || items.length === 0) {
    return <EmptyState title="No applications found" description="Try adjusting your search or filters." />
  }

  return (
    <div className="overflow-hidden clay-card !p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50/80">
            <tr>
              {['Application ID', 'Student Name', 'Email', 'Phone', 'College', trackOrDomainLabel, 'Duration', 'Mode', 'Referral', 'Resume', 'Status', 'Submitted', ''].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {items.map((item) => (
              <tr key={item.applicationId} className="hover:bg-slate-50/80 transition-colors">
                <td className="whitespace-nowrap px-4 py-3.5 font-bold font-mono text-xs text-blue-700">
                  {item.applicationId}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 font-bold text-slate-900">{item.studentName}</td>
                <td className="whitespace-nowrap px-4 py-3.5 text-slate-700">{item.email}</td>
                <td className="whitespace-nowrap px-4 py-3.5 text-slate-700">{item.phone}</td>
                <td className="whitespace-nowrap px-4 py-3.5 text-slate-700">{item.college}</td>
                <td className="whitespace-nowrap px-4 py-3.5">
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {item.trackOrDomain}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-slate-700">{item.duration}</td>
                <td className="whitespace-nowrap px-4 py-3.5 text-slate-700">{item.mode}</td>
                <td className="whitespace-nowrap px-4 py-3.5">
                  {item.referralCode ? (
                    <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-xs font-bold text-blue-700">
                      {item.referralCode}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5">
                  {item.hasResume ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700"
                      title={item.resumeFileName || 'Resume uploaded'}
                    >
                      <FileText size={12} />
                      <span>Uploaded</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">None</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5"><StatusBadge status={item.status} /></td>
                <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500">{formatDate(item.submittedDate)}</td>
                <td className="whitespace-nowrap px-4 py-3.5 text-right">
                  <Link
                    to={`/admin/applications/${item.applicationId}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700"
                  >
                    <Eye size={14} /> View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
