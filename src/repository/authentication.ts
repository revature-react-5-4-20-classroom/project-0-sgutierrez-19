import { connectionPool } from './index';
import { User } from '../models/user';
import { PoolClient, QueryResult } from 'pg';

export async function verifyUsernamePassword(
  username: string,
  password: string
): Promise<User> {
  let client: PoolClient = await connectionPool.connect();
  try {
    let result: QueryResult;
    result = await client.query(
      `SELECT * FROM users
        WHERE username = $1 AND password = $2;`,
      [username, password]
    );
    let matchingUser = result.rows.map((u) => {
      return new User(
        u.id,
        u.username,
        u.password,
        u.first_name,
        u.last_name,
        u.email,
        u.role
      );
    });
    if (matchingUser.length > 0) {
      return matchingUser[0];
    } else {
      throw new Error(`Could not find matching username and password`);
    }
  } catch (e) {
    throw new Error(
      `Failed to validate your credentials with database.  Error Message: ${e.message}`
    );
  } finally {
    client && client.release();
  }
}
