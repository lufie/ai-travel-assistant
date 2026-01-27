import { supabase, SavedItinerary } from '../supabase'

// 保存行程
export const saveItinerary = async (
  itinerary: Omit<SavedItinerary, 'id' | 'created_at' | 'updated_at'>
): Promise<SavedItinerary | null> => {
  try {
    const { data, error } = await supabase
      .from('saved_itineraries')
      .insert({
        user_id: itinerary.user_id,
        destination_id: itinerary.destination_id,
        destination_name: itinerary.destination_name,
        data: itinerary.data
      })
      .select()
      .single()

    if (error) {
      console.error('保存行程失败:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('保存行程异常:', error)
    return null
  }
}

// 获取用户的保存行程
export const getSavedItineraries = async (userId: string): Promise<SavedItinerary[]> => {
  try {
    const { data, error } = await supabase
      .from('saved_itineraries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取保存行程失败:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('获取保存行程异常:', error)
    return []
  }
}

// 删除保存的行程
export const deleteSavedItinerary = async (itineraryId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('saved_itineraries')
      .delete()
      .eq('id', itineraryId)

    if (error) {
      console.error('删除行程失败:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('删除行程异常:', error)
    return false
  }
}

// 检查行程是否已保存
export const isItinerarySaved = async (userId: string, destinationId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('saved_itineraries')
      .select('id')
      .eq('user_id', userId)
      .eq('destination_id', destinationId)
      .single()

    if (error) {
      return false
    }

    return data !== null
  } catch (error) {
    return false
  }
}

// 检查是否已存在相同行程
export const checkExistingItinerary = async (
  userId: string,
  destinationId: string
): Promise<SavedItinerary | null> => {
  try {
    const { data, error } = await supabase
      .from('saved_itineraries')
      .select('*')
      .eq('user_id', userId)
      .eq('destination_id', destinationId)
      .single()

    if (error) {
      return null
    }

    return data
  } catch (error) {
    return null
  }
}