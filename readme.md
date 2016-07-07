# 基于koa2的代理工具

## 功能
* 代理http和https
* 转发本地请求到网络
* 本地服务器
* 本地模拟数据配置
* 解析smarty模板
* 随意修改请求和响应结果


## 安装
```
npm install koa2-proxy
```

## 使用
```
var proxy = require(__dirname + './../lib/index');

// 本地静态服务器
proxy.static(__dirname);

// 本地模拟文件
proxy.mockfile(__dirname + '/mockfile.txt');

// 解析smarty模板
proxy.smarty({ext: '.html', data: {data: 'smarty html'}});

//
proxy.on('start', function (ctx) {
    console.log('start: ', ctx.request.url, ctx.isLocal());
    // 请求开始时转发本地请求到网络
    ctx.request.host = 'www.koa2.com';
});
proxy.on('end', function (ctx) {
    // 请求结束时
    console.log('end: ', ctx.request.url);
});

// 监听端口
proxy.listen(3010);

```
## Todo:
* 请求的图片数据怎么保存到本地
* 在浏览器中查看请求数据（代理或者本地等数据）
* 命令行工具

## 增加属性
* proxy.app koa的实例:proxy.app = new koa();
* proxy.httpServer  http服务器， 只有当http服务器启动后才会赋值（http-server-start事件）
* proxy.httpsServer https服务器， 只有当http服务器启动后才会赋值（https-server-start事件）


## 增加函数
* proxy.static(root) 静态文件服务器
* proxy.mockfile(mockfile) 模拟文件路径
* proxy.smarty({ext:'',data:data}) 解析smarty模板，data可以是json数据或者func,func参数为文件路径
* ctx.hasSend() 判断是否发送过数据
* ctx.isLocal() 判断当前请求是否是请求本地文件
* ctx.isBinary(filename) 判断本地文件是否是二进制文件
* ctx.sendFile(filepath) 发送本地文件


## 事件(proxy.on(event,function(data){}))
* http-server-start http服务器启动完成后触发
* https-server-start  https服务器启动完成后触发
* start: 请求开始时触发
* end: 请求结束时触发