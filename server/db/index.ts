import { Pool, PoolClient, QueryResult } from 'pg';
import fs from 'fs';
import path from 'path';

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

class Database {
  private pool: Pool;

  constructor() {
    // Use DATABASE_URL if available (Supabase), otherwise fallback to individual config
    if (process.env.DATABASE_URL) {
      const dbUrl = new URL(process.env.DATABASE_URL);
      console.log(`Attempting to connect to database: ${dbUrl.hostname} as user ${dbUrl.username}`);
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
    } else {
       throw new Error("DATABASE_URL is undefined – check Render dashboard or .env");
    }

    this.pool.on('error', (err: Error) => {
      console.error('Database pool error:', err);
    });
  }

  async query(text: string, params?: (string | number | boolean)[]): Promise<QueryResult> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  async initializeSchema(): Promise<void> {
    try {
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await this.query(schema);
      console.log('Database schema initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database schema:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT NOW()');
      console.log('Database connection successful:', result.rows[0]);
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export const db = new Database();
export default db;