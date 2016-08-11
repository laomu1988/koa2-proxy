'use strict';

var check = require('check-update');
var pkg = require('./../../package.json');

check({ packageName: pkg.name, packageVersion: pkg.version, isCLI: true }, function (err, latestVersion, defaultMessage) {
    if (!err) {
        if (latestVersion !== pkg.version) {
            console.log('koa2-proxy has new version:', latestVersion + '\n please update to latest by run:  npm update koa2-proxy');
        }
    }
});