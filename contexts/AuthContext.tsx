import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, getCurrentUser, onAuthStateChange, signInWithGoogle, signOut } from '../services/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = async () => {
    // 暂时禁用登录功能
    console.warn('登录功能暂时禁用')
  }

  const logout = async () => {
    // 暂时禁用登出功能
    console.warn('登出功能暂时禁用')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
