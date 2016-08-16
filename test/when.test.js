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

describe('koa2-proxy.when', function () {
    it('test when str', function (done) {
        proxy.when('/when_test/test.js', function (ctx) {
            ctx.response.body = 'when test';
        });
        request(proxy.httpServer).get('/when_test/test.js').expect(200).end(function (err, res) {
            expect(res.text).to.include('when test');
            done(err);
        });
    });
    it('test when reg', function (done) {
        proxy.when(/when_test\/test_reg/, function (ctx) {
            ctx.response.body = 'when test';
        });
        request(proxy.httpServer).get('/when_test/test_reg.js').expect(200).end(function (err, res) {
            expect(res.text).to.include('when test');
            done(err);
        });
    });
    it('test when phase', function (done) {
        proxy.when({url: /when_test\/test_phase/, phase: 'request'}, function (ctx) {
            ctx.response.body = 'when test phase request';
        });
        proxy.when({url: /when_test\/test_phase/, phase: 'response'}, function (ctx) {
            ctx.response.body += ' response';
        });
        request(proxy.httpServer).get('/when_test/test_phase.js').expect(200).end(function (err, res) {
            expect(res.text).to.include('when test').include('request').include('response');
            done(err);
        });
    });

    it('test when method', function (done) {
        proxy.when({url: /when_test\/test_method/, method: 'post'}, function (ctx) {
            ctx.response.body = 'when test method';
        });
        request(proxy.httpServer).post('/when_test/test_method.js').expect(200).end(function (err, res) {
            expect(res.text).to.include('when test method');
            done(err);
        });
    });
});

