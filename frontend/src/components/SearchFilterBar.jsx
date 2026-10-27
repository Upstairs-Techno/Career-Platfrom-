import React from 'react'
import { Search, Download } from 'lucide-react'

export default function SearchFilterBar({ q, onQChange, status, onStatusChange, statusOptions, extra, onExport }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between clay-card !p-4 !rounded-2xl">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => onQChange(e.target.value)}
            placeholder="Search name, email, phone, college, ID…"
            className="input-field pl-10 !py-2.5 text-sm !rounded-xl"
          />
        </div>
        <select value={status} onChange={(e) => onStatusChange(e.target.value)} className="input-field !py-2.5 text-sm sm:w-48 font-medium !rounded-xl">
          <option value="">All Statuses</option>
          {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        {extra}
      </div>
      {onExport && (
        <button
          onClick={onExport}
          className="clay-btn clay-btn-secondary !py-2.5 !px-4 text-sm !rounded-xl whitespace-nowrap"
        >
          <Download size={15} /> Export CSV
        </button>
      )}
    </div>
  )
}
