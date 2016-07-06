/**
 * 加载网路数据
 * 判断是否是本地文件
 **/
var request = require('request');

module.exports = function (config) {
    return function (ctx, next) {
        ctx.logger.debug('middleware: load');
        if (ctx.hasSend() || ctx.isLocal()) {
            return next();
        }

        ctx.logger.log('请求网络地址：', ctx.url, '               ');
        ctx.request.header['accept-encoding'] = 'deflate'; // 取消gzip压缩
        ctx.request.header['connection'] = 'close'; // 取消keep-alive
        //ctx.request.header['proxy-connection'] = 'close'; // 代理

        var reqdata = {
            uri: ctx.url,
            method: ctx.method,
            headers: ctx.request.header
        };
        if (req.request.body) {
            reqdata.formData = req.request.body;
        }

        if (ctx.isBinary(ctx.req.pathname)) {
            try {
                ctx.response.body = request(reqdata);
            } catch (e) {
                ctx.logger.debug('middleware load error: ', e);
            }

            return next();
        } else {
            return new Promise(function (resolve, reject) {
                request(reqdata, function (err, response, body) {
                    if (!err) {
                        //console.log(response.headers);
                        ctx.response.body = body;
                        ctx.response.set(response.headers);
                    } else {
                        ctx.logger.debug('middleware load data error: ', e);
                    }
                    return next();
                });
            });
        }
    };
}