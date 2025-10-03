// App.jsx - Main App component
const { useState, useEffect } = React;

const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Handle URL routing
    const path = window.location.pathname;
    const search = window.location.search;
    
    if (path === '/success') {
      setCurrentPage('success');
    } else if (path === '/cancel') {
      setCurrentPage('cancel');
    } else {
      setCurrentPage('dashboard');
    }
    
    // Handle tab parameter
    const urlParams = new URLSearchParams(search);
    const tab = urlParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Update URL without page reload
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'success':
        return React.createElement(Success);
      case 'cancel':
        return React.createElement(Cancel);
      case 'dashboard':
      default:
        return React.createElement(Dashboard, { 
          activeTab: activeTab, 
          onTabChange: handleTabChange 
        });
    }
  };

  return React.createElement('div', { className: 'app' }, renderPage());
};

// Make App available globally
window.App = App;




const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Handle URL routing
    const path = window.location.pathname;
    const search = window.location.search;
    
    if (path === '/success') {
      setCurrentPage('success');
    } else if (path === '/cancel') {
      setCurrentPage('cancel');
    } else {
      setCurrentPage('dashboard');
    }
    
    // Handle tab parameter
    const urlParams = new URLSearchParams(search);
    const tab = urlParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Update URL without page reload
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'success':
        return React.createElement(Success);
      case 'cancel':
        return React.createElement(Cancel);
      case 'dashboard':
      default:
        return React.createElement(Dashboard, { 
          activeTab: activeTab, 
          onTabChange: handleTabChange 
        });
    }
  };

  return React.createElement('div', { className: 'app' }, renderPage());
};

// Make App available globally
window.App = App;










