var http = require('http');
var fs = require('fs');

http.createServer(function (req, res) {

    if(req.url==="/html" && req.method === "GET")
    {
        let html = fs.readFileSync('./index.html');
        res.writeHead(200, {'Content-Type' : 'text/html; charset=utf-8'});
        res.end(html);
    }
    else
    {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Page not found");
    }

}).listen(5000);

console.log('Server running at http://localhost:5000/html');