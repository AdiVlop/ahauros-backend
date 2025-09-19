// Success.jsx - Success page component
const { useEffect, useState } = React;

const Success = () => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processSuccess = async () => {
      try {
        // Get session ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');

        if (!sessionId) {
          throw new Error('No session ID found in URL');
        }

        const result = await handleSubscriptionSuccess(sessionId);
        setSuccess(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    processSuccess();
  }, []);

  if (loading) {
    return (
      <div className="success-page">
        <div className="success-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Processing your subscription...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="success-page">
        <div className="success-container">
          <div className="error-state">
            <div className="error-icon">❌</div>
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={() => window.location.href = '/dashboard?tab=billing'}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="ahauros-logo" style={{ marginBottom: '2rem' }}>
          <div className="ahauros-logo-icon">🤖</div>
          <div className="ahauros-logo-text">Ahauros AI</div>
        </div>
        <div className="success-icon">🎉</div>
        <h1 className="success-title">Felicitări!</h1>
        <p className="success-message">
          Abonamentul tău Ahauros este activ. Poți începe să folosești toate funcționalitățile AI!
        </p>
          
        {success && success.sessionId && (
          <div style={{ 
            background: 'rgba(224, 189, 64, 0.1)', 
            padding: '1rem', 
            borderRadius: '8px', 
            margin: '1rem 0',
            border: '1px solid rgba(224, 189, 64, 0.3)'
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
              Session ID: {success.sessionId}
            </p>
          </div>
        )}
        
        <div style={{ marginTop: '2rem' }}>
          <a href="/" className="back-button">Înapoi la Dashboard</a>
        </div>
      </div>
    </div>
  );
};

// Make Success available globally
window.Success = Success;




const Success = () => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processSuccess = async () => {
      try {
        // Get session ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');

        if (!sessionId) {
          throw new Error('No session ID found in URL');
        }

        const result = await handleSubscriptionSuccess(sessionId);
        setSuccess(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    processSuccess();
  }, []);

  if (loading) {
    return (
      <div className="success-page">
        <div className="success-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Processing your subscription...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="success-page">
        <div className="success-container">
          <div className="error-state">
            <div className="error-icon">❌</div>
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={() => window.location.href = '/dashboard?tab=billing'}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="ahauros-logo" style={{ marginBottom: '2rem' }}>
          <div className="ahauros-logo-icon">🤖</div>
          <div className="ahauros-logo-text">Ahauros AI</div>
        </div>
        <div className="success-icon">🎉</div>
        <h1 className="success-title">Felicitări!</h1>
        <p className="success-message">
          Abonamentul tău Ahauros este activ. Poți începe să folosești toate funcționalitățile AI!
        </p>
          
        {success && success.sessionId && (
          <div style={{ 
            background: 'rgba(224, 189, 64, 0.1)', 
            padding: '1rem', 
            borderRadius: '8px', 
            margin: '1rem 0',
            border: '1px solid rgba(224, 189, 64, 0.3)'
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
              Session ID: {success.sessionId}
            </p>
          </div>
        )}
        
        <div style={{ marginTop: '2rem' }}>
          <a href="/" className="back-button">Înapoi la Dashboard</a>
        </div>
      </div>
    </div>
  );
};

// Make Success available globally
window.Success = Success;










