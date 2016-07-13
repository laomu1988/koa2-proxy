var proxy = require(__dirname + './../lib/index');


proxy.on('start', function (ctx) {
    console.log('start: ', ctx.request.url, ctx.isLocal(), ctx.isBinary(ctx.request.url));
    console.log('body', ctx.request.body);
});
proxy.on('end', function (ctx) {
    console.log('end: ', ctx.request.fullUrl());
    console.log('body', ctx.response.body);
});


proxy.listen({port: 3010, https: true});