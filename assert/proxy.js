var socket = io('http://' + location.host);
socket.emit('ready');

var global = {};
var list = $('.list');
var view = $('#view');
var nowId = 0;

// 当有新的请求开始发送时的消息
socket.on('request', function (data) {
    if (data && data.id && data.url) {
        global[data.id] = data;
        $('<a href="javascript:void(0)" title="' + data.url + '" id="' + data.id + '" class="url loading">' + data.url + '</a>').appendTo(list);
    }
});

// 当新的请求结束时的消息
socket.on('response', function (data) {
    if (data && data.id) {
        $('#' + data.id).removeClass('loading');
    }
});
socket.on('view', function (data) {
    if (data && data.id == nowId) {
        console.log('got data');
        view.val(data.body);
    }
});

list.on('click', '.url', function (e) {
    var id = e.target.getAttribute('id');
    console.log('view: ', id);
    if (id) {
        // 查看某个id
        nowId = id;
        socket.emit('view', {id: nowId});
    }
});



