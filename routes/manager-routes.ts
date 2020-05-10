import express from 'express';

const router = express.Router();

// '/users' GET

// '/reimbursements/status/:statusId' GET
// challenge: '/reimbursements/status/:statusId/date-submitted?start=:startDate&end=:endDate'

// /reimbursements PATCH
// reimbursementId must be present & fields to update.  Best for approve/deny

export default router;
