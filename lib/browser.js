'use strict';

/**
 * 通过browser查看请求列表
 * 浏览器端和服务器通过websocket通讯
 * server:
 *      start:
 *      end:
 * client:
 *      header
 *      response
 *
 * */
var fs = require('fs');

var temp = __dirname + '/../temp/';
var root = __dirname + '/../assert/';
var count = 10000000; // 计数器
var clients = []; // 客户端列表

function startSocket(proxy, server) {
    server = server || proxy.httpServer;
    if (!server) {
        proxy.logger.error('koa-proxy.browser has not server, please use proxy.listen(port) before use browser...');
        return;
    }
    proxy.logger.debug('browser socket bind on server..');
    proxy.static(root);

    // 创建一个Socket.IO实例，把它传递给服务器
    var io = require('socket.io');
    var socket = io.listen(server);

    socket.on('connection', function (client) {
        proxy.logger.debug('socket connection');

        // 成功！现在开始监听接收到的消息
        client.on('ready', function () {
            proxy.logger.debug('client ready');
            clients.push(client);
        });
        client.on('view', function (data) {
            proxy.logger.debug('Received message from client:', data);
            if (data && data.id) {
                var file = temp + data.id + '-response-body.data';
                if (fs.existsSync(file)) {
                    client.emit('view', { id: data.id, 'body': fs.readFileSync(file, 'utf8') });
                } else {
                    client.emit('view', { id: data.id, 'body': '' });
                }
            }
        });
        client.on('disconnect', function () {
            clients.splice(clients.indexOf(client), 1);
            proxy.logger.debug('client has disconnected');
        });
    });

    proxy.on('start', function (ctx) {
        try {
            if (clients.length > 0) {
                count += 1;
                ctx.__socketid = count + '' + Date.now();
                var data = {
                    id: ctx.__socketid,
                    url: ctx.request.url,
                    header: ctx.request.header
                };
                if (ctx.request.body) {
                    data.body = ctx.request.body;
                }

                fs.writeFileSync(temp + ctx.__socketid + '-request.json', JSON.stringify(data, null, '    '));
                clients.forEach(function (client) {
                    client.emit('request', data);
                });
            }
        } catch (e) {
            proxy.logger.error('koa-proxy browser start event error: ', e);
        }
    });
    proxy.on('end', function (ctx) {
        try {
            if (clients.length > 0 && ctx.__socketid) {
                var data = {
                    id: ctx.__socketid,
                    header: ctx.response.header,
                    statusCode: ctx.response.status,
                    statusString: ctx.response.statusString
                };
                fs.writeFileSync(temp + ctx.__socketid + '-response.json', JSON.stringify(data, null, '    '));
                if (typeof ctx.response.body == 'string') {
                    fs.writeFileSync(temp + ctx.__socketid + '-response-body.data', ctx.response.body, 'utf8');
                }
                clients.forEach(function (client) {
                    client.emit('response', data);
                });
            }
        } catch (e) {
            proxy.logger.error('koa-proxy browser end event error: ', e);
        }
    });
}

module.exports = function (server) {
    var proxy = this;
    if (!server && !proxy.httpServer) {
        proxy.on('http-server-start', function () {
            startSocket(proxy, proxy.httpServer);
        });
    } else {
        startSocket(proxy, server || proxy.httpServer);
    }
};