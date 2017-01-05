var uploadUnit = (function() {

    var uploadFlag = false;
    return {
        uploadFile: function(id, url, callback) {
            url = url || './cgi-bin/upgrade';
            if (uploadFlag) {
                return;
            }
            uploadFlag = true;
            $.ajaxFileUpload({
                url: url,
                secureuri: false,
                fileElementId: id,
                dataType: 'text',
                success: function() {
                    uploadFlag = false;
                    if (typeof callback === "function") {
                        callback.apply(this, arguments);
                    }

                    $('#fileSearch').on("change", function() {
                        var fileName = [];
                        fileName = ($('#fileSearch').val()).split('\\');
                        $('#fileName').val(fileName[fileName.length - 1]);
                    });
                }
            });
        }
    };
}());

$(function() {

    var G_data = {},
        ws = "#userArea", //最外包裹着表，编辑框，添加框的包裹元素选择器
        $ws = $(ws),
        filterStr = ""; //过滤字符串

    /****************  列表  *************************/
    var authTableSelectEvent = new TableSelectEvent($("#userlistWrap")).init();

    //处理基本数据，组成表格需要的数据形式
    function handleAuthData(data) {
        var userInfo = [],
            ruleData = {},
            rule;

        var nowTime = G_data.systime;

        for (var i = 0; i < data.length; i++) {

            G_data.list[i].pppoeServerUserEn = G_data.list[i].pppoeServerUserEn;
            ruleData = data[i];

            rule = {};
            rule.checkbox = '<input type="checkbox" tindex="' + i + '" name="pppoeServerUserIndex" value="' + (i + 1) + '">';

            rule.pppoeServerUserName = ruleData.pppoeServerUserName;
            rule.pppoeServerUserPwd = ruleData.pppoeServerUserPwd;
            rule.pppoeServerUserQosRuleName = ruleData.pppoeServerUserQosRuleName;
            rule.pppoeServerUserNote = ruleData.pppoeServerUserNote;
            rule.pppoeServerUserExpireTime = (nowTime <= ruleData.pppoeServerUserExpireTime) ? ruleData.pppoeServerUserExpireTime : (ruleData.pppoeServerUserExpireTime + '<button style="height:22px;">已过期</button>');
            rule.pppoeServerUserEn = ruleData.pppoeServerUserEn == true ? _("已启用") : _("已禁用");
            rule.operate = '<div class="operate">' +
                (ruleData.pppoeServerUserEn == true ?
                    '<span class="disable" title="禁用"></span>' :
                    '<span class="enable" title="启用"></span>') +
                '<span class="edit"></span><span class="delete"></span></div>';
            userInfo.push(rule);
        };

        //按过期时间由小到大进行排序
        userInfo.sort(function(a, b) {
            var aTime = a.pppoeServerUserExpireTime;
            var bTime = b.pppoeServerUserExpireTime;
            if (a.pppoeServerUserExpireTime.indexOf('<') !== -1) {
                aTime = a.pppoeServerUserExpireTime.substr(0, a.pppoeServerUserExpireTime.indexOf('<'));
            }
            if (b.pppoeServerUserExpireTime.indexOf('<') !== -1) {
                bTime = b.pppoeServerUserExpireTime.substr(0, b.pppoeServerUserExpireTime.indexOf('<'));
            }
            return (aTime > bTime) ? 1 : -1;
        })
        return {
            authList: userInfo
        };
    }

    //过滤数据
    function filterData(data, filterStr) {
        if (!filterStr) return data;

        var dataList = data.authList,
            filterDataList = [],
            rowObj = null;

        for (var i = 0; i < dataList.length; i++) {

            if ((dataList[i].pppoeServerUserName + dataList[i].pppoeServerUserPwd + dataList[i].pppoeServerUserQosRuleName + dataList[i].pppoeServerUserNote + dataList[i].pppoeServerUserEn + dataList[i].pppoeServerUserExpireTime).indexOf(filterStr) != -1) {
                rowObj = $.extend(true, {}, dataList[i]);

                rowObj.pppoeServerUserName = rowObj.pppoeServerUserName.replace(filterStr, '<span class="text-danger">' + filterStr + '</span>');
                rowObj.pppoeServerUserPwd = rowObj.pppoeServerUserPwd.replace(filterStr, '<span class="text-danger">' + filterStr + '</span>');
                rowObj.pppoeServerUserQosRuleName = rowObj.pppoeServerUserQosRuleName.replace(filterStr, '<span class="text-danger">' + filterStr + '</span>');
                rowObj.pppoeServerUserNote = rowObj.pppoeServerUserNote.replace(filterStr, '<span class="text-danger">' + filterStr + '</span>');
                rowObj.pppoeServerUserEn = rowObj.pppoeServerUserEn.replace(filterStr, '<span class="text-danger">' + filterStr + '</span>');


                filterDataList.push(rowObj);
            }

        };

        return {
            authList: filterDataList
        };
    }

    function addZero(str) {
        return (str.length > 1) ? str : "0" + str;
    }

    var mainView = new R.View($ws, {
        fetchUrl: '/w20e/goform/getPPPoEServerUser',
        updateCallback: function(data) {
            G_data.list = data.userList;
            G_data.systime = data.sysTime;
            var qosList = data.qosRuleList,
                qosObj;
            for (var j = 0; j < qosList.length; j++) {
                qosObj += '<option value="' + qosList[j] + '">' + qosList[j] + '</option>';
            }
            $('[name="pppoeServerUserQosRuleName"]').html(qosObj);
            return filterData(handleAuthData(data.userList), $("#searchTxt").val());
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
                    $.GetSetData.setData('/w20e/goform/delPPPoEServerUser', {
                        pppoeServerUserIndex: selected.join('\t')
                    }, function(res) {
                        showSaveMsg(_("删除成功"), 1000);
                        mainView.update();
                    });
                });

            };

            et[ws + ', click, .delete'] = function() {
                showConfirm.call(this, "确认删除吗？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/delPPPoEServerUser', {
                        pppoeServerUserIndex: $(this).parents('tr').find(":checkbox").attr("tindex")
                    }, function() {
                        showSaveMsg(_("删除成功"), 1000);
                        mainView.update();
                    });
                });
            }

            //禁用
            et[ws + ', click, .enable'] = function() {
                var that = this,
                    index = $(this).parents('tr').find(":checkbox").attr("tindex");

                $.GetSetData.setData('/w20e/goform/switchPPPoEServerUser', {
                    pppoeServerUserIndex: ($(this).parents('tr').find("[name=pppoeServerUserIndex]").val() - 1),
                    pppoeServerUserEn: "true"
                }, function() {
                    that.className = "disable";
                    that.title = _("已启用");
                    $(that).parents("td").prev().html(_("已启用"));
                    G_data.list[index].pppoeServerUserEn = true;
                });
            };

            //禁用
            et[ws + ', click, .disable'] = function() {
                var that = this,
                    index = $(this).parents('tr').find(":checkbox").attr("tindex");

                $.GetSetData.setData('/w20e/goform/switchPPPoEServerUser', {
                    pppoeServerUserIndex: ($(this).parents('tr').find("[name=pppoeServerUserIndex]").val() - 1),
                    pppoeServerUserEn: "false"
                }, function() {
                    that.className = "enable";
                    that.title = _("已禁用");
                    $(that).parents("td").prev().html(_("已禁用"));
                    G_data.list[index].pppoeServerUserEn = false;
                });
            };

            //修改
            et[ws + ', click, .edit'] = function() {
                $ws.find('.modal-edit').modal().find('.modal-header>span').text(_('编辑用户'));
                var index = $(this).parents('tr').find(":checkbox").attr("tindex");
                var editYMD = G_data.list[index].pppoeServerUserExpireTime;

                var editYear = editYMD.split('-')[0];
                var editMon = editYMD.split('-')[1];
                var editDay = editYMD.split('-')[2];

                var data = $.extend(true, {
                    pppoeServerUserIndex: index,
                    sysYear: editYear,
                    sysMonth: editMon,
                    sysDay: editDay
                }, G_data.list[index]);
                editForm.update(data);
            };

            //增加
            et[ws + ' .add-rule, click'] = function() {
                if (G_data.list.length >= R.CONST.CONFIG_PPPOE_USER_NUMBER) {
                    showMsg(_('用户个数已达到上限 %s 个', [R.CONST.CONFIG_PPPOE_USER_NUMBER]));
                    return;
                }
                $ws.find('.modal-add').modal().find('.modal-header>span').text('新增用户');
                $('.modal-add form')[0].reset();
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


    var pattern = /^((((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(10|12|0?[13578])([-\/\._])(3[01]|[12][0-9]|0?[1-9]))|(((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(11|0?[469])([-\/\._])(30|[12][0-9]|0?[1-9]))|(((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(0?2)([-\/\._])(2[0-8]|1[0-9]|0?[1-9]))|(([2468][048]00)([-\/\._])(0?2)([-\/\._])(29))|(([3579][26]00)([-\/\._])(0?2)([-\/\._])(29))(([1][89][0][48])([-\/\._])(0?2)([-\/\._])(29))|(([2-9][0-9][0][48])([-\/\._])(0?2)([-\/\._])(29))|(([1][89][2468][048])([-\/\._])(0?2)([-\/\._])(29))|(([2-9][0-9][2468][048])([-\/\._])(0?2)([-\/\._])(29))|(([1][89][13579][26])([-\/\._])(0?2)([-\/\._])(29))|(([2-9][0-9][13579][26])([-\/\._])(0?2)([-\/\._])(29)))$/;

    /****************  弹出， 编辑View *******************/
    var editForm = new R.FormView(ws + ' .modal-edit form', {
        beforeSubmit: function(data) {
            data.pppoeServerUserExpireTime = data.sysYear + '-' + addZero(data.sysMonth) + '-' + addZero(data.sysDay);
            data.pppoeServerUserNote = (data.pppoeServerUserNote === '') ? "unused" : data.pppoeServerUserNote;

            if (!(pattern.test(data.pppoeServerUserExpireTime))) {
                showMsg(_("到期时间不是一个合法的日期！"));
                return false;
            }
            delete data.sysYear;
            delete data.sysMonth;
            delete data.sysDay;

            return data;
        },

        afterSubmit: function(res) {
            mainView.update();
            showSaveMsg(_("保存成功"), 1000);
            $ws.find('.modal-edit').modal('hide');
        }
    });

    /****************  弹出， 编辑View over*******************/

    /****************  弹出， 增加View *******************/
    var addForm = new R.FormView(ws + ' .modal-add form', {
        beforeSubmit: function() {
            var rules = G_data.list,
                existed = false,
                submitData;

            $.each(rules, function(i, rule) {
                if (rule.pppoeServerUserName === $("#addName").val()) {
                    existed = true;
                    return false;
                }
            });

            if (existed) {
                showMsg(_("该用户名已经存在！"));
                return false;
            }

            var addData = [];
            $(ws + ' .modal-add form').find('input[type="text"], input[type="password"]').each(function() {
                addData.push($(this).val() || "unused");
            });
            var time = addData[addData.length - 3] + "-" + addZero(addData[addData.length - 2]) + "-" + addZero(addData[addData.length - 1]);
            if (!(pattern.test(time))) {
                showMsg(_("到期时间不是一个合法的日期！"));
                return false;
            }
            addData.splice(addData.length - 3, 3, time);
            addData.push($('.modal-add [name="pppoeServerUserQosRuleName"]').find("option:selected").text());
            addData.push($('[name="countEn"]:checked').val());
            showSaveMsg(_("请稍候..."));
            return "pppoeServerUserInfo=" + addData.join('\t');
        },

        afterSubmit: function(res) {
            mainView.update();
            showSaveMsg(_("保存成功"), 1000);
            $ws.find('.modal-add').modal('hide');
        }
    });

    /****************  弹出， 增加View over*******************/

    //导出数据处理
    $(".export-rule").on('click', function() {
        window.location.href = "/w20e/goform/DownloadPppoeUserCfg/pppoe_user.cfg";
    });

    //导入数据处理
    $('#fileSearch').on("change", function() {
        var fileName = [];
        fileName = ($('#fileSearch').val()).split('\\');
        $('#fileName').val(fileName[fileName.length - 1]);
    });

    $("#recoveryBtn").on("click", function() {
        uploadUnit.uploadFile("fileSearch", "/cgi-bin/UploadPppoeUserCfg", function(msg) {
            if (msg !== "yes") {
                showMsg(_("上传失败，请检查上传固件是否正确！"));
                return;
            } else {
                showMsg(_("导入PPPoE用户成功！"));
                mainView.update();
                return;
            }
        });
    });

    //输入合法性验证
    $('#addName').addCheck([{
        "type": "ascii"
    }, {
        "type": "noBlank"
    }, {
        "type": "specialChar",
        "args": ["'\"&"]
    }]);
});
