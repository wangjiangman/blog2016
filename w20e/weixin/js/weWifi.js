(function(window, $) {
    var G_data = {
        doRebootFlag: false,
        weWifiInitFlag: false,
        changeWeWifi: false,
        pppoeInit: false,
        apclientEn: false,
        webInit: false,
        cloudManageInit: false,
        oldSSID: null
    };

    var confirmMsg = "";

    function toggleWeWifi(str) {
        if (str) {
            $("#weWifiSetting").show();
            top.hideInfo.ssidMainHide = true;
            top.hideInfo.apclientHide = true;
        } else {
            $("#weWifiSetting").hide();
            top.hideInfo.ssidMainHide = false;
            top.hideInfo.apclientHide = false;
        }
    }

    function handler(res) {

        var onlineTime = parseFloat(res.wewifiOnlineTime),
            onlineTimeHour = String(Math.floor(onlineTime / 60)),
            onlineTimeMinute = String(onlineTime % 60);

        G_data.pppoeInit = res.pppoeServerEn;
        G_data.webInit = res.webAuthEn;
        G_data.cloudManageInit = res.cloudManageEn;
        G_data.apclientEn = res.apclientEn;
        G_data.oldSSID = res.wewifiSsid;

        if (res.wewifiEn) {
            G_data.weWifiInitFlag = true;
            toggleWeWifi(true);
        } else {
            G_data.weWifiInitFlag = false;
            toggleWeWifi(false);
        }

        $("#confHour").val(onlineTimeHour);
        $("#confMinute").val(onlineTimeMinute);

    }

    function initConfMsg() {
        //res是form表单提交的内容
        //不同的提示
        if ($("[name=wewifiEn]")[0].checked && !G_data.weWifiInitFlag) {
            //当微信连wifi由关闭到开启
            G_data.changeWeWifi = true;
        }else{
            G_data.changeWeWifi = false;
        }

        if (G_data.changeWeWifi) {
            //四种服务相互互斥
            var str = _("微信连WiFi功能开启，");

            if (G_data.pppoeInit) {
                confirmMsg += _("PPPoE认证服务器");
            }
            if (G_data.webInit) {
                confirmMsg += _("WEB认证服务器");
            }
            if (G_data.cloudManageInit) {
                //如果cloudManage原本开启，需要重启
                if (G_data.apclientEn) {
                    confirmMsg += _("云认证和无线中继功能");
                } else {
                    confirmMsg += _("云认证");
                }

                G_data.doRebootFlag = true;
            }

            if (!G_data.cloudManageInit && G_data.apclientEn) {
                //如果apclient原本开启，需要重启
                if (confirmMsg !== "") {
                    confirmMsg += _("和无线中继功能");
                } else {
                    confirmMsg += _("无线中继功能");
                }

                G_data.doRebootFlag = true;
            }

            if (confirmMsg !== "") {
                confirmMsg += _("将关闭");
                if (G_data.doRebootFlag) {
                    confirmMsg += _("，且系统将立即重启");
                }
            }

        }
        if ($("[name=wewifiEn]")[0].checked) {

            if ($("[name=wewifiSsid]").val() !== G_data.oldSSID) {
                if (confirmMsg !== "") {
                    confirmMsg += ("。另，SSID的修改会影响主SSID");
                } else {
                    confirmMsg += _("SSID的修改会影响主SSID。是否继续？");
                    return;
                }
            }
        }

        if (confirmMsg !== "") {
            confirmMsg = str + confirmMsg + _("。是否继续？");
        }

        return true;
    }

    var weWifiSetView = new R.View('#weContainer', {
        fetchUrl: '/w20e/goform/getWewifiBasicInfo',
        submitUrl: '/w20e/goform/setWewifiBasicInfo',
        updateCallback: handler,
        afterSubmit: function(res) {
            Debug.log("res = " + res);
            if (res === "1") {
                if (G_data.doRebootFlag) {
                    //reboot
                    $.GetSetData.setData("/w20e/goform/reboot", "", function() {
                        var p = new top.Progress(window.location.href.replace(/(http(s)?:\/\/.+(\/)).*/gi, "$1"), 500, $("#progress-dialog")[0]);
                        p.show("center");
                        p.setText(_("系统正在重启,请稍候..."));
                        p.start();
                    });
                } else {
                    showSaveMsg(_("保存成功！"), 1000);
                }
            } else {
                showSaveMsg(_("保存失败！"), 1000);
            }
        },
        events: {
            '#weWifiSave, click': function() {
                var validateObj = $.validate({
                    "wrapElem": "#weWifiDetail"
                });
                if (!validateObj.check()) {
                    showMsg(_("输入有误，请检查红色的输入框"));
                    return false;
                } else {
                    var timeStr = "";
                    
                    timeStr = parseFloat($("#confHour").val()) * 60 + parseFloat($("#confMinute").val());
                    if (timeStr === 0) {
                        showMsg(_("认证有效期需大于0分钟"), 1000);
                        return;
                    }
                    if (timeStr > 1440) {
                        showMsg(_("认证有效期不能超过24小时"), 1000);
                        return;
                    }
                    timeStr = String(timeStr);
                    $("[name=wewifiOnlineTime]").val(timeStr);

                    initConfMsg();

                    if (confirmMsg !== "") {
                        showConfirm.call(this, confirmMsg, function() {
                            weWifiSetView.submit();
                        });
                        confirmMsg = "";
                    } else {
                        showSaveMsg(_("请稍候..."));
                        weWifiSetView.submit();
                    }
                }

            },
            '[name=wewifiEn], click': function() {
                if (this.value === "true") {
                    toggleWeWifi(true);
                } else {
                    toggleWeWifi(false);
                }
            },
            '#weWifiCancel, click': function() {
                weWifiSetView.initElements();
            },
            '#wewifiHelp,  click': function() {
                top.window.open("../w20e/weixin/微信连WIFI操作指南.pdf","_blank");
                return;
            }
        }
    });


}(window, $))
