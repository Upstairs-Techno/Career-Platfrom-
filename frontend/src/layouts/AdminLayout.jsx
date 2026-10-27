import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, GraduationCap, Briefcase, Users, Gift, FileBarChart,
  Settings, LogOut, Menu, Shield, ChevronRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/ojt', label: 'OJT Applications', icon: GraduationCap },
  { to: '/admin/internships', label: 'Internship Applications', icon: Briefcase },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/referrals', label: 'Referral Codes', icon: Gift },
  { to: '/admin/reports', label: 'Reports', icon: FileBarChart },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  // Determine current page title for breadcrumb
  const currentNav = navItems.find((item) => item.to === location.pathname) || { label: 'Console' }

  const SidebarContent = (
    <div className="flex h-full flex-col bg-[#0B1526] text-white">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/80">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-700/60 bg-white p-0.5 shadow-md">
          <img src="/Upstairs Logo.jpeg" alt="Upstairs Techno" className="h-full w-full object-cover" />
        </div>
        <div className="leading-tight">
          <p className="text-base font-black tracking-tight text-white font-heading">UPSTAIRS TECHNO</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-heading">Admin Console</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400/80 font-heading">
        Management Menu
      </div>
      <nav className="flex-1 space-y-1.5 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-bold font-heading transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-clay-pill'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`
            }
          >
            <item.icon size={19} className="shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Admin User Footer */}
      <div className="border-t border-slate-800/80 p-4 bg-[#08101E]">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold text-sm">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{admin?.name || 'Administrator'}</p>
            <p className="text-[11px] text-slate-400 truncate">{admin?.email || admin?.loginId || 'admin@upstairstechno.com'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-300 transition-all duration-150 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-800/80 lg:block">{SidebarContent}</aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 shadow-2xl">{SidebarContent}</aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/90 bg-white px-4 lg:px-8 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <span className="hidden sm:inline font-semibold text-slate-700">Admin Portal</span>
              <ChevronRight size={14} className="hidden sm:inline text-slate-400" />
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                {currentNav.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
              <Shield size={13} className="text-blue-600" />
              Upstairs Techno Console
            </span>
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <div className="hidden sm:block text-right leading-tight">
                <p className="text-xs font-bold text-slate-900">{admin?.name || 'Administrator'}</p>
                <p className="text-[10px] font-semibold text-emerald-600">Active Session</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs shadow-xs">
                {admin?.name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
