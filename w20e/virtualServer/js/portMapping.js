(function(window, $) {

    var G_data = {};
    var modal_flag = 1; // 1 add; 2 modify;
    var modify_index = -1;
    var Msg = {
        "true":"已启用",
        "false":"未启用",
        "ALL":0,
        "TCP":1,
        "UDP":2,
        "WAN0":0,
        "WAN1":1,
        "WAN2":2,
        "WAN3":3
    };

    $('[name="portMappingWan"]').parent().hide();
    if(top.WAN_NUMBER) {
        $('[name="portMappingWan"]:lt('+top.WAN_NUMBER+')').parent().show();
    }

    function handlerMappingData(data) {
        G_data = data;

        var index;
        var len = data.portMapping.length;
        var wanMsg = {
            "WAN1":"WAN1",
            "WAN2":"WAN2",
            "WAN3":"WAN3",
            "WAN4":"WAN4"
        };
        data.portMapping = new TableData(data.portMapping, ['checkbox']).get();
        for(index = 0 ; index < len ; index++){
            if(data.portMapping[index].portMappingEn === true){
                data.portMapping[index]['operate'] = '<div class="operate"><span class="disable"></span><span class="edit"></span><span class="delete"></span></div>';
            } else {
                data.portMapping[index]['operate']='<div class="operate"><span class="enable"></span><span class="edit"></span><span class="delete"></span></div>';
            }
            data.portMapping[index]["portMappingWan"] = wanMsg[data.portMapping[index]["portMappingWan"]];
            data.portMapping[index]["portMappingEn"] = Msg[data.portMapping[index].portMappingEn];
        }

        return data;
    }

    var portMappingTableSelect = new TableSelectEvent($("#portMappingContainer")).init();
    var portMappingView = new R.View("#portMappingContainer", {
        fetchUrl: '/w20e/goform/getPortMapping',
        updateCallback: handlerMappingData,
        events:{
            //add
            '#addPortFilter, click':function() {
                var len = G_data.portMapping.length;

                if(len < R.CONST.CONFIG_MAX_PORT_MAP_NUM){
                    $('#portmap-modal').modal();
                    modal_flag = 1;
                    $("#popTitle").text("新增过滤规则");
                    new AutoFill('#portmap-modal', {portMappingIndex: len});
                    $('#portmap-modal form')[0].reset();
                }else{
                    showMsg(_("提示：不能添加超过"+R.CONST.CONFIG_MAX_PORT_MAP_NUM+"条规则"));
                }
            },

            //edit
            '#portMappingContainer, click, .edit': function() {
                $('#portmap-modal').modal();
                var index = $(this).parents('tr').find('[tindex]').attr('tindex');
                modal_flag = 2;
                $("#popTitle").text("修改过滤规则");
                modify_index = parseInt(index);
                var data = portMappingView.defaults.originData.portMapping[index];
                
                //将原有数据显示在模态框上
                var transData={};
                transData.portMappingServer = data.portMappingServer;
                transData.innerPortUpstream = data.porMappingtInternal.split("-")[0];
                transData.innerPortDownstream = data.porMappingtInternal.split("-")[1];
                transData.outerPortUpstream = data.portMappingExternal.split("-")[0];
                transData.outerPortDownstream = data.portMappingExternal.split("-")[1];
                transData.portMappingProtocol = Msg[data.portMappingProtocol];
                transData.portMappingWan = Msg[data.portMappingWan];
                transData.portMappingIndex = index;

                dialogView.update(transData);
            },

            //enable
            '#portMappingContainer, click, .enable': function() {
                var index = $(this).parents('tr').find('[tindex]').attr('tindex');

                $(this).removeClass("enable").addClass("disable");
                $.GetSetData.setData('/w20e/goform/switchPortMapping', {
                    portMappingIndex: index, 
                    portMappingEn: true
                }, function() {
                    portMappingView.update(true);
                });
            },

            //disable
            '#portMappingContainer, click, .disable': function() {
                var index = $(this).parents('tr').find('[tindex]').attr('tindex');

                $(this).removeClass("disable").addClass("enable");
                $.GetSetData.setData('/w20e/goform/switchPortMapping',{
                    portMappingIndex: index, 
                    portMappingEn: false
                }, function() {
                    portMappingView.update(true);
                });
            },

            //delete single click
            '#portMappingContainer, click, .delete': function() {
                var index = $(this).parents('tr').find('[tindex]').attr('tindex');
                showConfirm.call(this, "确认删除吗？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/delPortMapping', {
                        portMappingIndex:index
                    }, function() {
                        portMappingView.update(true);
                        showSaveMsg(_("删除成功！"), 1000);
                    });
                });
            },

            //delete button click
            '#delPortFilter, click':function(){
                var selected = portMappingTableSelect.getSelectedItems();
                if(selected.length < 1) {
                    showMsg(_("请选择要删除的条目！"));
                    return;
                }
                showConfirm.call(this, "确认删除吗？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/delPortMapping', { 
                        portMappingIndex:selected.join(',')
                    }, function() {
                        portMappingView.update(true);
                        showSaveMsg(_("删除成功！"), 1000);
                    });
                });
                
            }
        }
    });
    
    var dialogView = new R.FormView('#portmap-modal form');
    dialogView.beforeSubmit = function(data) {
        var i;
        var portMap = G_data.portMapping;
        for(i = 0 , len = portMap.length; i < len ; i++){
            if(portMap[i].portMappingServer === data.portMappingServer) {
                //修改时，不判断与本项冲突的情况
                if((modal_flag === 2) && (modify_index === i)) {
                    continue;
                }

                //内网主机IP相同时，不能添加已添加过的外部端口号
                if ((parseInt(data.outerPortDownstream) < parseInt(portMap[i].portMappingExternal.split("-")[0])) ||
                (parseInt(data.outerPortUpstream) > parseInt(portMap[i].portMappingExternal.split("-")[1]))) {
                    continue;
                } else {
                    showMsg(_("添加的外网端口号与已添加的冲突！"));
                    return false;
                }
            }
        }

        if(($("#inner0").val() === "") || ($("#inner1").val() === "") || ($("#outer0").val() === "") || ($("#outer1").val() === "")) {
            showMsg(_("端口号输入不能为空！"));
            return false;
        }

        data.porMappingtInternal = data.innerPortUpstream+'-'+data.innerPortDownstream;
        data.portMappingExternal = data.outerPortUpstream+'-'+data.outerPortDownstream;

        showSaveMsg(_("请稍候..."));
        return data;
    };

    dialogView.afterSubmit = function() {
        showSaveMsg(_("保存成功！"), 1000);
        $('#portmap-modal').modal("hide");
        modal_flag = 1;
        portMappingView.update(true);
    };

    $("#portMappingServer").addCheck([
        {"type": "ip"},
        {"type": "netSegmentCheck"}
    ]);
    //判断输入IP地址与lanIP是否在同一个网段
    $.valid.netSegmentCheck = {
        all: function(inputIP) {
            var res1 = [],
                res2 = []; 
            var lanIP = G_data.lanIP;
            var mask = G_data.lanMask;

            if(lanIP === inputIP) {
                return "不能与LAN口IP相同";
            }

            inputIP = inputIP.split(".");
            lanIP = lanIP.split(".");
            mask  = mask.split(".");

            for(var i = 0,len = inputIP.length; i < len ; i += 1){
                res1.push(parseInt(inputIP[i]) & parseInt(mask[i]));
                res2.push(parseInt(lanIP[i]) & parseInt(mask[i]));
            }
            if((res1.length !== 4) || (res2.length !== 4))
            {
                //necessary.传递给type ip验证
            } else if(res1.join(".") !== res2.join(".")){
                return "与LAN口IP不在同一个网段";
            }
        }
    };
       //判断端口输入的有效性
    $.combineValid.innerPortCheck = function(inner0, inner1) {

        if((inner0 === "") || (inner1 === "")) {
                //未填满时不提示
        } else {
            inner0 = parseInt(inner0,10);
            inner1 = parseInt(inner1,10);
            if(inner0 > inner1) {
                return "起始端口不能大于结束端口";
            }
        }
    };

    //判断端口输入的有效性
    $.combineValid.portCheck = function(inner0, inner1, outer0, outer1, msg) {

        if((inner0 === "") || (inner1 === "") || (outer0 === "") || (outer1 === "")) {
                //未填满时不提示
        } else {
            inner0 = parseInt(inner0,10);
            inner1 = parseInt(inner1,10);
            outer0 = parseInt(outer0,10);
            outer1 = parseInt(outer1,10);
            if(inner0 > inner1) {
                // return "起始端口不能大于结束端口";
            } else if (inner0 === inner1) {
                if(outer0 !== outer1){
                    return "单端口映射：外网起始端口和结束端口需一致";
                }
            }
        }
    };

    function autoFillOuterPort() {
        var innerPort1 = $("[name='innerPortUpstream']").val();
        var innerPort2 = $("[name='innerPortDownstream']").val();

        if((innerPort1 != "") && (innerPort2 != "") && (innerPort1 != innerPort2)) {
            $("[name='outerPortUpstream']").val(innerPort1);
            $("[name='outerPortDownstream']").val(innerPort2);
            $("[name='outerPortUpstream']").attr("readOnly",true);
            $("[name='outerPortDownstream']").attr("readOnly",true);
        } else {
            $("[name='outerPortUpstream']").attr("readOnly",false);
            $("[name='outerPortDownstream']").attr("readOnly",false);
        }
    }

    $('[name="innerPortUpstream"]').blur(autoFillOuterPort);
    $('[name="innerPortDownstream"]').blur(autoFillOuterPort);

} (window, $));
