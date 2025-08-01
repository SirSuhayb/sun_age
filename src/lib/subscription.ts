interface SubscriptionData {
  hasAccess: boolean;
  type: 'free' | 'monthly' | 'yearly' | 'solar' | null;
  expiresAt?: Date;
  chartData?: any;
}

// Check if user has active subscription
export function checkSubscriptionStatus(): SubscriptionData {
  // Check localStorage for subscription data
  const subscriptionData = localStorage.getItem('solCodexSubscription');
  const solarAccess = localStorage.getItem('solCodexSolarAccess');
  const chartData = localStorage.getItem('chartData');
  
  // Check SOLAR holder free access
  if (solarAccess) {
    const solarData = JSON.parse(solarAccess);
    if (new Date(solarData.expiresAt) > new Date()) {
      return {
        hasAccess: true,
        type: 'solar',
        expiresAt: new Date(solarData.expiresAt),
        chartData: chartData ? JSON.parse(chartData) : null
      };
    }
  }
  
  // Check paid subscription
  if (subscriptionData) {
    try {
      const data = JSON.parse(subscriptionData);
      // Check if subscription is still valid
      if (data.expiresAt && new Date(data.expiresAt) > new Date()) {
        return {
          hasAccess: true,
          type: data.type,
          expiresAt: new Date(data.expiresAt),
          chartData: chartData ? JSON.parse(chartData) : null
        };
      }
    } catch (error) {
      console.error('Error parsing subscription data:', error);
    }
  }
  
  return {
    hasAccess: false,
    type: null
  };
}

// Save subscription data after successful payment
export function saveSubscriptionData(type: 'monthly' | 'yearly' | 'solar') {
  const expiresAt = new Date();
  
  if (type === 'solar') {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year for SOLAR holders
    localStorage.setItem('solCodexSolarAccess', JSON.stringify({
      type: 'solar',
      grantedAt: new Date(),
      expiresAt: expiresAt
    }));
  } else {
    // For paid subscriptions
    if (type === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }
    
    localStorage.setItem('solCodexSubscription', JSON.stringify({
      type: type,
      purchasedAt: new Date(),
      expiresAt: expiresAt,
      // In production, you'd store the Stripe subscription ID here
    }));
  }
}

// Clear subscription data (for testing or logout)
export function clearSubscriptionData() {
  localStorage.removeItem('solCodexSubscription');
  localStorage.removeItem('solCodexSolarAccess');
  localStorage.removeItem('chartData');
  localStorage.removeItem('birthData');
}