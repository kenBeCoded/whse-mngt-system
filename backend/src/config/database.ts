import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.USERS_DB,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Handle pool connection errors
pool.on('error', (err: Error, client: any) => {
  console.error('Unexpected error on idle client:', err.message);
  // Optionally notify or restart the application, e.g., via a monitoring service
});

export default pool;