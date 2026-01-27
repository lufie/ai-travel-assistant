import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  ChevronLeft,
  Sparkles,
  Search,
  Clock,
  MapPin as LocationIcon
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
}

type MapMode = 'destination' | 'hsr' | 'flight' | 'drive' | 'hotel' | 'museum' | 'all';

// 优化的标记组件
const MapMarker: React.FC<{
  destination: Destination;
  isSelected: boolean;
  onClick: () => void;
  lang: Language;
}> = React.memo(({ destination, isSelected, onClick, lang }) => {
  const t = translations[lang];
  const [isClicked, setIsClicked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const markerRef = useRef<HTMLDivElement>(null);

  // 使用防抖避免快速点击
  const handleClick = useCallback(() => {
    if (!markerRef.current) return;

    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false);
    }, 200);

    onClick();
  }, [onClick]);

  return (
    <div
      ref={markerRef}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`map-marker-box cursor-pointer transition-all duration-300 ease-out ${
        isClicked ? 'scale-90' : isHovered ? 'scale-105' : 'scale-100'
      } ${isSelected ? 'ring-2 ring-[#FF6B35] ring-offset-2 shadow-xl' : 'hover:shadow-lg'}`}
      style={{
        transform: `scale(${isSelected ? 1.08 : (isHovered ? 1.05 : 1)})`,
        zIndex: isSelected ? 1000 : 1,
        boxShadow: isSelected ? '0 12px 48px rgba(255, 107, 53, 0.25)' : ''
      }}
    >
      <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-gray-50 border-2 border-white transition-all duration-300">
        <img
          src={destination.imageUrl}
          className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : ''}`}
          alt={destination.name}
        />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <span className={`text-[11px] font-bold truncate leading-tight transition-all duration-300 ${
          isSelected ? 'text-[#FF6B35]' : 'text-gray-900'
        }`}>
          {destination.name}
        </span>
        <div className="flex items-center justify-between mt-1 gap-1">
          <div className="flex items-center gap-0.5 min-w-0">
            {destination.price ? (
              <span className="text-[9px] font-bold text-[#FF6B35] bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 transition-all duration-300">
                {destination.price}
              </span>
            ) : (
              <div className="flex items-center gap-0.5">
                <span className="text-[8px] text-orange-400 font-bold transition-all duration-300">⭐</span>
                <span className="text-[8px] font-semibold text-gray-400 leading-none transition-all duration-300">
                  {destination.rating}
                </span>
              </div>
            )}
          </div>
          <span className={`text-[9px] font-medium whitespace-nowrap transition-all duration-300 ${
            isSelected ? 'text-[#FF6B35]' : 'text-gray-400'
          }`}>
            {destination.distance || '12km'}
          </span>
        </div>
      </div>
    </div>
  );
});

// 优化的地图组件
const MapView: React.FC<MapViewProps> = React.memo(({
  onSelectDestination,
  lang,
  onInteraction,
  onExit,
  showExitButton,
  userContext
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const lastQueryRef = useRef<string | undefined>(undefined);
  const lastModeRef = useRef<MapMode>('all');
  const savedBoundsRef = useRef<L.LatLngBounds | null>(null);
  const isReturningRef = useRef<boolean>(false);
  const lastInteractionTime = useRef<number>(0);
  const markerCacheRef = useRef<Map<string, L.Marker>>(new Map());

  const [isMapReady, setIsMapReady] = useState(false);
  const [showLayersMenu, setShowLayersMenu] = useState(false);
  const [currentMode, setCurrentMode] = useState<MapMode>('all');
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<Destination[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(null);
  const t = translations[lang];

  // 搜索功能
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // 模拟搜索延迟
    setTimeout(() => {
      const results = MOCK_DESTINATIONS.filter(dest =>
        dest.name.toLowerCase().includes(query.toLowerCase()) ||
        dest.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  }, []);

  // 清空搜索
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedDestinationId(null);
  }, []);

  // 点击搜索结果
  const handleSearchResultClick = useCallback((dest: Destination) => {
    setSelectedDestinationId(dest.id);
    onSelectDestination(dest);
    clearSearch();
    setShowSearch(false);

    // 飞到选中的目的地
    if (mapRef.current) {
      mapRef.current.flyTo([dest.lat, dest.lng], 15, {
        animate: true,
        duration: 1.5
      });
    }
  }, [onSelectDestination, clearSearch]);

  // 防抖搜索
  const debouncedSearch = useMemo(
    () => debounce(handleSearch, 300),
    [handleSearch]
  );

  // 监听搜索输入
  useEffect(() => {
    if (showSearch) {
      debouncedSearch(searchQuery);
    }
  }, [searchQuery, showSearch, debouncedSearch]);

  // 防抖交互处理
  const handleInteraction = useCallback(() => {
    const now = Date.now();
    if (now - lastInteractionTime.current > 200) {
      onInteraction?.();
      lastInteractionTime.current = now;
    }
  }, [onInteraction]);

  // 创建优化的自定义图标
  const createCustomIcon = useCallback((destination: Destination, isSelected: boolean) => {
    const infoText = destination.price
      ? `<span class="text-[#FF6B35] font-semibold">${destination.price}</span>`
      : `<div class="flex items-center gap-0.5"><span class="text-orange-400 font-semibold">${destination.rating}</span><span class="text-[8px] text-gray-300">${lang === 'zh' ? '分' : 'pts'}</span></div>`;

    const html = `
      <div class="map-marker-box ${isSelected ? 'scale-105' : ''} flex items-center gap-2.5 p-2 bg-white shadow-2xl rounded-2xl border border-gray-100 w-[160px] pointer-events-auto transition-all duration-200 ${isSelected ? 'ring-2 ring-[#FF6B35] ring-offset-2' : ''}">
        <div class="w-10 h-10 shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
          <img src="${destination.imageUrl}" class="w-full h-full object-cover" />
        </div>
        <div class="flex flex-col flex-1 overflow-hidden">
           <span class="text-[10px] font-bold text-gray-900 truncate leading-tight">${destination.name}</span>
           <div class="flex items-center justify-between mt-0.5">
             <div class="text-[8px] font-medium">${infoText}</div>
             <span class="text-[8px] font-medium text-gray-400">${destination.distance || '12km'}</span>
           </div>
        </div>
        ${isSelected ? '<div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#FF6B35] text-white text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">✓</div>' : ''}
      </div>
    `;

    return L.divIcon({
      className: 'custom-div-icon',
      html: html,
      iconSize: [160, 60],
      iconAnchor: [80, 60],
      popupAnchor: [0, -60]
    });
  }, [lang]);

  // 初始化地图
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
      updateWhenIdle: true,
      detectRetina: true
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    mapRef.current = map;
    markersLayerRef.current = markersLayer;

    // 优化的地图事件监听
    map.on('moveend', () => {
      if (!isReturningRef.current) {
        savedBoundsRef.current = map.getBounds();
      }
    });

    // 防抖的交互事件
    const debouncedInteraction = debounce(handleInteraction, 200);
    map.on('click', debouncedInteraction);
    map.on('dragstart', debouncedInteraction);
    map.on('zoomstart', debouncedInteraction);

    // 使用 requestAnimationFrame 优化地图初始化
    requestAnimationFrame(() => {
      setIsMapReady(true);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [handleInteraction]);

  // 优化的标记渲染
  useEffect(() => {
    if (!isMapReady || !mapRef.current || !markersLayerRef.current) return;

    const markersLayer = markersLayerRef.current;
    const map = mapRef.current;

    // 使用防抖避免频繁重新渲染
    const renderMarkers = debounce(() => {
      setIsLoadingMarkers(true);

      // 清理缓存
      markerCacheRef.current.forEach((marker) => {
        marker.remove();
      });
      markerCacheRef.current.clear();

      let filtered = MOCK_DESTINATIONS;
      if (userContext && userContext.trim().length > 0) {
        const query = userContext.trim().toLowerCase();
        filtered = MOCK_DESTINATIONS.filter(d =>
          d.name.toLowerCase().includes(query) ||
          d.tags.some(t => t.toLowerCase().includes(query))
        );
      } else if (currentMode !== 'all') {
        filtered = MOCK_DESTINATIONS.filter(d => d.type === currentMode);
      }

      markersLayer.clearLayers();

      // 批量渲染标记，提高性能
      const markers: L.Marker[] = [];
      filtered.forEach((dest) => {
        const isSelected = dest.id === selectedDestinationId;
        const customIcon = createCustomIcon(dest, isSelected);
        const marker = L.marker([dest.lat, dest.lng], { icon: customIcon })
          .addTo(markersLayer)
          .on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            savedBoundsRef.current = map.getBounds();
            setSelectedDestinationId(dest.id);
            onSelectDestination(dest);
          })
          .on('mouseover', function() {
            if (!isSelected) {
              this.openPopup();
            }
          })
          .on('mouseout', function() {
            if (!isSelected) {
              this.closePopup();
            }
          });
        markers.push(marker);
        markerCacheRef.current.set(dest.id, marker);
      });

      // 使用动画适配地图视图
      if (filtered.length > 0) {
        const group = L.featureGroup(filtered.map(d => L.marker([d.lat, d.lng])));
        map.fitBounds(group.getBounds().pad(0.3), {
          animate: true,
          duration: 1,
          easeLinearity: 0.25
        });
        savedBoundsRef.current = map.getBounds();
      }

      setIsLoadingMarkers(false);
    }, 300);

    renderMarkers();
  }, [isMapReady, currentMode, userContext, onSelectDestination, createCustomIcon, selectedDestinationId]);

  // 优化的图层菜单
  const modes: { id: MapMode; label: string; icon: React.ReactNode }[] = useMemo(() => [
    { id: 'all', label: t.allDiscovery, icon: <Layers className="w-4 h-4" /> },
    { id: 'destination', label: t.attractions, icon: <MapPin className="w-4 h-4" /> },
    { id: 'hsr', label: t.hsr, icon: <TrainFront className="w-4 h-4" /> },
    { id: 'drive', label: t.selfDrive, icon: <Car className="w-4 h-4" /> },
    { id: 'hotel', label: t.hotels, icon: <Hotel className="w-4 h-4" /> },
    { id: 'museum', label: t.museums, icon: <Landmark className="w-4 h-4" /> },
  ], [t]);

  return (
    <div className="relative h-full w-full bg-[#fdfaf5] overflow-hidden">
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {isLoadingMarkers && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/50">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-[#FF6B35] animate-spin" />
              <span className="text-sm font-bold text-gray-900">加载目的地中...</span>
            </div>
          </div>
        </div>
      )}

      {showExitButton && (
        <>
          <div className="absolute z-[1200] pointer-events-auto" style={{ top: 'calc(env(safe-area-inset-top, 20px) + 8px)', left: '16px' }}>
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
              onClick={(e) => { e.stopPropagation(); setShowSearch(!showSearch); }}
              className="w-12 h-12 bg-white shadow-xl rounded-2xl flex items-center justify-center text-gray-500 border border-gray-100 active:scale-90 transition-all hover:bg-gray-50"
            >
              <Search className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowLayersMenu(true); }}
              className="w-12 h-12 bg-white shadow-xl rounded-2xl flex items-center justify-center text-gray-500 border border-gray-100 active:scale-90 transition-all hover:bg-gray-50"
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
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all ${
                    currentMode === mode.id ? 'bg-[#FF6B35] text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'
                  }`}
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

      {/* 搜索框 */}
      {showSearch && (
        <div className="absolute inset-0 z-[1400] flex items-start justify-end pt-[calc(env(safe-area-inset-top, 20px) + 70px)] pr-6">
          <div className="w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden animate-bubble-in">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'zh' ? '搜索目的地...' : 'Search destinations...'}
                  className="flex-1 bg-transparent border-none focus:outline-none text-[15px] font-bold text-gray-900 placeholder:text-gray-400"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-200 active:scale-90 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* 搜索结果 */}
            <div className="max-h-[60vh] overflow-y-auto">
              {isSearching ? (
                <div className="py-8 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#FF6B35] animate-spin" />
                  <span className="ml-3 text-sm font-medium text-gray-500">{lang === 'zh' ? '搜索中...' : 'Searching...'}</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {searchResults.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleSearchResultClick(result)}
                      className="w-full p-4 flex items-start gap-3 hover:bg-orange-50 transition-all active:scale-[0.98] group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                        <img src={result.imageUrl} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" alt={result.name} />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <h4 className="text-[15px] font-bold text-gray-900 truncate mb-1">{result.name}</h4>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex items-center gap-1 text-[11px] font-medium text-orange-500">
                            <LocationIcon className="w-3 h-3" />
                            <span>{result.distance || '12km'}</span>
                          </div>
                          {result.suggestedDuration && (
                            <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
                              <Clock className="w-3 h-3" />
                              <span>{result.suggestedDuration}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-[12px] text-gray-500 line-clamp-2">{result.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-gray-400">{lang === 'zh' ? '未找到匹配的目的地' : 'No destinations found'}</p>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-gray-400">{lang === 'zh' ? '输入关键词搜索目的地' : 'Enter keywords to search destinations'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-div-icon { background: none !important; border: none !important; }
        .map-marker-box {
          box-shadow: 0 12px 48px rgba(0,0,0,0.15);
          transition: all 0.2s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .map-marker-box:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        .leaflet-container {
          touch-action: pan-y !important;
        }
      `}</style>
    </div>
  );
});

export default MapView;

// 防抖函数
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}