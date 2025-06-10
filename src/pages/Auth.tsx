
import React, { useState, useEffect } from 'react'
import { AuthForm } from '@/components/AuthForm'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Loader2, DollarSign } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

const Auth = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

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
      <div className="mobile-min-vh flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 safe-top">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className={`mobile-min-vh flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 ${isMobile ? 'safe-top safe-bottom px-4 py-6' : 'p-4'}`}>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-full">
              <DollarSign className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
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
