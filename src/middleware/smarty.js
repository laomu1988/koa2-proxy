/**
 * 为本地文件构建模拟smarty环境
 * */
var smarty = require('smarty4js');
var path = require('path');
var s = new smarty();
module.exports = function (config) {
    if (typeof config === 'string') {
        config = {ext: config}
    }
    config = Object.assign({ext: '.html', data: {}}, config);
    if (!config.ext || !config.data) {
        throw new Error('middleware smarty need 2 param: the ext for template and  data');
    }
    return async function (ctx, next) {
        ctx.logger.debug('middleware smarty');
        await next();
        try {
            if (ctx.isLocal() && ctx._sendFilePath && typeof ctx.response.body == 'string') {
                if (config.ext == path.extname(ctx._sendFilePath)) {
                    ctx.response.body = s.render(ctx.response.body, typeof config.data === 'function' ? config.data(ctx._sendFilePath) : config.data);
                }
            }
        } catch (e) {
            ctx.logger.error('koa-proxy middleware smarty error:', e);
        }
    }
};