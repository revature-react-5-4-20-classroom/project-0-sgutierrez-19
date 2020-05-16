import express, { Router } from 'express';
import { getUserById, createReim } from '../repository/employee';
import { Reimbursement } from '../models/reimbursement';
import { isAuthenticated } from '../middleware/authenticate';

const router: Router = express.Router();

router.use(isAuthenticated([`Finance Manager`, `Employee`, `Administrator`]));

// @ '/users/:id' GET
router.get('/users/:id', async function (req, res) {
  let id: number = +req.params.id;
  let userId: number = req.session && req.session.user.id;
  if (isNaN(id)) {
    res.status(400).send(`You need to include an valid number-ID`);
  } else {
    try {
      res.json(await getUserById(id, userId));
    } catch (e) {
      res.status(400).send(`${e}`);
    }
  }
});

// // @ '/reimbursements/author/userId/:userId' GET
// // challenge: '/reimbursements/author/userId/:userId/date-submitted?start=:startDate&end=
// // :endDate'
// router.get('/reimbursements/authoer/userId/:userId', function (req, res) {
//   // if id === req.params.userId - pass else -> 401
//   // if User.role === "finance-manager", can get anyone
// });

// @ '/reimbursements' POST
router.post('/reimbursements', async function (req, res) {
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
    let author = req.session && req.session.user.id;
    try {
      // get current date:
      let today = new Date();
      let dateSubmitted = `${today.getFullYear()}-${
        today.getMonth() + 1
      }-${today.getDay()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
      let status = 'Pending';
      let newReim = await createReim(
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
