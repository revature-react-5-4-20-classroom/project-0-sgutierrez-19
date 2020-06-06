import express, { Router, Request, Response } from 'express';
import {
  getUserById,
  createReim,
  findReimById,
  checkExisting,
  updateUser,
} from '../repository/employee';
import { Reimbursement } from '../models/reimbursement';
import { isAuthenticated } from '../middleware/authenticate';

const router: Router = express.Router();

// @ '/users/:id' GET
router.get(
  '/users/:id',
  isAuthenticated([`Finance Manager`, `Employee`, `Administrator`]),
  async function (req: Request, res: Response) {
    let id: number = +req.params.id;
    // Exclamation marks tell typescript that it's okay it's currently
    // null/undefined and will have value at runtime.
    let currUser: number = req.session! && +req.session!.user.id;
    let currRole: string = req.session && req.session.user.role;

    if (!id || isNaN(id) || id < 1) {
      res.status(400).send(`The user id must be a positive numeric value.`);
    } else if (currRole !== 'Finance Manager' && currUser !== id) {
      res.status(403).send(`You can only view your own user information`);
    } else {
      try {
        res.json(await getUserById(id));
      } catch (e) {
        res.status(400).send(e.message);
      }
    }
  }
);

// @ '/reimbursements/author/userId/:userId' GET
router.get(
  '/reimbursements/author/userId/:userId',
  isAuthenticated([`Finance Manager`, `Employee`, `Administrator`]),
  async (req: Request, res: Response) => {
    let currUser: number = req.session! && +req.session!.user.id;
    let currRole: string = req.session && req.session.user.role;
    let author: number = +req.params.userId;
    if (!author || isNaN(author) || author < 1) {
      res.status(400).send(`The User ID must be a positive numeric value.`);
    } else if (currRole !== 'Finance Manager' && currUser !== author) {
      res
        .status(403)
        .send(`Only Finance Managers may view others' reimbursement requests.`);
    } else {
      try {
        res.json(await findReimById(author));
      } catch (e) {
        res.status(400).send(e.message);
      }
    }
  }
);

// @ '/reimbursements' POST
router.post(
  '/reimbursements',
  isAuthenticated([`Finance Manager`, `Employee`, `Administrator`]),
  async (req: Request, res: Response) => {
    let { amount, description, type } = req.body;
    if (
      (amount && !description && !type) ||
      (description && !amount && !type) ||
      (type && !amount && !description)
    ) {
      res
        .status(400)
        .send(
          `You must provide an amount, description, and type in order to create a reimbursement request.`
        );
    } else if (!amount || isNaN(amount) || amount < 0.01) {
      res
        .status(400)
        .send(`The reimbursement amount must be a number greater than $0.01.`);
    } else if (
      !type ||
      (type !== 'Lodging' &&
        type !== 'Travel' &&
        type !== 'Food' &&
        type !== 'Other')
    ) {
      res
        .status(400)
        .send(
          `You must provide a case-sensitive reimbursement type that must be: Lodging, Travel, Food, or Other`
        );
    } else if (
      !description ||
      typeof description !== 'string' ||
      description === ''
    ) {
      res
        .status(400)
        .send(`You need to provide a description for your reimbursement.`);
    } else {
      let author: number = req.session! && +req.session!.user.id;
      try {
        // get current date:
        let today: Date = new Date();
        let dateSubmitted: string = `${today.getFullYear()}-${
          today.getMonth() + 1
        }-${today.getDay()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
        let status: string = 'Pending';
        res.json(
          await createReim(
            new Reimbursement(
              author,
              amount,
              dateSubmitted,
              description,
              status,
              type
            )
          )
        );
      } catch (e) {
        res.status(400).send(e.message);
      }
    }
  }
);

// @'/users' PATCH
// userId & all fields to update must be incl.
router.patch(
  '/users',
  isAuthenticated(['Employee', 'Finance Manager', 'Administrator']),
  async (req: Request, res: Response) => {
    let {
      userToUpdate,
      username,
      password,
      first_name,
      last_name,
      email,
      role,
    } = req.body;
    let currRole: string = req.session && req.session.user.role;
    let currUser: number = req.session! && +req.session!.user.id;
    try {
      if (!userToUpdate || isNaN(userToUpdate) || userToUpdate < 1) {
        res
          .status(400)
          .send(
            `You need to provide a valid User ID # of the user you want to update.`
          );
      } else if (userToUpdate !== currUser) {
        res.status(400).send(`You may only update your own user info`);
      } else if (
        !username &&
        !password &&
        !first_name &&
        !last_name &&
        !email &&
        !role
      ) {
        res.status(400).send(`You haven't provided any information to update.`);
      } else if (
        (username && typeof username !== 'string') ||
        (username && username == null)
      ) {
        res
          .status(400)
          .send(
            'The username field may not be left empty and must be a valid string.'
          );
      } else if (username && (await checkExisting(username))) {
        res
          .status(400)
          .send(`The username: ${username} already exists in our system.`);
      } else if (
        (password && typeof password !== 'string') ||
        (password && password == null)
      ) {
        res
          .status(400)
          .send(
            'The password field may not be left empty and must be a valid string.'
          );
      } else if (
        (first_name && typeof first_name !== 'string') ||
        (first_name && first_name == null)
      ) {
        res
          .status(400)
          .send(
            'The first name field may not be left empty and must be a valid string.'
          );
      } else if (
        (last_name && typeof last_name !== 'string') ||
        (last_name && last_name == null)
      ) {
        res
          .status(400)
          .send(
            'The last name field may not be left empty and must be a valid string.'
          );
      } else if (
        (email && typeof email !== 'string') ||
        (email && email == null)
      ) {
        res
          .status(400)
          .send(
            'The email field may not be left empty and must be a valid string.'
          );
      } else if (
        (role && isNaN(role)) ||
        (role && role < 1) ||
        (role && role > 3)
      ) {
        res
          .status(400)
          .send(
            `You must pass valid number for the role.  1 = Administrator, 2 = Finance Manager, 3 = Employee`
          );
      } else {
        const toUpdateObj: any = { userToUpdate };
        if (username) toUpdateObj.username = username;
        if (password) toUpdateObj.password = password;
        if (first_name) toUpdateObj.first_name = first_name;
        if (last_name) toUpdateObj.last_name = last_name;
        if (email) toUpdateObj.email = email;
        if (role) toUpdateObj.role = role;
        try {
          res.json(await updateUser(toUpdateObj));
        } catch (e) {
          res.status(400).status(e);
        }
      }
    } catch (e) {
      res.status(400).status(e);
    }
  }
);

export default router;
