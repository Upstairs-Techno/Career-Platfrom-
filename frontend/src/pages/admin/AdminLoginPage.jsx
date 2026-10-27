import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Lock, User, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function AdminLoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setError('')
    setSubmitting(true)
    try {
      await login(data.loginId, data.password)
      const redirectTo = location.state?.from || '/admin/dashboard'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid login ID or password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src="/background ojt.png"
          alt="Upstairs Techno Office Background"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/80 to-white/90" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-1 shadow-clay-pill">
            <img src="/Upstairs Logo.jpeg" alt="Upstairs Techno" className="h-full w-full object-cover" />
          </div>
          <h1 className="mt-4 text-2xl font-black text-slate-900 tracking-tight font-heading">UPSTAIRS TECHNO</h1>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600 font-heading">Admin Portal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="clay-card !p-8 backdrop-blur-xl">
          <h2 className="text-xl font-black text-slate-900 tracking-tight font-heading">Admin Sign In</h2>
          <p className="mt-1 text-xs text-slate-500 font-medium">Enter your administrative credentials to continue</p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <div className="mt-6">
            <label className="label-field">Admin Login ID</label>
            <div className="relative">
              <User size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className={`input-field pl-10 ${errors.loginId ? 'input-error' : ''}`}
                {...register('loginId', { required: 'Login ID is required' })}
                autoComplete="username"
                placeholder="Enter login ID"
              />
            </div>
            {errors.loginId && <p className="error-text">{errors.loginId.message}</p>}
          </div>

          <div className="mt-4">
            <label className="label-field">Password</label>
            <div className="relative">
              <Lock size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                className={`input-field pl-10 ${errors.password ? 'input-error' : ''}`}
                {...register('password', { required: 'Password is required' })}
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full !py-3 !rounded-xl text-sm font-bold tracking-wide">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : 'SIGN IN TO DASHBOARD'}
          </button>
        </form>
      </div>
    </div>
  )
}
