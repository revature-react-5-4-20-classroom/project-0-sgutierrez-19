import express, { Router, Request, Response } from 'express';
import { updateUser, checkExisting } from '../repository/admin';
import { isAuthenticated } from '../middleware/authenticate';

const router: Router = express.Router();

// @'/users' PATCH
// userId & all fields to update must be incl.
router.patch(
  '/users',
  isAuthenticated(['Administrator']),
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
    if (!userToUpdate || isNaN(userToUpdate) || userToUpdate < 1) {
      res
        .status(400)
        .send(
          `You need to provide a valid User ID # of the user you want to update.`
        );
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
      if (username) {
        let usernameAlreadyExists = await checkExisting(username);
        if (usernameAlreadyExists) {
          res
            .status(400)
            .send(`The username: ${username} already exists in our system.`);
        } else {
          try {
            res.json(await updateUser(toUpdateObj));
          } catch (e) {
            res.status(400).status(e);
          }
        }
      }
      try {
        res.json(await updateUser(toUpdateObj));
      } catch (e) {
        res.status(400).status(e);
      }
    }
  }
);

export default router;
