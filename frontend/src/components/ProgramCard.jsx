import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

export default function ProgramCard({ icon: Icon, title, subtitle, description, exploreHref, applyHref }) {
  return (
    <div className="clay-card clay-card-hover group relative flex flex-col p-7 sm:p-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 shadow-clay-pill transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-500 group-hover:text-white group-hover:border-transparent group-hover:scale-105">
        <Icon size={28} />
      </div>
      <h3 className="mt-6 text-2xl font-black text-slate-900 tracking-tight font-heading">{title}</h3>
      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-blue-600 font-heading">{subtitle}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{description}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link to={exploreHref} className="btn-secondary flex-1 !py-2.5 text-sm">
          Explore {title} <ArrowRight size={16} />
        </Link>
        <Link to={applyHref} className="btn-primary flex-1 !py-2.5 text-sm">
          Apply Now <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  )
}
