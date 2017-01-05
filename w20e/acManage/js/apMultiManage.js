var G = {};
$(function() {
    var G_data = {},
        ws = "#userArea", //最外包裹着表，编辑框，添加框的包裹元素选择器
        $ws = $(ws),
        filterStr = ""; //过滤字符串

    /****************  列表  *************************/
    var apTableSelectEvent = new TableSelectEvent($("#userlistWrap")).init();

    //处理基本数据，组成表格需要的数据形式
    function handleDevData(data) {
        var devInfo = [],
            ruleData = {},
            onlineState = '',
            ledEn = '',
            rule;


        for (var i = 0; i < data.length; i++) {
            if (data[i].led_enable) {
                ledEn = MSG.enable;
            } else {
                ledEn = MSG.close;
            }

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
            ruleData = data[i];
            rule = {};
            rule.checkbox = '<input type="checkbox" tindex="' + i + '" name="webAuthUserID" value="' + (i + 1) + '">';

            rule.apName = ruleData.apName;
            rule.macAddr = ruleData.macAddr;
            rule.ssid = ruleData.ssid;
            rule.ledEn = ledEn;
            rule.real_channel = ruleData.rebootPolicy;
            rule.fversion = ruleData.alertPolicy;
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

    function getSsidInfo(callback) {
        var selected = apTableSelectEvent.getSelectedItems();
        var selectedMac = $.map(selected, function(index) {
            return G_data.list[index].macAddr;
        });

        $.GetSetData.setData('/w20e/goform/getSsidState', {macAddr: selectedMac[0]}, function(data) {
            callback(data);
        })
    }

    function initPolicyList(data) {
		data = $.parseJSON(data);
        var ssidList = data.initSsid;
        var options = '<option value="禁用">禁用</option>';
         for (var i = 0; i < ssidList.length; i++) {
            options += '<option value="' + ssidList[i] + '">' + ssidList[i] + '</option>';
        }
        $('#ssidDialog select').each(function(index) {
            $(this).html(options);
            $(this).val(data[this.id] ? data[this.id] : '');
        });
    }

    function wirelessSetInit() {
        var selected = apTableSelectEvent.getSelectedItems();
        var apList = $.map(selected, function(index) {
                return G_data.list[index].apName;
            }),
            _24g = [],
            _5g = [],
            tmp;
        for (var i = 0, l = apList.length; i < l; i++) {
            if (tmp = APSTATE[apList[i].toLowerCase()]) {
                _24g.push(tmp._24g);
                _5g.push(tmp._5g);
            }
        }

        $("[name='ssidBand']:first").click();
        dialog.changeSsidBand();
        dialog.showSsid(Math.max.apply(null, _24g), Math.max.apply(null, _5g));
        getSsidInfo(initPolicyList);
    }

    var mainView = new R.View($ws, {
        fetchUrl: '/w20e/goform/getAdvSetData',
        updateCallback: function(data) {
            G_data.list = data.advApInfo;
            $('#onlineCount').html(data.onlineCount);
            //初始化下拉菜单
            dialog.initSelect(data.allAlertPolicy[0], data.allRebootPolicy[0], data.allPwdPolicy[0]);
            return filterData(handleDevData(data.advApInfo), $("#searchTxt").val());
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

            //无线配置
            et[ws + ' .wrlset, click'] = function() {
                var selected = apTableSelectEvent.getSelectedItems();
                if (selected.length < 1) {
                    showMsg('请选择要操作的设备！');
                    return;
                }
                $ws.find('.modal-add').eq(1).modal();
                wirelessSetInit();
            };

            //高级配置
            et[ws + ' .advset, click'] = function() {
                var selected = apTableSelectEvent.getSelectedItems();

                if (selected.length < 1) {
                    showMsg('请选择要操作的设备！');
                    return;
                }

                dialog.initValue($.map(selected, function(index) {
                    return G_data.list[index].macAddr;
                }));
                $ws.find('.modal-add').eq(0).modal();
            };

            //缺省配置
            et[ws + ' .defset, click'] = function() {
                var selected = apTableSelectEvent.getSelectedItems();

                if (selected.length < 1) {
                    showMsg('请选择要操作的设备！');
                    return;
                }

                showConfirm.call(this, "确认将这 " + selected.length + " 个设备设为缺省设置？", function() {
                    $.GetSetData.setData('/w20e/goform/modifyAdvPolicy', {
                        op: 1,
                        macAddr: $.map(selected, function(index) {
                            return G_data.list[index].macAddr.toLowerCase();
                        }).join(',')
                    }, function(str) {
                        if (str == 'success') {
                            showMsg(MSG.confSuc);
                        } else if (str == 'fail' || str == 'error') {
                            showMsg(MSG.confFail);
                        }
                        mainView.update();
                    });
                });
            };

            //删除
            et[ws + ' .btn-del, click'] = function() {
                var selected = apTableSelectEvent.getSelectedItems();
                var selectedUpdateOk = $.map(selected, function(selectedIndex) {
                    if ((G_data.list[selectedIndex].currentststus === 0) || (G_data.list[selectedIndex].currentststus === 5)) {
                        return G_data.list[selectedIndex].macAddr;
                    }
                });

                if (selected.length < 1) {
                    showMsg('请选择要删除的条目！');
                    return;
                }

                if(selectedUpdateOk.length < 1) {
                    showMsg(MSG.noDelObj);
                    return;
                }

                showConfirm.call(this, "选中信息中包含 " + selectedUpdateOk.length + " 条未使用策略信息，确认删除？", function() {
                    $.GetSetData.setData('/w20e/goform/delWtpData', {
                        macAddr: selectedUpdateOk.join(',')
                    }, function(str) {
                        showMsg(MSG.delOK);
                        mainView.update();
                    });
                });
            };
            return et;
        })()
    });

    var dialog = {
        initEvent: function() {
            $("#save").on("click", dialog.preSubmit);
            $("#cancel").on("click", function() {
                dialog.closeWindow('policyDialog')
            });
            $('#saveSsid').on('click', dialog.preSubmitSsid);
            $('#cancelSsid').on('click', function() {
                dialog.closeWindow('ssidDialog')
            });
            $("[name='ssidBand']").on("click", dialog.changeSsidBand);
        },
        initSelect: function(alertData, rebootData, pwdData) {
            var reboot_str = "",
                alert_str = "",
                i = 0,
                prop;
            $("#rebootPolicy")[0].innerHTML = '';
            $("#alertPolicy")[0].innerHTML = '';
            $("#pwdPolicy")[0].innerHTML = '';
            for (prop in rebootData) {
                $("#rebootPolicy")[0].add(new Option(rebootData[prop], rebootData[prop]));
            }
            for (prop in alertData) {
                $("#alertPolicy")[0].add(new Option(alertData[prop], alertData[prop]));
            }
            for (prop in pwdData) {
                $("#pwdPolicy")[0].add(new Option(pwdData[prop], pwdData[prop]));
            }
        },
        preSubmitSsid: function() {
            var selected = apTableSelectEvent.getSelectedItems();
            var macArray = $.map(selected, function(index) {
                return G_data.list[index].macAddr;
            });

            $.GetSetData.setData('/w20e/goform/setWtpData', 'op=bat&macAddr=' + macArray + '&' + $('#ssidDialog input, #ssidDialog select').serialize(), function() {
                $ws.find('.modal-add').modal('hide');
                showMsg('保存成功');
                mainView.update();
            });
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
        closeWindow: function(id) {
            $("#" + id).addClass("none");
            $("#gbx_overlay_old").remove();
        },
        initValue: function(data) {
            var initData = data,
                rebootPolicy,
                alertPolicy,
                pwdPolicy,
                curPageMac = [],
                curPageRebootPolicy = [],
                curPageAlertPolicy = [],
                i;
            $("tbody tr").each(function() {
                curPageMac.push($(this).find("td").eq(2).html());
                curPageRebootPolicy.push($(this).find("td").eq(5).html());
                curPageAlertPolicy.push($(this).find("td").eq(6).html());
            });
            for (i = 9; i >= 0; i--) {
                if (curPageMac[i] == initData[0]) {
                    rebootPolicy = curPageRebootPolicy[i];
                    alertPolicy = curPageAlertPolicy[i];
                }
            }
            $("#rebootPolicy").val(rebootPolicy || MSG.noPolicy);
            $("#alertPolicy").val(alertPolicy || MSG.noPolicy);
        },
        preSubmit: function() {
            var subData = {
                rebootPolicy: $("#rebootPolicy").val(),
                alertPolicy: $("#alertPolicy").val(),
            }
            dialog.closeWindow('policyDialog');
            submitData(subData);
        }
    };

    function submitData(data) {
        var selected = apTableSelectEvent.getSelectedItems();
            url = '/w20e/goform/modifyAdvPolicy';
        var selectedMac = $.map(selected, function(index) {
            return G_data.list[index].macAddr;
        })

        data.macAddr = selectedMac.join(',').toLowerCase();
        data.op = 0;
        $.GetSetData.setData(url, data, function(str) {
            $ws.find('.modal-add').modal('hide');
            showMsg(MSG.saveSuc);
            mainView.update();
        })
    }

    //init event
    dialog.initEvent();
})
