import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Ticket, Clock, Users, TrendingUp } from 'lucide-react'
import { blink } from '../../blink/client'
import { useAuth } from '../../hooks/useAuth'
import { useCompany } from '../../hooks/useCompany'

interface DashboardStats {
  totalTickets: number
  openTickets: number
  inProgressTickets: number
  resolvedTickets: number
  avgResolutionTime: string
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    avgResolutionTime: 'N/A'
  })
  const [loading, setLoading] = useState(true)
  const [recentTickets, setRecentTickets] = useState<any[]>([])

  const { currentUser } = useAuth()
  const { company } = useCompany()

  const fetchDashboardData = useCallback(async () => {
    if (!company) return

    try {
      setLoading(true)
      
      // Fetch all tickets for the company
      const tickets = await blink.db.tickets.list({
        where: { company_id: company.id },
        orderBy: { created_at: 'desc' },
        limit: 1000
      })

      // Calculate stats
      const totalTickets = tickets.length
      const openTickets = tickets.filter(t => t.status === 'open').length
      const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length
      const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length

      // Calculate average resolution time
      const resolvedWithTime = tickets.filter(t => t.resolved_at && t.created_at)
      let avgResolutionTime = 'N/A'
      
      if (resolvedWithTime.length > 0) {
        const totalTime = resolvedWithTime.reduce((sum, ticket) => {
          const created = new Date(ticket.created_at).getTime()
          const resolved = new Date(ticket.resolved_at!).getTime()
          return sum + (resolved - created)
        }, 0)
        
        const avgMs = totalTime / resolvedWithTime.length
        const avgHours = Math.round(avgMs / (1000 * 60 * 60))
        avgResolutionTime = `${avgHours}h`
      }

      setStats({
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        avgResolutionTime
      })

      // Set recent tickets (last 5)
      setRecentTickets(tickets.slice(0, 5))
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [company])

  useEffect(() => {
    if (currentUser && company) {
      fetchDashboardData()
    }
  }, [currentUser, company, fetchDashboardData])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Overview of your ticketing system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.openTickets}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgressTickets}</div>
            <p className="text-xs text-muted-foreground">Being worked on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.avgResolutionTime}</div>
            <p className="text-xs text-muted-foreground">Average time</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTickets.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No tickets yet</p>
          ) : (
            <div className="space-y-4">
              {recentTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{ticket.title}</h4>
                    <p className="text-sm text-gray-600 truncate">{ticket.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}