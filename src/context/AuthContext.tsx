import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

interface AuthContextValue {
  user: User | null
  loading: boolean
  recovering: boolean
  logout: () => Promise<void>
  finishRecovery: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [recovering, setRecovering] = useState(false)

  useEffect(() => {
    let mounted = true
    const waitingRecovery =
      typeof window !== 'undefined' &&
      (/[?&]code=/.test(window.location.search) ||
        /type=recovery/.test(window.location.search + window.location.hash) ||
        /mode=reset/.test(window.location.search))

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setUser(data.session?.user ?? null)
      if (!waitingRecovery) setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'PASSWORD_RECOVERY') setRecovering(true)
      if (event === 'SIGNED_OUT') setRecovering(false)
      setLoading(false)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRecovering(false)
  }, [])

  const finishRecovery = useCallback(() => {
    setRecovering(false)
  }, [])

  const value = useMemo(
    () => ({ user, loading, recovering, logout, finishRecovery }),
    [user, loading, recovering, logout, finishRecovery],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
