var fs = require('fs');
const http = require("http");

http.createServer(function (req, res){
    const fname = './pic.png';
    let png = null;

    if(req.url === "/png" && req.method === "GET")
    {
        fs.stat(fname, (err, stat)=>{
            if(err){console.log('error: ', err);}
            else {
                png = fs.readFileSync(fname);
                res.writeHead(200, {'Content-Type' : 'image/png', 'Content-length':stat.size});
                res.end(png, 'binary');
            }
        })
    }
    else
    {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Page not found");
    }

}).listen(5000);

console.log('Server running at http://localhost:5000/png');