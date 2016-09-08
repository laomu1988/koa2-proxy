/**
 * 创建静态文件服务器
 * @function proxy.static(root, opts)
 * @param {string} root 静态文件根目录
 * @param {object} opts 其他可选参数
 *          - opts.path {string}  匹配的路径,匹配到该路径时,匹配后剩余的路径存在文件时才发送文件,默认为空
 *          - opts.index {string|array} 假如浏览的是目录,则自动发送其下存在的文件,默认为index.html,可以指定多个文件,例如["index.html","index.htm"]
 *          - opts.list  当浏览的是目录并且不存在默认发送文件时,发送目录下文件列表
 *              - {boolean}  是否发送文件列表
 *              - {string} 内容不为空时发送,opt.list将一起发送
 *              - {function} 自定义发送内容格式,参数(list, pathname, localFolder)
 * @example
 * proxy.static(__dirname + '/output', {path: '/static/', index: 'index.html'});
 *
 *
 * @history
 *    - 2016.08.18 增加opts.list,配置可展示目录下文件列表
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
    config = Object.assign({index: 'index.html', path: '', list: true}, config);
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
                        if (!ctx.hasSend() && config.list) {
                            // 没有找到文件
                            pathname = (pathname + '/').replace(/\/+/g, '/');
                            var files = fs.readdirSync(path);
                            var body = '', listType = typeof config.list;
                            if (listType === 'string' || listType == 'boolean') {
                                body = '<!DOCTYPE html><html lang="cn"><head><meta charset="UTF-8">' +
                                    '<meta name="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no"/> ' +
                                    '<meta name="format-detection" content="telephone=no"/> ' +
                                    '<meta name="apple-mobile-web-app-status-bar-style" content="black"> ' +
                                    '<meta name="apple-mobile-web-app-capable" content="yes">' +
                                    '<title>文件列表:' + pathname + '</title> </head> <body>';
                                if (config.list === 'string')   body += config.list;
                                body += '<h1><a href="javascript:history.go(0);" title="点击刷新">' + pathname + '</a></h1>';
                                body += '<p><a href="' + pathname + '../" title="返回上一级">返回上一级</a></p><hr><br>';
                                for (var i = 0; i < files.length; i++) {
                                    body += '<p><a href="' + pathname + files[i] + '" >' + files[i] + '</a></p>';
                                }
                                body += '</body></html>';
                            } else if (listType == 'function') {
                                body = config.list(list, pathname, path);
                            }
                            if (body) ctx.response.body = body;
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