'use strict';

var fs = require('fs');
module.exports = function (filepath) {
    if (fs.existsSync(filepath)) {
        if (this.isBinary(filepath)) {
            this.response.body = fs.createReadStream(filepath);
        } else {
            this.response.body = fs.readFileSync(filepath, 'utf8');
        }
    }
};