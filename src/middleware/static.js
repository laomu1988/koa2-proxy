/**
 * 匹配本地文件，发送文件
 *
 * config
 *   root: 项目根目录
 *   defaultIndex: 'index.html'
 *   sendList: ''
 * */

var fs = require('fs');
var Path = require('path');
var Url = require('url');

module.exports = function (config) {
    if (typeof config === 'string') {
        config = {
            root: config,
            defaultIndex: 'index.html'
        };
    }
    config = Object.assign(config, {defaultIndex: 'index.html'});
    if (config.root) {
        config.root = Path.resolve(config.root);
    }
    return function (ctx, next) {
        ctx.logger.debug('middleware: static(root:"' + config.root + '")');
        // 文件已发送
        if (ctx.hasSend()) {
            return next();
        }
        if (config.root) {
            try {
                var pathname = Url.parse(ctx.request.url).pathname;
                var path = Path.resolve(config.root, '.' + pathname);
                if (fs.existsSync(path)) {
                    var stat = fs.statSync(path);
                    if (stat.isDirectory()) {
                        if (config.defaultIndex) {
                            ctx.sendFile(Path.resolve(path, config.defaultIndex));
                        }
                    } else {
                        ctx.sendFile(path);
                    }
                }

            } catch (e) {
                console.log(e);
            }
        }
        return next();
    };
};