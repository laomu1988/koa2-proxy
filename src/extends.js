var hasSend = require('./method/hasSend');
var isBinary = require('./method/isBinary');
var isLocal = require('./method/isLocal');
var sendFile = require('./method/sendFile');

module.exports = function () {
    var proxy = this;
    return function (ctx, next) {
        ctx.hasSend = hasSend.bind(ctx);
        ctx.isBinary = isBinary.bind(ctx);
        ctx.isLocal = isLocal.bind(ctx);
        ctx.sendFile = sendFile.bind(ctx);
        ctx.logger = proxy.logger;
        return next();
    };
}