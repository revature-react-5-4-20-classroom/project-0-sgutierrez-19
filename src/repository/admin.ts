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
    if (result.rows === undefined || result.rows.length == 0) {
      throw new Error(
        `Could not find a user with the User ID #${updateInfo.userToUpdate}`
      );
    }
    let updatedUser: QueryResult = await client.query(
      `SELECT users.id, username, "password", first_name, last_name, email, roles."role" 
        FROM users
        INNER JOIN roles ON users."role" = roles.id
        WHERE users.id = $1`,
      [+result.rows[0].id]
    );
    let updatedUserOb = updatedUser.rows.map((u) => {
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
    if (updatedUserOb === undefined || updatedUserOb.length == 0) {
      throw new Error(`Unexpected error when trying to retreive updated user`);
    } else {
      return updatedUserOb[0];
    }
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

export async function checkExisting(username: string): Promise<boolean> {
  let alreadyExists = false;
  let client: PoolClient = await connectionPool.connect();
  let userList: QueryResult = await client.query(`SELECT * FROM users;`);
  userList.rows.map((u) => {
    if (u.username.toLowerCase() === username.toLowerCase()) {
      alreadyExists = true;
    }
  });
  return alreadyExists;
}
