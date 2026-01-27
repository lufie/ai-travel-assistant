
export type Language = 'zh' | 'en';

export enum ViewType {
  WELCOME = 'WELCOME',
  MAP = 'MAP',
  DETAIL = 'DETAIL',
  PLAN = 'PLAN',
  USER_CENTER = 'USER_CENTER'
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Location {
  id: string;
  city: string;
  country: string;
  code: string;
  flag: string;
}

export interface Destination {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  rating: number;
  tags: string[];
  travelTime: string; 
  suggestedTransport: string; 
  suggestedDuration: string;  
  budget: string;
  description: string;
  aiReason: string;
  imageUrl: string;
  notes: SocialNote[];
  price?: string;
  distance?: string;
  type?: 'destination' | 'hsr' | 'flight' | 'drive' | 'hotel' | 'museum';
}

export interface SocialNote {
  id: string;
  author: string;
  likes: number;
  content: string;
  imageUrl: string;
}

export interface ItineraryItem {
  time: string;
  activity: string;
  description: string;
  lat: number;
  lng: number;
  transportInfo?: string; 
  aiPersonalizedReason?: string; 
  cost?: string;
}

export interface Itinerary {
  destinationId: string;
  date: string;
  totalBudget: string;
  transport: string;
  items: ItineraryItem[];
  highlights: string[];
  aiComment?: string;
}
