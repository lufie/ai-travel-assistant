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
}

// 创建全局 AI 服务实例
export const aiService = new AIService([
  import.meta.env.VITE_DOUBAO_API_KEY || ''
])