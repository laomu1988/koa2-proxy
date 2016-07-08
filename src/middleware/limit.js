/**
 * 限制同时相应的请求数目
 * */


module.exports = function (num) {
    var proxy = this, callNext;
    num = num || 5;
    var running = 0, resolves = [];
    proxy.on('end', function (ctx) {
        running -= 1;
        ctx.logger.notice('limit processing finish...');
        if (resolves.length > 0) {
            resolves.pop()();
        }
    });

    return function (ctx, next) {
        running += 1;
        ctx.logger.notice('limit now-runing-processing:', running);
        return new Promise(function (resolve, reject) {
            if (running > num) {
                ctx.logger.notice('limit processing...');
                resolves.push(function () {
                    resolve(next());
                });
            } else {
                resolve(next());
            }
        });
    }
};