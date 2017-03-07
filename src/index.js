require("babel-core/register");
require("babel-polyfill");
// require('./assist/update');
var koa = require('koa');
var bodyParser = require('koa-bodyparser');
var listen = require('./listen');
var logger = require('logger-color');
var match = require('koa2-match');
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


var addMatched = false;
proxy.when = function () {
    match.match.apply(match, arguments);
    if(!addMatched) {
        addMatched = true;
        app.use(match.callback());
    }
};

//proxy.browser = function (server) {
//    require('./browser').bind(proxy)(server);
//};


proxy.listen = listen.bind(proxy);
proxy.logger = logger;
proxy.open = require('./open').bind(proxy);

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

/**
 * 浏览根网址时自动跳转到指定地址
 * @function proxy.index('/index.html')
 * @index: 111
 * @param {string} url 跳转地址,默认/index.html
 *
 */
proxy.index = function (url) {
    var index = url || '/index.html';
    proxy.when({url: /^[\/\s]*$/}, function (ctx) {
        ctx.response.redirect(index);
    });
    return proxy;
};

module.exports = proxy;
