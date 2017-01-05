var authAddRowHTML = $("#authAddTable tr")[0].outerHTML;
$(function() {

    var G_data = {};
    var G_cloudEn,
        G_pppoeEn,
        G_weiEn,
        G_authEn;

    /****************  主体  *************************/
    var authTableSelectEvent = new TableSelectEvent($('#authContainer')).init();

    //处理基本数据，组成表格需要的数据形式，原始数据保存在G_data.authData
    function handleAuthData(data) {
        var userInfo =  [],
            ruleData = {},
            rule;

        G_cloudEn = data.cloudManageEn;
        G_pppoeEn = data.pppoeServerEn;
        G_authEn = data.webAuthEn;
        G_weiEn = data.wewifiEn;

        for (var i = 0; i < data.webAuthWhiteUserInfo.length; i++) {


            ruleData = data.webAuthWhiteUserInfo[i];
            ruleData.webAuthWhiteUser = ruleData.webAuthWhiteUser.toUpperCase();

            rule = {};
            rule.checkbox = '<input type="checkbox" tindex="' + i + '" name="webAuthWhiteID" value="' + ruleData.webAuthWhiteID + '">';

            rule.webAuthWhiteUser = ruleData.webAuthWhiteUser;
            rule.webAuthWhiteUserNote = ruleData.webAuthWhiteUserNote
            rule.operate = '<div class="operate"><span class="edit"></span><span class="delete"></span></div>';
            userInfo.push(rule);
        };

        G_data.authData = $.extend(true, {}, data);

        data.webAuthWhiteUserInfo = userInfo;
        data.timeOutHour = Math.floor(data.webAuthAgingTime/60);
        data.timeOutMinute = data.webAuthAgingTime%60;

        return data;
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
        var submitData = {};
        showConfirm.call(this, msg, function() {
            submitData = new AutoCollect("#authContainer form:eq(0)").getJson();
            if((submitData.timeOutHour === "24") && (parseInt(submitData.timeOutMinute) > 0)) {
                showMsg("认证有效期不能超过24小时。");
                return;
            }
            if((submitData.timeOutHour === "0") && (submitData.timeOutMinute === "0")) {
                showMsg("认证有效期需大于0分钟。");
                return;
            }
            submitData.webAuthTimeOut = parseInt(submitData.timeOutHour)*60 + parseInt(submitData.timeOutMinute);
            delete submitData.timeOutMinute;
            delete submitData.timeOutHour;
            authView.submit('/w20e/goform/setWebAuthBasic', submitData, function() {
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
        fetchUrl: '/w20e/goform/getWebAuthBasic',
        updateCallback: handleAuthData,
        events: {
            '#addRules, click': function() {
                if (G_data.authData.webAuthWhiteUserInfo.length >= R.CONST.CONFIG_AUTH_RULE_NUMBER) {
                    showMsg(_('不需要认证的主机最多只能添加%s条', [R.CONST.CONFIG_AUTH_RULE_NUMBER]));
                    return;
                }

                $('#auth-modal-add').modal().find('.modal-header>span').text('新增不受限制主机');
                authAddForm.reset();
            },

            '#authContainer, click, .edit': function() {
                $('#auth-modal-edit').modal().find('.modal-header>span').text('编辑规则');
                var index = $(this).parents('tr').find(":checkbox").attr("tindex");
                var data = G_data.authData.webAuthWhiteUserInfo[index];

                authEditForm.update(data);
            },
            
            '#auth-save, click': function() {
                var submitStatus = $('[name="webAuthEn"]:checked').val();
                var submitData = {};
                if ((submitStatus=== "true") && ((G_cloudEn|G_pppoeEn|G_weiEn) === 1)) {
                    if(G_cloudEn === true) {
                        showConfirmMsg("WEB认证服务器开启后，云认证功能将会关闭，且系统将会重启，是否确认开启WEB认证服务器？", 1);
                    } else if(G_pppoeEn === true) {
                        showConfirmMsg("WEB认证服务器开启后，PPPOE认证服务器将会关闭，是否确认开启WEB认证服务器？", 0);
                    } else if(G_weiEn === true) {
                        showConfirmMsg("WEB认证服务器开启后，微信连WiFi功能将会关闭，是否确认开启WEB认证服务器？", 0);
                    }
                } else {
                    submitData = new AutoCollect("#authContainer form:eq(0)").getJson();
                    if((submitData.timeOutHour === "24") && (parseInt(submitData.timeOutMinute) > 0)) {
                        showMsg("认证有效期不能超过24小时。");
                        return;
                    }
                    if((submitData.timeOutHour === "0") && (submitData.timeOutMinute === "0")) {
                        showMsg("认证有效期需大于0分钟。");
                        return;
                    }
                    submitData.webAuthTimeOut = parseInt(submitData.timeOutHour)*60 + parseInt(submitData.timeOutMinute);
                    delete submitData.timeOutMinute;
                    delete submitData.timeOutHour;
                    authView.submit('/w20e/goform/setWebAuthBasic', submitData, function() {
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
                    $.GetSetData.setData('/w20e/goform/delWebAuthWhiteUser', {

                        webAuthWhiteUserIndex: $.map(selected, function(selectedIndex) {
                            return G_data.authData.webAuthWhiteUserInfo[selectedIndex].webAuthWhiteID;
                        }).join('\t')

                    }, function(res) {
                        showSaveMsg(_('删除成功！'), 1000);
                        authView.update();
                    });
                });
            },

            '#authContainer, click, .delete': function() {
                showConfirm.call(this, "确认删除吗？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/delWebAuthWhiteUser', {
                        webAuthWhiteUserIndex: $(this).parents('tr').find("[name=webAuthWhiteID]").val()
                    }, function() {
                        showSaveMsg(_('删除成功！'), 1000);
                        authView.update();
                    });
                });
            },
                        //配置页面
            "#setAuthPage, click": function() {

                $("#auth-modal-cfg-page").modal();
                authCfgPageForm.update(G_data.cfgData); 
            }
        }
    });
    /****************  主体 over *************************/



    /****************  弹出， 编辑View *******************/
    var authEditForm = new R.FormView('#auth-modal-edit form', {
        beforeSubmit: function() {
            //判断mac地址时候已经存在
            var rules = G_data.authData.webAuthWhiteUserInfo,
                existed = false,
                submitData;

            $.each(rules, function(i, rule) {
                if (rule.webAuthWhiteID != authEditForm.originData.webAuthWhiteID &&
                    rule.webAuthWhiteUser == $("input[name=webAuthWhiteUser]").val().toUpperCase()) {
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

    /****************  弹出， 编辑View over*******************/


    /****************  弹出，添加view *********************/
    var authAddForm = new R.FormView('#auth-modal-add form', {

        beforeSubmit: function() {
            var invalid = false,
                rules = G_data.authData.webAuthWhiteUserInfo,
                macs = [];

            //逐条判断添加的规则MAC地址是否已经存在，添加条目中是否有重复
            $("#authAddTable [name=authAddUser]").each(function() {
                var macAddr = this.value.toUpperCase();
                for (var i = rules.length - 1; i >= 0; i--) {

                    if (rules[i].webAuthWhiteUser == macAddr) {
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
                var ruleID = (date.getSeconds() + 10) + (Math.random()+"").substr(2, 4);

                ruleID++;
                return (ruleID + "\t" + $(this).find('input').map(function() {
                    return this.value;
                }).get().join('\t'));

            }).get().join('\n');

            
            showSaveMsg(_("请稍候..."));
            return "webAuthWhiteUserInfo=" + encodeURIComponent(data);
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
                if ($("#authAddTable tr").length >= R.CONST.CONFIG_AUTH_ADD_NUMBER) {
                    showMsg(_('每次最多添加%s条', [R.CONST.CONFIG_AUTH_ADD_NUMBER]));
                } else if ($("#authAddTable tr").length + G_data.authData.webAuthWhiteUserInfo.length >= R.CONST.CONFIG_AUTH_RULE_NUMBER) {
                    showMsg(_('不需要认证的主机最多只能添加%s条', [R.CONST.CONFIG_AUTH_RULE_NUMBER]));
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



    /****************  弹出， 配置页面View *******************/
    var authCfgPageForm = new R.FormView('#auth-modal-cfg-page form', {
        submitUrl: "/w20e/goform/setWebAuthAnnouncement",

        updateCallback: function() {
            setTimeout(function() {
                $("#charCountTip").html($("#webAuthContent").val().length + "/" + 256);
            }, 20);
        },

        afterSubmit: function(res) {
            getCfgPageData();
            showMsg('保存成功！');
            $('#auth-modal-cfg-page').modal('hide');
        },
        events: {        
            "#auth-modal-cfg-page, hidden.bs.modal": function() {
                authCfgPageForm.update(G_data.cfgData);
            },
            "#auth-cfg-page-save, click": function() {
                authCfgPageForm.submit();
            },
            "#webAuthContent, keyup": function() {
                while(this.value.length > 256) {
                    this.value = this.value.substr(0, 256);
                }
                $("#charCountTip").html(this.value.length + "/" + 256);
            }
        }
    });





    function getCfgPageData() {
        $.GetSetData.getDataSync('/w20e/goform/getWebAuthAnnouncement', function(res) {
            G_data.cfgData = $.parseJSON(res);
        });        
    }
    getCfgPageData();

    /****************  弹出， 配置页面View over*******************/

});
