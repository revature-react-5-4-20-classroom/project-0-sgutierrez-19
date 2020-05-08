import express from 'express';
import { Application, Request, Response } from 'express';
import bodyparser from 'body-parser';

const app: Application = express();
const port: number = 3002;

app.use(bodyparser.json());

app.listen(port, () => {
  console.log(`Server is currently running on port: ${port}`);
});
