import { User } from '../models/user';
import { PoolClient, QueryResult } from 'pg';
import { connectionPool } from '.';

export async function updateUser(updateInfo: any): Promise<User> {
  let client: PoolClient = await connectionPool.connect();
  let updateQuery = await makeQuery(updateInfo);
  try {
    let result: QueryResult = await client.query(updateQuery, [
      updateInfo.userToUpdate,
    ]);
    let updatedUser: QueryResult = await client.query(
      `SELECT users.id, username, "password", first_name, last_name, email, roles."role" 
        FROM users
        INNER JOIN roles ON users."role" = roles.id
        WHERE users.id = $1`,
      [+result.rows[0].id]
    );
    return updatedUser.rows.map((u) => {
      return new User(
        u.id,
        u.username,
        u.password,
        u.first_name,
        u.last_name,
        u.email,
        u.role
      );
    })[0];
  } catch (e) {
    throw new Error(e);
  } finally {
    client && client.release();
  }
}

async function makeQuery(updateInfo: any) {
  let updateQuery: string[] = ['UPDATE users SET'];
  let sets: string[] = [];
  Object.keys(updateInfo).forEach((key: string) => {
    if (key !== 'userToUpdate' && isNaN(updateInfo[key])) {
      sets.push(`${key} = '${updateInfo[key]}'`);
    } else if (key !== 'userToUpdate') {
      sets.push(`${key} = ${updateInfo[key]}`);
    }
  });
  updateQuery.push(sets.join(', '));
  updateQuery.push(`WHERE id = $1 RETURNING id;`);
  return updateQuery.join(' ');
}
