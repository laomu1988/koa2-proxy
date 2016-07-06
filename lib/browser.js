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
 * todo: 多个server客户端
 * */
var fs = require('fs');

var folder = __dirname + '/../temp/';
var count = 10000000;

module.exports = function (server) {
    if (!server) {
        return;
    }
    var proxy = this;
    proxy.static(__dirname + '/../assert/');
    var http = require('http'),
        io = require('socket.io');
    // 创建一个Socket.IO实例，把它传递给服务器
    var socket = io.listen(server);
    // 添加一个连接监听器
    var clients = [];
    socket.on('connection', function (client) {
        // 成功！现在开始监听接收到的消息
        client.on('ready', function () {
            console.log('client ready');
            clients.push(client);
        });
        client.on('view', function (data) {
            console.log('Received message from client:', data);
            if (data && data.id) {
                var file = folder + data.id + '-response-body.data';
                if (fs.existsSync(file)) {
                    client.emit('view', { id: data.id, 'body': fs.readFileSync(file, 'utf8') });
                } else {
                    client.emit('view', { id: data.id, 'body': '' });
                }
            }
        });
        client.on('disconnect', function () {
            clients.splice(clients.indexOf(client), 1);
            console.log('Server has disconnected');
        });
    });

    proxy.on('start', function (ctx) {
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

            fs.writeFileSync(folder + ctx.__socketid + '-request.json', JSON.stringify(data, null, '    '));
            clients.forEach(function (client) {
                client.emit('request', data);
            });
        }
    });
    proxy.on('end', function (ctx) {
        if (clients.length > 0 && ctx.__socketid) {
            var data = {
                id: ctx.__socketid,
                header: ctx.response.header,
                statusCode: ctx.response.status,
                statusString: ctx.response.statusString
            };
            fs.writeFileSync(folder + ctx.__socketid + '-response.json', JSON.stringify(data, null, '    '));
            if (typeof ctx.response.body == 'string') {
                fs.writeFileSync(folder + ctx.__socketid + '-response-body.data', ctx.response.body, 'utf8');
            }
            clients.forEach(function (client) {
                client.emit('response', data);
            });
        }
    });
};