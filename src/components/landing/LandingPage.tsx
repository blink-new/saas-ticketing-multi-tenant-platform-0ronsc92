import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useState } from 'react'
import { blink } from '../../blink/client'
import { useToast } from '../../hooks/use-toast'
import { Building2, Ticket, Users, BarChart3 } from 'lucide-react'

export function LandingPage() {
  const [companyName, setCompanyName] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!companyName.trim() || !subdomain.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9-]+$/
    if (!subdomainRegex.test(subdomain)) {
      toast({
        title: "Error",
        description: "Subdomain can only contain lowercase letters, numbers, and hyphens",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      
      // Check if subdomain already exists
      const existingCompanies = await blink.db.companies.list({
        where: { subdomain },
        limit: 1
      })

      if (existingCompanies.length > 0) {
        toast({
          title: "Error",
          description: "This subdomain is already taken",
          variant: "destructive"
        })
        return
      }

      const companyId = `company_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      await blink.db.companies.create({
        id: companyId,
        name: companyName.trim(),
        subdomain: subdomain.trim().toLowerCase(),
        primary_color: '#2563EB',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: 1
      })

      toast({
        title: "Success",
        description: `Company created! Visit ${subdomain}.yourplatform.com to get started.`
      })

      // Reset form
      setCompanyName('')
      setSubdomain('')
      
    } catch (error) {
      console.error('Error creating company:', error)
      toast({
        title: "Error",
        description: "Failed to create company. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">TicketSaaS</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Multi-Tenant
            <span className="text-blue-600"> Ticketing System</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Give your company its own subdomain and dedicated ticketing system. 
            Manage support tickets independently in a secure, multi-tenant environment.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Ticket className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Complete Ticket Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Full lifecycle ticket management with status tracking, priorities, 
                categories, and real-time updates.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Role-Based Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Admin, Agent, and Customer roles with appropriate permissions 
                and access levels for each user type.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Analytics & Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Comprehensive analytics dashboard with resolution times, 
                ticket volumes, and performance metrics.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Company Registration */}
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Create Your Company</CardTitle>
            <p className="text-center text-gray-600">
              Get started with your own ticketing system
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your Company Name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subdomain">Subdomain</Label>
                <div className="flex">
                  <Input
                    id="subdomain"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                    placeholder="yourcompany"
                    className="rounded-r-none"
                    required
                  />
                  <div className="bg-gray-100 border border-l-0 rounded-r-md px-3 py-2 text-sm text-gray-600">
                    .yourplatform.com
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Only lowercase letters, numbers, and hyphens allowed
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Company'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Info */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            For demo purposes, add <code className="bg-gray-100 px-2 py-1 rounded">?subdomain=yourcompany</code> to the URL
          </p>
          <p className="text-sm text-gray-500">
            In production, this would work with actual subdomains
          </p>
        </div>
      </main>
    </div>
  )
}