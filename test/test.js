var proxy = require(__dirname + './../lib/index');

var config = {
    root: __dirname + '/',
    port: 3004
};

var app = proxy(config);
