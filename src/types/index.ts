export interface Company {
  id: string
  name: string
  subdomain: string
  logo_url?: string
  primary_color: string
  created_at: string
  updated_at: string
  is_active: number
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'agent' | 'customer'
  company_id: string
  avatar_url?: string
  is_active: number
  created_at: string
  updated_at: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category?: string
  company_id: string
  customer_id: string
  assigned_to?: string
  created_at: string
  updated_at: string
  resolved_at?: string
  customer?: User
  assignee?: User
}

export interface TicketComment {
  id: string
  ticket_id: string
  user_id: string
  content: string
  is_internal: number
  created_at: string
  user?: User
}