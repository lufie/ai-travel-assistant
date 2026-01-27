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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 检查当前用户状态
    const initAuth = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setIsLoading(false)
    }

    initAuth()

    // 监听认证状态变化
    const unsubscribe = onAuthStateChange((newUser) => {
      setUser(newUser)
      setIsLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const login = async () => {
    await signInWithGoogle()
  }

  const logout = async () => {
    await signOut()
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}