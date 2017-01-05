$(function() {
    var G_data = {},
        ws = "#userArea", //最外包裹着表，编辑框，添加框的包裹元素选择器
        $ws = $(ws),
        G_action = 1,
        filterStr = ""; //过滤字符串

    /****************  列表  *************************/
    var advPolicySelectEvent = new TableSelectEvent($("#advPolicyWrap")).init();

    //处理基本数据，组成表格需要的数据形式
    function handleAdvPolicyData(data) {
        var advPolicyInfo = [],
            ruleData = {},
            policyState = '',
            ledEn = '',
            policyContent,
            rebootDay,
            weekArr = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
            alertArr = ["AP故障告警", "AP流量告警", "AP接入数告警"],
            rule;


        for (var i = 0; i < data.length; i++) {
            policyContent = '';
            if (data[i].led_enable == '1') {
                ledEn = "启用";
            } else if (data[i].led_enable == '0') {
                ledEn = "关闭";
            } else {
                ledEn = '--';
            }
            if (+data[i].policyEn) {
                trState = '';
                policyState = '<span class="text-success">' + "使用中" + '</span>';
            } else {
                //trState = 'inactive';
                policyState = "未使用";
            }
            if (data[i].policyType == 'reboot') {
                if (data[i].rebootEn == '0') {
                    policyContent = "不重启";
                } else if (data[i].rebootType == 1) {
                    policyContent += "定时重启";
                    policyContent += (' ' + data[i].rebootTime);
                    rebootDay = data[i].rebootDay.split(',');
                    for (var j = rebootDay.length - 1; j >= 0; j--) {
                        if (rebootDay[j] == 1) {
                            policyContent += (" " + weekArr[j]);
                        }
                    }
                } else {
                    policyContent += "循环重启";
                    policyContent += (' ' + data[i].rebootTime);
                }

            } else if (data[i].policyType == 'alert') {
                if (data[i].trafficAlarmEn == '1') {
                    policyContent += alertArr[1] + '/';
                }
                if (data[i].bugAlarmEn == '1') {
                    policyContent += alertArr[0] + '/';
                }
                if (data[i].apNumAlarmEn == '1') {
                    policyContent += alertArr[2];
                }
            } else if (data[i].policyType == 'pwd') {
                policyContent += "账号：" + data[i].username +
                    ' 密码：' + data[i].password;
            }

            ruleData = data[i];
            rule = {};
            rule.checkbox = '<input type="checkbox" tindex="' + i + '" name="webAuthUserID" value="' + (i + 1) + '">';

            rule.policyName = ruleData.policyName;
            rule.led_enable = ledEn;
            rule.policyType = policyContent;
            rule.policyEn = policyState;
            rule.operate = '<div class="operate"><span class="edit"></span></div>';

            advPolicyInfo.push(rule);
        };

        return {
            advPolicyList: advPolicyInfo
        };
    }

    //过滤数据
    function filterData(data, filterStr) {
        if (!filterStr) return data;

        var dataList = data.advPolicyList,
            filterDataList = [],
            rowObj = null;

        for (var i = 0; i < dataList.length; i++) {

            if ((dataList[i].policyName).indexOf(filterStr) != -1) {
                rowObj = $.extend(true, {}, dataList[i]);

                rowObj.policyName = rowObj.policyName.replace(filterStr, '<span class="text-danger">' + filterStr + '</span>');

                filterDataList.push(rowObj);
            }

        };

        return {
            advPolicyList: filterDataList
        };
    }

    var mainView = new R.View($ws, {
        fetchUrl: '/w20e/goform/getAdvPolicyData',
        updateCallback: function(data) {
            G_data.list = data.advPolicyInfo;
            $("#advPolicyCount").html(data.datacount);
            return filterData(handleAdvPolicyData(data.advPolicyInfo), $("#searchTxt").val());
        },
        events: (function() {
            var et = {};
            //搜索
            function search() {

                mainView.defaults.originData = filterData(handleAdvPolicyData(G_data.list), $("#searchTxt").val());
                mainView.initElements();
            }

            //搜索
            et[ws + ' #searchBtn, click'] = function() {
                search();
            };

            //删除
            et[ws + ' .btn-del, click'] = function() {
                var selected = advPolicySelectEvent.getSelectedItems();
                var selectedPolicyOff = $.map(selected, function(selectedIndex) {
                    if (G_data.list[selectedIndex].policyEn != 1) {
                        return G_data.list[selectedIndex].policyName;
                    }
                });

                if (selected.length < 1) {
                    showMsg('请选择要删除的条目！');
                    return;
                }
				
				 if (selectedPolicyOff.length < 1) {
                    showMsg('选中信息中不包含未使用的策略信息！');
                    return;
                }

                showConfirm.call(this, "选中信息中包含 " + selectedPolicyOff.length + " 条未使用策略信息，确认删除？", function() {
                    $.GetSetData.setData('/w20e/goform/delAdvPolicy', {
                        policyArr: selectedPolicyOff.join(',')
                    }, function(str) {
                        showMsg(MSG.delOK);
                        mainView.update();
                    });
                });
            };

            $("#searchTxt").on("keydown", function(e) {
                if (e.keyCode == 13) {
                    search();
                }
            });

            $('#testMailBox').on('click', function() {
                var mailname = $('#alertEmail').val(),
                    mailpwd = $('#emailPwd').val();
                if (!mailname) {
                    showMsg(MSG.mailAlarmAddrErr);
                    return;
                }
                if (!mailpwd) {
                    showMsg(MSG.enterMailPwd);
                    return;
                }
                if (G_data.testing) {
                    return;
                }
                G_data.testing = true;
                showMsg(MSG.testingMailBox, 0);
                $.GetSetData.setData('/w20e/goform/testEmail', {
                    mailname: mailname,
                    mailpwd: mailpwd
                }, function(req) {
                    G_data.testing = false;
                    if (req == '1') {
                        showMsg(MSG.testMailBoxOk);
                    } else {
                        showMsg(MSG.testMailBoxErr, 6000);
                    }
                })
            });

            //增加重启策略
            et[ws + ' #addRebootPolicy, click'] = function() {
                if (G_data.list.length >= 20) {
                    showMsg(_('用户个数已达到上限 20 个'));
                    return;
                }
                G_action = '0';
                $ws.find('.modal-add').eq(0).modal();
                $('.modal-add form')[0].reset();
                dialogReboot.showWindow();
            };

            //增加告警策略
            et[ws + ' #addALertPolicy, click'] = function() {
                if (G_data.list.length >= 20) {
                    showMsg(_('用户个数已达到上限 20 个'));
                    return;
                }
                G_action = '0';
                $ws.find('.modal-add').eq(1).modal();
                dialogAlarm.showWindow();
            };

            //编辑策略
            $ws.on('click', '.edit', function() {
                G_action = '2';
                var idx = $(this).parents("tr").find(":checkbox").attr("tindex");
                var policyName = G_data.list[idx].policyName,
                    policyType = G_data.list[idx].policyType;
                $.GetSetData.setData('/w20e/goform/getDetailAdvPolicyData', {
                    policyType: policyType,
                    policyName: policyName
                }, function(data) {
                    data = $.parseJSON(data);
                    if (data.policyType == 'reboot') {
                        dialogReboot.showWindow(data);
                        $ws.find('.modal-add').eq(0).modal();
                    } else if (data.policyType == 'alert') {
                        dialogAlarm.showWindow(data);
                        $ws.find('.modal-add').eq(1).modal();
                    }
                });
            });

            //刷新
            $("#refresh").on("click", function() {
                mainView.update();
                showMsg(MSG.dataUpOk);
            });

            return et;
        })()
    });

    var dialogReboot = {
        initEvent: function() {
            $("#rebootSave").on("click", dialogReboot.preSubmit);
            $("#rebootEn").on("click", dialogReboot.clickReboot);
            $("[name='rebootType']").on("click", dialogReboot.changeRebootType);
            $('#selWeekDay').delegate('input', 'change', function() {
                if (this.id === 'everyday') {
                    if (!this.checked) {

                        //jquery 方式谷歌有兼容性bug！！！！
                        //$("[id^='day']").removeAttr('checked');
                        for (var i = 1; i <= 7; i++) {
                            document.getElementById('day' + i).checked = false;
                        }
                    } else {
                        //$("[id^='day']").attr('checked', true);
                        for (i = 1; i <= 7; i++) {
                            document.getElementById('day' + i).checked = true;
                        }
                    }
                } else if (this.id.indexOf('day') === 0) {
                    if (!this.checked) {
                        $('#everyday').removeAttr('checked');
                    }
                }
            });
        },
        clickReboot: function() {
            if ($("#rebootEn")[0].checked) {
                $("#reboot-setting").removeClass("none");
            } else {
                $("#reboot-setting").addClass("none");
            }
        },
        changeRebootType: function() {
            if ($("[name='rebootType']")[0].checked) {
                $("[id^='day']").attr("disabled", true);
                $("#everyday").attr("disabled", true);
                $('#rebootTimeType').html(MSG.rebootInterval)
            } else {
                $("[id^='day']").removeAttr("disabled");
                $("#everyday").removeAttr("disabled");
                $('#rebootTimeType').html(MSG.rebootTime)
            }
        },
        showWindow: function(data) {
            dialogReboot.initValue(data);
        },
        initValue: function(data) {
            var initData = data || {
                policyName: "",
                ledEn: "1",
                rebootEn: "1",
                rebootType: "0",
                rebootTime: "03:00",
                rebootDay: "0,0,0,0,0,0,0",
                policyType: "reboot"
            };
            if (G_action == 2) {
                $('#policyName').attr('readonly', 'readonly');
            } else {
                $('#policyName').removeAttr('readonly');
            }
            $("#policyName").val(initData.policyName);
            if (initData.ledEn == "1") {
                $("#ledEn")[0].checked = true;
            } else {
                $("#ledEn")[0].checked = false;
            }

            if (initData.rebootEn == "1") {
                $("#rebootEn")[0].checked = true;
            } else {
                $("#rebootEn")[0].checked = false;
            }

            $("[name='rebootType']")[initData.rebootType].checked = true;

            $("#hour").val(initData.rebootTime.split(":")[0]);
            $("#min").val(initData.rebootTime.split(":")[1]);

            var dayArry = initData.rebootDay.split(","),
                i = 0;
            for (i = 0; i < 7; i++) {
                if (dayArry[i] == "1") {
                    $("#" + ("day" + (i + 1)))[0].checked = true;
                } else {
                    $("#" + ("day" + (i + 1)))[0].checked = false;
                }
            }

            dialogReboot.changeRebootType();
            dialogReboot.clickReboot();
        },
        checkData: function() {
            var policyName = $("#policyName").val(),
                hour = $("#hour").val(),
                min = $("#min").val(),
                rel_num = /^[0-9]{1,}$/,
                dayArry = ["day1", "day2", "day3", "day4", "day5", "day6", "day7"],
                i = 0,
                daySelected = 0;
            if (policyName == "") {
                return MSG.emptyPolicy;
            }
            if ($.getUtf8Length(policyName) > 32) {
                return MSG.policyNameOverflow;
            }
            if (policyName.indexOf(',') !== -1) {
                return MSG.invalidChar;
            }
            if (policyName == '无策略') {
                return _('ssidInvalid', policyName);
            }
            if ((G_action != 2) && checkNameConflict(policyName)) {
                return MSG.duplicatedPolicy;
            }
            if ($("#rebootEn")[0].checked) {
                if (!rel_num.test(hour) || !rel_num.test(min)) {
                    return MSG.rebootTimeErr0;
                }
                if (parseInt(hour, 10) > 23 || parseInt(hour, 10) < 0 || parseInt(min, 10) > 59 || parseInt(min, 10) < 0) {
                    return MSG.rebootTimeErr;
                }
                for (i = 0; i < 7; i++) {
                    if ($("#" + dayArry[i])[0].checked) {
                        daySelected = 1;
                        break;
                    }
                }
                if ($("[name='rebootType']")[1].checked) {
                    if (daySelected == 0) {
                        return MSG.selaDay;
                    }
                }
                if ($("[name='rebootType']")[0].checked) {
                    if (parseInt(hour, 10) <= 0 && parseInt(min, 10) < 10) {
                        return MSG.shortRebootGap;
                    }
                }
            }
        },
        preSubmit: function() {
            var validateObj = $.validate({
                "wrapElem": "#reboot"
            });
            if (!validateObj.check()) {
                showMsg(_("输入有误，请检查红色的输入框"));
                return false;
            }

            var policyName = $('#policyName').val(),
                i;
            for (i = G_data.list.length; --i >= 0;) {
                if (G_data.list[i].policyName === policyName) {
                    if (G_data.list[i].policyEn == 1) {
                        showMsg(MSG.policyInUse);
                        return;
                    }
                    break;
                }
            }

            var msg = dialogReboot.checkData() || "",
                subData = {},
                policyName = $("#policyName").val(),
                i = 0,
                dayArry = ["day1", "day2", "day3", "day4", "day5", "day6", "day7"],
                ledEn,
                rebootEn,
                rebootType,
                rebootTime,
                rebootDay;
            if (msg) {
                showMsg(msg);
                return;
            }
            if ($("#ledEn")[0].checked) {
                ledEn = "1";
            } else {
                ledEn = "0";
            }

            if ($("#rebootEn")[0].checked) {
                rebootEn = "1";
            } else {
                rebootEn = "0";
            }

            if ($("[name='rebootType']")[1].checked) {
                rebootType = "1";
            } else {
                rebootType = "0";
            }

            rebootTime = $("#hour").val() + ":" + $("#min").val();
            rebootDay = "";
            for (i = 0; i < 7; i++) {
                if ($("#" + dayArry[i])[0].checked) {
                    rebootDay += "1,";
                } else {
                    rebootDay += "0,";
                }
            }
            rebootDay = rebootDay.replace(/[,]$/, "");
            subData = {
                policyName: policyName,
                ledEn: ledEn,
                rebootEn: rebootEn,
                rebootType: rebootType,
                rebootTime: rebootTime,
                rebootDay: rebootDay,
                policyType: "reboot"
            };
            submitData(subData);
        }
    };

    var dialogAlarm = {
        initEvent: function() {
            $("#alertSave").on("click", dialogAlarm.preSubmit);
            $("[name='trafficAlarmEn']").on("click", dialogAlarm.changetrafficAlarmEn);
            $("[name='apNumAlarmEn']").on("click", dialogAlarm.changeapNumAlarmEn);
            $("#desktopAlarmEn").on("click", dialogAlarm.changeDesktopEn);
            $("#emailAlarmEn").on("click", dialogAlarm.changeEmailEn);
        },
        showWindow: function(data) {
            dialogAlarm.initValue(data);
        },

        changetrafficAlarmEn: function() {
            if ($("[name='trafficAlarmEn']:checked").val() == "1") {
                $("#trafficNum").removeAttr("disabled");
            } else {
                $("#trafficNum").attr("disabled", true);
            }
        },
        changeapNumAlarmEn: function() {
            if ($("[name='apNumAlarmEn']:checked").val() == "1") {
                $("#apNum").removeAttr("disabled");
            } else {
                $("#apNum").attr("disabled", true);
            }
        },
        changeDesktopEn: function() {
            if ($("#desktopAlarmEn")[0].checked) {
                $("#alertIp").removeAttr("disabled");
            } else {
                $("#alertIp").attr("disabled", true);
            }
        },
        changeEmailEn: function() {
            if ($("#emailAlarmEn")[0].checked) {
                $("#alertEmail").removeAttr("disabled");
                $("#emailPwd").removeAttr("disabled");
                $("#emailGap").removeAttr("disabled");
            } else {
                $("#alertEmail").attr("disabled", true);
                $("#emailPwd").attr("disabled", true);
                $("#emailGap").attr("disabled", true);
            }
        },
        initValue: function(data) {
            var initData = data || {
                policyName: "",
                desktopAlarmEn: "0",
                alertIp: "",
                emailAlarmEn: "0",
                emailPwd: "",
                emailGap: "1",
                alertEmail: "",
                bugAlarmEn: "1",
                trafficAlarmEn: "0",
                trafficNum: "",
                apNumAlarmEn: "1",
                apNum: "15",
                policyType: "alert"
            };

            if (G_action == 2) {
                $('#alertPolicyName').attr('readonly', 'readonly');
            } else {
                $('#alertPolicyName').removeAttr('readonly');
            }
            for (var prop in initData) {
                if (prop == "policyName") {
                    $("#alertPolicyName").val(initData[prop]);
                }
                if (prop == "alertIp" || prop == "alertEmail" || prop == "trafficNum" || prop == "apNum" || prop == "emailPwd" || prop == "emailGap") {
                    $("#" + prop).val(initData[prop]);
                } else if (prop == "trafficAlarmEn" || prop == "apNumAlarmEn") {
                    if (initData[prop] == 1) {
                        $('[name="' + prop + '"]').eq(0).attr("checked", true);
                        if (prop == "trafficAlarmEn") {
                            $("#trafficNum").removeAttr("disabled");
                        } else {
                            $("#apNum").removeAttr("disabled");
                        }
                    } else {
                        $('[name="' + prop + '"]').eq(1).attr("checked", true);
                        if (prop == "trafficAlarmEn") {
                            $("#trafficNum").attr("disabled", true);
                        } else {
                            $("#apNum").attr("disabled", true);
                        }
                    }
                } else if (prop == "desktopAlarmEn" || prop == "emailAlarmEn") {
                    if (initData[prop] == "1") {
                        $("#" + prop)[0].checked = true;
                    } else {
                        $("#" + prop)[0].checked = false;
                    }
                }
            }
            dialogAlarm.changeDesktopEn();
            dialogAlarm.changeEmailEn();
        },
        checkData: function() {
            var policyName = $("#alertPolicyName").val(),
                desktopAlarmEn,
                alertIp = $("#alertIp").val(),
                alertEmail = $("#alertEmail").val(),
                emailAlarmEn,
                bugAlarmEn,
                trafficAlarmEn,
                trafficNum = $("#trafficNum").val(),
                apNumAlarmEn,
                rel_num = /^[0-9]{1,}$/,
                rel_ip = /^([1-9]|[1-9]\d|1\d\d|2[0-1]\d|22[0-3])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/,
                rel_mail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

            if (policyName == "") {
                return MSG.emptyPolicy;
            }
            if ($.getUtf8Length(policyName) > 32) {
                return MSG.policyNameOverflow;
            }
            if (policyName.indexOf(',') !== -1) {
                return MSG.invalidChar;
            }
            if (policyName == '无策略') {
                return _('ssidInvalid', policyName);
            }
            if ((G_action != 2) && checkNameConflict(policyName)) {
                return MSG.duplicatedPolicy;
            }
            if ($("#desktopAlarmEn")[0].checked) {
                if (!rel_ip.test(alertIp)) {
                    return MSG.deskAlarmAddrErr;
                }
                if (alertIp.indexOf('127') === 0) {
                    return MSG.ipStart127;
                }
            }

            if ($("#emailAlarmEn")[0].checked) {
                if (!rel_mail.test(alertEmail)) {
                    return MSG.mailAlarmAddrErr;
                }
                if ($("#emailPwd").val() == "") {
                    return MSG.enterMailPwd;
                }
            }
            if ($("[name='trafficAlarmEn']:checked").val() == "1") {
                if (!rel_num.test(trafficNum)) {
                    return MSG.trafficLimErr;
                }
                if (trafficNum > 100000000) {
                    return MSG.trafficLimFlow;
                }
            }
        },
        preSubmit: function() {
            var alertpolicy = $('#alertPolicyName').val(),
                i;
            var validateObj = $.validate({
                "wrapElem": "#alert"
            });
            if (!validateObj.check()) {
                showMsg(_("输入有误，请检查红色的输入框"));
                return false;
            }

            for (i = G_data.list.length; --i >= 0;) {
                if (G_data.list[i].policyName === alertpolicy) {
                    if (G_data.list[i].policyEn == 1) {
                        showMsg(MSG.policyInUse);
                        return;
                    }
                    break;
                }
            }

            var subData = {},
                msg = dialogAlarm.checkData() || "",
                desktopAlarmEn,
                emailAlarmEn;

            if (msg) {
                showMsg(msg);
                return;
            }

            if ($("#desktopAlarmEn")[0].checked) {
                desktopAlarmEn = "1";
            } else {
                desktopAlarmEn = "0";
            }

            if ($("#emailAlarmEn")[0].checked) {
                emailAlarmEn = "1";
            } else {
                emailAlarmEn = "0";
            }

            if (!$("#desktopAlarmEn")[0].checked && !$("#emailAlarmEn")[0].checked) {
                showMsg("至少选择一项告警方式");
                return false;
            }

            subData = {
                policyName: $("#alertPolicyName").val(),
                desktopAlarmEn: desktopAlarmEn,
                alertIp: $("#alertIp").val(),
                emailAlarmEn: emailAlarmEn,
                emailPwd: $('#emailPwd').val(),
                emailGap: $('#emailGap').val(),
                alertEmail: $("#alertEmail").val(),
                trafficAlarmEn: $('[name="trafficAlarmEn"]:checked').val(),
                trafficNum: $("#trafficNum").val(),
                apNumAlarmEn: $('[name="apNumAlarmEn"]:checked').val(),
                apNum: $("#apNum").val(),
                policyType: "alert"
            };
            submitData(subData);
        }
    };

    function submitData(data) {
        data.action = G_action;
        $.GetSetData.setData('/w20e/goform/setAdvPolicyData', data, function(str) {
            mainView.update();
            $ws.find('.modal-add').modal('hide');
            showMsg(MSG.saveSuc);
        });
    }

    function checkNameConflict(name) {
        var policys = G_data.list,
            prop,
            i;
        for (i = policys.length - 1; i >= 0; i--) {
            if (policys[i].policyName == name) {
                return true;
            }
        }
        return false;
    }

    //init event
    dialogReboot.initEvent();
    dialogAlarm.initEvent();
})
