/**
 * 使用浏览器打开指定网页,假如不指定域名,则会使用localhost和监听端口(listen调用时的监听端口)
 * @function proxy.open('/index.html')
 * @index: 110
 * @param {string} url 打开的网址
 *
 */

var open = require('open');
var process = require('process');
module.exports = function (url) {
    var proxy = this;
    process.nextTick(function () {
        if (!url) {
            url = '';
        }
        if (url.indexOf('http') !== 0) {
            url = 'http://localhost:' + proxy.port + url;
        }
        open(url);
    });
};