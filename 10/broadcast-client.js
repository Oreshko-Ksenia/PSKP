const WebSocket = require('ws');

let ws;

function startWS() {
    ws = new WebSocket('ws://localhost:4000');

    ws.on('open', () => {
        console.log('WebSocket connection opened');
        sendMessages();
    });

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
    });
}

function sendMessages() {
    const interval = setInterval(() => {
        ws.send('10-03a-client');
    }, 3000);
}

startWS();
