var wanNum = top.number;
var maxWanNum = 4;
(function(window, $) {
    Msg = {
        "unwired": "未插网线",
        "disconnected": "未连接",
        "connecting": "连接中...",
        "connected": "已连接",
        "wired": "已插网线",
        "authPass": "认证成功",
        "usernamePwdError": "ADSL帐号或密码错误",
        "serverError": "连接服务器失败",
        "withoutReply": "服务器无响应",
        "pppoe":"ADSL",
        "dhcp":"动态IP",
        "static":"静态IP"
    };

    var tmpSysInfo = function(index) {
        var str = '<div class="form-group">'+
            '<label class="control-label col-xs-5 col-sm-6">WAN'+index+'口：</label>'+
            '<div class="col-xs-7 col-sm-6">'+
                '<div class="controls-text" data-bind="wan'+index+'Status"></div>'+
            '</div>'+
        '</div>'+
        '<div class="form-group">'+
            '<label class="control-label col-xs-5 col-sm-6">上网方式：</label>'+
            '<div class="col-xs-7 col-sm-6">'+
                '<div class="controls-text" data-bind="wan'+index+'Type"></div>'+
            '</div>'+
        '</div>'+
        '<div class="form-group">'+
            '<label class="control-label col-xs-5 col-sm-6">IP地址：</label>'+
            '<div class="col-xs-7 col-sm-6">'+
               '<div class="controls-text" data-bind="wan'+index+'IP"></div>'+
            '</div>'+
        '</div>'+
        '<div class="form-group">'+
            '<label class="control-label col-xs-5 col-sm-6">子网掩码：</label>'+
            '<div class="col-xs-7 col-sm-6">'+
                '<div class="controls-text" data-bind="wan'+index+'Mask"></div>'+
            '</div>'+
        '</div>'+
        '<div class="form-group">'+
            '<label class="control-label col-xs-5 col-sm-6">默认网关：</label>'+
            '<div class="col-xs-7 col-sm-6">'+
                '<div class="controls-text" data-bind="wan'+index+'Gateway"></div>'+
            '</div>'+
        '</div>'+
        '<div class="form-group">'+
            '<label class="control-label col-xs-5 col-sm-6">主DNS：</label>'+
            '<div class="col-xs-7 col-sm-6">'+
                '<div class="controls-text" data-bind="wan'+index+'Dns1"></div>'+
            '</div>'+
        '</div>'+
        '<div class="form-group">'+
            '<label class="control-label col-xs-5 col-sm-6">次DNS：</label>'+
            '<div class="col-xs-7 col-sm-6">'+
                '<div class="controls-text" data-bind="wan'+index+'Dns2"></div>'+
            '</div>'+
        '</div>'+
        '<div class="form-group">'+
            '<label class="control-label col-xs-5 col-sm-6">连接状态：</label>'+
            '<div class="col-xs-7 col-sm-6">'+
                '<div class="controls-text" data-bind="wan'+index+'Error"></div>'+
            '</div>'+
        '</div>';

        return str;
    }

    function initHtml() {
        var str = "";
        for (var i = 1; i <= top.WAN_NUMBER; i++) {
            str = tmpSysInfo(i);
            $("#wan"+i+"Info").show();
            $("#wan"+i+"Info").html(str);
        }
        if(top.WAN_NUMBER > 2) {
            $("#wan2Info").after('<hr class="row col-sm-12">');
        }
    };

    initHtml();

    function handler(res) {
        var data = res,
            port = res.portLink.split(','),
            len = res.portLink.split(',').length,
            runTime = res.sysInfo.sysInfoRunTime,
            pattern = /\d+h\d+m\d+s/;
        if(pattern.test(runTime)) {
            runTime = runTime.replace('d',"天").replace('h',"小时").replace('m',"分钟").replace('s',"秒");
        } else {
            runTime = "";
        }

        res = res.wanInfo.slice(0);
        for (var i = 0, l = res.length; i < l; i++) {
            for (var d in res[i]) {
                if (res[i].hasOwnProperty) {
                    data[d.replace(/(?=(wan))\1/i, '$1' + (i + 1))] = res[i][d];
                }
            }
            data['wan'+(i+1)+'Status'] = Msg[res[i].wanStatus];
            data['wan'+(i+1)+'Error'] = Msg[res[i].wanError];
            data['wan'+(i+1)+'Type'] = Msg[res[i].wanType];
        }
        data.sysInfoRunTime = runTime;
        data.cpuUsePercent = data.sysInfo.cpuUsePercent + "%";
        data.memoryUsePercent = data.sysInfo.memoryUsePercent + "%";
        data.wanInfo = null;

        for(var i = 0; i < len; i++) {
            if(port[i] == 0) {
                $("#port" + i).attr('src', '/w20e/common/img/off.png');
            } else {
                $("#port" + i).attr('src', '/w20e/common/img/on.png');
            }
        }
        for(var i = 0; i < maxWanNum; i++) {
            $("[name=portName" + (i + 1) + "]").addClass('none');
        }
        $("[name=portName" + wanNum +"]").removeClass('none');
        return data;
    }

    function update() {
        sysInfoView.update(true);
    }

    var sysInfoView = new R.View('#sysInfo', {
        fetchUrl: '/w20e/goform/getSysInfo',
        updateCallback: handler
    });

    setInterval(update, 5000);

    window['sysInfoView'] = sysInfoView;

} (window, $));
