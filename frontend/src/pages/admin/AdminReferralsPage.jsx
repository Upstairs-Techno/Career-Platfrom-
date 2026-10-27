import React, { useEffect, useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import {
  Plus, Loader2, Trash2, Pencil, X, Copy, Check, Search, Filter,
  Users, Phone, Mail, Sparkles
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import {
  getAllReferralCodes, createReferralCode, updateReferralCode, deleteReferralCode,
} from '../../services/referralService'
import EmptyState from '../../components/EmptyState'
import ConfirmDialog from '../../components/ConfirmDialog'
import { formatDate } from '../../utils/formatters'

function ReferralFormModal({ open, onClose, onSaved, editing, existingCodes = [] }) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      memberName: '',
      mobileNumber: '',
      email: '',
      gender: '',
      code: '',
      description: '',
      maxUses: 100,
      active: true,
    },
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (editing) {
        reset({
          memberName: editing.memberName || '',
          mobileNumber: editing.mobileNumber || '',
          email: editing.email || '',
          gender: editing.gender || '',
          code: editing.code || '',
          description: editing.description || '',
          maxUses: editing.maxUses || 100,
          active: editing.active !== undefined ? editing.active : true,
        })
      } else {
        reset({
          memberName: '',
          mobileNumber: '',
          email: '',
          gender: '',
          code: '',
          description: '',
          maxUses: 100,
          active: true,
        })
      }
    }
  }, [open, editing, reset])

  if (!open) return null

  const handleGenerateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let rand = ''
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    const namePrefix = (watch('memberName') || 'UPTECH')
      .trim()
      .replace(/[^a-zA-Z]/g, '')
      .toUpperCase()
      .slice(0, 4)
    const prefix = namePrefix.length >= 3 ? namePrefix : 'UPTECH'
    setValue('code', `${prefix}${rand}`, { shouldValidate: true })
  }

  const onSubmit = async (data) => {
    // Check client-side duplicate code
    const normalizedCode = data.code?.trim().toUpperCase()
    if (normalizedCode) {
      const isDuplicate = existingCodes.some(
        (c) => c.code.toUpperCase() === normalizedCode && (!editing || c.id !== editing.id)
      )
      if (isDuplicate) {
        toast.error('This referral code is already in use. Please use a unique code.')
        return
      }
    }

    setSaving(true)
    try {
      const payload = {
        memberName: data.memberName.trim(),
        mobileNumber: data.mobileNumber.trim(),
        email: data.email.trim().toLowerCase(),
        gender: data.gender,
        code: normalizedCode || undefined,
        description: data.description?.trim() || undefined,
        maxUses: Number(data.maxUses) || 100,
        active: Boolean(data.active),
      }

      if (editing) {
        await updateReferralCode(editing.id, payload)
        toast.success('Referral code & member details updated.')
      } else {
        await createReferralCode(payload)
        toast.success('Referral code created and assigned to marketing member.')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save referral code.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {editing ? 'Edit Referral Code Assignment' : 'Create Referral Code'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Assign code to an authorized Marketing Team Member
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          {/* 1. Marketing Team Member Name */}
          <div>
            <label className="label-field font-bold text-slate-900">
              Marketing Team Member Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`input-field ${errors.memberName ? 'input-error' : ''}`}
              placeholder="e.g., Rajesh Kumar"
              {...register('memberName', {
                required: 'Team member name is required',
                minLength: { value: 2, message: 'Name must have at least 2 characters' },
              })}
            />
            {errors.memberName && <p className="error-text">{errors.memberName.message}</p>}
          </div>

          {/* 2 & 3. Mobile Number & Email ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label-field font-bold text-slate-900">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                className={`input-field ${errors.mobileNumber ? 'input-error' : ''}`}
                placeholder="10-digit phone number"
                {...register('mobileNumber', {
                  required: 'Mobile number is required',
                  pattern: {
                    value: /^[0-9+\-\s]{8,15}$/,
                    message: 'Enter a valid phone number',
                  },
                })}
              />
              {errors.mobileNumber && <p className="error-text">{errors.mobileNumber.message}</p>}
            </div>

            <div>
              <label className="label-field font-bold text-slate-900">
                Email ID <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className={`input-field ${errors.email ? 'input-error' : ''}`}
                placeholder="member@upstairstechno.com"
                {...register('email', {
                  required: 'Email ID is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email address',
                  },
                })}
              />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>
          </div>

          {/* 4. Gender */}
          <div>
            <label className="label-field font-bold text-slate-900">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              className={`input-field ${errors.gender ? 'input-error' : ''}`}
              {...register('gender', { required: 'Please select gender' })}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            {errors.gender && <p className="error-text">{errors.gender.message}</p>}
          </div>

          {/* 5. Referral Code & Generator */}
          <div>
            <div className="flex items-center justify-between">
              <label className="label-field font-bold text-slate-900">
                Referral Code
              </label>
              <button
                type="button"
                onClick={handleGenerateCode}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                <Sparkles size={13} /> Auto-generate code
              </button>
            </div>
            <input
              type="text"
              className={`input-field uppercase tracking-wider font-mono font-bold ${errors.code ? 'input-error' : ''}`}
              placeholder="Leave blank to auto-generate (e.g. UPTECH8A)"
              {...register('code')}
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Assigned specifically to this team member for candidate campaign tracking.
            </p>
          </div>

          {/* Status & Max Uses */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-3">
            <div>
              <span className="text-sm font-bold text-slate-900">Code Status</span>
              <p className="text-xs text-slate-500">Enable or disable candidate submissions with this code</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                {...register('active')}
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-slate-900 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1 border border-slate-200 text-sm font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-navy flex-1 text-sm font-bold !py-3"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving…
                </>
              ) : editing ? (
                'Save Changes'
              ) : (
                'Create Referral Code'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminReferralsPage() {
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [copiedCode, setCopiedCode] = useState(null)

  // Search and Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await getAllReferralCodes()
      setCodes(data)
    } catch {
      toast.error('Failed to load referral codes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteReferralCode(deleteTarget.id)
      toast.success(`Referral code ${deleteTarget.code} deleted.`)
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete referral code.')
    } finally {
      setDeleting(false)
    }
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success(`Copied code "${code}" to clipboard.`)
    setTimeout(() => {
      setCopiedCode(null)
    }, 2000)
  }

  // Filter and search logic
  const filteredCodes = useMemo(() => {
    return codes.filter((c) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        (c.code && c.code.toLowerCase().includes(q)) ||
        (c.memberName && c.memberName.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.mobileNumber && c.mobileNumber.toLowerCase().includes(q))

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && c.active) ||
        (statusFilter === 'INACTIVE' && !c.active)

      return matchesSearch && matchesStatus
    })
  }, [codes, searchQuery, statusFilter])

  return (
    <div className="space-y-6">
      {/* Header with Title and "Create Referral Code" Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Referral Code Management
          </h2>
          <p className="mt-1 text-sm text-slate-600 font-medium">
            Manage and assign candidate intake referral codes to your Marketing Team members.
          </p>
        </div>

        <button
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
          className="btn-navy shadow-md !py-3 !px-5 text-sm font-bold"
        >
          <Plus size={18} /> Create Referral Code
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <div className="relative flex-1 sm:max-w-md">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search member name, code, email, mobile…"
            className="input-field pl-10 text-sm !py-2.5"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field text-sm !py-2.5 font-medium sm:w-40"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Showing {filteredCodes.length} of {codes.length}
          </span>
        </div>
      </div>

      {/* Referral Codes Listing */}
      {loading ? (
        <div className="card space-y-4 animate-pulse p-8">
          <div className="h-6 w-1/4 rounded bg-slate-200" />
          <div className="h-10 w-full rounded bg-slate-100" />
          <div className="h-10 w-full rounded bg-slate-100" />
          <div className="h-10 w-full rounded bg-slate-100" />
        </div>
      ) : filteredCodes.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No matching referral codes found' : 'No referral codes created yet'}
          description={
            searchQuery
              ? 'Try changing your search query or status filter.'
              : 'Click "Create Referral Code" above to assign your first marketing team member.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                    Marketing Team Member
                  </th>
                  <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                    Mobile Number
                  </th>
                  <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                    Email ID
                  </th>
                  <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                    Gender
                  </th>
                  <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                    Referral Code
                  </th>
                  <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                    Applications
                  </th>
                  <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                    Status
                  </th>
                  <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                    Created Date
                  </th>
                  <th className="whitespace-nowrap px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredCodes.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Marketing Team Member Name */}
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs">
                          {c.memberName?.charAt(0)?.toUpperCase() || 'M'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{c.memberName || 'Unassigned / System'}</p>
                          <p className="text-[11px] text-slate-500">Marketing Team</p>
                        </div>
                      </div>
                    </td>

                    {/* Mobile Number */}
                    <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-700">
                      {c.mobileNumber ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Phone size={13} className="text-slate-400" />
                          {c.mobileNumber}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Email ID */}
                    <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-700">
                      {c.email ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Mail size={13} className="text-slate-400" />
                          {c.email}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Gender */}
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-700">
                      {c.gender ? (
                        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          {c.gender}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Referral Code with Copy */}
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <button
                        onClick={() => copyCode(c.code)}
                        className="group inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/60 px-3 py-1 font-mono text-xs font-extrabold text-blue-700 transition hover:bg-blue-100 hover:border-blue-300 active:scale-95"
                        title="Click to copy code"
                      >
                        <span>{c.code}</span>
                        {copiedCode === c.code ? (
                          <Check size={13} className="text-emerald-600" />
                        ) : (
                          <Copy size={13} className="text-blue-500 group-hover:text-blue-700" />
                        )}
                      </button>
                    </td>

                    {/* Applications Used */}
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600">
                      <span className="font-semibold text-slate-900">{c.ojtApplications + c.internshipApplications}</span>
                      <span className="text-slate-400 text-[11px] ml-1">
                        (OJT: {c.ojtApplications}, Int: {c.internshipApplications})
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                          c.active
                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border border-slate-200 bg-slate-100 text-slate-600'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            c.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        {c.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs font-medium text-slate-500">
                      {formatDate(c.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditing(c)
                            setModalOpen(true)
                          }}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
                          title="Edit referral code"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
                          title="Delete referral code"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Dialog */}
      <ReferralFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={load}
        editing={editing}
        existingCodes={codes}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Referral Code?"
        description={`Are you sure you want to delete referral code "${deleteTarget?.code}" assigned to ${
          deleteTarget?.memberName || 'marketing team member'
        }? If this code was already used for applications, consider setting it to Inactive instead.`}
        confirmLabel="Delete Code"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  )
}
