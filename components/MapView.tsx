
import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  Layers, 
  TrainFront, 
  Car, 
  Hotel, 
  Landmark, 
  Check,
  X,
  ChevronLeft
} from 'lucide-react';
import { Destination, Language } from '../types';
import { MOCK_DESTINATIONS } from '../constants';
import { translations } from '../locales';

interface MapViewProps {
  onSelectDestination: (d: Destination) => void;
  lang: Language;
  onInteraction?: () => void;
  onExit?: () => void;
  showExitButton?: boolean;
  userContext?: string;
  searchedDestinations?: Destination[];
}

type MapMode = 'destination' | 'hsr' | 'flight' | 'drive' | 'hotel' | 'museum' | 'all';

const MapView: React.FC<MapViewProps> = ({ onSelectDestination, lang, onInteraction, onExit, showExitButton, userContext, searchedDestinations = [] }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  
  const lastQueryRef = useRef<string | undefined>(undefined);
  const lastModeRef = useRef<MapMode>('all');
  const savedBoundsRef = useRef<L.LatLngBounds | null>(null);
  const isReturningRef = useRef<boolean>(false);
  
  const [isMapReady, setIsMapReady] = useState(false);
  const [showLayersMenu, setShowLayersMenu] = useState(false);
  const [currentMode, setCurrentMode] = useState<MapMode>('all');
  const t = translations[lang];

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      center: [39.90, 116.40],
      zoom: 10,
      maxZoom: 18,
      minZoom: 3,
      trackResize: true,
      preferCanvas: true, 
      tap: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      updateWhenZooming: false,
      updateWhenIdle: true
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    mapRef.current = map;
    markersLayerRef.current = markersLayer;

    map.on('moveend', () => {
      if (!isReturningRef.current) {
        savedBoundsRef.current = map.getBounds();
      }
    });

    map.on('click', () => onInteraction?.());
    map.on('dragstart', () => onInteraction?.());
    map.on('zoomstart', () => onInteraction?.());

    setIsMapReady(true);

    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onInteraction]);

  useEffect(() => {
    if (showExitButton && mapRef.current) {
      isReturningRef.current = true;
      const map = mapRef.current;
      
      requestAnimationFrame(() => {
        map.invalidateSize();
        if (savedBoundsRef.current) {
          map.fitBounds(savedBoundsRef.current, { animate: false });
        }
        
        setTimeout(() => {
          map.invalidateSize();
          isReturningRef.current = false;
        }, 400);
      });
    }
  }, [showExitButton]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !markersLayerRef.current) return;

    const markersLayer = markersLayerRef.current;
    const map = mapRef.current;

    // 优先使用 AI 搜索到的目的地，否则使用 MOCK_DESTINATIONS
    let filtered = searchedDestinations && searchedDestinations.length > 0
      ? searchedDestinations
      : MOCK_DESTINATIONS;

    // 如果有用户输入的上下文，进一步过滤（仅对 MOCK_DESTINATIONS 有效）
    if (filtered === MOCK_DESTINATIONS && userContext && userContext.trim().length > 0) {
      const query = userContext.trim().toLowerCase();
      filtered = MOCK_DESTINATIONS.filter(d =>
        d.name.toLowerCase().includes(query) ||
        d.tags.some(t => t.toLowerCase().includes(query))
      );
      if (filtered.length === 0) filtered = MOCK_DESTINATIONS;
    } else if (filtered === MOCK_DESTINATIONS && currentMode !== 'all') {
      filtered = MOCK_DESTINATIONS.filter(d => d.type === currentMode);
    }

    markersLayer.clearLayers();
    filtered.forEach((dest) => {
      const infoText = dest.price 
        ? `<span class="text-[#FF6B35] font-semibold">${dest.price}</span>`
        : `<div class="flex items-center gap-0.5"><span class="text-orange-400 font-semibold">${dest.rating}</span><span class="text-[8px] text-gray-300">${lang === 'zh' ? '分' : 'pts'}</span></div>`;

      const html = `
        <div class="map-marker-box flex items-center gap-2.5 p-1.5 bg-white shadow-xl rounded-2xl border border-gray-100 w-[150px] pointer-events-auto active:scale-95 transition-transform">
          <div class="w-10 h-10 shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
            <img src="${dest.imageUrl}" class="w-full h-full object-cover" />
          </div>
          <div class="flex flex-col flex-1 overflow-hidden">
             <span class="text-[11px] font-bold text-gray-900 truncate">${dest.name}</span>
             <div class="flex items-center justify-between mt-0.5">
               <div class="text-[9px] font-medium">${infoText}</div>
               <span class="text-[9px] font-medium text-gray-400">${dest.distance || '12km'}</span>
             </div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: html,
        iconSize: [150, 54],
        iconAnchor: [75, 60]
      });

      L.marker([dest.lat, dest.lng], { icon: customIcon })
        .addTo(markersLayer)
        .on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          savedBoundsRef.current = map.getBounds();
          onSelectDestination(dest); 
        });
    });

    if (!isReturningRef.current && filtered.length > 0) {
       const group = L.featureGroup(filtered.map(d => L.marker([d.lat, d.lng])));
       map.fitBounds(group.getBounds().pad(0.3), { animate: true });
       savedBoundsRef.current = map.getBounds();
    }
  }, [isMapReady, currentMode, userContext, onSelectDestination, lang, searchedDestinations]);

  const modes: { id: MapMode; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: t.allDiscovery, icon: <Layers className="w-4 h-4" /> },
    { id: 'destination', label: t.attractions, icon: <MapPin className="w-4 h-4" /> },
    { id: 'hsr', label: t.hsr, icon: <TrainFront className="w-4 h-4" /> },
    { id: 'drive', label: t.selfDrive, icon: <Car className="w-4 h-4" /> },
    { id: 'hotel', label: t.hotels, icon: <Hotel className="w-4 h-4" /> },
    { id: 'museum', label: t.museums, icon: <Landmark className="w-4 h-4" /> },
  ];

  return (
    <div className="relative h-full w-full bg-[#fdfaf5] overflow-hidden">
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {showExitButton && (
        <>
          <div 
            className="absolute z-[1200] pointer-events-auto"
            style={{ top: 'calc(env(safe-area-inset-top, 20px) + 8px)', left: '16px' }}
          >
            <button 
              onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation(); 
                onExit?.(); 
              }}
              className="w-11 h-11 bg-white shadow-2xl rounded-full flex items-center justify-center text-gray-800 border border-gray-100 active:scale-90 transition-all hover:bg-gray-50"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>

          <div className="absolute bottom-[100px] right-6 flex flex-col gap-3 z-[300]">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowLayersMenu(true); }}
              className="w-12 h-12 bg-white shadow-xl rounded-2xl flex items-center justify-center text-gray-500 border border-gray-100 active:scale-90 transition-all"
            >
                <Layers className="w-6 h-6" />
            </button>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                mapRef.current?.locate({ setView: true, maxZoom: 14 }); 
              }}
              className="w-12 h-12 bg-white shadow-xl rounded-2xl flex items-center justify-center text-[#FF6B35] border border-gray-100 active:scale-90 transition-all"
            >
                <Navigation className="w-6 h-6" />
            </button>
          </div>
        </>
      )}

      {showLayersMenu && (
        <div className="absolute inset-0 z-[1500] flex items-center justify-center p-6" onClick={() => setShowLayersMenu(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div className="relative w-full max-w-[280px] bg-white rounded-[32px] p-4 shadow-2xl animate-bubble-in border border-white" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-2 mb-4">
               <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t.allDiscovery}</h4>
               <button onClick={() => setShowLayersMenu(false)} className="p-2 text-gray-300"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-1.5">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => { setCurrentMode(mode.id); setShowLayersMenu(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all ${currentMode === mode.id ? 'bg-[#FF6B35] text-white shadow-lg' : 'text-gray-600 active:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${currentMode === mode.id ? 'text-white/80' : 'text-gray-400'}`}>{mode.icon}</div>
                    <span className="text-[14px] font-bold">{mode.label}</span>
                  </div>
                  {currentMode === mode.id && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <style>{`
        .custom-div-icon { background: none !important; border: none !important; }
        .map-marker-box {
          box-shadow: 0 12px 48px rgba(0,0,0,0.12);
        }
      `}</style>
    </div>
  );
};

export default MapView;
