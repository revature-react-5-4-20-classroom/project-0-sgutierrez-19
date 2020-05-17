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

  if (isNaN(id)) {
    res.status(400).send(`You need to include an valid number-ID`);
  } else if (currRole !== 'Finance Manager' && currUser !== id) {
    res.status(401).send(`You can only view your own user information`);
  } else {
    try {
      res.json(await getUserById(id));
    } catch (e) {
      res.status(400).send(e);
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
    if (isNaN(author)) {
      res
        .status(400)
        .send(
          `You need to include a valid user ID number in your search parameters.`
        );
    }
    if (currRole !== 'Finance Manager' && currUser !== author) {
      res
        .status(400)
        .send(`You can only view reimbursements that you have created.`);
    } else {
      res.json(await findReimById(author));
    }
  }
);

// @ '/reimbursements' POST
router.post('/reimbursements', async (req: Request, res: Response) => {
  let { amount, description, type } = req.body;
  if (!amount || !description || !type) {
    res
      .status(400)
      .send(
        `Unable to create reimbursement request due to missing required fields.`
      );
  } else if (
    type !== 'Lodging' &&
    type !== 'Travel' &&
    type !== 'Food' &&
    type !== 'Other'
  ) {
    res
      .status(400)
      .send(
        `The reimbursment type is case-sensitive and can only be: Lodging, Travel, Food, or Other`
      );
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
          `Your reimbursement request was created successfully under the id# ${newReim.id}.`
        );
    } catch (e) {
      res.status(400).send(e);
    }
  }
});

export default router;
