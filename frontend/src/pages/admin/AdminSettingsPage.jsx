import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Settings, User } from 'lucide-react'

export default function AdminSettingsPage() {
  const { admin } = useAuth()
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Console Settings</h2>
        <p className="text-xs text-slate-500 font-medium">Administrator profile details and platform system configuration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700 shadow-2xs">
            <User size={22} />
          </div>
          <h3 className="mt-4 text-base font-extrabold text-slate-900">Admin Account Profile</h3>
          <dl className="mt-3 space-y-2 text-sm divide-y divide-slate-100">
            <div className="flex justify-between py-2">
              <dt className="text-slate-500 font-medium">Admin Login ID</dt>
              <dd className="font-bold text-slate-900">{admin?.loginId || 'admin'}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-slate-500 font-medium">Full Name</dt>
              <dd className="font-bold text-slate-900">{admin?.name || 'Administrator'}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-slate-500 font-medium">Email Address</dt>
              <dd className="font-bold text-slate-900">{admin?.email || 'admin@upstairstechno.com'}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-slate-500 font-medium">Authorization Role</dt>
                <dd className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                {admin?.role || 'Administrator'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 shadow-2xs">
            <Settings size={22} />
          </div>
          <h3 className="mt-4 text-base font-extrabold text-slate-900">Platform Environment</h3>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed font-medium">
            UPSTAIRS TECHNO OJT & Internship Management Platform — Administrative Management Console.
          </p>
          <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>Theme Engine</span>
              <span className="font-bold text-slate-700">Enterprise White + Dark Navy</span>
            </div>
            <div className="flex justify-between">
              <span>Version</span>
              <span className="font-bold text-slate-700">v2.4.0 (Enterprise)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
