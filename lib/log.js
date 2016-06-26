'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

module.exports = function () {
    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(ctx, next) {
        var start, ms;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        //console.log('start:', ctx.response.status);
                        start = new Date();
                        _context.prev = 1;
                        _context.next = 4;
                        return next();

                    case 4:
                        _context.next = 9;
                        break;

                    case 6:
                        _context.prev = 6;
                        _context.t0 = _context['catch'](1);

                        console.log(_context.t0);

                    case 9:
                        ms = new Date() - start;

                        ctx.set('X-Response-Time', ms + 'ms');
                        // console.log('finish:', ctx.response.status);
                        if (typeof ctx.response.status == 'undefined' && !ctx.response.body) {
                            ctx.response.status = 404;
                            ctx.response.body = 'not found';
                        }
                        console.log('%s:%s status:%s,time:%s', ctx.method, ctx.url, ctx.response.status, ms);

                    case 13:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined, [[1, 6]]);
    }));

    return function (_x, _x2) {
        return ref.apply(this, arguments);
    };
}();