var proxy = require(__dirname + './../lib/index');


proxy.static(__dirname);
//
proxy.mockfile(__dirname + '/mockfile.txt');
//
//proxy.smarty({ext: '.html', data: {data: 'smarty html'}});

proxy.when('index.html', function (ctx) {
    console.log('you get index.html');
});
proxy.when({url: 'index.html', phase: 'response'}, function (ctx) {
    console.log('you has get index.html');
});


proxy.on('start', function (ctx) {
    console.log('start: ', ctx.request.url, ctx.isLocal(), ctx.isBinary(ctx.request.url));
    console.log('body', ctx.request.body);
});
proxy.on('end', function (ctx) {
    console.log('end: ', ctx.request.url);
});


proxy.listen(3010);

proxy.browser();