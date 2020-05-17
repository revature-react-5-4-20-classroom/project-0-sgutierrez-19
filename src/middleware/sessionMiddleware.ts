import session from 'express-session'; // Bring in session from pkg

const sessionConfig = {
  secret: 'mySecretIs',
  cookie: { secure: false },
  resave: false,
  saveUninitialized: false,
};
// Now that we have some configuration, we past it through a function
// that produces the 'session' middleware we're going to use.
export const sessionMiddleware = session(sessionConfig);
