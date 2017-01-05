var msg = {
    'true': '已启用',
    'false': '未启用',
    'private': '独享',
    'share': '共享',
    '': ''
};

var G_data = {
	qosList: null,
    timeIPGroups: []
};


var qosTableSelectEvent = new TableSelectEvent($('#qosContainer')).init();

var qosFormView = new R.FormView('#qosModal form', {
    beforeSubmit: function(data) {
        var arr = G_data.timeIPGroups.slice(0);
        arr.splice(data.qosListIndex, 1);
        if ($.inArray(data.qosListTimeGroupRemark + '\t' + data.qosListIPGroupRemark, arr) > -1) {
            showMsg('该IP组与时间组组合已经被使用');
            return false;
        }
        showSaveMsg(_("请稍候..."));
    },
    afterSubmit: function(res) {
    	showSaveMsg(_('保存成功！'), 1000);
        $('#qosModal').modal('hide');
        qosView.update(false);
    }
});


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

function toggleArea($ele, visible, slide) {
    slide = typeof slide === 'undefined' ? 200 : slide;
    visible === false ? $ele.slideUp(slide) : $ele.slideDown(slide);top.ResetHeight.resetHeight(slide);
}

var qosView = new R.View('#qosContainer', {
    fetchUrl: '/w20e/goform/getQos',
    submitUrl: '/w20e/goform/setQos',
    updateCallback: function(data, updateAll) {
        var ret = [],
            qoslist = data.qos.qosList;
            G_data.qosList = qoslist;

        if (updateAll !== false) {
            toggleArea($('#userSetting'), data.qos.qosPolicy === 'user' ? true : false, 0);
        }
        G_data.timeIPGroups = [];
        for (var i = 0, l = qoslist.length; i < l; i++) {
            G_data.timeIPGroups.push(qoslist[i].qosListTimeGroupRemark + '\t' + qoslist[i].qosListIPGroupRemark);
            ret.push({
                checkbox: '<input type="checkbox" tindex="' + i + '">',
                qosListIPGroupRemark: qoslist[i].qosListIPGroupRemark,
                qosListTimeGroupRemark: qoslist[i].qosListTimeGroupRemark,
                qosListConnecttedNum: qoslist[i].qosListConnecttedNum,
                qosListMode: msg[qoslist[i].qosListMode],
                qosListUpstream: qoslist[i].qosListUpstream + 'KB/s',
                qosListDownstream: qoslist[i].qosListDownstream + 'KB/s',
                qosListEn: msg[qoslist[i].qosListEn],
                operate: qoslist[i].qosListEn ? '<div class="operate"><span class="disable" title="禁用"></span><span class="edit"></span><span class="delete"></span></div>' : '<div class="operate"><span class="enable" title="启用"></span><span class="edit"></span><span class="delete"></span></div>'
            });
        }
        data.qos.qosList = ret;
        return data;
    },
    beforeSubmit: function() {
        showSaveMsg(_("请稍候..."));
    },  
    afterSubmit: function() {
        showSaveMsg(_("保存成功"), 1000);
    },
    events: {
    	'#addRules, click': function() {
    	    if (G_data.qosList.length >= R.CONST.CONFIG_QOS_RULE_NUMBER) {
    	        showMsg(_('流量控制规则最多只能添加%s条', [R.CONST.CONFIG_QOS_RULE_NUMBER]));
    	        return;
    	    }
    	    $('#qosModal').modal().find('.modal-header>span').text('新增规则');
    	    qosFormView.reset({qosListIndex: G_data.qosList.length});
    	},
    	'#qosContainer, click, .edit': function() {
    	    $('#qosModal').modal().find('.modal-header>span').text('编辑规则');
    	    var index = $(this).parents('tr').find('[tindex]').attr('tindex');
    	    var data = G_data.qosList[index];
    	    data.qosListIndex = index;
    	    qosFormView.update(data);
    	},
    	'#qosContainer, click, input[name=qosPolicy]': function() {
            toggleArea($('#userSetting'), $(this).val() === 'user' ? true : false);
        },

    	'#qosSave, click': function() {
    	    qosView.submit();
    	},
    	'#delRules, click': function() {
    	    var selected = qosTableSelectEvent.getSelectedItems();
    	    if (selected.length < 1) {
    	        showMsg('请选择要删除的条目！');
    	        return;
    	    }
            showConfirm.call(this, "确认删除吗？", function() {
                showSaveMsg(_("请稍候..."));
        	    $.GetSetData.setData('/w20e/goform/delQos', {
        	        qosIndex: selected.join('\t')
        	    }, function(res) {
                    showSaveMsg(_("删除成功！"), 1000);
        	        qosView.update(false);
                });
    	    });
    	},
    	'#qosContainer, click, .enable': function() {
    	    $.GetSetData.setData('/w20e/goform/switchQos', {
    	        qosIndex: $(this).parents('tr').find('[tindex]').attr('tindex'),
    	        qosOp: 'enable'
    	    }, function() {
    	        qosView.update(false);
    	    });
    	},
    	'#qosContainer, click, .disable': function() {
    	    $.GetSetData.setData('/w20e/goform/switchQos', {
    	        qosIndex: $(this).parents('tr').find('[tindex]').attr('tindex'),
    	        qosOp: 'disable'
    	    }, function() {
    	        qosView.update(false);
    	    });
    	},
    	'#qosContainer, click, .delete': function() {
            showConfirm.call(this, "确认删除吗？", function() {
                showSaveMsg(_("请稍候..."));
        	    $.GetSetData.setData('/w20e/goform/delQos', {
        	        qosIndex: $(this).parents('tr').find('[tindex]').attr('tindex')
        	    }, function() {
                    showSaveMsg(_("删除成功！"), 1000);
        	        qosView.update();
                });
    	    });
    	}
    }
});

$('#qosModal select#IPGroupName').html(getIPGroupList());
$('#qosModal select#timeGroupName').html(getTimeGroupList());
