/**
 * 加载网路数据
 * 判断是否是本地文件
 **/
var request = require('request');

function handleHeader(header) {
    if (!header) {
        return;
    }
    for (var attr in header) {
        if (attr.trim() != attr) {
            header[attr.trim()] = header[attr];
            delete header[attr];
        }
    }
    return header;
}


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
            headers: handleHeader(ctx.request.header),
            encoding: null
        };
        if (ctx.request.body) {
            reqdata.formData = ctx.request.body;
        }

        return new Promise(function (resolve, reject) {
            request(reqdata, function (err, response, body) {
                try {
                    if (!err) {
                        ctx.logger.debug('load has response data.');
                        ctx.response.set(handleHeader(response.headers));
                        ctx.response.body = body;
                    } else {
                        ctx.logger.debug('middleware load data error: ', err);
                    }
                } catch (e) {
                    ctx.logger.error('koa-proxy middleware load error:', e);
                }
                resolve(next());
            });
        });
    };
}