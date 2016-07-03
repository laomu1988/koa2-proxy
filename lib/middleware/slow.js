/**
 * options
 *      delay: 0, 延迟毫秒数
 *      delayUrl: null, 正则，要延迟的url，假如为空则所有的请求都延迟
 * */

'use strict';

function sleep(delay) {
    return new Promise(function (resolve, reject) {
        if (delay >= 1) {
            setTimeout(function () {
                resolve();
            }, delay);
        } else {
            resolve();
        }
    });
}

function slow(options) {
    options = options || {};
    return function (ctx, next) {
        ctx.logger.debug('middleware: slow');
        if (options.delayUrl && options.delayUrl.test) {
            if (options.delayUrl.test(ctx.url)) {
                // slow specific resoures down
                return sleep(options.delay).then(next());
            } else {
                return next();
            }
        } else {
            // slow everything down
            return sleep(options.delay).then(next());
        }
    };
};

module.exports = slow;