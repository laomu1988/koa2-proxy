# 基于koa2的代理工具

## 功能
* 代理http和https
* 转发本地请求到网络
* 本地服务器
* 本地模拟数据配置
* 解析smarty模板
* 随意修改请求和响应结果


## 安装
安装node之后执行
```
npm install koa2-proxy
```

## 使用
```
var proxy = require('koa2-proxy');

// 本地静态服务器
proxy.static(__dirname);

// 本地模拟文件
proxy.mockfile(__dirname + '/mockfile.txt');

// 解析smarty模板
proxy.smarty({ext: '.html', data: {data: 'smarty html'}});

// 转发请求到指定host
proxy.when('/api', function(ctx) {
    ctx.request.host = 'www.test.com';
    ctx.request.protocol = 'http';
});

// 配置代理请求结束后修改body
proxy.when({'.html', phase: 'response'}, function(ctx) {
    ctx.response.body += '<div>test</div>';
});

// 请求开始时转发本地请求到网络
proxy.on('start', function (ctx) {
    console.log('start: ', ctx.request.url, ctx.isLocal());
    ctx.request.host = 'www.koa2.com';
});
// 请求结束时输出状态
proxy.on('end', function (ctx) {
    console.log('end: ' + ctx.response.status);
    console.log('end: ' + ctx.response.get('content-type'));
    // console.log('end: ' + ctx.response.body);
});

// 监听端口
proxy.listen(3010);
```

## 增加属性
* proxy.app koa的实例:proxy.app = new koa();
* proxy.httpServer  http服务器， 只有当http服务器启动后才会赋值（http-server-start事件）
* proxy.httpsServer https服务器， 只有当http服务器启动后才会赋值（https-server-start事件）
* proxy.localip 本地ip地址,listen后生效
* proxy.localhost 本地ip地址+监听host, listen后生效
* ctx.proxy  proxy
* request.body 请求的form表单数据

## 增加函数
* proxy.static(root,opts) 静态文件服务器
* proxy.when(conditions,callback) 增加中断和处理内容
* proxy.mockfile(mockfile) 模拟文件路径
* proxy.smarty({ext:'',data:data}) 解析smarty模板，data可以是json数据或者func,func参数为文件路径
* proxy.listen(port|config) 启动监听端口,假如需同时启动https,可以proxy.listen({port:3000,https:true}),则会自动增加https监听
* ctx.hasSend() 判断是否发送过数据
* ctx.isLocal() 判断当前请求是否是请求本地文件
* ctx.isBinary(filename) 判断本地文件是否是二进制文件
* ctx.sendFile(filepath) 发送本地文件


## 事件(proxy.on(event,function(data){}))
* http-server-start http服务器启动完成后触发
* https-server-start  https服务器启动完成后触发
* start: 请求开始时触发
* end: 请求结束时触发


### 本地开发

执行**npm install** 安装依赖
执行**npm run build** 编译src到lib目录


### 注意问题
* ctx.request.host不能直接修改，需要通过ctx.request.header.host修改

## api详细解释

