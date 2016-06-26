'use strict';

// 根据ctx.response判断是否发送过
module.exports = function (ctx) {
    if (ctx.response.status && ctx.response.status != 404 || ctx.response.body) {
        console.log(ctx.response.status, ctx.response.body);
        console.log(ctx.url + ' has send!');
        return true;
    }
    return false;
};