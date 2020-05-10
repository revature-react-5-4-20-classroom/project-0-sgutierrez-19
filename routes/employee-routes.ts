import express from 'express';

const router = express.Router();

// '/users/:id' GET
// if id === req.params.id - PASS else -> 401
// if User.role === "finance-manager", can get any user

// '/reimbursements/author/userId/:userId' GET
// challenge: '/reimbursements/author/userId/:userId/date-submitted?start=:startDate&end=
// :endDate'
// if id === req.params.userId - pass else -> 401
// if User.role === "finance-manager", can get anyone

// '/reimbursements' POST
// respond '201 created'

export default router;
