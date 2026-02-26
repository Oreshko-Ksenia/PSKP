const express = require('express');
const passport = require('passport');
const DigestStrategy = require('passport-http').DigestStrategy;
const {getCredentials} = require('./server')
const session = require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: 'longsecretcode'
});


const app = express();
app.use(session);
app.use(passport.initialize());

passport.use(new DigestStrategy({qop: 'auth'}, (user, done) => {
    let rc = null;
    let credentials = getCredentials(user);
    if (!credentials) {
        rc = done(null, false);
    } else
        rc = done(null, credentials.user, credentials.password);
    return rc;
}, (params, done) => {
    console.log('params: ', params);
    done(null, true);
}));

app.get('/', (req, res) => res.redirect('/login'));
app.get('/login', (req, res, next) => {
    if (req.session.logout) {
        req.session.logout = false;
        delete req.headers['authorization'];
    }
    next();
})
    .get('/login', passport.authenticate('digest', {session: false}),  (req, res) => {
        res.redirect('/resource');
    });

app.get('/logout', (req, res) => {
    req.session.logout = true;
    res.redirect('/login');
});

app.get('/resource', (req, res) => {
    if (req.headers['authorization'])
        res.send('RESOURCE');
    else
        res.redirect('/login');
});

app.use((req, res) => {
    res.status(404).send('404: Not Found');
});

app.listen(process.env.PORT || 3000, () => console.log(`Server running at http://localhost:3000\n`));