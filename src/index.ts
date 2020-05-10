import express from 'express';
import { Application, Request, Response } from 'express';
import bodyparser from 'body-parser';

const app: Application = express();
const PORT: number = 3002;

app.use(bodyparser.json());

// Bring in api routes
app.use('/api/employee', require('./routes/employee-routes'));
app.use('/api/manager', require('./routes/manager-routes'));
app.use('/api/admin', require('./routes/admin-routes'));
app.use('/api/authentication', require('./routes/authentication'));

app.listen(PORT, () => {
  console.log(`Server is currently running on localhost:${PORT}`);
});
