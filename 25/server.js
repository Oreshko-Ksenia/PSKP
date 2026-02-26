const express = require('express');
const { JSONRPCServer } = require('json-rpc-2.0');

const server = new JSONRPCServer();
const app = express();

app.use(express.json());

server.addMethod('sum', (params) => {
    if (!Array.isArray(params) || params.length === 0) {
        throw new Error('Параметры должны быть предоставлены в виде массива');
    }
    if (!params.every(n => typeof n === 'number')) {
        throw new Error('Все параметры должны быть числами');
    }
    return params.reduce((acc, curr) => acc + curr, 0);
});

server.addMethod('mul', (params) => {
    if (!Array.isArray(params) || params.length === 0) {
        throw new Error('Параметры должны быть предоставлены в виде массива');
    }
    if (!params.every(n => typeof n === 'number')) {
        throw new Error('Все параметры должны быть числами');
    }
    return params.reduce((acc, curr) => acc * curr, 1);
});

server.addMethod('div', ([x, y]) => {
    if (typeof x !== 'number' || typeof y !== 'number') {
        throw new Error('Оба параметра должны быть числами');
    }
    if (y === 0) {
        throw new Error('Деление на ноль недопустимо');
    }
    return x / y;
});

server.addMethod('proc', ([x, y]) => {
    if (typeof x !== 'number' || typeof y !== 'number') {
        throw new Error('Оба параметра должны быть числами');
    }
    if (y === 0) {
        throw new Error('Деление на ноль недопустимо');
    }
    return (x / y) * 100;
});

app.post('/api', async (req, res) => {
    const jsonRPCRequest = req.body;
    const result = await server.receive(jsonRPCRequest);
    
    if (result) {
        res.json(result);
    } else {
        res.sendStatus(204);
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`JSON-RPC сервер запущен на http://localhost:${PORT}/api`);
}); 