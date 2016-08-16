var lazy = require('lazy-doc');
var fs = require('fs');

var out = fs.readFileSync(__dirname + '/readme.md');
out += lazy(__dirname + '/../src/');
out += fs.readFileSync(__dirname + '/history.md');

fs.writeFileSync(__dirname + '/../readme.md', out);