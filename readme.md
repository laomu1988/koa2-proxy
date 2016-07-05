# 基于koa的代理工具

## 安装
```
npm install koa-proxy
```
## 功能
* 代理http和https
* 本地服务器
* 本地模拟数据配置
* 解析smarty模板
* 随意修改请求和响应结果

## 使用
```
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

```
## Todo:
* 请求的图片数据怎么保存到本地
* 在浏览器中查看请求数据（代理或者本地等数据）
* 命令行工具

## 增加函数
proxy.static(root) 静态文件服务器
proxy.mockfile(mockfile) 模拟文件路径
proxy.smarty({ext:'',data:data}) 解析smarty模板，data可以是json数据或者func,func参数为文件路径
ctx.hasSend() 判断是否发送过数据
ctx.isLocal() 判断当前请求是否是请求本地文件
ctx.isBinary(filename) 判断本地文件是否是二进制文件
ctx.sendFile(filepath) 发送本地文件