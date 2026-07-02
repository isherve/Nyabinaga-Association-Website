import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ACCESS } from '../config/access'

// Bump the version suffix whenever you want to force everyone to re-authenticate
// (e.g. after changing a password). Old unlocked sessions become invalid.
const DETAILS_KEY = 'nyabinaga_details_unlocked_v2'
const ADMIN_KEY = 'nyabinaga_admin_v2'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [detailsUnlocked, setDetailsUnlocked] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Restore session state (persists until the browser tab is closed).
  useEffect(() => {
    try {
      setDetailsUnlocked(sessionStorage.getItem(DETAILS_KEY) === '1')
      setIsAdmin(sessionStorage.getItem(ADMIN_KEY) === '1')
    } catch {
      /* sessionStorage unavailable — stay locked */
    }
  }, [])

  const unlockDetails = useCallback((password) => {
    if (password === ACCESS.detailsPassword) {
      setDetailsUnlocked(true)
      try {
        sessionStorage.setItem(DETAILS_KEY, '1')
      } catch {
        /* ignore */
      }
      return true
    }
    return false
  }, [])

  const loginAdmin = useCallback((password) => {
    if (password === ACCESS.adminPassword) {
      setIsAdmin(true)
      setDetailsUnlocked(true)
      try {
        sessionStorage.setItem(ADMIN_KEY, '1')
        sessionStorage.setItem(DETAILS_KEY, '1')
      } catch {
        /* ignore */
      }
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setIsAdmin(false)
    setDetailsUnlocked(false)
    try {
      sessionStorage.removeItem(ADMIN_KEY)
      sessionStorage.removeItem(DETAILS_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(
    () => ({
      // Admins can always see details; members can unlock details separately.
      canViewDetails: detailsUnlocked || isAdmin,
      isAdmin,
      unlockDetails,
      loginAdmin,
      logout,
    }),
    [detailsUnlocked, isAdmin, unlockDetails, loginAdmin, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
