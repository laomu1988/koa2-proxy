'use strict';

module.exports = function () {
    var request = this.request;
    return request.protocol + '://' + request.header.host + request.url;
};