'use strict';

/**
 * 判断是否存在本地文件数据,返回文件路径
 *    序为
 *  1.mockfile
 *  2.mockup
 *  3.node_module/bnjs/mock
 *         规则：
 *  config.mockup obj|str
 *      {attr: val} 假如路径以attr开头，则替换attr为val后判断文件是否存在
 *      str 则将mockup作为根目录，根据请求文件路径看是否匹配到本地文件
 *  config.mockfile txt             才会匹配，其他默认当做注释
 *      root folder                                        ）
 *      rewrite reg rewriteUrl #匹配到正则，发送文件
 *      replace reg replaceWith                   内容部分
 *      redirect reg redirectUrl #匹配到正则，则转发到新的url
 *      exec reg execFile
 * */
var fs = require('fs');
var Path = require('path');

module.exports = function (config) {
    if (typeof config == 'string') {
        config = { mockfile: config };
    }
    config = config || {};
    if (config.mockfile && !fs.existsSync(config.mockfile)) {
        throw new Error('There is no File: ' + config.mockfile);
    }

    return function (ctx, next) {
        ctx.logger.debug('middleware: mockfile');
        // 文件已发送
        if (ctx.hasSend()) {
            return next();
        }

        var promise = null;
        if (config.mockfile) {
            mockfile(ctx, config);
        }
        return next();
    };
};
function mockfile(ctx, config) {
    try {
        var mockfile = config.mockfile;
        // console.log('mockfile:', config.mockfile);
        var content = fs.readFileSync(mockfile, 'utf8');
        var lines = content.split('\n');
        var root = '';
        for (var i = 0; i < lines.length; i++) {
            var params = (lines[i] + '').replace(/\s+/g, ' ').split(' ');
            if (params[0] == 'root' && params.length > 1) {
                root = params[1];
                continue;
            }
            if (params.length >= 3) {
                var path = ctx.url;
                // console.log('mockrule: ', params);
                var reg = new RegExp(params[1]),
                    method = params[0];
                if (method !== 'replace' && method !== 'redirect' && method !== 'rewrite' && method !== 'exec' || !reg.test(path)) {
                    continue;
                }
                if (method === 'redirect') {
                    //res.redirect(params[2]);
                    // console.log('redirect:', params[2]);
                    ctx.response.redirect(params[2]);
                    return;
                }
                switch (params[0]) {
                    case 'replace':
                        path = path.replace(reg, params[2]);
                        break;
                    case 'rewrite':
                    case 'exec':
                        path = params[2];
                        break;
                }
                if (path.charAt(0) == '/') {
                    if (root) {
                        path = root + path;
                        path = Path.resolve(Path.dirname(config.mockfile), path);
                    } else if (config.root) {
                        path = config.root + path;
                    } else {
                        path = Path.resolve(Path.dirname(require.main.filename), '.' + path);
                    }
                } else {
                    path = Path.resolve(Path.dirname(config.mockfile), path);
                }
                ctx.logger.debug('judgemockpath:', path);
                // console.log('mockTestPath:', path);
                if (sendMockFile(ctx, path, params[0])) {
                    return;
                }
            }
        }
    } catch (e) {
        ctx.logger.error('MockFileError:', e);
    }
}

function sendMockFile(ctx, filepath, method) {
    if (!fs.existsSync(filepath)) {
        return false;
    }
    if (method === 'exec') {
        if (require.cache && require.cache[filepath]) {
            require.cache[filepath] = undefined;
        }
        var exec = require(filepath);
        if (typeof exec == 'function') {
            exec(ctx);
            ctx.info = 'MockExeFile:' + filepath;
            return true;
        } else {
            ctx.logger.warn('mockfile exec rule need js to export an function:', filepath);
        }
    } else {
        ctx.info = 'MockFile:' + filepath;
        ctx.sendFile(filepath);
    }
    return true;
}