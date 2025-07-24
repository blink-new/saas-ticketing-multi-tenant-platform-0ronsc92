import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  Settings, 
  BarChart3,
  Plus
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { currentUser } = useAuth()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'agent'] },
    { id: 'tickets', label: 'Tickets', icon: Ticket, roles: ['admin', 'agent', 'customer'] },
    { id: 'users', label: 'Users', icon: Users, roles: ['admin'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'agent'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin'] },
  ]

  const filteredItems = menuItems.filter(item => 
    !currentUser || item.roles.includes(currentUser.role)
  )

  return (
    <div className="flex h-full w-64 flex-col bg-gray-50 border-r">
      <div className="p-6">
        <Button 
          onClick={() => onTabChange('new-ticket')}
          className="w-full"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {filteredItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start',
                activeTab === item.id && 'bg-blue-50 text-blue-700 hover:bg-blue-50'
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.label}
            </Button>
          )
        })}
      </nav>
    </div>
  )
}