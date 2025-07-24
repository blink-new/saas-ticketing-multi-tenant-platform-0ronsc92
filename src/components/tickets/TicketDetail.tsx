import { useState, useEffect, useCallback } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { ArrowLeft, MessageSquare, Clock, User } from 'lucide-react'
import { Ticket, TicketComment } from '../../types'
import { useAuth } from '../../hooks/useAuth'
import { blink } from '../../blink/client'
import { useToast } from '../../hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'

interface TicketDetailProps {
  ticket: Ticket
  onBack: () => void
  onTicketUpdated: () => void
}

export function TicketDetail({ ticket, onBack, onTicketUpdated }: TicketDetailProps) {
  const [comments, setComments] = useState<TicketComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [commentsLoading, setCommentsLoading] = useState(true)
  
  const { currentUser } = useAuth()
  const { toast } = useToast()

  const fetchComments = useCallback(async () => {
    try {
      setCommentsLoading(true)
      const commentData = await blink.db.ticket_comments.list({
        where: { ticket_id: ticket.id },
        orderBy: { created_at: 'asc' },
        limit: 100
      })
      setComments(commentData as TicketComment[])
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setCommentsLoading(false)
    }
  }, [ticket.id])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleStatusChange = async (newStatus: string) => {
    try {
      setLoading(true)
      await blink.db.tickets.update(ticket.id, {
        status: newStatus,
        updated_at: new Date().toISOString(),
        ...(newStatus === 'resolved' && { resolved_at: new Date().toISOString() })
      })
      
      toast({
        title: "Success",
        description: "Ticket status updated successfully"
      })
      
      onTicketUpdated()
    } catch (error) {
      console.error('Error updating ticket:', error)
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser) return

    try {
      setLoading(true)
      
      const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      await blink.db.ticket_comments.create({
        id: commentId,
        ticket_id: ticket.id,
        user_id: currentUser.id,
        content: newComment.trim(),
        is_internal: 0,
        created_at: new Date().toISOString()
      })

      // Update ticket's updated_at timestamp
      await blink.db.tickets.update(ticket.id, {
        updated_at: new Date().toISOString()
      })

      setNewComment('')
      fetchComments()
      onTicketUpdated()
      
      toast({
        title: "Success",
        description: "Comment added successfully"
      })
    } catch (error) {
      console.error('Error adding comment:', error)
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
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

  const canUpdateStatus = currentUser?.role === 'admin' || currentUser?.role === 'agent'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tickets
        </Button>
      </div>

      {/* Ticket Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl font-semibold mb-2">
                {ticket.title}
              </CardTitle>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  Created {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                </div>
                {ticket.category && (
                  <div>Category: {ticket.category}</div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
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
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>
            
            {canUpdateStatus && (
              <div className="flex items-center space-x-4 pt-4 border-t">
                <label className="text-sm font-medium">Update Status:</label>
                <Select 
                  value={ticket.status} 
                  onValueChange={handleStatusChange}
                  disabled={loading}
                >
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
              </div>
            )}
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
        <CardContent>
          <div className="space-y-4">
            {commentsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No comments yet</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-blue-200 pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-sm">
                        {comment.user?.name || 'Unknown User'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))
            )}

            {/* Add Comment */}
            <div className="border-t pt-4">
              <div className="space-y-3">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleAddComment}
                    disabled={loading || !newComment.trim()}
                  >
                    {loading ? 'Adding...' : 'Add Comment'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}