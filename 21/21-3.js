const express = require('express');
const session = require('express-session');
const { getCredentials, verifyPassword } = require('./server');

const app = express();

app.use(session({
    secret: 'longsecretcode',
    resave: false,
    saveUninitialized: false
}));

app.use(express.urlencoded({ extended: true }));

function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.send(`
        <h2>Вход</h2>
        <form method="POST" action="/login">
            Логин: <input type="text" name="username"><br>
            Пароль: <input type="password" name="password"><br>
            <button type="submit">Войти</button>
        </form>
    `);
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Login and password required');
    }

    const credentials = getCredentials(username);

    if (!credentials) {
        return res.status(401).send('Incorrect login or password');
    }

    if (!verifyPassword(credentials.password, password)) {
        return res.status(401).send('Incorrect login or password');
    }

    req.session.user = username;
    res.redirect('/resource');
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

app.get('/resource', ensureAuthenticated, (req, res) => {
    res.send('RESOURCE');
});

app.use((req, res) => {
    res.status(404).send('404: Not Found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});