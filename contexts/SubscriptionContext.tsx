import React, { createContext, useContext, useEffect, useState } from 'react';

export type SubscriptionPlan = 'free' | 'monthly' | 'yearly';

export interface Subscription {
  planId: SubscriptionPlan;
  status: 'active' | 'inactive' | 'past_due' | 'canceled';
  startDate: string | null;
  endDate: string | null;
  cancelAtPeriodEnd: boolean;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  isPremium: boolean;
  subscribe: (planId: 'monthly' | 'yearly') => Promise<void>;
  cancelSubscription: () => Promise<void>;
  checkSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

// 模拟API调用
const mockSubscribe = async (planId: 'monthly' | 'yearly'): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟支付成功
      const subscription = {
        planId,
        status: 'active' as const,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false
      };
      localStorage.setItem('user_subscription', JSON.stringify(subscription));
      resolve();
    }, 2000);
  });
};

const mockCancelSubscription = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.removeItem('user_subscription');
      resolve();
    }, 1000);
  });
};

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 检查订阅状态
  const checkSubscription = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const stored = localStorage.getItem('user_subscription');
      if (stored) {
        const sub = JSON.parse(stored) as Subscription;
        // 检查订阅是否过期
        const endDate = new Date(sub.endDate || '');
        const now = new Date();

        if (endDate < now) {
          // 订阅已过期
          setSubscription(null);
          localStorage.removeItem('user_subscription');
        } else {
          setSubscription(sub);
        }
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error('检查订阅状态失败:', err);
      setError('Failed to check subscription status');
    } finally {
      setIsLoading(false);
    }
  };

  // 订阅
  const subscribe = async (planId: 'monthly' | 'yearly') => {
    setIsLoading(true);
    setError(null);

    try {
      await mockSubscribe(planId);

      const endDate = planId === 'monthly'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      const newSubscription: Subscription = {
        planId,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: endDate.toISOString(),
        cancelAtPeriodEnd: false
      };

      setSubscription(newSubscription);
    } catch (err) {
      console.error('订阅失败:', err);
      setError('Subscription failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 取消订阅
  const cancelSubscription = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await mockCancelSubscription();
      setSubscription(null);
    } catch (err) {
      console.error('取消订阅失败:', err);
      setError('Failed to cancel subscription. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 计算是否是高级用户
  const isPremium = subscription !== null &&
    subscription.status === 'active' &&
    new Date(subscription.endDate || '') > new Date();

  // 初始化时检查订阅
  useEffect(() => {
    checkSubscription();
  }, []);

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      isLoading,
      error,
      isPremium,
      subscribe,
      cancelSubscription,
      checkSubscription
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
