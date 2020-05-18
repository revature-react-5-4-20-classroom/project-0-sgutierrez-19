import express, { Router, Request, Response } from 'express';
import { getUserById, createReim, findReimById } from '../repository/employee';
import { Reimbursement } from '../models/reimbursement';
import { isAuthenticated } from '../middleware/authenticate';

const router: Router = express.Router();

router.use(isAuthenticated([`Finance Manager`, `Employee`, `Administrator`]));

// @ '/users/:id' GET
router.get('/users/:id', async function (req: Request, res: Response) {
  let id: number = +req.params.id;
  // Exclamation marks tell typescript that it's okay it's currently
  // null/undefined and will have value at runtime.
  let currUser: number = req.session! && +req.session!.user.id;
  let currRole: string = req.session && req.session.user.role;

  if (!id || isNaN(id) || id < 1) {
    res.status(400).send(`The user id must be a positive numeric value.`);
  } else if (currRole !== 'Finance Manager' && currUser !== id) {
    res.status(403).send(`You can only view your own user information`);
  } else {
    try {
      res.json(await getUserById(id));
    } catch (e) {
      res.status(400).send(e.message);
    }
  }
});

// @ '/reimbursements/author/userId/:userId' GET
router.get(
  '/reimbursements/author/userId/:userId',
  async (req: Request, res: Response) => {
    let currUser: number = req.session! && +req.session!.user.id;
    let currRole: string = req.session && req.session.user.role;
    let author: number = +req.params.userId;
    if (!author || isNaN(author) || author < 1) {
      res.status(400).send(`The User ID must be a positive numeric value.`);
    } else if (currRole !== 'Finance Manager' && currUser !== author) {
      res
        .status(403)
        .send(`Only Finance Managers may view others' reimbursement requests.`);
    } else {
      try {
        res.json(await findReimById(author));
      } catch (e) {
        res.status(400).send(e.message);
      }
    }
  }
);

// @ '/reimbursements' POST
router.post('/reimbursements', async (req: Request, res: Response) => {
  let { amount, description, type } = req.body;
  if (
    (amount && !description && !type) ||
    (description && !amount && !type) ||
    (type && !amount && !description)
  ) {
    res
      .status(400)
      .send(
        `You must provide an amount, description, and type in order to create a reimbursement request.`
      );
  } else if (!amount || isNaN(amount) || amount < 0.01) {
    res
      .status(400)
      .send(`The reimbursement amount must be a number greater than $0.01.`);
  } else if (
    !type ||
    (type !== 'Lodging' &&
      type !== 'Travel' &&
      type !== 'Food' &&
      type !== 'Other')
  ) {
    res
      .status(400)
      .send(
        `You must provide a case-sensitive reimbursement type that must be: Lodging, Travel, Food, or Other`
      );
  } else if (
    !description ||
    typeof description !== 'string' ||
    description === ''
  ) {
    res
      .status(400)
      .send(`You need to provide a description for your reimbursement.`);
  } else {
    let author: number = req.session! && +req.session!.user.id;
    try {
      // get current date:
      let today: Date = new Date();
      let dateSubmitted: string = `${today.getFullYear()}-${
        today.getMonth() + 1
      }-${today.getDay()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
      let status: string = 'Pending';
      let newReim: Reimbursement = await createReim(
        new Reimbursement(
          author,
          amount,
          dateSubmitted,
          description,
          status,
          type
        )
      );
      res
        .status(201)
        .send(
          `Your reimbursement request was created successfully.  For your records, your reimbursement ID is ${newReim.id}.`
        );
    } catch (e) {
      res.status(400).send(e.message);
    }
  }
});

export default router;
