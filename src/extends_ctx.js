var hasSend = require('./method/hasSend');
var isBinary = require('./method/isBinary');
var isLocal = require('./method/isLocal');
var sendFile = require('./method/sendFile');
var fullUrl = require('./method/fullUrl');

function reqSet(filed, val) {
    if (2 == arguments.length) {
        if (Array.isArray(val)) val = val.map(String);
        else val = String(val);
        this.header[(field + '').toLowerCase()] = val;
    } else {
        for (const key in field) {
            this.header[(key + '').toLowerCase()] = field[key];
        }
    }
};

function extendRequest(req) {
    req.set = reqSet.bind(req);
    Object.defineProperties(req, {
        host: {
            get: function () {
                const proxy = this.app.proxy;
                let host = proxy && this.get('X-Forwarded-Host');
                host = host || this.get('Host');
                if (!host) return '';
                return host.split(/\s*,\s*/)[0];
            },
            set: function (host) {
                const proxy = this.app.proxy;
                if (proxy) {
                    this.header['X-Forwarded-Host'] = host;
                } else {
                    this.header['host'] = host;
                }
                return host;
            },
            enumerable: true,
            configurable: true
        }
    });
}


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
        extendRequest(ctx.request);
        return next();
    };
}