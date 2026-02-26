const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const app = express();

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
});

fs.writeFileSync(path.join(__dirname, 'public.pem'), publicKey.export({ type: 'pkcs1', format: 'pem' }));

const studentData = 'Орешко Ксения Сергеевна';
const filePath = path.join(__dirname, 'student.txt');

fs.writeFileSync(filePath, studentData);

function signFileContent(content) {
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(content);
    return sign.sign(privateKey, 'hex');
}

app.get('/public-key', (req, res) => {
    res.sendFile(path.join(__dirname, 'public.pem'));
});

app.get('/student.txt', (req, res) => {
    const signature = signFileContent(studentData);

    res.header('X-Digital-Signature', signature);
    res.sendFile(filePath);
});

app.listen(3001, () => console.log('Server running on port 3001'));