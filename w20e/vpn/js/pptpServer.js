$(function() {

    /*因为网段不能和lan同一网段，所以先获取lanip用于保存时的比较*/
    var lanIp,
        lanMask;

    $('[name="vpnServerWAN"]').parent().hide();
    if(top.WAN_NUMBER) {
        $('[name="vpnServerWAN"]:lt('+top.WAN_NUMBER+')').parent().show();
    }

    $.GetSetData.getJson("/w20e/goform/getLanIpMask", function(data) {
        lanIp = data.lanIP;
        lanMask = data.lanMask;
    });

	var mainview = new R.View("form:eq(0)", {
		fetchUrl: "/w20e/goform/getVpnServer",
		submitUrl: "/w20e/goform/setVpnServer",
		updateCallback: function(data) {
			//data.vpnServerAddrPool = "10.0.0.1",
			//data.vpnServerMaxConnections = R.CONST.CONFIG_VPN_CONNECT_NUMBE;
			return data;
		},
        afterUpdate: function() {
            initView(0); 
        },
		beforeSubmit: function() {
			showSaveMsg(_("请稍候...")); 
		},
		afterSubmit: function(res) {
			showSaveMsg(_("保存成功"), 1000);
			mainview.update();
		},
		events: {
			"#vpnSave, click": function() {
				mainview.submit();
			},
			"#vpnCancel, click": function() {
				mainview.initElements();
			},
            "[name=vpnServerType], click": function() { initView();},
            "[name=vpnServerEn], click": function() { initView();}
		}
	});



    function initView(slide) {
        var slide = typeof slide == "undefined" ? 200 : slide;

        if ($("[name=vpnServerEn]:checked").val() == "false") {
            $("#vpnServerEnWrap").slideUp(slide);
        } else {
            $("#vpnServerEnWrap").slideDown(slide);
        }


        if ($("[name=vpnServerType]:checked").val() == "l2tp") {
            $("#encryptWrap").slideUp(slide);
        } else {
            $("#encryptWrap").slideDown(slide);
        }
        top.ResetHeight.resetHeight(slide);
    }



    //处理基本数据，组成表格需要的数据形式
    function handleData(data) {
        var userInfo =  [],
            ruleData = {},
            rule;


        for (var i = 0; i < data.length; i++) {
        	G_data.list[i].vpnUserIndex = i;
            ruleData = data[i];

            rule = {};
            rule.checkbox = '<input type="checkbox" tindex="' + i + '">';

            rule.vpnUserName = ruleData.vpnUserName;
            rule.vpnUserPwd = ruleData.vpnUserPwd;
            rule.vpnUserType = ruleData.vpnUserType == true?"是":"否";
            rule.vpnUserNetAddr = ruleData.vpnUserNetAddr;
            rule.vpnUserNetMask = ruleData.vpnUserNetMask;
            rule.vpnUserRemark = ruleData.vpnUserRemark;
            rule.operate = '<div class="operate"><span class="edit"></span><span class="delete"></span></div>';
            userInfo.push(rule);
        };

        return {userList: userInfo};
    }


    var G_data = {},
    	ws = "#pageWrap",
    	$ws = $(ws),
    	authTableSelectEvent = new TableSelectEvent($("#userlistWrap")).init(),
    	mainView = new R.View($ws, {
        fetchUrl: '/w20e/goform/getVpnUserList',
        updateCallback: function(data) {
            G_data.list = data;

            return handleData(data);
        },
        events: (function() {
            var et = {};
            //删除
            et[ws + ' .del-rule, click'] = function() {
                var selected = authTableSelectEvent.getSelectedItems();
                if (selected.length < 1) {
                    showMsg('请选择要删除的条目！');
                    return;
                }

                showConfirm.call(this, "确认删除吗？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/delVpnUsers', {

                        vpnUserIndex: $.map(selected, function(selectedIndex) {
                            return G_data.list[selectedIndex].vpnUserIndex;
                        }).join('\t')

                    }, function(res) {
                        showSaveMsg(_("删除成功"), 1000);
                        mainView.update();
                    });
                });
            };

            et[ws + ', click, .delete'] = function() {
                showConfirm.call(this, "确认删除吗？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/delVpnUsers', {
                        vpnUserIndex: $(this).parents('tr').find(":checkbox").attr("tindex")
                    }, function() {
                        showSaveMsg(_("删除成功"), 1000);
                        mainView.update();
                    });
                });
            }

            //修改
            et[ws + ', click, .edit'] = function() {
                $ws.find('.modal-edit').modal().find('.modal-header>span').text(_('编辑用户'));
                var index = $(this).parents('tr').find(":checkbox").attr("tindex");
                var data = G_data.list[index];
                data.vpnUserIndex = index;
                editForm.update(data);
            };

            //增加
            et[ws + ' .add-rule, click'] = function() {
                if (G_data.list.length >= R.CONST.CONFIG_VPN_SERVER_USER_NUMBER) {
                    showMsg(_('用户个数已达到上限 %s 个', [R.CONST.CONFIG_VPN_SERVER_USER_NUMBER]));
                    return;
                }
                $ws.find('.modal-edit').modal().find('.modal-header>span').text('新增用户');
                editForm.update({});
                editForm.reset();
            };

            return et;
        })()
    });
    /****************  列表 over *************************/



    /****************  弹出， 编辑View *******************/
    var editForm = new R.FormView(ws + ' .modal-edit form', {

        updateCallback: function() {
            setTimeout(function() {
                editForm.initView(0);
            },0);
        },
        beforeSubmit: function() {
            //判断mac地址时候已经存在
            var rules = G_data.list,
                valid = true,
                submitData,
                vUserType = $(ws + " .modal-edit form input[name=vpnUserType]:checked").val(),
                vUsername = $(ws + " .modal-edit form input[name=vpnUserName]").val(),
                vNet = $(ws + " .modal-edit form input[name=vpnUserNetAddr]").val(),
                vMask = $(ws + " .modal-edit form input[name=vpnUserNetMask]").val();

            //lan 同网段判断
            if (vUserType == "true" && R.Valid.isSameNet(lanIp,vNet,lanMask,vMask)) {
                showMsg(_("网段不能和LAN口网段相同！"));
                return (valid = false); 
            }
            
            if (valid) {
                $.each(rules, function(i, rule) {
                    if (rule.vpnUserIndex != editForm.originData.vpnUserIndex && 
                        rule.vpnUserName == vUsername) {
                        showMsg(_("该用户名已经存在！"));
                        return (valid = false); 
                    }

                    //比较已存在规则的网段
                    if (vUserType == "true" && rule.vpnUserIndex != editForm.originData.vpnUserIndex && 
                        R.Valid.isSameNet(rule.vpnUserNetAddr,vNet,rule.vpnUserNetMask,vMask)) {
                        showMsg(_("设置的网段已经存在"));
                        return (valid = false); 
                    }                
                });                
            }


            if (!valid) {
                return false;
            }

            showSaveMsg(_("请稍候..."));
            if (typeof editForm.originData.vpnUserIndex == "undefined") {
                //增加
                var addDataStr = "vpnUsers=",
                    addData = [];
                //vpnUsers=user1\t123\ttrue\t192.168.1.0\t255.255.255.0\t广州公司\nuser2\t123\tfalse\t广州公司
                addData.push($("[name=vpnUserName]").val());
                addData.push($("[name=vpnUserPwd]").val());
                addData.push($("[name=vpnUserType]:checked").val());
                if ($("[name=vpnUserType]:checked").val() == "true") {
                    addData.push($("[name=vpnUserNetAddr]").val());
                    addData.push($("[name=vpnUserNetMask]").val());                    
                } else {
                    addData.push("");        
                    addData.push("");        
                }
                addData.push($("[name=vpnUserRemark]").val());
                addDataStr += addData.join("\t");
                $.GetSetData.setData("/w20e/goform/addVpnUsers", addDataStr, function() {
                    mainView.update();
                    showSaveMsg(_("保存成功"), 1000);
                    $ws.find('.modal-edit').modal('hide');
                });
                return false;
            } else {
                //修改
                return true;
            }
        },

        afterSubmit: function(res) {
            mainView.update();
            showSaveMsg(_("保存成功"), 1000);
            $ws.find('.modal-edit').modal('hide');
        },

        events: {
            "[name=vpnUserType], click": function() {
                editForm.initView();
            }
        }
    });

    editForm.initView = function(slide) {
        var slide = typeof slide == "undefined" ? 200 : slide;
        if ($("[name=vpnUserType]:checked").val() == "true") {
            $("#segmentWrap").slideDown(slide);
        } else {
            $("#segmentWrap").slideUp(slide);
        }
        top.ResetHeight.resetHeight(slide);
    }

    /****************  弹出， 编辑View over*******************/


    /****************  弹出，添加view *********************
    var addRowHTML = $ws.find(".add-tbody tr")[0].outerHTML;
    var addForm = new R.FormView(ws + ' .modal-add form', {

        beforeSubmit: function() {
            var invalid = false,
                rules = G_data.list,
                usernames = [];

            //逐条判断添加的规则用户名是否已经存在, 是否表中有数据重复
            $ws.find(".add-tbody [name=vpnUserName]").each(function() {
                if (invalid) { return false; }

                var that = this;
                for (var i = rules.length - 1; i >= 0; i--) {
                    if (rules[i].vpnUserName == this.value) {
                        invalid = true;
                        this.focus();
                        showMsg(_("该用户名已经存在！"));
                        return false;
                    }
                };
                if ($.inArray(this.value, usernames) >= 0) {
                    invalid = true;
                    this.focus();
                    showMsg(_("用户名不能重复！"));
                    return false;              
                }


                usernames.push(this.value);
            });

            if (invalid) {
                return false;
            }

            var data = $('.add-tbody>tr').map(function() {
                var date = (new Date);

                return ($(this).find('input, select').map(function() {
                    return this.value;
                }).get().join('\t'));

            }).get().join('\n');

            showSaveMsg(_("请稍候..."));
            return "vpnUsers=" + data;
        },

        afterSubmit: function(res) {
            $("#searchTxt").val("");
            mainView.update();
            showSaveMsg(_("保存成功"), 1000);
            $ws.find('.modal-add').modal('hide');
        },  

        events: (function() {
            var et = {};

            et[ws + " .modal-add, hidden.bs.modal"] = function() {
                $ws.find(".add-tbody").html(addRowHTML);
                $ws.find(".add-tbody .validatebox").addCheck();
            };

            //每一条后面的添加按钮
            et[ws + " .add-tbody, click, .btn-add"] = function(e) {
                e.preventDefault();
                if ($ws.find(".add-tbody tr").length >= R.CONST.CONFIG_VPN_SERVER_USER_ADD_NUMBER) {
                    showMsg(_('每次最多添加%s条', [R.CONST.CONFIG_VPN_SERVER_USER_ADD_NUMBER]));
                } else if ($ws.find(".add-tbody tr").length + G_data.list.length >= R.CONST.CONFIG_VPN_SERVER_USER_NUMBER) {
                    showMsg(_('用户个数已达到上限 %s 个', [R.CONST.CONFIG_VPN_SERVER_USER_NUMBER]));
                } else {
                    $ws.find(".add-tbody").append($(addRowHTML));
                }
                $ws.find(".add-tbody .validatebox").addCheck();
            };

            //每一条后面的删除按钮
            et[ws + " .add-tbody, click, .btn-remove"] = function(e) {
                e.preventDefault();
                $(this).parents("tr").remove();
                if ($ws.find(".add-tbody tr").length == 0) {
                    $ws.find('.modal-add').modal('hide');
                }
            };

            return et;            
        })()
    });
    /****************  弹出，添加view over*********************/





});