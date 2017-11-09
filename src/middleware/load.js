/**
 * 加载网路数据
 * 判断是否是本地文件
 **/
var request = require('request')
var fs = require('fs')

function handleHeader(header) {
    if (!header) {
        return
    }
    for (var attr in header) {
        var trim = attr.trim()
        if (trim.toLowerCase() == 'content-length') {
            delete header[attr]
        } else if (trim != attr) {
            header[trim] = header[attr]
            delete header[attr]
        }
    }
    return header
}

module.exports = function () {
    return function (ctx, next) {
        ctx.logger.debug('middleware: load')
        if (ctx.hasSend() || ctx.isLocal()) {
            return next()
        }
        var uri = ctx.fullUrl()

        ctx.logger.log('请求网络地址：', uri, '               ')
        console.log('load_remote:', uri, '               ');
        ctx.request.header['accept-encoding'] = 'deflate' // 取消gzip压缩
        // ctx.request.header['connection'] = 'close'; // 取消keep-alive
        // ctx.request.header['proxy-connection'] = 'close'; // 代理
        // 添加from标签,避免从本地重复请求
        if (ctx.request.header['__from'] == 'koa2-proxy') {
            return next()
        }
        ctx.request.header['__from'] = 'koa2-proxy'
        var reqdata = {
            uri: uri,
            method: ctx.method,
            headers: handleHeader(ctx.request.header),
            encoding: null
        }
        var form = null
        if (ctx.request.body) form = ctx.request.body
        if (ctx.request.files) {
            form = form || {}
            var files = ctx.request.files
            for (var attr in files) {
                var file = files[attr]
                form[attr] = {
                    value: fs.createReadStream(file.path),
                    options: {
                        filename: file.name,
                        contentType: file.type
                    }
                }
            }
        }
        if (form) {
            let contentType = ctx.request.header['content-type'];
            if (contentType) {
                if (contentType.indexOf('form-data') >= 0) {
                    reqdata.formData = form
                }
                else if(contentType.indexOf('json') >= 0) {
                    reqdata.json = form
                }
            }
            else {
                reqdata.form = form
            }
        }

        return new Promise(function (resolve, reject) {
            // console.log('reqdata:', reqdata);
            request(reqdata, function (err, response, body) {
                try {
                    if (!err) {
                        ctx.logger.debug('load has response data.')
                        var header = handleHeader(response.headers)
                        delete header['content-length'] // 避免长度和设置body长度不一致问题
                        delete header['transfer-encoding'] // 删除该字段，因为现在是下载完毕处理后才发送
                        ctx.response.set(header)
                        ctx.response.body = body
                    } else {
                        ctx.logger.error('middleware load data error: ', err, err.stack)
                    }
                } catch (e) {
                    ctx.logger.error('koa-proxy middleware load error:', e)
                }
                resolve(next())
            })
        })
    }
}
