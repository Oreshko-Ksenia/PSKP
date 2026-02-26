const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const httpServer = http.createServer(app);
const wsServer = new WebSocket.Server({ server: httpServer });

const clients = new Set();
let messageCount = 0;

wsServer.on('connection', (ws) => {
    clients.add(ws);
    console.log('New client connected');

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
        messageCount++;
        broadcast(`10-03-server: ${message}->${messageCount}`);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });
});

function broadcast(message) {
    for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    }
}

httpServer.listen(4000, () => {
    console.log('Broadcast WebSocket server is running on port 4000');
});
