var hasSend = require('./method/hasSend');
var isBinary = require('./method/isBinary');
var isLocal = require('./method/isLocal');
var sendFile = require('./method/sendFile');
var fullUrl = require('./method/fullUrl');

module.exports = function () {
    var proxy = this;
    return function (ctx, next) {
        ctx.proxy = proxy;
        ctx.hasSend = hasSend.bind(ctx);
        ctx.isBinary = isBinary.bind(ctx);
        ctx.isLocal = isLocal.bind(ctx);
        ctx.sendFile = sendFile.bind(ctx);
        ctx.fullUrl = fullUrl.bind(ctx);
        ctx.request.fullUrl = ctx.fullUrl;
        ctx.logger = proxy.logger;
        return next();
    };
}