'use strict';

var hasSend = require('./method/hasSend');
var isBinary = require('./method/isBinary');
var isLocal = require('./method/isLocal');

module.exports = function (objs) {

    return function (ctx, next) {
        ctx.hasSend = hasSend.bind(ctx, ctx);
        ctx.isBinary = isBinary.bind(ctx);
        ctx.isLocal = isLocal.bind(ctx, ctx);
        if (objs) {
            for (var attr in objs) {
                ctx[attr] = objs[attr].bind(ctx);
            }
        }
        return next();
    };
};