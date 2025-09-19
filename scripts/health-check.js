#!/usr/bin/env node

/**
 * Health Check Script for Ahauros Backend
 * Verifică statusul tuturor serviciilor
 */

const { Client } = require('pg');
const redis = require('redis');
const http = require('http');

// Configuration
const config = {
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'ahauros',
    user: process.env.POSTGRES_USER || 'admin',
    password: process.env.POSTGRES_PASSWORD || 'secret123'
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  },
  clickhouse: {
    host: process.env.CLICKHOUSE_HOST || 'localhost',
    port: process.env.CLICKHOUSE_PORT || 8123
  }
};

// Health check results
const healthStatus = {
  timestamp: new Date().toISOString(),
  status: 'healthy',
  services: {}
};

/**
 * Check PostgreSQL connection
 */
async function checkPostgreSQL() {
  try {
    const client = new Client(config.postgres);
    await client.connect();
    const result = await client.query('SELECT 1 as health_check');
    await client.end();
    
    healthStatus.services.postgresql = {
      status: 'healthy',
      response_time: Date.now(),
      message: 'Connected successfully'
    };
  } catch (error) {
    healthStatus.services.postgresql = {
      status: 'unhealthy',
      error: error.message
    };
    healthStatus.status = 'unhealthy';
  }
}

/**
 * Check Redis connection
 */
async function checkRedis() {
  try {
    const client = redis.createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port
      },
      password: config.redis.password
    });
    
    await client.connect();
    await client.ping();
    await client.disconnect();
    
    healthStatus.services.redis = {
      status: 'healthy',
      message: 'Connected successfully'
    };
  } catch (error) {
    healthStatus.services.redis = {
      status: 'unhealthy',
      error: error.message
    };
    healthStatus.status = 'unhealthy';
  }
}

/**
 * Check ClickHouse connection
 */
async function checkClickHouse() {
  return new Promise((resolve) => {
    const options = {
      hostname: config.clickhouse.host,
      port: config.clickhouse.port,
      path: '/ping',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        healthStatus.services.clickhouse = {
          status: 'healthy',
          message: 'Connected successfully'
        };
      } else {
        healthStatus.services.clickhouse = {
          status: 'unhealthy',
          error: `HTTP ${res.statusCode}`
        };
        healthStatus.status = 'unhealthy';
      }
      resolve();
    });

    req.on('error', (error) => {
      healthStatus.services.clickhouse = {
        status: 'unhealthy',
        error: error.message
      };
      healthStatus.status = 'unhealthy';
      resolve();
    });

    req.on('timeout', () => {
      healthStatus.services.clickhouse = {
        status: 'unhealthy',
        error: 'Connection timeout'
      };
      healthStatus.status = 'unhealthy';
      resolve();
    });

    req.end();
  });
}

/**
 * Main health check function
 */
async function runHealthCheck() {
  console.log('🔍 Running health checks...\n');
  
  // Run all health checks in parallel
  await Promise.all([
    checkPostgreSQL(),
    checkRedis(),
    checkClickHouse()
  ]);

  // Display results
  console.log('📊 Health Check Results:');
  console.log('========================');
  console.log(`Overall Status: ${healthStatus.status.toUpperCase()}`);
  console.log(`Timestamp: ${healthStatus.timestamp}\n`);

  Object.entries(healthStatus.services).forEach(([service, status]) => {
    const icon = status.status === 'healthy' ? '✅' : '❌';
    console.log(`${icon} ${service.toUpperCase()}: ${status.status}`);
    if (status.error) {
      console.log(`   Error: ${status.error}`);
    }
    if (status.message) {
      console.log(`   Message: ${status.message}`);
    }
  });

  // Exit with appropriate code
  process.exit(healthStatus.status === 'healthy' ? 0 : 1);
}

// Run health check if called directly
if (require.main === module) {
  runHealthCheck().catch((error) => {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  });
}

module.exports = { runHealthCheck, healthStatus };

