const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
    html: 'text/html',
    css: 'text/css',
    js: 'text/javascript',
    png: 'image/png',
    docx: 'application/msword',
    json: 'application/json',
    xml: 'application/xml',
    mp4: 'video/mp4'
};

function handleStaticRequest(staticDir, req, res) {
    if (req.method !== 'GET') {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
        return;
    }

    const filePath = path.join(staticDir, req.url.replace(/^\/+/, ''));
    const ext = path.extname(filePath).slice(1);

    if (!MIME_TYPES[ext]) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error(`File not found: ${filePath}`); 
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] });
            res.end(data);
        }
    });
}

module.exports = handleStaticRequest;
