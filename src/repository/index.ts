import { Pool } from 'pg';

export const connectionPool: Pool = new Pool({
  // host: process.env['PG_HOST'],
  // user: process.env['PG_USER'],
  // password: process.env['PG_PASSWORD'],
  // database: process.env['PG_DATABASE'],
  host: 'database-1.cqgfuvrtcnlt.us-west-1.rds.amazonaws.com',
  user: 'postgres',
  password: 'SuperSecretPassword123',
  database: 'postgres',
  port: 5432, // db port
  max: 3,
});
