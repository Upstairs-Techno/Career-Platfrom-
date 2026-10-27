import React from 'react'
import { Link } from 'react-router-dom'
import { FileBarChart, Download } from 'lucide-react'

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Reports & Exports</h2>
        <p className="text-xs text-slate-500 font-medium">Download candidate lists, program tracking data, and audit spreadsheets</p>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 max-w-xl shadow-card">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-2xs">
          <FileBarChart size={24} />
        </div>
        <h3 className="mt-4 text-base font-extrabold text-slate-900">Data Export Center</h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed font-medium">
          Export filtered candidate applications and campaign records into formatted CSV spreadsheets directly
          from the respective application consoles.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/admin/ojt"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-800 shadow-2xs transition hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 flex-1"
          >
            <Download size={16} /> OJT Applications CSV
          </Link>
          <Link
            to="/admin/internships"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-800 shadow-2xs transition hover:border-sky-300 hover:bg-sky-50/50 hover:text-sky-700 flex-1"
          >
            <Download size={16} /> Internship Applications CSV
          </Link>
        </div>
      </div>
    </div>
  )
}
