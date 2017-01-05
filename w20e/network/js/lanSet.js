(function(window, $) {
    var initLanIp;
    var G_data;
    var ipObj;

    function getIpLastNum(ip, index) {
        $("#span" + index).html(ip.slice(0, ip.lastIndexOf('.') + 1));
        return ip.slice(ip.lastIndexOf('.') + 1);
    }

    function handler(res) {
        var data = {};
        G_data = res;
        data = res.dhcpServer;
        data.dhcpServerStartIP = getIpLastNum(data.dhcpServerStartIP, 1);
        data.dhcpServerEndIP = getIpLastNum(data.dhcpServerEndIP, 2);
        data.lanIP = res.lan.lanIP;
        initLanIp = res.lan.lanIP;
        data.lanMask = res.lan.lanMask;

        $.getJSON('/w20e/goform/getNetworkIpMask', function(res) {
            ipObj = res;
        });
        if (res.dhcpServer.dhcpServerEn === true) {
            $('#dhcpServer').removeClass('none');
        } else {
            $('#dhcpServer').addClass('none');
        }

        return data;
    }

    function ipAndMask(str1, str2) {
        var ip = [];
        ip = str1.split(".");
        var mask = [];
        mask = str2.split('.');
        var result = [];
        if ((ip.length !== 4) || (mask.length !== 4)) {
            return false;
        }
        for (var i = 0; i < 4; i++) {
            result.push(ip[i] & mask[i]);
        }

        return result.join(".");
    }

    // function lanAndAp(res) { //用于检测landhcp的ip和apdhcp的值是否冲突
        // var lanStartIp, lanEndIp, apStartIp, apEndIp;

        // lanStartIp = res.dhcpServerStartIP;
        // lanEndIp = res.dhcpServerEndIP;
        // apStartIp = ipObj.dhcp.apDhcpStart.split('.')[3];
        // apEndIp = ipObj.dhcp.apDhcpEnd.split('.')[3];

        // if (apEndIp < lanStartIp || lanEndIp < apStartIp) {
            // return true;
        // } else {
            // return false;
        // }
    // }

    function beforeSubmitHandler(res) {
        // if(res.dhcpServerStartIP != undefined) {
            // if (!lanAndAp(res)) {
                // showMsg("lanDHCP和apDHCP的IP地址池冲突");
                // return false;
            // }
        // }

        if (parseInt(res.dhcpServerStartIP, 10) > parseInt(res.dhcpServerEndIP, 10)) {
            showMsg(_("起始IP地址不能大于结束IP地址。"));
            return false;
        }

        var lanIpAndLanMask = ipAndMask(res.lanIP, res.lanMask);

        var lanIpAndGuestMask = ipAndMask(res.lanIP, G_data.lanGuest.lanGuestMask);
        var gusetIpAndLanMask = ipAndMask(G_data.lanGuest.lanGuestIP,  res.lanMask);
        var gusetIpAndGuestMask = ipAndMask(G_data.lanGuest.lanGuestIP, G_data.lanGuest.lanGuestMask);
        if((lanIpAndLanMask === gusetIpAndLanMask) || (lanIpAndGuestMask === gusetIpAndGuestMask)) {
            showMsg(_("LAN口IP地址不能与访客网络IP同网段。"));
            return false;
        }

        var lanIpAndPPPoEMask = ipAndMask(res.lanIP, G_data.pppoes.pppoesMask);
        var pppoeIpAndLanMask = ipAndMask(G_data.pppoes.pppoesIP, res.lanMask);
        var pppoeIpAndPPPoEMask = ipAndMask(G_data.pppoes.pppoesIP, G_data.pppoes.pppoesMask);
        if ((lanIpAndLanMask === pppoeIpAndLanMask) || (lanIpAndPPPoEMask === pppoeIpAndPPPoEMask)) {
            showMsg(_("LAN口IP地址不能与PPPoE服务器IP同网段。"));
            return false;
        }

        for (var i = 0; i < G_data.wan.length; i++) {
            if (G_data.wan[i].wanIP !== "0.0.0.0") {
                var lanIpAndWanMask = ipAndMask(res.lanIP, G_data.wan[i].wanMask);
                var wanIpAndLanMask = ipAndMask(G_data.wan[i].wanIP, res.lanMask);
                var wanIpAndWanMask = ipAndMask(G_data.wan[i].wanIP, G_data.wan[i].wanMask);
                if ((lanIpAndLanMask === wanIpAndLanMask) || (lanIpAndWanMask === wanIpAndWanMask)) {
                    showMsg(_("LAN口IP地址不能与WAN" + i + "口IP同网段。"));
                    return false;
                }
            }
        }

        if (res.dhcpServerEn === "true") {
            res.dhcpServerStartIP = $("#span1").html() + res.dhcpServerStartIP;
            res.dhcpServerEndIP = $("#span2").html() + res.dhcpServerEndIP;
        }

        showSaveMsg(_("请稍候..."));
        return res;
    }

    var lanSetView = new R.View('#lanSetContainer', {
        fetchUrl: '/w20e/goform/getLan',
        submitUrl: '/w20e/goform/setLan',
        updateCallback: handler,
        afterSubmit: function(res) {
            Debug.log("res = " + res);
            if (res === "1") {
                showSaveMsg(_("保存成功！"), 1000);
                if ($("#lanIp").val() !== initLanIp) {
                    window.setTimeout(function() {
                        var p = new top.Progress("http://" + $("#lanIp").val(), 350, $("#progress-dialog")[0]);
                        p.show("center");
                        p.setText(_("正在改变LAN口IP，系统将自动退出登录"));
                        p.start();
                    }, 2000);
                }

            } else {
                showSaveMsg(_("保存失败！"), 1000);
            }
        },
        beforeSubmit: beforeSubmitHandler,
        events: {
            '#commitBtn, click': function() {
                lanSetView.submit();
            },
            '#dhcpEn, click, input': function() {
                if (this.value === 'true') {
                    $('#dhcpServer').slideDown(200);
                } else if (this.value === 'false') {
                    $('#dhcpServer').slideUp(200);
                }
                top.ResetHeight.resetHeight();
            },
            '#cancelBtn, click': function() {

                if (G_data.dhcpServer.dhcpServerEn === true) {
                    $('#dhcpServer').slideDown(200);
                } else {
                    $('#dhcpServer').slideUp(200);
                }

                lanSetView.initElements();
            }
        }
    });

    $('input[name="lanIP"]').blur(function() {
        var ip = $('input[name="lanIP"]').val();
        $('[name=dhcpServerDns1]').val(ip);
        $("#span1").html(ip.substr(0, ip.lastIndexOf('.') + 1));
        $("#span2").html(ip.substr(0, ip.lastIndexOf('.') + 1));
    });

}(window, $))
