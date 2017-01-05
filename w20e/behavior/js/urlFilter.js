$(function() {

    var G_data = {
        urlFilterRules: null,
        urlUserGroupListLength: 0,
        timeIPGroups: [],
        userGroupNames: [],
        urlGroup: []
    };
    var msg = {
        'true': '已启用',
        'false': '未启用',
        '': ''
    };

    var UrlGroupName = {
        get: function(key, type) {
            return UrlGroupName.data[type][key] ? UrlGroupName.data[type][key] : '未知分组';
        },
        set: function(key, value, type) {
            UrlGroupName.data[type][key] = value;
        },
        data: {
            sys: {},
            user: {}
        }
    };

    var table = new TablePage($('#urlListTable'));

    var tableSelectEvent = new TableSelectEvent($('#urlFilterContainer')).init();

    function toggleArea($ele, visible, slide) {
        slide = typeof slide === 'undefined' ? 200 : slide;
        visible === false ? $ele.slideUp(slide) : $ele.slideDown(slide);top.ResetHeight.resetHeight(slide);
    }

    $('#urlFilter-modal select[name="timeGroupName"]').html(getTimeGroupList());
    $('#urlFilter-modal select[name="IPGroupName"]').html(getIPGroupList());
    $('#urlFilterGroupList').html(getUrlGroupList());

    function getUrlFilterList() {
        var data = null,
            ret = [];
        $.GetSetData.getDataSync('/w20e/goform/getUrlFilterRules', function(res) {
            data = $.parseJSON(res);
        });
        G_data.urlFilterRules = data;
        G_data.timeIPGroups = [];
        for (var i = 0, l = data.length; i < l; i++) {
            G_data.timeIPGroups.push(data[i].timeGroupName + '\t' + data[i].IPGroupName);
            ret.push({
                checkbox: '<input type="checkbox" tindex="' + i + '">',
                IPGroupName: data[i].IPGroupName,
                timeGroupName: data[i].timeGroupName,
                urlFilterGroups: (function(data) {
                    if (!data) return '';
                    var group = data.split(';'),
                        ret = [];

                    var list = group[0] ? group[0].split(',') : [];
                    list = list ? list : [];
                    for (var j = 0, l = list.length; j < l; j++) {
                        ret.push(UrlGroupName.get(list[j], 'user'));
                    }

                    list = group[1] ? group[1].split(',') : [];
                    list = list ? list : [];
                    for (j = 0, l = list.length; j < l; j++) {
                        ret.push(UrlGroupName.get(list[j], 'sys'));
                    }

                    ret = ret.join(', ');
                    return '<span title="' + ret + '" class="text-static">' + ret + '</span>';

                }(data[i].urlFilterGroups)),

                urlFilterRuleEn: msg[data[i].urlFilterRuleEn],
                operate: data[i].urlFilterRuleEn ? '<div class="operate"><span class="disable" title="禁用"></span><span class="edit"></span><span class="delete"></span></div>' : '<div class="operate"><span class="enable" title="启用"></span><span class="edit"></span><span class="delete"></span></div>'
            });
        }
        return ret;
    }

    function handlerFilterData(data, updateAll) {
        data.urlFilterRules = getUrlFilterList();
        if (updateAll !== false) {
            toggleArea($('#urlFilterSetting'), data.urlFilterEn, 0);
        }
        return data;
    }

    function getTimeGroupList() {
        var data = null,
            htmlStr = '';
        $.GetSetData.getDataSync('/w20e/goform/getTimeGroupList', function(res) {
            data = $.parseJSON(res);
        });
        if (data && !!data.length) {
            for (var i = 0, l = data.length; i < l; i++) {
                htmlStr += '<option value="' + data[i].timeGroupName + '">' + data[i].timeGroupName + '</option>';
            }
        }
        return htmlStr;
    }

    function getUrlListByName(name, type) {
        var data = null,
            ret = [];
        $.GetSetData.getDataSync('/w20e/goform/getUrls?urlGroupName=' + encodeURIComponent(name) + '&urlGroupType=' + type +
            '&rd=' + Math.random(),
            function(res) {
                data = $.parseJSON(res);
            });
            G_data.urlGroup = [];
        for (var i = 0, l = data.length; i < l; i++) {
            G_data.urlGroup.push(data[i].urlString);
            ret.push({
                index: i + 1,
                urlRemark: data[i].urlRemark,
                urlString: '<a href="http://' + data[i].urlString + '" target="_blank" title="' + data[i].urlString + '" class="text-fixed">' + data[i].urlString.slice(0, 40) + (data[i].urlString.length > 40 ? '...' : '') + '</a>',
                operate: type == 'user' ? '<a class="url-delete" index="' + i + '">删除</a>' : '系统自带'
            });
        }
        table.data = ret;
        table.init();
    }

    function getIPGroupList() {
        var data = null,
            htmlStr = '';
        $.GetSetData.getDataSync('/w20e/goform/getIPGroupList', function(res) {
            data = $.parseJSON(res);
        });
        if (data && !!data.length) {
            for (var i = 0, l = data.length; i < l; i++) {
                htmlStr += '<option value="' + data[i].IPGroupName + '">' + data[i].IPGroupName + '</option>';
            }
        }
        return htmlStr;
    }


    function getUrlGroupList() {
        var data = null,
            htmlStr = '',
            tableHtmlStr = '<tbody>',
            index = 1;
        $.GetSetData.getDataSync('/w20e/goform/getUrlGroupList', function(res) {
            data = $.parseJSON(res);
        });

        for (var i = 0, l = data.urlSysGroupList.length; i < l; i++) {
            htmlStr += '<label title="' + data.urlSysGroupList[i].urlGroupName + '"><input type="checkbox" data-type="sys" value="' + data.urlSysGroupList[i].urlGroupId + '">' + data.urlSysGroupList[i].urlGroupName + '</label>';

            if (index > 0 && (index % 10) == 1) {
                tableHtmlStr += '</tr><tr>';
            }

            tableHtmlStr += '<td data-type="sys" class="sys">' + data.urlSysGroupList[i].urlGroupName + '</td>';
            UrlGroupName.set(data.urlSysGroupList[i].urlGroupId, data.urlSysGroupList[i].urlGroupName, 'sys');
            index++;
        }
        G_data.userGroupNames = [];
        if (data.urlUserGroupList) {
            for (i = 0, l = data.urlUserGroupList.length; i < l; i++) {
                htmlStr += '<label title="' + data.urlUserGroupList[i].urlGroupName + '"><input type="checkbox" data-type="user" value="' + data.urlUserGroupList[i].urlGroupId + '">' + data.urlUserGroupList[i].urlGroupName + '</label>';
                if ((index % 10) == 1) {
                    tableHtmlStr += '</tr><tr>';
                }

                if (~~data.urlUserGroupList[i].urlGroupRefer === 0) {
                    tableHtmlStr += '<td data-type="user" class="user" title="' + data.urlUserGroupList[i].urlGroupName + '" index="' + i + '">' + data.urlUserGroupList[i].urlGroupName + '<span class="delete-group" title="点击删除"></span></td>';
                } else {
                    tableHtmlStr += '<td data-type="user" class="user refered" index="' + i + '">' + data.urlUserGroupList[i].urlGroupName + '</td>';
                }
                G_data.userGroupNames.push(data.urlUserGroupList[i].urlGroupName);
                UrlGroupName.set(data.urlUserGroupList[i].urlGroupId, data.urlUserGroupList[i].urlGroupName, 'user');
                index++;
            }
            G_data.urlUserGroupListLength = data.urlUserGroupList.length;
        } else {
            G_data.urlUserGroupListLength = 0;
        }


        if ((index % 10) == 1) {
            tableHtmlStr += '</tr><tr>';
        }
        tableHtmlStr += '<td class="addNewGroup" id="addNewGroup">+新增分类</td></tr>';
        $('#urlGroupTable').html(tableHtmlStr);
        return htmlStr;
    }

    function initUrlList(data) {
        data = data.split(';');
        if (data.length < 2) {
            Debug.log('url Filter list is invalid!');
            return;
        }
        var dataTmp = data[0].split(',');
        $('#urlFilterGroupList input[data-type="user"]').each(function() {
            if ($.inArray(this.value, dataTmp) > -1) this.checked = true;
        });

        dataTmp = data[1].split(',');
        $('#urlFilterGroupList input[data-type="sys"]').each(function() {
            if ($.inArray(this.value, dataTmp) > -1) this.checked = true;
        });
    }

    function initEvent() {
        $('#selectAllList').on('click', function() {
            $('#urlFilterGroupList input').prop('checked', true);
        });

        $('#reverseSelect').on('click', function() {
            var checkedEl = $('#urlFilterGroupList input:checked');
            $('#urlFilterGroupList input').prop('checked', true);
            checkedEl.prop('checked', false);
            checkedEl = null;
        });

        $('#urlFilteModal-save').on('click', function(e) {
            e.preventDefault();

            if (!$.validate({
                    wrapElem: '#urlFilter-modal'
            }).check()) return;

            var select = $('#urlFilterGroupList input:checked');
            var data = new AutoCollect($('#urlFilter-modal').find('input:hidden, select')).getJson();

            var arr = G_data.timeIPGroups.slice(0);
            arr.splice(data.urlFilterRuleIndex, 1);
            if ($.inArray(data.timeGroupName + '\t' + data.IPGroupName, arr) > -1) {
                showMsg('该IP组与时间组组合已经被使用');
                return;
            }

            data.urlFilterGroups = select.filter('[data-type="user"]').map(function() {
                    return this.value;
                }).get().join('\t') + '\n' +
                select.filter('[data-type="sys"]').map(function() {
                    return this.value;
                }).get().join('\t');

            showSaveMsg(_("请稍候..."));
            $.GetSetData.setData('/w20e/goform/setUrlFilterRule', data, function(res) {
                showSaveMsg(_("保存成功"), 1000);
                urlFilterView.update(false);
                $('#urlFilterGroupList').html(getUrlGroupList());
                $('#urlFilter-modal').modal('hide');
            });
        });

        $('#urlGroupTable').on('click', 'td', function(e) {
            if (e.target.className == 'delete-group') {
                showConfirm.call(this, "确认删除吗？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/delUrlGroup', 'urlGroupIndex=' + $(this).attr('index'), function(res) {
                        showSaveMsg(_("删除成功"), 1000);
                        $('#urlFilterGroupList').html(getUrlGroupList());
                    });
                });
            } else {
                if (this.id !== 'addNewGroup') {
                    var name = $(this).text(),
                        type = $(this).attr('data-type');
                    getUrlListByName(name, type);
                    if (type == 'sys') {
                        $('#table-oprate').hide();
                        $('#editGroup-modal #title').text('网址管理：正在查看组[' + name + ']');
                    } else {
                        $('#table-oprate').show();
                        $('#table-oprate [name="urlGroupName"]').val(name);
                        $('#table-oprate [name="urlIndex"]').val($(this).attr('index'));
                        $('#table-oprate [type="text"]').val('');
                        $('#editGroup-modal #title').text('网址管理：正在编辑组[' + name + ']');
                    }
                    $('#editGroup-modal').modal();
                } else {
                    if (G_data.urlUserGroupListLength >= R.CONST.CONFIG_URL_GROUP_NUMBER) {
                        showMsg(_('用户网址组最多只能添加%s组', [R.CONST.CONFIG_URL_GROUP_NUMBER]));
                        return;
                    }
                    $('#addGroup-modal').modal().find('[name="urlGroupName"]').val('');
                    $('#addGroup-modal').find('[name="urlString"]').val('');
                    $('#addGroup-modal').find('[name="urlRemark"]').val('');
                }
            }

        });

        $('#editGroup-modal').on('click', '.url-delete', function() {
            var that = this;
            if(($('#urlListTable tbody').find('tr').length === 1) && ($(that).attr('index') === "0")) {
                showMsg(_("分组中至少存在一条网址信息，若确定删除，请直接删除分组！"));
                return false;
            }
            
            showConfirm.call(this, "确认删除吗？", function() {
                showSaveMsg(_("请稍候..."));
                $.GetSetData.setData('/w20e/goform/delUrl', {
                    urlGroupName: $('#table-oprate [name="urlGroupName"]').val(),
                    urlIndex: $(that).attr('index')
                }, function(res) {
                    showSaveMsg(_("删除成功"), 1000);
                    getUrlListByName($('#table-oprate [name="urlGroupName"]').val(), 'user');
                });
            });
        });

        $('#addUrl').on('click', function(e) {
            e.preventDefault();
            if (table.data.length >= R.CONST.CONFIG_GROUP_URL_NUMBER) {
                showMsg(_('最多只能添加%s条网址', [R.CONST.CONFIG_GROUP_URL_NUMBER]));
                return;
            }
            if (!$.validate({wrapElem: '#table-oprate'}).check()) return;
            var data = new AutoCollect('#table-oprate').getJson();
            
            if ($.inArray(data.urlString, G_data.urlGroup) > -1) {
                showMsg(_('该网址已经存在于列表中'));
                return;
            }
            
            //$('#table-oprate')[0].reset();
            $('#table-oprate [name="urlString"]').val('');
            $('#table-oprate [name="urlRemark"]').val('');
            showSaveMsg(_("请稍候..."));
            $.GetSetData.setData('/w20e/goform/setUrl', data, function(res) {
                showSaveMsg(_("保存成功"), 1000);
                getUrlListByName($('#table-oprate [name="urlGroupName"]').val(), 'user');
            });
        });

        $('#addGroup-save').on('click', function(e) {
            e.preventDefault();
            
            if (!$.validate({wrapElem: '#addGroup-modal'}).check()) return;

            var data = new AutoCollect('#addGroup-modal').getJson();

            if ($.inArray(data.urlGroupName, G_data.userGroupNames) > -1) {
                showMsg('用户网址组名称不能重复');
                return;
            }

            showSaveMsg(_("请稍候..."));
            $.GetSetData.setData('/w20e/goform/setUrlGroup', data, function(res) {
                showSaveMsg(_("保存成功"), 1000);
                $('#urlFilterGroupList').html(getUrlGroupList());
                $('#addGroup-modal').modal('hide');
            });
        });
    }

    var urlFilterView = new R.View('#urlFilterContainer', {
        fetchUrl: '/w20e/goform/getUrlFilter',
        submitUrl: '/w20e/goform/setUrlFilter',
        updateCallback: handlerFilterData,
        beforeSubmit: function() {
            showSaveMsg(_("请稍候..."));
        },  
        afterSubmit: function() {
            showSaveMsg(_("保存成功"), 1000);
        },
        events: {
            '#addRules, click': function() {
                if (G_data.urlFilterRules.length >= R.CONST.CONFIG_FILTER_URL_NUMBER) {
                    showMsg(_('网址分类过滤规则最多只能添加%s条', [R.CONST.CONFIG_FILTER_URL_NUMBER]));
                    return;
                }
                $('#urlFilter-modal').modal().find('.modal-header>span').text('新增规则').end().find('form')[0].reset();
                new AutoFill('#urlFilter-modal', {
                    urlFilterRuleIndex: G_data.urlFilterRules.length,
                    urlFilterMode: 'white'
                });
            },
            '#urlFilterContainer, click, .edit': function() {
                $('#urlFilter-modal').modal().find('.modal-header>span').text('编辑规则').end().find('form')[0].reset();
                var index = $(this).parents('tr').find('[tindex]').attr('tindex');
                var data = G_data.urlFilterRules[index];
                data.urlFilterRuleIndex = index;
                new AutoFill('#urlFilter-modal', data);
                initUrlList(data.urlFilterGroups);
            },
            '#urlFilter-save, click': function() {
                urlFilterView.submit();
            },
            '#delRules, click': function() {
                var selected = tableSelectEvent.getSelectedItems();
                if (selected.length < 1) {
                    showMsg('请选择要删除的条目！');
                    return;
                }
                showConfirm.call(this, "确认删除吗？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/delUrlFilterRules', {
                        urlFilterRuleIndex: selected.join('\t')
                    }, function(res) {
                        showSaveMsg(_("删除成功"), 1000);
                        urlFilterView.update(false);
                        $('#urlFilterGroupList').html(getUrlGroupList());
                    });
                });
            },
            '#urlFilterContainer, click, .disable': function() {
                $.GetSetData.setData('/w20e/goform/switchUrlFilterRule', {
                    urlFilterRuleIndex: $(this).parents('tr').find('[tindex]').attr('tindex'),
                    urlFilterRuleEn: false
                }, function() {
                    urlFilterView.update(false);
                    $('#urlFilterGroupList').html(getUrlGroupList());
                });
            },
            '#urlFilterContainer, click, .enable': function() {
                $.GetSetData.setData('/w20e/goform/switchUrlFilterRule', {
                    urlFilterRuleIndex: $(this).parents('tr').find('[tindex]').attr('tindex'),
                    urlFilterRuleEn: true
                }, function() {
                    urlFilterView.update(false);
                    $('#urlFilterGroupList').html(getUrlGroupList());
                });
            },
            '#urlFilterContainer, click, .delete': function() {
                showConfirm.call(this, "确认删除吗？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/delUrlFilterRules', {
                        urlFilterRuleIndex: $(this).parents('tr').find('[tindex]').attr('tindex')
                    }, function() {
                        showSaveMsg(_("删除成功"), 1000);
                        urlFilterView.update(false);
                        $('#urlFilterGroupList').html(getUrlGroupList());
                    });
                });
            },
            '#urlFilterContainer, click, input[name=urlFilterEn]': function() {
                toggleArea($('#urlFilterSetting'), $(this).val() === "true" ? true : false);
            }
        }
    });


    initEvent();
});
