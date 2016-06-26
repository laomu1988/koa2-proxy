console.log('is starting');
require("babel-core/register");
require("babel-polyfill");
var koa = require('koa');
var listen = require('./listen');


var config = {
    port: 3000,
    https: 3001,
    http: 3002
};


var app = new koa();
var load = require('./load');

// x-response-time,logger
app.use(async (ctx, next) => {
    var start = new Date;
    try {
        await next();
    } catch (e) {

    }
    var ms = new Date - start;
    ctx.set('X-Response-Time', ms + 'ms');
    if (typeof ctx.response.statusCode == 'undefined' && !ctx.response.body) {
        ctx.response.statusCode = 404;
        ctx.response.body = 'not found';
    }
    console.log('%s:%s status:%s,time:%s', ctx.method, ctx.url, ctx.response.statusCode, ms);
});

var slow = require('koa-slow');

// app.use(slow({delay: 1000}));
// npm install regenerator -r server.asyncawait.js | node
// response
app.use(load);

//app.use(function *() {
//    this.body = 'Hello World';
//});
listen(3000, app.callback());