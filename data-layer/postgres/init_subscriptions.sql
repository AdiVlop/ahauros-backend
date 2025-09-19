-- Ahauros AI - Subscriptions Schema
-- Tabela pentru stocarea abonamentelor Stripe

-- Creează tabela subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    stripe_customer_id VARCHAR(255) NOT NULL,
    stripe_subscription_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    plan VARCHAR(50) NOT NULL, -- starter, growth, enterprise
    status VARCHAR(50) NOT NULL, -- active, canceled, past_due, incomplete, trialing
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes pentru performanță optimă
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions (email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions (plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions (created_at);

-- Creează funcția pentru actualizarea updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Creează trigger pentru actualizarea automată a updated_at
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Creează view pentru abonamentele active
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
    s.*,
    u.name as user_name,
    u.created_at as user_created_at
FROM subscriptions s
LEFT JOIN users u ON s.email = u.email
WHERE s.status IN ('active', 'trialing');

-- Creează view pentru statistici abonamente
CREATE OR REPLACE VIEW subscription_stats AS
SELECT 
    plan,
    status,
    COUNT(*) as count,
    COUNT(*) * CASE 
        WHEN plan = 'starter' THEN 199
        WHEN plan = 'growth' THEN 699
        WHEN plan = 'enterprise' THEN 1499
        ELSE 0
    END as monthly_revenue_eur
FROM subscriptions
GROUP BY plan, status;

-- Enhanced views for better reporting and analytics
CREATE OR REPLACE VIEW monthly_revenue AS
SELECT
  DATE_TRUNC('month', created_at) as month,
  plan,
  COUNT(*) as new_subscriptions,
  COUNT(*) * CASE
    WHEN plan = 'starter' THEN 199
    WHEN plan = 'growth' THEN 699
    WHEN plan = 'enterprise' THEN 1499
    ELSE 0
  END as revenue_eur
FROM subscriptions
WHERE status = 'active'
GROUP BY DATE_TRUNC('month', created_at), plan
ORDER BY month DESC;

CREATE OR REPLACE VIEW customer_lifetime_value AS
SELECT
  s.email,
  s.plan,
  s.status,
  s.created_at as subscription_start,
  CASE 
    WHEN s.status = 'active' THEN 
      EXTRACT(EPOCH FROM (NOW() - s.created_at)) / 86400 * 
      CASE
        WHEN s.plan = 'starter' THEN 199 / 30
        WHEN s.plan = 'growth' THEN 699 / 30
        WHEN s.plan = 'enterprise' THEN 1499 / 30
        ELSE 0
      END
    ELSE 0
  END as estimated_lifetime_value_eur
FROM subscriptions s
ORDER BY estimated_lifetime_value_eur DESC;

CREATE OR REPLACE VIEW churn_analysis AS
SELECT
  plan,
  COUNT(*) as total_subscriptions,
  COUNT(CASE WHEN status = 'canceled' THEN 1 END) as canceled_count,
  ROUND(
    COUNT(CASE WHEN status = 'canceled' THEN 1 END) * 100.0 / COUNT(*), 2
  ) as churn_rate_percent,
  AVG(CASE 
    WHEN status = 'canceled' AND canceled_at IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (canceled_at - created_at)) / 86400 
  END) as avg_days_to_churn
FROM subscriptions
GROUP BY plan
ORDER BY churn_rate_percent DESC;

-- Inserează date de test (opțional)
INSERT INTO subscriptions (
    stripe_customer_id, 
    stripe_subscription_id, 
    email, 
    plan, 
    status, 
    current_period_start, 
    current_period_end
) VALUES 
(
    'cus_test_starter_001',
    'sub_test_starter_001',
    'test-starter@ahauros.io',
    'starter',
    'active',
    NOW(),
    NOW() + INTERVAL '1 month'
),
(
    'cus_test_growth_001',
    'sub_test_growth_001',
    'test-growth@ahauros.io',
    'growth',
    'active',
    NOW(),
    NOW() + INTERVAL '1 month'
),
(
    'cus_test_enterprise_001',
    'sub_test_enterprise_001',
    'test-enterprise@ahauros.io',
    'enterprise',
    'active',
    NOW(),
    NOW() + INTERVAL '1 month'
)
ON CONFLICT (stripe_subscription_id) DO NOTHING;

-- Afișează statistici
SELECT 'Subscriptions table created successfully!' as message;
SELECT COUNT(*) as total_subscriptions FROM subscriptions;
SELECT * FROM subscription_stats;





-- Creează tabela subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    stripe_customer_id VARCHAR(255) NOT NULL,
    stripe_subscription_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    plan VARCHAR(50) NOT NULL, -- starter, growth, enterprise
    status VARCHAR(50) NOT NULL, -- active, canceled, past_due, incomplete, trialing
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes pentru performanță optimă
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions (email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions (plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions (created_at);

-- Creează funcția pentru actualizarea updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Creează trigger pentru actualizarea automată a updated_at
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Creează view pentru abonamentele active
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
    s.*,
    u.name as user_name,
    u.created_at as user_created_at
FROM subscriptions s
LEFT JOIN users u ON s.email = u.email
WHERE s.status IN ('active', 'trialing');

-- Creează view pentru statistici abonamente
CREATE OR REPLACE VIEW subscription_stats AS
SELECT 
    plan,
    status,
    COUNT(*) as count,
    COUNT(*) * CASE 
        WHEN plan = 'starter' THEN 199
        WHEN plan = 'growth' THEN 699
        WHEN plan = 'enterprise' THEN 1499
        ELSE 0
    END as monthly_revenue_eur
FROM subscriptions
GROUP BY plan, status;

-- Enhanced views for better reporting and analytics
CREATE OR REPLACE VIEW monthly_revenue AS
SELECT
  DATE_TRUNC('month', created_at) as month,
  plan,
  COUNT(*) as new_subscriptions,
  COUNT(*) * CASE
    WHEN plan = 'starter' THEN 199
    WHEN plan = 'growth' THEN 699
    WHEN plan = 'enterprise' THEN 1499
    ELSE 0
  END as revenue_eur
FROM subscriptions
WHERE status = 'active'
GROUP BY DATE_TRUNC('month', created_at), plan
ORDER BY month DESC;

CREATE OR REPLACE VIEW customer_lifetime_value AS
SELECT
  s.email,
  s.plan,
  s.status,
  s.created_at as subscription_start,
  CASE 
    WHEN s.status = 'active' THEN 
      EXTRACT(EPOCH FROM (NOW() - s.created_at)) / 86400 * 
      CASE
        WHEN s.plan = 'starter' THEN 199 / 30
        WHEN s.plan = 'growth' THEN 699 / 30
        WHEN s.plan = 'enterprise' THEN 1499 / 30
        ELSE 0
      END
    ELSE 0
  END as estimated_lifetime_value_eur
FROM subscriptions s
ORDER BY estimated_lifetime_value_eur DESC;

CREATE OR REPLACE VIEW churn_analysis AS
SELECT
  plan,
  COUNT(*) as total_subscriptions,
  COUNT(CASE WHEN status = 'canceled' THEN 1 END) as canceled_count,
  ROUND(
    COUNT(CASE WHEN status = 'canceled' THEN 1 END) * 100.0 / COUNT(*), 2
  ) as churn_rate_percent,
  AVG(CASE 
    WHEN status = 'canceled' AND canceled_at IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (canceled_at - created_at)) / 86400 
  END) as avg_days_to_churn
FROM subscriptions
GROUP BY plan
ORDER BY churn_rate_percent DESC;

-- Inserează date de test (opțional)
INSERT INTO subscriptions (
    stripe_customer_id, 
    stripe_subscription_id, 
    email, 
    plan, 
    status, 
    current_period_start, 
    current_period_end
) VALUES 
(
    'cus_test_starter_001',
    'sub_test_starter_001',
    'test-starter@ahauros.io',
    'starter',
    'active',
    NOW(),
    NOW() + INTERVAL '1 month'
),
(
    'cus_test_growth_001',
    'sub_test_growth_001',
    'test-growth@ahauros.io',
    'growth',
    'active',
    NOW(),
    NOW() + INTERVAL '1 month'
),
(
    'cus_test_enterprise_001',
    'sub_test_enterprise_001',
    'test-enterprise@ahauros.io',
    'enterprise',
    'active',
    NOW(),
    NOW() + INTERVAL '1 month'
)
ON CONFLICT (stripe_subscription_id) DO NOTHING;

-- Afișează statistici
SELECT 'Subscriptions table created successfully!' as message;
SELECT COUNT(*) as total_subscriptions FROM subscriptions;
SELECT * FROM subscription_stats;











