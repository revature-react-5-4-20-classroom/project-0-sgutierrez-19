// We can use the same CORS filter in multipe products.  Just make sure to change it in
// production because CORS is good for you.
import { Request, Response, NextFunction } from 'express';

export function corsFilter(req: Request, res: Response, next: NextFunction) {
  res.header('Access-Control-Allow-Origin', `${req.headers.origin}`); // don't do this in prod server!!!!
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
}
