module.exports = function (proxy) {
    Object.defineProperties(proxy, {
        middleware: {
            get: function () {
                return this.app.middleware;
            },
            set: function (val) {
                if (val instanceof Array) {
                    this.app.middleware = val;
                }
                return val;
            }
        }
    });
};