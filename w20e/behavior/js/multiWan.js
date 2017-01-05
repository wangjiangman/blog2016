$(function() {

    var G_data = {
        multiWanRules: null,
        wanIPGroup: []
    };
    var msg = {
        'true': '已启用',
        'false': '未启用',
        '': ''
    };

     var wanMsg = {
        "WAN1":"WAN1",
        "WAN2":"WAN2",
        "WAN3":"WAN3",
        "WAN4":"WAN4"
    };

    $('[name="wanRouteRuleWAN"]').parent().hide();
    if(top.WAN_NUMBER) {
        $('[name="wanRouteRuleWAN"]:lt('+top.WAN_NUMBER+')').parent().show();
    }

    function getMultiWanList() {
        var data = null, ret = [];
        $.GetSetData.getDataSync('/w20e/goform/getWanRouteRules', function(res) {
            data = $.parseJSON(res) || [];
        });
        G_data.multiWanRules = data;
        G_data.wanIPGroup = [];
        for(var i = 0, l = data.length; i < l; i++) {
            G_data.wanIPGroup.push(data[i].IPGroupName);

            ret.push({
                checkbox: '<input type="checkbox" tindex="' + i + '">',
                IPGroupName: data[i].IPGroupName,
                wanRouteRuleWAN: data[i].wanRouteRuleWAN,
                wanRouteRuleEn: msg[data[i].wanRouteRuleEn],
                operation: data[i].wanRouteRuleEn ? '<div class="operate"><span class="disable" title="禁用"></span><span class="edit"></span><span class="delete"></span></div>' : '<div class="operate"><span class="enable" title="启用"></span><span class="edit"></span><span class="delete"></span></div>'
            });
        }
        return ret;
    }

    function toggleArea($ele, visible, slide) {
        slide = typeof slide === 'undefined' ? 200 : slide;
        visible === false ? $ele.slideUp(slide) : $ele.slideDown(slide);top.ResetHeight.resetHeight(slide);
    }

    function handlerFilterData(data, updateAll) {
        if (updateAll !== false) {
            toggleArea($('#userSetting'), data.wanRoutePolicyType === 'custom' ? true : false, 0);
        }
        data.multiWanRules = getMultiWanList();
        for(var i = 0; i < data.multiWanRules.length; i++) {
            data.multiWanRules[i].wanRouteRuleWAN = wanMsg[data.multiWanRules[i].wanRouteRuleWAN];
        }
        return data;
    }

    function getIPGroupList() {
        var data = null, htmlStr = '';
        $.GetSetData.getDataSync('/w20e/goform/getIPGroupList', function(res) {
            data = $.parseJSON(res);
        });
        if (data && !!data.length) {
            for(var i = 0, l = data.length; i < l; i++) {
                htmlStr += '<option value="' + data[i].IPGroupName + '">' + data[i].IPGroupName + '</option>';
            }
        }
        return htmlStr;
    } 

    var multiWanForm = new R.FormView('#multiWan-modal form');
    multiWanForm.beforeSubmit = function(data) {
        var wanIPGroup = G_data.wanIPGroup.slice(0);
        wanIPGroup.splice(data.wanRouteRuleIndex, 1);
        if ($.inArray(data.IPGroupName, wanIPGroup) > -1) {
            showMsg(_('该IP组已经被配置', [data.wanRouteRuleWAN.toUpperCase()]));
            return false;
        }
        showSaveMsg(_("请稍候..."));        
    };
    multiWanForm.afterSubmit = function(res) {
        showSaveMsg(_('保存成功！'), 1000);
        multiWanView.update(false);
        $('#multiWan-modal').modal('hide');
    };

    var multiWanTableEvent = new TableSelectEvent($('#multiWanContainer')).init();

    var multiWanView = new R.View('#multiWanContainer', {
        fetchUrl: '/w20e/goform/getWanRoutePolicy',
        submitUrl: '/w20e/goform/setWanRoutePolicy',
        updateCallback: handlerFilterData,
        beforeSubmit: function() {
            showSaveMsg(_("请稍候..."));
        },  
        afterSubmit: function() {
            showSaveMsg(_("保存成功"), 1000);
        },
        events: {
            '#addRules, click': function() {
                if (G_data.multiWanRules.length >= R.CONST.CONFIG_WAN_POLICY_NUMBER) {
                    showMsg(_('WAN口策略规则最多只能添加%s条', [R.CONST.CONFIG_WAN_POLICY_NUMBER]));
                    return;
                }
                $('#multiWan-modal').modal().find('.modal-header>span').text('新增规则');
                multiWanForm.reset({wanRouteRuleIndex: G_data.multiWanRules.length});
            },
            '#multiWanContainer, click, .edit': function() {
                $('#multiWan-modal').modal().find('.modal-header>span').text('编辑规则');
                var index = $(this).parents('tr').find('[tindex]').attr('tindex');
                var data = G_data.multiWanRules[index];
                data.wanRouteRuleIndex = index;
                multiWanForm.update(data);
            },
            '#multiWan-save, click': function() {
                multiWanView.submit();  
            },

            '#delRules, click': function() {
                var selected = multiWanTableEvent.getSelectedItems();
                if (selected.length < 1) {
                    showMsg('请选择要删除的条目！');
                    return;
                }
                showConfirm.call(this, "确认删除吗？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/delWanRouteRules', {
                        wanRouteRuleIndex: selected.join('\t')
                    }, function(res) {
                        showSaveMsg(_("删除成功"), 1000);
                        multiWanView.update(false);
                    });
                });
            },
            '#multiWanContainer, click, .disable': function() {
                $.GetSetData.setData('/w20e/goform/switchWanRouteRule', {
                    wanRouteRuleIndex: $(this).parents('tr').find('[tindex]').attr('tindex'),
                    wanRouteRuleEn: false
                }, function() {
                    multiWanView.update(false);
                });
            },
            '#multiWanContainer, click, .enable': function() {
                $.GetSetData.setData('/w20e/goform/switchWanRouteRule', {
                    wanRouteRuleIndex: $(this).parents('tr').find('[tindex]').attr('tindex'),
                    wanRouteRuleEn: true
                }, function() {
                    multiWanView.update(false);
                });
            },
            '#multiWanContainer, click, .delete': function() {
                showConfirm.call(this, "确认删除吗？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/delWanRouteRules', {
                        wanRouteRuleIndex: $(this).parents('tr').find('[tindex]').attr('tindex')
                    }, function() {
                        showSaveMsg(_("删除成功"), 1000);
                        multiWanView.update(false);
                    });
                });
            },
            '#multiWanContainer, click, input[name=wanRoutePolicyType]': function() {
                toggleArea($('#userSetting'), $(this).val() === 'custom' ? true : false);
            }
        }

    });
    $('[name="IPGroupName"]').html(getIPGroupList());
});