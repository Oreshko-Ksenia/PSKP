const express = require('express');
const fs = require('fs');
const path = require('path');
const { engine } = require('express-handlebars');
const app = express();
const port = 3000;

const contactsPath = path.join(__dirname, 'data', 'contacts.json');

function getContacts() {
    const data = fs.readFileSync(contactsPath);
    return JSON.parse(data);
}

function saveContacts(contacts) {
    fs.writeFileSync(contactsPath, JSON.stringify(contacts, null, 2));
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine('hbs', engine({
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('index', {
        layout: 'main-layout'
    });
});

app.get('/api/contacts', (req, res) => {
    res.json(getContacts());
});

app.post('/api/contacts', (req, res) => {
    const newContact = req.body;
    const contacts = getContacts();
    contacts.push(newContact);
    saveContacts(contacts);
    res.json({ success: true });
});

app.put('/api/contacts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const updated = req.body;
    const contacts = getContacts();
    contacts[id] = updated;
    saveContacts(contacts);
    res.json({ success: true });
});

app.delete('/api/contacts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const contacts = getContacts();
    contacts.splice(id, 1);
    saveContacts(contacts);
    res.json({ success: true });
});

function renderTemplate(res, templateName, data = {}) {
    res.render(templateName, {
        layout: false,
        ...data
    });
}

app.get('/templates/contacts-list', (req, res) => {
    const contacts = getContacts();
    renderTemplate(res, 'templates/contacts-list', { contacts });
});

app.get('/templates/add-contact', (req, res) => {
    renderTemplate(res, 'templates/add-contact');
});

app.get('/templates/edit-contact/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const contacts = getContacts();
    const contact = contacts[id];
    renderTemplate(res, 'templates/edit-contact', { contact, id });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});