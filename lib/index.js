"use strict";

require("babel-core/register");
require("babel-polyfill");

var koa = require('koa');
var listen = require('./listen');
var ip = require('ip');
var extend = require('./extends');
var logger = require('logger-color');
var log = require('./log');
var proxy = {};
var app = new koa();
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

proxy.logger = logger;

var Event = require('events').EventEmitter;
var event = new Event();
proxy.on = proxy.bind = function () {
    event.on.apply(event, arguments);
};

proxy.emit = proxy.trigger = function () {
    event.emit.apply(event, arguments);
};
proxy.app.use(extend.bind(proxy)());
proxy.app.use(log.bind(proxy)());
proxy.listen = listen.bind(proxy);
module.exports = proxy;