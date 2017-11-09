var proxy = require('../lib/index.js');
proxy.when(/api\/json/, function (ctx) {
    ctx.request.host = 'localhost:4000';
    ctx.request.path = '/api/test'
    ctx.request.method = 'put';
    ctx.request.header['content-type'] = 'application/json;charset=UTF-8';
    ctx.request.header['accept'] = 'application/json, text/plain, */*';
    console.log('content:', ctx.request.header['content-type']);
    ctx.request.body = {
        name: 'ddd_test',
        parent_id: 151,
        sort: 7
    }
});

proxy.listen(3000);