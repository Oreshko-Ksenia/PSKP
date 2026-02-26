const express = require('express');
const crypto = require('crypto');
const app = express();

app.get('/', (req, res) => {
    const p = 23n; 
    const g = 5n;

    const serverPrivateKey = BigInt(Math.floor(Math.random() * 100));
    const serverPublicKey = powMod(g, serverPrivateKey, p);

    res.json({
        p: p.toString(),
        g: g.toString(),
        serverPublicKey: serverPublicKey.toString(),
        serverPrivateKey: serverPrivateKey.toString()
    });
});

function powMod(base, exponent, modulus) {
    let result = 1n;
    base = base % modulus;
    while (exponent > 0n) {
        if (exponent % 2n === 1n)
            result = (result * base) % modulus;
        exponent = exponent / 2n;
        base = (base * base) % modulus;
    }
    return result;
}

app.get('/resource', (req, res) => {
    const { clientPublicKey, serverPrivateKey } = req.query;
    const p = BigInt(req.query.p);

    if (!clientPublicKey || !serverPrivateKey) return res.status(409).send("Invalid DH parameters");

    const sharedKey = powMod(BigInt(clientPublicKey), BigInt(serverPrivateKey), p);
    const keyBuffer = hashToLength(sharedKey.toString(), 32); 

    const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, Buffer.alloc(16, 0)); 
    let encrypted = cipher.update('Орешко Ксения Сергеевна', 'utf8', 'hex');
    encrypted += cipher.final('hex');

    res.send(encrypted);
});

function hashToLength(str, len) {
    const hash = crypto.createHash('sha256').update(str).digest();
    return hash.slice(0, len);
}

app.listen(3000, () => console.log('Server running on port 3000'));