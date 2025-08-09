"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useSupabaseAuth } from './SupabaseAuthContext'

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
    if (supabaseConfigured && supabaseAuthenticated && supabaseUser && userProfile) {
      const mappedUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: userProfile.full_name,
        userType: userProfile.user_role === 'entendant' ? 'hearing' : 'deaf'
      }
      setUser(mappedUser)
      setUserType(mappedUser.userType)
    } else if (!supabaseAuthenticated) {
      // Déconnecté de Supabase, nettoyer l'état local
      setUser(null)
    }
  }, [supabaseConfigured, supabaseAuthenticated, supabaseUser, userProfile])

  const login = async (email: string, password: string, type: "hearing" | "deaf"): Promise<boolean> => {
    try {
      // Essayer d'abord avec Supabase si configuré
      if (supabaseConfigured && supabaseService) {
        console.log('🔐 Tentative de connexion avec Supabase...')
        await supabaseService.signIn(email, password)
        // L'état sera mis à jour automatiquement via useEffect
        return true
      } else {
        // Fallback vers l'authentification simulée
        console.log('🔐 Connexion simulée (Supabase non configuré)')
        await new Promise((resolve) => setTimeout(resolve, 1500))
        
        if (email && password) {
          const mockUser: User = {
            id: "1",
            email,
            name: email.split("@")[0],
            userType: type,
          }
          setUser(mockUser)
          setUserType(type)
          return true
        }
      }
    } catch (error) {
      console.error('❌ Erreur de connexion:', error)
      return false
    }
    return false
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
      // Essayer d'abord avec Supabase si configuré
      if (supabaseConfigured && supabaseService) {
        console.log('📝 Tentative d\'inscription avec Supabase...')
        
        // Convertir le type vers le format Supabase
        const userRole: 'entendant' | 'sourd' = type === 'hearing' ? 'entendant' : 'sourd'
        
        // S'assurer que le type d'utilisateur est bien défini
        if (!type) {
          console.warn('⚠️ Type d\'utilisateur non défini, utilisation de la valeur par défaut: entendant')
          type = 'hearing'
        }
        
        console.log(`📝 Inscription de l'utilisateur avec le rôle: ${userRole}`)
        
        const result = await supabaseService.signUp(email, password, name, userRole)
        
        if (result?.user) {
          console.log('✅ Utilisateur inscrit avec succès, mise à jour du contexte local')
          
          // Mettre à jour l'utilisateur dans le contexte
          const mappedUser: User = {
            id: result.user.id,
            email: email,
            name: name,
            userType: type,
          }
          
          // Mettre à jour l'état local
          setUser(mappedUser)
          setUserType(type)
          
          // S'assurer que le type d'utilisateur est correctement enregistré dans le stockage local
          try {
            await AsyncStorage.setItem('userType', type)
            console.log('✅ Type d\'utilisateur enregistré dans le stockage local:', type)
          } catch (storageError) {
            console.error('❌ Erreur lors de l\'enregistrement du type d\'utilisateur dans le stockage local:', storageError)
          }
          
          return true
        }
        
        // Si on arrive ici, l'inscription a peut-être réussi mais nécessite une confirmation par email
        console.log('ℹ️ L\'inscription nécessite une confirmation par email')
        Alert.alert(
          "Vérifiez votre email",
          "Un lien de confirmation a été envoyé à votre adresse email. Veuillez vérifier votre boîte de réception et cliquer sur le lien pour confirmer votre compte.",
          [{ 
            text: "OK"
          }]
        )
        
        // Retourner false pour indiquer que l'utilisateur doit confirmer son email
        // et appeler le callback onSuccess si fourni
        if (onSuccess) onSuccess()
        return false
      } else {
        // Fallback vers l'authentification simulée
        console.log('📝 Inscription simulée (Supabase non configuré)')
        await new Promise((resolve) => setTimeout(resolve, 1500))
        
        if (email && password && name) {
          const mockUser: User = {
            id: "1",
            email,
            name,
            userType: type,
          }
          setUser(mockUser)
          setUserType(type)
          return true
        }
      }
    } catch (error: any) {
      console.error('❌ Erreur d\'inscription:', error)
      
      // Afficher un message d'erreur plus convivial
      let errorMessage = "Une erreur est survenue lors de l'inscription"
      
      if (error.message.includes('already registered')) {
        errorMessage = "Cette adresse email est déjà utilisée. Essayez de vous connecter."
      } else if (error.message.includes('email')) {
        errorMessage = "Veuillez entrer une adresse email valide"
      } else if (error.message.includes('password')) {
        errorMessage = "Le mot de passe doit contenir au moins 6 caractères"
      }
      
      Alert.alert("Erreur d'inscription", errorMessage)
      return false
    }
    return false
  }

  const logout = () => {
    setUser(null)
    setUserType(null)
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
