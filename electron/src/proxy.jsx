const remote = require('electron').remote;
var proxy = remote.getGlobal('proxy');
var count = 1000000;
var fs = require('fs');
var temp = __dirname + '/../temp/';
var Link = React.createClass({
    onClick: function (data) {
        if (this.props.onChoose) {
            this.props.onChoose(data);
        }
    },
    render: function () {
        var me = this;
        var data = this.props.data;
        data.ref = this;
        var active = this.props.active ? ' active' : '';
        var loadResult = data.statusCode ? (data.statusCode == 404 ? 'fail' : 'success') : 'loading';
        return <a href="javascript:void(0)"
                  className={'url ' +  loadResult + active}
                  title={data.url}
                  onClick={me.onClick.bind(me, data)}
        >{data.url}</a>
    }
});

var List = React.createClass({
    getInitialState: function () {
        this.activedData = null;
        return {
            list: [],
            active: null
        }
    },
    pushLink: function (data) {
        var list = this.state.list;
        list.push(data);
        this.setState({list: list});
        if (!this.state.active) {
            this.clickLink(data);
        }
    },
    clickLink: function (data) {
        this.setState({active: data});
        if (this.props.onChoose) {
            this.props.onChoose(data);
        }
    },
    updateData: function (data) {
        if (data && data.ref) {
            data.ref.forceUpdate();
        }
    },
    render: function () {
        var me = this;
        var active = me.state.active;
        return (
            <div className="list">
                {this.state.list.map(function (data) {
                    return <Link data={data} active={active == data} key={data.id} id={data.id}
                                 onChoose={me.clickLink}/>
                })}
            </div>
        );
    }
});

var View = React.createClass({
    getInitialState: function () {
        return {
            id: '',
            menu: 'head',
            head: '',
            body: ''
        }
    },
    setData: function (data) {
        if (data && data.id != this.state.id) {
            this.setState({id: data.id, head: JSON.stringify(data.header), body: ''});
            this.chooseMenu(this.state.menu);
        }
    },
    chooseMenu: function (menu) {
        this.setState({menu: menu});
        if (menu == 'body' && this.state.id) {
            var file = temp + this.state.id + '-response-body.data';
            if (fs.existsSync(file)) {
                this.setState({body: fs.readFileSync(file)});
            } else {
                this.setState({body: 'Not Found!'})
            }
        }
    },
    render: function () {
        return (
            <div className="view">
                <div className="menu">
                    <div className={'btn' + (this.state.menu == 'head' ? ' active':'')}
                         onClick={this.chooseMenu.bind(this,'head')}>head
                    </div>
                    <div className={'btn' + (this.state.menu == 'body' ? ' active':'')}
                         onClick={this.chooseMenu.bind(this,'body')}>body
                    </div>
                </div>
                <div className="head view-content" style={{display: this.state.menu == 'head' ? 'block': 'none'}}>
                    <textarea ref="head-content" value={this.state.head}></textarea>
                </div>
                <div className="body view-content" style={{display: this.state.menu == 'body' ? 'block': 'none'}}>
                    <textarea ref="body-content" value={this.state.body}></textarea>
                </div>
            </div>
        );
    }
});


var App = React.createClass({
    getInitialState: function () {
        return {
            list: [],
            hash: {}
        }
    },
    pushData: function (data) {
        if (data && data.id) {
            this.state.list.push(data);
            this.state.hash[data.id] = data;
            this.refs.list.pushLink(data);
        }
    },
    updateData: function (data) {
        if (data && data.id) {
            this.refs.list.updateData && this.refs.list.updateData(data);
        }
    },
    getData: function (id) {
        return this.state.hash[id];
    },
    onChooseData: function (data) {
        this.refs.view.setData(data);
    },
    render: function () {
        return (<div className="app">
            <List ref="list" onChoose={this.onChooseData}/>
            <View ref="view"/>
        </div>);
    }
});
var app;
ReactDOM.render(
    <App />,
    document.getElementById('app'),
    function () {
        app = this;
    }
);

proxy.on('start', function (ctx) {
    if (!app) {
        return;
    }
    ctx.__proxy_id = count + '-' + Date.now();
    count += 1;
    var data = {
        id: ctx.__proxy_id,
        url: ctx.fullUrl(),
        header: ctx.request.header
    };
    if (ctx.request.body) {
        data.body = ctx.request.body;
    }
    fs.writeFileSync(temp + ctx.__proxy_id + '-request.json', JSON.stringify(data, null, '    '));
    console.log('new request');
    app.pushData(data);
});
proxy.on('end', function (ctx) {
    console.log('new request end');
    if (app && ctx.__proxy_id) {
        var data = app.getData(ctx.__proxy_id);
        if (!data) {
            return;
        }
        data.statusCode = ctx.response.status;
        data.statusString = ctx.response.statusString;
        fs.writeFileSync(temp + ctx.__socketid + '-response.json', JSON.stringify(data, null, '    '));
        if (typeof ctx.response.body == 'string') {
            fs.writeFileSync(temp + ctx.__socketid + '-response-body.data', ctx.response.body, 'utf8');
        } else {
            fs.writeFileSync(temp + ctx.__socketid + '-response-body.data', ctx.response.body);
        }
        app.updateData(data);
    }
});
