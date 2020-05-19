import express, { Router, Request, Response } from 'express';
import { isAuthenticated } from '../middleware/authenticate';
import {
  getAllUsers,
  findReimByStatus,
  updateReimbursement,
} from '../repository/manager';

const router: Router = express.Router();

///////////////////@ '/users' GET/////////////////////////////
////////////////////////START/////////////////////////////////
router.get(
  '/users',
  isAuthenticated(['Finance Manager']),
  async (req: Request, res: Response) => {
    try {
      res.json(await getAllUsers());
    } catch (e) {
      res.status(400).send(e);
    }
  }
);
///////////////////@ '/users' GET/////////////////////////////
////////////////////////END///////////////////////////////////

//////////@ '/reimbursements/status/:statusId' GET////////////
//////////////////////START///////////////////////////////////
router.get(
  '/reimbursements/status/:statusId',
  isAuthenticated(['Finance Manager']),
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
//////////@ '/reimbursements/status/:statusId' GET////////////
//////////////////////END/////////////////////////////////////

/////////////@ '/reimbursements' PATCH/////////////////////////
/////////////////////START/////////////////////////////////////
router.patch(
  '/reimbursements',
  isAuthenticated(['Finance Manager']),
  async (req, res) => {
    let { reimToUpdate, amount, description, status, type } = req.body;
    if (!reimToUpdate || isNaN(reimToUpdate) || reimToUpdate < 1) {
      res
        .status(400)
        .send(
          `You need to provide the reimbursement id for the reimbursement you want to update.  This can only be a positive number.`
        );
    } else if (!amount && !description && !status && !type) {
      res.status(400).send(`You haven't provided any information to update.`);
    } else if (
      (type && isNaN(type)) ||
      (type && type < 1) ||
      (type && type > 4)
    ) {
      res
        .status(400)
        .send(
          `You must pass valid number as type.  1 = Lodging, 2 = Travel, 3 = Food, or 4 = Other.`
        );
    } else if (
      (status && isNaN(status)) ||
      (status && status < 1) ||
      (status && status > 3)
    ) {
      res
        .status(400)
        .send(
          `You must pass valid number as status ID.  1 = Pending, 2 = Approved, 3 = Denied`
        );
    } else if ((amount && isNaN(amount)) || (amount && amount < 0.01)) {
      res.status(400).send(`The amount to update must be an amount above 0.01`);
    } else if (
      (description && typeof description !== 'string') ||
      (description && description === '')
    ) {
      res
        .status(400)
        .send(`The description may only be updated to a string of text.s`);
    } else {
      const toUpdateObj: any = { reimToUpdate };
      if (amount) toUpdateObj.amount = amount;
      if (description) toUpdateObj.description = description;
      if (status) toUpdateObj.status = status;
      if (type) toUpdateObj.type = type;
      try {
        if (status) {
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
        res.status(400).send(e.message);
      }
    }
  }
);
/////////////@ '/reimbursements' PATCH/////////////////////////
/////////////////////END///////////////////////////////////////

export default router;
