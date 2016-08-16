'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * 当请求的内容和condition匹配时,执行callback
 * @function proxy.when([condition,] callback)
 * @index 100
 * @param condition
 *        {string|reg} condition url包含string或者reg.test(url)为tru时,将执行callback
 *        {object} condition 匹配条件列表,其属性值可以是header的字段或者host,fullUrl,url,phase,method等
 *            - {string|reg|function} condition.url 匹配url(host之后的部分)
 *            - {string|reg|function} condition.fullUrl (匹配)
 *            - {string} condition.phase 匹配阶段,request或者response,默认request
 *            - {string|reg|function} condition.cookie
 *            - {string|reg|function} ...  匹配其他任意header字段
 * @param {function} callback 匹配时执行的函数,参数ctx
 *
 * @example test.html的内容设置为test
 * proxy.when('test.html',function(ctx){
 *      ctx.response.body = 'test';
 * });
 * @example test.html的内容增加一个div
 * proxy.when({url:'test.html',phase: 'response' },function(ctx){
 *      ctx.response.body +='<div>test</div>';
 * });
 * */
function GetVal(ctx, key) {
    switch (key) {
        case 'fullUrl':
            return ctx.fullUrl();
        case 'url':
            return ctx.request.url;
        default:
            var val = ctx.request[key];
            if (typeof val === 'string') {
                return val.toLowerCase();
            }
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
    if (!conditions && !callback) {
        proxy.logger.error('koa2-proxy.when need tow param: conditions and callback');
        return;
    }
    if (typeof conditions == 'function') {
        callback = conditions;
        conditions = null;
    } else if (typeof conditions == 'string' || conditions instanceof RegExp) {
        conditions = {
            fullUrl: conditions
        };
    }
    if (typeof callback !== 'function') {
        proxy.logger.error('koa2-proxy.when([condition,] callback) callback need to be function not ' + callback);
        return;
    }

    return function () {
        var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(ctx, next) {
            var key, phase;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            ctx.logger.debug('koa2-proxy.when rule:', JSON.stringify(conditions));

                            if (conditions) {
                                _context.next = 3;
                                break;
                            }

                            return _context.abrupt('return', next(callback(ctx)));

                        case 3:
                            _context.t0 = regeneratorRuntime.keys(conditions);

                        case 4:
                            if ((_context.t1 = _context.t0()).done) {
                                _context.next = 20;
                                break;
                            }

                            key = _context.t1.value;

                            if (!(key == 'phase')) {
                                _context.next = 8;
                                break;
                            }

                            return _context.abrupt('continue', 4);

                        case 8:
                            if (!(key == 'local')) {
                                _context.next = 15;
                                break;
                            }

                            if (!(!!conditions[key] != ctx.isLocal())) {
                                _context.next = 14;
                                break;
                            }

                            ctx.logger.debug('koa2-proxy.when rule not passed:', key, conditions[key], ctx.isLocal());
                            return _context.abrupt('return', next());

                        case 14:
                            return _context.abrupt('continue', 4);

                        case 15:
                            if (TestRule(GetVal(ctx, key), conditions[key])) {
                                _context.next = 18;
                                break;
                            }

                            ctx.logger.debug('koa2-proxy.when rule not passed:', key, conditions[key]);
                            return _context.abrupt('return', next());

                        case 18:
                            _context.next = 4;
                            break;

                        case 20:
                            phase = conditions.phase || 'request';

                            if (!(phase == 'response')) {
                                _context.next = 27;
                                break;
                            }

                            _context.next = 24;
                            return next();

                        case 24:
                            return _context.abrupt('return', callback(ctx));

                        case 27:
                            return _context.abrupt('return', next(callback(ctx)));

                        case 28:
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