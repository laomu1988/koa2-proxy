/**
 * 监听端口
 * http和https
 **/

var http = require('http');
var https = require('https');
var net = require('net');
var sni = require('./sni');
var fs = require('fs');
var load = require('./load');

var options = {
    key: fs.readFileSync(__dirname + '/../assert/cakey.pem'),
    cert: fs.readFileSync(__dirname + '/../assert/cacert.pem')
};

module.exports = function (config, callback) {
    var port = 3000;
    if (typeof config == 'number') {
        port = config;
        config = {port: port}
    }
    if (!config) {
        throw new Error('Proxy Need arguments as: {port: 3000} ');
        return;
    }

    var proxy = this;
    var app = proxy.app;
    // 添加自动加载
    app.use(load());

    var httpServer = http.createServer(app.callback());
    let { key, cert } = options,
        cxnEstablished = new Buffer(`HTTP/1.1 200 Connection Established\r\n\r\n`, 'ascii');

    let httpsServer = https.createServer({
        key,
        cert,
        SNICallback: sni(key, cert),
    }, (fromClient, toClient) => {
        // https端的响应
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
            toClient.writeHead(fromServer.status, fromServer.headers)
            fromServer.pipe(toClient)
        });
        fromClient.pipe(toServer)
    });


    /**
     * 断开客户端和http服务器之间通道， 连接客户端和https服务器之间的通道
     **/
    httpServer.on('connect', (request, clientSocket, head) => {
        let addr = httpsServer.address();
        // 连接https
        let serverSocket = net.connect(addr.port, addr.address, () => {
            clientSocket.write(cxnEstablished);
            serverSocket.write(head);
            clientSocket
                .pipe(serverSocket)
                .pipe(clientSocket);
        })
    });


    httpsServer.listen(0, function (err) {
        if (err) {
            console.log('koa-proxy https err: ', err);
        }
    });
    httpServer.listen(config.port, callback);
};
