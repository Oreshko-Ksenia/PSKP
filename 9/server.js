const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({dest: 'uploads/'});

app.use(express.json());
app.use(bodyParser.text({ type: 'application/xml' }));

// Задание 1
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Задание 2
app.get('/calc', (req, res) => {
    const x = parseInt(req.query.x);
    const y = parseInt(req.query.y);
    const sum = x + y;
    res.send(`Sum of ${x} and ${y} is ${sum}`);
});

// Задание 3
app.post('/calc', (req, res) => {
    const { x, y, s } = req.body;
    if (s === 'sum') {
        res.send(`Sum of ${x} and ${y} is ${x + y}`);
    } else {
        res.send('Invalid operation');
    }
});

// Задание 4
app.post('/json', (req, res) => {
    const { x, y, operation } = req.body;
    let result;
    if (operation === 'multiply') {
        result = x * y;
    } else {
        result = 'Unknown operation';
    }
    res.json({ result });
});

// Задание 5
app.post('/xml', (req, res) => {
    xml2js.parseString(req.body, (err, result) => {
        if (err) return res.status(400).send('Invalid XML');
        const x = parseInt(result.request.x[0]);
        const y = parseInt(result.request.y[0]);
        const sum = x + y;

        const builder = new xml2js.Builder();
        const responseXml = builder.buildObject({ response: { result: sum } });

        res.set('Content-Type', 'application/xml');
        res.send(responseXml);
    });
});

// Задание 6 и 7
app.post('/upload', upload.single('file'), (req, res) => {
    const oldPath = req.file.path;
    const newPath = path.join(__dirname, 'uploads', req.file.originalname);

    fs.rename(oldPath, newPath, (err) => {
        if (err) {
            return res.status(500).send('Error processing the file');
        }
        res.send(`File successfully downloaded`);
    });
});


// Задание 8
app.get('/download', (req, res) => {
    const file = path.join(__dirname, 'MyFile.txt');
    res.download(file, 'downloadedFile.txt', (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error downloading the file');
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
