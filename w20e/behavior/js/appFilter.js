$(function() {

    var G_data = {
        webAppFilterRules: null,
        allowQQList: null,
        timeIPGroups: [],
		appTypeList: {}
    };
    var msg = {
        'true': '已启用',
        'false': '未启用',
        '': ''
    };
    var AppName = {
        data: {},
        set: function(data) {
            AppName.data = data;
            AppName.data[''] = '';
        },
        get: function(key) {
            var ret = AppName.data[key];
            return ret !== undefined ? ret : '未知应用';
        }
    };



    var AppList = [],
        currentShowId = 1,
        visibleListEl = null,
        qqOptEl = '<tr><td><input type="text" class="form-control controls-sm validatebox" placeholder="QQ号" name="qq" required data-options=\'[{"type": "len", "args": [5, 16]}, {"type": "num"}]\' maxlength="16"></td><td><input type="text" class="form-control controls-sm validatebox" placeholder="备注"  name="remark" data-options=\'{"type": "remarkTxt", "args": [1, 16]}\'></td><td class="qqOperate"><button class="btn btn-add btn-default control-xs">+</button> <button class="btn btn-remove btn-default control-xs">-</button></td></tr>';

    function toggleArea($ele, visible, slide) {
        slide = typeof slide === 'undefined' ? 200 : slide;
        visible === false ? $ele.slideUp(slide) : $ele.slideDown(slide);
        top.ResetHeight.resetHeight(slide);
    }

    function handleAllowQQList(data) {
        data.allowQQList = new TableData(data, ['checkbox', '<div class="operate"><span class="delete"></span></div>']).get();
        G_data.allowQQList = data.allowQQList;
        
        return data;
    }

    function getWebAppFilterList() {
        var data = null,
            ret = [];
        $.GetSetData.getDataSync('/w20e/goform/getWebAppFilterRules', function(res) {
            data = $.parseJSON(res);
        });
        $.GetSetData.getDataSync('/w20e/goform/getWebAppIdNames', function(res) {
            AppName.set($.parseJSON(res));
        });
		

        G_data.webAppFilterRules = data.slice(0).clone();
        G_data.timeIPGroups = [];
        for (var i = 0, l = data.length; i < l; i++) {
            G_data.timeIPGroups.push(data[i].timeGroupName + '\t' + data[i].IPGroupName);

            data[i].webAppFilterRuleApps = (function(index) {
                var _appId = data[index].webAppFilterRuleApps.split(','),
                    _appName = [];
                for (var j = 0, l = _appId.length; j < l; j++) {
                    _appName.push(AppName.get(_appId[j]));
                }
                return '<span title="' + _appName.join(',') + '">' + _appName.slice(0, 5).join(', ') + '</span>';
            }(i));

            data[i].operate = data[i].webAppFilterRuleEn ? '<div class="operate"><span class="disable" title="禁用"></span><span class="edit"></span><span class="delete"></span></div>' : '<div class="operate"><span class="enable" title="启用"></span><span class="edit"></span><span class="delete"></span></div>';
            data[i].webAppFilterRuleEn = msg[data[i].webAppFilterRuleEn];

        }
        return data;
    }

    function handlerFilterData(data, updateAll) {
        data.webAppFilterRules = new TableData(getWebAppFilterList(), ['checkbox']).get();
        if (updateAll !== false) {
            toggleArea($('#appFilterSetting'), data.webAppFilterEn, 0);
            toggleArea($('#qqContainer'), data.qqFilterEn, 0);
        }
        return data;
    }


    function getWebAppList() {
        $.GetSetData.getDataSync('/w20e/goform/getWebAppList', function(res) {
            AppList = $.parseJSON(res);
        });
    }

    function fillAppList() {
        var groupHtml = '',
            appsHtml = '';
		
		$.GetSetData.getDataSync('/w20e/goform/getWebAppTypeIdNames', function(res) {
			G_data.appTypeList = $.parseJSON(res);
		});
		
        for (var i = 0, l = AppList.length; i < l; i++) {
            groupHtml += '<div group-id="' + AppList[i].webAppGroupId + '"><input type="checkbox" value="' + AppList[i].webAppGroupId + '">' + AppList[i].webAppGroupName + '</div>';
            appsHtml += '<div class="group-section none" group-id="' + AppList[i].webAppGroupId + '">';
            for (var prop in AppList[i].webApps) {
				
				appsHtml += '<div class="app-type">' + G_data.appTypeList[prop] + '</div>';
				for (var j = 0, len = AppList[i].webApps[prop].length; j < len; j++) {
					appsHtml += '<label><input type="checkbox" app-id="' + AppList[i].webApps[prop][j].webAppId + '" value="' + AppList[i].webApps[prop][j].webAppId + '">' + AppList[i].webApps[prop][j].webAppName + '</label>';
				}
			}
			
            appsHtml += '</div>';
        }

        $('#webAppGroupList').html(groupHtml);
        $('#appFilterList').html(appsHtml);

        groupHtml = '';
        appsHtml = '';
        AppList = [];
    }

    function initAppList(data) {
        var arr = data.split(',');

        $('#appFilterList>.group-section').each(function(i) {
            var allTag = true;
            if ($(this).find('input').each(function() {
                if (jQuery.inArray(this.value, arr) > -1) {
                    this.checked = true;
                } else {
                    allTag = false;
                }
            }).length < 1) allTag = false;
            if (allTag) {
                $('#webAppGroupList input:eq(' + i + ')').prop('checked', true);
            }
        });
    }

    function showAppList(name, id, checked) {
        var list = $('#appFilterList')
            .find('>div')
            .addClass('none')
            .filter('[group-id="' + id + '"]')
            .removeClass('none');
        $('#webAppGroupList')
            .find('>div')
            .removeClass('active')
            .filter('[group-id="' + id + '"]')
            .addClass('active');

        visibleListEl = list.find('input:visible');
        if (checked) {
            visibleListEl.prop('checked', true);
        } else if (checked === false) {
            visibleListEl.prop('checked', false);
        }
        currentShowId = id;
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


    function initEvent() {
        $('#webAppGroupList').on('click', 'div, input', function() {
            if (this.tagName.toLocaleLowerCase() === 'input') {
                showAppList($(this).parent().text(), $(this).val(), $(this).prop('checked') ? 'checked' : false);
            } else {
                showAppList($(this).text(), $(this).find('input').val(), $(this).find('input').prop('checked') ? 'checked' : '');
                $('#webAppGroupList>div.active').removeClass('active');
                this.className = 'active';
            }
        });

        $('#selectAllList').on('click', function() {
            visibleListEl.prop('checked', true);
            $('#webAppGroupList>div.active input').prop('checked', true);
        });

        $('#reverseSelect').on('click', function() {
            var el = visibleListEl.filter(':checked');
            visibleListEl.prop('checked', true);
            el.prop('checked', false);
            if (!!el.length) {
                $('#webAppGroupList>div.active input').prop('checked', false);
            } else {
                $('#webAppGroupList>div.active input').prop('checked', true);
            }
        });

        $('#appFilterList').on('click', 'input', function() {
            var that = this;
            setTimeout(function() {
                if (!that.checked) {
                    $('#webAppGroupList>div.active input').prop('checked', false);
                } else {
                    if (!visibleListEl.filter(':not(:checked)').length) {
                        $('#webAppGroupList>div.active input').prop('checked', true);
                    }
                }
            }, 20);
        });


        $('#addQQ-modal').on('keydown', 'tr', function(e) {
            if (e.keyCode === 13) {
                e.preventDefault();
                $(this).find('button:first').click();
                $(this).next().find('input:first').focus();
            }
        });

        $('#addQQTable').on('click', 'button', function(e) {
            e.preventDefault();
            if (this.className.indexOf('btn-add') > 0) {
                var trLen = $(this).parents('tbody').find('tr').length;
                if (trLen + G_data.allowQQList.length >= R.CONST.CONFIG_FILTER_QQ_NUMBER) {
                    showMsg(_('QQ号最多只能添加%s个', [R.CONST.CONFIG_FILTER_QQ_NUMBER]));
                    return;
                } else if (trLen >= R.CONST.CONFIG_FILTER_QQ_ADD_NUMBER) {
                    showMsg(_('QQ号一次只能添加%s个', [R.CONST.CONFIG_FILTER_QQ_ADD_NUMBER]));
                    return;
                }

                var el = $(this).parents('tr');
                el.after(qqOptEl);
                $('#addQQ-modal').find('.add-tbody .validatebox').addCheck();
            } else {
                if ($('#addQQTable>tbody>tr').length < 2) return;
                $(this).parents('tr').remove();
            }
        });

        $('#addQQTable-save').on('click', function(e) {
            e.preventDefault();
            var invalid = false,
                Qqs = [];
            if (!$.validate({
                    wrapElem: '#addQQTable'
                }).check()) return;

            $(".add-tbody [name=qq]").each(function() {
                if(invalid) { return false };

                qq = this.value;
                for(var i = 0; i < G_data.allowQQList.length; i++) {
                    if(G_data.allowQQList[i].allowQQ === qq) {
                        invalid = true;
                        this.focus();
                        showMsg(_("该例外QQ号码已经存在！"));
                        return false;
                    }
                }

                if ($.inArray(qq, Qqs) >= 0) {
                    invalid = true;
                    this.focus();
                    showMsg(_("新增例外QQ号不能重复！"));
                    return false;              
                }

                Qqs.push(qq);
            });
            if (invalid) {
                return false;
            }
            var data = $('#addQQTable>tbody>tr').map(function() {
                return $(this).find('input').map(function() {
                    return this.value;
                }).get().join('\t');
            }).get().join('\n');
            showSaveMsg(_("请稍候..."));
            $.GetSetData.setData('/w20e/goform/setAllowQQs', 'allowQQList=' + encodeURIComponent(data), function(res) {
                showSaveMsg(_('保存成功！'), 1000);
                qqView.update(false);
                $('#addQQ-modal').modal('hide');
            });
        });
        $('#appFilteModal-save').on('click', function(e) {
            e.preventDefault();

            if (!$.validate({
                    wrapElem: '#webAppFilter-modal'
            }).check()) return;

            var data = new AutoCollect('#webAppFilter-modal').getJson();

            var arr = G_data.timeIPGroups.slice(0);
            arr.splice(data.webAppFilterRuleIndex, 1);
            if ($.inArray(data.timeGroupName + '\t' + data.IPGroupName, arr) > -1) {
                showMsg('该IP组与时间组组合已经被使用');
                return;
            }

            data.webAppFilterRuleApps = $('#appFilterList .group-section').map(function() {
                var res = $(this).find('input').map(function() {
                    if (this.checked) return this.value;
                }).get().join('\t');
                if (res) return res;
            }).get().join('\t');

            showSaveMsg(_("请稍候..."));
            $.GetSetData.setData('/w20e/goform/setWebAppFilterRule', data, function(res) {
                showSaveMsg(_('保存成功！'), 1000);
                webAppFilterView.update(false);
                $('#webAppFilter-modal').modal('hide');
            });
            data = null;
        });
    }


    var qqTableEvent = TableSelectEvent($('#qqContainer')).init();
    var qqView = new R.View('#qqContainer', {
        fetchUrl: '/w20e/goform/getAllowQQs',
        updateCallback: handleAllowQQList,
        events: {
            '#addQQ, click': function() {
                if (G_data.allowQQList.length >= R.CONST.CONFIG_FILTER_QQ_NUMBER) {
                    showMsg(_('QQ号最多只能添加%s个', [R.CONST.CONFIG_FILTER_QQ_NUMBER]));
                    return;
                }
                $('#addQQ-modal').modal().find('#addQQTable tbody').html(qqOptEl);
                $('#addQQ-modal').find('.add-tbody .validatebox').addCheck();
            },
            '#delQQ, click': function() {
                var selected = qqTableEvent.getSelectedItems();
                if (selected.length < 1) {
                    showMsg('请选择要删除的条目！');
                    return;
                }

                showConfirm.call(this, "确认删除吗？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/delAllowQQs', {
                        allowQQIndex: selected.join('\t')
                    }, function(res) {
                        showSaveMsg(_("删除成功！"), 1000);
                        qqView.update(false);
                    });
                });
            },
            '#qqContainer, click, .delete': function() {

                showConfirm.call(this, "确认删除吗？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/delAllowQQs', {
                        allowQQIndex: $(this).parents('tr').find('[tindex]').attr('tindex')
                    }, function(res) {
                        showSaveMsg(_("删除成功！"), 1000);
                        qqView.update(false);
                    });
                });
            }
        }
    });


    var appTableEvent = TableSelectEvent($('#webAppFilterContainer')).init();
    var webAppFilterView = new R.View('#webAppFilterContainer', {
        fetchUrl: '/w20e/goform/getWebAppFilter',
        submitUrl: '/w20e/goform/setWebAppFilter',
        updateCallback: handlerFilterData,
        beforeSubmit: function() {
            showSaveMsg(_("请稍候..."));
        },  
        afterSubmit: function() {
            showSaveMsg(_("保存成功"), 1000);
        },
        events: {
            '#addRules, click': function() {
                if (G_data.webAppFilterRules.length >= R.CONST.CONFIG_FILTER_APP_NUMBER) {
                    showMsg(_('应用过滤规则最多只能添加%s条', [R.CONST.CONFIG_FILTER_APP_NUMBER]));
                    return;
                }

                $('#webAppFilter-modal').modal().find('.modal-header>span').text('新增规则');

                new AutoFill('#webAppFilter-modal', {
                    webAppFilterRuleIndex: G_data.webAppFilterRules.length
                });
                $('#webAppFilter-modal form')[0].reset();
                showAppList('', '1', false);
            },
            '#webAppFilterContainer, click, .edit': function() {
                $('#webAppFilter-modal').modal().find('.modal-header>span').text('编辑规则');
                var index = $(this).parents('tr').find('[tindex]').attr('tindex');
                var data = G_data.webAppFilterRules[index];
                data.webAppFilterRuleIndex = index;
                $('#webAppFilter-modal form')[0].reset();
                new AutoFill('#webAppFilter-modal', data);

                showAppList('', '1', false);
                initAppList(G_data.webAppFilterRules[index].webAppFilterRuleApps);
            },
            '#appFilter-save, click': function() {
                webAppFilterView.submit();
            },
            '#delRules, click': function() {
                var selected = appTableEvent.getSelectedItems();
                if (selected.length < 1) {
                    showMsg('请选择要删除的条目！');
                    return;
                }
                showConfirm.call(this, "确认删除吗？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/delWebAppFilterRules', {
                        webAppFilterRuleIndex: selected.join('\t')
                    }, function(res) {
                        showSaveMsg(_("删除成功！"), 1000);
                        webAppFilterView.update(false);
                    });
                });
            },
            '#webAppFilterContainer, click, .enable': function() {
                $.GetSetData.setData('/w20e/goform/switchWebAppFilterRule', {
                    webAppFilterRuleIndex: $(this).parents('tr').find('[tindex]').attr('tindex'),
                    webAppFilterRuleEn: true
                }, function() {
                    webAppFilterView.update(false);
                });
            },
            '#webAppFilterContainer, click, .disable': function() {
                $.GetSetData.setData('/w20e/goform/switchWebAppFilterRule', {
                    webAppFilterRuleIndex: $(this).parents('tr').find('[tindex]').attr('tindex'),
                    webAppFilterRuleEn: false
                }, function() {
                    webAppFilterView.update(false);
                });
            },
            '#webAppFilterContainer, click, .delete': function() {
                showConfirm.call(this, "确认删除吗？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/delWebAppFilterRules', {
                        webAppFilterRuleIndex: $(this).parents('tr').find('[tindex]').attr('tindex')
                    }, function() {
                        showSaveMsg(_("删除成功！"), 1000);
                        webAppFilterView.update(false);
                    });
                });
            },
            'body, click, input[name=webAppFilterEn]': function() {
                toggleArea($('#appFilterSetting'), $(this).val() === "true" ? true : false);
            },
            'body, click, input[name=qqFilterEn]': function() {
                toggleArea($('#qqContainer'), $(this).val() === "true" ? true : false);
            }
        }
    });

    initEvent();
    getWebAppList();
    fillAppList();

    $('#webAppGroupList>div:first').addClass('active');
    $('#webAppFilter-modal [name="IPGroupName"]').html(getIPGroupList());
    $('#webAppFilter-modal [name="timeGroupName"]').html(getTimeGroupList());
});
