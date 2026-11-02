import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { requestAdminPasswordReset } from '../../services/adminService'

export default function AdminLoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = location.state?.from || '/admin/dashboard'
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, location.state, navigate])

  // View state: 'login' | 'forgot'
  const [view, setView] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [submittingLogin, setSubmittingLogin] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Forgot password states
  const [submittingForgot, setSubmittingForgot] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState('')
  const [cooldown, setCooldown] = useState(0)

  // Forms
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
  } = useForm({ mode: 'onTouched', reValidateMode: 'onChange' })

  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    reset: resetForgotForm,
    formState: { errors: forgotErrors },
  } = useForm({ mode: 'onTouched', reValidateMode: 'onChange' })

  // Cooldown timer for password reset requests
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  // Admin login submission
  const onLoginSubmit = async (data) => {
    setLoginError('')
    setSubmittingLogin(true)
    try {
      await login(data.loginId, data.password)
      const redirectTo = location.state?.from || '/admin/dashboard'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.friendlyMessage ||
        (err.message?.includes('401')
          ? 'Invalid Admin Login ID or password. Please try again.'
          : 'Invalid login ID or password.')
      setLoginError(message)
    } finally {
      setSubmittingLogin(false)
    }
  }

  // Forgot password recovery submission
  const onForgotSubmit = async (data) => {
    if (cooldown > 0) return
    setForgotError('')
    setForgotSuccess('')
    setSubmittingForgot(true)

    try {
      const res = await requestAdminPasswordReset(data.email)
      const successMessage =
        res.data?.message ||
        'If an active administrator account exists with this email address, a password recovery link has been sent.'
      setForgotSuccess(successMessage)
      setCooldown(60) // 60s cooldown to prevent spamming
      resetForgotForm()
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.friendlyMessage ||
        'Unable to process password reset request. Please check your connection and try again.'
      setForgotError(message)
    } finally {
      setSubmittingForgot(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
      {/* Background Image Layer with Refined Gradient Overlay */}
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
            <img
              src="/Upstairs Logo.jpeg"
              alt="Upstairs Techno"
              className="h-full w-full object-cover rounded-xl"
            />
          </div>
          <h1 className="mt-3 text-2xl font-black text-slate-900 tracking-tight font-heading">
            UPSTAIRS TECHNO
          </h1>
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-0.5 text-xs font-bold tracking-wider uppercase text-blue-700 border border-blue-200/60 font-heading">
              <ShieldCheck size={13} className="text-blue-600" />
              Admin Portal
            </span>
          </div>
        </div>

        {/* Card Container */}
        <div className="clay-card !p-8 sm:!p-9 backdrop-blur-xl bg-white/95 border border-slate-200/80 shadow-clay-card transition-all duration-300">
          {view === 'login' ? (
            /* ─────────────────────────────────────────────────────────────
               LOGIN FORM
               ───────────────────────────────────────────────────────────── */
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-black text-slate-900 tracking-tight font-heading">
                  Admin Sign In
                </h2>
                <p className="mt-1 text-xs text-slate-500 font-medium">
                  Enter your administrative credentials to continue
                </p>
              </div>

              {loginError && (
                <div
                  role="alert"
                  className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/90 p-3 text-xs font-medium text-red-700 animate-fadeIn"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
                  <span>{loginError}</span>
                </div>
              )}

              <form noValidate onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-4">
                {/* Admin Login ID */}
                <div>
                  <label htmlFor="loginId" className="label-field text-xs font-bold text-slate-700">
                    Admin Login ID
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="loginId"
                      className={`input-field pl-10 pr-4 text-sm ${
                        loginErrors.loginId ? 'input-error' : ''
                      }`}
                      aria-invalid={Boolean(loginErrors.loginId)}
                      aria-describedby={loginErrors.loginId ? 'loginId-error' : undefined}
                      {...registerLogin('loginId', {
                        required: 'Admin Login ID is required.',
                        validate: (value) =>
                          Boolean(value?.trim()) || 'Login ID cannot be only spaces.',
                        maxLength: {
                          value: 100,
                          message: 'Login ID must be 100 characters or fewer.',
                        },
                      })}
                      autoComplete="username"
                      placeholder="Enter admin login ID"
                      disabled={submittingLogin}
                    />
                  </div>
                  {loginErrors.loginId && (
                    <p id="loginId-error" className="error-text text-xs mt-1">
                      {loginErrors.loginId.message}
                    </p>
                  )}
                </div>

                {/* Password with Show/Hide Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="label-field !mb-0 text-xs font-bold text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotError('')
                        setForgotSuccess('')
                        setView('forgot')
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded font-heading transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`input-field pl-10 pr-11 text-sm ${
                        loginErrors.password ? 'input-error' : ''
                      }`}
                      aria-invalid={Boolean(loginErrors.password)}
                      aria-describedby={loginErrors.password ? 'password-error' : undefined}
                      {...registerLogin('password', {
                        required: 'Password is required.',
                        validate: (value) =>
                          Boolean(value?.trim()) || 'Password cannot be empty or only spaces.',
                        maxLength: { value: 1024, message: 'Password is too long.' },
                      })}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      disabled={submittingLogin}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={0}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <p id="password-error" className="error-text text-xs mt-1">
                      {loginErrors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submittingLogin}
                  className="btn-primary mt-6 w-full !py-3 !rounded-xl text-sm font-bold tracking-wide transition-all shadow-clay-btn-primary hover:shadow-clay-btn-primary-hover active:scale-[0.98]"
                >
                  {submittingLogin ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      SIGNING IN...
                    </span>
                  ) : (
                    'SIGN IN TO DASHBOARD'
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* ─────────────────────────────────────────────────────────────
               FORGOT PASSWORD VIEW
               ───────────────────────────────────────────────────────────── */
            <div>
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setLoginError('')
                    setView('login')
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors mb-3 font-heading"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
                <h2 className="text-xl font-black text-slate-900 tracking-tight font-heading">
                  Password Recovery
                </h2>
                <p className="mt-1 text-xs text-slate-500 font-medium">
                  Enter your registered administrator email to receive a password reset link.
                </p>
              </div>

              {forgotError && (
                <div
                  role="alert"
                  className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/90 p-3 text-xs font-medium text-red-700 animate-fadeIn"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess ? (
                <div className="py-2 text-center animate-fadeIn">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 mb-4 shadow-sm">
                    <CheckCircle2 size={30} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    Recovery Link Dispatched
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed px-2">
                    {forgotSuccess}
                  </p>
                  <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200/70 p-3 text-xs text-slate-500">
                    ⏳ <strong>Notice:</strong> The recovery link is valid for <strong>1 hour</strong>. Please check both your inbox and spam folder.
                  </div>

                  {cooldown > 0 && (
                    <p className="mt-3 text-xs text-slate-400">
                      Resend available in {cooldown}s
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setLoginError('')
                      setView('login')
                    }}
                    className="btn-primary mt-5 w-full !py-2.5 !rounded-xl text-xs font-bold tracking-wide"
                  >
                    RETURN TO SIGN IN
                  </button>
                </div>
              ) : (
                <form noValidate onSubmit={handleSubmitForgot(onForgotSubmit)} className="space-y-4">
                  {/* Administrator Registered Email */}
                  <div>
                    <label htmlFor="recoveryEmail" className="label-field text-xs font-bold text-slate-700">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="recoveryEmail"
                        type="email"
                        className={`input-field pl-10 pr-4 text-sm ${
                          forgotErrors.email ? 'input-error' : ''
                        }`}
                        aria-invalid={Boolean(forgotErrors.email)}
                        aria-describedby={forgotErrors.email ? 'email-error' : undefined}
                        {...registerForgot('email', {
                          required: 'Registered email address is required.',
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Please enter a valid email address.',
                          },
                          maxLength: {
                            value: 150,
                            message: 'Email address must be 150 characters or fewer.',
                          },
                        })}
                        autoComplete="email"
                        placeholder="admin@upstairstechno.com"
                        disabled={submittingForgot || cooldown > 0}
                      />
                    </div>
                    {forgotErrors.email && (
                      <p id="email-error" className="error-text text-xs mt-1">
                        {forgotErrors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-3 text-xs text-blue-700 flex items-start gap-2">
                    <KeyRound size={15} className="mt-0.5 shrink-0 text-blue-600" />
                    <span>
                      A secure, time-limited password recovery link will be sent to this email address if it is registered to an active administrator.
                    </span>
                  </div>

                  {/* Send Recovery Button */}
                  <button
                    type="submit"
                    disabled={submittingForgot || cooldown > 0}
                    className="btn-primary mt-6 w-full !py-3 !rounded-xl text-sm font-bold tracking-wide transition-all shadow-clay-btn-primary hover:shadow-clay-btn-primary-hover active:scale-[0.98]"
                  >
                    {submittingForgot ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        SENDING RECOVERY LINK...
                      </span>
                    ) : cooldown > 0 ? (
                      `RESEND IN ${cooldown}s`
                    ) : (
                      'SEND RECOVERY LINK'
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Security Footer Note */}
        <div className="mt-6 text-center text-xs text-slate-500 font-medium">
          Protected by enterprise-grade multi-factor security &amp; encryption.
        </div>
      </div>
    </div>
  )
}
