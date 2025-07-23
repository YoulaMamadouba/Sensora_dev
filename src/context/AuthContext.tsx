"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"

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

  const login = async (email: string, password: string, type: "hearing" | "deaf"): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (email && password) {
      const mockUser: User = {
        id: "1",
        email,
        name: email.split("@")[0],
        userType: type,
      }
      setUser(mockUser)
      return true
    }
    return false
  }

  const register = async (
    email: string,
    password: string,
    name: string,
    type: "hearing" | "deaf",
  ): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (email && password && name) {
      const mockUser: User = {
        id: "1",
        email,
        name,
        userType: type,
      }
      setUser(mockUser)
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    setUserType(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        userType,
        setUserType,
      }}
    >
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
