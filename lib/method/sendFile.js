'use strict';

var fs = require('fs');
var Path = require('path');

function getContentType(filepath) {
    var ext = Path.extname(filepath);
    console.log('setcontentType：', ext);
    switch (ext) {
        case '.html':
            return 'text/html;charset=utf-8';
        case '.css':
            return 'text/css';
        default:
            return 'text/*';
    }
}

module.exports = function (filepath) {
    if (fs.existsSync(filepath)) {
        this._sendFilePath = filepath;
        this.logger.debug('sendFile:', filepath);
        if (this.isBinary(filepath)) {
            this.response.body = fs.createReadStream(filepath);
        } else {
            this.response.body = fs.readFileSync(filepath, 'utf8');
            this.response.header['content-type'] = getContentType(filepath);
        }
    }
};