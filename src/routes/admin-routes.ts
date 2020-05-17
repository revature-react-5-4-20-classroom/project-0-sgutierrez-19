import express, { Router, Request, Response } from 'express';

const router: Router = express.Router();

// @'/users' PATCH
// userId & all fields to update must be incl.
router.patch('/users', async (req: Request, res: Response) => {
  // UPDATE USER valuestoupdate WHERE userId = req.body.userId
});

export default router;
