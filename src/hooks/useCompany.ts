import { useState, useEffect } from 'react'
import { blink } from '../blink/client'
import { Company } from '../types'
import { getSubdomain } from '../utils/subdomain'

export function useCompany() {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const subdomain = getSubdomain()
        
        if (!subdomain) {
          setError('No subdomain found')
          setLoading(false)
          return
        }

        const companies = await blink.db.companies.list({
          where: { subdomain },
          limit: 1
        })

        if (companies.length === 0) {
          setError('Company not found')
        } else {
          setCompany(companies[0] as Company)
        }
      } catch (err) {
        setError('Failed to fetch company')
        console.error('Error fetching company:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCompany()
  }, [])

  return { company, loading, error }
}