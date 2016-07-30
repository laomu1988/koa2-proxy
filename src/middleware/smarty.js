/**
 * 为本地文件构建模拟smarty环境
 * */
var smarty = require('smarty4js');
var Path = require('path');
var fs = require('fs');
var s = new smarty();


// 解析带有__inline__的json内容
function readJSON(filepath) {
    if (!fs.existsSync(filepath)) {
        return '';
    }
    // json数据文件路径
    var str = fs.readFileSync(filepath, 'utf8');
    if (str.indexOf('__inline__') >= 0) {
        str = str.replace(/\"\s*__inline__[\s]*([^\n")]*)["]/g, function (str, newPath) {
            // console.log('inline-file path:', Path.resolve(Path.dirname(filepath), newPath));
            return readJSON(Path.resolve(Path.dirname(filepath), newPath));
        });
    }
    return str;
}


function handleData(data, path, ctx) {
    var newData;
    if (typeof data == 'string') {
        // config.data为字符串时,代表json数据文件路径
        newData = readJSON(data);
        try {
            // console.log(newData);
            newData = JSON.parse(newData);
        } catch (e) {
            ctx.logger.warning('koa2-proxy: proxy.smarty JSON.parse file to json error: file ', data, e);
        }
        return newData;
    } else if (typeof data == 'function') {
        // func
        return data(path);
    } else {
        return data;
    }
}

module.exports = function (config) {
    if (typeof config === 'string') {
        config = {ext: config}
    }
    config = Object.assign({ext: '.html', data: {}, root: Path.dirname(require.main.filename) + '/'}, config);
    if (!config.ext || !config.data) {
        throw new Error('middleware smarty need 2 param: the ext for template and  data');
    }
    s.setBasedir(config.root);

    return async function (ctx, next) {
        ctx.logger.debug('middleware smarty');
        try {
            if (ctx.isLocal()) {
                var filepath;
                if (ctx.hasSend()) {
                    if (ctx._sendFilePath && Path.extname(ctx._sendFilePath) == config.ext) {
                        // 已经发送过文件
                        ctx.response.body = s.render(ctx.response.body, handleData(config.data, ctx._sendFilePath, ctx));
                    }
                } else {
                    // 未发送过文件
                    filepath = Path.resolve(config.root, '.' + ctx.path + config.ext);
                    if (fs.existsSync(filepath)) {
                        ctx.response.body = s.render(filepath, handleData(config.data, filepath, ctx));
                    }
                }

            }
        }
        catch (e) {
            ctx.logger.error('koa-proxy middleware smarty error:', e);
        }
        return next();
    }
};