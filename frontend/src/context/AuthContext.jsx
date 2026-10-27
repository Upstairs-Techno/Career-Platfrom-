import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { adminLogin as apiAdminLogin } from '../services/adminService'
import { getAdminProfile } from '../services/adminService'
import { isSupabaseConfigured, supabase } from '../services/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined

    let active = true
    const restoreAdmin = async (session) => {
      setToken(session?.access_token || null)
      if (!session) {
        setAdmin(null)
        return
      }
      try {
        const { data } = await getAdminProfile()
        if (active) setAdmin(data)
      } catch {
        if (active) {
          setAdmin(null)
          await supabase.auth.signOut()
        }
      }
    }

    supabase.auth.getSession().then(({ data }) => restoreAdmin(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token || null)
      if (!session) setAdmin(null)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const login = useCallback(async (loginId, password) => {
    const { data } = await apiAdminLogin({ loginId, password })
    const { error } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })
    if (error) throw error
    setToken(data.session.access_token)
    setAdmin(data.admin)
    return data
  }, [])

  const logout = useCallback(() => {
    supabase?.auth.signOut()
    setToken(null)
    setAdmin(null)
  }, [])

  const isAuthenticated = Boolean(token)

  return (
    <AuthContext.Provider value={{ admin, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
