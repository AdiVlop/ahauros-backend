import { Pool, PoolClient } from 'pg';
import { logger } from './logger';

class DatabaseConnection {
  private pool: Pool;
  private static instance: DatabaseConnection;

  private constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err) => {
      logger.error({
        level: 'error',
        message: 'Unexpected error on idle client',
        timestamp: new Date(),
        metadata: { error: err.message, stack: err.stack }
      });
    });
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      logger.debug({
        level: 'debug',
        message: 'Database query executed',
        timestamp: new Date(),
        metadata: {
          query: text.substring(0, 100) + '...',
          duration: `${duration}ms`,
          rowCount: result.rowCount
        }
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      
      logger.error({
        level: 'error',
        message: 'Database query failed',
        timestamp: new Date(),
        metadata: {
          query: text,
          params,
          duration: `${duration}ms`,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      
      throw error;
    }
  }

  public async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}

export const db = DatabaseConnection.getInstance();

