
import React from 'react';
import { Sparkles, ChevronDown, LocateFixed, TreePine, Users, Palette, Sunset, Car, Landmark, Utensils, Compass } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../locales';

interface WelcomeViewProps {
  isVisible: boolean;
  lang: Language;
  departureCity: string;
  intentKeyword: string;
  onCityClick: () => void;
  onSelectKeyword: (kw: string) => void;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({ isVisible, lang, departureCity, intentKeyword, onCityClick, onSelectKeyword }) => {
  const t = translations[lang];
  
  const iconMap = [
    <TreePine className="w-5 h-5 text-emerald-500" />,
    <Users className="w-5 h-5 text-blue-500" />,
    <Palette className="w-5 h-5 text-purple-500" />,
    <Sunset className="w-5 h-5 text-orange-500" />,
    <Utensils className="w-5 h-5 text-pink-500" />,
    <Car className="w-5 h-5 text-indigo-500" />,
    <Landmark className="w-5 h-5 text-amber-600" />,
    <Compass className="w-5 h-5 text-red-500" />,
  ];

  const suggestions = t.suggestions.map((text, i) => ({
    text,
    icon: iconMap[i] || <Sparkles className="w-5 h-5" />
  }));

  return (
    <div 
      className={`absolute inset-0 transition-all duration-1000 cubic-bezier overflow-hidden pointer-events-none flex items-start justify-center pt-20 lg:pt-32 ${
        isVisible ? 'opacity-100 z-[140]' : 'opacity-0 scale-98 blur-lg z-0'
      }`}
    >
      <div className="absolute inset-0 bg-[#F2F2F7]" />
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-orange-100/40 to-pink-100/30 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-5%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-blue-50/40 to-purple-50/30 rounded-full blur-[90px]" />
      
      <div className={`relative w-full max-w-2xl px-6 flex flex-col gap-8 transition-all duration-500 h-full max-h-[90vh] pb-[100px] ${
        isVisible ? 'pointer-events-auto translate-y-0' : 'pointer-events-none translate-y-10'
      }`}>
        
        {/* 欢迎卡片 */}
        <div className="shrink-0 w-full bg-white/90 backdrop-blur-3xl rounded-[36px] p-8 lg:p-10 shadow-2xl border border-white/50 relative overflow-hidden group">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-orange-100/30 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-[2s]" />
          
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FF8E5C] rounded-2xl flex items-center justify-center shadow-xl shadow-orange-100">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full" />
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-2xl lg:text-3xl font-medium text-gray-400">{t.from}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); onCityClick(); }}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm active:scale-95 transition-all group/city hover:border-[#FF6B35]/30 hover:shadow-md"
                >
                  <LocateFixed className="w-5 h-5 text-[#FF6B35]" />
                  <span className="text-xl lg:text-2xl font-black text-gray-900 leading-none">{departureCity}</span>
                  <ChevronDown className="w-5 h-5 text-gray-300 group-hover/city:translate-y-0.5 transition-transform" />
                </button>
                <span className="text-2xl lg:text-3xl font-medium text-gray-400">{t.to}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-2xl lg:text-3xl font-medium text-gray-400">{t.iWant}</span>
              <div className="relative flex-1 min-w-[150px] border-b-2 border-gray-100 h-10 flex items-center px-1">
                {intentKeyword ? (
                   <span className="text-xl lg:text-2xl font-black text-[#FF6B35] animate-bubble-in">{intentKeyword}</span>
                ) : (
                   <div className="flex gap-2 opacity-20">
                      {[0, 150, 300].map(d => (
                        <div key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: `${d}ms` }} />
                      ))}
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white/40 backdrop-blur-2xl rounded-[36px] border border-white/60 shadow-xl overflow-hidden flex flex-col p-6 lg:p-8 min-h-[300px]">
          <div className="overflow-y-auto no-scrollbar flex-1">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {suggestions.map((s, i) => (
                <button 
                  key={i} 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onSelectKeyword(s.text); }}
                  className="flex flex-col items-center pt-6 pb-4 px-4 bg-white/95 border border-white rounded-[28px] shadow-sm hover:border-[#FF6B35]/40 hover:shadow-md hover:-translate-y-1 active:scale-95 transition-all text-center group min-h-[140px]"
                >
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-orange-50 transition-colors shadow-inner border border-gray-100/50 mb-3">
                    {s.icon}
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-[13px] font-medium text-gray-800 tracking-tight leading-tight">{s.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeView;
