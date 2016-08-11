'use strict';

var _pem = require('pem');

var _pem2 = _interopRequireDefault(_pem);

var _tls = require('tls');

var _tls2 = _interopRequireDefault(_tls);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (key, cert) {
    var cache = {};
    return function (serverName, callback) {
        if (cache[serverName]) {
            return callback(null, cache[serverName]);
        }

        var options = {
            country: 'US',
            state: 'Utah',
            locality: 'Provo',
            organization: 'ACME Tech Inc',
            commonName: serverName,
            serviceKey: key,
            serviceCertificate: cert,
            serial: Date.now(),
            days: 500
        };
        _pem2.default.createCertificate(options, function (err, cert) {
            if (err) {
                console.log('sni error:', err);
                callback(err);
            } else {
                var ctx = _tls2.default.createSecureContext({ key: cert.clientKey, cert: cert.certificate });
                cache[serverName] = ctx;
                callback(null, ctx);
            }
        });
    };
};