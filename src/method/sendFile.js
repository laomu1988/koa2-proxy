var fs = require('fs');
var Path = require('path');


function getContentType(filepath) {
    var ext = Path.extname(filepath);
    switch (ext) {
        case '.html':
        case '.htm':
        case '.tpl':
            return 'text/html;charset=utf-8';
        case '.css':
            return 'text/css;charset=UTF-8;';
        default:
            return 'text/*;charset=UTF-8';
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
        return true;
    }
    return false;
};