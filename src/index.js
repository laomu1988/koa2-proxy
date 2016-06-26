require("babel-core/register");
require("babel-polyfill");
var koa = require('koa');
var listen = require('./listen');
var ip = require('ip');

var app = new koa();
var log = require('./log');
var load = require('./load');
var root = require('./root');
var mock = require('./mock');
var slow = require('./slow');
var config = {
    port: 3000, // 监听端口号
    root: '', // 项目根目录
    mockup: '', // 项目模拟文件目录
    mockfile: '', // 通过规则指定模拟文件
    proxy: true, //是否当做代理工具
    delay: 0, // 请求延迟时间
    defaultIndex: 'index.html' // 文件夹页面
};


module.exports = function (_config) {
    config = Object.assign(config, _config);
    app.use(log);
    app.use(slow(config));
    app.use(root(config));
    //app.use(mock(config));
    //app.use(load(config));
    setTimeout(function () {
        listen(config, app.callback(), function (err) {
            if (err) {
                console.log('koa proxy error:', err);
            } else {
                console.log('Start Server at: http://localhost:' + config.port, '  same as: ', ip.address() + ':' + config.port);
            }
        });
    }, 10);
    return app;
};