var G = {};
$(function() {
    var G_data = {},
        G_country = countryCode,
        ws = "#userArea", //最外包裹着表，编辑框，添加框的包裹元素选择器
        $ws = $(ws),
        G_curMac = "",
        filterStr = ""; //过滤字符串
    G_DFSAuth = [];

    /****************  列表  *************************/
    var apManageSelectEvent = new TableSelectEvent($("#userlistWrap")).init();

    //处理基本数据，组成表格需要的数据形式
    function handleDevData(data) {
        var devInfo = [],
            ruleData = {},
            onlineState = '',
            channel = '',
            rule;


        for (var i = 0; i < data.length; i++) {
            ruleData = data[i];
            rule = {};

            if (ruleData.currentststus == 0) {
                onlineState = "离线";
            } else if (ruleData.currentststus == 1) {
                onlineState = '<span class="text-success">' + "在线" + '</span>';
            } else if (ruleData.currentststus == 2) {
                onlineState = '<span class="text-success">' + "等待升级" + '</span>';
            } else if (ruleData.currentststus == 3) {
                onlineState = '<span class="text-success">' + "接收固件" + '</span>';
            } else if (ruleData.currentststus == 4) {
                onlineState = '<span class="text-success">' + "升级中" + '</span>';
            } else if (ruleData.currentststus == 5) {
                onlineState = '<span class="text-success" title="' + "升级成功，设备正在重启" + '">' + "升级成功" + '</span>';
            } else if (ruleData.currentststus == 6) {
                onlineState = '<span class="text-error">' + "升级失败" + '</span>';
            }

            if (ruleData.real_channel == 0) {
                channel = MSG.auto;
            } else {
                channel = ruleData.real_channel;
            }
            rule.checkbox = '<input type="checkbox" tindex="' + i + '" name="webAuthUserID" value="' + (i + 1) + '">';

            rule.apName = ruleData.apName;
            rule.macAddr = ruleData.macAddr;
            rule.clientNum = ruleData.clientNum;
            rule.ssid = ruleData.ssid;
            rule.real_channel = channel;
            rule.fversion = ruleData.fversion;
            rule.currentststus = onlineState;
            rule.operate = '<div class="operate"><span class="edit"></span></div>';

            devInfo.push(rule);
        };

        return {
            devList: devInfo
        };
    }

    //过滤数据
    function filterData(data, filterStr) {
        if (!filterStr) return data;

        var dataList = data.devList,
            filterDataList = [],
            rowObj = null;

        for (var i = 0; i < dataList.length; i++) {

            if ((dataList[i].apName + dataList[i].macAddr + dataList[i].ssid).indexOf(filterStr) != -1) {
                rowObj = $.extend(true, {}, dataList[i]);

                rowObj.apName = rowObj.apName.replace(filterStr, '<span class="text-danger">' + filterStr + '</span>');
                rowObj.macAddr = rowObj.macAddr.replace(filterStr, '<span class="text-danger">' + filterStr + '</span>');
                rowObj.ssid = rowObj.ssid.replace(filterStr, '<span class="text-danger">' + filterStr + '</span>');

                filterDataList.push(rowObj);
            }

        };

        return {
            devList: filterDataList
        };
    }

    /*
    @filter 筛选出 给定 data对象中，收集 属性的值 不在 被过滤值 之中的条目，返回筛选数据的id属性集合 或 FALSE
    data 为待筛选数据
    tracerObjArr 为一条数据的某个属性（类似id）的集合，用来追踪原始数据
    tracerAttr 为id属性的name
    filterAttr 为筛选属性
    filterVal 为筛选属性的值
    */
    function filter(data, tracerObjArr, tracerAttr, filterAttr, filterVal) {
        var tracer = ',' + tracerObjArr.join(',') + ',',
            filteredArr = [],
            i;
        if (filterVal instanceof Array) {
            var len = filterVal.length,
                j;
            for (i = data.length - 1; i >= 0; i--) {
                if (tracer.indexOf(data[i][tracerAttr]) !== -1) {
                    for (j = 0; j < len; j++) {
                        if (data[i][filterAttr] != filterVal[j]) {
                            if (j == len - 1) {
                                if (tracerAttr != 'ipAddr')
                                    filteredArr.push(data[i][tracerAttr]);
                                else
                                    filteredArr.push(data[i][tracerAttr] + ':' + data[i]['portNum']);
                            }
                        } else {
                            break;
                        }
                    }
                }
            }
        } else if (typeof filterVal == 'string' || typeof filterVal == 'number') {
            for (i = data.length - 1; i >= 0; i--) {
                if (tracer.indexOf(',' + data[i][tracerAttr] + ',') !== -1) {
                    if (data[i][filterAttr] != filterVal) {
                        filteredArr.push(data[i][tracerAttr]);
                    }
                }
            }
        }

        if (filteredArr.length === 0) {
            return false;
        }
        return filteredArr;
    }

    var mainView = new R.View($ws, {
        fetchUrl: '/w20e/goform/getWTPData',
        updateCallback: function(data) {
            G_data.list = data.apInfo;
            $('#onlineCount').html(data.onlineCount);
            return filterData(handleDevData(data.apInfo), $("#searchTxt").val());
        },
        events: (function() {
            var et = {};
            //搜索
            function search() {

                mainView.defaults.originData = filterData(handleDevData(G_data.list), $("#searchTxt").val());
                mainView.initElements();
            }

            //搜索
            et[ws + ' #searchBtn, click'] = function() {
                search();
            };

            //重启
            et[ws + ' .reboot, click'] = function() {
                var selected = apManageSelectEvent.getSelectedItems();
                var onlineItems = $.map(selected, function(selectedIndex) {
                    if (G_data.list[selectedIndex].currentststus == 1) {
                        return G_data.list[selectedIndex].macAddr;
                    }
                });

                if (selected.length < 1) {
                    showMsg(MSG.selDevReboot);
                    return;
                }

                if(onlineItems.length < 1) {
                    showMsg(_("请选择至少一台在线AP进行重启！"));
                    return;
                }

                showConfirm.call(this, "选中了 " + onlineItems.length + " 条在线AP，确认重启?", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/rebootWtp', {
                        macAddr: onlineItems.join(',')
                    }, function(res) {
                        showSaveMsg(MSG.devRebootSuc, 1000);
                        mainView.update();
                    });
                });
            };

            //升级
            et[ws + ' .upgrade, click'] = function() {
                var selected = apManageSelectEvent.getSelectedItems();
                if (selected.length < 1) {
                    showMsg(MSG.selDevUpgrade);
                    return;
                }

                $.GetSetData.getData("/w20e/goform/getACMemoState", function(req) {
                    if (req == 'success') {
                        $ws.find('.modal-add').eq(0).modal();
                    } else {
                        showMsg(MSG.memoryShortage);
                    }
                });
            };
            $("#doUpgrade").on("click", function() {
                var f = document.upgradeAps;
                if (f.upgrade.value == '') {
                    showMsg(MSG.selUpFile);
                    return;
                }

                var selected = apManageSelectEvent.getSelectedItems();
                var onlineItems = $.map(selected, function(selectedIndex) {
                    if ((G_data.list[selectedIndex].currentststus === 1) || (G_data.list[selectedIndex].currentststus === 6)) {
                        return G_data.list[selectedIndex].macAddr;
                    }
                });

                f.macAddr.value = onlineItems.join(',');
                if (onlineItems.length == 1) {
                    f.op.value = 'single';
                } else {
                    f.op.value = 'bat';
                }
                f.submit();
                $ws.find('.modal-add').modal('hide');
            });

            //复位
            et[ws + ' .reset, click'] = function() {
                var selected = apManageSelectEvent.getSelectedItems();
                var onlineItems = $.map(selected, function(selectedIndex) {
                    if (G_data.list[selectedIndex].currentststus == 1) {
                        return G_data.list[selectedIndex].macAddr;
                    }
                });

                if (selected.length < 1) {
                    showMsg(MSG.selDevReset);
                    return;
                }

                if (onlineItems.length === 0) {
                    showMsg(("请至少选择一台在线AP进行复位！"));
                    return;
                }

                showConfirm.call(this, "选中了 " + onlineItems.length + " 条在线AP，确认恢复出厂设置？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/restoreWtp', {
                        macAddr: onlineItems.join(',')
                    }, function(res) {
                        showSaveMsg(MSG.devResetSuc, 1000);
                        mainView.update();
                    });
                });
            };

            //删除
            et[ws + ' .btn-del, click'] = function() {
                var selected = apManageSelectEvent.getSelectedItems();
                var selectedItems = $.map(selected, function(selectedIndex) {
                    if (G_data.list[selectedIndex].currentststus == 0) {
                        return G_data.list[selectedIndex].macAddr;
                    }
                });

                if (selected.length < 1) {
                    showMsg(_("请选择要删除的设备"));
                    return;
                }

                if (selectedItems.length === 0) {
                    showMsg(MSG.noDelObj);
                    return;
                }

                showConfirm.call(this, "选中信息中包含 " + selectedItems.length + " 条离线设备信息，确认删除？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/delWtpData', {
                        macAddr: selectedItems.join(',')
                    }, function(res) {
                        showSaveMsg(MSG.delOK, 1000);
                        mainView.update();
                    });
                });
            };

            //编辑
            $ws.on("click", ".edit", function() {
                var idx = $(this).parents("tr").find(":checkbox").attr("tindex");
                var mac = G_data.list[idx].macAddr;
                G_curMac = mac;
                if (filter(G_data.list, [mac], 'macAddr', 'currentststus', [0, 1, 6])) {
                    showMsg(MSG.cantOp);
                    return;
                }

                $.getJSON('/w20e/goform/getDetailWtpData?macAddr=' + mac + '&' + Math.random(), function(data) {
                    $ws.find('.modal-add').eq(1).modal();
                    dialog.showWindow(data, idx);
                })
            });

            $("#searchTxt").on("keydown", function(e) {
                if (e.keyCode == 13) {
                    search();
                }
            });

            $("#refresh").on("click", function() {
                mainView.update();
                showMsg(MSG.dataUpOk);
            });

            return et;
        })()
    });

    var dialog = {
        action: null,
        index: -1,
        initEvent: function() {
            $(".nav-tabs li").on("click", dialog.changeMenu);
            $("#save").on("click", dialog.preSubmit);
            $("#cancel").on("click", function() {
                dialog.closeWindow();
            });

            $("#wanType").on("change", dialog.changeWanType);

            $("[name='ssidBand']").on("click", dialog.changeSsidBand);
            $("[name='radioBand']").on("click", dialog.changeRadioBand);

            $("#netMode").on("change", dialog.changeMode);
            $("[name='bandwidth']").on("click", dialog.changeBand);
            $("#channel").on("change", dialog.changeChannel);

            $("#netMode_5g").on("change", dialog.change5gMode);

            $("#wifiEn, #wifiEn_5g").on("click", dialog.changeWifiEn);
            $("[name='bandwidth_5g']").on("click", dialog.change5gBand);
            $("#channel_5g").on("change", dialog.change5gChannel);
            $("#country").on("change", dialog.changeCountry);
            dialog.initCountry();
        },
        initCountry: function() { //初始化国家
            var prop,
                country_str = "",
                countryObj = G_country;

            for (prop in countryObj) {
                country_str += "<option value='" + prop + "'>" + MSG[countryObj[prop].name] + "</option>";
            }

            $("#country").html(country_str);
        },
        initChannel: function() { //初始化2.4G信道
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
                    channel_str += "<option value='0'>" + MSG.auto + "</option>";
                } else {
                    channel_str += "<option value='" + arry[i] + "'>Channel " + arry[i] + "</option>";
                }
            }
            $("#channel").html(channel_str);
        },
        toggleManualSetRadio: function() {
            var className = $(this).attr("class");
            if (className == "btn-on") {
                $(this).attr("class", "btn-off");
                disableManualSetRadio(true);
                dialog.changeMode();
                dialog.change5gMode();
            } else {
                $(this).attr("class", "btn-on");
                disableManualSetRadio(false);
                dialog.changeMode();
                dialog.change5gMode();
            }
        },
        changeWifiEn: function() {
            var className = $(this).attr("class");
            if ($(this).hasClass('disabled')) {
                return;
            }
            if (className == "btn-on") {
                $(this).attr("class", "btn-off");
            } else {
                $(this).attr("class", "btn-on");
            }
        },
        changeWanType: function() {
            var wanType = $("#wanType").val();
            if (wanType == "0") {
                $("#staticIp").attr("disabled", true);
                $("#mask").attr("disabled", true);
                $("#gateway").attr("disabled", true);
                $("#dns1").attr("disabled", true);
                $("#dns2").attr("disabled", true);
            } else {
                $("#staticIp").removeAttr("disabled");
                $("#mask").removeAttr("disabled");
                $("#gateway").removeAttr("disabled");
                $("#dns1").removeAttr("disabled");
                $("#dns2").removeAttr("disabled");
            }
        },
        changeSsidBand: function() {
            if ($("[name='ssidBand']")[0].checked) {
                $("#wrlRadio_2g").removeClass("none");
                $("#wrlRadio_5g").addClass("none");
            } else {
                $("#wrlRadio_2g").addClass("none");
                $("#wrlRadio_5g").removeClass("none");
            }
        },
        changeRadioBand: function() {
            if ($("[name='radioBand']")[0].checked) {
                $("#radio_2g").removeClass("none");
                $("#radio_5g").addClass("none");
            } else {
                $("#radio_2g").addClass("none");
                $("#radio_5g").removeClass("none");
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
            $(".nav-tabs li").removeClass("active");
            if ($(this).hasClass("basic")) {
                $("#basic").removeClass("none");
                $("#ssid").addClass("none");
                $("#radio").addClass("none");
            } else {
                if (G_curMac == '' /* && G.selectedItems.length > 1*/ ) {}
                $("#radio").removeClass("none");
                $("#ssid").addClass("none");
                $("#basic").addClass("none");
            }
            $(this).addClass("active");
        },

        showWindow: function(data, idx) {
            dialog.action = "edit";
            dialog.initValue(data, idx);
        },
        closeWindow: function() {
            $(".window").addClass("none");
            $("#gbx_overlay_old").remove();
        },
        initSsidHtml: function(obj) {
            var prop,
                str1 = "<option value='禁用'>" + MSG.disable + "</option>",
                str = "<option value='无策略'>" + MSG.noSsidPolicy + "</option>";

            $("[id^='radio_2g_']").html(str1);
            $("[id^='radio_5g_']").html(str1);
            $("#radio_2g_1").html(str1);
            $("#radio_5g_1").html(str1);
            for (prop in obj) {
                $("[id^='radio_5g_'],[id^='radio_2g_']").each(function(idx, select) {
                    select.add(new Option(obj[prop], obj[prop]));
                });
            }
        },
        showSsid: function(ssidNum_24g, ssidNum_5g) {

            //根据ap支持的24ssid数量来更改ssid显示
            for (i = 1; i <= 8; i++) {
                if (i <= ssidNum_24g) {
                    $('#div_radio_2g_' + i).show();
                } else {
                    $('#div_radio_2g_' + i).hide();
                }
            }

            //ap支持的5g ssid数量禁用,启用，禁用5g设置
            if (ssidNum_5g == 0) {
                $('#band2').attr('disabled', true);
                $('#band2').attr('title', MSG.notSupport5);
                $('#radio2').attr('disabled', true);
                $('#radio2').attr('title', MSG.notSupport5);
            } else {
                $('#band2').removeAttr('disabled');
                $('#band2').removeAttr('title')
                $('#radio2').removeAttr('disabled');
                $('#radio2').removeAttr('title')

                //根据ap支持的5g ssid数量来更改ssid显示
                for (i = 1; i <= 4; i++) {
                    if (i <= ssidNum_5g) {
                        $('#div_radio_5g_' + i).show();
                    } else {
                        $('#div_radio_5g_' + i).hide();
                    }
                }
            }
        },
        initValue: function(data, idx) {
            var initData = data || {
                lanIp: "",
                lanMask: "255.255.255.0",
                wanType: "1", //0，dhcp；1，static
                staticIp: "",
                mask: "255.255.255.0",
                gateway: "",
                dns1: "",
                dns2: "",

                ssidBand: "1",


                radioBand: "0",
                country: "CN",
                wifiEn: "1",
                DFS1Enable: "0",
                DFS2Enable: "0",
                netMode: "0", //0 1 2 3 4
                bandwidth: "1",
                channel: "5",
                extChannel: "lower",
                power: "17",
                wmmEn: "0",
                ssidIsolationEn: "0",
                apsdEn: "0",

                wifiEn_5g: "1",
                netMode_5g: "1", //0 1
                bandwidth_5g: "1",
                channel_5g: "157",
                extChannel_5g: "lower",
                power_5g: "17",
                wmmEn_5g: "0",
                ssidIsolationEn_5g: "0",
                apsdEn_5g: "0"
            }
            initData.radioBand = "0";

            G_DFSAuth = [];
            G_DFSAuth.push(initData["DFS1Enable"]);
            G_DFSAuth.push(initData["DFS2Enable"]);

            //dialog.initSsidHtml(initData.initSsid[0]); //ssid policy
            G.lanIp = initData.lanIp;
            G.mask = initData.lanMask;
            for (var prop in initData) {
                if (prop == "country" || prop == "wanType" || prop == "staticIp" || prop == "mask" || prop == "gateway" || prop == "dns1" || prop == "dns2" || prop == "channel" || prop == "power" || prop == "power_5g" || prop == "netMode" || prop == "netMode_5g" || prop == "disturbType" || prop == "disturbType_5g" || prop == "rssi" || prop == "rssi_5g") {
                    $("#" + prop).val(initData[prop]);
                } else if (prop == "ssidBand" || prop == "radioBand" || prop == "bandwidth" || prop == "bandwidth_5g") {
                    $("[name='" + prop + "']")[initData[prop]].checked = true;
                } else if (prop == "radio_2g_1" || prop == "radio_2g_2" || prop == "radio_2g_3" || prop == "radio_2g_4" || prop == "radio_2g_5" || prop == "radio_2g_6" || prop == "radio_2g_7" || prop == "radio_2g_8" || prop == "radio_5g_1" || prop == "radio_5g_2" || prop == "radio_5g_3" || prop == "radio_5g_4") {
                    $("#" + prop).val(initData[prop]);
                } else if (prop == "wifiEn" || prop == "wifiEn_5g") {
                    if(initData[prop] === 1) {
                        $("[name='" + prop + "']")[0].checked = true;
                    } else {
                        $("[name='" + prop + "']")[1].checked = true;
                    }
                    
                } else if (prop == "channel" || prop == "channel_5g" || prop == "extChannel_5g" || prop == "extChannel" || prop == "lanIp" || prop == "lanMask") {
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
            var productName,
                ssidNum_24g = 0,
                ssidNum_5g = 0,
                i, j, l;
            if (idx) {
                $("#devNumLabel").html(MSG.modelNo);
                $("#devNum").html(G_data.list[idx].apName);
                $("#wanType").attr('disabled', false);
                G.singleData = true;

                productName = G_data.list[idx].apName.toLowerCase();
                if (!APSTATE[productName]) {
                    productName = productName.slice(0, productName.indexOf('v') === -1 ?
                        productName.length : productName.indexOf('v'));
                }

                ssidNum_24g = APSTATE[productName]['_24g'];
                ssidNum_5g = APSTATE[productName]['_5g'];
            } else {
                $("#devNumLabel").html(MSG.selDev);
                $("#devNum").html(G.selectedItems.length + MSG.apNum);
                $("#wanType").val(0).attr('disabled', true);
                G.singleData = false;

                //计算最多支持的5g和24gssid数量
                for (l = G.selectedItems.length; l-- > 0;) {
                    for (j = G.pageData.length; j-- > 0;) {
                        if (G.pageData[j].macAddr == G.selectedItems[l]) {
                            productName = G.pageData[j].apName.toLowerCase();
                            if (!APSTATE[productName]) {
                                productName = productName.slice(0, productName.indexOf('v') === -1 ?
                                    productName.length : productName.indexOf('v'));
                            }
                            if (ssidNum_24g < APSTATE[productName]['_24g']) {
                                ssidNum_24g = APSTATE[productName]['_24g'];
                            }
                            if (ssidNum_5g < APSTATE[productName]['_5g']) {
                                ssidNum_5g = APSTATE[productName]['_5g'];
                            }
                        }
                    }
                }
            }

            //根据最大ssid数量显示ssid
            dialog.showSsid(ssidNum_24g, ssidNum_5g);

            /***定位到第一个标签****/
            $(".nav-tabs li").removeClass("active");
            $("#basic").removeClass("none");
            $("#ssid").addClass("none");
            $("#radio").addClass("none");
            $(".nav-tabs .basic").addClass("active");

            dialog.changeWanType();
            dialog.changeCountry();
            dialog.changeRadioBand();
            dialog.changeSsidBand();

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

            //批量修改不需要检验数据
            if (!G.singleData) {
                return;
            }
            var lanIp = G.lanIp,
                lanMask = G.mask,
                ip = $("#staticIp").val(),
                mask = $("#mask").val(),
                gateway = $("#gateway").val(),
                dns1 = $("#dns1").val(),
                dns2 = $("#dns2").val(),
                mask_arry = mask.split("."),
                ip_arry = ip.split("."),
                mask_arry2 = [],
                maskk,
                netIndex = 0,
                netIndex1 = 0,
                bIndex = 0,
                power = $("#power").val(),
                power_5g = $("#power_5g").val(),
                rel_num = /^[0-9]{1,}$/,
                rel_ip = /^([1-9]|[1-9]\d|1\d\d|2[0-1]\d|22[0-3])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/,
                rel_msk = /^(254|252|248|240|224|192|128|0)\.0\.0\.0$|^(255\.(254|252|248|240|224|192|128|0)\.0\.0)$|^(255\.255\.(254|252|248|240|224|192|128|0)\.0)$|^(255\.255\.255\.(254|252|248|240|224|192|128|0))$/,
                rel_dns2 = /^([0-9]|[1-9]\d|1\d\d|2[0-1]\d|22[0-3])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/;
            if ($("#wanType").val() == "1") {
                if (!rel_ip.test(ip)) {
                    return MSG.ipAddrErr;
                }
                if (!rel_msk.test(mask)) {
                    return MSG.submaskErr;
                }
                if (gateway != "" && !rel_ip.test(gateway)) {
                    return MSG.gatewayErr;
                }
                if (dns1 != "" && !rel_ip.test(dns1)) {
                    return MSG.mainDNSErr;
                }
                if (dns1.indexOf('127') === 0 || dns2.indexOf('127') === 0) {
                    return MSG.dnsNot127;
                }
                if (dns2 != "") {
                    if (!rel_ip.test(dns2)) {
                        return MSG.subDNSErr;
                    }
                    if (dns2 == dns1) {
                        return MSG.dnsSameErr;
                    }
                }
                if (gateway != "" && !R.Valid.isSameNet(ip, gateway, mask, mask)) {
                    return MSG.gateLanIPSegErr;
                }
                if (gateway != "" && ip == gateway) {
                    return MSG.gateLanIPSameErr;
                }
                //检查是否为网络号 广播地址
                for (var i = 0; i < mask_arry.length; i++) {
                    maskk = 255 - parseInt(mask_arry[i], 10);
                    mask_arry2.push(maskk);
                }
                for (var k = 0; k < 4; k++) {
                    if ((ip_arry[k] & mask_arry[k]) == 0) {
                        netIndex1 += 0;
                    } else {
                        netIndex1 += 1;
                    }
                }
                for (var k = 0; k < 4; k++) {
                    if ((ip_arry[k] & mask_arry2[k]) == 0) {
                        netIndex += 0;
                    } else {
                        netIndex += 1;
                    }
                }
                if (netIndex == 0 || netIndex1 == 0) {
                    return MSG.netIPErr;
                }
                for (var j = 0; j < 4; j++) {
                    if ((ip_arry[j] | mask_arry[j]) == 255) {
                        bIndex += 0;
                    } else {
                        bIndex += 1;
                    }
                }
                if (bIndex == 0) {
                    return MSG.broadcastIPErr;
                }
            }
            if (!rel_num.test(power)) {
                return MSG.power2Rate;
            }
            if (parseInt(power, 10) > 23 || parseInt(power, 10) < 8) {
                return MSG.power2Range;
            }

            //65AP, or 选中多个，不需要进行5g数据检查
            if ($('#band2').attr('disabled') !== 'disabled' /* && !(G.curMac == '' && G.selectedItems.length > 1)*/ ) {
                if (!rel_num.test(power_5g)) {
                    return MSG.power5Rate;
                }
                if (parseInt(power_5g, 10) > 23 || parseInt(power_5g, 10) < 8) {
                    return MSG.power5Range;
                }
            }
            var rssi = +$('#rssi').val(),
                rssi_5g = +$('#rssi_5g').val();
            if (rssi > 90 || rssi < 60) {
                return 'RSSI输入范围:60-90';
            }
            if (!$('#band2')[0].disabled) {
                if (rssi_5g > 90 || rssi_5g < 60) {
                    return 'RSSI输入范围:60-90';
                }
            }
        },
        preSubmit: function() {
            var msg = dialog.checkData() || "",
                /*manualSetRadio,*/
                ssidBand,
                wifiEn,
                wifiEn_5g,
                radioBand,
                bandwidth,
                bandwidth_5g;

            if (msg) {
                showMsg(msg);
                return;
            }
            if ($("[name='ssidBand']")[1].checked) {
                ssidBand = 1;
            } else {
                ssidBand = 0;
            }

            wifiEn = $('[name="wifiEn"]:checked').val();
            wifiEn_5g = $('[name="wifiEn_5g"]:checked').val();

            if ($("[name='radioBand']")[1].checked) {
                radioBand = 1;
            } else {
                radioBand = 0;
            }

            if ($("[name='bandwidth']")[1].checked) {
                bandwidth = 1;
            } else if ($("[name='bandwidth']")[0].checked) {
                bandwidth = 0;
            } else {
                bandwidth = 2;
            }

            if ($("[name='bandwidth_5g']")[2].checked) {
                bandwidth_5g = 2;
            } else if ($("[name='bandwidth_5g']")[1].checked) {
                bandwidth_5g = 1;
            } else {
                bandwidth_5g = 0;
            }
            subData = {
                wanType: $("#wanType").val(),
                staticIp: $("#staticIp").val(),
                mask: $("#mask").val(),
                gateway: $("#gateway").val(),
                dns1: $("#dns1").val(),
                dns2: $("#dns2").val(),

                ssidBand: ssidBand,
                radio_2g_1: $("#radio_2g_1").val(),
                radio_2g_2: $("#radio_2g_2").val(),
                radio_2g_3: $("#radio_2g_3").val(),
                radio_2g_4: $("#radio_2g_4").val(),
                radio_2g_5: $("#radio_2g_5").val(),
                radio_2g_6: $("#radio_2g_6").val(),
                radio_2g_7: $("#radio_2g_7").val(),
                radio_2g_8: $("#radio_2g_8").val(),
                radio_5g_1: $("#radio_5g_1").val(),
                radio_5g_2: $("#radio_5g_2").val(),
                radio_5g_3: $("#radio_5g_3").val(),
                radio_5g_4: $("#radio_5g_4").val(),

                /*manualSetRadio: manualSetRadio,*/
                radioBand: radioBand,
                country: $("#country").val(),
                wifiEn: wifiEn,
                netMode: $("#netMode").val(),
                disturbType: $('#disturbType').val(),
                rssi: $('#rssi').val(),
                bandwidth: bandwidth,
                channel: $("#channel").val(),
                extChannel: $("#extChannel").val() || 0,
                power: $("#power").val(),

                wifiEn_5g: wifiEn_5g,
                netMode_5g: $("#netMode_5g").val(),
                bandwidth_5g: bandwidth_5g,
                disturbType_5g: $('#disturbType_5g').val(),
                rssi_5g: $('#rssi_5g').val(),
                channel_5g: $("#channel_5g").val(),
                extChannel_5g: $("#extChannel_5g").val() || 0,
                power_5g: $("#power_5g").val()
            }
            submitData(subData);
            $ws.find('.modal-add').modal('hide');
        }
    };

    function submitData(data) {
        var macAddr;
        var selected = apManageSelectEvent.getSelectedItems();
        var selectedMac = $.map(selected, function(selectedIndex) {
            return G_data.list[selectedIndex].macAddr;
        });
        //top.showMsg('数据保存中...');
        if (G.singleData) {
            data.macAddr = G_curMac;
            data.op = 'single';
        } else {
            data.macAddr = selectedMac.join(',');
            data.op = 'bat';
        }
        $.GetSetData.setData('/w20e/goform/setWtpData', data, function(str) {
            mainView.update();
            if (selected.length > 100) {
                showMsg("数据保存成功，配置下发大概需要 " + parseInt(selected.length / 100) * 5 + " 秒，期间服务器响应速度较慢，请耐心等待", 4000);
            } else {
                showMsg(MSG.saveSuc);
            }
        })
    }

    //initEvent
    dialog.initEvent();
})
