var hasSend = require('./method/hasSend');
var isBinary = require('./method/isBinary');
var isLocal = require('./method/isLocal');
var sendFile = require('./method/sendFile');

module.exports = function (objs) {

    return function (ctx, next) {
        ctx.hasSend = hasSend.bind(ctx, ctx);
        ctx.isBinary = isBinary.bind(ctx);
        ctx.isLocal = isLocal.bind(ctx);
        ctx.sendFile = sendFile.bind(ctx);
        if (objs) {
            for (var attr in objs) {
                ctx[attr] = objs[attr].bind(ctx);
            }
        }
        return next();
    };
}