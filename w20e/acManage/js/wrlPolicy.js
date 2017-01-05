$(function() {
    var G_data = {},
        G_country = countryCode,
        G_action = 1,
        G_DFSAuth = [],
        ws = "#userArea", //最外包裹着表，编辑框，添加框的包裹元素选择器
        $ws = $(ws),
        filterStr = ""; //过滤字符串

    /****************  列表  *************************/
    var wrlPolicySelectEvent = new TableSelectEvent($("#wrlPolicyWrap")).init();

    //处理基本数据，组成表格需要的数据形式
    function handleWrlPolicyData(data) {
        var wrlPolicyInfo = [],
            ruleData = {},
            ssidEn,
            vlan,
            ssidHide,
            channel,
            rule;


        for (var i = 0; i < data.length; i++) {
            if (data[i].ssid_enable == 0) {
                ssidEn = "未使用";
                //trState = 'inactive';
            } else {
                ssidEn = '<span class="text-success">' + "使用中" + '</span>';
            }
            if (data[i].vlanEn == 0) {
                vlan = "关闭";
            } else {
                vlan = data[i].vlan;
            }
            if (data[i].real_channel == 0) {
                channel = "自动";
            } else {
                channel = data[i].channel;
            }
            if (data[i].hide === "0") {
                ssidHide = "关闭";
            } else {
                ssidHide = "启用";
            }
            ruleData = data[i];
            rule = {};
            rule.checkbox = '<input type="checkbox" tindex="' + i + '" name="webAuthUserID" value="' + (i + 1) + '">';

            rule.policyName = ruleData.policyName;
            rule.ssid = ruleData.ssid;
            rule.password = ruleData.password;
            rule.channel = channel;
            rule.vlan = vlan;
            rule.tx_pwr = ruleData.tx_pwr;
            rule.bandwidth = ruleData.bandwidth;
            rule.hide = ssidHide;
            rule.ssid_enable = ssidEn;
            rule.operate = '<div class="operate"><span class="edit"></span></div>';

            wrlPolicyInfo.push(rule);
        };

        return {
            wrlPolicyList: wrlPolicyInfo
        };
    }

    //过滤数据
    function filterData(data, filterStr) {
        if (!filterStr) return data;

        var dataList = data.wrlPolicyList,
            filterDataList = [],
            rowObj = null;

        for (var i = 0; i < dataList.length; i++) {

            if ((dataList[i].policyName + dataList[i].ssid + dataList[i].password).indexOf(filterStr) != -1) {
                rowObj = $.extend(true, {}, dataList[i]);

                rowObj.policyName = rowObj.policyName.replace(filterStr, '<span class="text-danger">' + filterStr + '</span>');
                rowObj.ssid = rowObj.ssid.replace(filterStr, '<span class="text-danger">' + filterStr + '</span>');
                rowObj.password = rowObj.password.replace(filterStr, '<span class="text-danger">' + filterStr + '</span>');

                filterDataList.push(rowObj);
            }

        };

        return {
            wrlPolicyList: filterDataList
        };
    }

    var mainView = new R.View($ws, {
        fetchUrl: '/w20e/goform/getWlPolicyData',
        updateCallback: function(data) {
            G_data.list = data.policyInfo;
            $("#wrlPolicyCount").html(data.datacount);
            return filterData(handleWrlPolicyData(data.policyInfo), $("#searchTxt").val());
        },
        events: (function() {
            var et = {};
            //搜索
            function search() {

                mainView.defaults.originData = filterData(handleWrlPolicyData(G_data.list), $("#searchTxt").val());
                mainView.initElements();
            }

            //搜索
            et[ws + ' #searchBtn, click'] = function() {
                search();
            };

            $("#searchTxt").on("keydown", function(e) {
                if (e.keyCode == 13) {
                    search();
                }
            });

            //增加策略
            et[ws + ' .add-rule, click'] = function() {
                if (G_data.list.length >= 20) {
                    showMsg(_('用户个数已达到上限 20 个'));
                    return;
                }
                G_action = '0';
                $ws.find('.modal-add').modal();
                dialog.showWindow();
            };

            //编辑策略
            $ws.on('click', '.edit', function() {
                G_action = '1';
                $ws.find('.modal-add').modal();
                var idx = $(this).parents("tr").find(":checkbox").attr("tindex");
                var policyName = G_data.list[idx].policyName;
                $.GetSetData.getData('/w20e/goform/getDetailWlPolicyData?policyName='+ encodeURIComponent(policyName), function(data) {
                    dialog.showWindow($.parseJSON(data), idx);
                });
            });

            //删除策略
            et[ws + ' .btn-del, click'] = function() {
                var selected = wrlPolicySelectEvent.getSelectedItems();
				var selectedPolicyOff = $.map(selected, function(selectedIndex) {
                    if (G_data.list[selectedIndex].ssid_enable != 1) {
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

                showConfirm.call(this, "确认删除吗？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/delWlPolicyData', {
                        ssidArr: $.map(selected, function(selectedIndex) {
                            if(G_data.list[selectedIndex].ssid_enable == 0) {
                                return G_data.list[selectedIndex].policyName;
                            } 
                        }).join(',')
                    }, function(res) {
                        showSaveMsg(_('删除成功！'), 1000);
                        mainView.update();
                    });
                });
            };

            //刷新
            $("#refresh").on("click", function() {
                mainView.update();
                showMsg(MSG.dataUpOk);
            });

            return et;
        })()
    });

    /****************  弹出， 增加View *******************/
    var addForm = new R.FormView(ws + ' .modal-add form', {
        beforeSubmit: function() {
            showSaveMsg(_("请稍候..."));
        },

        afterSubmit: function(res) {
            mainView.update();
            showSaveMsg(_("保存成功"), 1000);
            $ws.find('.modal-add').modal('hide');
        }
    });

    /****************  弹出， 增加View over*******************/

    /*******获取复选框数据*********/
    function getCheckboxValue(arry) {
        var i = 0,
            len = arry.length;
        for (i = 0; i < len; i++) {
            if ($("#" + arry[i])[0].checked) {
                $("#" + arry[i]).val("1");
            } else {
                $("#" + arry[i]).val("0");
            }
        }
    }

    var dialog = {
        initEvent: function() {
            $(".userlist-tabs li").on("click", dialog.changeMenu);
            $("#save").on("click", dialog.preSubmit);
            $("#cancel").on("click", dialog.closeWindow);
            $("[name='wifiRadio']").on("click", dialog.changeRadio);
            $("#secType").on("change", dialog.changeSecType);

            $("#netMode").on("change", dialog.changeMode);
            $("[name='bandwidth']").on("click", dialog.changeBand);
            $("#channel").on("change", dialog.changeChannel);
            $("#wmmEn").on("click", dialog.showWmmMsg);
            $("#wmmEn_5g").on("click", dialog.showWmmMsg);
            $("#netMode_5g").on("change", dialog.change5gMode);
            $("[name='bandwidth_5g']").on("click", dialog.change5gBand);
            $("#channel_5g").on("change", dialog.change5gChannel);

            $("#country").on("change", dialog.changeCountry);

            dialog.initCountry();
        },
        showWmmMsg: function() {
            if (!this.checked)
                showMsg(MSG.wmminfo, 3000);
        },
        initCountry: function() {
            var prop,
                country_str = "",
                countryObj = G_country;

            for (prop in countryObj) {
                country_str += "<option value='" + prop + "'>" + MSG[countryObj[prop].name] + "</option>";
            }

            $("#country").html(country_str);
        },
        initChannel: function() {
            var channel_str = "",
                countryName = $("#country").val(),
                i = 0,
                arry = [],
                len;

            if (G_country[countryName].channel.length == 0) {
                arry = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
            } else {
                arry = G_country[countryName].channel;
            }
            len = arry.length;
            for (i = 0; i < len; i++) {
                if (arry[i] == 0) {
                    /*if(!$("[name='bandwidth']")[0].checked) {*/
                    channel_str += "<option value='0'>" + MSG.auto + "</option>";
                    /*} else {
                        channel_str += "";
                    }*/
                } else {
                    channel_str += "<option value='" + arry[i] + "'>Channel " + arry[i] + "</option>";
                }
            }
            $("#channel").html(channel_str);
        },
        changeSecType: function() {
            var secType = $("#secType").val();
            if (secType == "0") {
                $("[name='secMode']").attr("disabled", true);
                $("#secPwd").attr("disabled", true);
                $("#secTime").attr("disabled", true);
            } else {
                $("[name='secMode']").removeAttr("disabled");
                $("#secPwd").removeAttr("disabled");
                $("#secTime").removeAttr("disabled");
                if (secType == "1") {
                    $("#tkipaes").attr("disabled", true);
                }
            }
        },
        changeCountry: function() {
            dialog.changeMode();
            dialog.initChannel();
            dialog.change5gMode();
        },
        changeMode: function() {
            var netMode = $("#netMode").val(),
                countryName = $("#country").val();
            if (netMode == "3") {
                $("[name='bandwidth']")[1].disabled = false;
                $("[name='bandwidth']")[2].disabled = false;
            } else {
                $("[name='bandwidth']")[0].checked = true;
                $("[name='bandwidth']")[1].disabled = true;
                $("[name='bandwidth']")[2].disabled = true;
            }
            dialog.changeBand();
        },

        changeBand: function() {
            if ($("[name='bandwidth']")[1].checked || $("[name='bandwidth']")[2].checked) {
                $("#extSet").removeClass("none");
            } else {
                $("#extSet").addClass("none");
            }

            dialog.changeChannel();
        },
        changeChannel: function() { //改变信道  生成扩展信道
            var channel = parseInt($("#channel").val(), 10),
                len = $("#channel option").length,
                i = 0,
                str = "";
            for (i = 0; i < len; i++) {
                if (channel == 0) {
                    str = "<option value='0'>" + MSG.auto + "</option>";
                } else {
                    if (channel <= 4) {
                        str = '<option value="lower">Channel ' + (channel + 4) + '</option>';
                    } else if (channel > 4 && channel <= (len - 5)) {
                        str = '<option value="upper">Channel ' + (channel - 4) + '</option>' +
                            '<option value="lower">Channel ' + (channel + 4) + '</option>';
                    } else {
                        str = '<option value="upper">Channel ' + (channel - 4) + '</option>';
                    }
                }
            }
            $("#extChannel").html(str);
        },
        change5gMode: function() {
            var val = $("#netMode_5g").val(),
                countryName = $("#country").val(),
                bandObj,
                str = "";
            bandObj = G_country[countryName]["channel_5g"];
            if (val == "0") {
                $("[name='bandwidth_5g']")[0].checked = true;
                $("[name='bandwidth_5g']")[1].disabled = true;
                $("[name='bandwidth_5g']")[2].disabled = true;
            } else if (val == "1") {
                $("[name='bandwidth_5g']")[1].disabled = false;
                if (bandObj["80"]) { // 11ac模式下，有80M带宽信道时
                    $("[name='bandwidth_5g']")[2].disabled = false;
                } else {
                    if ($("[name='bandwidth_5g']")[2].checked) {
                        $("[name='bandwidth_5g']")[0].checked = true;
                    }
                    $("[name='bandwidth_5g']")[2].disabled = true;

                }
            } else {
                if ($("[name='bandwidth_5g']")[2].checked) {
                    $("[name='bandwidth_5g']")[1].checked = true;
                }
                $("[name='bandwidth_5g']")[1].disabled = false;
                $("[name='bandwidth_5g']")[2].disabled = true;
            }
            /*if(countryName == "KR"  || countryName == "RU") {
                    $("[name='bandwidth_5g']")[0].checked = true;
                    $("[name='bandwidth_5g']")[1].disabled = true;
                    $("[name='bandwidth_5g']")[2].disabled = true;
                }*/
            dialog.change5gBand();
        },
        change5gBand: function() {
            var net_5g = $("#netMode_5g").val(),
                countryName = $("#country").val(),
                channelArry = [],
                i = 0,
                str,
                net_5g_value;
            var DFSAuth1 = G_DFSAuth[0] == "1" ? true : false,
                DFSAuth2 = G_DFSAuth[1] == "1" ? true : false;
            if ($("[name='bandwidth_5g']")[0].checked) {
                net_5g_value = "20";
            } else if ($("[name='bandwidth_5g']")[1].checked) {
                net_5g_value = "40";
            } else {
                net_5g_value = "80";
            }
            channelArry = G_country[countryName]["channel_5g"][net_5g_value];
            len = channelArry.length;
            if ($("[name='bandwidth_5g']")[1].checked && (net_5g == "1" || net_5g == "2")) {
                $("#extSet_5g").removeClass("none");
            } else {
                $("#extSet_5g").addClass("none");
            }

            for (i = 0; i < len; i++) {
                if (channelArry[i] == 0) {
                    str += "<option value='0'>" + MSG.auto + "</option>"
                } else {
                    if (!DFSAuth1) {
                        if (parseInt(channelArry[i], 10) >= 52 && parseInt(channelArry[i], 10) <= 64) {
                            continue;
                        }
                    }
                    if (!DFSAuth2) {
                        if (parseInt(channelArry[i], 10) >= 100 && parseInt(channelArry[i], 10) <= 144) {
                            continue;
                        }
                    }
                    str += "<option value='" + parseInt(channelArry[i], 10) + "'>Channel " + parseInt(channelArry[i], 10) + "</option>"
                }
            }
            /********end设置信道*********/

            $("#channel_5g").html(str);
            dialog.change5gChannel();
        },
        change5gChannel: function() { //改变5G信道 生成扩展信道
            var $bandwidth = $("[name='bandwidth_5g']"),
                channel = $("#channel_5g").val(),
                countryName = $("#country").val(),
                str = "",
                arry = [],
                extChannel = "", //获取扩展信道字符串
                i = 0,
                extType, //判断是upper or lower
                len,
                length,
                extObj = [];
            //{'149':[153],'153':[149],'157':[161],'161':[157]}
            /*if(countryName == "KR"  || countryName == "RU") {  //俄罗斯 韩国不支持40M  直接返回
                return;
            }*/
            extObj = G_country[countryName]["channel_5g"]["40"];
            length = extObj.length;
            for (i = 0; i < length; i++) {
                if (channel == parseInt(extObj[i], 10)) {
                    extChannel += extObj[i] + ",";
                }
            }
            extChannel = extChannel.replace(/[,]$/, "");
            arry = extChannel.split(",");
            len = arry.length;
            if (channel != "0") {
                for (i = 0; i < len; i++) {
                    extType = arry[i].slice(-1);
                    if (extType == "u") { //upper
                        str += "<option value='upper'>Channel " + (parseInt(channel, 10) - 4) + "</option>";
                    } else if (extType == "l") { // lower
                        str += "<option value='lower'>Channel " + (parseInt(channel, 10) + 4) + "</option>";
                    }
                }
            } else {
                str += "<option value='0'>" + MSG.auto + "</option>";
            }
            $("#extChannel_5g").html(str);
        },
        changeMenu: function() {
            var className = $(this).attr("class");
            $(".userlist-tabs li").removeClass("active");
            if ($(this).hasClass("basic")) {
                $("#basic").removeClass("none");
                $("#radio").addClass("none");
            } else {
                $("#radio").removeClass("none");
                $("#basic").addClass("none");
            }
            $(this).addClass("active");
        },
        changeRadio: function() {
            if ($("#wrlRadio")[0].checked) {
                $("#radio_2g").removeClass("none");
                $("#radio_5g").addClass("none");
            } else {
                $("#radio_5g").removeClass("none");
                $("#radio_2g").addClass("none");
            }
            //dialog.changeCountry();
        },
        showWindow: function(data, idx) {
            dialog.initValue(data, idx);
        },
        closeWindow: function() {
            $(".window").addClass("none");
            $("#gbx_overlay_old").remove();
        },
        initValue: function(data, idx) {
            var initData = data || {
                policyName: "",
                ssid: "",
                secType: "0", // 0 1 2
                secMode: "0", // 0:aes 1:tkip  2:tkip+aes
                secPwd: "",
                secTime: "0",
                clientNum: "30",
                vlanId: "1000",
                clientIsolation: "0",
                ssidHide: "0",

                wifiRadio: "0",
                country: "CN",
                DFS1Enable: "0",
                DFS2Enable: "0",
                wifiEn: "1",
                netMode: "3", //0 1 2 3 4
                bandwidth: "0",
                channel: "0",
                disturbType: "2",
                extChannel: "0",
                power: "23",
                wmmEn: "1",
                ssidIsolationEn: "0",
                apsdEn: "0",
                vlanEn: "0",
                rssi: "80",
                rssi_5g: "90",
                wifiEn_5g: "1",
                netMode_5g: "1", //0 1
                bandwidth_5g: "2",
                channel_5g: "0",
                disturbType: "2",
                extChannel_5g: "0",
                power_5g: "21",
                wmmEn_5g: "1",
                ssidIsolationEn_5g: "0",
                apsdEn_5g: "0",
                vlanEn_5g: "0"

            };
            G_DFSAuth = [];
            G_DFSAuth.push(initData["DFS1Enable"]);
            G_DFSAuth.push(initData["DFS2Enable"]);
            if (idx) {
                $('#policyName').attr('readonly', 'readonly');
            } else {
                $('#policyName').removeAttr('readonly');
            }
            for (var prop in initData) {
                if (prop == "country" || prop == "policyName" || prop == "ssid" || prop == "secType" || prop == "secPwd" || prop == "secTime" || prop == "clientNum" || prop == "netMode" || prop == "channel" || prop == "power" || prop == "rssi" || prop == "netMode_5g" || prop == "power_5g" || prop == "rssi_5g" || prop == "vlanId") {
                    $("#" + prop).val(initData[prop]);
                } else if (prop == "secMode" || prop == "wifiRadio" || prop == "bandwidth" || prop == "bandwidth_5g") {
                    $("[name='" + prop + "']")[initData[prop]].checked = true;
                } else if (prop == "wifiEn" || prop == "wifiEn_5g") {
                    if (initData[prop] == 1) {
                        $('[name="' + prop + '"]').eq(0).attr("checked", true);
                    } else {
                        $('[name="' + prop + '"]').eq(1).attr("checked", true);
                    }
                } else if (prop == "channel" || prop == "channel_5g" || prop == "extChannel_5g" || prop == "extChannel") {
                    continue;
                } else {
                    if ($("#" + prop) && $("#" + prop).length != 0) {
                        if (initData[prop] == 1) {
                            $("#" + prop)[0].checked = true;
                        } else {
                            $("#" + prop)[0].checked = false;
                        }
                    }
                }
            }

            /******定位到第一个标签******/
            $(".userlist-tabs li").removeClass("active");
            $("#basic").removeClass("none");
            $("#radio").addClass("none");
            $(".userlist-tabs .basic").addClass("active");

            dialog.changeCountry();
            dialog.changeSecType();
            dialog.changeRadio();
            dialog.changeMode();
            dialog.initChannel();
            $("#channel").val(initData["channel"]);
            dialog.changeChannel();
            $("#extChannel").val(initData["extChannel"]);
            dialog.change5gMode();
            $("#channel_5g").val(initData["channel_5g"]);
            dialog.change5gChannel();
            $("#extChannel_5g").val(initData["extChannel_5g"]);

        },
        checkData: function() {
            var policyName = $("#policyName").val(),
                ssid = $("#ssid").val(),
                secPwd = $("#secPwd").val(),
                secTime = $("#secTime").val(),
                clientNum = $("#clientNum").val(),
                power = $("#power").val(),
                power_5g = $("#power_5g").val(),
                vlanId = $("#vlanId").val();
            if (policyName == "") {
                return MSG.emptyPolicy;
            }
            if (ssid == "") {
                return MSG.emptySSID;
            }
            if (policyName.indexOf(',') !== -1) {
                return MSG.invalidChar;
            }

            if ((G_action != 1) && checkNameConflict(policyName)) {
                return MSG.duplicatedPolicy;
            }
            if (policyName == "禁用" || policyName == "无策略") {
                return _('ssidInvalid', policyName);
            }
            if ($.getUtf8Length(policyName) > 32) {
                return MSG.policyNameOverflow;
            }
            if ($.getUtf8Length(ssid) > 32) {
                return MSG.ssidOverflow;
            }
            if ($("#secType").val() != 0) {
                if ((/[^\x00-\xff]/g).test(secPwd)) {
                    return MSG.pwdCharErr;
                }
                if (secPwd.length > 63 || secPwd.length < 8) {
                    return MSG.pwdLenErr;
                }
            }
            if (secTime != 0) {
                if (!/^\d+$/.test(secTime)) {
                    return MSG.secTimeInvalid
                }
                if (parseInt(secTime, 10) < 60 || parseInt(secTime, 10) > 99999) {
                    return MSG.secTimeRangeErr
                }
            }
            if (!(/^[0-9]{1,}$/).test(vlanId)) {
                return MSG.vlanIdInteger;
            }
            if (parseInt(vlanId, 10) < 1 || parseInt(vlanId, 10) > 4094) {
                return MSG.vlanIdRange;
            }

            if (!(/^[0-9]{1,}$/).test(clientNum)) {
                return MSG.clientNumInteger;
            }
            if (parseInt(clientNum, 10) < 1 || parseInt(clientNum, 10) > 64) {
                return MSG.clientNumRange;
            }
            if (!(/^[0-9]{1,}$/).test(power)) {
                return MSG.power2Rate;
            }
            if (parseInt(power, 10) < 8 || parseInt(power, 10) > 23) {
                return MSG.power2Range;
            }

            if (!(/^[0-9]{1,}$/).test(power_5g)) {
                return MSG.powerRate;
            }
            if (parseInt(power_5g, 10) < 8 || parseInt(power_5g, 10) > 23) {
                return MSG.power5Range;
            }
        },
        preSubmit: function() {
            var msg = dialog.checkData() || "",
                arry = [],
                subData = {},
                secMode,
                wifiEn,
                wifiEn_5g,
                wifiRadio,
                bandwidth,
                bandwidth_5g,
                policyName = $('#policyName').val(),
                i;
            var validateObj = $.validate({
                "wrapElem": "#basic"
            });
            if (!validateObj.check()) {
                showMsg(_("输入有误，请检查红色的输入框"));
                return false;
            }

            if (msg) {
                showMsg(msg);
                return;
            }
            for (i = G_data.list.length; --i >= 0;) {
                if (G_data.list[i].policyName === policyName) {
                    if (G_data.list[i].ssid_enable == 1) {
                        showMsg(MSG.policyInUse);
                        return;
                    }
                    break;
                }
            }

            arry = ["clientIsolation", "ssidHide", "wmmEn", "ssidIsolationEn", "apsdEn", "vlanEn", "wmmEn_5g", "ssidIsolationEn_5g", "apsdEn_5g", "vlanEn_5g"]
            getCheckboxValue(arry);

            if ($("[name='secMode']")[0].checked) {
                secMode = 0;
            } else if ($("[name='secMode']")[1].checked) {
                secMode = 1;
            } else {
                secMode = 2;
            }

            if ($("[name='wifiRadio']")[0].checked) {
                wifiRadio = 0;
            } else if ($("[name='wifiRadio']")[1].checked) {
                wifiRadio = 1;
            } else {
                wifiRadio = 2;
            }

            if ($("[name='bandwidth']")[0].checked) {
                bandwidth = 0;
            } else if ($("[name='bandwidth']")[1].checked) {
                bandwidth = 1;
            } else {
                bandwidth = 2;
            }

            if ($("[name='bandwidth_5g']")[0].checked) {
                bandwidth_5g = 0;
            } else if ($("[name='bandwidth_5g']")[1].checked) {
                bandwidth_5g = 1;
            } else {
                bandwidth_5g = 2;
            }

            subData = {
                policyName: $("#policyName").val(),
                ssid: $("#ssid").val(),
                secType: $("#secType").val(), // 0 1 2
                secMode: secMode, // 0:aes 1:tkip  2:tkip+aes
                secPwd: $("#secPwd").val(),
                secTime: $("#secTime").val(),
                clientNum: $("#clientNum").val(),
                clientIsolation: $("#clientIsolation").val(),
                ssidHide: $("#ssidHide").val(),
                vlanId: $("#vlanId").val(),
                rssi: $('#rssi').val(),
                wifiRadio: wifiRadio,
                country: $("#country").val(),
                wifiEn: $('[name="wifiEn"]:checked').val(),
                netMode: $("#netMode").val(), //0 1 2 3 4
                bandwidth: bandwidth,
                channel: $("#channel").val(),
                extChannel: $("#extChannel").val(),
                power: $("#power").val(),
                wmmEn: $("#wmmEn").val(),
                ssidIsolationEn: $("#ssidIsolationEn").val(),
                apsdEn: $("#apsdEn").val(),
                vlanEn: $("#vlanEn").val(),

                rssi_5g: $('#rssi_5g').val(),
                wifiEn_5g: $('[name="wifiEn_5g"]:checked').val(),
                netMode_5g: $("#netMode_5g").val(), //0 1
                bandwidth_5g: bandwidth_5g,
                channel_5g: $("#channel_5g").val(),
                extChannel_5g: $("#extChannel_5g").val(),
                power_5g: $("#power_5g").val(),
                wmmEn_5g: $("#wmmEn_5g").val(),
                ssidIsolationEn_5g: $("#ssidIsolationEn_5g").val(),
                apsdEn_5g: $("#apsdEn_5g").val(),
                vlanEn_5g: $("#vlanEn_5g").val()
            };
            if (subData.rssi > 90 || subData.rssi < 60) {
                showMsg('RSSI输入范围:60-90');
                return;
            }
            if (!$('#wrlRadio2')[0].disabled) {
                if (subData.rssi_5g > 90 || subData.rssi_5g < 60) {
                    showMsg('RSSI输入范围:60-90');
                    return;
                }
            }
            dialog.closeWindow();
            submitData(subData);
        }
    }

    function submitData(data) {
        data.action = G_action;
        $.GetSetData.setData('/w20e/goform/setWlPolicyData', data, function(str) {
            mainView.update();
            $('.modal-add').modal('hide');
            if (G_action == 0) {
                showMsg(_("策略添加成功"));
            } else {
                showMsg(_("策略修改成功"));
            }
        })
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

    /****************  initEvent  *************************/
    dialog.initEvent();
    /****************  initEvent end ********************/
})
