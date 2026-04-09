"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useSupabaseAuth } from './SupabaseAuthContext'
import { performMaintenance } from '../utils/userCleanup'

interface User {
  id: string
  email: string
  name: string
  userType: "hearing" | "deaf"
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string, userType: "hearing" | "deaf") => Promise<boolean>
  register: (email: string, password: string, name: string, userType: "hearing" | "deaf") => Promise<boolean>
  logout: () => void
  userType: "hearing" | "deaf" | null
  setUserType: (type: "hearing" | "deaf") => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userType, setUserType] = useState<"hearing" | "deaf" | null>(null)
  
  // Intégration Supabase
  const { 
    supabaseService, 
    isAuthenticated: supabaseAuthenticated, 
    user: supabaseUser, 
    userProfile,
    isConfigured: supabaseConfigured 
  } = useSupabaseAuth()
  
  // Synchroniser avec l'utilisateur Supabase si disponible
  useEffect(() => {
    if (supabaseConfigured && supabaseAuthenticated && supabaseUser) {
      console.log('🔄 Synchronisation utilisateur Supabase...')
      console.log('👤 Supabase User:', supabaseUser)
      console.log('📋 User Profile:', userProfile)
      
      const mappedUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: userProfile?.full_name || supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.given_name || supabaseUser.email?.split('@')[0] || 'Utilisateur',
        userType: userProfile?.user_role === 'sourd' ? 'deaf' : 'hearing'
      }
      
      console.log('🔍 Détails du mapping utilisateur:', {
        supabaseUserEmail: supabaseUser.email,
        userProfileFullName: userProfile?.full_name,
        userMetadataFullName: supabaseUser.user_metadata?.full_name,
        userMetadataName: supabaseUser.user_metadata?.name,
        userMetadataGivenName: supabaseUser.user_metadata?.given_name,
        finalMappedName: mappedUser.name
      })
      
      console.log('✅ Utilisateur mappé:', mappedUser)
      setUser(mappedUser)
      setUserType(mappedUser.userType)
    } else if (!supabaseAuthenticated) {
      // Déconnecté de Supabase, nettoyer l'état local
      console.log('🧹 Nettoyage état utilisateur (déconnecté)')
      setUser(null)
    }
  }, [supabaseConfigured, supabaseAuthenticated, supabaseUser, userProfile])

  const login = async (email: string, password: string, type: "hearing" | "deaf"): Promise<boolean> => {
    try {
      // Simulation forcée pour passer direct
      console.log('🔐 Connexion simulée (Forcée)')
      await new Promise((resolve) => setTimeout(resolve, 800))
      
      const mockUser: User = {
        id: "1",
        email: email || "test@example.com",
        name: email ? email.split("@")[0] : "Testeur",
        userType: type,
      }
      setUser(mockUser)
      setUserType(type)
      
      try {
        await AsyncStorage.setItem('user', JSON.stringify(mockUser))
        await AsyncStorage.setItem('userType', type)
        await AsyncStorage.setItem('isAuthenticated', 'true')
      } catch (e) {
        console.log('Erreur AsyncStorage', e)
      }

      return true
    } catch (error) {
      console.error('❌ Erreur de connexion simulée:', error)
      return false
    }
  }

  // Fonction pour gérer la navigation après l'inscription
  // La navigation réelle est gérée dans le composant AuthScreen via le callback onSuccess

  const register = async (
    email: string,
    password: string,
    name: string,
    type: "hearing" | "deaf",
    onSuccess?: () => void
  ): Promise<boolean> => {
    try {
      // Simulation forcée pour passer direct
      console.log('📝 Inscription simulée (Forcée)')
      await new Promise((resolve) => setTimeout(resolve, 800))
      
      const mockUser: User = {
        id: "1",
        email: email || "test@example.com",
        name: name || "Testeur",
        userType: type,
      }
      setUser(mockUser)
      setUserType(type)
      
      try {
        await AsyncStorage.setItem('user', JSON.stringify(mockUser))
        await AsyncStorage.setItem('userType', type)
        await AsyncStorage.setItem('isAuthenticated', 'true')
      } catch (e) {
        console.log('Erreur AsyncStorage', e)
      }
      
      if (onSuccess) onSuccess()
      return true
    } catch (error: any) {
      console.error('❌ Erreur d\'inscription simulée:', error)
      Alert.alert("Erreur d'inscription", "Une erreur est survenue lors de l'inscription")
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setUserType(null)
  }

  const performUserMaintenance = async () => {
    try {
      if (!supabaseService) {
        console.warn('⚠️ Service Supabase non disponible pour la maintenance')
        return false
      }

      console.log('🔧 Début de la maintenance des utilisateurs...')
      const maintenanceResult = await performMaintenance(supabaseService)
      
      if (maintenanceResult.success) {
        console.log('✅ Maintenance réussie:', maintenanceResult.summary)
        return true
      } else {
        console.warn('⚠️ Maintenance terminée avec des problèmes:', maintenanceResult.summary)
        return false
      }
    } catch (error) {
      console.error('❌ Erreur lors de la maintenance:', error)
      return false
    }
  }

  // Créer la valeur du contexte avec toutes les méthodes et états nécessaires
  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    register: async (email: string, password: string, name: string, type: "hearing" | "deaf") => {
      return register(email, password, name, type)
    },
    logout,
    userType,
    setUserType
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
