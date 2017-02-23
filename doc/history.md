## 版本更新(使用lazy-doc打包自doc/history.md)
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
