'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

var hasSend = require('./method/hasSend');
var isBinary = require('./method/isBinary');
var isLocal = require('./method/isLocal');
var sendFile = require('./method/sendFile');
var fullUrl = require('./method/fullUrl');

function reqSet(filed, val) {
    if (2 == arguments.length) {
        if (Array.isArray(val)) val = val.map(String);else val = String(val);
        this.header[(field + '').toLowerCase()] = val;
    } else {
        for (var key in field) {
            this.header[(key + '').toLowerCase()] = field[key];
        }
    }
};

function extendRequest(req) {
    req.set = reqSet.bind(req);
    Object.defineProperties(req, {
        host: {
            get: function get() {
                var proxy = this.app.proxy;
                var host = proxy && this.get('X-Forwarded-Host');
                host = host || this.get('Host');
                if (!host) return '';
                return host.split(/\s*,\s*/)[0];
            },
            set: function set(host) {
                var proxy = this.app.proxy;
                if (proxy) {
                    this.header['X-Forwarded-Host'] = host;
                } else {
                    this.header['host'] = host;
                }
                return host;
            },
            enumerable: true,
            configurable: true
        }
    });
}

module.exports = function () {
    var proxy = this;
    return function () {
        var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(ctx, next) {
            var start, ms;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            ctx.logger = proxy.logger;
                            ctx.logger.debug('middleware:log start');
                            ctx.proxy = proxy;
                            ctx.hasSend = hasSend.bind(ctx);
                            ctx.isBinary = isBinary.bind(ctx);
                            ctx.isLocal = isLocal.bind(ctx);
                            ctx.sendFile = sendFile.bind(ctx);
                            ctx.fullUrl = fullUrl.bind(ctx);
                            ctx.request.fullUrl = ctx.fullUrl;
                            extendRequest(ctx.request);

                            proxy.trigger('start', ctx);
                            start = new Date();
                            _context.prev = 12;
                            _context.next = 15;
                            return next();

                        case 15:
                            _context.next = 20;
                            break;

                        case 17:
                            _context.prev = 17;
                            _context.t0 = _context['catch'](12);

                            console.log(_context.t0);

                        case 20:
                            ms = new Date() - start;

                            ctx.set('X-Response-Time', ms + 'ms');
                            // console.log('finish:', ctx.response.status);
                            if (typeof ctx.response.status == 'undefined' && !ctx.response.body) {
                                ctx.response.status = 404;
                                ctx.response.body = 'not found';
                            }
                            proxy.trigger('end', ctx);
                            ctx.logger.debug('middleware:log end');

                        case 25:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this, [[12, 17]]);
        }));

        return function (_x, _x2) {
            return ref.apply(this, arguments);
        };
    }();
};