import { useState, useEffect, useCallback } from 'react'
import { blink } from '../blink/client'
import { User } from '../types'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const fetchUserDetails = useCallback(async (userId: string) => {
    try {
      const users = await blink.db.users.list({
        where: { id: userId },
        limit: 1
      })
      if (users.length > 0) {
        setCurrentUser(users[0] as User)
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      // Fetch user details from our database
      if (state.user) {
        fetchUserDetails(state.user.id)
      } else {
        setCurrentUser(null)
      }
    })
    return unsubscribe
  }, [fetchUserDetails])

  const login = () => {
    blink.auth.login()
  }

  const logout = () => {
    blink.auth.logout()
    setCurrentUser(null)
  }

  return {
    user,
    currentUser,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  }
}