import express, { Router, Request, Response } from 'express';
import { updateUser } from '../repository/admin';
import { isAuthenticated } from '../middleware/authenticate';

const router: Router = express.Router();
router.use(isAuthenticated(['Administrator']));

// @'/users' PATCH
// userId & all fields to update must be incl.
router.patch('/users', async (req: Request, res: Response) => {
  // UPDATE USER valuestoupdate WHERE userId = req.body.userId
  let {
    userToUpdate,
    username,
    password,
    first_name,
    last_name,
    email,
    role,
  } = req.body;
  if (!userToUpdate) {
    res
      .status(400)
      .send(`You need to provide the id of the user you want to update.`);
  }
  const toUpdateObj: any = { userToUpdate };
  if (username) toUpdateObj.username = username;
  if (password) toUpdateObj.password = password;
  if (first_name) toUpdateObj.first_name = first_name;
  if (last_name) toUpdateObj.last_name = last_name;
  if (email) toUpdateObj.email = email;
  if (role) toUpdateObj.role = role;
  if (!username && !password && !first_name && !last_name && !email && !role) {
    res.status(400).send(`You haven't provided any information to update.`);
  } else {
    try {
      res.json(await updateUser(toUpdateObj));
    } catch (e) {
      res.status(400).status(e);
    }
  }
});

export default router;
