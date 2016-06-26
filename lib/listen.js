'use strict';

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

module.exports = function (config, server, callback) {
    var port = 3000;
    if (typeof config == 'number') {
        port = config;
        config = { port: 3000 };
    }
    if (!config) {
        throw new Error('proxy.listen need ');
        return;
    }
    var httpServer = http.createServer(server);
    var key = options.key;
    var cert = options.cert;
    var cxnEstablished = new Buffer('HTTP/1.1 200 Connection Established\r\n\r\n', 'ascii');

    var httpsServer = https.createServer({
        key: key,
        cert: cert,
        SNICallback: sni(key, cert)
    }, function (fromClient, toClient) {
        // https端的响应
        var shp = 'https://' + fromClient.headers.host,
            fullUrl = shp + fromClient.url,
            addr = httpServer.address(); // http port
        var toServer = http.request({
            host: 'localhost',
            port: addr.port,
            method: fromClient.method,
            path: fullUrl,
            headers: fromClient.headers
        }, function (fromServer) {
            toClient.writeHead(fromServer.status, fromServer.headers);
            fromServer.pipe(toClient);
        });
        fromClient.pipe(toServer);
    });

    /**
     * 断开客户端和http服务器之间通道， 连接客户端和https服务器之间的通道
     **/
    httpServer.on('connect', function (request, clientSocket, head) {
        var addr = httpsServer.address();
        // 连接https
        var serverSocket = net.connect(addr.port, addr.address, function () {
            clientSocket.write(cxnEstablished);
            serverSocket.write(head);
            clientSocket.pipe(serverSocket).pipe(clientSocket);
        });
    });

    httpsServer.listen(0, function (err) {
        if (err) {
            console.log('koa-proxy https err: ', err);
        }
    });
    httpServer.listen(config.port, callback);
};