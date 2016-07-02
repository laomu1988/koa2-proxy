/**
 * 判断是否是本地文件
 * */
var ip = require('ip');
var Url = require('url');
module.exports = function (ctx, url) {
    var host = ctx.host;
    if (url) {
        host = Url.parse(url).host;
    }
    if (host.indexOf('localhost') >= 0 || host.indexOf('127.0.0.1') >= 0 || host.indexOf(ip.address()) >= 0) {
        return true;
    }
};