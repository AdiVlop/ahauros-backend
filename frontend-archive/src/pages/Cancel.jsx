// Cancel.jsx - Cancel page component

const Cancel = () => {
  const cancelInfo = handleSubscriptionCancel();

  return (
    <div className="cancel-page">
      <div className="cancel-card">
        <div className="ahauros-logo" style={{ marginBottom: '2rem' }}>
          <div className="ahauros-logo-icon">🤖</div>
          <div className="ahauros-logo-text">Ahauros AI</div>
        </div>
        <div className="cancel-icon">😔</div>
        <h1 className="cancel-title">Plata Anulată</h1>
        <p className="cancel-message">
          Plata a fost anulată. Te rugăm să reîncerci când ești gata să te abonezi la Ahauros AI.
        </p>
          
        <div style={{ marginTop: '2rem' }}>
          <a href="/?tab=billing" className="back-button">Încearcă Din Nou</a>
        </div>
      </div>
    </div>
  );
};

// Make Cancel available globally
window.Cancel = Cancel;



const Cancel = () => {
  const cancelInfo = handleSubscriptionCancel();

  return (
    <div className="cancel-page">
      <div className="cancel-card">
        <div className="ahauros-logo" style={{ marginBottom: '2rem' }}>
          <div className="ahauros-logo-icon">🤖</div>
          <div className="ahauros-logo-text">Ahauros AI</div>
        </div>
        <div className="cancel-icon">😔</div>
        <h1 className="cancel-title">Plata Anulată</h1>
        <p className="cancel-message">
          Plata a fost anulată. Te rugăm să reîncerci când ești gata să te abonezi la Ahauros AI.
        </p>
          
        <div style={{ marginTop: '2rem' }}>
          <a href="/?tab=billing" className="back-button">Încearcă Din Nou</a>
        </div>
      </div>
    </div>
  );
};

// Make Cancel available globally
window.Cancel = Cancel;










