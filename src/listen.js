/**
 * 监听端口
 * http和https
 **/
'use strict';
var http = require('http');
var https = require('https');
var net = require('net');
var sni = require('./sni');
var fs = require('fs');
var load = require('./middleware/load');
var ip = require('ip');

var config = {
    port: 3000,
    key: fs.readFileSync(__dirname + '/../assert/cakey.pem'),
    cert: fs.readFileSync(__dirname + '/../assert/cacert.pem'),
    loadCertUrl: 'proxy.com' // 下载证书的链接
};

module.exports = function (_config, callback) {
    if (typeof _config == 'number') {
        _config = {port: _config}
    }
    config = Object.assign(config, _config);
    var proxy = this;
    var app = proxy.app;
    // 下载cert证书
    proxy.when({fullUrl:config.loadCertUrl}, function(ctx){
        ctx.logger.cert('Load Cert!');
        ctx.response.status = 200;
        ctx.response.body = config.cert;
        ctx.response.header['content-type'] = 'application/x-x509-ca-cert';
    });

    var httpServer = http.createServer(app.callback());

    // 添加https代理服务
    if (config.cert && config.key) {
        let cxnEstablished = new Buffer(`HTTP/1.1 200 Connection Established\r\n\r\n`, 'ascii');
        let httpsServer = https.createServer({
            key: config.key,
            cert: config.cert,
            SNICallback: sni(config.key, config.cert),
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
                toClient.writeHead(fromServer.statusCode, fromServer.headers)
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

        // https代理监听0端口
        httpsServer.listen(0, function (err) {
            if (err) {
                console.log('koa-proxy https err: ', err);
            }else{
                proxy.httpsServer = httpsServer;
                proxy.trigger('https-server-start');
            }
        });

    }
    httpServer.listen(config.port, function (err) {
        if(err){
            proxy.logger.error('koa-proxy listen error:',err);
            if(typeof callback === 'function'){
                callback(err);
            }
            return false;
        }
        proxy.port = config.port;
        proxy.httpServer = httpServer;
        proxy.trigger('http-server-start');

        // 添加自动加载
        app.use(load());

        if (typeof callback === 'function') {
            callback(err);
        } else {
            console.log('start server at http://localhost:' + config.port, '  same as  http://' + ip.address() + ':' + config.port);
        }
    });
};
