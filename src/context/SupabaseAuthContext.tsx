/**
 * Context d'authentification Supabase pour l'application Sensora
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { getSupabaseService, isSupabaseConfigured } from '../config/supabaseConfig'
import SupabaseService, { DatabaseUser } from '../services/SupabaseService'

interface SupabaseAuthContextType {
  // État d'authentification
  user: User | null
  userProfile: DatabaseUser | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Configuration
  isConfigured: boolean
  
  // Actions d'authentification
  signUp: (email: string, password: string, fullName: string, userRole?: 'entendant' | 'sourd') => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  
  // Service Supabase
  supabaseService: SupabaseService | null
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined)

interface SupabaseAuthProviderProps {
  children: ReactNode
}

export const SupabaseAuthProvider: React.FC<SupabaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<DatabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [supabaseService, setSupabaseService] = useState<SupabaseService | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)

  // Initialisation du service Supabase
  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        if (isSupabaseConfigured()) {
          const service = getSupabaseService()
          setSupabaseService(service)
          setIsConfigured(true)
          // Récupérer session courante et profil
          const session = await service.getCurrentSession()
          if (session?.user) {
            setUser(session.user)
            const profile = await service.getUserProfile(session.user.id)
            setUserProfile(profile)
          }
        } else {
          console.warn('⚠️ Supabase non configuré - désactivé')
          setSupabaseService(null)
          setIsConfigured(false)
        }
        
        console.log('✅ Supabase Auth Context initialisé')
      } catch (error) {
        console.error('❌ Erreur initialisation Supabase:', error)
        setIsConfigured(false)
      } finally {
        setIsLoading(false)
      }
    }

    initializeSupabase()
  }, [])

  // Inscription
  const signUp = async (email: string, password: string, fullName: string, userRole: 'entendant' | 'sourd' = 'entendant') => {
    if (!supabaseService) {
      throw new Error('Service Supabase non disponible')
    }

    setIsLoading(true)
    try {
      const { user: newUser } = await supabaseService.signUp(email, password, fullName, userRole)
      
      if (newUser) {
        setUser(newUser)
        
        // Charger le profil utilisateur
        const profile = await supabaseService.getUserProfile(newUser.id)
        setUserProfile(profile)
      }
      
      console.log('✅ Inscription réussie via Context')
    } catch (error) {
      console.error('❌ Erreur inscription via Context:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Connexion
  const signIn = async (email: string, password: string) => {
    if (!supabaseService) {
      throw new Error('Service Supabase non disponible')
    }

    setIsLoading(true)
    try {
      const { user: loggedUser } = await supabaseService.signIn(email, password)
      
      if (loggedUser) {
        setUser(loggedUser)
        
        // Charger le profil utilisateur
        const profile = await supabaseService.getUserProfile(loggedUser.id)
        setUserProfile(profile)
      }
      
      console.log('✅ Connexion réussie via Context')
    } catch (error) {
      console.error('❌ Erreur connexion via Context:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Déconnexion
  const signOut = async () => {
    if (!supabaseService) {
      throw new Error('Service Supabase non disponible')
    }

    setIsLoading(true)
    try {
      await supabaseService.signOut()
      setUser(null)
      setUserProfile(null)
      
      console.log('✅ Déconnexion réussie via Context')
    } catch (error) {
      console.error('❌ Erreur déconnexion via Context:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value: SupabaseAuthContextType = {
    // État
    user,
    userProfile,
    isLoading,
    isAuthenticated: !!user,
    isConfigured,
    
    // Actions
    signUp,
    signIn,
    signOut,
    
    // Service
    supabaseService,
  }

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  )
}

// Hook pour utiliser le context
export const useSupabaseAuth = (): SupabaseAuthContextType => {
  const context = useContext(SupabaseAuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseAuth doit être utilisé dans un SupabaseAuthProvider')
  }
  return context
}

export default SupabaseAuthContext
