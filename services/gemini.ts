
import { GoogleGenAI, Type } from "@google/genai";
import { Language } from "../types";

const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorStr = JSON.stringify(error).toLowerCase();
      const isRateLimit = errorStr.includes('429') || errorStr.includes('resource_exhausted') || errorStr.includes('quota');
      
      if (isRateLimit && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 2000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

export const searchGlobalCity = async (query: string, lang: Language = 'zh') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const langPrompt = lang === 'en' ? 'English' : 'Chinese';
  
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User is searching for a global city. Based on input "${query}", return the best matching real city information.
      Required: city name, country name, airport IATA code, flag Emoji.
      The language of output MUST be ${langPrompt}.
      Only return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            city: { type: Type.STRING },
            country: { type: Type.STRING },
            code: { type: Type.STRING },
            flag: { type: Type.STRING }
          },
          required: ["city", "country", "code", "flag"]
        }
      }
    });
    const result = JSON.parse(response.text || '{}');
    return { ...result, id: `ai-${Date.now()}` };
  }).catch(() => null);
};

export const generateTravelAdvice = async (userInput: string, lang: Language = 'zh') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const langPrompt = lang === 'en' ? 'in English' : 'in Chinese';
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userInput,
      config: {
        systemInstruction: `You are a minimalist AI travel assistant. Reply concisely and guide users to check the map. Reply MUST be ${langPrompt}.`,
      },
    });
    return response.text || (lang === 'en' ? "Sorry, I can't process your request right now." : "抱歉，我暂时无法处理您的请求。");
  }).catch(() => (lang === 'en' ? "Request too frequent, please try later. ✨" : "请求过于频繁，请稍后再试。✨"));
};

export const generateItinerary = async (destinationName: string, preferences: string, lang: Language = 'zh', currentItinerary?: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const langPrompt = lang === 'en' ? 'in English' : 'in Chinese';
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a one-day itinerary for "${destinationName}". User preferences: ${preferences}. Language: ${langPrompt}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aiComment: { type: Type.STRING },
            date: { type: Type.STRING },
            totalBudget: { type: Type.STRING },
            transport: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  activity: { type: Type.STRING },
                  description: { type: Type.STRING },
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER },
                  transportInfo: { type: Type.STRING },
                  aiPersonalizedReason: { type: Type.STRING },
                  cost: { type: Type.STRING }
                }
              }
            },
            highlights: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }).catch(() => null);
};
