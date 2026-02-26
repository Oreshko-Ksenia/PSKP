const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');

async function main() {
    try {
        const resInit = await axios.get('http://localhost:3000');
        const { p, g, serverPublicKey, serverPrivateKey } = resInit.data;

        const pBigInt = BigInt(p);
        const gBigInt = BigInt(g);
        const serverPubKeyBigInt = BigInt(serverPublicKey);

        const clientPrivateKey = BigInt(Math.floor(Math.random() * 100));
        const clientPublicKey = powMod(gBigInt, clientPrivateKey, pBigInt);

        const sharedKey = powMod(serverPubKeyBigInt, clientPrivateKey, pBigInt);
        const keyBuffer = hashToLength(sharedKey.toString(), 32);

        const resFile = await axios.get(`http://localhost:3000/resource?clientPublicKey=${clientPublicKey}&serverPrivateKey=${serverPrivateKey}&p=${p}`);
        const encryptedText = resFile.data;

        const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, Buffer.alloc(16, 0));
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        fs.writeFileSync('student.txt', decrypted);
        console.log('Файл успешно записан:', decrypted);
    } catch (e) {
        console.error('Ошибка:', e.message);
    }
}

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

function hashToLength(str, len) {
    const hash = crypto.createHash('sha256').update(str).digest();
    return hash.slice(0, len);
}

main();