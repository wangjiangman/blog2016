var authAddRowHTML = $("#authAddTable tr")[0].outerHTML;
$(function() {

    var G_data = {};
    var G_server = {};
    var G_cloudEn;
    var G_authEn;
    var G_weiEn;
    var G_wan = [];

    var lanIp,
        lanMask;
    $.GetSetData.getJson('/w20e/goform/getNetworkIpMask', function(data) {
        lanIp = data.lan.lanIP;
        lanMask = data.lan.lanMask;
        G_wan = data.wan;
    });

    /****************  主体  *************************/
    var authTableSelectEvent = new TableSelectEvent($('#authContainer')).init();

    //处理基本数据，组成表格需要的数据形式，原始数据保存在G_data.authData
    function handleAuthData(data) {
        G_server = data.pppoeServer;
        var userInfo =  [],
            qosInfo = [],
            ruleData = {},
            qosData = {},
            qosrule,
            rule;
        G_cloudEn = data.cloudManageEn;
        G_authEn = data.webAuthServerEn;
        G_weiEn = data.wewifiEn;

        for (var i = 0; i < data.pppoeWhiteUser.length; i++) {
            ruleData = data.pppoeWhiteUser[i];
            ruleData.pppoeWhiteMac = ruleData.pppoeWhiteMac.toUpperCase();

            rule = {};
            rule.checkbox = '<input type="checkbox" tindex="' + i + '" name="webAuthWhiteID" value="' + ruleData.webAuthWhiteID + '">';

            rule.pppoeWhiteMac = ruleData.pppoeWhiteMac;
            rule.pppoeWhiteMacNote = ruleData.pppoeWhiteMacNote
            rule.operate = '<div class="operate"><span class="edit"></span><span class="delete"></span></div>';
            userInfo.push(rule);
        }
        G_data.authData = $.extend(true, {}, data);
        data.pppoeWhiteUser = userInfo;

        for (var j = 0; j < data.pppoeUserQosRules.length; j++) {
            qosData = data.pppoeUserQosRules[j];
            qosrule = {};
            qosrule.userQosRuleName = qosData.userQosRuleName;
            qosrule.userQosRuleUpRate = qosData.userQosRuleUpRate + "KB/s";
            qosrule.userQosRuleDownRate = qosData.userQosRuleDownRate + "KB/s";
            qosrule.operate = '<div class="operate"><span class="edit"></span></div>';
            qosInfo.push(qosrule);
        };
        data.pppoeUserQosRules = qosInfo;

        return data;
    }

    function ipAndMask(str1, str2) {
        var ip = []; 
        ip = str1.split(".");
        var mask = [];
        mask = str2.split('.');
        var result = [];
        if((ip.length !== 4) || (mask.length !== 4)) {
            return false;
        }
        for(var i = 0; i < 4; i++) {
            result.push(ip[i] & mask[i]);
        }

        return result.join(".");
    }

    function reboot() {
        $.GetSetData.setData("/w20e/goform/reboot", "", function () {
            var p = new top.Progress(window.location.href.replace(/(http(s)?:\/\/.+(\/)).*/gi, "$1"), 600, $("#progress-dialog")[0]);
            p.show("center");
            p.setText(_("系统正在重启,请稍候..."));
            p.start();
        });
    }

    function showConfirmMsg(msg, rebootFlag) {
        showConfirm.call(this, msg, function() {
            authView.submit('/w20e/goform/setPPPoEServerBasicInfo', new AutoCollect("#authContainer form:eq(0), #authContainer form:eq(1)").getJson(), function() {
                authView.update();
                if(rebootFlag === 1) {
                    reboot();
                } else {
                    showSaveMsg(_("保存成功"),1000);
                }
            });
        });
    }

    var authView = new R.View('#authContainer', {
        fetchUrl: '/w20e/goform/getPPPoEServerBasicInfo',
        updateCallback: handleAuthData,
        events: {
            '#addRules, click': function() {
                if (G_data.authData.pppoeWhiteUser.length >= R.CONST.CONFIG_PPPOE_WHITE_MAC_NUMBER) {
                    showMsg(_('不需要认证的主机最多只能添加%s条', [R.CONST.CONFIG_PPPOE_WHITE_MAC_NUMBER]));
                    return;
                }

                $('#auth-modal-add').modal().find('.modal-header>span').text('新增不受限制主机');
                authAddForm.reset();
            },

            '#authlist, click, .edit': function() {
                $('#auth-modal-edit').modal().find('.modal-header>span').text('编辑规则');
                var index = $(this).parents('tr').find(":checkbox").attr("tindex");
                var data = $.extend(true, {pppoeServerWhiteMacIndex: index}, G_data.authData.pppoeWhiteUser[index]);
                authEditForm.update(data);
            },

            '#qoslist, click, .edit': function() {
                $('#qos-modal-edit').modal();
                var index = $(this).parents('tr').index("#qoslist tr") - 1;
                var data = {
                    userQosRuleIndex: index,
                    userQosRuleName: G_data.authData.pppoeUserQosRules[index].userQosRuleName,
                    userQosRuleUpRate: G_data.authData.pppoeUserQosRules[index].userQosRuleUpRate,
                    userQosRuleDownRate:G_data.authData.pppoeUserQosRules[index].userQosRuleDownRate
                };

                qosEditForm.update(data);
            },
            
            '#auth-save, click': function() {
                var submitStatus = $('[name="pppoeServerEn"]:checked').val();
                var pppoeServerIP = $("#pppoeServerIP").val();
                var startServerIP = $("#pppoeServerStartIP").val();
                var endServerIP = $("#pppoeServerEndIP").val();

                var validateObj = $.validate({"wrapElem": "#authContainer"});
                    if (!validateObj.check()) {
                        showMsg(_("输入有误，请检查红色的输入框"));
                        return false;
                }

                if((ipAndMask(pppoeServerIP,"255.255.255.0") !== ipAndMask(startServerIP,"255.255.255.0")) || (ipAndMask(pppoeServerIP,"255.255.255.0") !== ipAndMask(endServerIP,"255.255.255.0"))) {
                    showMsg(_("PPPoE服务器IP地址与起始IP和结束IP应在同一网段。"));
                    return false;
                }

                if(parseInt(startServerIP.split('.')[3]) > parseInt(endServerIP.split('.')[3])) {
                    showMsg(_("PPPoE用户起始IP不能大于结束IP。"));
                    return false;
                }

                var pppoeIpAndPppoeMask = ipAndMask(pppoeServerIP, "255.255.255.0");
                var pppoeIpAndLanMask = ipAndMask(pppoeServerIP, lanMask);
                var lanIpAndpppoeMask = ipAndMask(lanIp, "255.255.255.0");
                var lanIpAndLanMask = ipAndMask(lanIp, lanMask);
                if((pppoeIpAndPppoeMask === lanIpAndpppoeMask) || (pppoeIpAndLanMask === lanIpAndLanMask)) {
                    showMsg(_("PPPoE服务器IP地址不能与LAN口IP同网段。"));
                    return false;
                }

                for(var i = 0; i < G_wan.length; i++) {
                    if(G_wan[i].wanIP !== "") {
                        var pppoeIpAndWanMask = ipAndMask(pppoeServerIP, G_wan[i].wanMask);
                        var wanIpAndPppoeMask = ipAndMask(G_wan[i].wanIP,  "255.255.255.0");
                        var wanIpAndWanMask = ipAndMask(G_wan[i].wanIP, G_wan[i].wanMask);
                        if((pppoeIpAndPppoeMask === wanIpAndPppoeMask) || (pppoeIpAndWanMask === wanIpAndWanMask)) {
                            showMsg(_("PPPoE服务器IP地址不能与WAN"+i+"口IP同网段。"));
                            return false;
                        }
                    }
                }
                
                if ((submitStatus=== "true") && ((G_cloudEn|G_authEn|G_weiEn) === 1)) {
                    if(G_cloudEn === true) {
                        showConfirmMsg("PPPoE认证服务器开启后，云认证功能将会关闭，且系统将会重启，是否确认开启PPPoE认证服务器？", 1);
                    } else if(G_authEn === true){
                        showConfirmMsg("PPPoE认证服务器开启后，WEB认证功能将会关闭，是否确认开启PPPoE认证服务器？", 0);
                    } else if(G_weiEn === true) {
                        showConfirmMsg("PPPoE认证服务器开启后，微信连WiFi功能将会关闭，是否确认开启PPPoE认证服务器？", 0);
                    }
                } else {
                    showSaveMsg(_("请稍候..."));
                    authView.submit('/w20e/goform/setPPPoEServerBasicInfo', new AutoCollect("#authContainer form:eq(0), #authContainer form:eq(1)").getJson(), function() {
                            showSaveMsg(_("保存成功"), 1000);
                            authView.update();
                        });
                }
            },    

            '#auth-cancel, click': function() {
                authView.initElements();
            },

            '#removeRules, click': function() {
                var selected = authTableSelectEvent.getSelectedItems();
                if (selected.length < 1) {
                    showMsg('请选择要删除的条目！');
                    return;
                }

                showConfirm.call(this, "确认删除吗？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/delPPPoEServerWhiteMAC', {
                        pppoeServerWhiteMacIndex: selected.join('\t')
                    }, function(res) {
                        showSaveMsg(_('删除成功！'), 1000);
                        authView.update();
                    });
                });
            },

            '#authContainer, click, .delete': function() {
                showConfirm.call(this, "确认删除吗？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/delPPPoEServerWhiteMAC', {
                        pppoeServerWhiteMacIndex: $(this).parents('tr').find(":checkbox").attr("tindex")
                    }, function() {
                        showSaveMsg(_('删除成功！'), 1000);
                        authView.update();
                    });
                });
            },
            //配置页面
            "#preAuthPage, click": function() {
                $("#preauth-modal-cfg-page").modal();
                preAuthCfgPageForm.update(G_data.preCfgData); 
            },
            
            "#setAuthPage, click": function() {
                $("#timeout-modal-cfg-page").modal();
                authCfgPageForm.update(G_data.cfgData); 
            }
        }
    });
    /****************  主体 over *************************/

    /********  弹出， 编辑不需要认证的主机View **********/
    var authEditForm = new R.FormView('#auth-modal-edit form', {
        beforeSubmit: function() {
            //判断mac地址时候已经存在
            var rules = G_data.authData.pppoeWhiteUser,
                existed = false,
                submitData;

            $.each(rules, function(i, rule) {
                if (i != authEditForm.originData.pppoeServerWhiteMacIndex &&
                    rule.pppoeWhiteMac == $("input[name=pppoeWhiteMac]").val().toUpperCase()) {
                    existed = true; 
                    return false;
                }
            });

            if (existed) {
                showMsg(_("设置的MAC地址已经存在！"));
                return false;
            }
            showSaveMsg(_("请稍候..."));
            return true;
        },

        afterSubmit: function(res) {
            authView.update();
            showSaveMsg(_("保存成功"), 1000);
            $('#auth-modal-edit').modal('hide');
        }
    });
    /********  弹出， 编辑不需要认证的主机View*******/

    /***********  弹出， 编辑流控策略View ***********/
    var qosEditForm = new R.FormView('#qos-modal-edit form', {
        beforeSubmit: function() {
            //判断策略名称是否已经存在
            var rules = G_data.authData.pppoeUserQosRules,
                existed = false,
                submitData;

            $.each(rules, function(i, rule) {
                if (i != qosEditForm.originData.userQosRuleIndex &&
                    rule.userQosRuleName == $("input[name=userQosRuleName]").val()) {
                    existed = true; 
                    return false;
                }
            });

            if (existed) {
                showMsg(_("设置的策略名称已经存在！"));
                return false;
            }
            showSaveMsg(_("请稍候..."));
            return true;
        },

        afterSubmit: function(res) {
            authView.update();
            showSaveMsg(_("保存成功"), 1000);
            $('#qos-modal-edit').modal('hide');
        }
    });

    /**********  弹出， 编辑流控策略View********/


    /****************  弹出，添加view ****************/
    var authAddForm = new R.FormView('#auth-modal-add form', {

        beforeSubmit: function() {
            var invalid = false,
                rules = G_data.authData.pppoeWhiteUser,
                macs = [];

            //逐条判断添加的规则MAC地址是否已经存在，添加条目中是否有重复
            $("#authAddTable [name=authAddUser]").each(function() {
                var macAddr = this.value.toUpperCase();
                for (var i = rules.length - 1; i >= 0; i--) {

                    if (rules[i].pppoeWhiteMac == macAddr) {
                        showMsg(_("设置的MAC地址已经存在！"));
                        invalid = true;
                        this.focus();
                        return false;
                    }
                };

                if ($.inArray(macAddr, macs) >= 0) {
                    showMsg(_("MAC地址不能重复！"));
                    invalid = true;
                    this.focus();
                    return false;
                }
                macs.push(macAddr);
            });

            if (invalid) {
                return false;
            }

            var data = $('#authAddTable>tr').map(function() {

                var date = (new Date);
                return ($(this).find('input').map(function() {
                    return this.value;
                }).get().join('\t'));

            }).get().join('\n');

            
            showSaveMsg(_("请稍候..."));
            return "pppoeServerWhiteMACInfo=" + encodeURIComponent(data);
        },

        afterSubmit: function(res) {
            authView.update();
            showSaveMsg(_("保存成功"), 1000);
            $('#auth-modal-add').modal('hide');
        },  

        events: {
            "#auth-modal-add, hidden.bs.modal": function() {
                $("#authAddTable").html(authAddRowHTML);
                $("#authAddTable tr").find('.validatebox').addCheck();
            },

            //每一条后面的添加按钮
            "#authAddTable, click, .btn-add": function(e) {
                e.preventDefault();
                if ($("#authAddTable tr").length >= R.CONST.CONFIG_PPPOE_WHITE_MAC_ADD_NUMBER) {
                    showMsg(_('每次最多添加%s条', [R.CONST.CONFIG_PPPOE_WHITE_MAC_ADD_NUMBER]));
                } else if ($("#authAddTable tr").length + G_data.authData.pppoeWhiteUser.length >= R.CONST.CONFIG_PPPOE_WHITE_MAC_NUMBER) {
                    showMsg(_('不需要认证的主机最多只能添加%s条', [R.CONST.CONFIG_PPPOE_WHITE_MAC_NUMBER]));
                } else {
                    var $newRow = $(authAddRowHTML).clone();
                    $("#authAddTable").append($newRow);
                    $newRow.find('.validatebox').addCheck();
                }
            },

            //每一条后面的删除按钮
            "#authAddTable, click, .btn-remove": function(e) {
                e.preventDefault();
                $(this).parents("tr").remove();
                if ($("#authAddTable tr").length == 0) {
                    $('#auth-modal-add').modal('hide');
                }
            }
        }
    });
    /****************  弹出，添加view over*********************/



    /****************  弹出， 过期前配置页面View *******************/
    var preAuthCfgPageForm = new R.FormView('#preauth-modal-cfg-page form', {
        submitUrl: "/w20e/goform/setPreTimeoutNotify",

        updateCallback: function() {
            setTimeout(function() {
                $("#precharCountTip").html($("#preTimeoutContent").val().length + "/" + 256);
            }, 20);
        },

        afterSubmit: function(res) {
            getPreCfgPageData();
            showMsg('保存成功！');
            $('#preauth-modal-cfg-page').modal('hide');
        },
        events: {        
            "#preauth-modal-cfg-page, hidden.bs.modal": function() {
                preAuthCfgPageForm.update(G_data.preCfgData);
            },
            "#auth-cfg-page-save, click": function() {
                preAuthCfgPageForm.submit();
            },
            "#preTimeoutContent, keyup": function() {
                while(this.value.length > 256) {
                    this.value = this.value.substr(0, 256);
                }
                $("#precharCountTip").html(this.value.length + "/" + 256);
            }
        }
    });

    function getPreCfgPageData() {
        $.GetSetData.getDataSync('/w20e/goform/getPreTimeoutNotify', function(res) {
            G_data.preCfgData = $.parseJSON(res);
        });        
    }
    getPreCfgPageData();
    
    /****************  弹出， 过期前配置页面View over*******************/

    /****************  弹出， 过期配置页面View *******************/
    var authCfgPageForm = new R.FormView('#timeout-modal-cfg-page form', {
        submitUrl: "/w20e/goform/setTimeoutNotify",

        updateCallback: function() {
            setTimeout(function() {
                $("#charCountTip").html($("#timeoutContent").val().length + "/" + 256);
            }, 20);
        },

        afterSubmit: function(res) {
            getCfgPageData();
            showMsg('保存成功！');
            $('#timeout-modal-cfg-page').modal('hide');
        },
        events: {        
            "#timeout-modal-cfg-page, hidden.bs.modal": function() {
                authCfgPageForm.update(G_data.cfgData);
            },
            "#timeout-cfg-page-save, click": function() {
                authCfgPageForm.submit();
            },
            "#timeoutContent, keyup": function() {
                while(this.value.length > 256) {
                    this.value = this.value.substr(0, 256);
                }
                $("#charCountTip").html(this.value.length + "/" + 256);
            }
        }
    });

    function getCfgPageData() {
        $.GetSetData.getDataSync('/w20e/goform/getTimeoutNotify', function(res) {
            G_data.cfgData = $.parseJSON(res);
        });        
    }
    getCfgPageData();
    /****************  弹出， 过期配置页面View over *******************/

});
