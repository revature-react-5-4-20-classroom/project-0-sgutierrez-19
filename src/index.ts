import express from 'express';
import { Application } from 'express';
import bodyparser from 'body-parser';
import { sessionMiddleware } from './middleware/sessionMiddleware';
import authentication from './routes/authentication';
import employees from './routes/employee-routes';
import admin from './routes/admin-routes';
import managers from './routes/manager-routes';

const app: Application = express();
const PORT: number = 3003;

app.use(bodyparser.json());
app.use(sessionMiddleware);

// Bring in api routes
app.use('/', authentication);
app.use('/', employees);
app.use('/', admin);
app.use('/', managers);

app.listen(PORT, () => {
  console.log(`Server is currently running on localhost:${PORT}`);
});
