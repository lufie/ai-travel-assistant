import React, { useState, useEffect } from 'react';
import { Calendar, Wallet, Car, Coffee, MapPin, Share2, Heart, Loader2, ArrowLeft, Sparkles, ChevronLeft, Check } from 'lucide-react';
import { Destination, Itinerary } from '../types';
import { generateItinerary } from '../services/gemini';

interface PlanViewProps {
  destination: Destination;
  onBack: () => void;
}

const PlanView: React.FC<PlanViewProps> = ({ destination, onBack }) => {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      const data = await generateItinerary(destination.name, "周末带父母一日游，轻松舒适");
      if (data) setItinerary({ ...data, destinationId: destination.id });
      setLoading(false);
    };
    fetchPlan();
  }, [destination]);

  const handleSaveTrip = () => {
    setIsSaved(true);
    // 这里可以添加实际存储逻辑，例如存入 localStorage
    setTimeout(() => {
      // 模拟反馈后返回或保持状态
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white p-10 text-center">
        <Loader2 className="w-12 h-12 text-[#FF6B35] animate-spin mb-4" />
        <h2 className="text-xl font-black text-gray-800 tracking-tight">正在为您生成专属方案...</h2>
        <p className="text-sm text-gray-400 mt-2 font-medium">AI 正在调取最新的交通、天气与周边数据</p>
      </div>
    );
  }

  if (!itinerary) return (
    <div className="flex flex-col items-center justify-center h-full bg-white p-6 text-center">
      <p className="text-gray-500 font-bold">生成失败，请稍后重试。</p>
      <button onClick={onBack} className="mt-4 px-6 py-2 bg-[#FF6B35] text-white rounded-full font-black">返回</button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] relative overflow-hidden">
      {/* 顶部导航栏 - 吸顶 */}
      <div className="shrink-0 px-6 pt-8 pb-4 flex items-center justify-between bg-white/80 backdrop-blur-xl z-50 border-b border-gray-100/50">
        <button 
          onClick={onBack} 
          className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 active:scale-90 transition-all border border-gray-100"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-black text-gray-900 tracking-tight">定制行程方案</h1>
        <button className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 active:scale-90 transition-all border border-gray-100">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pb-40">
        {/* 概览卡片 */}
        <div className="bg-white m-4 p-6 rounded-[32px] shadow-sm border border-orange-50/50">
          <div className="flex justify-between items-start mb-6">
             <div className="flex-1 pr-4">
                <h2 className="text-2xl font-black text-gray-900 leading-tight">{destination.name} · 一日游</h2>
                <p className="text-[12px] text-gray-400 mt-2 flex items-center gap-1.5 font-bold">
                  <Calendar className="w-3.5 h-3.5" /> {itinerary.date || '2026年1月24日 周六'}
                </p>
             </div>
             <div className="text-right shrink-0">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-1">预估预算</p>
                <p className="text-2xl font-black text-[#FF6B35] leading-none">{itinerary.totalBudget}</p>
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-blue-50/50 p-4 rounded-[24px] flex items-center gap-3 border border-blue-100/30">
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-500">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-[10px] text-gray-400 font-bold">建议交通</p>
                   <p className="text-xs font-black text-gray-800">{itinerary.transport || '自驾'}</p>
                </div>
             </div>
             <div className="bg-orange-50/50 p-4 rounded-[24px] flex items-center gap-3 border border-orange-100/30">
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm text-orange-500">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-[10px] text-gray-400 font-bold">目的地</p>
                   <p className="text-xs font-black text-gray-800">深度单点</p>
                </div>
             </div>
          </div>
        </div>

        {/* 时间轴行程 */}
        <div className="px-6 py-4">
           <h2 className="text-lg font-black text-gray-900 mb-8 flex items-center gap-2">
             <span className="w-1.5 h-6 bg-[#FF6B35] rounded-full"></span>
             行程规划图
           </h2>
           <div className="relative border-l-2 border-dashed border-orange-200 ml-3 space-y-10">
              {itinerary.items.map((item, idx) => (
                <div key={idx} className="relative pl-8 animate-bubble-in" style={{ animationDelay: `${idx * 100}ms` }}>
                   {/* 节点图标 */}
                   <div className="absolute -left-[11px] top-0 w-5 h-5 bg-white border-2 border-[#FF6B35] rounded-full z-10 flex items-center justify-center">
                     <div className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full"></div>
                   </div>
                   
                   <div className="flex items-center gap-2 mb-2">
                     <span className="text-[11px] font-black text-[#FF6B35] bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100">
                       {item.time}
                     </span>
                   </div>

                   <div className="bg-white p-5 rounded-[28px] shadow-sm border border-gray-100/60 active:scale-[0.98] transition-transform">
                      <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 mb-2">
                         <span className="text-base">{idx === 0 ? '🏠' : idx === itinerary.items.length - 1 ? '🏁' : '📍'}</span>
                         {item.activity}
                      </h3>
                      <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                         {item.description}
                      </p>
                      {item.cost && (
                         <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
                           <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">预估花费</span>
                           <span className="text-[11px] font-black text-gray-700">{item.cost}</span>
                         </div>
                      )}
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* 亮点说明 */}
        <div className="px-4 py-4">
           <div className="bg-gradient-to-br from-[#FF6B35] to-[#FF8E64] rounded-[36px] p-7 text-white shadow-xl shadow-orange-100">
              <h2 className="text-sm font-black mb-6 flex items-center gap-2 uppercase tracking-[0.2em] opacity-90">
                 <Sparkles className="w-5 h-5" /> AI 行程亮点
              </h2>
              <ul className="space-y-4">
                 {itinerary.highlights.map((h, i) => (
                   <li key={i} className="flex gap-4 text-[14px] items-start">
                      <div className="w-5 h-5 shrink-0 bg-white/20 rounded-full flex items-center justify-center font-black text-[10px] mt-0.5">
                        {i + 1}
                      </div>
                      <span className="font-bold leading-snug">{h}</span>
                   </li>
                 ))}
              </ul>
           </div>
        </div>
      </div>

      {/* 底部悬浮操作栏 */}
      <div className="absolute bottom-10 left-6 right-6 z-[100]">
         <div className="bg-white/70 backdrop-blur-3xl border border-white/80 p-4 rounded-[32px] shadow-[0_24px_64px_rgba(0,0,0,0.15)] flex items-center gap-3">
            <button 
              onClick={handleSaveTrip}
              disabled={isSaved}
              className={`flex-1 h-14 rounded-[22px] font-black text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg ${
                isSaved ? 'bg-emerald-500 text-white' : 'bg-[#FF6B35] text-white shadow-orange-200'
              }`}
            >
               {isSaved ? (
                 <>已存入我的行程 <Check className="w-5 h-5" /></>
               ) : (
                 <>我要去 <Sparkles className="w-4 h-4 fill-white" /></>
               )}
            </button>
         </div>
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default PlanView;