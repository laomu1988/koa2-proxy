'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * 为本地文件构建模拟smarty环境
 * */
var smarty = require('smarty4js');
var path = require('path');
var s = new smarty();
module.exports = function (config) {
    if (typeof config === 'string') {
        config = { ext: config };
    }
    config = Object.assign({ ext: '.html', data: {} }, config);
    if (!config.ext || !config.data) {
        throw new Error('middleware smarty need 2 param: the ext for template and  data');
    }
    return function () {
        var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(ctx, next) {
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            ctx.logger.debug('middleware smarty');
                            _context.next = 3;
                            return next();

                        case 3:
                            try {
                                if (ctx.isLocal() && ctx._sendFilePath && typeof ctx.response.body == 'string') {
                                    if (config.ext == path.extname(ctx._sendFilePath)) {
                                        ctx.response.body = s.render(ctx.response.body, typeof config.data === 'function' ? config.data(ctx._sendFilePath) : config.data);
                                    }
                                }
                            } catch (e) {
                                ctx.logger.error('koa-proxy middleware smarty error:', e);
                            }

                        case 4:
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