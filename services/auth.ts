import { supabase } from '../supabase'

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  provider?: string
}

// Google 登录
export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })

    if (error) {
      console.error('Google 登录失败:', error)
      return null
    }

    return data.user as unknown as User
  } catch (error) {
    console.error('Google 登录异常:', error)
    return null
  }
}

// 获取当前用户
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('获取用户失败:', error)
      return null
    }

    if (user) {
      return {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
        provider: user.identities?.[0]?.provider
      }
    }

    return null
  } catch (error) {
    console.error('获取用户异常:', error)
    return null
  }
}

// 登出
export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('登出失败:', error)
    }
  } catch (error) {
    console.error('登出异常:', error)
  }
}

// 监听认证状态变化
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      const user: User = {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.name || session.user.user_metadata?.full_name,
        avatar_url: session.user.user_metadata?.avatar_url,
        provider: session.identities?.[0]?.provider
      }
      callback(user)
    } else if (event === 'SIGNED_OUT') {
      callback(null)
    }
  })
}

// 检查用户是否已登录
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser()
  return user !== null
}