'use strict';

/**
 * 取得文件的路径
 * @module ctx
 * @function getFilePath
 * @param {string} refPath 要取得文件的路径
 * @param {string} refFile 取得的文件规则是相对于哪个文件
 * @param {string} root 根目录路径(假如文件是绝对路径时使用)
 * */

var Path = require('path');

module.exports = function (refPath, refFile, root) {
    if (!refPath) {
        return null;
    }
    if (refPath.charAt(0) == '/') {
        if (root) {
            refPath = root + refPath;
            return Path.resolve(Path.dirname(refFile), refPath); // 避免root也是相对地址的情况
        } else {
                return Path.resolve(Path.dirname(require.main.filename), '.' + refPath);
            }
    } else {
        refPath = Path.resolve(Path.dirname(refFile), refPath);
    }
    return refPath;
};