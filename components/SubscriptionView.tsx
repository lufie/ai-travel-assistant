import React, { useState } from 'react';
import { Check, X, Crown, Zap, Star, Loader2, Shield } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../locales';

interface SubscriptionPlan {
  id: 'free' | 'monthly' | 'yearly';
  name: string;
  nameEn: string;
  price: string;
  priceEn: string;
  features: string[];
  featuresEn: string[];
  popular?: boolean;
  icon: React.ReactNode;
}

interface SubscriptionViewProps {
  lang: Language;
  onClose: () => void;
  onSubscribe?: (planId: 'monthly' | 'yearly') => void;
  isSubscribed?: boolean;
  isLoading?: boolean;
}

const SubscriptionView: React.FC<SubscriptionViewProps> = ({
  lang,
  onClose,
  onSubscribe,
  isSubscribed = false,
  isLoading = false
}) => {
  const t = translations[lang];
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: '免费版',
      nameEn: 'Free',
      price: '¥0',
      priceEn: '$0',
      features: [
        '基础旅行建议',
        '地图浏览',
        '每日5次AI对话'
      ],
      featuresEn: [
        'Basic travel advice',
        'Map browsing',
        '5 AI chats per day'
      ],
      icon: <Star className="w-6 h-6 text-gray-400" />
    },
    {
      id: 'monthly',
      name: '月度会员',
      nameEn: 'Monthly',
      price: '¥29',
      priceEn: '$4.99',
      features: [
        '免费版所有功能',
        '无限次AI对话',
        '优先响应速度',
        '专属客服支持',
        '取消订阅随时有效'
      ],
      featuresEn: [
        'All Free features',
        'Unlimited AI chats',
        'Priority response speed',
        'Exclusive support',
        'Cancel anytime'
      ],
      popular: true,
      icon: <Crown className="w-6 h-6 text-[#FF6B35]" />
    },
    {
      id: 'yearly',
      name: '年度会员',
      nameEn: 'Yearly',
      price: '¥288',
      priceEn: '$47.99',
      features: [
        '月度会员所有功能',
        '节省20%费用',
        '优先新功能体验',
        '历史记录云同步',
        '多设备同步'
      ],
      featuresEn: [
        'All Monthly features',
        'Save 20%',
        'Early access to new features',
        'Cloud sync',
        'Multi-device sync'
      ],
      icon: <Zap className="w-6 h-6 text-purple-500" />
    }
  ];

  const handleSubscribe = async (planId: 'monthly' | 'yearly') => {
    if (isProcessing || isSubscribed) return;

    setSelectedPlan(planId);
    setIsProcessing(true);

    try {
      if (onSubscribe) {
        await onSubscribe(planId);
      }
    } catch (error) {
      console.error('订阅失败:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlanClick = (planId: 'monthly' | 'yearly') => {
    if (isSubscribed) {
      alert(lang === 'zh' ? '您已经是订阅用户' : 'You are already a subscriber');
      return;
    }
    handleSubscribe(planId);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl mx-6 bg-white/95 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/50 overflow-hidden animate-bubble-in">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 头部 */}
        <div className="text-center pt-12 pb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-3">
            {lang === 'zh' ? '升级您的旅行体验' : 'Upgrade Your Travel Experience'}
          </h2>
          <p className="text-[15px] text-gray-500 font-medium max-w-md mx-auto">
            {lang === 'zh'
              ? '解锁所有高级功能，让AI成为您的智能旅行伙伴'
              : 'Unlock all premium features and let AI be your smart travel companion'}
          </p>
        </div>

        {/* 订阅计划 */}
        <div className="px-8 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-6 rounded-3xl border-2 transition-all duration-300 ${
                  selectedPlan === plan.id
                    ? 'border-[#FF6B35] bg-orange-50/30 scale-105 shadow-lg'
                    : plan.popular
                      ? 'border-orange-200 bg-white hover:border-[#FF6B35] hover:shadow-lg'
                      : 'border-gray-200 bg-white'
                } ${isSubscribed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => plan.id !== 'free' && handlePlanClick(plan.id)}
              >
                {/* 热门标签 */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#FF6B35] text-white text-[11px] font-bold px-4 py-1 rounded-full">
                    {lang === 'zh' ? '最热门' : 'Most Popular'}
                  </div>
                )}

                {/* 已订阅标签 */}
                {isSubscribed && plan.id !== 'free' && (
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-full text-[11px] font-bold">
                      <Check className="w-3.5 h-3.5" />
                      {lang === 'zh' ? '已订阅' : 'Subscribed'}
                    </div>
                  </div>
                )}

                {/* 图标和名称 */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    {plan.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{lang === 'zh' ? plan.name : plan.nameEn}</h3>
                </div>

                {/* 价格 */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-gray-900">
                      {lang === 'zh' ? plan.price : plan.priceEn}
                    </span>
                    {plan.id === 'monthly' && (
                      <span className="text-sm text-gray-400">
                        {lang === 'zh' ? '/月' : '/month'}
                      </span>
                    )}
                    {plan.id === 'yearly' && (
                      <span className="text-sm text-gray-400">
                        {lang === 'zh' ? '/年' : '/year'}
                      </span>
                    )}
                  </div>
                  {plan.id === 'yearly' && (
                    <p className="text-xs text-green-600 font-bold mt-1">
                      {lang === 'zh' ? '节省 ¥60 / 年' : 'Save $12 / year'}
                    </p>
                  )}
                </div>

                {/* 功能列表 */}
                <ul className="space-y-3">
                  {(lang === 'zh' ? plan.features : plan.featuresEn).map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm font-medium text-gray-700">
                      <Check className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* 订阅按钮 */}
                {plan.id !== 'free' && (
                  <button
                    onClick={() => handlePlanClick(plan.id)}
                    disabled={isProcessing || isSubscribed}
                    className={`w-full mt-6 py-4 rounded-2xl text-[15px] font-bold transition-all active:scale-95 ${
                      selectedPlan === plan.id
                        ? 'bg-[#FF6B35] text-white shadow-lg'
                        : plan.popular
                          ? 'bg-[#FF6B35] text-white shadow-md'
                          : 'bg-gray-900 text-white shadow-md hover:shadow-lg'
                    } ${isSubscribed ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isProcessing && selectedPlan === plan.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{lang === 'zh' ? '处理中...' : 'Processing...'}</span>
                      </div>
                    ) : isSubscribed ? (
                      <div className="flex items-center justify-center gap-2">
                        <Check className="w-5 h-5" />
                        <span>{lang === 'zh' ? '已订阅' : 'Subscribed'}</span>
                      </div>
                    ) : (
                      lang === 'zh' ? '立即订阅' : 'Subscribe Now'
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* 免费版提示 */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-[13px] text-gray-500 font-medium mb-3">
                {lang === 'zh'
                  ? '免费用户可继续使用基础功能，但会有限制'
                  : 'Free users can continue using basic features, but with limitations'}
              </p>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-2xl text-[14px] font-bold hover:bg-gray-200 transition-all"
              >
                {lang === 'zh' ? '继续使用免费版' : 'Continue with Free'}
              </button>
            </div>
          </div>

          {/* 安全说明 */}
          <div className="px-8 pb-8">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Shield className="w-4 h-4" />
              {lang === 'zh' ? '安全支付支持 • 取消订阅随时有效 • 7天退款保障' : 'Secure payment • Cancel anytime • 7-day money-back guarantee'}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animate-in { animation: slideIn 0.3s ease-out; }
        @keyframes slideIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SubscriptionView;
