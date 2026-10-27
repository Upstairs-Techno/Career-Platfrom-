import React from 'react'
import { Link, useLocation, Navigate } from 'react-router-dom'
import { CheckCircle2, Printer, Home } from 'lucide-react'
import { formatDate } from '../utils/formatters'
import { WhatsAppChatButton } from '../components/WhatsAppButton'

export default function ApplicationSuccessPage() {
  const location = useLocation()
  const application = location.state?.application

  if (!application) {
    return <Navigate to="/" replace />
  }

  const programLabel = application.applicationType === 'OJT' ? 'OJT' : 'Internship'

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-slate-50/70 py-16">
      <div className="container-page max-w-lg">
        <div className="clay-card !p-8 text-center print:border-none print:bg-white print:text-black print:shadow-none">
          {/* Upstairs Logo */}
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-1 shadow-clay-pill">
            <img src="/Upstairs Logo.jpeg" alt="Upstairs Techno" className="h-full w-full object-cover" />
          </div>

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-clay-pill animate-pulse-soft">
            <CheckCircle2 size={36} />
          </div>
          <h1 className="mt-6 text-2xl font-black text-slate-900 tracking-tight font-heading">
            Application Submitted Successfully 🎉
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Thank you for applying for the UPSTAIRS TECHNO {programLabel} program. Our academic and training team will review
            your application and reach out via email/phone regarding next steps.
          </p>

          <dl className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-slate-50/50 text-left text-sm">
            <div className="flex justify-between px-4 py-3">
              <dt className="font-medium text-slate-500">Application ID</dt>
              <dd className="font-bold text-blue-600">{application.applicationId}</dd>
            </div>
            <div className="flex justify-between px-4 py-3">
              <dt className="font-medium text-slate-500">Program</dt>
              <dd className="font-semibold text-slate-900">{programLabel}</dd>
            </div>
            <div className="flex justify-between px-4 py-3">
              <dt className="font-medium text-slate-500">Name</dt>
              <dd className="font-semibold text-slate-900">{application.studentName}</dd>
            </div>
            <div className="flex justify-between px-4 py-3">
              <dt className="font-medium text-slate-500">Submitted Date</dt>
              <dd className="font-semibold text-slate-900">{formatDate(application.submittedDate)}</dd>
            </div>
            <div className="flex justify-between px-4 py-3">
              <dt className="font-medium text-slate-500">Status</dt>
              <dd className="font-semibold text-blue-600">{application.status}</dd>
            </div>
          </dl>

          {application.referralMessage && (
            <p className="mt-4 text-sm font-medium text-emerald-600">{application.referralMessage}</p>
          )}

          <div className="mt-6 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 text-center print:hidden">
            <p className="text-xs text-emerald-900 font-semibold mb-2.5">
              Have questions about next steps or interview scheduling?
            </p>
            <WhatsAppChatButton size="sm" label="Chat with us on WhatsApp" />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row print:hidden">
            <Link to="/" className="btn-secondary flex-1 text-sm !rounded-xl">
              <Home size={16} /> Back to Home
            </Link>
            <button onClick={() => window.print()} className="btn-primary flex-1 text-sm !rounded-xl">
              <Printer size={16} /> Print Application
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
