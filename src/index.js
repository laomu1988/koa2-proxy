require("babel-core/register");
require("babel-polyfill");

var koa = require('koa');
var listen = require('./listen');
var ip = require('ip');
var extend = require('./extends');
var logger = require('logger-color');
var log = require('./log');

var proxy = {
    static: require('./middleware/static').bind(proxy),
    mockfile: require('./middleware/mockfile.js').bind(proxy),
    slow: require('./middleware/slow').bind(proxy),
};

proxy.app = new koa();

var Event = require('events').EventEmitter;
var event = new Event();
proxy.on = proxy.bind = function () {
    event.on.apply(event, arguments);
};

proxy.emit = proxy.trigger = function () {
    event.emit.apply(event, arguments);
};
proxy.use = app.use.bind(app);
proxy.app.use(log.bind(proxy)());
proxy.app.use(extend());
proxy.listen = listen.bind(proxy);
module.exports = proxy;