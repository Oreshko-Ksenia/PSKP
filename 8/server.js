const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const formidable = require('formidable');

// Конфигурации
let keepAliveTimeout = 5000; // Значение KeepAliveTimeout по умолчанию

// Функция для отправки ответов
const sendResponse = (res, statusCode, data, headers = {}) => {
    res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8', ...headers });
    res.end(data);
};

// Создание HTTP сервера
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // Маршруты
    if (pathname === '/connection') {
        if ('set' in query) {
            const newTimeout = parseInt(query.set, 10);
            if (!isNaN(newTimeout) && newTimeout > 0) {
                keepAliveTimeout = newTimeout;
                server.keepAliveTimeout = keepAliveTimeout;
                sendResponse(res, 200, `Установлено новое значение KeepAliveTimeout=${keepAliveTimeout}`);
            } else {
                sendResponse(res, 400, 'Ошибка: параметр set должен быть положительным числом.');
            }
        } else {
            sendResponse(res, 200, `Текущее значение KeepAliveTimeout=${keepAliveTimeout}`);
        }
    } else if (pathname === '/headers') {
        const responseHeaders = { 'Content-Type': 'application/json', 'X-Custom-Header': 'CustomHeaderValue' };
        res.writeHead(200, responseHeaders);
        res.end(JSON.stringify({ requestHeaders: req.headers, responseHeaders }, null, 2));
    } else if (pathname === '/parameter') {
        const x = parseFloat(query.x);
        const y = parseFloat(query.y);
        if (!isNaN(x) && !isNaN(y)) {
            const result = {
                sum: x + y,
                difference: x - y,
                product: x * y,
                quotient: x / y
            };
            sendResponse(res, 200, JSON.stringify(result, null, 2), { 'Content-Type': 'application/json' });
        } else {
            sendResponse(res, 400, 'Ошибка: параметры x и y должны быть числами.');
        }
    } else if (pathname.startsWith('/parameter/')) {
        const params = pathname.split('/').slice(2).map(Number);
        if (params.length === 2 && params.every(n => !isNaN(n))) {
            const [x, y] = params;
            const result = {
                sum: x + y,
                difference: x - y,
                product: x * y,
                quotient: x / y
            };
            sendResponse(res, 200, JSON.stringify(result, null, 2), { 'Content-Type': 'application/json' });
        } else {
            sendResponse(res, 400, 'Ошибка: параметры в URI должны быть числами.');
        }
    } else if (pathname === '/close') {
        sendResponse(res, 200, 'Сервер будет остановлен через 10 секунд.');
        setTimeout(() => {
            server.close(() => console.log('Сервер остановлен.'));
        }, 10000);
    } else if (pathname === '/socket') {
        const socketInfo = {
            clientAddress: req.socket.remoteAddress,
            clientPort: req.socket.remotePort,
            serverAddress: req.socket.localAddress,
            serverPort: req.socket.localPort
        };
        sendResponse(res, 200, JSON.stringify(socketInfo, null, 2), { 'Content-Type': 'application/json' });
    } else if (pathname === '/req-data') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            sendResponse(res, 200, `Получены данные: ${body}`);
        });
    } else if (pathname === '/resp-status') {
        const code = parseInt(query.code, 10);
        const message = query.mess || '';
        if (!isNaN(code) && code >= 100 && code <= 599) {
            sendResponse(res, code, message);
        } else {
            sendResponse(res, 400, 'Ошибка: код статуса должен быть числом от 100 до 599.');
        }
    } else if (pathname === '/formparameter' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            const formData = querystring.parse(body);
            sendResponse(res, 200, JSON.stringify(formData, null, 2), { 'Content-Type': 'application/json' });
        });
    } else if (pathname === '/json' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const requestData = JSON.parse(body);
                const responseData = {
                    x_y: requestData.x + requestData.y,
                    concatenation: requestData.s + JSON.stringify(requestData.o),
                    length_m: requestData.m.length
                };
                sendResponse(res, 200, JSON.stringify(responseData, null, 2), { 'Content-Type': 'application/json' });
            } catch (err) {
                sendResponse(res, 400, 'Ошибка: некорректный JSON.');
            }
        });
    } else if (pathname === '/files') {
        const staticPath = path.join(__dirname, 'static');
        fs.readdir(staticPath, (err, files) => {
            if (err) {
                sendResponse(res, 500, 'Ошибка при чтении директории.');
            } else {
                res.setHeader('X-static-files-count', files.length);
                sendResponse(res, 200, `Количество файлов: ${files.length}`);
            }
        });
    } else if (pathname.startsWith('/files/')) {
        const filename = pathname.split('/files/')[1];
        const filePath = path.join(__dirname, 'static', filename);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                sendResponse(res, 404, 'Файл не найден.');
            } else {
                sendResponse(res, 200, data);
            }
        });
    } else if (pathname === '/upload' && req.method === 'GET') {
        const formHtml = `
            <form action="/upload" method="post" enctype="multipart/form-data">
                <input type="file" name="file" />
                <button type="submit">Загрузить</button>
            </form>
        `;
        sendResponse(res, 200, formHtml, { 'Content-Type': 'text/html' });
    } else if (pathname === '/upload' && req.method === 'POST') {
        const form = new formidable.IncomingForm();
        const uploadDir = path.join(__dirname, 'static'); // Директория для сохранения файлов
        form.uploadDir = uploadDir; // Устанавливаем директорию загрузки
        form.keepExtensions = true; // Сохраняем расширения файлов

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error('Ошибка загрузки файла:', err);
                sendResponse(res, 500, 'Ошибка при загрузке файла.');
                return;
            }

            const uploadedFile = files.file;
            if (uploadedFile) {
                sendResponse(res, 200, `Файл успешно загружен: ${path.basename(uploadedFile.filepath)}`);
            } else {
                sendResponse(res, 400, 'Файл не был загружен.');
            }
        });
    } else {
        sendResponse(res, 404, 'Ресурс не найден.');
    }
});

// Установка KeepAliveTimeout
server.keepAliveTimeout = keepAliveTimeout;

// Запуск сервера
server.listen(8080, () => {
    console.log('Сервер запущен на порту 8080');
});
