const AWS = require('aws-sdk');

// Initialize AWS services
const rds = new AWS.RDS();
const elasticache = new AWS.ElastiCache();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  const { httpMethod, path, pathParameters, queryStringParameters, body } = event;
  
  try {
    // Handle CORS preflight
    if (httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'CORS preflight' })
      };
    }
    
    // Route handling
    if (path === '/health') {
      return handleHealth();
    } else if (path === '/api/v1/users') {
      if (httpMethod === 'GET') {
        return handleGetUsers();
      } else if (httpMethod === 'POST') {
        return handleCreateUser(JSON.parse(body || '{}'));
      }
    } else if (path === '/api/v1/products') {
      if (httpMethod === 'GET') {
        return handleGetProducts();
      }
    } else if (path === '/api/v1/orders') {
      if (httpMethod === 'POST') {
        return handleCreateOrder(JSON.parse(body || '{}'));
      }
    }
    
    // Default response
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Not Found' })
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};

// Health check endpoint
async function handleHealth() {
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ahauros-backend',
      version: '1.0.0'
    })
  };
}

// Get users endpoint
async function handleGetUsers() {
  // Mock data for now
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2024-01-01T00:00:00Z' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2024-01-02T00:00:00Z' }
  ];
  
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ users })
  };
}

// Create user endpoint
async function handleCreateUser(userData) {
  const { name, email } = userData;
  
  if (!name || !email) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Name and email are required' })
    };
  }
  
  // Mock response
  const newUser = {
    id: Date.now(),
    name,
    email,
    created_at: new Date().toISOString()
  };
  
  return {
    statusCode: 201,
    headers: corsHeaders,
    body: JSON.stringify({ user: newUser })
  };
}

// Get products endpoint
async function handleGetProducts() {
  // Mock data for now
  const products = [
    { id: 1, name: 'Product A', price: 29.99, stock: 100, created_at: '2024-01-01T00:00:00Z' },
    { id: 2, name: 'Product B', price: 49.99, stock: 50, created_at: '2024-01-02T00:00:00Z' }
  ];
  
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ products })
  };
}

// Create order endpoint
async function handleCreateOrder(orderData) {
  const { user_id, product_id, quantity } = orderData;
  
  if (!user_id || !product_id || !quantity) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'user_id, product_id, and quantity are required' })
    };
  }
  
  // Mock response
  const newOrder = {
    id: Date.now(),
    user_id,
    product_id,
    quantity,
    total_price: quantity * 29.99, // Mock price calculation
    created_at: new Date().toISOString()
  };
  
  return {
    statusCode: 201,
    headers: corsHeaders,
    body: JSON.stringify({ order: newOrder })
  };
}


// Initialize AWS services
const rds = new AWS.RDS();
const elasticache = new AWS.ElastiCache();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  const { httpMethod, path, pathParameters, queryStringParameters, body } = event;
  
  try {
    // Handle CORS preflight
    if (httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'CORS preflight' })
      };
    }
    
    // Route handling
    if (path === '/health') {
      return handleHealth();
    } else if (path === '/api/v1/users') {
      if (httpMethod === 'GET') {
        return handleGetUsers();
      } else if (httpMethod === 'POST') {
        return handleCreateUser(JSON.parse(body || '{}'));
      }
    } else if (path === '/api/v1/products') {
      if (httpMethod === 'GET') {
        return handleGetProducts();
      }
    } else if (path === '/api/v1/orders') {
      if (httpMethod === 'POST') {
        return handleCreateOrder(JSON.parse(body || '{}'));
      }
    }
    
    // Default response
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Not Found' })
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};

// Health check endpoint
async function handleHealth() {
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ahauros-backend',
      version: '1.0.0'
    })
  };
}

// Get users endpoint
async function handleGetUsers() {
  // Mock data for now
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2024-01-01T00:00:00Z' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2024-01-02T00:00:00Z' }
  ];
  
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ users })
  };
}

// Create user endpoint
async function handleCreateUser(userData) {
  const { name, email } = userData;
  
  if (!name || !email) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Name and email are required' })
    };
  }
  
  // Mock response
  const newUser = {
    id: Date.now(),
    name,
    email,
    created_at: new Date().toISOString()
  };
  
  return {
    statusCode: 201,
    headers: corsHeaders,
    body: JSON.stringify({ user: newUser })
  };
}

// Get products endpoint
async function handleGetProducts() {
  // Mock data for now
  const products = [
    { id: 1, name: 'Product A', price: 29.99, stock: 100, created_at: '2024-01-01T00:00:00Z' },
    { id: 2, name: 'Product B', price: 49.99, stock: 50, created_at: '2024-01-02T00:00:00Z' }
  ];
  
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ products })
  };
}

// Create order endpoint
async function handleCreateOrder(orderData) {
  const { user_id, product_id, quantity } = orderData;
  
  if (!user_id || !product_id || !quantity) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'user_id, product_id, and quantity are required' })
    };
  }
  
  // Mock response
  const newOrder = {
    id: Date.now(),
    user_id,
    product_id,
    quantity,
    total_price: quantity * 29.99, // Mock price calculation
    created_at: new Date().toISOString()
  };
  
  return {
    statusCode: 201,
    headers: corsHeaders,
    body: JSON.stringify({ order: newOrder })
  };
}









