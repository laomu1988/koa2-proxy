require("babel-core/register");
require("babel-polyfill");

var koa = require('koa');
var bodyParser = require('koa-bodyparser');
var listen = require('./listen');
var logger = require('logger-color');
/**
 * 全局内容 proxy
 * @module proxy
 * */
var proxy = {};
var app = new koa;
proxy.app = app;
proxy.use = app.use.bind(app);


proxy.static = function () {
    app.use(require('./middleware/static').apply(proxy, arguments));
};
proxy.mockfile = function () {
    app.use(require('./middleware/mockfile').apply(proxy, arguments));
};
proxy.slow = function () {
    app.use(require('./middleware/slow').apply(proxy, arguments));
};

proxy.smarty = function () {
    app.use(require('./middleware/smarty').apply(proxy, arguments));
};

proxy.when = function () {
    app.use(require('./middleware/when').apply(proxy, arguments));
};

//proxy.browser = function (server) {
//    require('./browser').bind(proxy)(server);
//};


proxy.listen = listen.bind(proxy);
proxy.logger = logger;

var Event = require('events').EventEmitter;
var event = new Event();
proxy.on = proxy.bind = function () {
    event.on.apply(event, arguments);
};

proxy.emit = proxy.trigger = function () {
    event.emit.apply(event, arguments);
};

// 初始化
logger.setLevel('notice');
require('./extends_proxy')(proxy);
proxy.use(bodyParser());
proxy.use(require('./extends_ctx').bind(proxy)());


// 错误处理
process.on('uncaughtException', function (err) {
    proxy.logger.error('uncaughtException', err, err.stack);
});

process.on('Error', function (err) {
    proxy.logger.error('catchError:', err, err.stack);
});


module.exports = proxy;