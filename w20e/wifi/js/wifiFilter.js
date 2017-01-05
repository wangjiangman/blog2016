$(function() {

    var G_data = {};
    var table = new TablePage($("table:eq(0)"));
    var table1 = new TablePage($("table:eq(1)"));
    var form = new R.FormView("#form");
    var form1 = new R.FormView("#form1");

    var ssidData = {
        "1": {
            "tableObj": table,
            "formObj": form,
            "selectEvent": new TableSelectEvent($("#form")).init(),
            "data": null
        },
        "2": {
            "tableObj": table1,
            "formObj": form1,
            "selectEvent": new TableSelectEvent($("#form1")).init(),
            "data": null
        }
    };


    function handleData(data) {
        ssidData["1"].data = data.wifiFilter[0]
        ssidData["2"].data = data.wifiFilter[1]

        for (var i = ssidData["1"].data.wifiFilterList.length - 1; i >= 0; i--) {
            ssidData["1"].data.wifiFilterList[i].rowIndex = i;
        };
        for (var i = ssidData["2"].data.wifiFilterList.length - 1; i >= 0; i--) {
            ssidData["2"].data.wifiFilterList[i].rowIndex = i;
        };
    }

    function updateData(callback) {
        $.GetSetData.getJson("/w20e/goform/getWifiFilter", function(data) {
            handleData(data);
            callback && callback();
        });
    }

    //更新表格数据，ssidIndex指定是哪个ssid的表格
    function updateTable(ssidIndex) {
        var tableData = [],
            rowData = null,
            wifiFilterList = ssidData[ssidIndex].data.wifiFilterList,
            ssidIndex = ssidIndex + "";

        for (var i = 0; i < wifiFilterList.length; i++) {
            rowData = {};
            rowData.checkbox = '<input type="checkbox" tindex="'+i+'" />'
            rowData.wifiFilterListDeviceMAC = wifiFilterList[i].wifiFilterListDeviceMAC.toUpperCase();
            rowData.wifiFilterListEn = wifiFilterList[i].wifiFilterListEn?"启用": "禁用";
            rowData.wifiFilterListRemark = wifiFilterList[i].wifiFilterListRemark;
            rowData.operate = '<div class="operate"><span class="edit"></span><span class="delete"></span></div>';
            tableData.push(rowData);
        }

        
        ssidData[ssidIndex].tableObj.data = tableData;
        ssidData[ssidIndex].tableObj.update();
    }

    //整个页面的内容一起更新
    function updatePage() {
        updateTable(1);
        updateTable(2);
        form.update(ssidData["1"].data);
        form1.update(ssidData["2"].data);
        $("[data-bind=wifiFilterSSID]").eq(0).attr("title", ssidData["1"].data.wifiFilterSSID)
            .html(ssidData["1"].data.wifiFilterSSID);
        $("[data-bind=wifiFilterSSID]").eq(1).attr("title", ssidData["2"].data.wifiFilterSSID)
            .html(ssidData["2"].data.wifiFilterSSID);
        initView();
    }


    function init() {
        $("table:eq(0), form:eq(0)").attr("data-sindex", "1");
        $("table:eq(1), form:eq(1)").attr("data-sindex", "2");
        table.init();
        table1.init();
        initEvent();
        updateData(updatePage);
    }


    function initEvent() {
        $("[name=wifiFilterEn]").on("click", initView);

        $("#wifiFilterSet-save").on("click", function() {
            initView();
        });

        //删除
        $('.del-rule').on("click", function() {
            var $form = $(this).parents("form");
            var $trs = $form.find("tbody tr");
            var sindex = $(this).parents("form").attr("data-sindex");
            var sData = ssidData[sindex]
            var selected = sData.selectEvent.getSelectedItems();
            if (selected.length < 1) {
                showMsg(_('请选择要删除的条目！'));
                return;
            }

            showConfirm.call(this, "确认删除吗？", function() {
                showSaveMsg(_("请稍候..."));
                $.GetSetData.setData('/w20e/goform/delWifiFilterRules', {
                    SSIDIndex: sindex,
                    wifiFileterListIndex: $.map(selected, function(selectedIndex) {
                        return $trs.eq(selectedIndex).find(":checkbox").attr("tindex");
                    }).join('\t')
                }, function(res) {
                    showSaveMsg(_("删除成功"), 1000);
                    updateData(function() { updateTable(sindex); });
                });
            });
        });

        $("body").on("click", ".delete", function() {
            var sindex = $(this).parents("form").attr("data-sindex");
            var tindex = $(this).parents("tr").find(":checkbox").attr("tindex");

            showConfirm.call(this, "确认删除吗？", function() {
                showSaveMsg(_("请稍候..."));
                $.GetSetData.setData('/w20e/goform/delWifiFilterRules', {
                    SSIDIndex: sindex,
                    wifiFileterListIndex:tindex
                }, function() {
                    showSaveMsg(_("删除成功"), 1000);
                    updateData(function() { updateTable(sindex); });
                });
            });
        });

        //增加
        $(".add-rule").on("click", function() {
            var sindex = $(this).parents("form").attr("data-sindex");

            if (ssidData[sindex].data.wifiFilterList.length >= R.CONST.CONFIG_WIFI_FILTER_NUMBER) {
                showMsg(_('过滤客户端配置最多支持 %s 条', [R.CONST.CONFIG_WIFI_FILTER_NUMBER]));
                return;
            }
            $('.modal-add').modal().find('.modal-header>span').text('新增MAC');
            addModalCheck();
            addForm.reset({"SSIDIndex": sindex});
        });

        //修改
        $("body").on("click", ".edit", function() {
            var sindex = $(this).parents("form").attr("data-sindex"),
                listData = ssidData[sindex].data.wifiFilterList,
                index = $(this).parents('tr').find(":checkbox").attr("tindex"),
                data = listData[index];

                data.SSIDIndex = sindex;
                data.wifiFileterListIndex = index;

            $('.modal-edit').modal().find('.modal-header>span').text(_('编辑用户'));
            addModalCheck();
            editForm.update(data);
        });

        //确定提交
        $("#wifiFilterSet-save").on("click", function() {
            var submitData = {};
            $("#form, #form1").each(function(i) {
                submitData["wifiFilterEn" + (i + 1)] = $(this).find("[name=wifiFilterEn]:checked").length? "true": "false";
                submitData["wifiFilterMode" + (i + 1)] = $(this).find("[name=wifiFilterMode]:checked").val();
            }); 

            showSaveMsg(_("请稍候..."));
            $.GetSetData.setData("/w20e/goform/setWifiFilter", submitData, function(res) {
                showSaveMsg(_('保存成功'), 1000);
                updateData(updatePage);
            });
        });

        //取消
        $("#wifiFilterSet-cancel").on("click", function() {
            form.update(ssidData["1"].data);
            form1.update(ssidData["2"].data);
        });
    }

    //根据html元素的值变换至实时的视图
    function initView(slide) {
        var slide = (typeof slide === "undefined" ? 200 : slide);

        $("[name=wifiFilterEn]").each(function() {
            if (this.checked) {
                $(this).parents("form").find(".filter-wrap").slideDown(slide);
            } else {
                $(this).parents("form").find(".filter-wrap").slideUp(slide);
            }
        });
    }


    /****************  弹出， 编辑View *******************/
    var editForm = new R.FormView('.modal-edit form', {
        beforeSubmit: function() {
            var invalid = false;
                sindex = $(".modal-edit form").find("[name=SSIDIndex]").val(),
                wifiFileterListIndex = $(".modal-edit form").find("[name=wifiFileterListIndex]").val(),
                listData = ssidData[sindex].data.wifiFilterList,
                mac = $(".modal-edit form").find("[name=wifiFilterListDeviceMAC]").val().toUpperCase();

            for (var i = listData.length - 1; i >= 0; i--) {
                if (listData[i].wifiFilterListDeviceMAC == mac && 
                    wifiFileterListIndex != i) {
                    showMsg(_("设置的MAC地址已经存在"));
                    invalid = true;
                }
            }

            if (invalid) {
                return false;
            }

            showSaveMsg(_("请稍候..."));
            return true;
        },

        afterSubmit: function(res) {
            var sindex = $(".modal-edit form").find("[name=SSIDIndex]").val();

            updateData(function() {updateTable(sindex)});
            showSaveMsg(_('保存成功'), 1000);
            $('.modal-edit').modal('hide');
        }
    });

    /****************  弹出， 编辑View over*******************/


    /****************  弹出，添加view *********************/
    var addRowHTML = $(".add-tbody tr")[0].outerHTML;

    var addForm = new R.FormView('.modal-add form', {

        beforeSubmit: function() {
            var invalid = false,
                sindex = $(".modal-add form").find("[name=SSIDIndex]").val(),
                listData = ssidData[sindex].data.wifiFilterList,  
                MACs = [];

            //逐条判断添加的规则MAC是否已经存在, 是否表中有数据重复
            $(".add-tbody [name=wifiFilterListDeviceMAC]").each(function() {
                if (invalid) { return false; }

                var that = this,
                    mac = this.value.toUpperCase();
                for (var i = listData.length - 1; i >= 0; i--) {
                    if (listData[i].wifiFilterListDeviceMAC == mac) {
                        invalid = true;
                        this.focus();
                        showMsg(_("MAC地址已经存在！"));
                        return false;
                    }
                };
                if ($.inArray(mac, MACs) >= 0) {
                    invalid = true;
                    this.focus();
                    showMsg(_("MAC地址不能重复！"));
                    return false;              
                }


                MACs.push(this.value);
            });

            if (invalid) {
                return false;
            }

            var data = $('.add-tbody>tr').map(function() {

                return ($(this).find('input, select').map(function() {
                    if (this.name == "wifiFilterListDeviceMAC") {
                        return this.value.toUpperCase();
                    }
                    return this.value;
                }).get().join('\t'));

            }).get().join('\n');

            showSaveMsg('请稍候...');

            return "SSIDIndex=" + sindex + "&wifiFilterList=" + encodeURIComponent(data);
        },

        afterSubmit: function(res) {
            var sindex = $(".modal-add form").find("[name=SSIDIndex]").val();
            updateData(function() {updateTable(sindex)});
            showSaveMsg('保存成功', 1000);
            $('.modal-add').modal('hide');
        },  

        events: (function() {
            var et = {};

            et[".modal-add, hidden.bs.modal"] = function() {
                $(".add-tbody").html(addRowHTML);
                $(".add-tbody .validatebox").addCheck();
            };

            //每一条后面的添加按钮
            et[".add-tbody, click, .btn-add"] = function(e) {
                var sindex = $(this).parents("form").find("[name=SSIDIndex]").val();
                var listData = ssidData[sindex].data.wifiFilterList;    

                e.preventDefault();
                if ($(".add-tbody tr").length >= R.CONST.CONFIG_WIFI_FILTER_ADD_NUMBER) {
                    showMsg(_('每次最多添加%s条', [R.CONST.CONFIG_WIFI_FILTER_ADD_NUMBER]));
                } else if ($(".add-tbody tr").length + listData.length >= R.CONST.CONFIG_WIFI_FILTER_NUMBER) {
                    showMsg(_('过滤客户端配置最多支持 %s 条', [R.CONST.CONFIG_WIFI_FILTER_NUMBER]));
                } else {
                    $(".add-tbody").append($(addRowHTML).clone());
                    addModalCheck();
                }
                $(".add-tbody .validatebox").addCheck();
            };

            //每一条后面的删除按钮
            et[".add-tbody, click, .btn-remove"] = function(e) {
                e.preventDefault();
                $(this).parents("tr").remove();
                if ($(".add-tbody tr").length == 0) {
                    $('.modal-add').modal('hide');
                }
            };

            return et;            
        })()
    });
    /****************  弹出，添加view over*********************/
    function addModalCheck() {
        $("[name=wifiFilterListRemark]").each(function() {
            $(this).addCheck([
                {
                    "type": "remarkTxt", 
                    "args": [1,16]
                }]);
        });
    }

    init();
});