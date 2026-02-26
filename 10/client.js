const WebSocket = require('ws');

let ws;
let messageIndex = 0;

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
        if (messageIndex < 8) {
            messageIndex++;
            ws.send('10-02-client: ' + messageIndex);
        } else {
            clearInterval(interval);
            ws.close();
        }
    }, 3000);
}

startWS();
