import express, { Router, Request, Response } from 'express';
import { verifyUsernamePassword } from '../repository/authentication';

const router: Router = express.Router();

// @ '/login' POST
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res
      .status(400)
      .send(`Please include your username and password and try again.`);
  } else {
    try {
      const user = await verifyUsernamePassword(username, password);
      if (req.session) {
        req.session.user = user;
      }
      res.json(user);
    } catch (e) {
      res.status(401).send(e.message);
    }
  }
});

// @route   GET /logout
router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

export default router;
