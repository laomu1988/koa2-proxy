/**
 * 创建静态文件服务器
 * @function static
 * @param {string} root 静态文件根目录
 * @param {object} opts 其他可选参数
 * @param {string} opts.path  匹配的路径,匹配到该路径时,匹配后剩余的路径存在文件时才发送文件,默认为空
 * @param {string|array}  opts.index  假如浏览的是目录,则自动发送其下存在的文件,默认为index.html
 * @example
 * proxy.static(__dirname + '/output', {path: '/static/', index: 'index.html'});
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