"use strict";

module.exports = function (proxy) {
    Object.defineProperties(proxy, {
        middleware: {
            get: function get() {
                return this.app.middleware;
            },
            set: function set(val) {
                if (val instanceof Array) {
                    this.app.middleware = val;
                }
                return val;
            }
        }
    });
};