import React from 'react'
import { Inbox } from 'lucide-react'

export default function EmptyState({ title = 'Nothing here yet', description, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center clay-card !border-dashed !border-slate-300 py-16 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 shadow-clay-pill">
        <Icon size={30} />
      </div>
      <p className="mt-4 text-base sm:text-lg font-black text-slate-900 font-heading">{title}</p>
      {description && <p className="mt-1 max-w-md text-sm text-slate-500 leading-relaxed font-medium">{description}</p>}
    </div>
  )
}
