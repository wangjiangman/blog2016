(function(window, $) {

    var G_data;

    function handler(res) {
        G_data = res;
        res.scheduledRebootTimeHour = res.scheduledRebootTime.split(":")[0];
        res.scheduledRebootTimeMin = res.scheduledRebootTime.split(":")[1];
        if(res.scheduledRebootEnable === true) {
            $('#scheduledRebootOption').removeClass("none");
        } else {
            $('#scheduledRebootOption').addClass("none");
        }

        return res;
    }

    function submitHandler(res) {
        if (res.scheduledRebootEnable != "false" && res.scheduledRebootDate.indexOf("1") == -1) {
            showMsg(_('请在星期中至少选择一项'));
            return false;
        }
        
        res.scheduledRebootTime = res.scheduledRebootTimeHour + ":" + res.scheduledRebootTimeMin;
        delete res.scheduledRebootTimeHour;
        delete res.scheduledRebootTimeMin;
        showSaveMsg(_("请稍候..."));
        return res;
    }

    var rebootView = new R.View('#rebootContainer', {
        fetchUrl: '/w20e/goform/getScheduledReboot',
        submitUrl: '/w20e/goform/setScheduledReboot',
        updateCallback: handler,
        beforeSubmit: submitHandler,
        afterSubmit: function() {
            showSaveMsg(_("保存成功！"), 1000);
        },
        events: {
            '#reboot-save, click': function() {
                rebootView.submit();
            },

            '#reboot, click': function() {
                $('#reboot-modal').modal();
            },

            '#rebootClose, click': function() {
                $('#reboot-modal').modal('hide');
            },

            '#rebootSet, click, input': function() {
                if (this.value === 'true') {
                    $('#scheduledRebootOption').slideDown(200);
                } else if(this.value === 'false') {
                    $('#scheduledRebootOption').slideUp(200);
                }
            },

            '#rebootPolicyOption, click, input': function(event) {
                selectAll(event);
            },

            '#reboot-cancel, click': function() {
                if (G_data.scheduledRebootEnable === true) {
                    $('#scheduledRebootOption').slideDown(200);
                } else if(this.value === false) {
                    $('#scheduledRebootOption').slideUp(200);
                }
                rebootView.initElements();
            }
        }
    });

    $('button[name="quickReboot"]').on('click', function() {
        $("#reboot-modal").hide(true);
        $.GetSetData.setData("/w20e/goform/reboot", "", function () {
            var p = new top.Progress(window.location.href.replace(/(http(s)?:\/\/.+(\/)).*/gi, "$1"), 600, $("#progress-dialog")[0]);
            p.show("center");
            p.setText(_("系统正在重启,请稍候..."));
            p.start();
        });
    });

    function selectAll(e) {
        var tableItems = document.getElementsByName('scheduledRebootDate');
        if (e.target.value === 'everyday') {
            $.each(tableItems, function(i, n) {
                n.checked = true;
            });
        } else if (e.target.value === 'specificDate') {
            $.each(tableItems, function(i, n) {
                n.checked = false;
            });
        }
    }

    $("#scheduledRebootOption").on('click', "input:checkbox", function() {
        if(this.checked === false){
             $("input:radio:eq(2)").prop("checked",false);
             $("input:radio:eq(3)").prop("checked",true);
        }
    });

}(window, $));
