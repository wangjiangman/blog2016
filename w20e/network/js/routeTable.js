(function(window, $) {

    var G_data = {};
    var G_edit_index = -1;

    var wanMsg = {
        "WAN1":"WAN1",
        "WAN2":"WAN2",
        "WAN3":"WAN3",
        "WAN4":"WAN4"
    };

    $('[name="staticRouteWAN"]').parent().hide();
    if(top.WAN_NUMBER) {
        $('[name="staticRouteWAN"]:lt('+top.WAN_NUMBER+')').parent().show();
    }

    function handler(data) {
        var index, res,
            len = data.staticRoute.length;

        for(var i = 0; i < len; i++) {
            data.staticRoute[i].staticRouteWAN = wanMsg[data.staticRoute[i].staticRouteWAN];
        }

        for(var k = 0; k < data.routingTable.length; k++) {
            if(wanMsg[data.routingTable[k].routingTableWAN]) {
                data.routingTable[k].routingTableWAN = wanMsg[data.routingTable[k].routingTableWAN];
            }
        }

        G_data = data;
        res = data;
        res.staticRoute = new TableData(data.staticRoute, ['<div class="operate"><span class="edit"></span><span class="delete"></span></div>']).get();
        return res;
    }

    var routeTableView = new R.View("#routeTableContainer", {
        fetchUrl: '/w20e/goform/getRoutingTable',
        updateCallback: handler,
        events:{
            //add
            '#addRouterGroup,click':function() {
                var len = G_data.staticRoute.length;
                Debug.log("len = "+len);
                if(len < R.CONST.CONFIG_MAX_STATIC_ROUTE_NUM){
                    $('#routetable-modal').modal();
                    G_edit_index = -1;
                    $("#modalTitle").text(_("新增静态路由"));
                    new AutoFill('#routetable-modal', {staticRouteIndex: len});
                    $('#routetable-modal form')[0].reset();
                }else{
                    showMsg("提示：不能添加超过"+R.CONST.CONFIG_MAX_STATIC_ROUTE_NUM+"条规则");
                }
            },

            //edit
            '#routeTableContainer, click, .edit': function() {
                $('#routetable-modal').modal();
                $("#modalTitle").text(_("修改静态路由"));
                G_edit_index = $(this).parents('tr')[0].rowIndex - 1;
                var data = routeTableView.defaults.originData.staticRoute[G_edit_index];
                
                //将原有数据显示在模态框上
                var transData={};
                transData = data;
                var wanData = {
                    "WAN0": "wan1",
                    "WAN1": "wan2",
                    "WAN2": "wan3",
                    "WAN3": "wan4"
                }
                transData.staticRouteWAN = wanData[data.staticRouteWAN];
                transData.staticRouteIndex = G_edit_index;
                dialogView.update(transData);
            },

            //delete
            '#routeTableContainer, click, .delete': function() {
                var index = $(this).parents('tr')[0].rowIndex - 1;
                showConfirm.call(this, "确认删除吗？", function() {
                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData('/w20e/goform/delStaticRoute',{staticRouteIndex:index},function(res) {
                        routeTableView.update(true);
                        showSaveMsg('删除成功！', 1000);
                    });
                });
            }
        }
    });
    
    function ipAndMask(str1, str2) {
        var ip = []; 
        ip = str1.split(".");
        var mask = [];
        mask = str2.split('.');
        var result = [];
        if((ip.length !== 4) || (mask.length !== 4)) {
            return false;
        }
        for(var i = 0; i < 4; i++) {
            result.push(ip[i] & mask[i]);
        }

        return result.join(".");
    }

    var dialogView = new R.FormView('#routetable-modal form');
    dialogView.beforeSubmit = function(res) {
        var wanIndex ;
        var IPMACs = [];

        for (var i = G_data.staticRoute.length - 1; i >= 0; i--) {
            if(((G_edit_index !== -1) && (G_edit_index !== i)) || (G_edit_index === -1)) {
                IPMACs.push(ipAndMask(G_data.staticRoute[i].staticRouteNet,G_data.staticRoute[i].staticRouteMask));
            }
        };
        for (var i = G_data.routingTable.length - 1; i >= 0; i--) {
            IPMACs.push(ipAndMask(G_data.routingTable[i].routingTableNet,G_data.routingTable[i].routingTableMask));
        };

        if($.inArray(ipAndMask(res.staticRouteNet,res.staticRouteMask), IPMACs) >= 0) {
            showMsg(_("不能添加重复的静态路由规则！"));
            return false;
        }

        if($("input[type='radio']:checked").val() === "wan1") {
            wanIndex = 0;
        } else if($("input[type='radio']:checked").val() === "wan2"){
            wanIndex = 1;
        } else if($("input[type='radio']:checked").val() === "wan3"){
            wanIndex = 2;
        } else if($("input[type='radio']:checked").val() === "wan4"){
            wanIndex = 3;
        }
        
        if(!gatewaySegmentCheck(res.staticRouteGateway,wanIndex)) {
            showMsg(_("网关与对应的接口IP不在同一网段。"));
            return false;
        }

        showSaveMsg(_("请稍候..."));
    }

    dialogView.afterSubmit = function(res) {
        $('#routetable-modal').modal("hide");
        showSaveMsg(_("保存成功！"), 1000);
        routeTableView.update(true);
    };

    function changeRoute() {
        var routeArray = [];
        var maskArray = [];
        var str = "";
        var routeStr = $('[name="staticRouteNet"]').val();
        var maskStr = $('[name="staticRouteMask"]').val();
        

        if((routeStr !== "") && (maskStr !== "")) {
            Debug.log(" begin change  route");
            maskArray = maskStr.split(".");
            routeArray = routeStr.split(".");
            if((maskArray.length == 4) && (routeArray.length == 4)) {
                for(var index = 0 ; index < 4 ; index++)
                {
                    str += (maskArray[index] & routeArray[index]);
                    if(index != 3) {
                         str += '.';
                    }
                }
                $('[name="staticRouteNet"]').val(str);
            }
        }
    }
    $('[name="staticRouteNet"]').blur(changeRoute);
    $('[name="staticRouteMask"]').blur(changeRoute);

    //route check
    $("#staticRouteNet").addCheck({
        "type":"routeCheck"
    });
    //判断合法route
    $.valid.routeCheck = {
        all: function (str) {
            var ret = this.specific(str);
            
            if (ret) {
                return ret;
            }
            
            if(!(/^([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/).test(str)) {
                return "请输入正确格式的网段或者IP地址";
            }
        },
        
        specific: function (str) {
            var ipArr = str.split('.'),
                ipHead = ipArr[0];
            
            if(ipArr[0] === '127') {
                return "以127开始的地址为保留的环回地址，请指定一个1到223之间的值。";
            }
            if (ipArr[0] > 223) {
                return _("以%s开始的地址无效，请指定一个1到223之间的值。", [ipArr[0]]);
            }
        }
    };

    //判断网关与对于接口是否同一网段
    function gatewaySegmentCheck(inputIP,wanIndex) {
        var res1 = [],
            res2 = []; 
        var wanIP = G_data.wan[wanIndex].wanIP;
        var mask =  G_data.wan[wanIndex].wanMask;

        inputIP = inputIP.split(".");
        wanIP = wanIP.split(".");
        mask  = mask.split(".");

        for(var i = 0,len = inputIP.length; i < len ; i += 1){
            res1.push(parseInt(inputIP[i]) & parseInt(mask[i]));
            res2.push(parseInt(wanIP[i]) & parseInt(mask[i]));
        }

        if(res1.join(".") !== res2.join(".")){
            return false;
        }

        return true;
    }

} (window, $));
