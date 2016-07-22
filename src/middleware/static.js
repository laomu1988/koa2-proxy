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

module.exports = function (root, config) {
    var proxy = this;
    if (!root) {
        proxy.logger.error('koa-proxy.static need one param as server root.');
        return;
    }
    if (arguments.length == 2) {
        config.root = root;
    } else {
        config = {root: root};
    }
    config = Object.assign({index: 'index.html', path: ''}, config);
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
                if (config.path) {
                    var index = pathname.indexOf(config.path);
                    if (index == 0 || index == 1) {
                        pathname = pathname.substr(config.path.length + index);
                    } else {
                        return next();
                    }
                }
                var path = Path.resolve(config.root, './' + pathname);
                if (fs.existsSync(path)) {
                    var stat = fs.statSync(path);
                    if (stat.isDirectory()) {
                        if (typeof config.index == 'string') {
                            ctx.sendFile(Path.resolve(path, config.index));
                        } else if (config.index instanceof Array) {
                            for (var i = 0; i < config.index.length; i++) {
                                if (ctx.sendFile(Path.resolve(path, config.index[i]))) {
                                    break;
                                }
                            }
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