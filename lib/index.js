"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

console.log('is starting');
require("babel-core/register");
require("babel-polyfill");
var koa = require('koa');
var listen = require('./listen');

var config = {
    port: 3000,
    https: 3001,
    http: 3002
};

var app = new koa();
var load = require('./load');

// x-response-time,logger
app.use(function () {
    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(ctx, next) {
        var start, ms;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        start = new Date();
                        _context.prev = 1;
                        _context.next = 4;
                        return next();

                    case 4:
                        _context.next = 8;
                        break;

                    case 6:
                        _context.prev = 6;
                        _context.t0 = _context["catch"](1);

                    case 8:
                        ms = new Date() - start;

                        ctx.set('X-Response-Time', ms + 'ms');
                        if (typeof ctx.response.statusCode == 'undefined' && !ctx.response.body) {
                            ctx.response.statusCode = 404;
                            ctx.response.body = 'not found';
                        }
                        console.log('%s:%s status:%s,time:%s', ctx.method, ctx.url, ctx.response.statusCode, ms);

                    case 12:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, undefined, [[1, 6]]);
    }));

    return function (_x, _x2) {
        return ref.apply(this, arguments);
    };
}());

var slow = require('koa-slow');

// app.use(slow({delay: 1000}));
// npm install regenerator -r server.asyncawait.js | node
// response
app.use(load);

//app.use(function *() {
//    this.body = 'Hello World';
//});
listen(3000, app.callback());