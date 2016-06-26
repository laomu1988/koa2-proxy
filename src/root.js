/**
 * 匹配本地文件，发送文件
 * */

var fs = require('fs');
var Path = require('path');
var Url = require('url');
var isBinary = require('./method/isBinary');
var hasSend = require('./method/hasSend');
module.exports = function (config) {
    config = config || {};
    return function (ctx, next) {
        console.log('root');
        // 文件已发送
        if (hasSend(ctx)) {
            return next();
        }
        if (config.root) {
            try {
                var pathname = Url.parse(ctx.request.url).pathname;
                var path = (config.root + '/' + pathname);
                var ext = Path.parse(path).ext;
                if (!ext && config.defaultIndex) {
                    path += '/' + config.defaultIndex;
                }
                path = path.replace(/\/\/[\/]*/g, '/');
                if (fs.existsSync(path)) {
                    console.log('file exist');
                    if (isBinary(path)) {
                        ctx.response.status = 200;
                        ctx.response.body = fs.createReadStream(path);
                    } else {
                        ctx.response.status = 200;
                        ctx.response.body = fs.readFileSync(path, 'utf8');
                    }

                }

            } catch (e) {
                console.log(e);
            }
        }
        return next();
    };
};