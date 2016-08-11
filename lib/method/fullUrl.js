'use strict';

module.exports = function () {
    var request = this.request;
    if (request.url.indexOf('http') == 0) {
        return request.url;
    }
    return request.protocol + '://' + request.header.host + request.url;
};