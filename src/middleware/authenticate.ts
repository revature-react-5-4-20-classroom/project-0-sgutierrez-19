import { Request, Response, NextFunction } from 'express';

export function isAuthenticated(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.user) {
      res.status(401).send(`Please log in first.`);
    } else {
      let allowed = false;
      for (let role of roles) {
        if (req.session.user.role == role) {
          allowed = true;
        }
      }
      if (allowed) {
        next();
      } else {
        res
          .status(403)
          .send(`Your role level does not authorize you to access this route.`);
      }
    }
  };
}
