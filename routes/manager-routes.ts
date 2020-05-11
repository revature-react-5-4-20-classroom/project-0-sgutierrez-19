import express from 'express';

const router = express.Router();

// @ '/users' GET
router.get('/users', function (req, res) {});

// @ '/reimbursements/status/:statusId' GET
// challenge: '/reimbursements/status/:statusId/date-submitted?start=:startDate&end=:endDate'
router.get('/reimbursements/status/:statusId', function (req, res) {});

// @ '/reimbursements' PATCH
// reimbursementId must be present & fields to update.  Best for approve/deny
router.patch('/reimbursements', function (req, res) {});

export default router;
