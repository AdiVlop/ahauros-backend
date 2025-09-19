// billing.js - Stripe Billing Service
const API_BASE_URL = 'https://api.ahauros.io';

// Stripe Test Keys
const STRIPE_PUBLISHABLE_KEY = "pk_test_51S2sC7QbMbo4QVSdgP2GHPuE8qs2WH2RKMFL9m2An7Zk4CKj1sfk0PfGZqpWIvJdsKS87DBSR66UT5ricYomME3900ghX2B75q";

export function getStripePublishableKey() {
  return STRIPE_PUBLISHABLE_KEY;
}

// Plan details mapping
const PLAN_DETAILS = {
  starter: {
    name: 'Starter Plan',
    price: 199,
    currency: 'EUR',
    features: [
      'Basic AI features',
      '10,000 requests/month',
      'Email support',
      'Dashboard access'
    ]
  },
  growth: {
    name: 'Growth Plan',
    price: 699,
    currency: 'EUR',
    features: [
      'Advanced AI features',
      '100,000 requests/month',
      'Priority support',
      'API access',
      'Custom integrations'
    ]
  },
  enterprise: {
    name: 'Enterprise Plan',
    price: 1499,
    currency: 'EUR',
    features: [
      'All AI features',
      'Unlimited requests',
      '24/7 support',
      'Custom integrations',
      'SLA guarantee',
      'Dedicated account manager'
    ]
  }
};

export function getPlanDetails(planId) {
  return PLAN_DETAILS[planId] || null;
}

export function formatPrice(amount, currency = 'EUR') {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

// Create Stripe Checkout Session
export async function createCheckoutSession(planId, email, userId = null) {
  try {
    console.log(`Creating checkout session for plan: ${planId}, email: ${email}`);
    
    const response = await fetch(`${API_BASE_URL}/billing/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: planId,
        email: email,
        user_id: userId || 'web-user-' + Date.now()
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create checkout session');
    }

    if (data.success && data.checkout_url) {
      console.log('Redirecting to Stripe Checkout:', data.checkout_url);
      window.location.href = data.checkout_url;
    } else {
      throw new Error(data.message || 'No checkout URL received');
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    alert(`Error: ${error.message}`);
    throw error;
  }
}

// Get subscription status
export async function getSubscriptionStatus(email) {
  try {
    const response = await fetch(`${API_BASE_URL}/billing/status?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch subscription status');
    }

    return data;
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return { has_subscription: false, error: error.message };
  }
}

// Handle subscription success
export function handleSubscriptionSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  
  if (sessionId) {
    return {
      success: true,
      sessionId: sessionId,
      message: 'Felicitări! Abonamentul tău Ahauros este activ.'
    };
  }
  
  return {
    success: false,
    message: 'Sesiunea de plată nu a fost găsită.'
  };
}

// Handle subscription cancel
export function handleSubscriptionCancel() {
  const urlParams = new URLSearchParams(window.location.search);
  const reason = urlParams.get('reason') || 'user_cancelled';
  
  return {
    cancelled: true,
    reason: reason,
    message: 'Plata a fost anulată. Te rugăm să reîncerci când ești gata.'
  };
}

// Make functions available globally for fallback
if (typeof window !== 'undefined') {
  window.createCheckoutSession = createCheckoutSession;
  window.getSubscriptionStatus = getSubscriptionStatus;
  window.getPlanDetails = getPlanDetails;
  window.formatPrice = formatPrice;
  window.handleSubscriptionSuccess = handleSubscriptionSuccess;
  window.handleSubscriptionCancel = handleSubscriptionCancel;
}



// Stripe Test Keys
const STRIPE_PUBLISHABLE_KEY = "pk_test_51S2sC7QbMbo4QVSdgP2GHPuE8qs2WH2RKMFL9m2An7Zk4CKj1sfk0PfGZqpWIvJdsKS87DBSR66UT5ricYomME3900ghX2B75q";

export function getStripePublishableKey() {
  return STRIPE_PUBLISHABLE_KEY;
}

// Plan details mapping
const PLAN_DETAILS = {
  starter: {
    name: 'Starter Plan',
    price: 199,
    currency: 'EUR',
    features: [
      'Basic AI features',
      '10,000 requests/month',
      'Email support',
      'Dashboard access'
    ]
  },
  growth: {
    name: 'Growth Plan',
    price: 699,
    currency: 'EUR',
    features: [
      'Advanced AI features',
      '100,000 requests/month',
      'Priority support',
      'API access',
      'Custom integrations'
    ]
  },
  enterprise: {
    name: 'Enterprise Plan',
    price: 1499,
    currency: 'EUR',
    features: [
      'All AI features',
      'Unlimited requests',
      '24/7 support',
      'Custom integrations',
      'SLA guarantee',
      'Dedicated account manager'
    ]
  }
};

export function getPlanDetails(planId) {
  return PLAN_DETAILS[planId] || null;
}

export function formatPrice(amount, currency = 'EUR') {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

// Create Stripe Checkout Session
export async function createCheckoutSession(planId, email, userId = null) {
  try {
    console.log(`Creating checkout session for plan: ${planId}, email: ${email}`);
    
    const response = await fetch(`${API_BASE_URL}/billing/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: planId,
        email: email,
        user_id: userId || 'web-user-' + Date.now()
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create checkout session');
    }

    if (data.success && data.checkout_url) {
      console.log('Redirecting to Stripe Checkout:', data.checkout_url);
      window.location.href = data.checkout_url;
    } else {
      throw new Error(data.message || 'No checkout URL received');
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    alert(`Error: ${error.message}`);
    throw error;
  }
}

// Get subscription status
export async function getSubscriptionStatus(email) {
  try {
    const response = await fetch(`${API_BASE_URL}/billing/status?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch subscription status');
    }

    return data;
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return { has_subscription: false, error: error.message };
  }
}

// Handle subscription success
export function handleSubscriptionSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  
  if (sessionId) {
    return {
      success: true,
      sessionId: sessionId,
      message: 'Felicitări! Abonamentul tău Ahauros este activ.'
    };
  }
  
  return {
    success: false,
    message: 'Sesiunea de plată nu a fost găsită.'
  };
}

// Handle subscription cancel
export function handleSubscriptionCancel() {
  const urlParams = new URLSearchParams(window.location.search);
  const reason = urlParams.get('reason') || 'user_cancelled';
  
  return {
    cancelled: true,
    reason: reason,
    message: 'Plata a fost anulată. Te rugăm să reîncerci când ești gata.'
  };
}

// Make functions available globally for fallback
if (typeof window !== 'undefined') {
  window.createCheckoutSession = createCheckoutSession;
  window.getSubscriptionStatus = getSubscriptionStatus;
  window.getPlanDetails = getPlanDetails;
  window.formatPrice = formatPrice;
  window.handleSubscriptionSuccess = handleSubscriptionSuccess;
  window.handleSubscriptionCancel = handleSubscriptionCancel;
}









