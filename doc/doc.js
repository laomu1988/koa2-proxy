var lazy = require('lazy-doc');
var fs = require('fs');
var files = ['readme.md', 'api.md', 'history.md'];
lazy(__dirname + '/../src/', __dirname + '/api.md');


setTimeout(function () {
    var out = '';
    files.forEach(function (file) {
        out += fs.readFileSync(__dirname + '/' + file, 'utf8');
    });
    
    fs.writeFileSync(__dirname + '/../readme.md', out);
}, 200);