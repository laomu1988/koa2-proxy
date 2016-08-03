/**
 * node测试基础: https://segmentfault.com/a/1190000002437819
 *
 * res.text 返回的文本内容
 **/

var assert = require('assert'),
    request = require('supertest'),
    should = require('chai').should,
    expect = require('chai').expect,
    proxy = require('./proxy.js');

//静态文件目录
proxy.static(__dirname + '/output');
proxy.static(__dirname + '/output', {path: '/test/', index: ['index.html', 'index.txt']});
proxy.static(__dirname + '/output', {path: 'test2'});
//

describe('koa2-proxy.static', function () {
    it('test static root', function (done) {
        request(proxy.httpServer).get('/index.html').expect(200).end(done);
    });
    it('test static path: /test/index.html', function (done) {
        request(proxy.httpServer).get('/test/index.html').expect(200).end(done);
    });
    it('test static path: /test2/index.html', function (done) {
        request(proxy.httpServer).get('/test2/index.html').expect(200).end(done);
    });
    it('test static path: /unexprect.html', function (done) {
        request(proxy.httpServer).get('/unexprect.html').expect(404).end(done);
    });
    it('test static index: ["index.txt"]', function (done) {
        request(proxy.httpServer).get('/index.txt').expect(200).end(done);
    });
});

