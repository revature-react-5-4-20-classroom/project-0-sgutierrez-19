import express, { Router, Request, Response } from 'express';
import { isAuthenticated } from '../middleware/authenticate';
import {
  getAllUsers,
  findReimByStatus,
  updateReimbursement,
} from '../repository/manager';
import { Reimbursement } from '../models/reimbursement';

const router: Router = express.Router();

router.use(isAuthenticated(['Finance Manager']));

// @ '/users' GET
router.get('/testing', async (req: Request, res: Response) => {
  try {
    res.json(await getAllUsers());
  } catch (e) {
    res.status(400).send(e);
  }
});

// @ '/reimbursements/status/:statusId' GET
router.get(
  '/reimbursements/status/:statusId',
  async (req: Request, res: Response) => {
    let statusId: number = +req.params.statusId;
    if (!statusId || isNaN(statusId) || statusId < 1 || statusId > 3) {
      res
        .status(400)
        .send(
          `You must pass valid number as status ID.  1 = Pending, 2 = Approved, 3 = Denied`
        );
    } else {
      try {
        res.json(await findReimByStatus(statusId));
      } catch (e) {
        res.status(400).send(e.message);
      }
    }
  }
);

// @ '/reimbursements' PATCH
// // reimbursementId must be present & fields to update.  Best for approve/deny
router.patch('/reimbursements', async (req, res) => {
  let { reimToUpdate, amount, description, status } = req.body;

  if (!reimToUpdate) {
    res
      .status(400)
      .send(
        `You need to provide the reimbursement id for the reimbursement you want to update`
      );
  }
  const toUpdateObj: any = { reimToUpdate };
  if (amount) toUpdateObj.amount = amount;
  if (description) toUpdateObj.description = description;
  if (status) toUpdateObj.status = status;
  try {
    if (!amount && !description && !status) {
      res.status(400).send(`You haven't provided any information to update.`);
    } else if ((status && status < 1) || status > 3) {
      res
        .status(400)
        .send(
          `You must pass valid number as status ID.  1 = Pending, 2 = Approved, 3 = Denied`
        );
    } else if (status) {
      // if a status comes through in request that is 1, 2, or 3
      // query will update date_resolved and resolver
      // and have the resolver name and resolved date in return
      let resolver = req.session && +req.session.user.id;
      res.json(await updateReimbursement(toUpdateObj, resolver));
    } else {
      // if no status updates, query will not have updates to
      // resolver & date resolved and return will not have that
      res.json(await updateReimbursement(toUpdateObj));
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

export default router;
