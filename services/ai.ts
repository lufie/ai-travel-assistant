import axios from 'axios'

interface AIResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class AIService {
  private apiKeys: string[]
  private currentIndex: number = 0

  constructor(apiKeys: string[]) {
    this.apiKeys = apiKeys.filter(Boolean)
    if (this.apiKeys.length === 0) {
      console.warn('没有配置 AI API Key')
    }
  }

  private getNextKey(): string | null {
    if (this.apiKeys.length === 0) return null
    const key = this.apiKeys[this.currentIndex]
    this.currentIndex = (this.currentIndex + 1) % this.apiKeys.length
    return key
  }

  // 生成旅行建议
  async generateTravelAdvice(userInput: string, lang: string = 'zh'): Promise<string> {
    const apiKey = this.getNextKey()
    if (!apiKey) {
      return lang === 'zh' ? 'AI 服务暂时不可用，请稍后再试' : 'AI service temporarily unavailable, please try later'
    }

    try {
      const response = await axios.post('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        model: 'doubao-pro-32k',
        messages: [
          {
            role: 'system',
            content: lang === 'zh'
              ? '你是一个智能旅行助手，请简洁友好地回复用户，引导用户查看地图上的目的地。'
              : 'You are a smart travel assistant. Please reply concisely and guide users to check the map.'
          },
          {
            role: 'user',
            content: userInput
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      const aiResponse: AIResponse = response.data.choices[0].message
      return aiResponse.content
    } catch (error: any) {
      console.error('AI 请求失败:', error)
      return lang === 'zh' ? '抱歉，我暂时无法处理您的请求。' : 'Sorry, I cannot process your request right now.'
    }
  }

  // 生成旅行行程
  async generateItinerary(destinationName: string, preferences: string, lang: string = 'zh'): Promise<any> {
    const apiKey = this.getNextKey()
    if (!apiKey) return null

    try {
      const response = await axios.post('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        model: 'doubao-pro-32k',
        messages: [
          {
            role: 'system',
            content: lang === 'zh'
              ? `你是一个旅行规划专家。请为用户生成"${destinationName}"的一日游行程。
              用户偏好：${preferences}
              请以 JSON 格式返回，包含以下字段：
              {
                "date": "YYYY-MM-DD",
                "totalBudget": "预算",
                "transport": "交通方式",
                "highlights": ["亮点1", "亮点2"],
                "aiComment": "AI评论",
                "items": [
                  {
                    "time": "09:00",
                    "activity": "活动名称",
                    "description": "活动描述",
                    "lat": 纬度,
                    "lng": 经度,
                    "transportInfo": "交通信息",
                    "aiPersonalizedReason": "个性化理由",
                    "cost": "费用"
                  }
                ]
              }`
              : `You are a travel planning expert. Generate a one-day itinerary for "${destinationName}".
              User preferences: ${preferences}
              Return in JSON format with: date, totalBudget, transport, highlights, aiComment, items (with time, activity, description, lat, lng, transportInfo, aiPersonalizedReason, cost)`
          },
          {
            role: 'user',
            content: `请生成${destinationName}的详细行程`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      const aiResponse = response.data.choices[0].message
      try {
        return JSON.parse(aiResponse.content)
      } catch (parseError) {
        console.error('AI 响应解析失败:', parseError, aiResponse.content)
        return null
      }
    } catch (error: any) {
      console.error('AI 行程生成失败:', error)
      return null
    }
  }

  // 搜索全球城市
  async searchGlobalCity(query: string, lang: string = 'zh'): Promise<any> {
    const apiKey = this.getNextKey()
    if (!apiKey) return null

    try {
      const response = await axios.post('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        model: 'doubao-pro-32k',
        messages: [
          {
            role: 'system',
            content: lang === 'zh'
              ? `用户在搜索城市"${query}"。请返回匹配的真实城市信息。
              以 JSON 格式返回：{ "city": "城市名", "country": "国家名", "code": "机场代码", "flag": "国旗表情" }`
              : `User is searching for city "${query}". Return real city information in JSON: { "city": "City Name", "country": "Country", "code": "Airport Code", "flag": "Flag Emoji" }`
          },
          {
            role: 'user',
            content: `搜索城市：${query}`
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      const aiResponse = response.data.choices[0].message
      try {
        const result = JSON.parse(aiResponse.content)
        return { ...result, id: `ai-${Date.now()}` }
      } catch (parseError) {
        console.error('城市搜索解析失败:', parseError, aiResponse.content)
        return null
      }
    } catch (error: any) {
      console.error('城市搜索失败:', error)
      return null
    }
  }

  // 搜索旅行目的地
  async searchDestinations(
    userQuery: string,
    lang: string = 'zh',
    excludedIds: string[] = [],
    maxResults: number = 10
  ): Promise<{
    destinations: Array<{
      id: string
      name: string
      location: string
      lat: number
      lng: number
      reason: string
      imageUrl: string
      distance: string
      suggestedTransport: string
      rating: number
      budget: string
    }>
    message: string
  } | null> {
    const apiKey = this.getNextKey()
    if (!apiKey) return null

    const excludeText = excludedIds.length > 0 ? `\n之前已推荐过的目的地ID（请避免重复）：${excludedIds.join(', ')}` : ''

    const systemPrompt = lang === 'zh'
      ? `你是一个智能旅行推荐助手。需要根据用户需求，从网络上搜索并推荐真实的旅行目的地。

搜索来源：小红书、马蜂窝、携程、去哪儿、TripAdvisor 等旅游平台
推荐范围：中国及全球热门旅行目的地

任务要求：
1. 根据用户需求 "${userQuery}"，搜索并推荐最匹配的目的地（最多${maxResults}个）
2. 每个推荐必须包含：
   - name: 目的地名称（中文）
   - location: 具体位置（如：北京怀柔、天津意式风情区）
   - lat: 纬度（北京区域约39.5-41.0，天津约39.0-40.0，其他地区根据实际位置估算）
   - lng: 经度（北京区域约116.0-117.0，天津约117.0-118.0，其他地区根据实际位置估算）
   - reason: 推荐理由（1-2句话，结合用户需求说明为什么适合）
   - distance: 距离北京的大致距离（如：15km、120km、280km）
   - suggestedTransport: 推荐交通方式（如：地铁、高铁、自驾）
   - imageUrl: 图片URL（使用 unsplash.com 的旅行主题图片，格式：https://images.unsplash.com/photo-{随机ID}?auto=format&fit=crop&w=300&q=80）
   - rating: 评分（4.0-5.0之间）
   - budget: 预算（如：¥200、免费、¥400）
3. 如果用户追问"还有其他"，${excludeText ? '之前推荐过的不要再重复' : '推荐新的目的地'}
4. 返回标准 JSON 格式，不要有任何其他文字说明

返回格式示例：
{
  "destinations": [
    {
      "id": "dest-001",
      "name": "目的地名称",
      "location": "具体位置",
      "lat": 39.9,
      "lng": 116.4,
      "reason": "推荐理由...",
      "distance": "距离",
      "suggestedTransport": "交通方式",
      "imageUrl": "图片URL",
      "rating": 4.8,
      "budget": "¥200"
    }
  ],
  "message": "简短回复（50字以内）"
}`
      : `You are a smart travel assistant. Search for real destinations from the web based on user needs.

Search sources: XiaoHongShu, Mafengwo, Ctrip, Qunar, TripAdvisor, etc.
Coverage: Popular destinations in China and worldwide

Requirements:
1. Based on user need "${userQuery}", search and recommend best matches (max ${maxResults})
2. Each recommendation must include: name, location, lat, lng, reason, distance, transport, imageUrl (use unsplash.com format), rating (4.0-5.0), budget
3. If user asks for "more", ${excludeText ? 'avoid duplicates' : 'recommend new destinations'}
4. Return standard JSON only

Response format:
{
  "destinations": [...],
  "message": "brief reply (under 50 words)"
}`;

    try {
      const response = await axios.post('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        model: 'doubao-pro-32k',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `请搜索推荐目的地：${userQuery}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      const aiResponse = response.data.choices[0].message
      try {
        const result = JSON.parse(aiResponse.content)
        // 为每个目的地生成唯一ID
        if (result.destinations) {
          result.destinations = result.destinations.map((dest: any, idx: number) => ({
            ...dest,
            id: dest.id || `ai-dest-${Date.now()}-${idx}`
          }))
        }
        return result
      } catch (parseError) {
        console.error('AI 搜索响应解析失败:', parseError, aiResponse.content)
        return null
      }
    } catch (error: any) {
      console.error('AI 目的地搜索失败:', error)
      return null
    }
  }
}

// 创建全局 AI 服务实例
export const aiService = new AIService([
  import.meta.env.VITE_DOUBAO_API_KEY || ''
])