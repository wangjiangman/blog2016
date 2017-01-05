(function(window, $) {
    var G_data;

    function submitHandler(res) {
        if($('input[name="sysTimePolicy"]:checked').val() === 'manual') {
            var date = res.sysYear + "-" + res.sysMonth + "-" + res.sysDay;
            var time = res.sysClock + ":" + res.sysMinute + ":" + res.sysSecond;
            
            var pattern=/^((((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(10|12|0?[13578])([-\/\._])(3[01]|[12][0-9]|0?[1-9]))|(((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(11|0?[469])([-\/\._])(30|[12][0-9]|0?[1-9]))|(((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(0?2)([-\/\._])(2[0-8]|1[0-9]|0?[1-9]))|(([2468][048]00)([-\/\._])(0?2)([-\/\._])(29))|(([3579][26]00)([-\/\._])(0?2)([-\/\._])(29))(([1][89][0][48])([-\/\._])(0?2)([-\/\._])(29))|(([2-9][0-9][0][48])([-\/\._])(0?2)([-\/\._])(29))|(([1][89][2468][048])([-\/\._])(0?2)([-\/\._])(29))|(([2-9][0-9][2468][048])([-\/\._])(0?2)([-\/\._])(29))|(([1][89][13579][26])([-\/\._])(0?2)([-\/\._])(29))|(([2-9][0-9][13579][26])([-\/\._])(0?2)([-\/\._])(29)))$/;

            if(!(pattern.test(date)))
            {
                showMsg(_("不是一个合法的日期！"));
                return false;
            }

            res.manualTime = date + " " + time;
    
            delete res.sysYear;
            delete res.sysMonth;
            delete res.sysDay;
            delete res.sysClock;
            delete res.sysMinute;
            delete res.sysSecond;
        }

        showSaveMsg(_("请稍候..."));
        return res;
    }

    function afterSubmitHandler() {
        showSaveMsg(_("保存成功！"), 1000);
    }

    var netSetView = new R.View('#sysTimeContainer', {
        fetchUrl: '/w20e/goform/getSysTime',
        submitUrl: '/w20e/goform/setSysTime',
        updateCallback: handler,
        beforeSubmit: submitHandler,
        afterSubmit: afterSubmitHandler,
        events: {
            '#timeSet-save, click': function() {
                netSetView.submit();
            },

            '#timeType, click, input': function() {
                if (this.value === 'syncNet') {
                    $('#syncNetOption').removeClass('none');
                    $('#manualOption').addClass('none');
                } else if (this.value === 'manual') {
                    $('#syncNetOption').addClass('none');
                    $('#manualOption').removeClass('none');
                }
                top.ResetHeight.resetHeight();
            },

            '#matchPC, click': function() {
                syncTime();
            },

            '#timeSet-cancel, click': function() {
                if (G_data.sysTimePolicy === 'syncNet') {
                    $('#syncNetOption').removeClass('none');
                    $('#manualOption').addClass('none');
                } else if (G_data.sysTimePolicy === 'manual') {
                    $('#syncNetOption').addClass('none');
                    $('#manualOption').removeClass('none');
                }

                netSetView.initElements();
            }
        }
    });

    function syncTime(oldtime) {
        var date = oldtime ? new Date(oldtime) : new Date();

        $('#sysYear').val(date.getFullYear());
        $('#sysMonth').val(date.getMonth() + 1);
        $('#sysDay').val(date.getDate());
        $('#sysClock').val(date.getHours());
        $('#sysMinute').val(date.getMinutes());
        $('#sysSecond').val(date.getSeconds());

        oldtime = date.getTime() + 1000;
        date = null;
    }

    function handler(res) {
        G_data = res;
        time = (res.manualTime).split(" "),
        preTime = time[0].split("-"),
        lastTime = time[1].split(":");

        res.sysYear = preTime[0];
        res.sysMonth = preTime[1];
        res.sysDay = preTime[2];
        res.sysClock = lastTime[0];
        res.sysMinute = lastTime[1];
        res.sysSecond = lastTime[2];

        if(res.sysTimePolicy === "manual") {
            $('#syncNetOption').addClass('none');
        } else if(res.sysTimePolicy === "syncNet") {
            $('#manualOption').addClass('none');
        }

        return res;
    }

}(window, $));
