/**
 * 启动监听端口,启动http和https服务器和代理,默认不启动https代理
 * @function proxy.listen(3000)
 * @index 100
 * @param {number|object} config 当为number时,表示http服务器端口号,默认3000。
 *          当为object时,存在下列参数
 * @param {number} config.port http服务器端口号
 * @param {boolean} config.https 是否启动https代理,默认不启动
 * @param {string} config.loadCertUrl 下载密匙的链接,只要配置代理后访问带有该链接的地址就可以下载密匙,默认: proxy.com
 * @param {string} config.key https服务器的密匙,可省略
 * @param {string} config.cert https服务器的公匙,可省略(密匙和公匙必须配对)
 * @param {function} callback 启动http服务器后的回调函数,参数err
 *
 * @example
 * var proxy = require('koa2-proxy');
 * proxy.static(__dirname + '/output/');
 * proxy.listen(8000);
 * @example
 * // 启动https代理,则可以如下配置
 * var proxy = require('koa2-proxy');
 * proxy.static(__dirname + '/output/');
 * proxy.listen({port: 8000,https: true});
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
    https: false,
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
    var httpServer = http.createServer(app.callback());
    proxy.httpServer = httpServer;
    proxy.port = config.port;
    proxy.localip = ip.address();
    proxy.localhost = proxy.localip + ':' + config.port;

    if (config.https) {
        // 下载cert证书
        proxy.when({fullUrl: config.loadCertUrl}, function (ctx) {
            ctx.logger.notice('Load Cert!');
            ctx.response.status = 200;
            ctx.response.body = config.cert;
            ctx.response.header['content-type'] = 'application/x-x509-ca-cert';
        });

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
                } else {
                    proxy.httpsServer = httpsServer;
                    proxy.trigger('https-server-start');
                }
            });
        }
    }

    httpServer.listen(config.port, function (err) {
        if (err) {
            proxy.logger.error('koa-proxy listen error:', err);
            if (typeof callback === 'function') {
                callback(err);
            }
            return false;
        }

        proxy.trigger('http-server-start');

        // 添加自动加载
        app.use(load());

        if (typeof callback === 'function') {
            callback(err);
        } else {
            console.log('start server at http://localhost:' + proxy.port, '  same as  http://' + proxy.localhost);
        }
    });
};
