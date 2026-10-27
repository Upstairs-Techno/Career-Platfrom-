import React from 'react'
import { Link } from 'react-router-dom'
import { Users, GraduationCap, Briefcase } from 'lucide-react'

export default function AdminStudentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Students Directory</h2>
        <p className="text-xs text-slate-500 font-medium">Access and review all candidate profiles across OJT and Internship programs</p>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 max-w-xl shadow-card">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700 shadow-2xs">
          <Users size={24} />
        </div>
        <h3 className="mt-4 text-base font-extrabold text-slate-900">Candidate Records</h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed font-medium">
          Every candidate who applied through Upstairs Techno career portals is recorded with complete profiles,
          academic background, program track/domain, contact info, and status progression logs.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/admin/ojt"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-800 shadow-2xs transition hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 flex-1"
          >
            <GraduationCap size={16} /> View OJT Students
          </Link>
          <Link
            to="/admin/internships"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-800 shadow-2xs transition hover:border-sky-300 hover:bg-sky-50/50 hover:text-sky-700 flex-1"
          >
            <Briefcase size={16} /> View Internship Students
          </Link>
        </div>
      </div>
    </div>
  )
}
