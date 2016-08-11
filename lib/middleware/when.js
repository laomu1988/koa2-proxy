'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * 当匹配路径时,回调
 * @function when
 * @param {string|reg|object} conditions 当为string时,表示匹配路径,当为object时,拥有下列参数
 * @param {string} conditions.url
 * @param {string} conditions.fullUrl
 * @param {string} conditions.phase
 * @param {string} conditions.phase
 * */
function GetVal(ctx, key) {
    switch (key) {
        case 'fullUrl':
            return ctx.fullUrl();
        case 'url':
            return ctx.request.url;
        default:
            return ctx.get(key);
    }
}
function TestRule(val, rule) {
    switch (typeof rule === 'undefined' ? 'undefined' : _typeof(rule)) {
        case 'string':
            return (val + '').indexOf(rule) >= 0;
        case 'function':
            return rule(val);
        default:
            if (rule instanceof RegExp) {
                return rule.test(val);
            }
    }
    return false;
}

module.exports = function (conditions, callback) {
    var proxy = this;
    if (!conditions || !callback) {
        proxy.logger.error('koa2-proxy.when need tow param: conditions and callback');
        return;
    }
    if (typeof callback !== 'function') {
        proxy.logger.error('koa2-proxy.when the second param need function not ' + callback);
        return;
    }
    if (typeof conditions == 'string' || conditions instanceof RegExp) {
        conditions = {
            fullUrl: conditions
        };
    }

    return function () {
        var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(ctx, next) {
            var key, phase;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            ctx.logger.debug('koa2-proxy.when rule:', JSON.stringify(conditions));
                            // 判断是否符合条件
                            _context.t0 = regeneratorRuntime.keys(conditions);

                        case 2:
                            if ((_context.t1 = _context.t0()).done) {
                                _context.next = 18;
                                break;
                            }

                            key = _context.t1.value;

                            if (!(key == 'phase')) {
                                _context.next = 6;
                                break;
                            }

                            return _context.abrupt('continue', 2);

                        case 6:
                            if (!(key == 'local')) {
                                _context.next = 13;
                                break;
                            }

                            if (!(!!conditions[key] != ctx.isLocal())) {
                                _context.next = 12;
                                break;
                            }

                            ctx.logger.debug('koa2-proxy.when rule not passed:', key, conditions[key], ctx.isLocal());
                            return _context.abrupt('return', next());

                        case 12:
                            return _context.abrupt('continue', 2);

                        case 13:
                            if (TestRule(GetVal(ctx, key), conditions[key])) {
                                _context.next = 16;
                                break;
                            }

                            ctx.logger.debug('koa2-proxy.when rule not passed:', key, conditions[key]);
                            return _context.abrupt('return', next());

                        case 16:
                            _context.next = 2;
                            break;

                        case 18:
                            phase = conditions.phase || 'request';

                            if (!(phase == 'response')) {
                                _context.next = 25;
                                break;
                            }

                            _context.next = 22;
                            return next();

                        case 22:
                            return _context.abrupt('return', callback(ctx));

                        case 25:
                            return _context.abrupt('return', next(callback(ctx)));

                        case 26:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        return function (_x, _x2) {
            return ref.apply(this, arguments);
        };
    }();
};