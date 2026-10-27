import React from 'react'

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="animate-pulse space-y-2.5 p-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-8 flex-1 rounded-lg bg-slate-100" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card animate-pulse">
      <div className="h-12 w-12 rounded-xl bg-slate-100" />
      <div className="mt-4 h-8 w-1/3 rounded-lg bg-slate-200" />
      <div className="mt-2 h-4 w-2/3 rounded bg-slate-100" />
      <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
    </div>
  )
}
