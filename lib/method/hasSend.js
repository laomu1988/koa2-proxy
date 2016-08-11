"use strict";

// 根据ctx.response判断是否发送过
module.exports = function () {
    if (this.response.status && this.response.status != 404 || this.response.body) {
        // console.log(ctx.response.status);
        // console.log(ctx.url + ' has send!');
        return true;
    }
    return false;
};