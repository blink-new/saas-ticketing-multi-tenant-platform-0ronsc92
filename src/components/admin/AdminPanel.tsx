import { useState, useEffect } from 'react'
import { blink } from '../../blink/client'
import { Company, User, Ticket } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Building2, Users, Ticket as TicketIcon, Plus, Settings } from 'lucide-react'

export function AdminPanel() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  // New company form
  const [newCompany, setNewCompany] = useState({
    name: '',
    subdomain: ''
  })

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load companies
      const companiesData = await blink.db.companies.list({
        orderBy: { createdAt: 'desc' }
      })
      setCompanies(companiesData as Company[])

      // Load users
      const usersData = await blink.db.users.list({
        orderBy: { createdAt: 'desc' }
      })
      setUsers(usersData as User[])

      // Load tickets
      const ticketsData = await blink.db.tickets.list({
        orderBy: { createdAt: 'desc' },
        limit: 50
      })
      setTickets(ticketsData as Ticket[])

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const createCompany = async () => {
    if (!newCompany.name || !newCompany.subdomain) return

    try {
      const company = await blink.db.companies.create({
        name: newCompany.name,
        subdomain: newCompany.subdomain.toLowerCase(),
        isActive: true,
        createdAt: new Date().toISOString()
      })

      setCompanies(prev => [company as Company, ...prev])
      setNewCompany({ name: '', subdomain: '' })
    } catch (error) {
      console.error('Error creating company:', error)
    }
  }

  const accessCompany = (company: Company) => {
    // Redirect to company subdomain
    const currentUrl = new URL(window.location.href)
    currentUrl.searchParams.set('subdomain', company.subdomain)
    window.location.href = currentUrl.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SaaS Ticketing Platform - Admin Panel
          </h1>
          <p className="text-gray-600">
            Manage companies, users, and tickets across all tenants
          </p>
        </div>

        <Tabs defaultValue="companies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Companies ({companies.length})
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <TicketIcon className="h-4 w-4" />
              Tickets ({tickets.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="companies" className="space-y-6">
            {/* Create New Company */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Company
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Company Name"
                    value={newCompany.name}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Subdomain"
                    value={newCompany.subdomain}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, subdomain: e.target.value }))}
                  />
                  <Button onClick={createCompany} disabled={!newCompany.name || !newCompany.subdomain}>
                    Create Company
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Companies List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <Card key={company.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{company.name}</span>
                      <Badge variant={company.isActive ? "default" : "secondary"}>
                        {company.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Subdomain:</strong> {company.subdomain}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Created:</strong> {new Date(company.createdAt).toLocaleDateString()}
                      </p>
                      <div className="pt-4">
                        <Button 
                          onClick={() => accessCompany(company)}
                          className="w-full"
                        >
                          Access Company
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-sm text-gray-500">
                          Company: {companies.find(c => c.id === user.companyId)?.name || 'Unknown'}
                        </p>
                      </div>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{ticket.title}</p>
                        <p className="text-sm text-gray-600">
                          Company: {companies.find(c => c.id === ticket.companyId)?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{ticket.status}</Badge>
                        <Badge variant="secondary">{ticket.priority}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Building2 className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                          <p className="text-2xl font-bold">{companies.length}</p>
                          <p className="text-sm text-gray-600">Total Companies</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Users className="h-8 w-8 mx-auto text-green-600 mb-2" />
                          <p className="text-2xl font-bold">{users.length}</p>
                          <p className="text-sm text-gray-600">Total Users</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <TicketIcon className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                          <p className="text-2xl font-bold">{tickets.length}</p>
                          <p className="text-sm text-gray-600">Total Tickets</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}