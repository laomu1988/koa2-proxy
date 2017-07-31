require('babel-core/register')
require('babel-polyfill')
// require('./assist/update');
var koa = require('koa')
var bodyParser = require('koa-body')
var listen = require('./listen')
var logger = require('logger-color')
var match = require('koa2-match')
var proxy = {}
var app = new koa()
proxy.app = app
proxy.use = app.use.bind(app)

proxy.static = function () {
    app.use(require('./middleware/static').apply(proxy, arguments))
}
proxy.mockfile = function () {
    app.use(require('./middleware/mockfile').apply(proxy, arguments))
}
proxy.slow = function () {
    app.use(require('./middleware/slow').apply(proxy, arguments))
}

proxy.smarty = function () {
    app.use(require('./middleware/smarty').apply(proxy, arguments))
}

var addMatched = false
/**
 * 当请求的内容和condition匹配时,执行callback
 * @function proxy.when([condition,] callback)
 * @index 99
 * @param condition
 *        {string|reg} condition url包含string或者reg.test(url)为tru时,将执行callback
 *        {object} condition 匹配条件列表,其属性值可以是header的字段或者host,fullUrl,url,phase,method等
 *            - {string|reg|function} condition.url 匹配url(host之后的部分)
 *            - {string|reg|function} condition.fullUrl (匹配)
 *            - {string} condition.phase 匹配阶段,request或者response,默认request
 *            - {string|reg|function} condition.cookie
 *            - {string|reg|function} ...  匹配其他任意header字段
 * @param {function} callback 匹配时执行的函数,参数ctx
 * @example test.html的内容设置为test
 * proxy.when('test.html',function(ctx){
 *     ctx.response.body = 'test';
 * });
 * @example test.html的内容增加一个div
 * proxy.when({url:'test.html',phase: 'response' },function(ctx){
 *     ctx.response.body +='<div>test</div>';
 * });
 *
 */
proxy.when = function () {
    match.match.apply(match, arguments)
    if (!addMatched) {
        addMatched = true
        app.use(match.callback())
    }
}

// proxy.browser = function (server) {
//    require('./browser').bind(proxy)(server);
// };

proxy.listen = listen.bind(proxy)
proxy.logger = logger
proxy.open = require('./open').bind(proxy)

var Event = require('events').EventEmitter
var event = new Event()
proxy.on = proxy.bind = function () {
    event.on.apply(event, arguments)
}

proxy.emit = proxy.trigger = function () {
    event.emit.apply(event, arguments)
}

// 初始化
logger.setLevel('notice')
require('./extends_proxy')(proxy)
proxy.use(bodyParser({multipart: true}))
proxy.use(function (ctx, next) {
    var body = ctx.request.body
    if (body && body.fields && body.files) {
        console.log('body:', body);
        ctx.request._body = body
        ctx.request.body = body.fields
        ctx.request.files = body.files
    }
    return next()
})
proxy.use(require('./extends_ctx').bind(proxy)())

// 错误处理
process.on('uncaughtException', function (err) {
    proxy.logger.error('uncaughtException', err, err.stack)
})

process.on('Error', function (err) {
    proxy.logger.error('catchError:', err, err.stack)
})

/**
 * 浏览根网址时自动跳转到指定地址
 * @function proxy.index('/index.html')
 * @index 98
 * @param {string} url 跳转地址,默认/index.html
 *
 */
proxy.index = function (url) {
    var index = url || '/index.html'
    proxy.when({url: /^[\/\s]*$/}, function (ctx) {
        ctx.response.redirect(index)
    })
    return proxy
}

module.exports = proxy
