var socket = io('http://' + location.host);
socket.emit('ready');

var List = React.createClass({
    getInitialState: function () {
        return {
            list: []
        }
    },
    pushLink: function (data) {
        var list = this.state.list;
        list.push(data);
        this.setState({list: list});
    },
    clickLink: function () {

    },
    updateState: function (data) {

    },
    render: function () {
        var me = this;
        return (
            <div className="list">
                {this.state.list.map(function (data) {
                    return <a href="javascript:void(0)" id={data.id} className="url loading"
                              title={data.url}
                              onClick={this.updateState.bind(me, data}
                        >data.url</a>
                })}
            </div>
        );
    }
});

var View = React.createClass({});


var App = React.createClass({});
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



