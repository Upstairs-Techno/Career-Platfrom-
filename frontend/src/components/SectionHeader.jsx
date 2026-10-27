import React from 'react'

export default function SectionHeader({ eyebrow, title, description, center = true, dark = false }) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : ''}>
      {eyebrow && (
        <div className="inline-block mb-1">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.2em] font-heading ${
            dark ? 'bg-blue-950/80 text-blue-400 border border-blue-800' : 'clay-pill clay-pill-accent text-blue-600'
          }`}>
            {eyebrow}
          </span>
        </div>
      )}
      <h2 className={`mt-2 text-3xl font-black tracking-tight sm:text-4xl font-heading ${dark ? 'text-white' : 'text-slate-900'}`}>
        {title}
      </h2>
      {description && <p className={`mt-4 text-base sm:text-lg leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{description}</p>}
    </div>
  )
}
