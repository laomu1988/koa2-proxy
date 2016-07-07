'use strict';

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
        if (ctx.request.body) {
            reqdata.formData = ctx.request.body;
        }

        if (ctx.isBinary(ctx.url)) {
            try {
                ctx.logger.debug('load data is binary..');
                ctx.response.body = request(reqdata);
            } catch (e) {
                ctx.logger.debug('middleware load error: ', e);
            }

            return next();
        } else {
            return new Promise(function (resolve, reject) {
                request(reqdata, function (err, response, body) {
                    try {
                        if (!err) {
                            ctx.logger.debug('load has response data.');
                            ctx.response.body = body;
                            ctx.response.set(response.headers);
                            ctx.logger.debug('load has set success.');
                        } else {
                            ctx.logger.debug('middleware load data error: ', err);
                        }
                    } catch (e) {
                        ctx.logger.error('koa-proxy middleware load error:', e);
                    }
                    resolve(next());
                });
            });
        }
    };
};