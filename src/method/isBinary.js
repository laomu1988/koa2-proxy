/**
 * 根据扩展名判断文件是否是二进制文件
 * */

var path = require('path');
var mime = require('mime-types');
module.exports = function (filename) {
    if (!filename) {
        return false;
    }

    var contentType = mime.lookup(filename);
    if (contentType && contentType.match(/(text|html|xml|json|javascript|svg)/)) {
        return false;
    }

    var len = filename.indexOf('?');
    if (len > 0) {
        filename = filename.substr(0, len);
    }

    len = filename.indexOf('#');
    if (len > 0) {
        filename = filename.substr(0, len);
    }

    var ext = path.extname(filename);
    switch (ext) {
        case '.rar':
        case '.zip':
        case '.jpg':
        case '.png':
        case '.gif':
        case '.bmp':
        case '.psd':
        case '.ico':
        case '.icon':
        case '.ttf':
        case '.eot':
        case '.woff':
        case '.swf':
        case '.flv':
        case '.mp4':
            return true;
    }
    return false;
};
