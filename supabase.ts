import { createClient } from '@supabase/supabase-js'

// 配置 Supabase 客户端
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('请配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 用户类型定义
export interface SupabaseUser {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
}

// 保存的行程类型
export interface SavedItinerary {
  id: string
  user_id: string
  destination_id: string
  data: Itinerary
  destination_name: string
  created_at: string
}

export interface Itinerary {
  destinationId: string
  date: string
  totalBudget: string
  transport: string
  items: ItineraryItem[]
  highlights: string[]
  aiComment?: string
}

export interface ItineraryItem {
  time: string
  activity: string
  description: string
  lat: number
  lng: number
  transportInfo?: string
  aiPersonalizedReason?: string
  cost?: string
}