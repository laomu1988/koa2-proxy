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

## 参数详细解释

###  proxy.listen(3000)

启动监听端口,启动http和https服务器和代理,默认不启动https代理
* {number|object} config 当为number时,表示http服务器端口号,默认3000。
          当为object时,存在下列参数
* {number} config.port http服务器端口号
* {boolean} config.https 是否启动https代理,默认不启动
* {string} config.loadCertUrl 下载密匙的链接,只要配置代理后访问带有该链接的地址就可以下载密匙,默认: proxy.com
* {string} config.key https服务器的密匙,可省略
* {string} config.cert https服务器的公匙,可省略(密匙和公匙必须配对)
* {function} callback 启动http服务器后的回调函数,参数err

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

###  proxy.when(condition, callback)

当匹配路径时,回调
* {string|reg|object} conditions 当为string时,表示匹配路径,当为object时,拥有下列参数
* {string} conditions.url
* {string} conditions.fullUrl
* {string} conditions.phase 匹配阶段
**parma**
``` {function} callback 当匹配
```

###  mockfile

匹配规则之后发送模拟数据,主要用来mock请求数据
* {string} mockfile 匹配规则文件路径
      只有规则名称匹配下列内容才会发送数据，其他默认当做注释
      root folder     # 指定根目录(相对mockfile文件地址)
      rewrite reg rewriteUrl #匹配到正则，发送文件
      replace reg replaceWith  #修改请求url,替换reg的内容为replaceWith
      redirect reg redirectUrl #匹配到正则，则转发到新的url
      exec reg execFile
* {boolean} needLocal 是否需要是本地请求,默认true,主要用来避免代理时污染代理请求

###  static

创建静态文件服务器
* {string} root 静态文件根目录
* {object} opts 其他可选参数
* {string} opts.path  匹配的路径,匹配到该路径时,匹配后剩余的路径存在文件时才发送文件,默认为空
* {string|array}  opts.index  假如浏览的是目录,则自动发送其下存在的文件,默认为index.html

**示例:**

```
 proxy.static(__dirname + '/output', {path: '/static/', index: 'index.html'});
```
## 版本更新
* **1.0.10(2016.08.12)**
    - 使用lazy-doc生成文档
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
