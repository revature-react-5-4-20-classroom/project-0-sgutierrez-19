import express from 'express';
import { Application } from 'express';
import bodyparser from 'body-parser';
import { sessionMiddleware } from './middleware/sessionMiddleware';
import authentication from './routes/authentication';
import employees from './routes/employee-routes';

const app: Application = express();
const PORT: number = 3003;

app.use(bodyparser.json());
app.use(sessionMiddleware);

// Bring in api routes
app.use('/', authentication);
// app.use('/api/admin', require('../routes/admin-routes'));
app.use('/', employees);
// app.use('/api/manager', require('../routes/manager-routes'));

app.listen(PORT, () => {
  console.log(`Server is currently running on localhost:${PORT}`);
});
