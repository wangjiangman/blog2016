(function(window, $) {

    var G_data,
        G_cloud_status,
        G_webauth_status,
        G_pppoe_status;

    var Msg = {
        "authenticating": "认证中...",
        "autherized": "认证成功",
        "unautherized": "账号错误或设备ID未与该账号绑定",
        "wanIpInvalid": "未获取到WAN口IP"
    }

    function updateDate(data) {
        var cloudList,
            selectOption;
        G_data = data;
        G_cloud_status = data.cloudManageEn;
        data.cloudRegisterStatus = Msg[data.cloudRegisterStatus];
        if (G_cloud_status === true) {
            $("#cloudDetail").show();
            $("#annouce").prop("checked", true);
        } else {
            data.cloudRegisterStatus = "";
            $("#cloudDetail").hide();
        }

        cloudList = data.cloudServerList;
        for (var i = 0; i < cloudList.length; i++) {
            selectOption += '<option value=' + cloudList[i].serverIndex + '>' + cloudList[i].serverName + '</option>';
        }
        $("#authPlatform").html(selectOption);
        $("#authPlatform").val(data.cloudServerValidIndex);
        data.cloudServerAddress = cloudList[data.cloudServerValidIndex].serverAddress;
        data.cloudServerPort = cloudList[data.cloudServerValidIndex].serverPort;
        if (data.cloudServerValidIndex !== "0") {
            $('[name="cloudServerAddress"]').attr("disabled", true);
            $('[name="cloudServerPort"]').attr("disabled", true);
        }
        return data;
    }

    var noRebootFlag = 0;
    var cloudView = new R.View("#cloudContanier", {
        fetchUrl: '/w20e/goform/getCloudManageInfo',
        submitUrl: '/w20e/goform/setCloudManageInfo',
        updateCallback: updateDate,
        afterSubmit: function() {
            if (noRebootFlag === 1) {
                noRebootFlag = 0;
                showSaveMsg(_("保存成功！"), 1000);
            }
        },
        events: {
            '#goToCloud, click': function(ev) {
                var addr = $('input[name="cloudServerAddress"]').val()
                var validateObj = $.validate({
                    "wrapElem": "#cloudServerAddress"
                });
                if (!validateObj.check()) {
                    ev.preventDefault();
                    showMsg(_("服务器地址输入有误！"));
                    return;
                } else {
                    $("#goToCloud").attr('href', '//' + addr);
                }
            }
        }
    });

    $("#save").on("click", function() {
        var submitStatus = $('[name="cloudManageEn"]:checked').val();
        var validateObj = $.validate({
            "wrapElem": "#cloudDetail"
        });
        if (!validateObj.check()) {
            showMsg(_("输入有误，请检查红色的输入框"));
            return false;
        }
        if (($("#annouce").prop("checked") === false) && ($('[name="cloudManageEn"]:checked').val() === "true")) {
            showMsg(_("请勾选已阅读《云平台免责声明》！"));
            return false;
        }
        if (submitStatus !== (G_cloud_status + "")) {
            showConfirm.call(this, "开启云认证会导致WEB认证、PPPoE认证和微信连WiFi功能关闭，更改云认证开关系统需要重启，是否立即重启？", function() {
                //该定时器会干扰进度条定时器
                clearInterval(intervalHandler);
                cloudView.submit();
                //reboot
                $.GetSetData.setData("/w20e/goform/reboot", "", function() {
                    var p = new top.Progress(window.location.href.replace(/(http(s)?:\/\/.+(\/)).*/gi, "$1"), 500, $("#progress-dialog")[0]);
                    p.show("center");
                    p.setText(_("系统正在重启,请稍候..."));
                    p.start();
                });
            });
        } else {
            noRebootFlag = 1;
            showSaveMsg(_("请稍候..."));
            cloudView.submit();
        }
    });

    $("#cancel").on("click", function() {
        cloudView.update();
    });

    $("#cloudContanier").on("change", "#authPlatform", function() {
        var index = $(this).val();

        if (index === "0") {
            $('[name="cloudServerAddress"]').val("");
            $('[name="cloudServerPort"]').val("");
            $('[name="cloudServerAddress"]').attr("disabled", false);
            $('[name="cloudServerPort"]').attr("disabled", false);

        } else {
            $('[name="cloudServerAddress"]').val(G_data.cloudServerList[index].serverAddress);
            $('[name="cloudServerPort"]').val(G_data.cloudServerList[index].serverPort);
            $('[name="cloudServerAddress"]').attr("disabled", true);
            $('[name="cloudServerPort"]').attr("disabled", true);
        }
    })

    $("input[name='cloudManageEn']").on('change', function() {
        if ($(this).val() === "true") {
            $("#cloudDetail").show();
        } else {
            $("#cloudDetail").hide();
        }
    });

    /**********************update status*****************************/
    function getStatus(data) {
        data.cloudRegisterStatus = Msg[data.cloudRegisterStatus];
        return data;
    }
    var statusView = new R.View($('[data-bind]'), {
        fetchUrl: '/w20e/goform/getCloudAuthStatus',
        updateCallback: getStatus
    });
    var intervalHandler = setInterval(function() {
        statusView.update();
    }, 3000);
    /*******************update status end****************************/

}(window, $));
