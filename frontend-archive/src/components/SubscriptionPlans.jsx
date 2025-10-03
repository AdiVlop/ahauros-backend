// SubscriptionPlans.jsx - Subscription Plans component
const { useState } = React;

// Import billing service (fallback to global if not available)
const createCheckoutSession = window.createCheckoutSession || (() => {
  console.warn('Billing service not loaded, using fallback');
  return Promise.resolve();
});
const getPlanDetails = window.getPlanDetails || (() => null);
const formatPrice = window.formatPrice || ((amount) => `€${amount}`);

const SubscriptionPlans = () => {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const plans = ['starter', 'growth', 'enterprise'];

  const handleSubscribe = async (planId) => {
    setLoading(planId);
    setError(null);

    try {
      // Get user email from localStorage or prompt
      const userEmail = localStorage.getItem('userEmail') || prompt('Please enter your email:');
      
      if (!userEmail) {
        throw new Error('Email is required for subscription');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userEmail)) {
        throw new Error('Please enter a valid email address');
      }

      // Store email for future use
      localStorage.setItem('userEmail', userEmail);

      console.log(`Starting subscription process for plan: ${planId}, email: ${userEmail}`);
      
      // Create checkout session with real Stripe integration
      await createCheckoutSession(planId, userEmail, 'web-user-' + Date.now());
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err.message || 'Failed to start subscription process');
      setLoading(null);
    }
  };

  const PlanCard = ({ planId }) => {
    const plan = getPlanDetails(planId);
    const isLoading = loading === planId;

    return (
      <div className={`plan-card ${plan.popular ? 'popular' : ''}`}>
        {plan.popular && <div className="popular-badge">Most Popular</div>}
        
        <div className="plan-header">
          <h3 className="plan-name">{plan.name}</h3>
          <div className="plan-price">
            <span className="price-amount">{formatPrice(plan.price, plan.currency)}</span>
            <span className="price-interval">/{plan.interval}</span>
          </div>
        </div>

        <div className="plan-features">
          <ul>
            {plan.features.map((feature, index) => (
              <li key={index} className="feature-item">
                <span className="feature-icon">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="plan-footer">
          <button
            className={`subscribe-button ${isLoading ? 'loading' : ''}`}
            onClick={() => handleSubscribe(planId)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              'Subscribe Now'
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="subscription-plans">
      <div className="plans-header">
        <h2>Choose Your Ahauros AI Plan</h2>
        <p>Unlock the power of AI with our flexible subscription plans</p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="plans-grid">
        {plans.map(planId => (
          <PlanCard key={planId} planId={planId} />
        ))}
      </div>

      <div className="plans-footer">
        <p className="security-note">
          🔒 Secure payment processing by Stripe. Cancel anytime.
        </p>
        <p className="support-note">
          Need help choosing? <a href="mailto:support@ahauros.io">Contact our team</a>
        </p>
      </div>
    </div>
  );
};

// Make SubscriptionPlans available globally
window.SubscriptionPlans = SubscriptionPlans;




// Import billing service (fallback to global if not available)
const createCheckoutSession = window.createCheckoutSession || (() => {
  console.warn('Billing service not loaded, using fallback');
  return Promise.resolve();
});
const getPlanDetails = window.getPlanDetails || (() => null);
const formatPrice = window.formatPrice || ((amount) => `€${amount}`);

const SubscriptionPlans = () => {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const plans = ['starter', 'growth', 'enterprise'];

  const handleSubscribe = async (planId) => {
    setLoading(planId);
    setError(null);

    try {
      // Get user email from localStorage or prompt
      const userEmail = localStorage.getItem('userEmail') || prompt('Please enter your email:');
      
      if (!userEmail) {
        throw new Error('Email is required for subscription');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userEmail)) {
        throw new Error('Please enter a valid email address');
      }

      // Store email for future use
      localStorage.setItem('userEmail', userEmail);

      console.log(`Starting subscription process for plan: ${planId}, email: ${userEmail}`);
      
      // Create checkout session with real Stripe integration
      await createCheckoutSession(planId, userEmail, 'web-user-' + Date.now());
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err.message || 'Failed to start subscription process');
      setLoading(null);
    }
  };

  const PlanCard = ({ planId }) => {
    const plan = getPlanDetails(planId);
    const isLoading = loading === planId;

    return (
      <div className={`plan-card ${plan.popular ? 'popular' : ''}`}>
        {plan.popular && <div className="popular-badge">Most Popular</div>}
        
        <div className="plan-header">
          <h3 className="plan-name">{plan.name}</h3>
          <div className="plan-price">
            <span className="price-amount">{formatPrice(plan.price, plan.currency)}</span>
            <span className="price-interval">/{plan.interval}</span>
          </div>
        </div>

        <div className="plan-features">
          <ul>
            {plan.features.map((feature, index) => (
              <li key={index} className="feature-item">
                <span className="feature-icon">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="plan-footer">
          <button
            className={`subscribe-button ${isLoading ? 'loading' : ''}`}
            onClick={() => handleSubscribe(planId)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              'Subscribe Now'
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="subscription-plans">
      <div className="plans-header">
        <h2>Choose Your Ahauros AI Plan</h2>
        <p>Unlock the power of AI with our flexible subscription plans</p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="plans-grid">
        {plans.map(planId => (
          <PlanCard key={planId} planId={planId} />
        ))}
      </div>

      <div className="plans-footer">
        <p className="security-note">
          🔒 Secure payment processing by Stripe. Cancel anytime.
        </p>
        <p className="support-note">
          Need help choosing? <a href="mailto:support@ahauros.io">Contact our team</a>
        </p>
      </div>
    </div>
  );
};

// Make SubscriptionPlans available globally
window.SubscriptionPlans = SubscriptionPlans;










