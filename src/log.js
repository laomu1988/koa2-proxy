module.exports = function (config) {
    var proxy = this;
    return async (ctx, next) => {
        ctx.logger.debug('middleware:log start');
        proxy.trigger('start', ctx);
        var start = new Date;
        try {
            await next();
        } catch (e) {
            console.log(e);
        }
        var ms = new Date - start;
        ctx.set('X-Response-Time', ms + 'ms');
        // console.log('finish:', ctx.response.status);
        if (typeof ctx.response.status == 'undefined' && !ctx.response.body) {
            ctx.response.status = 404;
            ctx.response.body = 'not found';
        }
        proxy.trigger('end', ctx);
        ctx.logger.debug('middleware:log end');
    };
};