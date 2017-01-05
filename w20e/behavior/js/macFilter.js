$(function() {

    var msg = {
        'true': '已启用',
        'false': '未启用',
        'black': '黑名单',
        'white': '白名单',
        '': ''
    };
    
    var G_data = {
        macFilterRules: null,
        macRules: []
    }; 
    function getMacFilterList() {
        var data = null, ret = [];
        $.GetSetData.getDataSync('/w20e/goform/getMacFilterRules', function(res) {
            data = $.parseJSON(res);
        });
        G_data.macFilterRules = data;
        G_data.macRules = [];
        for (var i = 0, l = data.length; i < l; i++) {//数组深度拷贝，以免影响到G_data.macFilterRules
            G_data.macRules.push(data[i].macFilterRuleMac);
            ret.push({
                checkbox: '<input type="checkbox" tindex="' + i + '">',
                macFilterMode: msg[data[i].macFilterRuleMode],
                macFilterMac: data[i].macFilterRuleMac,
                timeGroupName: data[i].timeGroupName,
                macFilterRuleEn: msg[data[i].macFilterRuleEn],
                operate: data[i].macFilterRuleEn ? '<div class="operate"><span class="disable" title="禁用"></span><span class="edit"></span><span class="delete"></span></div>' : '<div class="operate"><span class="enable" title="启用"></span><span class="edit"></span><span class="delete"></span></div>'
            });
        }
        return ret;
    }

    function toggleArea($ele, visible, slide) {
        slide = typeof slide === 'undefined' ? 200 : slide;
        visible === false ? $ele.slideUp(slide) : $ele.slideDown(slide);top.ResetHeight.resetHeight(slide);
    }

    function handlerFilterData(data, updateAll) {
        data.macFilterRules = getMacFilterList();
        if (updateAll !== false) {
            toggleArea($('#macFilterSetting'), data.macFilterEn, 0);
        }
        return data;
    }

    function getTimeGroupList() {
        var data = null, htmlStr = '';
        $.GetSetData.getDataSync('/w20e/goform/getTimeGroupList', function(res) {
            data = $.parseJSON(res);
        });
        if (data && !!data.length) {
            for(var i = 0, l = data.length; i < l; i++) {
                htmlStr += '<option value="' + data[i].timeGroupName + '">' + data[i].timeGroupName + '</option>';
            }
        }
        return htmlStr;
    }  


    var macFilterForm = new R.FormView('#macFilter-modal form');
    macFilterForm.afterSubmit = function(res) {
        macFilterView.update(false);
        showSaveMsg(_('保存成功！'), 1000);
        $('#macFilter-modal').modal('hide');
    };
    macFilterForm.beforeSubmit = function(data) {
        var macArr = G_data.macRules.slice(0);
        macArr.splice(data.macFilterRuleIndex, 1);
        if ($.inArray(data.macFilterRuleMac, macArr) > -1) {
            showMsg('MAC地址不能重复使用！');
            return false;
        } 
        showSaveMsg(_("请稍候..."));
    };

    var macTableSelectEvent = new TableSelectEvent($('#macFilterContainer')).init();

    var macFilterView = new R.View('#macFilterContainer', {
        fetchUrl: '/w20e/goform/getMacFilter',
        submitUrl: '/w20e/goform/setMacFilter',
        updateCallback: handlerFilterData,
        beforeSubmit: function() {
            showSaveMsg(_("请稍候..."));
        },  
        afterSubmit: function() {
            showSaveMsg(_("保存成功"), 1000);
        },
        events: {
            '#addRules, click': function() {
                if (G_data.macFilterRules.length >= R.CONST.CONFIG_FILTER_MAC_NUMBER) {
                    showMsg(_('MAC过滤规则最多只能添加%s条', [R.CONST.CONFIG_FILTER_MAC_NUMBER]));
                    return;
                }
                $('#macFilter-modal').modal().find('.modal-header>span').text('新增规则');
                macFilterForm.reset({macFilterRuleIndex: G_data.macFilterRules.length});
            },
            '#macFilterContainer, click, .edit': function() {
                $('#macFilter-modal').modal().find('.modal-header>span').text('编辑规则');
                var index = $(this).parents('tr').find('[tindex]').attr('tindex');
                var data = G_data.macFilterRules[index];
                data.macFilterRuleIndex = index;
                macFilterForm.update(data);
            },
            
            '#macFilter-save, click': function() {
                macFilterView.submit();
            },
            '#removeRules, click': function() {
                var selected = macTableSelectEvent.getSelectedItems();
                if (selected.length < 1) {
                    showMsg('请选择要删除的条目！');
                    return;
                }
                showConfirm.call(this, "确认删除吗？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/delMacFilterRules', {
                        macFilterRuleIndex: selected.join('\t')
                    }, function(res) {
                        showSaveMsg(_("删除成功！"), 1000);
                        macFilterView.update(false);
                    });
                });
            },
            '#macFilterContainer, click, .enable': function() {
                $.GetSetData.setData('/w20e/goform/switchMacFilterRule', {
                    macFilterRuleIndex: $(this).parents('tr').find('[tindex]').attr('tindex'),
                    macFilterRuleEn: true
                }, function() {
                    macFilterView.update(false);
                });
            },
            '#macFilterContainer, click, .disable': function() {
                $.GetSetData.setData('/w20e/goform/switchMacFilterRule', {
                    macFilterRuleIndex: $(this).parents('tr').find('[tindex]').attr('tindex'),
                    macFilterRuleEn: false
                }, function() {
                    macFilterView.update(false);
                });
            },
            '#macFilterContainer, click, .delete': function() {
                showConfirm.call(this, "确认删除吗？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/delMacFilterRules', {
                        macFilterRuleIndex: $(this).parents('tr').find('[tindex]').attr('tindex')
                    }, function() {
                        showSaveMsg(_('删除成功！'), 1000);
                        macFilterView.update(false);
                    });
                });
            },
            '#macFilterContainer, click, input[name=macFilterEn]': function() {
                toggleArea($('#macFilterSetting'), $(this).val() === "true" ? true : false);
            }
        }
    });
    $('#macFilter-modal select').html(getTimeGroupList());
});