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

describe('koa2-proxy.smarty', function () {
    it('smarty block extend', function (done) {
        this.timeout(5000);
        // 设置超时时间
        request(proxy.httpServer).get('/smarty').expect(200).end(function (err, res) {
            if (err) return done(err);
            // console.log(res.text);
            try {
                expect(res.text).to.include('smarty-title');
                expect(res.text).include('网站简介');
                expect(res.text.indexOf('{%')).to.equal(-1);
                expect(res.text.indexOf('%}')).to.equal(-1);
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it('smarty read json inline', function (done) {
        this.timeout(5000);
        // 设置超时时间
        request(proxy.httpServer).get('/smarty-inline').expect(200).end(function (err, res) {
            if (err) return done(err);
            // console.log(res.text);
            try {
                expect(res.text).to.include('smarty-title');
                expect(res.text).include('***this is an inline json***');
                done();
            } catch (e) {
                done(e);
            }
        });
    });
});

