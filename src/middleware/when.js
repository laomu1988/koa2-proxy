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
    if (!conditions && !callback) {
        proxy.logger.error('koa2-proxy.when need tow param: conditions and callback');
        return;
    }
    if (typeof conditions == 'function') {
        callback = conditions;
        conditions = null;
    }
    else if (typeof conditions == 'string' || conditions instanceof RegExp) {
        conditions = {
            fullUrl: conditions
        }
    }
    if (typeof callback !== 'function') {
        proxy.logger.error('koa2-proxy.when([condition,] callback) callback need to be function not ' + callback);
        return;
    }


    return async function (ctx, next) {
        ctx.logger.debug('koa2-proxy.when rule:', JSON.stringify(conditions));
        if (!conditions) {
            // 不存在conditions时,在请求阶段响应所有请求
            return next(callback(ctx));
        }
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