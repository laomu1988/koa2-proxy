module.exports = async (ctx, next) => {
    //console.log('start:', ctx.response.status);
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
    console.log('%s:%s status:%s,time:%s', ctx.method, ctx.url, ctx.response.status, ms);
};