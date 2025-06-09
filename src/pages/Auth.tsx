
import React, { useState, useEffect } from 'react'
import { AuthForm } from '@/components/AuthForm'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

const Auth = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && !loading) {
      navigate('/')
    }
  }, [user, loading, navigate])

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Expense Tracker Pro
          </h1>
          <p className="text-muted-foreground">
            Manage your finances with ease
          </p>
        </div>
        <AuthForm mode={mode} onToggleMode={toggleMode} />
      </div>
    </div>
  )
}

export default Auth
