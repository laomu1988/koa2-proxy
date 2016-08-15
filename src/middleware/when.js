/**
 * 当请求的内容和condition匹配时,执行callback
 * @function proxy.when(condition, callback)
 * @index 100
 * @param {string|reg|object} conditions 当为string时,表示匹配路径,当为object时,拥有下列参数
 *        {string} conditions.url
 *        {string} conditions.fullUrl
 *        {string} conditions.phase 匹配阶段
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
            return ctx.get(key);
    }
}
function TestRule(val, rule) {
    switch (typeof rule) {
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
        }
    }

    return async function (ctx, next) {
        ctx.logger.debug('koa2-proxy.when rule:', JSON.stringify(conditions));
        // 判断是否符合条件
        for (var key in conditions) {
            if (key == 'phase') {
                continue;
            }
            if (key == 'local') {
                if (!!conditions[key] != ctx.isLocal()) {
                    ctx.logger.debug('koa2-proxy.when rule not passed:', key, conditions[key], ctx.isLocal());
                    return next();
                }
                else {
                    continue;
                }
            }
            if (!TestRule(GetVal(ctx, key), conditions[key])) {
                ctx.logger.debug('koa2-proxy.when rule not passed:', key, conditions[key]);
                return next();
            }
        }
        var phase = conditions.phase || 'request';
        if (phase == 'response') {
            // phase 设置为response时，在响应阶段处理
            await next();
            return callback(ctx);
        } else {
            // 默认在请求阶段处理
            return next(callback(ctx));
        }
    }
};