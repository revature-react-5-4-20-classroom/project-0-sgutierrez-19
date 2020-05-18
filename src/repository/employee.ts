import { connectionPool } from './index';
import { User } from '../models/user';
import { PoolClient, QueryResult } from 'pg';
import { Reimbursement } from '../models/reimbursement';

// Find user by their ID function
export async function getUserById(id: number): Promise<User> {
  let client: PoolClient = await connectionPool.connect();
  try {
    let result: QueryResult;
    result = await client.query(
      `SELECT users.id, username, "password", first_name, last_name, email, roles."role" 
        FROM users
        INNER JOIN roles ON users."role" = roles.id
        WHERE users.id = $1`,
      [id]
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
    if (matchingUser.length > 0 && matchingUser) {
      return matchingUser[0];
    } else {
      throw new Error(`Couldn't find User with the Id: ${id}`);
    }
  } catch (e) {
    throw new Error(e.message);
  } finally {
    client && client.release();
  }
}

// CREATE REIMBURSEMENT FUNCTION
export async function createReim(
  reimObj: Reimbursement
): Promise<Reimbursement> {
  let client: PoolClient = await connectionPool.connect();
  try {
    // get status id from string
    let statusResult: QueryResult;
    statusResult = await client.query(
      `SELECT * FROM reimbursement_status WHERE "status" = $1;`,
      [reimObj.status]
    );
    if (statusResult.rows.length === 0) {
      throw new Error(`An unexpected error occured while fetching statuses.`);
    }
    let statusId = +statusResult.rows[0].id;
    // get type id by string
    let typeResult: QueryResult;
    typeResult = await client.query(
      `SELECT * FROM reimbursement_type WHERE "type" = $1;`,
      [reimObj.type]
    );
    if (typeResult.rows.length === 0) {
      throw new Error(`An unexpected error occured while fetching types.`);
    }
    let typeId = +typeResult.rows[0].id;
    // make reimbusement
    let insertReim: QueryResult = await client.query(
      `INSERT INTO reimbursements (author, amount, date_submitted, "description", "status", "type")
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id;`,
      [
        reimObj.author,
        reimObj.amount,
        reimObj.date_submitted,
        reimObj.description,
        statusId,
        typeId,
      ]
    );
    let newReimId = insertReim.rows.map((r) => {
      return r.id;
    })[0];
    if (newReimId.length === 0) {
      throw new Error(
        `There was an unexpected error creating your reimbursement.`
      );
    }
    let result: QueryResult = await client.query(
      `SELECT reimbursements.id, users.first_name || ' ' || users.last_name AS author, amount, date_submitted, "description", 
      reimbursement_status."status" AS "status",
      reimbursement_type."type" AS "type"
      FROM reimbursements
      INNER JOIN reimbursement_status ON reimbursements."status" = reimbursement_status.id
      INNER JOIN reimbursement_type ON reimbursements."type" = reimbursement_type.id
      INNER JOIN users ON reimbursements.author = users.id
      WHERE reimbursements.id = $1;`,
      [newReimId]
    );
    let returnReim: Reimbursement = result.rows.map((r) => {
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
    if (newReimId.length === 0) {
      throw new Error(
        `There was an unexpected error finding your new reimbursement.`
      );
    } else {
      return returnReim;
    }
  } catch (e) {
    throw new Error(e.message);
  } finally {
    client && client.release();
  }
}

// GET reimbursements by ID
export async function findReimById(author: number): Promise<Reimbursement[]> {
  let client: PoolClient = await connectionPool.connect();
  try {
    let result: QueryResult = await client.query(
      `SELECT r.id, u.first_name || ' ' || u.last_name AS "author",
      description, amount, rt."type", rs."status", date_submitted, date_resolved
      FROM reimbursements r
      INNER JOIN users u ON r.author = u.id
      LEFT JOIN reimbursement_type rt ON r."type"= rt.id
      LEFT JOIN reimbursement_status rs ON r."status" = rs.id
      WHERE r.author = $1;`,
      [author]
    );
    let reimArray = result.rows.map((r) => {
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
        `There were no reimbursements for the User with the ID#${author}.  Please try again with another ID.`
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
