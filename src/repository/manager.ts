import { User } from '../models/user';
import { PoolClient, QueryResult } from 'pg';
import { connectionPool } from '.';
import { Reimbursement } from '../models/reimbursement';

// return all users
export async function getAllUsers(): Promise<User[]> {
  let client: PoolClient = await connectionPool.connect();
  try {
    let results = await client.query(
      `SELECT * FROM users
            INNER JOIN roles ON users."role" = roles.id;`
    );
    let userList = results.rows.map((u) => {
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
    return userList;
  } catch (e) {
    throw new Error(e);
  } finally {
    client && client.release();
  }
}

// Find ALL reimbursements with a certain status
export async function findReimByStatus(
  status: number
): Promise<Reimbursement[]> {
  let client: PoolClient = await connectionPool.connect();
  try {
    let results = await client.query(
      `SELECT r.id, u.first_name || ' ' || u.last_name AS "author",
            description, amount, rt."type", rs."status", date_submitted, date_resolved
            FROM reimbursements r
            INNER JOIN users u ON r.author = u.id
            LEFT JOIN reimbursement_type rt ON r."type"= rt.id
            LEFT JOIN reimbursement_status rs ON r."status" = rs.id
            WHERE r."status" = $1;`,
      [status]
    );
    let reimArray = results.rows.map((r) => {
      return new Reimbursement(
        r.author,
        r.amount,
        r.date_submitted,
        r.description,
        r.status,
        r.type,
        r.id
      );
    });
    if (reimArray.length === 0) {
      throw new Error(
        `There were no reimbursements with the status ID #${status}.  Please try again with another ID.`
      );
    } else {
      return reimArray;
    }
  } catch (e) {
    throw new Error(e.message);
  } finally {
    client && client.release();
  }
}

export async function updateReimbursement(
  updateInfo: any,
  resolver?: any
): Promise<Reimbursement> {
  let client: PoolClient = await connectionPool.connect();
  // this will run if there was a status change passed in through the body
  try {
    if (updateInfo.status) {
      let resolverId: number = resolver;
      let updateQuery = await makeTimestampQuery(updateInfo, resolverId);
      let result: QueryResult = await client.query(updateQuery, [
        updateInfo.reimToUpdate,
      ]);
      let updatedReim: QueryResult = await client.query(
        `      
              SELECT r.id, u.first_name || ' ' || u.last_name AS "author",
              description, amount, rt."type", rs."status", date_submitted, date_resolved,
              u2.first_name || ' ' || u2.last_name AS "resolver"
              FROM reimbursements r
              INNER JOIN users u ON r.author = u.id
              LEFT JOIN reimbursement_type rt ON r."type"= rt.id
              LEFT JOIN reimbursement_status rs ON r."status" = rs.id
              INNER JOIN users u2 ON r.resolver = u2.id
              WHERE r.id = $1;`,
        [result.rows[0].id]
      );
      return updatedReim.rows.map((r) => {
        return new Reimbursement(
          r.author,
          r.amount,
          r.date_submitted,
          r.description,
          r.status,
          r.type,
          r.id,
          r.date_resolved,
          r.resolver
        );
      })[0];
    } else {
      // this will run if there's no updates to the status
      let updateQuery = await makeQuery(updateInfo);
      let result: QueryResult = await client.query(updateQuery, [
        updateInfo.reimToUpdate,
      ]);
      let updatedReim: QueryResult = await client.query(
        `      
        SELECT r.id, u.first_name || ' ' || u.last_name AS "author",
        description, amount, rt."type", rs."status", date_submitted, date_resolved
        FROM reimbursements r
        INNER JOIN users u ON r.author = u.id
        LEFT JOIN reimbursement_type rt ON r."type"= rt.id
        LEFT JOIN reimbursement_status rs ON r."status" = rs.id
        WHERE r.id = $1;`,
        [result.rows[0].id]
      );
      return updatedReim.rows.map((r) => {
        return new Reimbursement(
          r.author,
          r.amount,
          r.date_submitted,
          r.description,
          r.status,
          r.type,
          r.id
        );
      })[0];
    }
  } catch (e) {
    throw new Error(e);
  } finally {
    client && client.release();
  }
}

// query maker w/o updates to resolver && date resolved
// bc status set to approved or denied or pending
async function makeTimestampQuery(updateInfo: any, resolver: number) {
  let updateQuery: string[] = ['UPDATE reimbursements SET'];
  let sets: string[] = [];
  Object.keys(updateInfo).forEach((key: string) => {
    if (key === 'date_resolved') {
      // get current date:
      let today: Date = new Date();
      let dateSubmitted: string = `${today.getFullYear()}-${
        today.getMonth() + 1
      }-${today.getDay()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
      sets.push(`${key} = '${dateSubmitted}'`);
    } else if (key === 'resolver') {
      sets.push(`${key} === ${resolver}`);
    } else if (key !== 'reimToUpdate' && isNaN(updateInfo[key])) {
      sets.push(`${key} = '${updateInfo[key]}'`);
    } else if (key !== 'reimToUpdate') {
      sets.push(`${key} = ${updateInfo[key]}`);
    }
  });
  updateQuery.push(sets.join(', '));
  updateQuery.push(`WHERE id = $1 RETURNING id;`);
  return updateQuery.join(' ');
}

// query maker where there are are no updates to status
async function makeQuery(updateInfo: any) {
  let updateQuery: string[] = ['UPDATE reimbursements SET'];
  let sets: string[] = [];
  Object.keys(updateInfo).forEach((key: string) => {
    if (key !== 'reimToUpdate' && isNaN(updateInfo[key])) {
      sets.push(`${key} = '${updateInfo[key]}'`);
    } else if (key !== 'reimToUpdate') {
      sets.push(`${key} = ${updateInfo[key]}`);
    }
  });
  updateQuery.push(sets.join(', '));
  updateQuery.push(`WHERE id = $1 RETURNING id;`);
  return updateQuery.join(' ');
}
