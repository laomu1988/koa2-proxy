import pem from 'pem';
import tls from 'tls';

module.exports = function (key, cert) {
    var cache = {};
    return function (serverName, callback) {
        if (cache[serverName]) {
            return callback(null, cache[serverName]);
        }

        let options = {
            country: 'US',
            state: 'Utah',
            locality: 'Provo',
            organization: 'ACME Tech Inc',
            commonName: serverName,
            serviceKey: key,
            serviceCertificate: cert,
            serial: Date.now(),
            days: 500,
        };
        pem.createCertificate(options, function (err, cert) {
            if (err) {
                console.log('sni error:', err);
                callback(err);
            } else {
                var ctx = tls.createSecureContext({key: cert.clientKey, cert: cert.certificate});
                cache[serverName] = ctx;
                callback(null, ctx);
            }
        });
    };
};
