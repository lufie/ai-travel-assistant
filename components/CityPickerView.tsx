
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { X, Search, MapPin, Globe, ChevronLeft, Check, Compass, Plane, Sparkles, Loader2 } from 'lucide-react';
import { Location, Language } from '../types';
import { searchGlobalCity } from '../services/gemini';
import { translations } from '../locales';

interface CityPickerViewProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  onSelect: (location: Location) => void;
  currentLocation: Location;
}

interface RegionData {
  region: string;
  countries: {
    name: string;
    flag: string;
    cities: Location[];
  }[];
}

const GLOBAL_GEOGRAPHY: RegionData[] = [
  {
    region: 'Asia Pacific',
    countries: [
      { name: 'China', flag: '🇨🇳', cities: [
        { id: 'bj', city: 'Beijing', country: 'China', code: 'PEK', flag: '🇨🇳' },
        { id: 'sh', city: 'Shanghai', country: 'China', code: 'PVG', flag: '🇨🇳' },
        { id: 'hk', city: 'Hong Kong', country: 'China', code: 'HKG', flag: '🇭🇰' },
      ]},
      { name: 'Japan', flag: '🇯🇵', cities: [
        { id: 'tok', city: 'Tokyo', country: 'Japan', code: 'HND', flag: '🇯🇵' },
      ]}
    ]
  },
  {
    region: 'Europe',
    countries: [
      { name: 'UK & France', flag: '🇪🇺', cities: [
        { id: 'lon', city: 'London', country: 'UK', code: 'LHR', flag: '🇬🇧' },
        { id: 'par', city: 'Paris', country: 'France', code: 'CDG', flag: '🇫🇷' },
      ]}
    ]
  }
];

const FLAT_CITIES = GLOBAL_GEOGRAPHY.flatMap(r => r.countries.flatMap(c => c.cities));

const CityPickerView: React.FC<CityPickerViewProps> = ({ isOpen, lang, onClose, onSelect, currentLocation }) => {
  const [search, setSearch] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiResult, setAiResult] = useState<Location | null>(null);
  
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<{name: string, flag: string, cities: Location[]} | null>(null);
  const t = translations[lang];
  
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return FLAT_CITIES.filter(c => 
      c.city.toLowerCase().includes(q) || 
      c.country.toLowerCase().includes(q) || 
      c.code.toLowerCase().includes(q)
    );
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.length > 1 && searchResults.length === 0) {
        setIsAiSearching(true);
        const result = await searchGlobalCity(search, lang);
        if (result) setAiResult(result);
        setIsAiSearching(false);
      } else {
        setAiResult(null);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [search, searchResults, lang]);

  if (!isOpen) return null;

  const handleBack = () => {
    if (search.trim()) { setSearch(''); setAiResult(null); return; }
    if (selectedCountry) { setSelectedCountry(null); } 
    else if (selectedRegion) { setSelectedRegion(null); } 
    else { onClose(); }
  };

  return (
    <div className="absolute inset-0 z-[2500] flex items-end lg:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-500" onClick={onClose} />
      
      <div className="relative w-full lg:max-w-xl h-[90vh] lg:h-[70vh] bg-white lg:rounded-[40px] rounded-t-[40px] shadow-2xl flex flex-col overflow-hidden pointer-events-auto animate-in slide-in-from-bottom duration-500">
        <div className="shrink-0 px-6 pt-6 pb-4 flex items-center border-b border-gray-50">
          <button onClick={handleBack} className="w-12 h-12 -ml-3 flex items-center justify-center text-gray-900 active:scale-90 transition-all rounded-full hover:bg-gray-50">
            <ChevronLeft className="w-7 h-7" />
          </button>
          <h2 className="flex-1 text-center text-[18px] font-black tracking-tight mr-9 truncate">
            {search ? t.searchCity : selectedCountry ? selectedCountry.name : selectedRegion ? selectedRegion.region : t.selectOrigin}
          </h2>
        </div>

        <div className="px-6 py-4">
          <div className="bg-gray-100/80 h-14 rounded-[20px] px-5 flex items-center gap-4 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#FF6B35]/20 transition-all">
            <Search className="w-5 h-5 text-gray-400" />
            <input type="text" placeholder={lang === 'zh' ? '输入城市名或机场代码...' : 'Search City or Code...'} value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-[15px] font-bold text-gray-900 placeholder:text-gray-400" />
            {search && <button onClick={() => setSearch('')} className="p-1 text-gray-300"><X className="w-5 h-5" /></button>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-10 px-6">
          {search ? (
            <div className="space-y-2">
              {searchResults.map(city => (
                <button key={city.id} onClick={() => onSelect(city)} className="w-full flex items-center justify-between py-5 border-b border-gray-50 group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl group-active:scale-90 transition-transform">{city.flag}</div>
                    <div className="text-left"><p className="text-[16px] font-black text-gray-900">{city.city}</p><p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{city.country} · {city.code}</p></div>
                  </div>
                  {currentLocation.id === city.id && <Check className="w-5 h-5 text-[#FF6B35]" />}
                </button>
              ))}
              {isAiSearching && <div className="py-10 flex flex-col items-center gap-3 text-[#FF6B35]"><Loader2 className="w-6 h-6 animate-spin" /><span className="text-xs font-bold">{t.aiExploring}</span></div>}
              {aiResult && !searchResults.find(r=>r.city===aiResult.city) && (
                <button onClick={() => onSelect(aiResult)} className="w-full flex items-center justify-between p-5 bg-orange-50/50 rounded-3xl border border-orange-100/50 mt-4 animate-bubble-in">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm">{aiResult.flag}</div>
                    <div><p className="text-[16px] font-black text-gray-900">{aiResult.city}</p><div className="flex items-center gap-2 mt-1"><Sparkles className="w-3 h-3 text-[#FF6B35]" /><p className="text-[11px] text-orange-400 font-bold uppercase">{aiResult.country} · {t.aiMatch}</p></div></div>
                  </div>
                </button>
              )}
            </div>
          ) : selectedCountry ? (
            <div className="space-y-1">
              {selectedCountry.cities.map(city => (
                <button key={city.id} onClick={() => onSelect(city)} className="w-full flex items-center justify-between py-5 border-b border-gray-50 px-2 rounded-2xl">
                  <div className="flex items-center gap-5"><div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-[#FF6B35]"><Plane className="w-5 h-5" /></div><div className="text-left"><p className="text-[16px] font-black text-gray-900">{city.city}</p><p className="text-[11px] text-gray-400 font-bold uppercase">{city.code}</p></div></div>
                  {currentLocation.id === city.id && <Check className="w-5 h-5 text-[#FF6B35]" />}
                </button>
              ))}
            </div>
          ) : selectedRegion ? (
            <div className="space-y-1">
              {selectedRegion.countries.map(country => (
                <button key={country.name} onClick={() => setSelectedCountry(country)} className="w-full flex items-center justify-between py-5 border-b border-gray-50 px-2 rounded-2xl"><div className="flex items-center gap-5"><span className="text-3xl">{country.flag}</span><span className="text-[17px] font-black text-gray-800">{country.name}</span></div><ChevronLeft className="w-5 h-5 rotate-180 text-gray-300" /></button>
              ))}
            </div>
          ) : (
            <div className="space-y-10 pt-4">
              <button onClick={() => onSelect(currentLocation)} className="flex items-center gap-5 p-6 bg-[#FF6B35] text-white rounded-[32px] shadow-xl shadow-orange-100 w-full group active:scale-95 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center"><MapPin className="w-6 h-6 fill-current" /></div>
                <div className="flex-1 text-left"><span className="text-[12px] font-black opacity-60 uppercase tracking-widest block mb-1">{t.currentLocation}</span><span className="text-[20px] font-black block leading-none">{currentLocation.city}</span></div>
                <Check className="w-6 h-6" />
              </button>

              <div className="space-y-2">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{t.exploreByRegion}</h3>
                {GLOBAL_GEOGRAPHY.map(region => (
                  <button key={region.region} onClick={() => setSelectedRegion(region)} className="w-full flex items-center justify-between py-6 border-b border-gray-50 px-2 rounded-2xl">
                    <div className="flex items-center gap-5"><div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center"><Globe className="w-6 h-6 text-gray-400" /></div><div className="text-left"><span className="text-[17px] font-black text-gray-800">{region.region}</span></div></div>
                    <ChevronLeft className="w-6 h-6 rotate-180 text-gray-200" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CityPickerView;
