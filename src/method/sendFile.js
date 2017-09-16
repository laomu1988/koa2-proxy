/**
 * 发送文件
 */
var fs = require('fs');
var Path = require('path');
var mime = require('mime-types');

module.exports = function (filepath) {
    if (fs.existsSync(filepath)) {
        this._sendFilePath = filepath;
        this.logger.debug('sendFile:', filepath);
        if (this.isBinary(filepath)) {
            this.response.body = fs.createReadStream(filepath);
        }
        else {
            this.response.body = fs.readFileSync(filepath, 'utf8');
        }
        var contentType = mime.lookup(filepath);
        if (contentType) {
            this.response.header['content-type'] = contentType;
        }
        return true;
    }

    return false;
};
