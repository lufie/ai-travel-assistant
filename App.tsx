
import React, { useState, useCallback, useRef, useEffect } from 'react';
import ChatView, { ChatViewHandle } from './components/ChatView';
import MapView from './components/MapView';
import DetailView from './components/DetailView';
import WelcomeView from './components/WelcomeView';
import UserCenterView from './components/UserCenterView';
import CityPickerView from './components/CityPickerView';
import SubscriptionView from './components/SubscriptionView';
import SubscriptionButton from './components/SubscriptionButton';
import { ViewType, Destination, Itinerary, Location, Language } from './types';
import { MOCK_DESTINATIONS } from './constants';
import { translations } from './locales';
import { Languages } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SubscriptionProvider, useSubscription } from './contexts/SubscriptionContext';
import { getSavedItineraries, saveItinerary, deleteSavedItinerary } from './services/data';
import { SavedItinerary } from './supabase';

const INITIAL_LOCATION: Location = { 
  id: 'bj', 
  city: '北京', 
  country: '中国', 
  code: 'BJS', 
  flag: '🇨🇳' 
 };

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const { subscribe, cancelSubscription, subscription } = useSubscription();

  // 自动检测系统语言
  const detectSystemLanguage = (): Language => {
    const browserLang = navigator.language || navigator.languages?.[0] || 'en';
    return browserLang.startsWith('zh') ? 'zh' : 'en';
  };

  const [lang, setLang] = useState<Language>(detectSystemLanguage());
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.WELCOME);
  const [activeTab, setActiveTab] = useState<'explore' | 'trip'>('explore');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [userNeeds, setUserNeeds] = useState<string>("");
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [savedItineraries, setSavedItineraries] = useState<(SavedItinerary & { destinationName: string })[]>([]);
  const [isLoadingItineraries, setIsLoadingItineraries] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);

  const [departureLocation, setDepartureLocation] = useState<Location>(INITIAL_LOCATION);
  const [intentKeyword, setIntentKeyword] = useState("");
  const [showCityPicker, setShowCityPicker] = useState(false);

  const interactionLockRef = useRef<boolean>(false);
  const chatRef = useRef<ChatViewHandle>(null);

  const t = translations[lang];

  // 加载已保存的行程
  useEffect(() => {
    if (user) {
      loadSavedItineraries();
    } else {
      setSavedItineraries([]);
    }
  }, [user]);

  const loadSavedItineraries = async () => {
    if (!user) return;
    setIsLoadingItineraries(true);
    try {
      const itineraries = await getSavedItineraries(user.id);
      setSavedItineraries(itineraries);
    } catch (error) {
      console.error('加载行程失败:', error);
    } finally {
      setIsLoadingItineraries(false);
    }
  };

  // 保存行程
  const handleSaveItinerary = async (itinerary: Itinerary & { destinationName: string }) => {
    if (!user) {
      alert(lang === 'zh' ? '请先登录' : 'Please login first');
      return;
    }

    // 检查是否已存在
    const existing = savedItineraries.find(item => item.destination_id === itinerary.destinationId);

    if (existing) {
      // 删除
      const success = await deleteSavedItinerary(existing.id);
      if (success) {
        setSavedItineraries(prev => prev.filter(item => item.id !== existing.id));
      }
    } else {
      // 保存
      const newItinerary = await saveItinerary({
        user_id: user.id,
        destination_id: itinerary.destinationId,
        destination_name: itinerary.destinationName,
        data: itinerary
      });
      if (newItinerary) {
        setSavedItineraries(prev => [newItinerary, ...prev]);
      }
    }
  };

  // 处理订阅
  const handleSubscribe = async (planId: 'monthly' | 'yearly') => {
    try {
      await subscribe(planId);
      setShowSubscription(false);
      alert(lang === 'zh' ? '订阅成功！感谢您的支持' : 'Subscription successful! Thank you for your support');
    } catch (error) {
      console.error('订阅失败:', error);
      alert(lang === 'zh' ? '订阅失败，请稍后再试' : 'Subscription failed, please try again later');
    }
  };

  // 取消订阅
  const handleCancelSubscription = async () => {
    if (!confirm(lang === 'zh' ? '确定要取消订阅吗？' : 'Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      await cancelSubscription();
      alert(lang === 'zh' ? '订阅已取消' : 'Subscription canceled');
    } catch (error) {
      console.error('取消订阅失败:', error);
      alert(lang === 'zh' ? '取消订阅失败，请稍后再试' : 'Failed to cancel subscription, please try again later');
    }
  };

  const handleMapInteraction = useCallback(() => {
    if (interactionLockRef.current || currentView !== ViewType.MAP) return;
    setIsChatVisible(false);
  }, [currentView]);

  const handleExitMap = useCallback(() => {
    setUserNeeds("");
    setIntentKeyword("");
    setSelectedDestination(null);
    setCurrentView(ViewType.WELCOME);
    setIsChatVisible(true);
    if (chatRef.current) {
      chatRef.current.setInputValue("");
      chatRef.current.clearMessages();
    }
  }, []);

  const handleToggleSaveItinerary = async (itinerary: Itinerary & { destinationName: string }) => {
    await handleSaveItinerary(itinerary);
  };

  const handleTabChange = (tab: 'explore' | 'trip') => {
    setActiveTab(tab);
    if (tab === 'trip') {
      setCurrentView(ViewType.USER_CENTER);
    } else {
      setCurrentView(userNeeds ? ViewType.MAP : ViewType.WELCOME);
      setIsChatVisible(true);
    }
  };

  const handleNewNeedEntered = (need: string) => {
    setUserNeeds(need);
    interactionLockRef.current = true;
    setCurrentView(ViewType.MAP);
    setIsChatVisible(true);
    setTimeout(() => {
      interactionLockRef.current = false;
    }, 1000);
  };

  const handleCitySelect = (loc: Location) => {
    setDepartureLocation(loc);
    setShowCityPicker(false);
  };

  const handleKeywordSelect = (kw: string) => {
    setIntentKeyword(kw);
    chatRef.current?.setInputValue(kw);
  };

  const handleSelectDestination = useCallback((d: Destination) => {
    setSelectedDestination(d);
    setCurrentView(ViewType.DETAIL);
    setIsChatVisible(false);
  }, []);

  const handleSelectSavedItinerary = (itinerary: SavedItinerary & { destinationName: string }) => {
    const dest = MOCK_DESTINATIONS.find(d => d.id === itinerary.destination_id);
    if (dest) {
      setActiveTab('explore');
      handleSelectDestination(dest);
    }
  };

  const isWelcomeStage = currentView === ViewType.WELCOME && activeTab === 'explore';
  const isMapStage = currentView === ViewType.MAP && activeTab === 'explore';
  const isDetailStage = currentView === ViewType.DETAIL && selectedDestination !== null;

  return (
    <div className="fixed inset-0 flex flex-col w-full h-full bg-black overflow-hidden select-none text-gray-900 font-medium">
      
      <CityPickerView 
        isOpen={showCityPicker}
        lang={lang}
        onClose={() => setShowCityPicker(false)}
        onSelect={handleCitySelect}
        currentLocation={departureLocation}
      />

      {/* 顶部导航 */}
      {!isDetailStage && (
        <div
          className="absolute left-0 right-0 z-[250] flex justify-center pointer-events-none px-6"
          style={{ top: 'calc(env(safe-area-inset-top, 20px) + 0px)' }}
        >
          <div className="w-full max-w-2xl h-[60px] flex items-center justify-end pointer-events-auto gap-3">
            <div className="flex items-center h-[42px] p-1 bg-white/80 backdrop-blur-3xl rounded-full border border-white/40 shadow-2xl">
              <button
                onClick={() => handleTabChange('explore')}
                className={`px-8 lg:px-12 h-[34px] rounded-full text-[13px] font-bold transition-all duration-300 ${
                  activeTab === 'explore' ? 'bg-[#FF6B35] text-white shadow-lg' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {t.explore}
              </button>
              <button
                onClick={() => handleTabChange('trip')}
                className={`px-8 lg:px-12 h-[34px] rounded-full text-[13px] font-bold transition-all duration-300 ${
                  activeTab === 'trip' ? 'bg-[#FF6B35] text-white shadow-lg' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {t.trip}
              </button>
            </div>

            {/* 订阅按钮 */}
            <SubscriptionButton
              lang={lang}
              onClick={() => setShowSubscription(true)}
            />
          </div>
        </div>
      )}

      <main className="flex-1 relative overflow-hidden bg-white">
        <div 
          className={`absolute inset-0 flex transition-transform duration-[800ms] cubic-bezier ${isDetailStage ? 'pointer-events-none opacity-50' : 'pointer-events-auto'}`}
          style={{ transform: activeTab === 'explore' ? 'translateX(0)' : 'translateX(-100%)' }}
        >
          <div className="w-full h-full shrink-0 relative overflow-hidden bg-white">
            <MapView 
                lang={lang}
                userContext={userNeeds}
                onInteraction={handleMapInteraction}
                showExitButton={isMapStage}
                onExit={handleExitMap}
                onSelectDestination={handleSelectDestination} 
            />
            
            <WelcomeView 
              lang={lang}
              isVisible={isWelcomeStage} 
              departureCity={departureLocation.city}
              intentKeyword={intentKeyword}
              onCityClick={() => setShowCityPicker(true)}
              onSelectKeyword={handleKeywordSelect}
            />

            <ChatView 
              ref={chatRef}
              lang={lang}
              isVisible={isChatVisible}
              isWelcomeMode={isWelcomeStage}
              onNewNeed={handleNewNeedEntered}
              onKeywordSelect={(kw) => setIntentKeyword(kw)}
              onClose={() => setIsChatVisible(false)}
              onOpen={() => setIsChatVisible(true)}
            />
          </div>

          <div className="w-full h-full shrink-0 relative bg-[#F2F2F7] flex justify-center overflow-y-auto">
             <div className="w-full max-w-4xl">
                <UserCenterView
                  lang={lang}
                  savedItineraries={savedItineraries}
                  isLoadingItineraries={isLoadingItineraries}
                  onDeleteItinerary={loadSavedItineraries}
                  onBack={() => setActiveTab('explore')}
                  onSelectItinerary={handleSelectSavedItinerary}
                />
             </div>
          </div>
        </div>

        <div className={`absolute inset-0 lg:left-auto lg:right-0 lg:w-[450px] lg:border-l lg:border-gray-100 z-[800] transition-all duration-700 cubic-bezier shadow-[-20px_0_60px_rgba(0,0,0,0.05)] ${
          isDetailStage
            ? 'translate-y-0 lg:translate-x-0 pointer-events-auto opacity-100'
            : 'translate-y-full lg:translate-y-0 lg:translate-x-full pointer-events-none opacity-0'
        }`}>
          {selectedDestination && (
            <DetailView
              lang={lang}
              destination={selectedDestination}
              userContext={userNeeds}
              savedItineraries={savedItineraries}
              onToggleSave={handleToggleSaveItinerary}
              onBack={() => {
                setCurrentView(ViewType.MAP);
                setSelectedDestination(null);
                setIsChatVisible(true);
              }}
            />
          )}
        </div>
      </main>

      {/* 订阅视图 */}
      {showSubscription && (
        <SubscriptionView
          lang={lang}
          onClose={() => setShowSubscription(false)}
          onSubscribe={handleSubscribe}
          isSubscribed={subscription !== null && subscription.status === 'active'}
        />
      )}

      <style>{`
        .cubic-bezier { transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1); }
        @keyframes bubble-in {
          from { transform: translateY(12px) scale(0.98); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-bubble-in { animation: bubble-in 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

const AppWrapper: React.FC = () => {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <AppContent />
      </SubscriptionProvider>
    </AuthProvider>
  );
};

export default AppWrapper;
