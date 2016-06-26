/**
 * 根据扩展名判断文件是否是二进制文件
 * */

var path = require('path');
module.exports = function (filename) {
    if (!filename) {
        return false;
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
            return true;
    }
    return false;
};