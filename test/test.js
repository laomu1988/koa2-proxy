var proxy = require(__dirname + './../lib/index');


proxy.static(__dirname);

proxy.mockfile(__dirname + '/mockfile.txt');

proxy.smarty({ext: '.html', data: {data: 'smarty html'}});


proxy.on('start', function (ctx) {
    console.log('start: ', ctx.request.url, ctx.isLocal());
});
proxy.on('end', function (ctx) {
    console.log('end: ', ctx.request.url);
});


proxy.listen(3010);

proxy.browser();