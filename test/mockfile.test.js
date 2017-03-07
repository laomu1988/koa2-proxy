/**
 *
 * */

var assert = require('assert'),
    request = require('supertest'),
    should = require('chai').should,
    expect = require('chai').expect,
    proxy = require('./proxy.js');

describe('koa2-proxy.mockfile', function () {

    proxy.mockfile(__dirname + '/mockfile.txt');

    it('test redirect', function (done) {
        request(proxy.httpServer).get('/mockfile_redirect').expect(302).end(function (err, res) {
            expect(res.text).to.include('mockfile.re.js');
            done(err);
        });
    });
});