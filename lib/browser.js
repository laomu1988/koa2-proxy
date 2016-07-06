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
    var client;
    socket.on('connection', function (_client) {
        // 成功！现在开始监听接收到的消息
        client = _client;
        client.emit('news', { hello: 'world' });
        client.on('my other event', function (data) {
            console.log(data);
        });
        client.on('message', function (event) {
            console.log('Received message from client!', event);
        });
        client.on('disconnect', function () {
            client = null;
            console.log('Server has disconnected');
        });
    });

    proxy.on('start', function (ctx) {
        if (client) {
            count += 1;
            ctx.__socketid = count + '' + Date.now();
            var data = {
                id: ctx.__socketid,
                url: ctx.request.url,
                header: ctx.request.header
            };

            fs.writeFileSync(folder + ctx.__socketid + '-request.json', JSON.stringify(data, null, '    '));
            client.emit('request', data);
        }
    });
    proxy.on('end', function (ctx) {
        if (client && ctx.__socketid) {
            var data = {
                id: ctx.__socketid,
                header: ctx.response.header
            };
            fs.writeFileSync(folder + ctx.__socketid + '-response.json', JSON.stringify(data, null, '    '));
            client.emit('response', data);
        }
    });
};