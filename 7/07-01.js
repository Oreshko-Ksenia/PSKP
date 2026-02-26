const http = require('http');
const path = require('path');
const handleStaticRequest = require('./m07-01');

const staticDir = path.join(__dirname, 'static');

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        req.url = '/07-01.html';
    }
    handleStaticRequest(staticDir, req, res);
});

server.listen(3000, () => {
    console.log('Server listening on http://localhost:3000');
});
