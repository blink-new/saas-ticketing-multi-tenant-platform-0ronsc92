import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useCompany } from './hooks/useCompany'
import { isMainDomain, getSubdomain } from './utils/subdomain'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './components/dashboard/Dashboard'
import { TicketList } from './components/tickets/TicketList'
import { NewTicketForm } from './components/tickets/NewTicketForm'
import { TicketDetail } from './components/tickets/TicketDetail'
import { LandingPage } from './components/landing/LandingPage'
import { AdminPanel } from './components/admin/AdminPanel'
import { Toaster } from './components/ui/toaster'
import { Button } from './components/ui/button'
import { Card, CardContent } from './components/ui/card'
import { Ticket } from './types'

function AppContent() {
  const subdomain = getSubdomain()
  const { company, loading: companyLoading, error: companyError } = useCompany()
  const { user, currentUser, loading: authLoading, login } = useAuth(company)
  const navigate = useNavigate()
  const location = useLocation()

  // Show admin panel for 'admin' subdomain
  if (subdomain === 'admin') {
    return (
      <>
        <AdminPanel />
        <Toaster />
      </>
    )
  }

  // Show landing page for main domain
  if (isMainDomain()) {
    return (
      <>
        <LandingPage />
        <Toaster />
      </>
    )
  }

  // Loading states
  if (authLoading || companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Company not found
  if (companyError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Company Not Found</h2>
            <p className="text-gray-600 mb-4">
              The subdomain you're trying to access doesn't exist or has been deactivated.
            </p>
            <div className="space-y-2">
              <Button onClick={() => window.location.href = '/?subdomain=admin'} className="w-full">
                Go to Admin Panel
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/?subdomain=demo'} className="w-full">
                Try Demo
              </Button>
              <Button variant="ghost" onClick={() => window.location.href = '/'} className="w-full">
                Go to Main Site
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to {company?.name}
            </h2>
            <p className="text-gray-600 mb-4">
              Please sign in to access the ticketing system.
            </p>
            <Button onClick={login}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // User not found in company database
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Required</h2>
            <p className="text-gray-600 mb-4">
              You need to be added to this company to access the ticketing system.
              Please contact your administrator.
            </p>
            <p className="text-sm text-gray-500">
              User ID: {user.id}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main app layout with routing
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tickets" element={<TicketList />} />
            <Route path="/tickets/new" element={<NewTicketForm />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
            <Route path="/users" element={
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
                <p className="text-gray-600">Coming soon...</p>
              </div>
            } />
            <Route path="/analytics" element={
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics</h3>
                <p className="text-gray-600">Coming soon...</p>
              </div>
            } />
            <Route path="/settings" element={
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Settings</h3>
                <p className="text-gray-600">Coming soon...</p>
              </div>
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
      <Toaster />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App