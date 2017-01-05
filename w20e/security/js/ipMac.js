$(function() {
    var G_data = {};
    var G_editindex = -1;

    function handlerBindUpdate(data) {
        var index;
        G_data = data;

        if(data.ipMacBindEn === false){
            $('#formContainer').addClass('none');
        }

        data.ipMacBindList = new TableData(data.ipMacBindList, ['checkbox','<div class="operate"><span class="edit"></span><span class="delete"></span></div>']).get();
        data.ipMacAutoBindList = new TableData(data.ipMacAutoBindList, ['checkbox','<a style="text-decoration:underline;color:#09F" class="bind">绑定</a>']).get();

        return data;
    }
    
    var bindListTableSelect = new TableSelectEvent($("#bindListForm")).init();
    var autoBindTableSelect = new TableSelectEvent($("#autoBindForm")).init();
    /*********************************** container view ****************************************/
    var ipMacView = new R.View("#ipMacContainer", {
        fetchUrl: '/w20e/goform/getIpMacBind',
        submitUrl: '/w20e/goform/setIPMacBind',
        updateCallback: handlerBindUpdate,
        beforeSubmit:function(res) {
            var data = {};
            data.ipMacBindEn = res.ipMacBindEn;
            showSaveMsg(_("请稍候..."));
            return data;
        },
        afterSubmit:function() {
            showSaveMsg(_("保存成功！"), 1000);
        },
        events:{
            //add
            '#addMacPolicy,click':function() {
                var len = G_data.ipMacBindList.length;
                if(len < R.CONST.CONFIG_BIND_IPMAC_NUMBER){
                    $('#ipmac-modal').modal();
                    addModalCheck();
                    new AutoFill('#ipmac-modal', {IPMacBindIndex: G_data.ipMacBindList.length});
                    $('#ipmac-modal form')[0].reset();
                }else{
                    showMsg(_('提示：不能添加超过%s条绑定！', [R.CONST.CONFIG_BIND_IPMAC_NUMBER]));
                }
                
                ipMacAddView.reset();
            },

            //save
            '#saveBtn ,click':function() {
                ipMacView.submit();
            },

            //edit
            '#ipMacContainer, click, .edit': function() {
                $('#ipmac-edit-modal').modal();
                var currentIndex = $(this).parents('tr').find('[tindex]').attr('tindex');
                G_editindex = parseInt(currentIndex);
                var data = G_data.ipMacBindList[G_editindex];
                
                //将原有数据显示在模态框上
                var transData={};
                transData.IPMacBindRuleIp = data.ipMacBindIP;
                transData.IPMacBindRuleMac = data.ipMacBindMac;
                transData.IPMacBindRuleRemark = data.ipMacBindingRemark;
                transData.IPMacBindRuleId = G_editindex;
                ipMacEditView.update(transData);
            },

            //delete single
            '#bindListForm, click, .delete': function() {
                showSaveMsg(_("请稍候..."));
                var index = $(this).parents('tr').find('[tindex]').attr('tindex');

                $.GetSetData.setData('/w20e/goform/delIpMacBind',{IPMacBindIndex: index},function(res) {
                    ipMacView.update(true);
                    showSaveMsg(_('解绑成功！'), 1000);
                });
            },

            //unbind selected
            '#delMacPolicy, click':function(){
                var selectArray = bindListTableSelect.getSelectedItems();
                if(selectArray.length < 1) {
                    showMsg(_("请选择要解绑的条目！"));
                    return ;
                }
                
                showSaveMsg(_("请稍候..."));
                $.GetSetData.setData('/w20e/goform/delIpMacBind', {
                    IPMacBindIndex:selectArray.join('\t')
                }, function(res) {
                    ipMacView.update(true);
                    showSaveMsg(_('解绑成功！'), 1000);
                });
                
            },

            '#addMacBind, click':function() {
                var invalid = 0;  // 0:valid  1:MAC冲突 2:IP冲突
                var IPs = [];
                var MACs = [];
                var selectArray = autoBindTableSelect.getSelectedItems();
                if(selectArray.length < 1) {
                    showMsg(_("请选择要绑定的条目！"));
                    return ;
                }

                if(($("#bindListForm table:eq(0)").data("tablepage").data.length + selectArray.length) > R.CONST.CONFIG_BIND_IPMAC_NUMBER) {
                    showMsg(_('总绑定数目最多为%s条', [R.CONST.CONFIG_BIND_IPMAC_NUMBER]));
                    return false;
                }

                for (var i = G_data.ipMacBindList.length - 1; i >= 0; i--) {
                     IPs.push(G_data.ipMacBindList[i].ipMacBindIP);
                     MACs.push(G_data.ipMacBindList[i].ipMacBindMac.toUpperCase());
                };

                var index = parseInt(G_data.ipMacBindList.length-1);
                var data = $('#autoBindForm tr:gt(0)').map(function(i) {
                    if($.inArray(parseInt(i),selectArray) !== -1) {
                        index += 1;
                        return index + '\t' +($(this).find('td').filter(function(index) {
                            return $("a", this).length == 0;
                            }).map(function() {
                                if($.inArray($(this).text().toUpperCase(), MACs) >= 0) {
                                    invalid = 1;
                                }
                                if($.inArray($(this).parents("tr").find("td:eq(1)").text(), IPs) >= 0) {
                                    invalid = 2;
                                }
                                return $(this).text();
                        }).get().join('\t'))+'\t'+" ";
                    }
                }).get().join('\n');

                if (invalid === 1) {
                    showMsg(_('与已绑定的MAC地址冲突！'));
                    return false;
                }
                if (invalid === 2) {
                    showMsg(_('与已绑定的IP地址冲突！'));
                    return false;
                }
                
                showSaveMsg(_("请稍候..."));
                $.GetSetData.setData('/w20e/goform/addIpMacBind',{IPMacBindRule:data}, function(res) {
                    ipMacView.update(true);
                    showSaveMsg(_('绑定成功！'), 1000);
                });
            },

            '#addAllMacBind, click':function() {
                var invalid = 0;  // 0:valid  1:MAC冲突 2:IP冲突
                var IPs = [];
                var MACs = [];

                if(($("#bindListForm table:eq(0)").data("tablepage").data.length + $("#autoBindForm tr").length - 1) > R.CONST.CONFIG_BIND_IPMAC_NUMBER) {
                    showMsg(_('总绑定数目最多为%s条', [R.CONST.CONFIG_BIND_IPMAC_NUMBER]));
                    return false;
                }

                for (var i = G_data.ipMacBindList.length - 1; i >= 0; i--) {
                     IPs.push(G_data.ipMacBindList[i].ipMacBindIP);
                     MACs.push(G_data.ipMacBindList[i].ipMacBindMac.toUpperCase());
                };

                var data = $('#autoBindForm tr:gt(0)').map(function(i) {
                    var index = parseInt(i)+parseInt(G_data.ipMacBindList.length);
                    return index + '\t' +($(this).find('td').filter(function(index) {
                                return $("a", this).length == 0;
                            }).map(function() {
                                if($.inArray($(this).text().toUpperCase(), MACs) >= 0) {
                                    invalid = 1;
                                }
                                if($.inArray($(this).parents("tr").find("td:eq(1)").text(), IPs) >= 0) {
                                    invalid = 2;
                                }
                                return $(this).text();   
                    }).get().join('\t'))+'\t'+" ";
                }).get().join('\n');

                if (invalid === 1) {
                    showMsg(_('与已绑定的MAC地址冲突！'));
                    return false;
                }
                if (invalid === 2) {
                    showMsg(_('与已绑定的IP地址冲突！'));
                    return false;
                }

                //Debug.log("adddata = "+data);
                showSaveMsg(_("请稍候..."));
                $.GetSetData.setData('/w20e/goform/addIpMacBind',{IPMacBindRule:data}, function(res) {
                    ipMacView.update(true);
                    showSaveMsg(_('绑定成功！'), 1000);
                });
            },

            '#autoBindForm, click, .bind':function() {
                var index = $(this).parents('tr').find('[tindex]').attr('tindex');
                var IPs = [];
                var MACs = [];
                for (var i = G_data.ipMacBindList.length - 1; i >= 0; i--) {
                     IPs.push(G_data.ipMacBindList[i].ipMacBindIP);
                     MACs.push(G_data.ipMacBindList[i].ipMacBindMac.toUpperCase());
                };

                if($("#bindListForm table:eq(0)").data("tablepage").data.length >= R.CONST.CONFIG_BIND_IPMAC_NUMBER) {
                    showMsg(_('总绑定数目最多为%s条', [R.CONST.CONFIG_BIND_IPMAC_NUMBER]));
                    return false;
                }

                if ($.inArray(G_data.ipMacAutoBindList[index].ipMacAutoBindMac.toUpperCase(), MACs) >= 0) {
                    showMsg(_('与已绑定的MAC地址冲突！'));
                    return false;
                }
                if ($.inArray(G_data.ipMacAutoBindList[index].ipMacAutoBindIP, IPs) >= 0) {
                    showMsg(_('与已绑定的IP地址冲突！'));
                    return false;
                }

                singleBindData = G_data.ipMacAutoBindList.length + '\t' + G_data.ipMacAutoBindList[index].ipMacAutoBindIP + '\t' + G_data.ipMacAutoBindList[index].ipMacAutoBindMac;
               
                showSaveMsg(_("请稍候..."));
                $.GetSetData.setData('/w20e/goform/addIpMacBind',{IPMacBindRule:singleBindData}, function(res) {
                    ipMacView.update(true);
                    showSaveMsg(_('绑定成功！'), 1000);
                });
            },

            '#ipMacSwitch, click, input': function() {
                if (this.value === 'true') {
                    $('#formContainer').slideDown(200);
                } else if (this.value === 'false') {
                    $('#formContainer').slideUp(200);
                }
                top.ResetHeight.resetHeight(200);
            },

            '#cancelBtn, click': function() {
                ipMacView.update();
            }
        }
    });
    /************************************ container view end *************************************/
 

    /***************************************** add view *****************************************/
    var ipMacAddRowHTML = $("#ipMacAddTable tr")[0].outerHTML;
    var ipMacAddView = new R.FormView('#ipmac-modal form',{
        events:{
            "#ipmac-modal, hidden.bs.modal": function() {
                $("#ipMacAddTable").html(ipMacAddRowHTML);
            },
            //每一条后面的添加按钮
            "#ipMacAddTable, click, .btn-add": function(e) {
                e.preventDefault();
                if ($("#ipMacAddTable tr").length >= 5) {
                    showMsg("每次最多添加5条");
                } else if ($("#ipMacAddTable tr").length + $("#bindListForm table:eq(0)").data("tablepage").data.length >= R.CONST.CONFIG_BIND_IPMAC_NUMBER) {
                    showMsg(_('总绑定数目最多为%s条', [R.CONST.CONFIG_BIND_IPMAC_NUMBER]));
                } else {
                    $("#ipMacAddTable").append($(ipMacAddRowHTML).clone());
                    addModalCheck();
                }
            },

            //每一条后面的删除按钮
            "#ipMacAddTable, click, .btn-remove": function(e) {
                e.preventDefault();
                $(this).parents("tr").remove();
                if ($("#ipMacAddTable tr").length == 0) {
                    $('#ipmac-modal').modal('hide');
                }
            }
        }
    });


    $("[name=IPMacBindRuleIp]").addCheck([{"type":"ip"},{
            "type": "netSegmentCheck"
            }]);
    //判断输入IP地址与lanIP是否在同一个网段
    $.valid.netSegmentCheck = {
        all: function(inputIP) {
        var res1 = [],
            res2 = [];
        
        var lanIP = G_data.lanIP;
        var mask = G_data.lanMask;
        inputIP = inputIP.split(".");
        lanIP = lanIP.split(".");
        mask  = mask.split(".");
        for(var i = 0,ilen = inputIP.length; i < ilen ; i += 1){
            res1.push(parseInt(inputIP[i]) & parseInt(mask[i]));
            res2.push(parseInt(lanIP[i]) & parseInt(mask[i]));
        }
        if((res1.length !== 4) || (res2.length !== 4))
        {
            //necessary.传递给type ip验证
        }else if(res1.join(".") !== res2.join(".")){
            return "与LAN口IP不在同一个网段";
        }
    }};

    function addModalCheck() {
        $("[name=ipMacBindIP]").each(function() {
            $(this).addCheck([{"type":"ip"},{
            "type": "netSegmentCheck"
            }]);
        });

        $("[name=ipMacBindMac]").each(function() {
            $(this).addCheck({"type":"mac"});
        });

        $("[name=ipMacBindingRemark]").each(function() {
            $(this).addCheck([
                {
                    "type": "remarkTxt", 
                    "args": [1,16]
                }]);
        });
    }

    ipMacAddView.beforeSubmit = function(data) {
        var invalid = false, 
            IPs = [],
            MACs = [];

        //逐条判断添加的规则IP和MAC是否已经存在, 是否表中有数据重复
        $(".add-tbody [name=ipMacBindMac]").each(function() {
            if (invalid) { 
                return false;
            }

            var mac = this.value.toUpperCase();
            var ip = $(this).parents('tr').find("input:eq(0)").val();

            if ($.inArray(ip, IPs) >= 0) {
                invalid = true;
                $(this).parents('tr').find("input:eq(0)").focus();
                showMsg(_("IP地址不能重复绑定！"));
                return false;              
            }
            if ($.inArray(mac, MACs) >= 0) {
                invalid = true;
                this.focus();
                showMsg(_("MAC地址不能重复绑定！"));
                return false;              
            }

            for (var i = G_data.ipMacBindList.length - 1; i >= 0; i--) {
                if (G_data.ipMacBindList[i].ipMacBindMac.toUpperCase() === mac) {
                    invalid = true;
                    this.focus();
                    showMsg(_("此MAC地址已绑定！"));
                    return false;
                }
                if(ip === G_data.ipMacBindList[i].ipMacBindIP) {
                    invalid = true;
                    $(this).parents('tr').find("input:eq(0)").focus();
                    showMsg(_("此IP地址已绑定！"));
                    return false;
                }
            };
            
            MACs.push(mac);
            IPs.push(ip);
        });

        if (invalid) {
            return false;
        }

        var data = $('.add-tbody>tr').map(function(i) {
            var index = parseInt(i)+parseInt(data.IPMacBindIndex);
            return index + '\t' +($(this).find('input').map(function(index2) {
                return this.value;
            }).get().join('\t'));

        }).get().join('\n');

        showSaveMsg(_('请稍候...'));

        return "IPMacBindRule=" + encodeURIComponent(data);
    };

    ipMacAddView.afterSubmit = function(res) {
        $('#ipmac-modal').modal("hide");
        showSaveMsg(_("保存成功！"), 1000);
        ipMacView.update(true);
    };
    /***************************************** add view end **************************************/


    /***************************************** edit view **************************************/

    var ipMacEditView = new R.FormView('#ipmac-edit-modal form');
    ipMacEditView.beforeSubmit = function(data) {

        //逐条判断添加的规则MAC是否已经存在, 是否表中有数据重复
        var mac = $("[name=IPMacBindRuleMac]").val().toUpperCase();
        var ip = $("[name=IPMacBindRuleIp]").val();
        for (var i = G_data.ipMacBindList.length - 1; i >= 0; i--) {
            if (((G_data.ipMacBindList[i].ipMacBindMac.toUpperCase() === mac) || (G_data.ipMacBindList[i].ipMacBindIP === ip)) && (G_editindex !== i)) {
                showMsg(_("修改与其它已绑定项冲突！"));
                return false;
            }
        };

        showSaveMsg(_('请稍候...'));
        return data;
    };
    ipMacEditView.afterSubmit = function(res) {
        $('#ipmac-edit-modal').modal("hide");
        G_editindex = -1;
        showSaveMsg(_('保存成功！'), 1000);
        ipMacView.update(true);
    };


    $("[name=IPMacBindRuleRemark]").addCheck([
        {
            "type": "remarkTxt", 
            "args": [1,16]
        }
    ]);
    /***************************************** edit view end **********************************/


});
