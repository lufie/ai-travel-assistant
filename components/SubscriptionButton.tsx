import React from 'react';
import { Crown, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../locales';
import { useSubscription } from '../contexts/SubscriptionContext';

interface SubscriptionButtonProps {
  lang: Language;
  onClick: () => void;
}

const SubscriptionButton: React.FC<SubscriptionButtonProps> = ({ lang, onClick }) => {
  const t = translations[lang];
  const { isPremium, subscription, isLoading } = useSubscription();

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`px-6 py-2.5 rounded-full text-[12px] font-bold transition-all active:scale-95 flex items-center gap-2 ${
        isPremium
          ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white shadow-lg shadow-yellow-200/50'
          : 'bg-gradient-to-r from-[#FF6B35] to-[#FF8E5C] text-white shadow-lg shadow-orange-200/50 hover:shadow-xl'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
        <Sparkles className="w-4 h-4 animate-pulse" />
      ) : (
        <Crown className="w-4 h-4" />
      )}
      <span>
        {isPremium
          ? (lang === 'zh' ? 'Premium会员' : 'Premium')
          : (lang === 'zh' ? '升级Premium' : 'Upgrade Premium')
        }
      </span>
      {subscription && (
        <span className="ml-2 text-xs opacity-80">
          {lang === 'zh' ? '有效期至 ' : 'Valid until '}{new Date(subscription.endDate || '').toLocaleDateString()}
        </span>
      )}
    </button>
  );
};

export default SubscriptionButton;
