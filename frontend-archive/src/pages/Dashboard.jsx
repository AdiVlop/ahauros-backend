// Dashboard.jsx - Dashboard component
const { useState } = React;

const Dashboard = ({ activeTab: propActiveTab, onTabChange }) => {
  const [activeTab, setActiveTab] = useState(propActiveTab || 'overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'billing', label: 'Billing', icon: '💳' },
    { id: 'reports', label: 'Reports', icon: '📋' },
    { id: 'usage', label: 'Usage', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content">
            <h3>Welcome to Ahauros AI Dashboard</h3>
            <div className="overview-grid">
              <div className="overview-card">
                <h4>API Requests</h4>
                <div className="metric">12,345</div>
                <p>This month</p>
              </div>
              <div className="overview-card">
                <h4>Response Time</h4>
                <div className="metric">245ms</div>
                <p>Average</p>
              </div>
              <div className="overview-card">
                <h4>Success Rate</h4>
                <div className="metric">99.9%</div>
                <p>Last 30 days</p>
              </div>
              <div className="overview-card">
                <h4>Current Plan</h4>
                <div className="metric">Free</div>
                <p>Upgrade available</p>
              </div>
            </div>
            <div className="upgrade-prompt">
              <h4>🚀 Ready to unlock more power?</h4>
              <p>Upgrade to a paid plan to get more requests, faster responses, and premium features.</p>
              <button 
                className="upgrade-button"
                onClick={() => setActiveTab('billing')}
              >
                View Plans
              </button>
            </div>
          </div>
        );
      
      case 'billing':
        return React.createElement('div', { className: 'tab-content' },
          React.createElement('div', { className: 'billing-header' },
            React.createElement('h3', null, 'Subscription & Billing'),
            React.createElement('p', null, 'Manage your Ahauros AI subscription and billing preferences')
          ),
          React.createElement(SubscriptionStatus, { email: "test@example.com" }),
          React.createElement(SubscriptionPlans)
        );
      
      case 'reports':
        return React.createElement('div', { className: 'tab-content' },
          React.createElement(Reports)
        );
      
      case 'usage':
        return (
          <div className="tab-content">
            <h3>Usage Analytics</h3>
            <div className="usage-placeholder">
              <p>📊 Usage analytics and detailed metrics will be available here.</p>
              <p>Track your API usage, response times, and performance metrics.</p>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="tab-content">
            <h3>Account Settings</h3>
            <div className="settings-placeholder">
              <p>⚙️ Account settings and preferences will be available here.</p>
              <p>Manage your profile, API keys, and notification preferences.</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Ahauros AI Dashboard</h1>
        <p>Welcome back! Here's what's happening with your AI services.</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-sidebar">
          <nav className="dashboard-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (onTabChange) onTabChange(tab.id);
                }}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="dashboard-main">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

// Make Dashboard available globally
window.Dashboard = Dashboard;




const Dashboard = ({ activeTab: propActiveTab, onTabChange }) => {
  const [activeTab, setActiveTab] = useState(propActiveTab || 'overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'billing', label: 'Billing', icon: '💳' },
    { id: 'reports', label: 'Reports', icon: '📋' },
    { id: 'usage', label: 'Usage', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content">
            <h3>Welcome to Ahauros AI Dashboard</h3>
            <div className="overview-grid">
              <div className="overview-card">
                <h4>API Requests</h4>
                <div className="metric">12,345</div>
                <p>This month</p>
              </div>
              <div className="overview-card">
                <h4>Response Time</h4>
                <div className="metric">245ms</div>
                <p>Average</p>
              </div>
              <div className="overview-card">
                <h4>Success Rate</h4>
                <div className="metric">99.9%</div>
                <p>Last 30 days</p>
              </div>
              <div className="overview-card">
                <h4>Current Plan</h4>
                <div className="metric">Free</div>
                <p>Upgrade available</p>
              </div>
            </div>
            <div className="upgrade-prompt">
              <h4>🚀 Ready to unlock more power?</h4>
              <p>Upgrade to a paid plan to get more requests, faster responses, and premium features.</p>
              <button 
                className="upgrade-button"
                onClick={() => setActiveTab('billing')}
              >
                View Plans
              </button>
            </div>
          </div>
        );
      
      case 'billing':
        return React.createElement('div', { className: 'tab-content' },
          React.createElement('div', { className: 'billing-header' },
            React.createElement('h3', null, 'Subscription & Billing'),
            React.createElement('p', null, 'Manage your Ahauros AI subscription and billing preferences')
          ),
          React.createElement(SubscriptionStatus, { email: "test@example.com" }),
          React.createElement(SubscriptionPlans)
        );
      
      case 'reports':
        return React.createElement('div', { className: 'tab-content' },
          React.createElement(Reports)
        );
      
      case 'usage':
        return (
          <div className="tab-content">
            <h3>Usage Analytics</h3>
            <div className="usage-placeholder">
              <p>📊 Usage analytics and detailed metrics will be available here.</p>
              <p>Track your API usage, response times, and performance metrics.</p>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="tab-content">
            <h3>Account Settings</h3>
            <div className="settings-placeholder">
              <p>⚙️ Account settings and preferences will be available here.</p>
              <p>Manage your profile, API keys, and notification preferences.</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Ahauros AI Dashboard</h1>
        <p>Welcome back! Here's what's happening with your AI services.</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-sidebar">
          <nav className="dashboard-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (onTabChange) onTabChange(tab.id);
                }}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="dashboard-main">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

// Make Dashboard available globally
window.Dashboard = Dashboard;










