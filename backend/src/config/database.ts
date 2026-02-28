import { Pool } from 'pg';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Force IPv4 DNS resolution on Render (no IPv6 support)
dns.setDefaultResultOrder('ipv4first');

const pool = new Pool({
  connectionString: process.env.USERS_DB,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client:', err.message);
});

export default pool;