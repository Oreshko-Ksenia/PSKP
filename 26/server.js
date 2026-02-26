const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        fs.readFile('task2.html', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading HTML file');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else if (req.url === '/functions.wasm') {
        fs.readFile('functions.wasm', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading WASM file');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/wasm' });
            res.end(data);
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
}); 