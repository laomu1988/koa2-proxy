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
