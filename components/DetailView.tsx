
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Share2, Clock, MapPin, Zap, Loader2, X, Sparkles, Send, Plus, Check, Heart, MessageSquare, RotateCcw, Maximize2 } from 'lucide-react';
import L from 'leaflet';
import { Destination, Itinerary, ItineraryItem, Language } from '../types';
import { generateItinerary } from '../services/gemini';
import { translations } from '../locales';

interface DetailViewProps {
  destination: Destination;
  lang: Language;
  userContext?: string;
  savedItineraries?: (Itinerary & { destinationName: string })[];
  onToggleSave?: (itinerary: Itinerary & { destinationName: string }) => void;
  onBack: () => void;
}

const DetailView: React.FC<DetailViewProps> = ({ destination, lang, userContext, savedItineraries = [], onToggleSave, onBack }) => {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [previousItinerary, setPreviousItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [input, setInput] = useState('');
  const [selectedStop, setSelectedStop] = useState<ItineraryItem | null>(null);
  const [isFullMapOpen, setIsFullMapOpen] = useState(false);
  const t = translations[lang];
  
  const miniMapRef = useRef<L.Map | null>(null);
  const fullMapRef = useRef<L.Map | null>(null);
  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const fullMapContainerRef = useRef<HTMLDivElement>(null);

  const isSaved = savedItineraries.some(item => item.destination_id === destination.id);

  const renderMap = (container: HTMLDivElement, isFull: boolean, itineraryData: Itinerary) => {
    const map = L.map(container, {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: isFull
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
    const points: L.LatLngExpression[] = itineraryData.items.map(item => [item.lat, item.lng]);
    L.polyline(points, { color: '#FF6B35', weight: isFull ? 3 : 2, dashArray: '8, 8', opacity: 0.6 }).addTo(map);

    itineraryData.items.forEach((item, idx) => {
      const icon = L.divIcon({
        className: 'custom-stop-icon',
        html: `<div class="w-7 h-7 bg-white border-2 border-[#FF6B35] rounded-full flex items-center justify-center text-[11px] font-black text-[#FF6B35] shadow-md">${idx + 1}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      L.marker([item.lat, item.lng], { icon }).addTo(map).on('click', () => { if (isFull) setSelectedStop(item); });
    });

    if (points.length > 0) {
      map.fitBounds(L.polyline(points).getBounds().pad(isFull ? 0.2 : 0.3));
    }
    return map;
  };

  useEffect(() => {
    if (itinerary && hasStarted && miniMapContainerRef.current) {
      if (miniMapRef.current) miniMapRef.current.remove();
      miniMapRef.current = renderMap(miniMapContainerRef.current, false, itinerary);
    }
  }, [itinerary, hasStarted]);

  useEffect(() => {
    if (isFullMapOpen && itinerary && fullMapContainerRef.current) {
      if (fullMapRef.current) fullMapRef.current.remove();
      setTimeout(() => {
         fullMapRef.current = renderMap(fullMapContainerRef.current as HTMLDivElement, true, itinerary);
      }, 300);
    }
  }, [isFullMapOpen, itinerary]);

  const handleAIPlanning = async (req?: string) => {
    const finalInput = req || input;
    if (!finalInput && hasStarted) return;
    setHasStarted(true);
    setLoading(true);
    if (itinerary) setPreviousItinerary(itinerary);
    const data = await generateItinerary(destination.name, finalInput || userContext || (lang === 'en' ? "Deep Experience" : "一日深度体验游"), lang, itinerary);
    if (data) { setItinerary({ ...data, destinationId: destination.id }); }
    setLoading(false); setInput('');
  };

  return (
    <div className="relative flex flex-col h-full bg-[#F2F2F7] overflow-hidden">
      <div className="flex-1 overflow-y-auto smooth-scroll no-scrollbar pb-[140px]">
        <div className="relative h-[320px] shrink-0">
          <img src={destination.imageUrl} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#F2F2F7]" />
          <div className="absolute left-4 right-4 z-10 flex justify-between items-center" style={{ top: 'calc(env(safe-area-inset-top, 20px) + 8px)' }}>
            <button onClick={onBack} className="w-11 h-11 bg-black/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 active:scale-90 transition-all shadow-xl">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button className="w-11 h-11 bg-black/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 active:scale-90 transition-all shadow-xl">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-3 leading-tight drop-shadow-sm">{destination.name}</h1>
            <div className="flex gap-2">
               <div className="bg-white/90 backdrop-blur-lg px-4 py-2 rounded-full text-[11px] font-black text-gray-700 flex items-center gap-1.5 border border-white shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-orange-500" /> {destination.suggestedDuration || '2h'}
               </div>
               {destination.distance && (
                 <div className="bg-gradient-to-br from-[#FF6B35] to-[#FF8E5C] px-4 py-2 rounded-full text-[11px] font-black text-white flex items-center gap-1.5 shadow-lg shadow-orange-100/50">
                    <MapPin className="w-3.5 h-3.5 fill-white" /> {destination.distance}
                 </div>
               )}
            </div>
          </div>
        </div>

        <div className="px-6 mt-6 space-y-4">
          <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-red-500" /> {t.inspiration}
          </h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
            {destination.notes.map((note) => (
              <div key={note.id} className="shrink-0 w-[200px] bg-white rounded-[28px] overflow-hidden shadow-sm border border-white/60 active:scale-[0.98] transition-all group">
                <div className="relative h-[150px] overflow-hidden">
                  <img src={note.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                  <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white font-black flex items-center gap-1 border border-white/10">
                    <Heart className="w-3 h-3 fill-red-500 text-red-500" /> {note.likes}
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <p className="text-[13px] font-bold text-gray-800 line-clamp-2 leading-relaxed">{note.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 mt-4">
           <div className="bg-white rounded-[36px] p-6 shadow-sm border border-gray-50 relative overflow-hidden">
              {!hasStarted ? (
                 <div className="flex flex-col items-center py-10 text-center">
                    <div className="w-20 h-20 bg-orange-50 rounded-[28px] flex items-center justify-center mb-6 border border-orange-100 shadow-inner">
                       <Sparkles className="w-10 h-10 text-[#FF6B35]" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">{t.planning}</h3>
                    <p className="text-[12px] text-gray-400 font-bold mb-8 max-w-[220px]">{t.planningSub}</p>
                    <button 
                      onClick={() => handleAIPlanning()} 
                      disabled={loading}
                      className="w-full h-14 bg-gray-900 text-white rounded-[22px] text-[15px] font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                       {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.aiPlanningBtn}
                    </button>
                 </div>
              ) : (
                 <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-5">
                       <h2 className="text-lg font-black text-gray-900 tracking-tight">{t.itineraryMap}</h2>
                       <button 
                          onClick={() => itinerary && onToggleSave?.({...itinerary, destinationName: destination.name})}
                          className={`px-4 py-2 rounded-full text-[11px] font-black transition-all border ${
                            isSaved ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                          }`}
                       >
                         {isSaved ? <Check className="w-3.5 h-3.5 inline mr-1.5" /> : <Plus className="w-3.5 h-3.5 inline mr-1.5" />}
                         {isSaved ? t.saved : t.save}
                       </button>
                    </div>

                    {itinerary && (
                      <div onClick={() => setIsFullMapOpen(true)} className="relative w-full h-[220px] bg-gray-50 rounded-[32px] overflow-hidden border border-gray-100 shadow-inner group cursor-pointer active:scale-[0.98] transition-transform">
                         <div ref={miniMapContainerRef} className="w-full h-full" />
                         <div className="absolute bottom-4 right-4 z-20 w-10 h-10 bg-white/80 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-white/50 text-gray-600 group-hover:bg-[#FF6B35] group-hover:text-white transition-all">
                            <Maximize2 className="w-5 h-5" />
                         </div>
                      </div>
                    )}

                    {itinerary && (
                       <div className={`space-y-8 ${loading ? 'opacity-30' : 'opacity-100'} transition-opacity pb-6`}>
                          <div className="relative space-y-12 pl-4 border-l-2 border-dashed border-orange-100 ml-2 mt-4">
                            {itinerary.items.map((item, idx) => (
                              <div key={idx} className="relative pl-6 cursor-pointer group" onClick={() => setSelectedStop(item)}>
                                 <div className="absolute -left-[27px] top-1.5 w-4 h-4 bg-white border-2 border-[#FF6B35] rounded-full shadow-sm" />
                                 <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-black text-[#FF6B35] bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100">{item.time}</span>
                                    {item.transportInfo && <span className="text-[10px] text-gray-400 font-bold tracking-tight">{item.transportInfo}</span>}
                                 </div>
                                 <h3 className="text-[14px] font-black text-gray-900 mb-1.5 group-active:text-[#FF6B35] transition-colors">{item.activity}</h3>
                                 <p className="text-[12px] text-gray-500 font-medium leading-relaxed line-clamp-2">{item.description}</p>
                              </div>
                            ))}
                          </div>
                       </div>
                    )}
                 </div>
              )}
           </div>
        </div>
      </div>

      {hasStarted && (
        <div className="absolute left-6 right-6 z-[1000] animate-bubble-in" style={{ bottom: 'calc(24px + env(safe-area-inset-bottom, 20px))' }}>
          <div className="flex items-center gap-3">
            {previousItinerary && (
              <button onClick={() => { setItinerary(previousItinerary); setPreviousItinerary(null); }} className="shrink-0 w-12 h-12 bg-white border border-gray-100 shadow-xl rounded-2xl flex items-center justify-center text-[#FF6B35] active:scale-90 transition-all">
                <RotateCcw className="w-5 h-5" />
              </button>
            )}
            <div className="flex-1 bg-white/95 backdrop-blur-2xl h-[58px] px-5 rounded-[22px] border border-white/50 shadow-2xl flex items-center gap-3">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAIPlanning()} placeholder={t.inputMicroAdjustment} className="flex-1 bg-transparent border-none focus:outline-none text-[14px] font-bold text-gray-900 placeholder:text-gray-400" />
              <button onClick={() => handleAIPlanning()} disabled={!input.trim() || loading} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${input.trim() ? 'bg-[#FF6B35] text-white shadow-lg shadow-orange-100' : 'text-gray-200'}`}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {isFullMapOpen && (
        <div className="fixed inset-0 z-[2000] flex flex-col bg-white animate-in slide-in-from-bottom duration-500">
           <div className="absolute top-6 left-6 z-[2100]"><button onClick={() => setIsFullMapOpen(false)} className="w-12 h-12 bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl flex items-center justify-center text-gray-900 border border-white active:scale-90 transition-all"><X className="w-6 h-6" /></button></div>
           <div className="absolute top-6 right-6 z-[2100]"><div className="bg-white/90 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-2xl border border-white"><h3 className="text-sm font-black text-gray-900">{destination.name}</h3></div></div>
           <div ref={fullMapContainerRef} className="flex-1 w-full" />
        </div>
      )}

      {selectedStop && (
        <div className="fixed inset-0 z-[2500] flex items-end px-4 pb-8 pointer-events-none">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={() => setSelectedStop(null)} />
          <div className="relative w-full bg-white rounded-[40px] p-8 shadow-2xl animate-bubble-in pointer-events-auto border border-gray-100">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-orange-50 rounded-[20px] flex items-center justify-center text-[#FF6B35] border border-orange-100"><MapPin className="w-7 h-7 fill-[#FF6B35]" /></div>
                <div><h3 className="text-xl font-black text-gray-900 leading-none">{selectedStop.activity}</h3><p className="text-[11px] font-bold text-gray-400 mt-2 uppercase tracking-[0.2em]">Deep Review</p></div>
             </div>
             <div className="bg-orange-50/50 rounded-[24px] p-5 border border-orange-100/50 mb-8"><p className="text-[15px] text-orange-950 font-bold leading-relaxed"><Sparkles className="w-4 h-4 text-[#FF6B35] inline mr-2" />{selectedStop.aiPersonalizedReason}</p></div>
             <button onClick={() => setSelectedStop(null)} className="w-full py-4.5 bg-gray-900 text-white rounded-[20px] font-black text-[15px] active:scale-95 transition-all shadow-xl">{t.understood}</button>
          </div>
        </div>
      )}
      <style>{`.custom-stop-icon { background: none !important; border: none !important; }.smooth-scroll { -webkit-overflow-scrolling: touch; scroll-behavior: smooth; }`}</style>
    </div>
  );
};

export default DetailView;
