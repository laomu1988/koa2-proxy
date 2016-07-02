# 基于koa的代理工具

## 安装
```
npm install koa-proxy
```

## 使用
```

```
## Todo:
* 设置发送速度
* 动态修改发送数据
* 同一端口实现http和https服务
* 请求的数据加载完毕后再发送
* 请求的图片数据怎么保存到本地
* 在浏览器中查看请求数据（代理或者本地等数据）
* 命令行工具

## 增加函数
app.root 静态文件路径 app.use(app.root('path'))
app.mock 模拟文件路径 app.use(app.mock('path'))
ctx.hasSend() 判断是否发送过数据
ctx.isLocal() 判断当前请求是否是请求本地文件
ctx.isBinary(filename) 判断本地文件是否是二进制文件