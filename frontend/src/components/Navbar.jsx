import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, ArrowUpRight } from 'lucide-react'

const links = [
  { to: '/', label: 'Home' },
  { to: '/ojt', label: 'OJT Program' },
  { to: '/internship', label: 'Internship' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-colors shadow-xs">
      <nav className="container-page flex h-18 items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-950 p-0.5 shadow-sm transition-all duration-300 group-hover:border-blue-400 group-hover:shadow-[0_0_12px_rgba(0,119,238,0.2)]">
            <img
              src="/Upstairs Logo.jpeg"
              alt="Upstairs Techno Logo"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="leading-tight">
            <span className="block text-base sm:text-lg font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-blue-600">
              UPSTAIRS TECHNO
            </span>
            <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-blue-600">
              Innovate • Integrate • Elevate
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-1.5 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border border-blue-200/70 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link
            to="/ojt/apply"
            className="btn-primary ml-3 !px-5 !py-2.5 text-sm !rounded-xl"
          >
            Apply Now <ArrowUpRight size={16} />
          </Link>
        </div>

        <button
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 transition hover:bg-slate-50 hover:text-blue-600 md:hidden shadow-xs"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-100 bg-white/98 backdrop-blur-xl md:hidden shadow-lg">
          <div className="container-page flex flex-col gap-2 py-4">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border border-blue-200/60'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link
              to="/ojt/apply"
              onClick={() => setOpen(false)}
              className="btn-primary mt-2 text-sm justify-center"
            >
              Apply Now <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
