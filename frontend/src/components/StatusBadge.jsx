import React from 'react'
import { STATUS_LABELS } from '../utils/formatters'

const STYLES = {
  SUBMITTED: 'border border-slate-200 bg-slate-100 text-slate-700',
  UNDER_REVIEW: 'border border-amber-200 bg-amber-50 text-amber-800',
  SELECTED: 'border border-cyan-200 bg-cyan-50 text-cyan-800',
  REJECTED: 'border border-red-200 bg-red-50 text-red-700',
  JOINED: 'border border-blue-200 bg-blue-50 text-blue-700',
  IN_PROGRESS: 'border border-purple-200 bg-purple-50 text-purple-700',
  COMPLETED: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  CANCELLED: 'border border-slate-200 bg-slate-50 text-slate-500',
}

export default function StatusBadge({ status }) {
  const style = STYLES[status] || 'border border-slate-200 bg-slate-100 text-slate-700'
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold font-heading shadow-clay-pill transition-all ${style}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70 mr-1.5" />
      {STATUS_LABELS[status] || status}
    </span>
  )
}
