// SubscriptionStatus.jsx - Subscription Status component
const { useState, useEffect } = React;

const SubscriptionStatus = ({ email = 'test@example.com' }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [email]);

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`https://api.ahauros.io/billing/status?email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.has_subscription) {
        setSubscription(data.subscription);
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error('Error fetching subscription status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'green', icon: '🟢', text: 'Active' },
      trialing: { color: 'blue', icon: '🔵', text: 'Trial' },
      past_due: { color: 'orange', icon: '🟠', text: 'Past Due' },
      canceled: { color: 'red', icon: '🔴', text: 'Canceled' },
      incomplete: { color: 'yellow', icon: '🟡', text: 'Incomplete' },
      incomplete_expired: { color: 'red', icon: '🔴', text: 'Expired' },
      unpaid: { color: 'red', icon: '🔴', text: 'Unpaid' }
    };

    const config = statusConfig[status] || { color: 'gray', icon: '⚪', text: status };
    
    return (
      <span className={`status-badge status-${config.color}`}>
        <span className="status-icon">{config.icon}</span>
        <span className="status-text">{config.text}</span>
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPlanDisplayName = (plan) => {
    const planNames = {
      starter: 'Starter Plan',
      growth: 'Growth Plan',
      enterprise: 'Enterprise Plan'
    };
    return planNames[plan] || plan;
  };

  if (loading) {
    return (
      <div className="subscription-status">
        <div className="status-loading">
          <div className="spinner"></div>
          <p>Loading subscription status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="subscription-status">
        <div className="status-error">
          <p>❌ Error loading subscription status: {error}</p>
          <button onClick={fetchSubscriptionStatus} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="subscription-status">
        <div className="no-subscription">
          <h4>📋 No Active Subscription</h4>
          <p>You don't have an active subscription yet.</p>
          <p>Choose a plan below to get started with Ahauros AI!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-status">
      <div className="subscription-card">
        <div className="subscription-header">
          <h4>💳 Current Subscription</h4>
          {getStatusBadge(subscription.status)}
        </div>
        
        <div className="subscription-details">
          <div className="detail-row">
            <span className="detail-label">Plan:</span>
            <span className="detail-value">{getPlanDisplayName(subscription.plan)}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className="detail-value">{getStatusBadge(subscription.status)}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Current Period:</span>
            <span className="detail-value">
              {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
            </span>
          </div>
          
          {subscription.trial_start && subscription.trial_end && (
            <div className="detail-row">
              <span className="detail-label">Trial Period:</span>
              <span className="detail-value">
                {formatDate(subscription.trial_start)} - {formatDate(subscription.trial_end)}
              </span>
            </div>
          )}
          
          <div className="detail-row">
            <span className="detail-label">Created:</span>
            <span className="detail-value">{formatDate(subscription.created_at)}</span>
          </div>
          
          {subscription.canceled_at && (
            <div className="detail-row">
              <span className="detail-label">Canceled:</span>
              <span className="detail-value">{formatDate(subscription.canceled_at)}</span>
            </div>
          )}
          
          {subscription.cancel_at_period_end && (
            <div className="detail-row">
              <span className="detail-label">Cancellation:</span>
              <span className="detail-value">Will cancel at period end</span>
            </div>
          )}
        </div>
        
        <div className="subscription-actions">
          <button 
            onClick={fetchSubscriptionStatus} 
            className="refresh-button"
            title="Refresh subscription status"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

// Make SubscriptionStatus available globally
window.SubscriptionStatus = SubscriptionStatus;




const SubscriptionStatus = ({ email = 'test@example.com' }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [email]);

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`https://api.ahauros.io/billing/status?email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.has_subscription) {
        setSubscription(data.subscription);
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error('Error fetching subscription status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'green', icon: '🟢', text: 'Active' },
      trialing: { color: 'blue', icon: '🔵', text: 'Trial' },
      past_due: { color: 'orange', icon: '🟠', text: 'Past Due' },
      canceled: { color: 'red', icon: '🔴', text: 'Canceled' },
      incomplete: { color: 'yellow', icon: '🟡', text: 'Incomplete' },
      incomplete_expired: { color: 'red', icon: '🔴', text: 'Expired' },
      unpaid: { color: 'red', icon: '🔴', text: 'Unpaid' }
    };

    const config = statusConfig[status] || { color: 'gray', icon: '⚪', text: status };
    
    return (
      <span className={`status-badge status-${config.color}`}>
        <span className="status-icon">{config.icon}</span>
        <span className="status-text">{config.text}</span>
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPlanDisplayName = (plan) => {
    const planNames = {
      starter: 'Starter Plan',
      growth: 'Growth Plan',
      enterprise: 'Enterprise Plan'
    };
    return planNames[plan] || plan;
  };

  if (loading) {
    return (
      <div className="subscription-status">
        <div className="status-loading">
          <div className="spinner"></div>
          <p>Loading subscription status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="subscription-status">
        <div className="status-error">
          <p>❌ Error loading subscription status: {error}</p>
          <button onClick={fetchSubscriptionStatus} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="subscription-status">
        <div className="no-subscription">
          <h4>📋 No Active Subscription</h4>
          <p>You don't have an active subscription yet.</p>
          <p>Choose a plan below to get started with Ahauros AI!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-status">
      <div className="subscription-card">
        <div className="subscription-header">
          <h4>💳 Current Subscription</h4>
          {getStatusBadge(subscription.status)}
        </div>
        
        <div className="subscription-details">
          <div className="detail-row">
            <span className="detail-label">Plan:</span>
            <span className="detail-value">{getPlanDisplayName(subscription.plan)}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className="detail-value">{getStatusBadge(subscription.status)}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Current Period:</span>
            <span className="detail-value">
              {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
            </span>
          </div>
          
          {subscription.trial_start && subscription.trial_end && (
            <div className="detail-row">
              <span className="detail-label">Trial Period:</span>
              <span className="detail-value">
                {formatDate(subscription.trial_start)} - {formatDate(subscription.trial_end)}
              </span>
            </div>
          )}
          
          <div className="detail-row">
            <span className="detail-label">Created:</span>
            <span className="detail-value">{formatDate(subscription.created_at)}</span>
          </div>
          
          {subscription.canceled_at && (
            <div className="detail-row">
              <span className="detail-label">Canceled:</span>
              <span className="detail-value">{formatDate(subscription.canceled_at)}</span>
            </div>
          )}
          
          {subscription.cancel_at_period_end && (
            <div className="detail-row">
              <span className="detail-label">Cancellation:</span>
              <span className="detail-value">Will cancel at period end</span>
            </div>
          )}
        </div>
        
        <div className="subscription-actions">
          <button 
            onClick={fetchSubscriptionStatus} 
            className="refresh-button"
            title="Refresh subscription status"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

// Make SubscriptionStatus available globally
window.SubscriptionStatus = SubscriptionStatus;










