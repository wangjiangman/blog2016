(function(window, $) {
    var G_data;

    $('[name="remoteWan"]').parent().hide();
    if(top.WAN_NUMBER) {
        $('[name="remoteWan"]:lt('+top.WAN_NUMBER+')').parent().show();
    }
    function handler(res) {
        G_data = res;
        if(res.remoteEn === true){
            $('#remoteManageOption').removeClass('none');
        } else {
            $('#remoteManageOption').addClass('none');
        }

        if(res.remoteType === "anyone") {
            $("[name=remoteIP]").attr("disabled",true);
        }

        return res;
    }

    var reManageSetView = new R.View('#remoteManageContainer', {
        fetchUrl: '/w20e/goform/getRemoteWebManage',
        submitUrl: '/w20e/goform/setRemoteWebManage',
        updateCallback: handler,
        beforeSubmit: function() {
            if($("select").find("option:selected").val() === "someone") {
                if($("[name='remoteIP']").val() === "") {
                    showMsg(_("特定IP地址不能为空！"));
                    return false;
                }
            }
            showSaveMsg(_("请稍候..."));
        },
        afterSubmit: function() {
            showSaveMsg(_("保存成功！"), 1000);
            reManageSetView.update();
        },
        events: {
            '#remoteManageSet-save, click': function() {
                reManageSetView.submit();
            },
            '#remoteSet, click, input': function() {
                if (this.value === 'true') {
                    $('#remoteManageOption').slideDown(200);
                } else if (this.value === 'false') {
                    $('#remoteManageOption').slideUp(200);
                }
                top.ResetHeight.resetHeight();
            },
            '#remoteManageSet-cancel, click': function() {
                if (G_data.remoteEn === true) {
                    $('#remoteManageOption').slideDown(200);
                } else if (G_data.remoteEn === false) {
                    $('#remoteManageOption').slideUp(200);
                }
                if(G_data.remoteType === "anyone") {
                    $("[name=remoteIP]").attr("disabled",true);
                }

                reManageSetView.initElements();
            }
        }
    });

    $("[name=remoteType]").change(function() {
        if($(this).val() === "anyone") {
            $("[name=remoteIP]").val("");
            $("[name=remoteIP]").attr("disabled",true);
            $("[name=remoteIP]").fireCheck();
        } else {
            $("[name=remoteIP]").removeAttr("disabled");
        }
    });

}(window, $));
