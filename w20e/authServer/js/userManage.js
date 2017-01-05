
var addRowHTML = $(".add-tbody tr")[0].outerHTML;
$(function() {

    var G_data = {},
        ws = "#userArea",//最外包裹着表，编辑框，添加框的包裹元素选择器
        $ws = $(ws),
        filterStr = "";//过滤字符串

    /****************  列表  *************************/
    var authTableSelectEvent = new TableSelectEvent($("#userlistWrap")).init();

    //处理基本数据，组成表格需要的数据形式
    function handleAuthData(data) {
        var userInfo =  [],
            ruleData = {},
            rule;


        for (var i = 0; i < data.length; i++) {

            G_data.list[i].webAuthEn = G_data.list[i].getWebAuthUserEn;
            ruleData = data[i];

            rule = {};
            rule.checkbox = '<input type="checkbox" tindex="' + i + '" name="webAuthUserID" value="' + ruleData.webAuthUserID + '">';

            rule.webAuthUser = ruleData.webAuthUser;
            rule.webAuthUserPwd = ruleData.webAuthUserPwd;
            rule.webAuthUserRemark = ruleData.webAuthUserRemark;
            rule.getWebAuthUserEn = ruleData.getWebAuthUserEn == true ? _("已启用"): _("已禁用");
            rule.operate = '<div class="operate">'+
                            (ruleData.getWebAuthUserEn == true?
                            '<span class="disable" title="禁用"></span>':
                            '<span class="enable" title="启用"></span>')+
                            '<span class="edit"></span><span class="delete"></span></div>';
            userInfo.push(rule);
        };

        return {authList: userInfo};
    }

    //过滤数据
    function filterData(data, filterStr) {
        if (!filterStr) return data;

    	var dataList = data.authList,
        	filterDataList = [],
            rowObj = null;
        
        for (var i = 0; i < dataList.length; i++) {

            if ((dataList[i].webAuthUser + dataList[i].webAuthUserPwd + dataList[i].webAuthUserRemark + dataList[i].getWebAuthUserEn).indexOf(filterStr) != -1) {
                rowObj = $.extend(true, {}, dataList[i]);

                rowObj.webAuthUser = rowObj.webAuthUser.replace(filterStr, '<span class="text-danger">'+ filterStr +'</span>');
                rowObj.webAuthUserPwd = rowObj.webAuthUserPwd.replace(filterStr, '<span class="text-danger">'+ filterStr +'</span>');
                rowObj.webAuthUserRemark = rowObj.webAuthUserRemark.replace(filterStr, '<span class="text-danger">'+ filterStr +'</span>');
                rowObj.getWebAuthUserEn = rowObj.getWebAuthUserEn.replace(filterStr, '<span class="text-danger">'+ filterStr +'</span>');


                filterDataList.push(rowObj);
            }

        };

        return {authList: filterDataList};
    }



    var mainView = new R.View($ws, {
        fetchUrl: '/w20e/goform/getWebAuthUser',
        submitUrl: '/w20e/goform/setWebAuthUser',
        updateCallback: function(data) {
            G_data.list = data;

            return filterData(handleAuthData(data), $("#searchTxt").val());
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
                    $.GetSetData.setData('/w20e/goform/delWebAuthUser', {

                        WebAuthUserID: $.map(selected, function(selectedIndex) {
                            return G_data.list[selectedIndex].webAuthUserID;
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
                    $.GetSetData.setData('/w20e/goform/delWebAuthUser', {
                        WebAuthUserID: $(this).parents('tr').find("[name=webAuthUserID]").val()
                    }, function() {
                        showSaveMsg(_("删除成功"), 1000);
                        mainView.update();
                    });
                });                    
            }

            //禁用
            et[ws + ', click, .enable'] =  function() {
                var that = this,
                    index = $(this).parents('tr').find(":checkbox").attr("tindex");

                $.GetSetData.setData('/w20e/goform/switchWebAuthUser', {
                    WebAuthUserID: $(this).parents('tr').find("[name=webAuthUserID]").val(),
                    WebAuthEn: "true"
                }, function() {
                    that.className = "disable";
                    that.title = _("已启用");
                    $(that).parents("td").prev().html(_("已启用"));
                    G_data.list[index].webAuthEn = true;
                });
            };

            //禁用
            et[ws + ', click, .disable'] = function() {
                var that = this,
                    index = $(this).parents('tr').find(":checkbox").attr("tindex");

                $.GetSetData.setData('/w20e/goform/switchWebAuthUser', {
                    WebAuthUserID: $(this).parents('tr').find("[name=webAuthUserID]").val(),
                    WebAuthEn: "false"
                }, function() {
                    that.className = "enable";
                    that.title = _("已禁用");
                    $(that).parents("td").prev().html(_("已禁用"));
                    G_data.list[index].webAuthEn = false;
                });
            };

            //修改
            et[ws + ', click, .edit'] = function() {
                $ws.find('.modal-edit').modal().find('.modal-header>span').text(_('编辑用户'));
                var index = $(this).parents('tr').find(":checkbox").attr("tindex");
                var data = G_data.list[index];

                editForm.update(data);
            };

            //增加
            et[ws + ' .add-rule, click'] = function() {
                if (G_data.list.length >= R.CONST.CONFIG_AUTH_USER_NUMBER) {
                    showMsg(_('用户个数已达到上限 %s 个', [R.CONST.CONFIG_AUTH_USER_NUMBER]));
                    return;
                }
                $ws.find('.modal-add').modal().find('.modal-header>span').text('新增用户');
                addForm.reset();
            };

            function search() {

                mainView.defaults.originData = filterData(handleAuthData(G_data.list), $("#searchTxt").val());
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

            return et;
        })()
    });
    /****************  列表 over *************************/



    /****************  弹出， 编辑View *******************/
    var editForm = new R.FormView(ws + ' .modal-edit form', {
        beforeSubmit: function() {
            //判断mac地址时候已经存在
            var rules = G_data.list,
                existed = false,
                submitData;

            $.each(rules, function(i, rule) {
                if (rule.webAuthUserID != editForm.originData.webAuthUserID &&
                    rule.webAuthUser == $("input[name=webAuthUser]").val()) {
                    existed = true; 
                    return false;
                }
            });

            if (existed) {
                showMsg(_("该用户名已经存在！"));
                return false;
            }
            showSaveMsg(_("请稍候..."));
            return true;
        },

        afterSubmit: function(res) {
            mainView.update();
            showSaveMsg(_("保存成功"), 1000);
            $ws.find('.modal-edit').modal('hide');
        }
    });

    /****************  弹出， 编辑View over*******************/


    /****************  弹出，添加view *********************/
    var addForm = new R.FormView(ws + ' .modal-add form', {

        beforeSubmit: function() {
            var invalid = false,
                rules = G_data.list,
                usernames = [];

            //逐条判断添加的规则用户名是否已经存在, 是否表中有数据重复
            $ws.find(".add-tbody [name=username]").each(function() {
                if (invalid) { return false; }

                var that = this;
                for (var i = rules.length - 1; i >= 0; i--) {
                    if (rules[i].webAuthUser == this.value) {
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
                var ruleID = (date.getSeconds() + 10) + (Math.random()+"").substr(2, 4);

                return (ruleID + "\t" + $(this).find('input, select').map(function() {
                    return this.value;
                }).get().join('\t'));

            }).get().join('\n');

            showSaveMsg(_("请稍候..."));
            return "webAuthUserInfo=" + data;
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
                if ($ws.find(".add-tbody tr").length >= R.CONST.CONFIG_AUTH_USER_ADD_NUMBER) {
                    showMsg(_('每次最多添加%s条', [R.CONST.CONFIG_AUTH_USER_ADD_NUMBER]));
                } else if ($ws.find(".add-tbody tr").length + G_data.list.length >= R.CONST.CONFIG_AUTH_USER_NUMBER) {
                    showMsg(_('用户个数已达到上限 %s 个', [R.CONST.CONFIG_AUTH_USER_NUMBER]));
                } else {
                	var $newRow = $(addRowHTML);
                    $ws.find(".add-tbody").append($newRow);
                    $newRow.find("[placeholder]").addPlaceholder();
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