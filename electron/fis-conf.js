'use strict';
var fs = require('fs');
fis.set('project.ignore', ['/*.html','/*.js','/*.json','*.jsx','/dest/**']);

/*
 fis3-hook-module
 fis3-hook-relative
 fis3-postpackager-loader
 fis3-deploy-replace
 */
fis
    .match('src/(*.less)', {
        parser: fis.plugin('less'),
        rExt: '.css',
        release: 'dest/$1'
    })
    .match('*.jsx',{
        release: false
    })
    // 和.babelrc有冲突
    //.match('*.jsx', {
    //    rExt: '.js',
    //    isMod: false,
    //    // 设置js文件为babel解析，支持es6的写法。
    //    parser: fis.plugin('babel2')
    //})


// 开发模式
fis.match('*', {
    useHash: false,
    optimizer: null,
    deploy: [
        fis.plugin('local-deliver', {to: __dirname + '/'})
    ]
});
