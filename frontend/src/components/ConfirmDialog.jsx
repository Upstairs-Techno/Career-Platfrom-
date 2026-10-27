import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', onConfirm, onCancel, loading }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md clay-card !p-6 sm:!p-7 shadow-2xl border border-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 shadow-clay-pill">
            <AlertTriangle size={22} />
          </div>
          <button
            onClick={onCancel}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X size={18} />
          </button>
        </div>
        <h3 className="mt-4 text-lg font-black text-slate-900 tracking-tight font-heading">{title}</h3>
        {description && <p className="mt-2 text-sm text-slate-600 font-medium leading-relaxed">{description}</p>}
        <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="clay-btn clay-btn-secondary !py-2.5 !px-4 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-red-500/20 transition hover:from-red-700 hover:to-rose-700 active:scale-[0.98] disabled:opacity-50 font-heading"
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
