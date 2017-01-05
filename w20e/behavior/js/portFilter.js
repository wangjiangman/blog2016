$(function() {

    var G_data = {
        portFilterRules: null,
        timeIPGroups: []
    };
    var msg = {
        'true': '已启用',
        'false': '未启用',
        '': '',
        'TCP': 'TCP',
        'UDP': 'UDP',
        'ALL': '全部'
    };
    function getPortFilterList() {
        var data = null, ret = [];
        $.GetSetData.getDataSync('/w20e/goform/getPortFilterRules', function(res) {
            data = $.parseJSON(res);
        });
        G_data.portFilterRules = data;
        G_data.timeIPGroups = [];
        for(var i = 0, l = data.length; i < l; i++) {
            G_data.timeIPGroups.push(data[i].timeGroupName + '\t' + data[i].IPGroupName);
            ret.push({
                checkbox: '<input type="checkbox" tindex="' + i + '">',
                IPGroupName: data[i].IPGroupName,
                timeGroupName: data[i].timeGroupName,
                portRanage: data[i].portFilterRuleStartPort + '~' + data[i].portFilterRuleEndPort,
                portFilterRuleProtocol: msg[data[i].portFilterRuleProtocol],
                portFilterRuleEn: msg[data[i].portFilterRuleEn],
                operate: data[i].portFilterRuleEn ? '<div class="operate"><span class="disable" title="禁用"></span><span class="edit"></span><span class="delete"></span></div>' : '<div class="operate"><span class="enable" title="启用"></span><span class="edit"></span><span class="delete"></span></div>'
            });
        }
        return ret;
    }

    function toggleArea($ele, visible, slide) {
        slide = typeof slide === 'undefined' ? 200 : slide;
        visible === false ? $ele.slideUp(slide) : $ele.slideDown(slide);top.ResetHeight.resetHeight(slide);
    }


    function handlerFilterData(data, updateAll) {
        data.portFilterRules = getPortFilterList();
        if (updateAll !== false) {
            toggleArea($('#portFilterSetting'), data.portFilterEn, 0);
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



    var portFilterForm = new R.FormView('#portFilter-modal form');

    portFilterForm.beforeSubmit = function(data) {
        if (+data.portFilterRuleStartPort > +data.portFilterRuleEndPort) {
            showMsg('起始端口号不能大于终止端口号');
            return false;
        }
        var arr = G_data.timeIPGroups.slice(0);
        arr.splice(data.portFilterRuleIndex, 1);
        if ($.inArray(data.timeGroupName + '\t' + data.IPGroupName, arr) > -1) {
            showMsg('该IP组与时间组组合已经被使用');
            return false;
        }
        showSaveMsg(_("请稍候..."));
    };
    portFilterForm.afterSubmit = function(res) {
        showSaveMsg(_("保存成功"), 1000);
        portFilterView.update(false);
        $('#portFilter-modal').modal('hide');
    };

    var portTableSelectEvent = new TableSelectEvent($('#portFilterContainer')).init();
    

    var portFilterView = new R.View('#portFilterContainer', {
        fetchUrl: '/w20e/goform/getPortFilter',
        submitUrl: '/w20e/goform/setPortFilter',
        updateCallback: handlerFilterData,
        beforeSubmit: function() {
            showSaveMsg(_("请稍候..."));
        },  
        afterSubmit: function() {
            showSaveMsg(_("保存成功"), 1000);
        },
        events: {
            '#addRules, click': function() {
                if (G_data.portFilterRules.length >= R.CONST.CONFIG_FILTER_IPPORT_NUMBER) {
                    showMsg(_('端口过滤规则最多只能添加%s条', [R.CONST.CONFIG_FILTER_IPPORT_NUMBER]));
                    return;
                }
                $('#portFilter-modal').modal().find('.modal-header>span').text('新增过滤规则');
                portFilterForm.reset({portFilterRuleIndex: G_data.portFilterRules.length});
            },
            '#portFilterContainer, click, .edit': function() {
                $('#portFilter-modal').modal().find('.modal-header>span').text('编辑过滤规则');
                var index = $(this).parents('tr').find('[tindex]').attr('tindex');
                var data = G_data.portFilterRules[index];
                data.portFilterRuleIndex = index;
                portFilterForm.update(data);
            },
            '#portFilter-save, click': function() {
                portFilterView.submit();
            },
            '#delRules, click': function() {
                var selected = portTableSelectEvent.getSelectedItems();
                if (selected.length < 1) {
                    showMsg('请选择要删除的条目！');
                    return;
                }

                showConfirm.call(this, "确认删除吗？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/delPortFilterRules', {
                        portFilterRuleIndex: selected.join('\t')
                    }, function() {
                        showSaveMsg(_('删除成功！'), 1000);
                        portFilterView.update(false);
                    });
                });
            },
            '#portFilterContainer, click, .enable': function() {
                $.GetSetData.setData('/w20e/goform/switchPortFilterRule', {
                    portFilterRuleIndex: $(this).parents('tr').find('[tindex]').attr('tindex'),
                    portFilterRuleEn: true
                }, function() {
                    portFilterView.update(false);
                });
            },
            '#portFilterContainer, click, .disable': function() {
                $.GetSetData.setData('/w20e/goform/switchPortFilterRule', {
                    portFilterRuleIndex: $(this).parents('tr').find('[tindex]').attr('tindex'),
                    portFilterRuleEn: false
                }, function() {
                    portFilterView.update(false);
                });
            },
            '#portFilterContainer, click, .delete': function() {

                showConfirm.call(this, "确认删除吗？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/delPortFilterRules', {
                        portFilterRuleIndex: $(this).parents('tr').find('[tindex]').attr('tindex')
                    }, function() {
                        showSaveMsg(_('删除成功！'), 1000);
                        portFilterView.update(false);
                    });
                });
            },
            '#portFilterContainer, click, input[name=portFilterEn]': function() {
                toggleArea($('#portFilterSetting'), $(this).val() === "true" ? true : false);
            }
        }
    });
    $('#portFilter-modal select[name="IPGroupName"]').html(getIPGroupList());
    $('#portFilter-modal select[name="timeGroupName"]').html(getTimeGroupList());
});