'use strict';

/**
 *  匹配规则之后发送模拟数据,主要用来mock请求数据
 *  @function mockfile
 *  @param {string} mockfile 匹配规则文件路径
 *      只有规则名称匹配下列内容才会发送数据，其他默认当做注释
 *      root folder     # 指定根目录(相对mockfile文件地址)
 *      rewrite reg rewriteUrl #匹配到正则，发送文件
 *      replace reg replaceWith  #修改请求url,替换reg的内容为replaceWith
 *      redirect reg redirectUrl #匹配到正则，则转发到新的url
 *      exec reg execFile
 *  @param {boolean} needLocal 是否需要是本地请求,默认true,主要用来避免代理时污染代理请求
 * */
var fs = require('fs');
var Path = require('path');

module.exports = function (mockfile, needLocal) {
    var proxy = this;
    if (!mockfile) {
        proxy.logger.error('koa-proxy.mockfile need one param: mockfile');
        return;
    }

    if (!fs.existsSync(mockfile)) {
        proxy.logger.error('koa-proxy.mockfile: There is no File:' + mockfile);
        return;
    }
    if (typeof needLocal == 'undefined') {
        needLocal = true;
    }
    return function (ctx, next) {
        ctx.logger.debug('middleware: mockfile');
        // 文件已发送
        if (ctx.hasSend() || needLocal && !ctx.isLocal()) {
            return next();
        }
        Mockfile(ctx, mockfile);
        return next();
    };
};
function Mockfile(ctx, mockfile) {
    try {
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
                var method = params[0];
                if (method !== 'replace' && method !== 'redirect' && method !== 'rewrite' && method !== 'exec') {
                    continue;
                }
                var reg = new RegExp(params[1]);
                if (!reg.test(path)) {
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
                        path = Path.resolve(Path.dirname(mockfile), path);
                    } else {
                        path = Path.resolve(Path.dirname(require.main.filename), '.' + path);
                    }
                } else {
                    path = Path.resolve(Path.dirname(mockfile), path);
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