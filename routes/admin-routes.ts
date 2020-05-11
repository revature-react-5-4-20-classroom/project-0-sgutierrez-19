import express from 'express';

const router = express.Router();

// @'/users' PATCH
// userId & all fields to update must be incl.
router.patch('/users', function (req, res) {
  // UPDATE USER valuestoupdate WHERE userId = req.body.userId
});

export default router;
