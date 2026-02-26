const http = require('http');
const data = require('./DB.js');
const fs = require('fs');
const url = require('url');

let db = new data.DB();
let statistics = {
    startTime: null,
    endTime: null,
    requestCount: 0,
    commitCount: 0
};
let commitInterval, statsTimeout, stopTimeout;

db.on('GET', (req, res) => {
    console.log('DB.GET');
    statistics.requestCount++;
    res.setHeader('Content-Type', 'application/json');
    db.select()
        .then(elem => {
            res.end(JSON.stringify(elem));
        });
});

db.on('POST', (req, res) => {
    console.log('DB.POST');
    statistics.requestCount++;
    req.on('data', data => {
        let r = JSON.parse(data);
        if (r.BDay == -1) {
            res.setHeader('Content-Type', 'application/json');
            db.select(r)
                .then(elem => {
                    res.end(JSON.stringify(elem));
                });
        } else {
            db.insert(r);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(r));
        }
    });
});

db.on('PUT', (req, res) => {
    console.log('DB.PUT');
    statistics.requestCount++;
    req.on('data', data => {
        let r = JSON.parse(data);
        db.update(r);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(r));
    });
});

db.on('DELETE', (req, res) => {
    console.log('DB.DELETE');
    statistics.requestCount++;
    req.on('data', data => {
        let r = JSON.parse(data);
        db.delete(r);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(r));
    });
});

db.on('COMMIT', () => {
    console.log('DB.COMMIT');
    statistics.commitCount++;
});

function commit() {
    db.emit('COMMIT');
}

function startCommit(interval) {
    stopCommit();
    commitInterval = setInterval(commit, interval * 1000);
    commitInterval.unref();
}

function stopCommit() {
    if (commitInterval) {
        clearInterval(commitInterval);
        commitInterval = null;
    }
}

function startStatistics(duration) {
    statistics.startTime = new Date().toISOString();
    statistics.requestCount = 0;
    statistics.commitCount = 0;
    statsTimeout = setTimeout(() => {
        statistics.endTime = new Date().toISOString();
    }, duration * 1000);
    statsTimeout.unref();
}

function stopStatistics() {
    if (statsTimeout) {
        clearTimeout(statsTimeout);
        statistics.endTime = new Date().toISOString();
    }
}

function stopServerAfter(seconds) {
    if (stopTimeout) clearTimeout(stopTimeout);
    if (seconds === undefined) return;

    stopTimeout = setTimeout(() => {
        console.log('Server stopping...');
        process.exit(0);
    }, seconds * 1000);
    stopTimeout.unref();
}

http.createServer(function (req, res) {
    if (url.parse(req.url).pathname === '/') {
        fs.readFile('index.html', (err, html) => {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
        });
    } else if (url.parse(req.url).pathname === '/api/db') {
        db.emit(req.method, req, res);
    } else if (url.parse(req.url).pathname === '/api/ss') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(statistics));
    }

}).listen(5000, "127.0.0.1", function () {
    console.log("Сервер начал прослушивание запросов на порту 5000");
});

process.stdin.on('data', (data) => {
    const command = data.toString().trim();
    const [cmd, arg] = command.split(' ');

    switch (cmd) {
        case 'sd':
            stopServerAfter(arg ? parseInt(arg) : undefined);
            break;
        case 'sc':
            arg ? startCommit(parseInt(arg)) : stopCommit();
            break;
        case 'ss':
            arg ? startStatistics(parseInt(arg)) : stopStatistics();
            break;
        default:
            console.log(`Unknown command: ${cmd}`);
    }
});
