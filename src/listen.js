/**
 * 监听端口
 * http和https
 **/

var http = require('http');
var https = require('https');
var net = require('net');
var sni = require('./sni');
var fs = require('fs');

var options = {
    key: fs.readFileSync(__dirname + '/../assert/cakey.pem'),
    cert: fs.readFileSync(__dirname + '/../assert/cacert.pem')
};

module.exports = function (port, callback) {

    var httpServer = http.createServer(callback);
    let { key, cert } = options,
        cxnEstablished = new Buffer(`HTTP/1.1 200 Connection Established\r\n\r\n`, 'ascii');

    let httpsServer = https.createServer({
        key,
        cert,
        SNICallback: sni(key, cert),
    }, (fromClient, toClient) => {
        // https端的响应
        console.log('in https server');
        let shp = 'https://' + fromClient.headers.host
            , fullUrl = shp + fromClient.url
            , addr = httpServer.address() // http port
        let toServer = http.request({
            host: 'localhost',
            port: addr.port,
            method: fromClient.method,
            path: fullUrl,
            headers: fromClient.headers,
        }, fromServer => {
            console.log('in https server response')
            toClient.writeHead(fromServer.statusCode, fromServer.headers)
            fromServer.pipe(toClient)
        })
        fromClient.pipe(toServer)
    });


    httpServer.on('connect', (request, clientSocket, head) => {
        console.log('on http connect： step 1');
        console.log(head);
        let addr = httpsServer.address()
        // 连接https
        let serverSocket = net.connect(addr.port, addr.address, () => {
            // serverSocket http和https之间的通道
            // clientSocket http和client之间的通道
            console.log('on http net.connect step 2');
            clientSocket.write(cxnEstablished)
            serverSocket.write(head)
            clientSocket
                .pipe(serverSocket)
                .pipe(clientSocket)
        })
    });

    httpsServer.listen(0);
    httpServer.listen(port);
};
