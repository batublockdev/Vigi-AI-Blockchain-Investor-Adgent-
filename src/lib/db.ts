import { Pool } from 'pg';

// Singleton pool pattern for Next.js to prevent multiple connection pools during hot-reloads
declare global {
  var _pgPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

export function getPool(): Pool {
  const configuredConnectionString = process.env.DATABASE_URL;
  if (!configuredConnectionString) {
    throw new Error('DATABASE_URL must be set in the deployment environment.');
  }

  if (process.env.NODE_ENV !== 'production' && global._pgPool) {
    return global._pgPool;
  }

  const pool = new Pool({
    connectionString: configuredConnectionString,
    ssl: configuredConnectionString.includes('railway')
      ? { rejectUnauthorized: false }
      : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  if (process.env.NODE_ENV !== 'production') {
    global._pgPool = pool;
  }

  return pool;
}
