(function(window, $) {
    var G_data = {};
    var G_commit_flag = 0; // 0 不提交  1 提交
    var wanNum = 2; //默认2个wan口
    var wanFlag = 0; //wan口数量变化标志
    var maxWanNum = 4;
    var initNum;

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
        "color": {
            "unwired": "red",
            "wired": "green"
        }
    };

    $('input[name="wan1User"],input[name="wan1Pwd"],input[name="wan2User"],input[name="wan2Pwd"]').addCheck([
        {
            "type":"ascii"
        }, 
        {
            "type":"specialChar",
            "args":["'\"&"]
        }
    ]);
    initWan(maxWanNum);
    function initWan(num) {
            wanNum = num,
            wanStr = '';

         for(var i = 0; i < wanNum; i++) {
            wanStr += '<div class="row" data-val="wan" id="wan' + (i + 1) + '">'
                   + '  <label class="col-xs-12 col-sm-2 col-md-2">WAN' + (i + 1)  + _('口') + '</label>'
                   + '  <div class="col-xs-12 col-sm-10">'
                   + '      <form class="form-horizontal" role="form">'

                   + ' <div class="form-group">'
                   + '     <label class="control-label col-xs-4 col-sm-3">'
                   + _('接口状态：') + '</label>'
                   + '         <div class="col-xs-8 col-sm-4">'
                   + '            <img id="status-img' + (i + 1) + '"><div class="controls-text" data-bind="wan' + (i + 1) + 'Status"></div>'
                   + '         </div>'
                   + ' </div>'

                   + ' <div class="form-group">'
                   + '     <label class="control-label col-xs-4 col-sm-3">'
                   + _('联网方式：') + '</label>'
                   + '     <div class="radio-group col-xs-8 col-sm-7" id="wan' + (i + 1) + 'Type">'
                   + '         <label class="radio-inline">'
                   + '             <input type="radio" name="wan' + (i + 1) + 'Type" value="pppoe" >ADSL'
                   + '         </label>'
                   + '         <label class="radio-inline">'
                   + '            <input type="radio" name="wan' + (i + 1) + 'Type" value="dhcp" checked="">' + _('动态IP')
                   + '         </label>'
                   + '         <br class="visible-xs">'
                   + '         <label class="radio-inline">'
                   + '             <input type="radio" name="wan' + (i + 1) + 'Type" value="static">' + _('静态IP')
                   + '         </label>'
                   + '     </div>'
                   + ' </div>'
                   + ' <div id="wan' + (i + 1) + 'Pppoe">'
                   + '     <div class="form-group">'
                   + '         <label class="control-label col-xs-4 col-sm-3">'
                   + _('宽带帐号：') + '</label>'
                   + '         <div class="col-xs-8 col-sm-4">'
                   + '             <input type="text" maxlength="127" class="form-control validatebox" name="wan' + (i + 1) + 'User" required data-options=\'\'>'
                   + '         </div>'
                   + '     </div>'
                   + '     <div class="form-group">'
                   + '         <label class="control-label col-xs-4 col-sm-3">'
                   + _('宽带密码：') + '</label>'
                   + '         <div class="col-xs-8 col-sm-4">'
                   + '             <input type="password" maxlength="127" class="form-control validatebox" data-role="visiblepassword" name="wan' + (i + 1) + 'Pwd" required data-options=\'\'>'
                   + '         </div>'
                   + '     </div>'
                   + ' </div>'
                   + ' <div id="wan' + (i + 1) + 'Static" class="none">'
                   + '     <div class="form-group">'
                   + '         <label class="control-label col-xs-4 col-sm-3">'
                   + _('IP地址：') + '</label>'
                   + '        <div class="col-xs-8 col-sm-4">'
                   + '             <input type="text" name="wan' + (i + 1) + 'IP" class="form-control validatebox" required data-options=\'{"type": "ip"}\'>'
                   + '         </div>'
                   + '     </div>'
                   + '     <div class="form-group">'
                   + '         <label class="control-label col-xs-4 col-sm-3">'
                   + _('子网掩码：') + '</label>'
                   + '         <div class="col-xs-8 col-sm-4">'
                   + '             <input type="text" name="wan' + (i + 1) + 'Mask" class="form-control validatebox" required data-options=\'{"type": "mask"}\'>'
                   + '         </div>'
                   + '     </div>'
                   + '     <div class="form-group">'
                   + '         <label class="control-label col-xs-4 col-sm-3">'
                   + _('网关地址：') + '</label>'
                   + '         <div class="col-xs-8 col-sm-4">'
                   + '             <input type="text" name="wan' + (i + 1) + 'Gateway" class="form-control validatebox" required data-options=\'{"type": "ip"}\'>'
                   + '        </div>'
                   + '     </div>'
                   + '     <div class="form-group">'
                   + '         <label class="control-label col-xs-4 col-sm-3">'
                   + _('主DNS：') + '</label>'
                   + '         <div class="col-xs-8 col-sm-4">'
                   + '             <input type="text" name="wan' + (i + 1) + 'Dns1" class="form-control validatebox" required data-options=\'{"type": "ip"}\'>'
                   + '         </div>'
                   + '     </div>'
                   + '     <div class="form-group">'
                   + '        <label class="control-label col-xs-4 col-sm-3">'
                   + _('次DNS：') + '</label>'
                   + '         <div class="col-xs-8 col-sm-4">'
                   + '             <input type="text" name="wan' + (i + 1) + 'Dns2" class="form-control validatebox" data-options=\'{"type": "ip"}\'>'
                   + '         </div>'
                   + '     </div>'
                   + ' </div>'
                   + ' <div class="form-group">'
                   + '     <label class="control-label col-xs-4 col-sm-3">'
                   + _('运营商：') + '</label>'
                   + '     <div class="col-xs-8 col-sm-4">'
                   + '         <select class="form-control" name="wan' + (i + 1) + 'ISP">'
                   + '            <option value="0">'+ _('中国电信') + '</option>'
                   + '             <option value="1">'+ _('中国联通') + '</option>'
                   + '             <option value="2">'+ _('中国移动') + '</option>'
                   + '             <option value="3">'+ _('中国教育') + '</option>'
                   + '             <option value="4">'+ _('其他') + '</option>'
                   + '         </select>'
                   + '     </div>'
                   + ' </div>'
                   + ' <div class="form-group">'
                   + '     <label class="control-label col-xs-4 col-sm-3">'
                   + _('线路带宽：') + '</label>'
                   + '     <div class="col-xs-8 col-sm-8">'
                   + '         <span>' + _('上行：')
                   + '             <input class="form-control control-sm validatebox" type="text" style="width: 62px;" maxlength="6" name="wan' + (i + 1) + 'Upstream" data-options="">Mbps'
                   + '        </span>'
                   + '        <span class="control-br">' + _('下行：')
                   + '             <input class="form-control control-sm validatebox" type="text" style="width: 62px;" maxlength="6" name="wan' + (i + 1) + 'Downstream" data-options="">Mbps'
                   + '         </span>'
                   + '     </div>'
                   + ' </div>'
                   + ' <div class="form-group">'
                   + '     <label class="control-label col-xs-4 col-sm-3">'
                   + _('联网状态：') + '</label>'
                   + '     <div class="col-xs-8 col-sm-4">'
                   + '         <div class="controls-text" data-bind="wan' + (i + 1) + 'Error"></div>'
                   + '     </div>'
                   + ' </div>'
                   + '</form>'
                   + ' </div>'
                   + ' </div>';

        } 
        $("#network").append(wanStr); 

        //绑定事件
        $("#wan1Type input").on('click', function() {
            changeRadio('wan1', this.value);
        });
        $("#wan2Type input").on('click', function() {
            changeRadio('wan2', this.value);
        });
        $("#wan3Type input").on('click', function() {
            changeRadio('wan3', this.value);
        });
        $("#wan4Type input").on('click', function() {
            changeRadio('wan4', this.value);
        });
    }
    function handler(res) {
        G_data = res;
        var data = res;
        
        $("#wanNum").val(res.wanNum);
        initNum = res.wanNum;
        wanChange(res.wanNum);
        res = res.wan.slice(0);
        for (var i = 0, l = res.length; i < l; i++) {
            for (var d in res[i]) {
                if (res[i].hasOwnProperty) {
                    data[d.replace(/(?=(wan))\1/i, '$1' + (i + 1))] = res[i][d];
                }
            }

            changeRadio('wan' + (i + 1), res[i].wanType);
            data['wan'+(i+1)+'Status'] = Msg[res[i].wanStatus];
            var img = $("#status-img"+(i+1));
            if(res[i].wanStatus === "unwired") {
                img.attr("src", "/w20e/common/img/unconnected.png");
            } else {
                img.attr("src", "/w20e/common/img/connected.png");
            }

            $("div[data-bind='wan" +(i+1) + "Status']").css("color", (Msg.color[res[i].wanStatus]));

            data['wan'+(i+1)+'Error'] = Msg[res[i].wanError];
        }

        return data;
    }

    function changeRadio(wan, value) {
        if (value == 'pppoe') {
            $('#' + wan + 'Pppoe').slideDown(200);
            $('#' + wan + 'Static').slideUp(200);
        } else if (value == 'static') {
            $('#' + wan + 'Pppoe').slideUp(200);
            $('#' + wan + 'Static').slideDown(200);
        } else {
            $('#' + wan + 'Pppoe').slideUp(200);
            $('#' + wan + 'Static').slideUp(200);
        }
        top.ResetHeight.resetHeight(300);
    }


    function update() {
        statusView.update();
        
    }

    function wanChange(wanNum) {
            wan = $("div [data-val='wan']"),
            i = 0,
            j = wanNum;

        for(i; i < wanNum; i++) {
            $(wan[i]).removeClass('none');
        }
        for(j; j < maxWanNum; j++) {
            $(wan[j]).addClass('none');
        }
        for(var i = 0; i < maxWanNum; i++) {
            $("[name=wan" + (i + 1) + "Type]:checked")[0].click();
        }
        $("#lineStatus").attr('src', "/w20e/common/img/" + wanNum + ".png");
        $("[name=model]").addClass('none');
        $($("[name=model]")[wanNum - 1]).removeClass('none');
        for(var i = 0; i < maxWanNum; i++) {
            $("[name=portName" + (i + 1) + "]").addClass('none');
        }
        $("[name=portName" + wanNum +"]").removeClass('none');
    }

    function reboot() {
        $.GetSetData.setData("/w20e/goform/reboot", "", function () {
            var p = new top.Progress(window.location.href.replace(/(http(s)?:\/\/.+(\/)).*/gi, "$1"), 600, $("#progress-dialog")[0]);
            p.show("center");
            p.setText(_("系统正在重启,请稍候..."));
            p.start();
        });
    }

    function submit() {
        var dataStr = '',
            len = $("#wanNum").val(),
            i = 1;

        for(i; i <= len; i++) {
            dataStr += '#wan' + i + ',';
        }
        dataStr += "#wanNumContain";
        $.post('/w20e/goform/setNetwork', new AutoCollect(dataStr).getJson(), function(res) {
            if(res == 1) {
                if(wanFlag == 1) {
                   wanFlag = 0; 
                   reboot();
                }
                showSaveMsg(_("保存成功！"), 1000);
            } else {
                showSaveMsg(_("保存失败！"), 1000);
            }
        });
    }

    function ipAndMask(str1, str2) {
        var ip = []; 
        ip = str1.split(".");
        var mask = [];
        mask = str2.split('.');
        var result = [];
        if((ip.length !== 4) || (mask.length !== 4)) {
            return false;
        }
        for(var i = 0; i < 4; i++) {
            result.push(ip[i] & mask[i]);
        }

        return result.join(".");
    }

    function beforeSubmitHandler(res) {
        var li,i,j,k,lj,lk;
        var ip = [],
            wanNumber = $("#wanNum").val(),
            lanIp,
            lanMask,
            guestIp,
            guestMask,
            pppoeIp,
            pppoeMask,
            mask,
            gateway,
            confirmTag = 0,
            ipArr = [];

        if(initNum != wanNumber) {
            wanFlag = 1;
        }
        if(G_commit_flag == 0) {
            for(i = 0 , li = maxWanNum ; i < li ; i++) {
                if(res['wan'+(i+1)+'Type'] == "static") {
                    lanIp = G_data.lan.lanIP;
                    lanMask = G_data.lan.lanMask;
                    guestIp = G_data.lanGuest.lanGuestIP;
                    guestMask = G_data.lanGuest.lanGuestMask;
                    pppoeIp = G_data.pppoes.pppoesIP;
                    pppoeMask = G_data.pppoes.pppoesMask;
                    wanIp = res['wan'+(i+1)+'IP'];
                    wanMask = res['wan'+(i+1)+'Mask'];
                    gateway = res['wan'+(i+1)+'Gateway'];

                    var wanIpAndWanMask = ipAndMask(wanIp, wanMask);

                    var wanIpAndGuestMask = ipAndMask(wanIp, guestMask);
                    var guestIpAndWanMask = ipAndMask(guestIp,  wanMask);
                    var guestIpAndGuestMask = ipAndMask(guestIp, guestMask);

                    var wanIpAndPPPoEMask = ipAndMask(wanIp, pppoeMask);
                    var pppoeIpAndWanMask = ipAndMask(pppoeIp,  wanMask);
                    var pppoeIpAndPPPoEMask = ipAndMask(pppoeIp, pppoeMask);
                    
                    if((wanIpAndWanMask === guestIpAndWanMask) || (wanIpAndGuestMask === guestIpAndGuestMask)) {
                        showMsg(_("WAN%s口IP地址不能与访客网络IP同网段。", [i+1]));
                        return false;
                    }

                    if((wanIpAndWanMask === pppoeIpAndWanMask) || (wanIpAndPPPoEMask === pppoeIpAndPPPoEMask)) {
                        showMsg(_("WAN%s口IP地址不能与PPPoE服务器IP同网段。", [i+1]));
                        return false;
                    }

                    var wanIpAndLanMask = ipAndMask(wanIp, lanMask);
                    var lanIpAndWanMask = ipAndMask(lanIp,  wanMask);
                    var lanIpAndLanMask = ipAndMask(lanIp, lanMask);
                    if((wanIpAndWanMask === lanIpAndWanMask) || (wanIpAndLanMask === lanIpAndLanMask)) {
                        showMsg(_("WAN%s口IP地址不能与lAN口IP同网段。", [i+1]));
                        return false;
                    }

                    if(ipAndMask(wanIp, wanMask) !== ipAndMask(gateway, wanMask)) {
                        showMsg(_("WAN%s口IP与网关不在同一网段！", [i+1]));
                        return false;
                    }

                    if((wanIp === res['wan'+(i+1)+'Gateway']) ||
                        (wanIp === res['wan'+(i+1)+'Dns1']) ||
                        (wanIp === res['wan'+(i+1)+'Dns2'])) {
                        showMsg(_("WAN%s口网关和DNS不能与WAN%s口IP相同！", [i+1, i+1]));
                        return false;
                    }
                }
            }

            for(var i = 0; i < maxWanNum; i++) {
              if($("input[name=wan" + (i + 1) + "Type]:checked").val() === "static") {
                ipArr.push($("[name='wan" + (i + 1) + "IP']").val());
              }
            }
            if(ipArr.length > 0) {
                var nary = ipArr.sort();

                for(var i = 0; i < nary.length; i++){
                    if (nary[i] == nary[i + 1]){
                        showMsg(_("WAN口的IP不能设置为相同！"));
                        return　false;
                    }
                }
            }

            if(wanNumber >= 1) {
                if($("[name=wan1Upstream]").val() === "" || $("[name=wan1Downstream]").val() === "") {
                    confirmTag ++;
                } 
            }

            if(wanNumber >= 2) {
                if($("[name=wan2Upstream]").val() === "" || $("[name=wan2Downstream]").val() === "") {
                    confirmTag ++;
                }
            }

            if(wanNumber >= 3) {
                if($("[name=wan3Upstream]").val() === "" || $("[name=wan3Downstream]").val() === "") {
                    confirmTag ++;
                }
            }

            if(wanNumber >= 4) {
                if($("[name=wan4Upstream]").val() === "" || $("[name=wan4Downstream]").val() === "") {
                    confirmTag ++;
                }
            }

            if(confirmTag > 0){
                showConfirm.call(this, "请正确填写宽带运营商提供的线路带宽；上下行带宽为空，会影响智能流控和负载均衡功能，是否继续保存？", function() {
                    G_commit_flag = 1;
                    wanSetView.submit();
                });
            } else {
                G_commit_flag = 1;
                wanSetView.submit();
            }
        } else if(wanFlag == 1) {
            setTimeout(function() {
                showConfirm.call(this, "修改WAN口个数后会重启，你确定要保存设置吗？", function() {
                    if(G_commit_flag == 1) {
                        submit();
                    }
                });
            }, 500);
        } else {
            if(G_commit_flag == 1) {
                submit();
            }
        }
    }

    for(var i = 1; i <= maxWanNum; i++) {
        $("[name=wan" + i + "Upstream]").addCheck([{
            "type": "streamCheck"
        }]);
        $("[name=wan" + i + "Downstream]").addCheck([{
            "type": "streamCheck"
        }]);
    }

    //带宽输入有效性检查
    $.valid.streamCheck = {
        all:function (str) {
        var r = new RegExp("^((0\\.([1-9]))|(([1-9]|[1-9]\\d)(\\.(\\d)?)?)|100|100\\.|100\\.0)$");
        if(!r.test(str)) {
            return _("请输入0.1至100.0的数字，最多保留一位小数。");
        }
    }}

    var wanSetView = new R.View('#network', {
        fetchUrl: '/w20e/goform/getNetwork',
        updateCallback: handler,
        beforeSubmit: beforeSubmitHandler,
        events: {
            '#submitBtn, click': function() {
                G_commit_flag = 0 ;
                wanSetView.submit();
            },
            '#cancel, click': function() {
                var data = G_data.wan.slice(0);
                changeRadio('wan1',data[0].wanType);
                changeRadio('wan2',data[1].wanType);
                changeRadio('wan3',data[2].wanType);
                changeRadio('wan4',data[3].wanType);
                wanSetView.initElements();
            },
            '#wanNum, change': function() {
                wanNum = $(this).val();
                wanChange($("#wanNum").val());
            }
        }
    });

    var statusView = new R.View('#wanStatus', {
        fetchUrl: '/w20e/goform/getWanConnectStatus',
        updateCallback: function(res) {
            var data = res,
                port = res.portLink.split(','),
                len = res.portLink.split(',').length;

            for (var i = 0, l = res.status.length; i < l; i++) {

                $("div[data-bind='wan" + (i + 1) + "Error']").text(Msg[res.status[i].wanError]);
                $("div[data-bind='wan" + (i + 1) + "Status']").text(Msg[res.status[i].wanStatus]);

                var img = $("#status-img"+(i+1));
                if(res.status[i].wanStatus === "unwired") {
                    img.attr("src", "/w20e/common/img/unconnected.png");
                } else {
                    img.attr("src", "/w20e/common/img/connected.png");
                }

                $("div[data-bind='wan" + (i+1) + "Status']").css("color", (Msg.color[res.status[i].wanStatus]));
            }
            
            return data;
        }
    });

    setInterval(update, 5000);
    window['wanSetView'] = wanSetView;

} (window, $));
