import express from 'express';

const router = express.Router();

// @ '/login' POST
router.post('/login', function (req, res) {
  // SELECT * FROM USERS WHERE userId = req.body.userId
});

export default router;
