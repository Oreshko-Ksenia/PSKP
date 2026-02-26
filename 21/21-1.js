const express = require('express');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const {getCredentials, verifyPassword} = require('./server')
const session = require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: 'longsecretcode'
});


const app = express();
app.use(session);
app.use(passport.initialize());

passport.use(new BasicStrategy((login, password, done) => {
    let rc = null;
    let credentials = getCredentials(login);
    if (!credentials) {
        rc = done(null, false, { message: 'Incorrect login' });
    }
    else if (!verifyPassword(credentials.password, password)) {
        rc = done(null, false, { message: 'Incorrect password' });
    }
    else
        rc = done(null, login);
    return rc;
}));

app.get('/', (req, res) => res.redirect('/login'));

app.get('/login',
  (req, res, next) => {
    if (req.session.logout) {
      req.session.logout = false;
      delete req.headers['authorization'];
    }
    next();
  },
  passport.authenticate('basic', { session: false }),
  (req, res) => {
    res.redirect('/resource');
  }
);

app.get('/logout', (req, res) => {
  req.session.logout = true;
  res.redirect('/login');
});

app.get('/resource', (req, res) => {
  if (req.headers['authorization']) {
    res.send('RESOURCE');
  } else {
    res.redirect('/login');
  }
});

app.use((req, res) => {
    res.status(404).send('404: Not Found');
});

app.listen(process.env.PORT || 3000, () => console.log(`Server running at http://localhost:3000\n`));