var koa = require('koa');

var app = new koa();
app.use(function(ctx) {
    return new Promise((resolve, reject) => {
        let postdata = '';
        ctx.req.addListener('data', (data) => {
            postdata += data
        })
        ctx.req.addListener('end',function() {
            try {
                console.log('body:', ctx.request, postdata);
                ctx.body = JSON.parse(postdata);
                resolve();
            }
            catch(e) {
                reject(e);
            }
            
        })
    })
})

app.listen(4000, function(err) {
    if(err) {
        console.log(err);
    }
    else {
        console.log('start server:  http://localhost:4000/')
    }
})