import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  ChevronLeft, ChevronRight, CheckCircle2, Loader2,
  UploadCloud, FileText, X, AlertCircle
} from 'lucide-react'
import { submitOjtApplication } from '../services/ojtService'
import { validateReferralCode } from '../services/referralService'
import { TRACK_LABELS } from '../utils/formatters'
import { WhatsAppChatButton } from '../components/WhatsAppButton'

const STEPS = ['Personal Details', 'Education', 'OJT Details', 'Confirm']

const COURSES = ['BCS', 'BCA', 'B.Tech', 'BE', 'Diploma', 'MCA', 'Other']
const DURATIONS = [4, 6, 8, 12]
const TRACKS = Object.keys(TRACK_LABELS)

export default function OjtApplyPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [referralStatus, setReferralStatus] = useState(null) // { valid, message }
  const [checkingReferral, setCheckingReferral] = useState(false)

  // Resume state
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeError, setResumeError] = useState(null)

  const {
    register, handleSubmit, trigger, watch, formState: { errors },
  } = useForm({
    defaultValues: {
      gender: '', course: '', trainingMode: '', track: '', durationWeeks: '',
    },
  })

  const values = watch()

  const stepFields = [
    ['name', 'mobile', 'email', 'gender'],
    ['college', 'course', 'year'],
    ['durationWeeks', 'trainingMode', 'track'],
    [],
  ]

  const next = async () => {
    const valid = await trigger(stepFields[step])
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const checkReferral = async () => {
    const code = values.referralCode
    if (!code) {
      setReferralStatus(null)
      return
    }
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
    validateAndSetResume(file)
  }

  const validateAndSetResume = (file) => {
    setResumeError(null)
    const allowed = ['.pdf', '.doc', '.docx']
    const ext = '.' + file.name.split('.').pop().toLowerCase()
    if (!allowed.includes(ext)) {
      setResumeError('Only PDF, DOC, and DOCX files are allowed.')
      return
    }
    const maxBytes = 5 * 1024 * 1024 // 5 MB
    if (file.size > maxBytes) {
      setResumeError('File size exceeds the 5 MB limit. Please select a smaller file.')
      return
    }
    setResumeFile(file)
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
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('mobile', data.mobile)
      formData.append('email', data.email)
      formData.append('gender', data.gender)
      formData.append('college', data.college)
      formData.append('course', data.course)
      formData.append('year', data.year)
      formData.append('durationWeeks', String(data.durationWeeks))
      formData.append('trainingMode', data.trainingMode)
      formData.append('track', data.track)
      if (data.referralCode) {
        formData.append('referralCode', data.referralCode)
      }
      if (resumeFile) {
        formData.append('resume', resumeFile)
      }

      const { data: result } = await submitOjtApplication(formData)
      toast.success('Application submitted successfully!')
      navigate('/application-success', { state: { application: result } })
    } catch (err) {
      toast.error(err.response?.data?.message || err.friendlyMessage || 'Submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[90vh] bg-slate-50/70 py-16">
      <div className="container-page max-w-2xl">
        <div className="text-center">
          <span className="inline-block clay-pill clay-pill-accent mb-3 font-heading text-xs font-bold uppercase tracking-[0.25em]">
            Online Registration
          </span>
          <h1 className="text-3xl font-black text-slate-900 sm:text-4xl tracking-tight font-heading">OJT Application</h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">Complete the steps below to apply for the UPSTAIRS TECHNO OJT program.</p>
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

        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 clay-card !p-6 sm:!p-10">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="label-field">Full Name *</label>
                <input className={`input-field ${errors.name ? 'input-error' : ''}`} {...register('name', { required: 'Full name is required', minLength: { value: 2, message: 'Enter your full name' } })} />
                {errors.name && <p className="error-text">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label-field">Mobile Number *</label>
                <input className={`input-field ${errors.mobile ? 'input-error' : ''}`} {...register('mobile', { required: 'Mobile number is required', pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid Indian mobile number' } })} />
                {errors.mobile && <p className="error-text">{errors.mobile.message}</p>}
              </div>
              <div>
                <label className="label-field">Email Address *</label>
                <input type="email" className={`input-field ${errors.email ? 'input-error' : ''}`} {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' } })} />
                {errors.email && <p className="error-text">{errors.email.message}</p>}
              </div>
              <div>
                <label className="label-field">Gender *</label>
                <select className={`input-field ${errors.gender ? 'input-error' : ''}`} {...register('gender', { required: 'Please select gender' })}>
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
                <input className={`input-field ${errors.college ? 'input-error' : ''}`} {...register('college', { required: 'College name is required' })} />
                {errors.college && <p className="error-text">{errors.college.message}</p>}
              </div>
              <div>
                <label className="label-field">Course / Degree *</label>
                <select className={`input-field ${errors.course ? 'input-error' : ''}`} {...register('course', { required: 'Course is required' })}>
                  <option value="">Select Course</option>
                  {COURSES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.course && <p className="error-text">{errors.course.message}</p>}
              </div>
              <div>
                <label className="label-field">Academic Year *</label>
                <input placeholder="e.g. 3rd Year / Final Year" className={`input-field ${errors.year ? 'input-error' : ''}`} {...register('year', { required: 'Academic year is required' })} />
                {errors.year && <p className="error-text">{errors.year.message}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="label-field">Training Duration *</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {DURATIONS.map((w) => (
                    <label
                      key={w}
                      className={`flex cursor-pointer flex-col items-center rounded-xl border p-3.5 text-center transition ${
                        Number(values.durationWeeks) === w
                          ? 'border-blue-600 bg-blue-50/70 text-blue-700 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <input type="radio" value={w} className="sr-only" {...register('durationWeeks', { required: 'Please select duration' })} />
                      <span className="font-extrabold text-base">{w} Weeks</span>
                    </label>
                  ))}
                </div>
                {errors.durationWeeks && <p className="error-text">{errors.durationWeeks.message}</p>}
              </div>

              <div>
                <label className="label-field">Training Mode *</label>
                <div className="flex gap-4">
                  {['ONLINE', 'OFFLINE'].map((m) => (
                    <label
                      key={m}
                      className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border p-3.5 transition ${
                        values.trainingMode === m
                          ? 'border-blue-600 bg-blue-50/70 text-blue-700 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <input type="radio" value={m} className="sr-only" {...register('trainingMode', { required: 'Please select training mode' })} />
                      <span className="font-semibold text-sm">{m === 'ONLINE' ? 'Online' : 'Offline'}</span>
                    </label>
                  ))}
                </div>
                {errors.trainingMode && <p className="error-text">{errors.trainingMode.message}</p>}
              </div>

              <div>
                <label className="label-field">Training Track *</label>
                <select className={`input-field ${errors.track ? 'input-error' : ''}`} {...register('track', { required: 'Please select track' })}>
                  <option value="">Select Training Track</option>
                  {TRACKS.map((t) => (
                    <option key={t} value={t}>{TRACK_LABELS[t]}</option>
                  ))}
                </select>
                {errors.track && <p className="error-text">{errors.track.message}</p>}
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
                  <input className="input-field" {...register('referralCode')} placeholder="e.g. UPTECH2026" />
                  <button type="button" onClick={checkReferral} disabled={checkingReferral} className="btn-secondary !px-5 !py-2.5 text-sm whitespace-nowrap">
                    {checkingReferral ? <Loader2 size={16} className="animate-spin" /> : 'Validate'}
                  </button>
                </div>
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
                  ['Duration', values.durationWeeks ? `${values.durationWeeks} Weeks` : ''],
                  ['Mode', values.trainingMode],
                  ['Track', TRACK_LABELS[values.track] || values.track],
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
              <button type="button" onClick={next} className="btn-primary !px-6 !py-3">
                Next <ChevronRight size={18} />
              </button>
            ) : (
              <button type="submit" disabled={submitting} className="btn-primary !px-8 !py-3">
                {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Submit OJT Application'}
              </button>
            )}
          </div>
        </form>

        {/* WhatsApp Help Banner */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5 shadow-2xs">
          <div>
            <p className="text-sm font-bold text-emerald-950">Have questions about the OJT program?</p>
            <p className="text-xs text-emerald-800 font-medium">Chat directly with our academic team on WhatsApp for instant guidance.</p>
          </div>
          <WhatsAppChatButton size="sm" label="Chat on WhatsApp" />
        </div>
      </div>
    </div>
  )
}
