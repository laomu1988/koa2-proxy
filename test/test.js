var proxy = require(__dirname + './../lib/index');


proxy.use(proxy.static(__dirname));

proxy.on('start', function (ctx) {
    console.log('start: ', ctx.request.url, ctx.isLocal());
});
proxy.on('end', function (ctx) {
    console.log('end: ', ctx.request.url);
});
proxy.listen(3010, function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('start server at http://localhost:3010');
    }
});
