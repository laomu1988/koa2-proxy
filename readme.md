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

###  proxy.listen(3000)

启动监听端口,启动http和https服务器和代理,默认不启动https代理

*  {number|object} config 当为number时,表示http服务器端口号,默认3000。
         当为object时,存在下列参数
*  {number} config.port http服务器端口号
*  {boolean} config.https 是否启动https代理,默认不启动
*  {string} config.loadCertUrl 下载密匙的链接,只要配置代理后访问带有该链接的地址就可以下载密匙,默认: proxy.com
*  {string} config.key https服务器的密匙,可省略
*  {string} config.cert https服务器的公匙,可省略(密匙和公匙必须配对)
*  {function} callback 启动http服务器后的回调函数,参数err


**示例:**

```
var proxy = require('koa2-proxy');
proxy.static(__dirname + '/output/');
proxy.listen(8000);
```


**示例:**

```
// 启动https代理,则可以如下配置
var proxy = require('koa2-proxy');
proxy.static(__dirname + '/output/');
proxy.listen({port: 8000,https: true});
```


###  proxy.when([condition,] callback)

当请求的内容和condition匹配时,执行callback

*  condition
       {string|reg} condition url包含string或者reg.test(url)为tru时,将执行callback
       {object} condition 匹配条件列表,其属性值可以是header的字段或者host,fullUrl,url,phase,method等
           - {string|reg|function} condition.url 匹配url(host之后的部分)
           - {string|reg|function} condition.fullUrl (匹配)
           - {string} condition.phase 匹配阶段,request或者response,默认request
           - {string|reg|function} condition.cookie
           - {string|reg|function} ...  匹配其他任意header字段
*  {function} callback 匹配时执行的函数,参数ctx


**示例:** test.html的内容设置为test

```
proxy.when('test.html',function(ctx){
    ctx.response.body = 'test';
});
```


**示例:** test.html的内容增加一个div

```
proxy.when({url:'test.html',phase: 'response' },function(ctx){
    ctx.response.body +='<div>test</div>';
});
```


###  proxy.index('/index.html')

浏览根网址时自动跳转到指定地址

*  {string} url 跳转地址,默认/index.html


###  proxy.mockfile(mockfile, needLocal)

匹配规则之后发送模拟数据,主要用来mock请求数据

*  {string} mockfile 匹配规则文件路径
 匹配规则说明
 匹配规则对应文件只有以下列单词开头的行才会匹配规则,其他任何内容开头将作为注释
     root folder # 指定根目录(其他文件地址相对mockfile文件地址)
     rewrite reg rewriteUrl #匹配到正则，发送文件
     replace reg replaceWith  #修改请求url,替换reg的内容为replaceWith
     redirect reg redirectUrl #匹配到正则，则转发到新的url
     exec reg execFile
*  {boolean} needLocal 是否需要是本地请求,默认true,主要用来避免代理时污染代理请求


**示例:** 配置某个文件作为模拟规则文件

```
proxy.mockfile(__dirname + '/server.conf');
```


**示例:** 部分路径不使用模拟文件配置

```
proxy.when('/test1/',function (ctx) {
    ctx.mockfile = false;
});
proxy.mockfile(__dirname + '/server.conf');
```


###  proxy.open('/index.html')

使用浏览器打开指定网页,假如不指定域名,则会使用localhost和监听端口(listen调用时的监听端口)

*  {string} url 打开的网址


###  proxy.static(root, opts)

创建静态文件服务器

*  {string} root 静态文件根目录
*  {object} opts 其他可选参数
         - opts.path {string}  匹配的路径,匹配到该路径时,匹配后剩余的路径存在文件时才发送文件,默认为空
         - opts.index {string|array} 假如浏览的是目录,则自动发送其下存在的文件,默认为index.html,可以指定多个文件,例如["index.html","index.htm"]
         - opts.list  当浏览的是目录并且不存在默认发送文件时,发送目录下文件列表
             - {boolean}  是否发送文件列表
             - {string} 内容不为空时发送,opt.list将一起发送
             - {function} 自定义发送内容格式,参数(list, pathname, localFolder)


**示例:**

```
proxy.static(__dirname + '/output', {path: '/static/', index: 'index.html'});
```

## 版本更新(使用lazy-doc打包自doc/history.md)
* **1.1.7(2017.11.09)**
    - fix: issues/5 文件读取函数错误；转发application/json格式
* **1.1.6(2017.11.09)**
    - fix: issues/4 修改protocol不生效的问题
* **1.1.4(2017.09.15)**
    - feat: 使用mime-types计算文件的content-type
    - fix: 部分文件类型计算问题，form-data判定问题
* **1.1.3(2017.08.03)**
    - fix：上传文件bug
* **1.1.2(2017.07.31)**
    - fix无文件时body错误
* **1.1.0(2017.07.27)**
    - 静态资源文件夹路径增加斜线
    - 使用`koa-match`替代内置when
    - 上传文件处理
* **1.0.17(2017.03.01)**
    - 增加函数proxy.index,浏览根目录时自动跳转
* **1.0.16(2017.03.01)**
    - 增加函数proxy.open,自动打开浏览器
* **1.0.15(2017.02.23)**
    - 完善dependencies
* **1.0.14(2016.12.29)**
    - 使用.npmignore配置npm发布时目录
* **1.0.13(2016.12.06)**
    - mockfile第二个参数的needLocal默认值改为false
    - ctx.mockfile设为false时将不使用模拟配置
* **1.0.12(2016.10.18)**
    - 取消版本检查
    - 删除加载数据header的content-length
    - 文件列表样式
* **1.0.11(2016.08.18)**
    - proxy.static增加显示文件夹内文件列表
* **1.0.10(2016.08.12)**
    - 使用lazy-doc生成文档
    - when增加支持method和host等
    - when(condition,callback)的condition可以忽略,这时所有的请求都将调用callback
* **1.0.9(2016.08.11)**
    - 检查是否存在新版本并提示
    - 修复一些bug;
* **1.0.5(2016.07.26)**
    - proxy.smarty({ext:,root:,data:}): 完善smarty函数
* **1.0.4(2016.07.22)**
    - proxy.when(conditions, callback):参数conditions增加local
    - proxy.static(root, opts): 参数opts增加path和index
* **1.0.3(2016.07.15)**
    - 增加request.body
    - 请求form发送
    - 增加proxy.localip和proxy.localhost
    - 默认取消监听https,只有显示指示https时才启动https
* **1.0.2** load模块bug修复
* **1.0.1** 增加proxy.when等函数，远程加载图片内容
* **1.0.0** 代理功能
