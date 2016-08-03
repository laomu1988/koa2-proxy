/**
 *
 * */

var assert = require('assert'),
    request = require('supertest'),
    should = require('chai').should,
    expect = require('chai').expect,
    proxy = require('./proxy.js');

proxy.mockfile(__dirname + '/mockfile.txt');


describe('koa2-proxy.mockfile', function () {
    it('test redirect', function (done) {
        request(proxy.httpServer).get('/').expect(200).end(function (err, res) {
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
});