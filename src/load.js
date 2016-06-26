/**
 * 加载网路数据
 * 判断是否是本地文件
 **/
var request = require('request');
var ip = require('ip');

var maps = {
    statusCode: 'statusCode',
    body: 'body'
};

module.exports = function (ctx, next) {
    // console.log(ctx);
    var address = ip.address();
    if (ctx.host == 'localhost' || ctx.host == '127.0.0.1' || ctx.ip == address || ctx.response.body) {
        // 本地地址，则不继续向网络发送请求
        next();
        return;
    }
    console.log('请求网络地址：', ctx.url, '               ');
    ctx.request.header['accept-encoding'] = 'deflate'; // 取消gzip压缩
    ctx.request.header['connection'] = 'close'; // 取消keep-alive
    //ctx.request.header['proxy-connection'] = 'close'; // 代理

    ctx.response.body = request({
        uri: ctx.url,
        method: ctx.method,
        headers: ctx.request.header
    });
};