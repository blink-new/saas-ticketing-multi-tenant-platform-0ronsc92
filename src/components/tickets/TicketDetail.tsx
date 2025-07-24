import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { ArrowLeft, MessageSquare, Clock, User } from 'lucide-react'
import { blink } from '../../blink/client'
import { Ticket, TicketComment } from '../../types'
import { useAuth } from '../../hooks/useAuth'
import { useCompany } from '../../hooks/useCompany'
import { useToast } from '../../hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'

interface TicketDetailProps {
  ticket?: Ticket
  onBack?: () => void
  onTicketUpdated?: () => void
}

export function TicketDetail({ ticket: propTicket, onBack, onTicketUpdated }: TicketDetailProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState<Ticket | null>(propTicket || null)
  const [comments, setComments] = useState<TicketComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(!propTicket)
  const [submitting, setSubmitting] = useState(false)

  const { currentUser } = useAuth()
  const { company } = useCompany()
  const { toast } = useToast()

  const fetchTicket = useCallback(async () => {
    if (!id || !currentUser || !company) return

    try {
      setLoading(true)
      const ticketData = await blink.db.tickets.list({
        where: { 
          id: id,
          company_id: company.id 
        },
        limit: 1
      })

      if (ticketData.length > 0) {
        setTicket(ticketData[0] as Ticket)
      } else {
        toast({
          title: 'Error',
          description: 'Ticket not found',
          variant: 'destructive',
        })
        navigate('/tickets')
      }
    } catch (error) {
      console.error('Error fetching ticket:', error)
      toast({
        title: 'Error',
        description: 'Failed to load ticket',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [id, currentUser, company, toast, navigate])

  const fetchComments = useCallback(async () => {
    if (!ticket) return

    try {
      const commentsData = await blink.db.ticket_comments.list({
        where: { ticket_id: ticket.id },
        orderBy: { created_at: 'asc' }
      })
      setComments(commentsData as TicketComment[])
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }, [ticket])

  useEffect(() => {
    if (!propTicket && id) {
      fetchTicket()
    }
  }, [fetchTicket, id, propTicket])

  useEffect(() => {
    if (ticket) {
      fetchComments()
    }
  }, [fetchComments, ticket])

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket || !currentUser) return

    try {
      await blink.db.tickets.update(ticket.id, {
        status: newStatus,
        updated_at: new Date().toISOString()
      })

      setTicket({ ...ticket, status: newStatus })
      
      toast({
        title: 'Success',
        description: 'Ticket status updated',
      })

      if (onTicketUpdated) {
        onTicketUpdated()
      }
    } catch (error) {
      console.error('Error updating ticket:', error)
      toast({
        title: 'Error',
        description: 'Failed to update ticket status',
        variant: 'destructive',
      })
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticket || !currentUser || !newComment.trim()) return

    try {
      setSubmitting(true)
      
      const commentData = {
        ticket_id: ticket.id,
        user_id: currentUser.id,
        content: newComment.trim(),
        created_at: new Date().toISOString()
      }

      await blink.db.ticket_comments.create(commentData)
      
      setNewComment('')
      await fetchComments()
      
      toast({
        title: 'Success',
        description: 'Comment added successfully',
      })
    } catch (error) {
      console.error('Error adding comment:', error)
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate('/tickets')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading ticket...</p>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Ticket not found</h3>
        <p className="text-gray-600 mb-4">The ticket you're looking for doesn't exist.</p>
        <Button onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tickets
        </Button>
      </div>
    )
  }

  const canUpdateStatus = currentUser?.role === 'admin' || currentUser?.role === 'agent'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tickets
        </Button>
        
        {canUpdateStatus && (
          <Select value={ticket.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Ticket Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl mb-2">{ticket.title}</CardTitle>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                </div>
                <div className="flex items-center">
                  <User className="mr-1 h-4 w-4" />
                  Ticket #{ticket.id.slice(-8)}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Badge className={getStatusColor(ticket.status)}>
                {ticket.status.replace('_', ' ')}
              </Badge>
              <Badge className={getPriorityColor(ticket.priority)}>
                {ticket.priority}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No comments yet.</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-blue-200 pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      User {comment.user_id.slice(-8)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="mt-6 pt-4 border-t">
            <div className="space-y-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="resize-none"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  size="sm"
                >
                  {submitting ? 'Adding...' : 'Add Comment'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}