import { useState, useEffect, useCallback } from 'react'
import { blink } from '../blink/client'
import { User, Company } from '../types'

export function useAuth(company?: Company | null) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const fetchUserDetails = useCallback(async (authUser: any) => {
    if (!company || !authUser) return

    try {
      const users = await blink.db.users.list({
        where: { 
          AND: [
            { companyId: company.id },
            { email: authUser.email }
          ]
        },
        limit: 1
      })

      if (users.length > 0) {
        setCurrentUser(users[0] as User)
      } else {
        // Demo için: eğer kullanıcı yoksa demo admin olarak ekle
        if (company.subdomain === 'demo') {
          const demoUser = {
            id: `demo_user_${Date.now()}`,
            companyId: company.id,
            email: authUser.email,
            name: authUser.displayName || 'Demo User',
            role: 'admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          
          await blink.db.users.create(demoUser)
          setCurrentUser(demoUser as User)
        }
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
    }
  }, [company])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      // Fetch user details from our database
      if (state.user && company) {
        fetchUserDetails(state.user)
      } else {
        setCurrentUser(null)
      }
    })
    return unsubscribe
  }, [fetchUserDetails, company])

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