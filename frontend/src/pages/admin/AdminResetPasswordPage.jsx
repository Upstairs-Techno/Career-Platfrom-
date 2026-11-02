import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { resetAdminPassword } from '../../services/adminService'

export default function AdminResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [verifying, setVerifying] = useState(true)
  const [sessionValid, setSessionValid] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)
  const [countdown, setCountdown] = useState(3)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: 'onChange' })

  const newPassword = watch('password', '')

  // Check recovery session on mount
  useEffect(() => {
    let mounted = true

    async function checkRecoverySession() {
      try {
        if (!supabase) {
          if (mounted) {
            setSessionValid(false)
            setVerifying(false)
          }
          return
        }

        // Check hash or search params for error messages from Supabase redirect
        const hash = window.location.hash
        const errorCode = searchParams.get('error_code') || new URLSearchParams(hash.substring(1)).get('error_code')
        const errorDescription = searchParams.get('error_description') || new URLSearchParams(hash.substring(1)).get('error_description')

        if (errorCode || errorDescription) {
          if (mounted) {
            setServerError(errorDescription || 'The password reset link is invalid or has expired.')
            setSessionValid(false)
            setVerifying(false)
          }
          return
        }

        // Get active session (Supabase client auto-parses recovery tokens in URL when detectSessionInUrl is true)
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          if (mounted) {
            setSessionValid(true)
            setVerifying(false)
          }
          return
        }

        // Also check if auth event fires
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY' || (session && event === 'SIGNED_IN')) {
            if (mounted) {
              setSessionValid(true)
              setVerifying(false)
            }
          }
        })

        // Timeout fallback: if no session within 2 seconds, check session once more and complete verification
        const timeoutId = setTimeout(() => {
          if (mounted) {
            supabase.auth.getSession().then(({ data }) => {
              if (mounted) {
                setSessionValid(Boolean(data?.session))
                setVerifying(false)
              }
            })
          }
        }, 2000)

        return () => {
          clearTimeout(timeoutId)
          authListener?.subscription?.unsubscribe()
        }
      } catch (err) {
        if (mounted) {
          setServerError('Unable to verify recovery link. Please try again.')
          setSessionValid(false)
          setVerifying(false)
        }
      }
    }

    checkRecoverySession()

    return () => {
      mounted = false
    }
  }, [searchParams])

  // Countdown timer on success
  useEffect(() => {
    if (!resetSuccess) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/admin', { replace: true })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [resetSuccess, navigate])

  const onSubmit = async (data) => {
    setServerError('')
    setSubmitting(true)

    try {
      // 1. Update password via Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (authError) {
        throw authError
      }

      // 2. Also notify backend to verify active admin and synchronize
      try {
        await resetAdminPassword(data.password)
      } catch (backendErr) {
        // Log backend warning if any, but Supabase auth password was updated
        console.warn('Backend sync response:', backendErr)
      }

      // 3. Sign out of recovery session to require fresh sign-in with new password
      await supabase.auth.signOut()

      setResetSuccess(true)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to reset password. The link may have expired.'
      setServerError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Password requirement checks
  const criteria = [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'At least one uppercase letter (A-Z)', met: /[A-Z]/.test(newPassword) },
    { label: 'At least one lowercase letter (a-z)', met: /[a-z]/.test(newPassword) },
    { label: 'At least one number (0-9)', met: /\d/.test(newPassword) },
    { label: 'At least one special character (!@#$%^&*)', met: /[^A-Za-z0-9]/.test(newPassword) },
  ]

  const isStrong = criteria.every((c) => c.met)

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src="/background ojt.png"
          alt="Upstairs Techno Office Background"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/85 to-white/95 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-950 p-1 shadow-clay-card">
            <img src="/Upstairs Logo.jpeg" alt="Upstairs Techno" className="h-full w-full object-cover rounded-xl" />
          </div>
          <h1 className="mt-3 text-2xl font-black text-slate-900 tracking-tight font-heading">UPSTAIRS TECHNO</h1>
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-0.5 text-xs font-bold tracking-wider uppercase text-blue-700 border border-blue-200/60 font-heading">
              <KeyRound size={12} className="text-blue-600" /> Password Recovery
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="clay-card !p-8 sm:!p-9 backdrop-blur-xl bg-white/95 border border-slate-200/80 shadow-clay-card">
          {verifying ? (
            <div className="py-12 text-center">
              <Loader2 size={36} className="mx-auto animate-spin text-blue-600" />
              <p className="mt-4 text-sm font-semibold text-slate-700 font-heading">Verifying recovery link...</p>
              <p className="mt-1 text-xs text-slate-500">Please wait while we validate your secure token.</p>
            </div>
          ) : resetSuccess ? (
            <div className="text-center py-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 mb-4 shadow-sm">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight font-heading">Password Reset Complete!</h2>
              <p className="mt-2 text-sm text-slate-600">
                Your administrator password has been updated securely. You can now log in using your new credentials.
              </p>

              <div className="mt-6 rounded-xl bg-blue-50/70 border border-blue-100 p-3 text-xs text-blue-700 font-medium">
                Redirecting to Admin Sign In in <strong>{countdown}</strong> seconds...
              </div>

              <button
                type="button"
                onClick={() => navigate('/admin', { replace: true })}
                className="btn-primary mt-5 w-full !py-3 !rounded-xl text-sm font-bold tracking-wide inline-flex items-center justify-center gap-2"
              >
                Sign In Now <ArrowRight size={16} />
              </button>
            </div>
          ) : !sessionValid ? (
            <div className="text-center py-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mb-4 shadow-sm">
                <AlertTriangle size={30} />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight font-heading">Link Expired or Invalid</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                This password reset link is invalid, has expired, or has already been used. For your security, recovery links are time-limited.
              </p>

              {serverError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 font-medium">
                  {serverError}
                </div>
              )}

              <button
                type="button"
                onClick={() => navigate('/admin', { replace: true })}
                className="btn-primary mt-6 w-full !py-3 !rounded-xl text-sm font-bold tracking-wide"
              >
                Request a New Reset Link
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-black text-slate-900 tracking-tight font-heading">Create New Password</h2>
                <p className="mt-1 text-xs text-slate-500 font-medium">
                  Please choose a strong, unique password for your administrator account.
                </p>
              </div>

              {serverError && (
                <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/90 p-3 text-xs font-medium text-red-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
                  <span>{serverError}</span>
                </div>
              )}

              <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="label-field text-xs font-bold text-slate-700">New Password</label>
                  <div className="relative">
                    <Lock size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`input-field pl-10 pr-11 text-sm ${errors.password ? 'input-error' : ''}`}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      aria-invalid={Boolean(errors.password)}
                      {...register('password', {
                        required: 'New password is required.',
                        validate: () => isStrong || 'Password must meet all security requirements below.',
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="error-text text-xs mt-1">{errors.password.message}</p>}
                </div>

                {/* Password Criteria Checklist */}
                <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-3 space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-700 font-heading uppercase tracking-wider mb-1">
                    Password Requirements:
                  </p>
                  {criteria.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                          item.met ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {item.met ? '✓' : '•'}
                      </div>
                      <span className={item.met ? 'text-slate-800 font-medium' : 'text-slate-500'}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="label-field text-xs font-bold text-slate-700">Confirm New Password</label>
                  <div className="relative">
                    <Lock size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`input-field pl-10 pr-11 text-sm ${errors.confirmPassword ? 'input-error' : ''}`}
                      placeholder="Re-enter new password"
                      autoComplete="new-password"
                      aria-invalid={Boolean(errors.confirmPassword)}
                      {...register('confirmPassword', {
                        required: 'Please confirm your new password.',
                        validate: (val) => val === newPassword || 'Passwords do not match.',
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="error-text text-xs mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting || !isStrong}
                  className="btn-primary mt-6 w-full !py-3 !rounded-xl text-sm font-bold tracking-wide"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin" /> Updating Password...
                    </span>
                  ) : (
                    'UPDATE PASSWORD'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/admin', { replace: true })}
            className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors font-heading"
          >
            ← Return to Admin Sign In
          </button>
        </div>
      </div>
    </div>
  )
}
