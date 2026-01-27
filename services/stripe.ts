// Stripe 支付服务
// 注意：实际使用需要在 Stripe Dashboard 创建产品并获取 Price IDs

export interface StripePrice {
  id: string;
  planId: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  interval: 'month' | 'year';
}

// Stripe 价格配置
// 这些需要在 Stripe Dashboard 中创建产品并获取实际的 Price ID
export const STRIPE_PRICES: StripePrice[] = [
  {
    id: 'price_monthly', // 实际部署时需要替换为真实的 Stripe Price ID
    planId: 'monthly',
    amount: 499, // $4.99 USD
    currency: 'usd',
    interval: 'month'
  },
  {
    id: 'price_yearly', // 实际部署时需要替换为真实的 Stripe Price ID
    planId: 'yearly',
    amount: 4799, // $47.99 USD
    currency: 'usd',
    interval: 'year'
  }
];

/**
 * 创建 Stripe Checkout Session
 * 注意：这需要一个后端 API 来创建 Checkout Session
 * 前端不能直接调用 Stripe API 创建 Session
 */
export const createCheckoutSession = async (
  priceId: string
): Promise<{ sessionId: string; url: string }> => {
  // 模拟创建 Checkout Session
  // 实际使用时需要调用您的后端 API
  return new Promise((resolve) => {
    setTimeout(() => {
      const sessionId = `cs_test_${Date.now()}`;
      const checkoutUrl = `https://checkout.stripe.com/pay/${sessionId}`;

      console.log('创建 Checkout Session:', { sessionId, priceId });

      resolve({
        sessionId,
        url: checkoutUrl
      });
    }, 1000);
  });
};

/**
 * 跳转到 Stripe Checkout
 */
export const redirectToStripeCheckout = async (priceId: string) => {
  try {
    const { url } = await createCheckoutSession(priceId);
    window.location.href = url;
  } catch (error) {
    console.error('跳转到支付失败:', error);
    throw new Error('Failed to redirect to checkout');
  }
};

/**
 * 验证支付状态
 * 注意：这需要后端 API 来验证 Session 状态
 */
export const verifyPaymentStatus = async (sessionId: string): Promise<boolean> => {
  // 模拟验证支付状态
  // 实际使用时需要调用您的后端 API
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('验证支付状态:', sessionId);
      resolve(true);
    }, 1000);
  });
};

/**
 * 获取订阅计划价格
 */
export const getPlanPrice = (planId: 'monthly' | 'yearly'): StripePrice | undefined => {
  return STRIPE_PRICES.find(p => p.planId === planId);
};

/**
 * 格式化价格显示
 */
export const formatPrice = (price: StripePrice, lang: 'zh' | 'en'): string => {
  if (lang === 'zh') {
    // 转换为人民币显示（汇率约 7:1）
    const cnyPrice = Math.round(price.amount * 7);
    return `¥${cnyPrice}`;
  } else {
    return `$${(price.amount / 100).toFixed(2)}`;
  }
};
