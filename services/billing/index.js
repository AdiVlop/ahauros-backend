const Stripe = require('stripe');
const { Pool } = require('pg');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');

// Initialize Stripe
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize AWS SES
const ses = new AWS.SES({ region: 'us-east-1' });

// Database connection
console.log('=== DATABASE CONFIGURATION ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Database connection established');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Stripe price mapping
const PRICE_MAPPING = {
  'starter': process.env.STRIPE_PRICE_STARTER || 'price_starter_monthly',
  'growth': process.env.STRIPE_PRICE_GROWTH || 'price_growth_monthly',
  'enterprise': process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_monthly'
};

// Plan details
const PLAN_DETAILS = {
  'starter': {
    name: 'Starter Plan',
    price: 199,
    currency: 'eur',
    interval: 'month',
    features: ['Basic AI features', '10,000 requests/month', 'Email support']
  },
  'growth': {
    name: 'Growth Plan',
    price: 699,
    currency: 'eur',
    interval: 'month',
    features: ['Advanced AI features', '100,000 requests/month', 'Priority support', 'API access']
  },
  'enterprise': {
    name: 'Enterprise Plan',
    price: 1499,
    currency: 'eur',
    interval: 'month',
    features: ['All AI features', 'Unlimited requests', '24/7 support', 'Custom integrations', 'SLA']
  }
};

// Helper function to verify Stripe webhook signature
function verifyStripeSignature(payload, signature) {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET)
    .update(payload, 'utf8')
    .digest('hex');
  
  return signature === expectedSignature;
}

// Helper function to update user subscription in database
async function updateUserSubscription(userId, subscriptionData) {
  const client = await pool.connect();
  try {
    await client.query(`
      UPDATE users 
      SET 
        subscription_status = $1,
        subscription_plan = $2,
        stripe_customer_id = $3,
        stripe_subscription_id = $4,
        subscription_updated_at = NOW()
      WHERE id = $5
    `, [
      subscriptionData.status,
      subscriptionData.plan,
      subscriptionData.customer_id,
      subscriptionData.subscription_id,
      userId
    ]);
  } finally {
    client.release();
  }
}

// Helper function to create or update subscription in subscriptions table
async function upsertSubscription(subscriptionData) {
  const client = await pool.connect();
  try {
    await client.query(`
      INSERT INTO subscriptions (
        stripe_customer_id,
        stripe_subscription_id,
        email,
        plan,
        status,
        current_period_start,
        current_period_end,
        trial_start,
        trial_end,
        cancel_at_period_end,
        canceled_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (stripe_subscription_id) 
      DO UPDATE SET
        status = EXCLUDED.status,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        trial_start = EXCLUDED.trial_start,
        trial_end = EXCLUDED.trial_end,
        cancel_at_period_end = EXCLUDED.cancel_at_period_end,
        canceled_at = EXCLUDED.canceled_at,
        updated_at = NOW()
    `, [
      subscriptionData.stripe_customer_id,
      subscriptionData.stripe_subscription_id,
      subscriptionData.email,
      subscriptionData.plan,
      subscriptionData.status,
      subscriptionData.current_period_start,
      subscriptionData.current_period_end,
      subscriptionData.trial_start,
      subscriptionData.trial_end,
      subscriptionData.cancel_at_period_end,
      subscriptionData.canceled_at
    ]);
  } finally {
    client.release();
  }
}

// Helper function to get subscription details from Stripe
async function getSubscriptionDetails(subscriptionId) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return {
      stripe_customer_id: subscription.customer,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null
    };
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    throw error;
  }
}

// Main Lambda handler
exports.handler = async (event, context) => {
  console.log('=== BILLING LAMBDA INVOKED ===');
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Context:', JSON.stringify(context, null, 2));
  console.log('Environment Variables:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET'
  });

  try {
    const { httpMethod, path, body, headers } = event;
    console.log('=== REQUEST DETAILS ===');
    console.log('Path received:', path);
    console.log('HTTP Method:', httpMethod);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Body:', body);
    
    // Route handling
    if (path === '/billing/subscribe' && httpMethod === 'POST') {
      return await handleSubscribe(body);
    } else if (path === '/billing/webhook' && httpMethod === 'POST') {
      return await handleWebhook(body, headers);
    } else if (path === '/billing/status' && httpMethod === 'GET') {
      return await handleGetSubscriptionStatus(event.queryStringParameters);
    } else if (path === '/billing/setup' && httpMethod === 'POST') {
      return await handleSetup();
    } else if (path === '/reports/active-subscriptions' && httpMethod === 'GET') {
      return await handleActiveSubscriptions();
    } else if (path === '/reports/subscription-stats' && httpMethod === 'GET') {
      return await handleSubscriptionStats();
    } else if (path === '/db-health' && httpMethod === 'GET') {
      return await handleDbHealth();
    } else if (path === '/auth/register' && httpMethod === 'POST') {
      return await handleRegister(body);
    } else if (path === '/auth/confirm' && httpMethod === 'GET') {
      return await handleConfirmEmail(event.queryStringParameters);
    } else if (path === '/auth/login' && httpMethod === 'POST') {
      return await handleLogin(body);
    } else if (path === '/db-migrate' && httpMethod === 'POST') {
      return await handleDbMigrate();
    } else {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: JSON.stringify({ error: 'Endpoint not found' })
      };
    }
  } catch (error) {
    console.error('Billing Lambda error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};

// Handle subscription creation
async function handleSubscribe(body) {
  try {
    const { plan_id, user_id, email, success_url, cancel_url } = JSON.parse(body);
    
    if (!plan_id || !PRICE_MAPPING[plan_id]) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Invalid plan_id. Must be: starter, growth, or enterprise' })
      };
    }
    
    const planDetails = PLAN_DETAILS[plan_id];
    const priceId = PRICE_MAPPING[plan_id];
    
    // Create or retrieve Stripe customer
    let customer;
    if (user_id) {
      // Try to find existing customer
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT stripe_customer_id FROM users WHERE id = $1',
          [user_id]
        );
        
        if (result.rows.length > 0 && result.rows[0].stripe_customer_id) {
          customer = await stripe.customers.retrieve(result.rows[0].stripe_customer_id);
        }
      } finally {
        client.release();
      }
    }
    
    if (!customer) {
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          user_id: user_id || 'anonymous',
          plan: plan_id
        }
      });
    }
    
    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: success_url || `${process.env.FRONTEND_URL || 'https://app.ahauros.io'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${process.env.FRONTEND_URL || 'https://app.ahauros.io'}/billing/cancel`,
      metadata: {
        user_id: user_id || 'anonymous',
        plan: plan_id,
        email: email
      },
      subscription_data: {
        metadata: {
          user_id: user_id || 'anonymous',
          plan: plan_id,
          email: email
        }
      }
    });
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        checkout_url: session.url,
        session_id: session.id,
        plan: planDetails
      })
    };
    
  } catch (error) {
    console.error('Subscribe error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Failed to create subscription',
        message: error.message 
      })
    };
  }
}

// Handle Stripe webhooks
async function handleWebhook(body, headers) {
  try {
    const signature = headers['stripe-signature'] || headers['Stripe-Signature'];
    
    if (!signature) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Missing Stripe signature' })
      };
    }
    
    // Verify webhook signature
    const payload = body;
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    console.log('Stripe webhook event:', event.type);
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
        
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ received: true })
    };
    
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Webhook error',
        message: error.message 
      })
    };
  }
}

// Handle checkout session completed
async function handleCheckoutCompleted(session) {
  console.log('Checkout completed:', session.id);
  
  const userId = session.metadata?.user_id;
  const plan = session.metadata?.plan;
  const email = session.customer_details?.email || session.metadata?.email;
  
  if (userId && userId !== 'anonymous') {
    await updateUserSubscription(userId, {
      status: 'active',
      plan: plan,
      customer_id: session.customer,
      subscription_id: session.subscription
    });
  }
  
  // Update subscriptions table if we have a subscription
  if (session.subscription && email) {
    try {
      const subscriptionDetails = await getSubscriptionDetails(session.subscription);
      await upsertSubscription({
        ...subscriptionDetails,
        email: email,
        plan: plan || 'starter' // Default to starter if not specified
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  }
}

// Handle invoice paid
async function handleInvoicePaid(invoice) {
  console.log('Invoice paid:', invoice.id);
  
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const userId = subscription.metadata?.user_id;
    const plan = subscription.metadata?.plan;
    const email = invoice.customer_email || subscription.metadata?.email;
    
    if (userId && userId !== 'anonymous') {
      await updateUserSubscription(userId, {
        status: 'active',
        plan: plan,
        customer_id: subscription.customer,
        subscription_id: subscription.id
      });
    }
    
    // Update subscriptions table
    if (email) {
      try {
        const subscriptionDetails = await getSubscriptionDetails(subscription.id);
        await upsertSubscription({
          ...subscriptionDetails,
          email: email,
          plan: plan || 'starter'
        });
      } catch (error) {
        console.error('Error updating subscription:', error);
      }
    }
  }
}

// Handle subscription deleted
async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', subscription.id);
  
  const userId = subscription.metadata?.user_id;
  const email = subscription.metadata?.email;
  
  if (userId && userId !== 'anonymous') {
    await updateUserSubscription(userId, {
      status: 'cancelled',
      plan: null,
      customer_id: subscription.customer,
      subscription_id: subscription.id
    });
  }
  
  // Update subscriptions table
  if (email) {
    try {
      const subscriptionDetails = await getSubscriptionDetails(subscription.id);
      await upsertSubscription({
        ...subscriptionDetails,
        email: email,
        plan: subscription.metadata?.plan || 'starter',
        status: 'canceled'
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);
  
  const userId = subscription.metadata?.user_id;
  const plan = subscription.metadata?.plan;
  const email = subscription.metadata?.email;
  
  if (userId && userId !== 'anonymous') {
    await updateUserSubscription(userId, {
      status: subscription.status,
      plan: plan,
      customer_id: subscription.customer,
      subscription_id: subscription.id
    });
  }
  
  // Update subscriptions table
  if (email) {
    try {
      const subscriptionDetails = await getSubscriptionDetails(subscription.id);
      await upsertSubscription({
        ...subscriptionDetails,
        email: email,
        plan: plan || 'starter'
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  }
}

// Handle reports endpoints
async function handleActiveSubscriptions() {
  console.log('Fetching active subscriptions...');
  
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          email,
          plan,
          status,
          current_period_end,
          created_at,
          user_name
        FROM active_subscriptions 
        ORDER BY created_at DESC
      `);
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          data: result.rows,
          count: result.rows.length
        })
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching active subscriptions:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
}

async function handleSubscriptionStats() {
  console.log('Fetching subscription stats...');
  
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          plan,
          status,
          count,
          monthly_revenue_eur
        FROM subscription_stats 
        ORDER BY plan, status
      `);
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          data: result.rows
        })
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
}

// Handle setup - create database schema
async function handleSetup() {
  try {
    console.log('🔧 Running database setup...');
    
    const result = await initDatabase();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Database setup completed successfully!',
        tables: result.tables
      })
    };
    
  } catch (error) {
    console.error('Setup error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
}

// Legacy function - keeping for reference
async function handleSetupLegacy() {
  try {
    const client = await pool.connect();
    
    try {
      // Create subscriptions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS subscriptions (
          id SERIAL PRIMARY KEY,
          stripe_customer_id VARCHAR(255) NOT NULL,
          stripe_subscription_id VARCHAR(255) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL,
          plan VARCHAR(50) NOT NULL,
          status VARCHAR(50) NOT NULL,
          current_period_start TIMESTAMP WITH TIME ZONE,
          current_period_end TIMESTAMP WITH TIME ZONE,
          trial_start TIMESTAMP WITH TIME ZONE,
          trial_end TIMESTAMP WITH TIME ZONE,
          cancel_at_period_end BOOLEAN DEFAULT FALSE,
          canceled_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      
      // Create indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions (stripe_customer_id);
        CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions (email);
        CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status);
        CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions (plan);
        CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions (created_at);
      `);
      
      // Create trigger function
      await client.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);
      
      // Create trigger
      await client.query(`
        DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
        CREATE TRIGGER update_subscriptions_updated_at
          BEFORE UPDATE ON subscriptions
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `);
      
      // Create views
      await client.query(`
        CREATE OR REPLACE VIEW active_subscriptions AS
        SELECT 
          s.*,
          u.name as user_name,
          u.created_at as user_created_at
        FROM subscriptions s
        LEFT JOIN users u ON s.email = u.email
        WHERE s.status IN ('active', 'trialing');
      `);
      
      await client.query(`
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
      `);

      // Enhanced views for better reporting
      await client.query(`
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
      `);

      await client.query(`
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
      `);

      await client.query(`
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
      `);
      
      // Check if table was created successfully
      const result = await client.query('SELECT COUNT(*) as count FROM subscriptions');
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          message: 'Subscriptions table created successfully!',
          total_subscriptions: result.rows[0].count
        })
      };
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Setup error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
}

// Handle get subscription status
async function handleGetSubscriptionStatus(queryParams) {
  console.log('=== HANDLE GET SUBSCRIPTION STATUS ===');
  console.log('Query params:', JSON.stringify(queryParams, null, 2));
  
  try {
    const { email } = queryParams || {};
    console.log('Email extracted:', email);
    
    if (!email) {
      console.log('❌ No email provided');
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Email parameter is required' })
      };
    }
    
    console.log('🔌 Attempting to connect to database...');
    const client = await pool.connect();
    console.log('✅ Database connection established');
    
    try {
      // Get subscription status
      console.log('📊 Executing subscription status query for email:', email);
      const query = `
        SELECT 
          s.*,
          u.name as user_name
        FROM subscriptions s
        LEFT JOIN users u ON s.email = u.email
        WHERE s.email = $1
        ORDER BY s.created_at DESC
        LIMIT 1
      `;
      console.log('Query:', query);
      console.log('Parameters:', [email]);
      
      const result = await client.query(query, [email]);
      console.log('✅ Query executed successfully');
      console.log('Result rows count:', result.rows.length);
      console.log('Result rows:', JSON.stringify(result.rows, null, 2));
      
      if (result.rows.length === 0) {
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            has_subscription: false,
            message: 'No subscription found for this email'
          })
        };
      }
      
      const subscription = result.rows[0];
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          has_subscription: true,
          subscription: {
            id: subscription.id,
            plan: subscription.plan,
            status: subscription.status,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            trial_start: subscription.trial_start,
            trial_end: subscription.trial_end,
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: subscription.canceled_at,
            created_at: subscription.created_at,
            updated_at: subscription.updated_at,
            user_name: subscription.user_name
          }
        })
      };
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Get subscription status error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to get subscription status',
        message: error.message,
        code: error.code,
        name: error.name
      })
    };
  }
}

// Handle database health check
async function handleDbHealth() {
  console.log('=== HANDLE DB HEALTH CHECK ===');
  
  try {
    console.log('🔌 Testing DB connection');
    const client = await pool.connect();
    
    try {
      const res = await client.query('SELECT NOW()');
      console.log('✅ DB health check successful');
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          status: 'ok', 
          now: res.rows[0].now,
          message: 'Database connection healthy'
        })
      };
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ DB health check failed', err);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        status: 'error', 
        message: err.message,
        error: 'Database connection failed'
      })
    };
  }
}

// Initialize database with users and subscriptions tables
async function initDatabase() {
  console.log('=== INITIALIZE DATABASE ===');
  
  const client = await pool.connect();
  
  try {
    console.log('🔧 Creating users table...');
    
    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        confirmed BOOLEAN DEFAULT false,
        confirmation_token VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await client.query(createUsersTable);
    console.log('✅ Users table created');
    
    console.log('🔧 Creating subscriptions table...');
    
    // Create subscriptions table
    const createSubscriptionsTable = `
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        stripe_customer_id VARCHAR(255) NOT NULL,
        stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        plan VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        current_period_start TIMESTAMP,
        current_period_end TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await client.query(createSubscriptionsTable);
    console.log('✅ Subscriptions table created');
    
    // Create indexes for better performance
    console.log('🔧 Creating indexes...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status)');
    console.log('✅ Indexes created');
    
    // Verify tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'subscriptions')
      ORDER BY table_name
    `);
    
    console.log('📊 Tables created:', tablesResult.rows.map(row => row.table_name));
    
    return {
      success: true,
      message: 'Database schema created successfully',
      tables: tablesResult.rows.map(row => row.table_name)
    };
    
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// ==================== AUTHENTICATION FUNCTIONS ====================

// Handle user registration
async function handleRegister(body) {
  console.log('=== HANDLE REGISTER ===');
  
  try {
    const { name, email, password } = JSON.parse(body);
    
    if (!name || !email || !password) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Name, email, and password are required'
        })
      };
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Invalid email format'
        })
      };
    }
    
    // Validate password strength
    if (password.length < 6) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Password must be at least 6 characters long'
        })
      };
    }
    
    const client = await pool.connect();
    
    try {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      
      if (existingUser.rows.length > 0) {
        return {
          statusCode: 409,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: false,
            error: 'User with this email already exists'
          })
        };
      }
      
      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // Generate confirmation token
      const confirmationToken = uuidv4();
      
      // Insert user into database
      const result = await client.query(
        `INSERT INTO users (name, email, password_hash, confirmation_token, confirmed)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, name, confirmed`,
        [name, email, passwordHash, confirmationToken, false]
      );
      
      const user = result.rows[0];
      
      // Send confirmation email
      await sendConfirmationEmail(email, name, confirmationToken);
      
      console.log('✅ User registered successfully:', user.email);
      
      return {
        statusCode: 201,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          message: 'User registered successfully. Please check your email to confirm your account.',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            confirmed: user.confirmed
          }
        })
      };
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Registration failed',
        message: error.message
      })
    };
  }
}

// Handle email confirmation
async function handleConfirmEmail(queryParams) {
  console.log('=== HANDLE CONFIRM EMAIL ===');
  
  try {
    const { token } = queryParams;
    
    if (!token) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Confirmation token is required'
        })
      };
    }
    
    const client = await pool.connect();
    
    try {
      // Find user by confirmation token
      const result = await client.query(
        'SELECT id, email, name, confirmed FROM users WHERE confirmation_token = $1',
        [token]
      );
      
      if (result.rows.length === 0) {
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: false,
            error: 'Invalid or expired confirmation token'
          })
        };
      }
      
      const user = result.rows[0];
      
      if (user.confirmed) {
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: true,
            message: 'Email already confirmed',
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              confirmed: user.confirmed
            }
          })
        };
      }
      
      // Mark user as confirmed
      await client.query(
        'UPDATE users SET confirmed = true, confirmation_token = NULL, updated_at = NOW() WHERE id = $1',
        [user.id]
      );
      
      console.log('✅ Email confirmed successfully:', user.email);
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          message: 'Email confirmed successfully. You can now log in.',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            confirmed: true
          }
        })
      };
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Email confirmation error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Email confirmation failed',
        message: error.message
      })
    };
  }
}

// Handle user login
async function handleLogin(body) {
  console.log('=== HANDLE LOGIN ===');
  
  try {
    const { email, password } = JSON.parse(body);
    
    if (!email || !password) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Email and password are required'
        })
      };
    }
    
    const client = await pool.connect();
    
    try {
      // Find user by email
      const result = await client.query(
        'SELECT id, email, name, password_hash, confirmed FROM users WHERE email = $1',
        [email]
      );
      
      if (result.rows.length === 0) {
        return {
          statusCode: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: false,
            error: 'Invalid email or password'
          })
        };
      }
      
      const user = result.rows[0];
      
      // Check if email is confirmed
      if (!user.confirmed) {
        return {
          statusCode: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: false,
            error: 'Please confirm your email before logging in'
          })
        };
      }
      
      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      
      if (!passwordMatch) {
        return {
          statusCode: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: false,
            error: 'Invalid email or password'
          })
        };
      }
      
      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          name: user.name
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      console.log('✅ User logged in successfully:', user.email);
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          message: 'Login successful',
          token: token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            confirmed: user.confirmed
          }
        })
      };
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Login error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Login failed',
        message: error.message
      })
    };
  }
}

// Send confirmation email via AWS SES
async function sendConfirmationEmail(email, name, token) {
  console.log('=== SENDING CONFIRMATION EMAIL ===');
  
  try {
    const confirmationLink = `https://app.ahauros.io/auth/confirm?token=${token}`;
    
    const params = {
      Source: 'no-reply@ahauros.ai',
      Destination: {
        ToAddresses: [email]
      },
      Message: {
        Subject: {
          Data: 'Confirm your Ahauros AI account',
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: `
              <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #2563eb;">Welcome to Ahauros AI!</h2>
                  <p>Hi ${name},</p>
                  <p>Thank you for registering with Ahauros AI. To complete your registration, please confirm your email address by clicking the button below:</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${confirmationLink}" 
                       style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Confirm Email Address
                    </a>
                  </div>
                  <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
                  <p style="word-break: break-all; color: #666;">${confirmationLink}</p>
                  <p>This link will expire in 24 hours.</p>
                  <p>If you didn't create an account with Ahauros AI, you can safely ignore this email.</p>
                  <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                  <p style="color: #666; font-size: 12px;">
                    © 2025 Ahauros AI. All rights reserved.
                  </p>
                </body>
              </html>
            `,
            Charset: 'UTF-8'
          },
          Text: {
            Data: `
              Welcome to Ahauros AI!
              
              Hi ${name},
              
              Thank you for registering with Ahauros AI. To complete your registration, please confirm your email address by visiting this link:
              
              ${confirmationLink}
              
              This link will expire in 24 hours.
              
              If you didn't create an account with Ahauros AI, you can safely ignore this email.
              
              © 2025 Ahauros AI. All rights reserved.
            `,
            Charset: 'UTF-8'
          }
        }
      }
    };
    
    const result = await ses.sendEmail(params).promise();
    console.log('✅ Confirmation email sent successfully:', result.MessageId);
    
  } catch (error) {
    console.error('❌ Failed to send confirmation email:', error);
    throw error;
  }
}

// Handle database migration
async function handleDbMigrate() {
  try {
    console.log('=== HANDLE DB MIGRATE ===');
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'prod' ? { rejectUnauthorized: false } : false
    });
    
    console.log('🔌 Testing DB connection');
    const client = await pool.connect();
    console.log('✅ Database connection established');
    
    // Add new columns to users table if they don't exist
    const alterTableQueries = [
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmed BOOLEAN DEFAULT false;',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmation_token VARCHAR(255);'
    ];
    
    for (const query of alterTableQueries) {
      console.log(`Executing: ${query}`);
      await client.query(query);
    }
    
    // Update existing users to have confirmed = true (for existing users)
    await client.query('UPDATE users SET confirmed = true WHERE confirmed IS NULL;');
    
    client.release();
    await pool.end();
    
    console.log('✅ Database migration completed successfully');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: true,
        message: 'Database migration completed successfully'
      })
    };
    
  } catch (error) {
    console.error('❌ Database migration error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: false,
        error: 'Migration failed',
        message: error.message 
      })
    };
  }
}



const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');

// Initialize Stripe
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize AWS SES
const ses = new AWS.SES({ region: 'us-east-1' });

// Database connection
console.log('=== DATABASE CONFIGURATION ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Database connection established');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Stripe price mapping
const PRICE_MAPPING = {
  'starter': process.env.STRIPE_PRICE_STARTER || 'price_starter_monthly',
  'growth': process.env.STRIPE_PRICE_GROWTH || 'price_growth_monthly',
  'enterprise': process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_monthly'
};

// Plan details
const PLAN_DETAILS = {
  'starter': {
    name: 'Starter Plan',
    price: 199,
    currency: 'eur',
    interval: 'month',
    features: ['Basic AI features', '10,000 requests/month', 'Email support']
  },
  'growth': {
    name: 'Growth Plan',
    price: 699,
    currency: 'eur',
    interval: 'month',
    features: ['Advanced AI features', '100,000 requests/month', 'Priority support', 'API access']
  },
  'enterprise': {
    name: 'Enterprise Plan',
    price: 1499,
    currency: 'eur',
    interval: 'month',
    features: ['All AI features', 'Unlimited requests', '24/7 support', 'Custom integrations', 'SLA']
  }
};

// Helper function to verify Stripe webhook signature
function verifyStripeSignature(payload, signature) {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET)
    .update(payload, 'utf8')
    .digest('hex');
  
  return signature === expectedSignature;
}

// Helper function to update user subscription in database
async function updateUserSubscription(userId, subscriptionData) {
  const client = await pool.connect();
  try {
    await client.query(`
      UPDATE users 
      SET 
        subscription_status = $1,
        subscription_plan = $2,
        stripe_customer_id = $3,
        stripe_subscription_id = $4,
        subscription_updated_at = NOW()
      WHERE id = $5
    `, [
      subscriptionData.status,
      subscriptionData.plan,
      subscriptionData.customer_id,
      subscriptionData.subscription_id,
      userId
    ]);
  } finally {
    client.release();
  }
}

// Helper function to create or update subscription in subscriptions table
async function upsertSubscription(subscriptionData) {
  const client = await pool.connect();
  try {
    await client.query(`
      INSERT INTO subscriptions (
        stripe_customer_id,
        stripe_subscription_id,
        email,
        plan,
        status,
        current_period_start,
        current_period_end,
        trial_start,
        trial_end,
        cancel_at_period_end,
        canceled_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (stripe_subscription_id) 
      DO UPDATE SET
        status = EXCLUDED.status,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        trial_start = EXCLUDED.trial_start,
        trial_end = EXCLUDED.trial_end,
        cancel_at_period_end = EXCLUDED.cancel_at_period_end,
        canceled_at = EXCLUDED.canceled_at,
        updated_at = NOW()
    `, [
      subscriptionData.stripe_customer_id,
      subscriptionData.stripe_subscription_id,
      subscriptionData.email,
      subscriptionData.plan,
      subscriptionData.status,
      subscriptionData.current_period_start,
      subscriptionData.current_period_end,
      subscriptionData.trial_start,
      subscriptionData.trial_end,
      subscriptionData.cancel_at_period_end,
      subscriptionData.canceled_at
    ]);
  } finally {
    client.release();
  }
}

// Helper function to get subscription details from Stripe
async function getSubscriptionDetails(subscriptionId) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return {
      stripe_customer_id: subscription.customer,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null
    };
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    throw error;
  }
}

// Main Lambda handler
exports.handler = async (event, context) => {
  console.log('=== BILLING LAMBDA INVOKED ===');
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Context:', JSON.stringify(context, null, 2));
  console.log('Environment Variables:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET'
  });

  try {
    const { httpMethod, path, body, headers } = event;
    console.log('=== REQUEST DETAILS ===');
    console.log('Path received:', path);
    console.log('HTTP Method:', httpMethod);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Body:', body);
    
    // Route handling
    if (path === '/billing/subscribe' && httpMethod === 'POST') {
      return await handleSubscribe(body);
    } else if (path === '/billing/webhook' && httpMethod === 'POST') {
      return await handleWebhook(body, headers);
    } else if (path === '/billing/status' && httpMethod === 'GET') {
      return await handleGetSubscriptionStatus(event.queryStringParameters);
    } else if (path === '/billing/setup' && httpMethod === 'POST') {
      return await handleSetup();
    } else if (path === '/reports/active-subscriptions' && httpMethod === 'GET') {
      return await handleActiveSubscriptions();
    } else if (path === '/reports/subscription-stats' && httpMethod === 'GET') {
      return await handleSubscriptionStats();
    } else if (path === '/db-health' && httpMethod === 'GET') {
      return await handleDbHealth();
    } else if (path === '/auth/register' && httpMethod === 'POST') {
      return await handleRegister(body);
    } else if (path === '/auth/confirm' && httpMethod === 'GET') {
      return await handleConfirmEmail(event.queryStringParameters);
    } else if (path === '/auth/login' && httpMethod === 'POST') {
      return await handleLogin(body);
    } else if (path === '/db-migrate' && httpMethod === 'POST') {
      return await handleDbMigrate();
    } else {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: JSON.stringify({ error: 'Endpoint not found' })
      };
    }
  } catch (error) {
    console.error('Billing Lambda error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};

// Handle subscription creation
async function handleSubscribe(body) {
  try {
    const { plan_id, user_id, email, success_url, cancel_url } = JSON.parse(body);
    
    if (!plan_id || !PRICE_MAPPING[plan_id]) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Invalid plan_id. Must be: starter, growth, or enterprise' })
      };
    }
    
    const planDetails = PLAN_DETAILS[plan_id];
    const priceId = PRICE_MAPPING[plan_id];
    
    // Create or retrieve Stripe customer
    let customer;
    if (user_id) {
      // Try to find existing customer
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT stripe_customer_id FROM users WHERE id = $1',
          [user_id]
        );
        
        if (result.rows.length > 0 && result.rows[0].stripe_customer_id) {
          customer = await stripe.customers.retrieve(result.rows[0].stripe_customer_id);
        }
      } finally {
        client.release();
      }
    }
    
    if (!customer) {
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          user_id: user_id || 'anonymous',
          plan: plan_id
        }
      });
    }
    
    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: success_url || `${process.env.FRONTEND_URL || 'https://app.ahauros.io'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${process.env.FRONTEND_URL || 'https://app.ahauros.io'}/billing/cancel`,
      metadata: {
        user_id: user_id || 'anonymous',
        plan: plan_id,
        email: email
      },
      subscription_data: {
        metadata: {
          user_id: user_id || 'anonymous',
          plan: plan_id,
          email: email
        }
      }
    });
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        checkout_url: session.url,
        session_id: session.id,
        plan: planDetails
      })
    };
    
  } catch (error) {
    console.error('Subscribe error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Failed to create subscription',
        message: error.message 
      })
    };
  }
}

// Handle Stripe webhooks
async function handleWebhook(body, headers) {
  try {
    const signature = headers['stripe-signature'] || headers['Stripe-Signature'];
    
    if (!signature) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Missing Stripe signature' })
      };
    }
    
    // Verify webhook signature
    const payload = body;
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    console.log('Stripe webhook event:', event.type);
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
        
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ received: true })
    };
    
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Webhook error',
        message: error.message 
      })
    };
  }
}

// Handle checkout session completed
async function handleCheckoutCompleted(session) {
  console.log('Checkout completed:', session.id);
  
  const userId = session.metadata?.user_id;
  const plan = session.metadata?.plan;
  const email = session.customer_details?.email || session.metadata?.email;
  
  if (userId && userId !== 'anonymous') {
    await updateUserSubscription(userId, {
      status: 'active',
      plan: plan,
      customer_id: session.customer,
      subscription_id: session.subscription
    });
  }
  
  // Update subscriptions table if we have a subscription
  if (session.subscription && email) {
    try {
      const subscriptionDetails = await getSubscriptionDetails(session.subscription);
      await upsertSubscription({
        ...subscriptionDetails,
        email: email,
        plan: plan || 'starter' // Default to starter if not specified
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  }
}

// Handle invoice paid
async function handleInvoicePaid(invoice) {
  console.log('Invoice paid:', invoice.id);
  
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const userId = subscription.metadata?.user_id;
    const plan = subscription.metadata?.plan;
    const email = invoice.customer_email || subscription.metadata?.email;
    
    if (userId && userId !== 'anonymous') {
      await updateUserSubscription(userId, {
        status: 'active',
        plan: plan,
        customer_id: subscription.customer,
        subscription_id: subscription.id
      });
    }
    
    // Update subscriptions table
    if (email) {
      try {
        const subscriptionDetails = await getSubscriptionDetails(subscription.id);
        await upsertSubscription({
          ...subscriptionDetails,
          email: email,
          plan: plan || 'starter'
        });
      } catch (error) {
        console.error('Error updating subscription:', error);
      }
    }
  }
}

// Handle subscription deleted
async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', subscription.id);
  
  const userId = subscription.metadata?.user_id;
  const email = subscription.metadata?.email;
  
  if (userId && userId !== 'anonymous') {
    await updateUserSubscription(userId, {
      status: 'cancelled',
      plan: null,
      customer_id: subscription.customer,
      subscription_id: subscription.id
    });
  }
  
  // Update subscriptions table
  if (email) {
    try {
      const subscriptionDetails = await getSubscriptionDetails(subscription.id);
      await upsertSubscription({
        ...subscriptionDetails,
        email: email,
        plan: subscription.metadata?.plan || 'starter',
        status: 'canceled'
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);
  
  const userId = subscription.metadata?.user_id;
  const plan = subscription.metadata?.plan;
  const email = subscription.metadata?.email;
  
  if (userId && userId !== 'anonymous') {
    await updateUserSubscription(userId, {
      status: subscription.status,
      plan: plan,
      customer_id: subscription.customer,
      subscription_id: subscription.id
    });
  }
  
  // Update subscriptions table
  if (email) {
    try {
      const subscriptionDetails = await getSubscriptionDetails(subscription.id);
      await upsertSubscription({
        ...subscriptionDetails,
        email: email,
        plan: plan || 'starter'
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  }
}

// Handle reports endpoints
async function handleActiveSubscriptions() {
  console.log('Fetching active subscriptions...');
  
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          email,
          plan,
          status,
          current_period_end,
          created_at,
          user_name
        FROM active_subscriptions 
        ORDER BY created_at DESC
      `);
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          data: result.rows,
          count: result.rows.length
        })
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching active subscriptions:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
}

async function handleSubscriptionStats() {
  console.log('Fetching subscription stats...');
  
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          plan,
          status,
          count,
          monthly_revenue_eur
        FROM subscription_stats 
        ORDER BY plan, status
      `);
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          data: result.rows
        })
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
}

// Handle setup - create database schema
async function handleSetup() {
  try {
    console.log('🔧 Running database setup...');
    
    const result = await initDatabase();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Database setup completed successfully!',
        tables: result.tables
      })
    };
    
  } catch (error) {
    console.error('Setup error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
}

// Legacy function - keeping for reference
async function handleSetupLegacy() {
  try {
    const client = await pool.connect();
    
    try {
      // Create subscriptions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS subscriptions (
          id SERIAL PRIMARY KEY,
          stripe_customer_id VARCHAR(255) NOT NULL,
          stripe_subscription_id VARCHAR(255) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL,
          plan VARCHAR(50) NOT NULL,
          status VARCHAR(50) NOT NULL,
          current_period_start TIMESTAMP WITH TIME ZONE,
          current_period_end TIMESTAMP WITH TIME ZONE,
          trial_start TIMESTAMP WITH TIME ZONE,
          trial_end TIMESTAMP WITH TIME ZONE,
          cancel_at_period_end BOOLEAN DEFAULT FALSE,
          canceled_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      
      // Create indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions (stripe_customer_id);
        CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions (email);
        CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status);
        CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions (plan);
        CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions (created_at);
      `);
      
      // Create trigger function
      await client.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);
      
      // Create trigger
      await client.query(`
        DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
        CREATE TRIGGER update_subscriptions_updated_at
          BEFORE UPDATE ON subscriptions
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `);
      
      // Create views
      await client.query(`
        CREATE OR REPLACE VIEW active_subscriptions AS
        SELECT 
          s.*,
          u.name as user_name,
          u.created_at as user_created_at
        FROM subscriptions s
        LEFT JOIN users u ON s.email = u.email
        WHERE s.status IN ('active', 'trialing');
      `);
      
      await client.query(`
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
      `);

      // Enhanced views for better reporting
      await client.query(`
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
      `);

      await client.query(`
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
      `);

      await client.query(`
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
      `);
      
      // Check if table was created successfully
      const result = await client.query('SELECT COUNT(*) as count FROM subscriptions');
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          message: 'Subscriptions table created successfully!',
          total_subscriptions: result.rows[0].count
        })
      };
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Setup error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
}

// Handle get subscription status
async function handleGetSubscriptionStatus(queryParams) {
  console.log('=== HANDLE GET SUBSCRIPTION STATUS ===');
  console.log('Query params:', JSON.stringify(queryParams, null, 2));
  
  try {
    const { email } = queryParams || {};
    console.log('Email extracted:', email);
    
    if (!email) {
      console.log('❌ No email provided');
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Email parameter is required' })
      };
    }
    
    console.log('🔌 Attempting to connect to database...');
    const client = await pool.connect();
    console.log('✅ Database connection established');
    
    try {
      // Get subscription status
      console.log('📊 Executing subscription status query for email:', email);
      const query = `
        SELECT 
          s.*,
          u.name as user_name
        FROM subscriptions s
        LEFT JOIN users u ON s.email = u.email
        WHERE s.email = $1
        ORDER BY s.created_at DESC
        LIMIT 1
      `;
      console.log('Query:', query);
      console.log('Parameters:', [email]);
      
      const result = await client.query(query, [email]);
      console.log('✅ Query executed successfully');
      console.log('Result rows count:', result.rows.length);
      console.log('Result rows:', JSON.stringify(result.rows, null, 2));
      
      if (result.rows.length === 0) {
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            has_subscription: false,
            message: 'No subscription found for this email'
          })
        };
      }
      
      const subscription = result.rows[0];
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          has_subscription: true,
          subscription: {
            id: subscription.id,
            plan: subscription.plan,
            status: subscription.status,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            trial_start: subscription.trial_start,
            trial_end: subscription.trial_end,
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: subscription.canceled_at,
            created_at: subscription.created_at,
            updated_at: subscription.updated_at,
            user_name: subscription.user_name
          }
        })
      };
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Get subscription status error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to get subscription status',
        message: error.message,
        code: error.code,
        name: error.name
      })
    };
  }
}

// Handle database health check
async function handleDbHealth() {
  console.log('=== HANDLE DB HEALTH CHECK ===');
  
  try {
    console.log('🔌 Testing DB connection');
    const client = await pool.connect();
    
    try {
      const res = await client.query('SELECT NOW()');
      console.log('✅ DB health check successful');
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          status: 'ok', 
          now: res.rows[0].now,
          message: 'Database connection healthy'
        })
      };
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ DB health check failed', err);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        status: 'error', 
        message: err.message,
        error: 'Database connection failed'
      })
    };
  }
}

// Initialize database with users and subscriptions tables
async function initDatabase() {
  console.log('=== INITIALIZE DATABASE ===');
  
  const client = await pool.connect();
  
  try {
    console.log('🔧 Creating users table...');
    
    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        confirmed BOOLEAN DEFAULT false,
        confirmation_token VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await client.query(createUsersTable);
    console.log('✅ Users table created');
    
    console.log('🔧 Creating subscriptions table...');
    
    // Create subscriptions table
    const createSubscriptionsTable = `
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        stripe_customer_id VARCHAR(255) NOT NULL,
        stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        plan VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        current_period_start TIMESTAMP,
        current_period_end TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await client.query(createSubscriptionsTable);
    console.log('✅ Subscriptions table created');
    
    // Create indexes for better performance
    console.log('🔧 Creating indexes...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status)');
    console.log('✅ Indexes created');
    
    // Verify tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'subscriptions')
      ORDER BY table_name
    `);
    
    console.log('📊 Tables created:', tablesResult.rows.map(row => row.table_name));
    
    return {
      success: true,
      message: 'Database schema created successfully',
      tables: tablesResult.rows.map(row => row.table_name)
    };
    
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// ==================== AUTHENTICATION FUNCTIONS ====================

// Handle user registration
async function handleRegister(body) {
  console.log('=== HANDLE REGISTER ===');
  
  try {
    const { name, email, password } = JSON.parse(body);
    
    if (!name || !email || !password) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Name, email, and password are required'
        })
      };
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Invalid email format'
        })
      };
    }
    
    // Validate password strength
    if (password.length < 6) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Password must be at least 6 characters long'
        })
      };
    }
    
    const client = await pool.connect();
    
    try {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      
      if (existingUser.rows.length > 0) {
        return {
          statusCode: 409,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: false,
            error: 'User with this email already exists'
          })
        };
      }
      
      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // Generate confirmation token
      const confirmationToken = uuidv4();
      
      // Insert user into database
      const result = await client.query(
        `INSERT INTO users (name, email, password_hash, confirmation_token, confirmed)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, name, confirmed`,
        [name, email, passwordHash, confirmationToken, false]
      );
      
      const user = result.rows[0];
      
      // Send confirmation email
      await sendConfirmationEmail(email, name, confirmationToken);
      
      console.log('✅ User registered successfully:', user.email);
      
      return {
        statusCode: 201,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          message: 'User registered successfully. Please check your email to confirm your account.',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            confirmed: user.confirmed
          }
        })
      };
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Registration failed',
        message: error.message
      })
    };
  }
}

// Handle email confirmation
async function handleConfirmEmail(queryParams) {
  console.log('=== HANDLE CONFIRM EMAIL ===');
  
  try {
    const { token } = queryParams;
    
    if (!token) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Confirmation token is required'
        })
      };
    }
    
    const client = await pool.connect();
    
    try {
      // Find user by confirmation token
      const result = await client.query(
        'SELECT id, email, name, confirmed FROM users WHERE confirmation_token = $1',
        [token]
      );
      
      if (result.rows.length === 0) {
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: false,
            error: 'Invalid or expired confirmation token'
          })
        };
      }
      
      const user = result.rows[0];
      
      if (user.confirmed) {
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: true,
            message: 'Email already confirmed',
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              confirmed: user.confirmed
            }
          })
        };
      }
      
      // Mark user as confirmed
      await client.query(
        'UPDATE users SET confirmed = true, confirmation_token = NULL, updated_at = NOW() WHERE id = $1',
        [user.id]
      );
      
      console.log('✅ Email confirmed successfully:', user.email);
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          message: 'Email confirmed successfully. You can now log in.',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            confirmed: true
          }
        })
      };
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Email confirmation error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Email confirmation failed',
        message: error.message
      })
    };
  }
}

// Handle user login
async function handleLogin(body) {
  console.log('=== HANDLE LOGIN ===');
  
  try {
    const { email, password } = JSON.parse(body);
    
    if (!email || !password) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          error: 'Email and password are required'
        })
      };
    }
    
    const client = await pool.connect();
    
    try {
      // Find user by email
      const result = await client.query(
        'SELECT id, email, name, password_hash, confirmed FROM users WHERE email = $1',
        [email]
      );
      
      if (result.rows.length === 0) {
        return {
          statusCode: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: false,
            error: 'Invalid email or password'
          })
        };
      }
      
      const user = result.rows[0];
      
      // Check if email is confirmed
      if (!user.confirmed) {
        return {
          statusCode: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: false,
            error: 'Please confirm your email before logging in'
          })
        };
      }
      
      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      
      if (!passwordMatch) {
        return {
          statusCode: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: false,
            error: 'Invalid email or password'
          })
        };
      }
      
      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          name: user.name
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      console.log('✅ User logged in successfully:', user.email);
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          message: 'Login successful',
          token: token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            confirmed: user.confirmed
          }
        })
      };
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Login error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Login failed',
        message: error.message
      })
    };
  }
}

// Send confirmation email via AWS SES
async function sendConfirmationEmail(email, name, token) {
  console.log('=== SENDING CONFIRMATION EMAIL ===');
  
  try {
    const confirmationLink = `https://app.ahauros.io/auth/confirm?token=${token}`;
    
    const params = {
      Source: 'no-reply@ahauros.ai',
      Destination: {
        ToAddresses: [email]
      },
      Message: {
        Subject: {
          Data: 'Confirm your Ahauros AI account',
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: `
              <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #2563eb;">Welcome to Ahauros AI!</h2>
                  <p>Hi ${name},</p>
                  <p>Thank you for registering with Ahauros AI. To complete your registration, please confirm your email address by clicking the button below:</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${confirmationLink}" 
                       style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Confirm Email Address
                    </a>
                  </div>
                  <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
                  <p style="word-break: break-all; color: #666;">${confirmationLink}</p>
                  <p>This link will expire in 24 hours.</p>
                  <p>If you didn't create an account with Ahauros AI, you can safely ignore this email.</p>
                  <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                  <p style="color: #666; font-size: 12px;">
                    © 2025 Ahauros AI. All rights reserved.
                  </p>
                </body>
              </html>
            `,
            Charset: 'UTF-8'
          },
          Text: {
            Data: `
              Welcome to Ahauros AI!
              
              Hi ${name},
              
              Thank you for registering with Ahauros AI. To complete your registration, please confirm your email address by visiting this link:
              
              ${confirmationLink}
              
              This link will expire in 24 hours.
              
              If you didn't create an account with Ahauros AI, you can safely ignore this email.
              
              © 2025 Ahauros AI. All rights reserved.
            `,
            Charset: 'UTF-8'
          }
        }
      }
    };
    
    const result = await ses.sendEmail(params).promise();
    console.log('✅ Confirmation email sent successfully:', result.MessageId);
    
  } catch (error) {
    console.error('❌ Failed to send confirmation email:', error);
    throw error;
  }
}

// Handle database migration
async function handleDbMigrate() {
  try {
    console.log('=== HANDLE DB MIGRATE ===');
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'prod' ? { rejectUnauthorized: false } : false
    });
    
    console.log('🔌 Testing DB connection');
    const client = await pool.connect();
    console.log('✅ Database connection established');
    
    // Add new columns to users table if they don't exist
    const alterTableQueries = [
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmed BOOLEAN DEFAULT false;',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmation_token VARCHAR(255);'
    ];
    
    for (const query of alterTableQueries) {
      console.log(`Executing: ${query}`);
      await client.query(query);
    }
    
    // Update existing users to have confirmed = true (for existing users)
    await client.query('UPDATE users SET confirmed = true WHERE confirmed IS NULL;');
    
    client.release();
    await pool.end();
    
    console.log('✅ Database migration completed successfully');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: true,
        message: 'Database migration completed successfully'
      })
    };
    
  } catch (error) {
    console.error('❌ Database migration error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: false,
        error: 'Migration failed',
        message: error.message 
      })
    };
  }
}










