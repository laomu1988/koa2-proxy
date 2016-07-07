'use strict';

/**
 * 判断是否是本地文件
 * */
var ip = require('ip');
var Url = require('url');
module.exports = function (url) {
    var host;
    if (url) {
        host = Url.parse(url).host;
    } else {
        host = this.request.host;
    }
    if (!host) {
        return false;
    }
    var port = this.proxy.port;
    port = port == 80 ? '' : ':' + port;
    var arr = ['localhost' + port, '127.0.0.1' + port, ip.address() + port];

    if (arr.indexOf(host) >= 0) {
        return true;
    }
    return false;
};