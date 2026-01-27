import React, { useState, useEffect } from 'react';
import { ChevronRight, Zap, LogOut, Chrome, MessageCircle, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { deleteSavedItinerary } from '../services/data';
import { SavedItinerary } from '../supabase';
import { Language } from '../types';
import { translations } from '../locales';

interface UserCenterViewProps {
  onBack: () => void;
  lang: Language;
  savedItineraries: (SavedItinerary & { destinationName: string })[];
  isLoadingItineraries?: boolean;
  onDeleteItinerary?: () => void;
  onSelectItinerary?: (itinerary: SavedItinerary & { destinationName: string }) => void;
}

const UserCenterView: React.FC<UserCenterViewProps> = ({
  onBack,
  lang,
  savedItineraries,
  isLoadingItineraries = false,
  onDeleteItinerary,
  onSelectItinerary
}) => {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const t = translations[lang];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(lang === 'zh' ? '确定要删除这个行程吗?' : 'Are you sure you want to delete this itinerary?')) {
      return;
    }

    setDeletingId(id);
    try {
      const success = await deleteSavedItinerary(id);
      if (success) {
        onDeleteItinerary?.();
      }
    } catch (error) {
      console.error('删除行程失败:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogin = async () => {
    // 登录逻辑在 AuthContext 中处理
  };

  const isLoggedIn = !!user;

  return (
    <div className="flex flex-col h-full bg-[#F2F2F7] overflow-hidden" style={{ paddingTop: 'calc(env(safe-area-inset-top, 20px) + 54px)' }}>
      <div className="flex-1 overflow-y-auto px-6 space-y-6 smooth-scroll no-scrollbar pb-[100px]">

        <div className="flex items-center justify-between pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden">
               {isLoggedIn && user?.avatar_url ? (
                 <img src={user.avatar_url} className="w-full h-full object-cover" alt="User" />
               ) : (
                 <div className="w-full h-full bg-gradient-to-br from-[#FF6B35] to-[#FF8E5C] flex items-center justify-center">
                   {isLoggedIn ? (
                     <span className="text-white text-lg font-bold">
                       {user?.name?.charAt(0).toUpperCase() || 'U'}
                     </span>
                   ) : (
                     <div className="w-full h-full bg-gray-50" />
                   )}
                 </div>
               )}
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {isLoggedIn ? user.name || 'AI 出行官' : t.notLoggedIn}
              </h2>
              {isLoggedIn && <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">{t.premium}</span>}
            </div>
          </div>
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-9 h-9 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-300 active:scale-90 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {isLoggedIn ? (
          <div className="space-y-3.5 animate-bubble-in">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">{t.myPlans}</h3>
            <div className="space-y-2.5">
              {isLoadingItineraries ? (
                <div className="py-8 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#FF6B35]" />
                </div>
              ) : savedItineraries.length > 0 ? (
                savedItineraries.map((itinerary) => (
                  <button
                    key={itinerary.id}
                    onClick={() => onSelectItinerary?.(itinerary)}
                    className="w-full text-left bg-white p-4 rounded-[22px] shadow-sm border border-gray-50 flex items-center gap-3.5 active:scale-[0.98] transition-all hover:bg-white/80 group"
                  >
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-[#FF6B35]">
                      <Zap className="w-5 h-5 fill-[#FF6B35]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-gray-900 truncate">{itinerary.destination_name}</p>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5 uppercase tracking-wide">
                        {itinerary.data?.totalBudget} · {itinerary.data?.items?.length || 0} {lang === 'zh' ? '站' : 'Stops'}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(itinerary.id, e)}
                      disabled={deletingId === itinerary.id}
                      className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-100 hover:text-red-500 active:scale-90 transition-all opacity-0 group-hover:opacity-100"
                    >
                      {deletingId === itinerary.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </button>
                ))
              ) : (
                <div className="py-10 bg-white rounded-[22px] border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300">
                  <p className="text-[10px] font-bold uppercase tracking-widest">{t.noPlans}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 animate-bubble-in">
             <h3 className="text-base font-bold text-gray-900 mb-6">{t.loginExperience}</h3>
             <div className="flex flex-col gap-3 w-full px-4">
                <button
                  onClick={handleLogin}
                  className="w-full py-3.5 bg-[#07C160] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-white" /> {t.wechatLogin}
                </button>
                <button
                  onClick={handleLogin}
                  className="w-full py-3.5 bg-white text-gray-800 border border-gray-100 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
                >
                  <Chrome className="w-4 h-4 text-blue-500" /> {t.googleLogin}
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCenterView;