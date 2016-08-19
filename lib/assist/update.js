'use strict';

var check = require('check-update');
var pkg = require('./../../package.json');
var logger = require('logger-color');

check({ packageName: pkg.name, packageVersion: pkg.version, isCLI: true }, function (err, latestVersion, defaultMessage) {
    if (!err) {
        if (latestVersion !== pkg.version) {
            logger.warning(pkg.name + ' has new version:', latestVersion + ' , your\'s is ' + pkg.version + '\nplease update to latest by run:  npm update ' + pkg.name);
        }
    }
});