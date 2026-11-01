import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  ChevronLeft, ChevronRight, CheckCircle2, Loader2,
  UploadCloud, FileText, X, AlertCircle
} from 'lucide-react'
import { submitInternshipApplication } from '../services/internshipService'
import { validateReferralCode } from '../services/referralService'
import { DOMAIN_LABELS } from '../utils/formatters'
import { fieldRules, firstInvalidField, normalizeIndianMobile, validateResumeFile } from '../utils/validation'
import { WhatsAppChatButton } from '../components/WhatsAppButton'

const STEPS = ['Personal Details', 'Education', 'Internship Details', 'Confirm']

const COURSES = ['BCS', 'BCA', 'B.Tech', 'BE', 'Diploma', 'MCA', 'Other']
const DURATIONS = [1, 2, 3, 6]
const DOMAINS = Object.keys(DOMAIN_LABELS)

export default function InternshipApplyPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [referralStatus, setReferralStatus] = useState(null)
  const [checkingReferral, setCheckingReferral] = useState(false)

  // Resume state
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeError, setResumeError] = useState(null)
  const [checkingResume, setCheckingResume] = useState(false)

  const {
    register, handleSubmit, trigger, watch, setFocus, setError, formState: { errors },
  } = useForm({
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { gender: '', course: '', mode: '', domain: '', durationMonths: '' },
  })

  const values = watch()

  const stepFields = [
    ['name', 'mobile', 'email', 'gender'],
    ['college', 'course', 'year'],
    ['durationMonths', 'mode', 'domain', 'referralCode'],
    [],
  ]

  const next = async () => {
    if (step === 2 && (resumeError || checkingResume)) return
    const valid = await trigger(stepFields[step], { shouldFocus: true })
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const checkReferral = async () => {
    const code = values.referralCode?.trim()
    if (!code) {
      setReferralStatus(null)
      return
    }
    if (!(await trigger('referralCode'))) return
    setCheckingReferral(true)
    try {
      const { data } = await validateReferralCode(code)
      setReferralStatus(data)
    } catch {
      setReferralStatus({ valid: false, message: 'Invalid referral code.' })
    } finally {
      setCheckingReferral(false)
    }
  }

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    validateAndSetResume(file, e.target)
  }

  const validateAndSetResume = async (file, input) => {
    setCheckingResume(true)
    try {
      const error = await validateResumeFile(file)
      setResumeError(error)
      if (error) {
        setResumeFile(null)
        if (input) input.value = ''
        return
      }
      setResumeFile(file)
    } catch {
      setResumeError('The selected file could not be checked. Please choose it again.')
      setResumeFile(null)
      if (input) input.value = ''
    } finally {
      setCheckingResume(false)
    }
  }

  const removeResume = () => {
    setResumeFile(null)
    setResumeError(null)
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const onSubmit = async (data) => {
    if (resumeError) return
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('mobile', normalizeIndianMobile(data.mobile))
      formData.append('email', data.email)
      formData.append('gender', data.gender)
      formData.append('college', data.college)
      formData.append('course', data.course)
      formData.append('year', data.year)
      formData.append('durationMonths', String(data.durationMonths))
      formData.append('mode', data.mode)
      formData.append('domain', data.domain)
      if (data.referralCode) {
        formData.append('referralCode', data.referralCode)
      }
      if (resumeFile) {
        formData.append('resume', resumeFile)
      }

      const { data: result } = await submitInternshipApplication(formData)
      toast.success('Application submitted successfully!')
      navigate('/application-success', { state: { application: result } })
    } catch (err) {
      const message = err.response?.data?.message || err.friendlyMessage || 'Submission failed.'
      if (resumeFile && /resume|file|document/i.test(message)) setResumeError(message)
      const serverErrors = err.response?.data?.errors || []
      const invalidFields = {}
      serverErrors.forEach(({ field, message }) => {
        if (stepFields.some((fields) => fields.includes(field))) {
          invalidFields[field] = true
          setError(field, { type: 'server', message })
        }
      })
      const invalidStep = firstInvalidField(invalidFields, stepFields)
      if (invalidStep >= 0) {
        setStep(invalidStep)
        requestAnimationFrame(() => setFocus(stepFields[invalidStep].find((field) => invalidFields[field])))
      }
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const onInvalid = (formErrors) => {
    const invalidStep = firstInvalidField(formErrors, stepFields)
    if (invalidStep >= 0) {
      setStep(invalidStep)
      requestAnimationFrame(() => {
        const firstField = stepFields[invalidStep].find((field) => formErrors[field])
        if (firstField) setFocus(firstField, { shouldSelect: true })
      })
    }
  }

  return (
    <div className="min-h-[90vh] bg-slate-50/70 py-16">
      <div className="container-page max-w-2xl">
        <div className="text-center">
          <span className="inline-block clay-pill clay-pill-accent mb-3 font-heading text-xs font-bold uppercase tracking-[0.25em]">
            Online Registration
          </span>
          <h1 className="text-3xl font-black text-slate-900 sm:text-4xl tracking-tight font-heading">Internship Application</h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">Complete the steps below to apply for the UPSTAIRS TECHNO Internship program.</p>
        </div>

        {/* Stepper */}
        <div className="mt-10 flex items-center justify-between">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold font-heading transition-all ${
                    i <= step
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-clay-pill'
                      : 'border border-slate-200 bg-white text-slate-400 shadow-2xs'
                  }`}
                >
                  {i < step ? <CheckCircle2 size={18} /> : i + 1}
                </div>
                <span className={`mt-2 hidden text-xs font-bold font-heading sm:block ${i <= step ? 'text-blue-600' : 'text-slate-400'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-2 h-0.5 flex-1 transition-colors ${i < step ? 'bg-blue-600' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)} className="mt-10 clay-card !p-6 sm:!p-10">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="label-field">Full Name *</label>
                <input className={`input-field ${errors.name ? 'input-error' : ''}`} aria-invalid={Boolean(errors.name)} {...register('name', fieldRules.name)} />
                {errors.name && <p className="error-text">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label-field">Mobile Number *</label>
                <input type="tel" autoComplete="tel" className={`input-field ${errors.mobile ? 'input-error' : ''}`} aria-invalid={Boolean(errors.mobile)} {...register('mobile', fieldRules.mobile)} />
                {errors.mobile && <p className="error-text">{errors.mobile.message}</p>}
              </div>
              <div>
                <label className="label-field">Email Address *</label>
                <input type="email" autoComplete="email" className={`input-field ${errors.email ? 'input-error' : ''}`} aria-invalid={Boolean(errors.email)} {...register('email', fieldRules.email)} />
                {errors.email && <p className="error-text">{errors.email.message}</p>}
              </div>
              <div>
                <label className="label-field">Gender *</label>
                <select className={`input-field ${errors.gender ? 'input-error' : ''}`} aria-invalid={Boolean(errors.gender)} {...register('gender', { required: 'Please select gender', validate: (value) => ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'].includes(value) || 'Please select a valid option.' })}>
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
                {errors.gender && <p className="error-text">{errors.gender.message}</p>}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="label-field">College / Institute Name *</label>
                <input className={`input-field ${errors.college ? 'input-error' : ''}`} aria-invalid={Boolean(errors.college)} {...register('college', fieldRules.college)} />
                {errors.college && <p className="error-text">{errors.college.message}</p>}
              </div>
              <div>
                <label className="label-field">Course / Degree *</label>
                <select className={`input-field ${errors.course ? 'input-error' : ''}`} aria-invalid={Boolean(errors.course)} {...register('course', { required: 'Course is required', validate: (value) => COURSES.includes(value) || 'Please select a valid course.' })}>
                  <option value="">Select Course</option>
                  {COURSES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.course && <p className="error-text">{errors.course.message}</p>}
              </div>
              <div>
                <label className="label-field">Academic Year *</label>
                <input placeholder="e.g. 3rd Year / Final Year" className={`input-field ${errors.year ? 'input-error' : ''}`} aria-invalid={Boolean(errors.year)} {...register('year', fieldRules.year)} />
                {errors.year && <p className="error-text">{errors.year.message}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="label-field">Internship Duration *</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {DURATIONS.map((d) => (
                    <label
                      key={d}
                      className={`flex cursor-pointer flex-col items-center rounded-xl border p-3.5 text-center transition ${
                        Number(values.durationMonths) === d
                          ? 'border-blue-600 bg-blue-50/70 text-blue-700 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <input type="radio" value={d} className="sr-only" {...register('durationMonths', { required: 'Please select a duration', validate: (value) => DURATIONS.includes(Number(value)) || 'Please select a valid duration.' })} />
                      <span className="font-extrabold text-base">{d} {d === 1 ? 'Month' : 'Months'}</span>
                    </label>
                  ))}
                </div>
                {errors.durationMonths && <p className="error-text">{errors.durationMonths.message}</p>}
              </div>

              <div>
                <label className="label-field">Preferred Mode *</label>
                <div className="flex gap-4">
                  {['ONLINE', 'OFFLINE'].map((m) => (
                    <label
                      key={m}
                      className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border p-3.5 transition ${
                        values.mode === m
                          ? 'border-blue-600 bg-blue-50/70 text-blue-700 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <input type="radio" value={m} className="sr-only" {...register('mode', { required: 'Please select a mode', validate: (value) => ['ONLINE', 'OFFLINE'].includes(value) || 'Please select a valid mode.' })} />
                      <span className="font-semibold text-sm">{m === 'ONLINE' ? 'Online' : 'Offline'}</span>
                    </label>
                  ))}
                </div>
                {errors.mode && <p className="error-text">{errors.mode.message}</p>}
              </div>

              <div>
                <label className="label-field">Internship Domain *</label>
                <select className={`input-field ${errors.domain ? 'input-error' : ''}`} aria-invalid={Boolean(errors.domain)} {...register('domain', { required: 'Please select a domain', validate: (value) => DOMAINS.includes(value) || 'Please select a valid domain.' })}>
                  <option value="">Select Domain</option>
                  {DOMAINS.map((d) => (
                    <option key={d} value={d}>{DOMAIN_LABELS[d]}</option>
                  ))}
                </select>
                {errors.domain && <p className="error-text">{errors.domain.message}</p>}
              </div>

              {/* Resume Upload - Optional */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="label-field mb-0">Resume (Optional)</label>
                  <span className="text-xs text-slate-400 font-medium">PDF, DOC, DOCX up to 5MB</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Uploading your resume is optional. Your application will be processed even without one.
                </p>

                {!resumeFile ? (
                  <label className="mt-2.5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-6 text-center transition hover:border-blue-400 hover:bg-blue-50/30">
                    <UploadCloud className="h-8 w-8 text-blue-600 mb-2" />
                    <span className="text-sm font-semibold text-slate-700">
                      Click or drag to upload resume
                    </span>
                    <span className="mt-1 text-xs text-slate-500">
                      Supports PDF, DOC, DOCX (Max 5MB)
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleResumeChange}
                      className="sr-only"
                    />
                  </label>
                ) : (
                  <div className="mt-2.5 flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50/60 p-4 shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">{resumeFile.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{formatFileSize(resumeFile.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeResume}
                      aria-label="Remove uploaded resume"
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-100 hover:text-red-600"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}

                {resumeError && (
                  <div className="mt-2 flex items-center gap-2 rounded-xl bg-red-50 p-2.5 text-xs font-semibold text-red-600 border border-red-200">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{resumeError}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="label-field">Referral Code (Optional)</label>
                <div className="flex gap-2">
                  <input className={`input-field ${errors.referralCode ? 'input-error' : ''}`} aria-invalid={Boolean(errors.referralCode)} {...register('referralCode', { validate: fieldRules.referralCode })} placeholder="e.g. UPTECH2026" />
                  <button type="button" onClick={checkReferral} disabled={checkingReferral} className="btn-secondary !px-5 !py-2.5 text-sm whitespace-nowrap">
                    {checkingReferral ? <Loader2 size={16} className="animate-spin" /> : 'Validate'}
                  </button>
                </div>
                {errors.referralCode && <p className="error-text">{errors.referralCode.message}</p>}
                {referralStatus && (
                  <p className={`mt-1.5 text-sm font-medium ${referralStatus.valid ? 'text-emerald-600' : 'text-red-500'}`}>
                    {referralStatus.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900">Review Your Application</h3>
              <dl className="mt-4 divide-y divide-slate-100 text-sm">
                {[
                  ['Name', values.name],
                  ['Mobile', values.mobile],
                  ['Email', values.email],
                  ['Gender', values.gender],
                  ['College', values.college],
                  ['Course', values.course],
                  ['Year', values.year],
                  ['Duration', values.durationMonths ? `${values.durationMonths} ${values.durationMonths === '1' ? 'Month' : 'Months'}` : ''],
                  ['Mode', values.mode],
                  ['Domain', DOMAIN_LABELS[values.domain] || values.domain],
                  ['Resume', resumeFile ? `${resumeFile.name} (${formatFileSize(resumeFile.size)})` : 'Not uploaded (Optional)'],
                  ['Referral Code', values.referralCode || '—'],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between py-3">
                    <dt className="font-medium text-slate-500">{label}</dt>
                    <dd className="font-semibold text-slate-900 text-right">{val || '—'}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-10 flex justify-between border-t border-slate-100 pt-6">
            {step > 0 ? (
              <button type="button" onClick={back} className="btn-ghost">
                <ChevronLeft size={18} /> Back
              </button>
            ) : <span />}

            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next} disabled={step === 2 && checkingResume} className="btn-primary !px-6 !py-3">
                Next <ChevronRight size={18} />
              </button>
            ) : (
              <button type="submit" disabled={submitting || checkingResume || Boolean(resumeError)} className="btn-primary !px-8 !py-3">
                {submitting ? <><Loader2 size={18} className="animate-spin" /> Submitting…</> : 'Submit Internship Application'}
              </button>
            )}
          </div>
        </form>

        {/* WhatsApp Help Banner */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5 shadow-2xs">
          <div>
            <p className="text-sm font-bold text-emerald-950">Have questions about the Internship program?</p>
            <p className="text-xs text-emerald-800 font-medium">Chat directly with our academic team on WhatsApp for fast guidance.</p>
          </div>
          <WhatsAppChatButton size="sm" label="Chat on WhatsApp" />
        </div>
      </div>
    </div>
  )
}
