/**
 * node测试基础: https://segmentfault.com/a/1190000002437819
 *
 * res.text 返回的文本内容
 **/

var proxy = require('./proxy.js');

//静态文件目录
proxy.static(__dirname + '/output');


proxy.open('/open.html');


