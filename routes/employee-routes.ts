import express from 'express';

const router = express.Router();

// @ '/users/:id' GET
router.get('/users/:id', function (req, res) {
  // if id === req.params.id - PASS else -> 401
  // if User.role === "finance-manager", can get any user
});

// @ '/reimbursements/author/userId/:userId' GET
// challenge: '/reimbursements/author/userId/:userId/date-submitted?start=:startDate&end=
// :endDate'
router.get('/reimbursements/authoer/userId/:userId', function (req, res) {
  // if id === req.params.userId - pass else -> 401
  // if User.role === "finance-manager", can get anyone
});

// @ '/reimbursements' POST
router.post('/reimbursements', function (req, res) {
  // respond '201 created'
});

export default router;
