var assert = require('assert'),
    request = require('supertest'),
    should = require('chai').should,
    expect = require('chai').expect,
    proxy = require('./proxy.js');

proxy.smarty({
    root: __dirname + '/output',
    ext: '.tpl',
    data: __dirname + '/mockup/index.json'
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
                expect(res.text).to.include('网站简介');
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
                expect(res.text).to.include('***this is an inline json***');
                done();
            } catch (e) {
                done(e);
            }
        });
    });
});
