$(function() {
    var G_data = {},
        ws = "#userArea", //最外包裹着表，编辑框，添加框的包裹元素选择器
        $ws = $(ws),
        filterStr = ""; //过滤字符串

    /****************  列表  *************************/
    var devTableSelectEvent = new TableSelectEvent($("#userlistWrap")).init();

    //处理基本数据，组成表格需要的数据形式
    function handleDevData(data) {
        var devInfo = [],
            ruleData = {},
            onlineState,
            channel,
            rule;

        for (var i = 0; i < data.length; i++) {
            switch (parseInt(data[i].currentststus, 10)) {
                case 0:
                    onlineState = MSG.offline;
                    break;
                case 1:
                    onlineState = '<span class="text-success">' + MSG.online + '</span>';
                    break;
                case 2:
                    onlineState = '<span class="text-success">' + MSG.waitForUp + '</span>';
                    break;
                case 3:
                    onlineState = '<span class="text-success">' + MSG.receiveExe + '</span>';
                    break;
                case 4:
                    onlineState = '<span class="text-success">' + MSG.upgrading + '</span>';
                    break;
                case 5:
                    onlineState = '<span class="text-success" title="' + MSG.upgradeOKTitle + '">' + MSG.upgradeSuc + '</span>';
                    break;
                case 6:
                    onlineState = '<span class="text-error">' + MSG.upgradeFail + '</span>';
                    break;
                default:
                    break;
            }
            if(data[i].real_channel == 0) {
                channel = MSG.auto;
            } else {
                channel = data[i].real_channel;
            }
            ruleData = data[i];
            rule = {};
            rule.checkbox = '<input type="checkbox" tindex="' + i + '" name="webAuthUserID" value="' + (i + 1) + '">';
            rule.apName = ruleData.apName;
            rule.ipAddr = ruleData.ipAddr;
            rule.macAddr = ruleData.macAddr;
            rule.clientNum = ruleData.clientNum;
            rule.ssid = ruleData.ssid;
            rule.real_channel = channel;
            rule.fversion = ruleData.fversion;
            rule.currentststus = onlineState;

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

            if ((dataList[i].apName + dataList[i].ipAddr + dataList[i].macAddr + dataList[i].ssid).indexOf(filterStr) != -1) {
                rowObj = $.extend(true, {}, dataList[i]);

                rowObj.apName = rowObj.apName.replace(filterStr, '<span class="text-danger">' + filterStr + '</span>');
                rowObj.ipAddr = rowObj.ipAddr.replace(filterStr, '<span class="text-danger">' + filterStr + '</span>');
                rowObj.macAddr = rowObj.macAddr.replace(filterStr, '<span class="text-danger">' + filterStr + '</span>');
                rowObj.ssid = rowObj.ssid.replace(filterStr, '<span class="text-danger">' + filterStr + '</span>');

                filterDataList.push(rowObj);
            }
        };

        return {
            devList: filterDataList
        };
    }

    var mainView = new R.View($ws, {
        fetchUrl: '/w20e/goform/getWTPData',
        updateCallback: function(data) {
            G_data.list = data.apInfo;
            $("#onlineCount").html(data.onlineCount);
            $.GetSetData.getJson('/w20e/goform/acManageEn', function(data) {
                var ACEn = data.acEn;
                if (ACEn === true) {
                    $("[name='apManageEn']")[0].checked = true;
                    $("#devInfo").removeClass("none");
                } else {
                    $("[name='apManageEn']")[1].checked = true;
                    $("#devInfo").addClass("none");
                }
            });
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

            $("#searchTxt").on("keydown", function(e) {
                if (e.keyCode == 13) {
                    search();
                }
            });

            $("#scanDev").on("click", function() {
                $.GetSetData.getData("/w20e/goform/scanWTP", function(str) {
                    if (str) {
                        showMsg(MSG.scanOk);
                        mainView.update();
                    }
                });
            });

            $("#export").on("click", function() {
                $.GetSetData.setData("/w20e/goform/handleWtpInfo", {
                    type: "ap",
                    language: "cn"
                }, function(req) {
                    if (req == 'error' || req == 'fail') {
                        showMsg(_("导出日志出错"));
                    } else {
                        window.location = req;
                    }
                });
            });

            $("#delete").on("click", function() {
                var selected = devTableSelectEvent.getSelectedItems();
                var selectedOffline = $.map(selected, function(selectedIndex) {
                    if (G_data.list[selectedIndex].currentststus === 0) {
                        return G_data.list[selectedIndex].macAddr;
                    }
                });

                if (selectedOffline.length < 1) {
                    showMsg(MSG.noDelObj);
                    return;
                }

                showConfirm.call(this, "选中信息中包含 " + selectedOffline.length + " 条离线设备信息，确认删除？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/delWtpData', {
                        macAddr: selectedOffline.join(',')
                    }, function(res) {
                        showSaveMsg(_('删除成功！'), 1000);
                        mainView.update();
                    });
                });
            });

            $("#refresh").on("click", function() {
                mainView.update();
                showMsg(MSG.dataUpOk);
            });

            $("[name='apManageEn']").on("change", function() {
                if ($("[name='apManageEn']:checked").val() === "true") {
                    $("#devInfo").removeClass("none");
                    showSaveMsg(_('正在开启...'), 1000);
                } else {
                    $("#devInfo").addClass("none");
                    showSaveMsg(_('正在关闭...'), 1000);
                }
                $.GetSetData.setData('/w20e/goform/setAcManagementEn', {
                    acEn: $("[name='apManageEn']:checked").val()
                });
            });

            return et;
        })()
    });
})
