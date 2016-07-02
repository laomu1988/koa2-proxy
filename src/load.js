/**
 * 加载网路数据
 * 判断是否是本地文件
 **/
var request = require('request');
var ip = require('ip');
var isBinary = require('./method/isBinary');
var hasSend = require('./method/hasSend');

module.exports = function (config) {
    return function (ctx, next) {
        if (hasSend(ctx)) {
            return next();
        }
        // console.log(ctx);
        var address = ip.address();
        if (ctx.host == 'localhost' || ctx.host == '127.0.0.1' || ctx.ip == address || ctx.response.body) {
            // 本地地址，则不继续向网络发送请求
            return next();
        }
        console.log('请求网络地址：', ctx.url, '               ');
        ctx.request.header['accept-encoding'] = 'deflate'; // 取消gzip压缩
        ctx.request.header['connection'] = 'close'; // 取消keep-alive
        //ctx.request.header['proxy-connection'] = 'close'; // 代理

        if (isBinary(ctx.req.pathname)) {
            ctx.response.body = request({
                uri: ctx.url,
                method: ctx.method,
                headers: ctx.request.header
            });
            return next();
        } else {
            return new Promise(function (resolve, reject) {
                request({
                    uri: ctx.url,
                    method: ctx.method,
                    headers: ctx.request.header
                }, function (err, response, body) {
                    if (!err) {
                        //console.log(response.headers);
                        ctx.response.body = body;
                        ctx.response.set(response.headers);
                    }
                    return next();
                });
            });
        }
    };
}