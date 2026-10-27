import { invokeFunction } from './api'

export const validateReferralCode = (code) =>
  invokeFunction('validate-referral', { method: 'POST', body: { code } })

// Admin-only
export const getAllReferralCodes = () => invokeFunction('manage-referrals')
export const getReferralCode = (id) => invokeFunction(`manage-referrals?id=${encodeURIComponent(id)}`)
export const createReferralCode = (payload) =>
  invokeFunction('manage-referrals', { method: 'POST', body: payload })
export const updateReferralCode = (id, payload) =>
  invokeFunction(`manage-referrals?id=${encodeURIComponent(id)}`, { method: 'PUT', body: payload })
export const deleteReferralCode = (id) =>
  invokeFunction(`manage-referrals?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
