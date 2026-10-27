import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  GraduationCap, Briefcase, Clock, Award, CheckCircle2, Gift,
  ArrowUpRight, RefreshCw, Sparkles, CheckCircle
} from 'lucide-react'
import { getDashboardStatistics } from '../../services/adminService'
import { STATUS_LABELS } from '../../utils/formatters'
import { CardSkeleton } from '../../components/LoadingSkeleton'
import toast from 'react-hot-toast'

const StatCard = ({ icon: Icon, label, value, subtext, tag, iconBg, iconColor, borderColor }) => (
  <div className="clay-card clay-card-hover relative overflow-hidden p-6">
    <div className="flex items-start justify-between">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${borderColor} ${iconBg} ${iconColor} shadow-clay-pill`}>
        <Icon size={24} />
      </div>
      {tag && (
        <span className="inline-flex items-center gap-1 clay-pill text-[11px] font-bold font-heading">
          {tag}
        </span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 font-heading">{value ?? 0}</p>
      <p className="mt-1 text-sm font-bold text-slate-800 font-heading">{label}</p>
      {subtext && <p className="mt-0.5 text-xs text-slate-500 font-medium">{subtext}</p>}
    </div>
  </div>
)

function StatusBar({ label, ojt, internship, max, totalAll }) {
  const total = ojt + internship
  const percentage = totalAll > 0 ? Math.round((total / totalAll) * 100) : 0

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition-colors hover:bg-slate-100/60">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900">{label}</span>
          <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-600">
            {percentage}% of total
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold text-blue-700">OJT: {ojt}</span>
          <span className="text-slate-300">|</span>
          <span className="font-semibold text-sky-600">Internship: {internship}</span>
          <span className="font-extrabold text-slate-900 ml-1">Total: {total}</span>
        </div>
      </div>

      <div className="mt-2.5 flex h-3 overflow-hidden rounded-full bg-slate-200/80">
        <div
          className="bg-blue-600 transition-all duration-500"
          style={{ width: `${max ? (ojt / max) * 100 : 0}%` }}
          title={`OJT: ${ojt}`}
        />
        <div
          className="bg-sky-400 transition-all duration-500"
          style={{ width: `${max ? (internship / max) * 100 : 0}%` }}
          title={`Internship: ${internship}`}
        />
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const { data } = await getDashboardStatistics()
      setStats(data)
    } catch (err) {
      toast.error('Failed to load dashboard statistics.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-14 w-1/3 animate-pulse rounded-2xl bg-slate-200" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  if (!stats) return null

  const totalAllApplications = (stats.totalOjtApplications || 0) + (stats.totalInternshipApplications || 0)

  const maxStatus = Math.max(
    1,
    ...Object.keys(STATUS_LABELS).map(
      (s) => (stats.ojtStatusBreakdown[s] || 0) + (stats.internshipStatusBreakdown[s] || 0)
    )
  )

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Dashboard Overview
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200/60">
              <Sparkles size={12} /> Live Metrics
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600 font-medium">
            Real-time candidate statistics, application lifecycle stages, and marketing referrals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="btn-ghost border border-slate-200 bg-white text-xs !py-2.5 font-bold text-slate-700 shadow-2xs hover:border-slate-300"
          >
            <RefreshCw size={14} /> Refresh Data
          </button>
          <Link
            to="/admin/referrals"
            className="btn-navy text-xs !py-2.5 font-bold shadow-xs"
          >
            Manage Referrals <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* 6 Prominent Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={GraduationCap}
          label="Total OJT Applications"
          value={stats.totalOjtApplications}
          subtext="On-The-Job Training Applicants"
          tag="OJT Track"
          iconBg="bg-blue-50"
          iconColor="text-blue-700"
          borderColor="border-blue-200"
        />
        <StatCard
          icon={Briefcase}
          label="Total Internship Applications"
          value={stats.totalInternshipApplications}
          subtext="Domain Internship Applicants"
          tag="Internships"
          iconBg="bg-sky-50"
          iconColor="text-sky-700"
          borderColor="border-sky-200"
        />
        <StatCard
          icon={Clock}
          label="Pending Applications"
          value={stats.pendingApplications}
          subtext="Requiring review or decision"
          tag="Needs Action"
          iconBg="bg-amber-50"
          iconColor="text-amber-700"
          borderColor="border-amber-200"
        />
        <StatCard
          icon={Award}
          label="Selected Candidates"
          value={stats.selectedStudents}
          subtext="Shortlisted for onboarding"
          tag="Qualified"
          iconBg="bg-cyan-50"
          iconColor="text-cyan-700"
          borderColor="border-cyan-200"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed Students"
          value={stats.completedStudents}
          subtext="Graduated program curriculum"
          tag="Certified"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
          borderColor="border-emerald-200"
        />
        <StatCard
          icon={Gift}
          label="Total Referral Codes"
          value={stats.totalReferralCodes}
          subtext="Active marketing member codes"
          tag="Campaigns"
          iconBg="bg-purple-50"
          iconColor="text-purple-700"
          borderColor="border-purple-200"
        />
      </div>

      {/* Applications Overview & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Status Progression Track (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Applications Overview</h3>
              <p className="text-xs font-medium text-slate-500">Distribution across evaluation and completion stages</p>
            </div>
            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-blue-700">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> OJT Program
              </span>
              <span className="flex items-center gap-1.5 text-sky-600">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-400" /> Internship
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {Object.keys(STATUS_LABELS).map((status) => (
              <StatusBar
                key={status}
                label={STATUS_LABELS[status]}
                ojt={stats.ojtStatusBreakdown[status] || 0}
                internship={stats.internshipStatusBreakdown[status] || 0}
                max={maxStatus}
                totalAll={totalAllApplications}
              />
            ))}
          </div>
        </div>

        {/* Quick Summary & Actions Side Card (1 Col) */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Quick Actions & Shortcuts</h3>
            <p className="mt-1 text-xs text-slate-500 font-medium">Fast navigation to essential console tools</p>

            <div className="mt-4 space-y-3">
              <Link
                to="/admin/ojt"
                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition-all hover:border-blue-300 hover:bg-blue-50/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700">Review OJT Candidates</p>
                    <p className="text-xs text-slate-500">Filter tracks & export CSV</p>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-slate-400 group-hover:text-blue-700" />
              </Link>

              <Link
                to="/admin/internships"
                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition-all hover:border-sky-300 hover:bg-sky-50/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-sky-700">Review Internships</p>
                    <p className="text-xs text-slate-500">Filter domains & export CSV</p>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-slate-400 group-hover:text-sky-700" />
              </Link>

              <Link
                to="/admin/referrals"
                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition-all hover:border-purple-300 hover:bg-purple-50/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                    <Gift size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-purple-700">Marketing Referrals</p>
                    <p className="text-xs text-slate-500">Create codes for team members</p>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-slate-400 group-hover:text-purple-700" />
              </Link>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <CheckCircle size={15} className="text-emerald-600" />
              Platform Status
            </div>
            <p className="mt-1 text-xs text-slate-500">
              All career portals and candidate intake endpoints are operational.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
