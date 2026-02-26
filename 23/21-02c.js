const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

(async () => {
    try {
        const pubRes = await axios.get('http://localhost:3001/public-key', { responseType: 'stream' });
        const pubWriter = fs.createWriteStream('server_public.pem');
        pubRes.data.pipe(pubWriter);

        await new Promise(resolve => pubWriter.on('finish', resolve));

        const fileRes = await axios.get('http://localhost:3001/student.txt', {
            responseType: 'stream'
        });

        const signature = fileRes.headers['x-digital-signature'];

        if (!signature) {
            console.error('Ошибка: подпись не найдена в заголовках.');
            return;
        }

        const filePath = path.join(__dirname, 'downloaded_student.txt');
        const writer = fs.createWriteStream(filePath);
        fileRes.data.pipe(writer);

        await new Promise(resolve => writer.on('finish', resolve));

        const fileContent = fs.readFileSync(filePath, 'utf8');

        const verify = crypto.createVerify('RSA-SHA256');
        verify.update(fileContent);
        const isValid = verify.verify(
            fs.readFileSync('server_public.pem'),
            signature,
            'hex'
        );

        console.log('Подпись действительна:', isValid ? 'Correct' : 'Incorrect');
    } catch (e) {
        console.error('Ошибка:', e.message);
    }
})();