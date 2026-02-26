const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const httpServer = http.createServer(app);
const wsServer = new WebSocket.Server({ port: 4000 });

let messageCount = 0;

app.get('/start', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>WebSocket Server</title>
                <script>
                    let ws;
                    let messageIndex = 0;

                    function startWS() {
                        ws = new WebSocket('ws://localhost:4000');
                        ws.onopen = () => {
                            console.log('WebSocket connection opened');
                            sendMessages();
                        };
                        ws.onmessage = (event) => {
                            const messagesDiv = document.getElementById('messages');
                            messagesDiv.innerHTML += '<p>' + event.data + '</p>';
                        };
                    }

                    function sendMessages() {
                        const interval = setInterval(() => {
                            if (messageIndex < 8) {
                                messageIndex++;
                                ws.send('10-01-client: ' + messageIndex);
                            } else {
                                clearInterval(interval);
                                ws.close();
                            }
                        }, 3000);
                    }

                    window.onload = () => {
                        document.getElementById('startBtn').onclick = startWS;
                    };
                </script>
            </head>
            <body>
                <h1>WebSocket Server</h1>
                <button id="startBtn">Start WebSocket</button>
                <div id="messages"></div>
            </body>
        </html>
    `);
});

app.use((req, res) => {
    res.sendStatus(400);
});

wsServer.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
        if (typeof message === 'string') {
            const messageParts = message.split(': ');
            if (messageParts.length >= 2) {
                const lastMessageNumber = messageParts[1];
                messageCount++;
                const serverMessage = `10-01-server: ${lastMessageNumber}->${messageCount}`;
                ws.send(serverMessage);
            } else {
                console.log('Invalid message format');
            }
        } else {
            console.log(`Received message type is: ${typeof message}`);
        }
    });

    const interval = setInterval(() => {
        const serverMessage = `10-01-server: ${messageCount}->${messageCount + 1}`;
        ws.send(serverMessage);
        messageCount++;
    }, 5000);

    ws.on('close', () => {
        console.log('Client disconnected');
        clearInterval(interval);
    });
});

httpServer.listen(3000, () => {
    console.log('HTTP server is running on port 3000');
});
