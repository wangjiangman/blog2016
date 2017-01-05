$(function() {
    var G_data = {},
        ws = "#userArea",//最外包裹着表，编辑框，添加框的包裹元素选择器
        $ws = $(ws),
        filterStr = "";//过滤字符串

    /****************  列表  *************************/
    var authTableSelectEvent = new TableSelectEvent($("#userlistWrap")).init();

    //处理基本数据，组成表格需要的数据形式
    function handUserData(data) {
        var userInfo =  [],
            ruleData = {},
            time,
            onlineState,
            rule;


        for (var i = 0; i < data.length; i++) {
            ruleData = data[i];
            rule = {};
            if (ruleData.currentststus == 0) {
                onlineState = "离线";
            } else if (ruleData.currentststus == 1) {
                onlineState = '<span class="text-success">' + "在线" + '</span>';
            } else if (ruleData.currentststus == 2) {
                onlineState = '<span class="text-success">' + "等待升级" + '</span>';
            } else if (ruleData.currentststus == 3) {
                onlineState = '<span class="text-success">' + "接收固件" + '</span>';
            } else if (ruleData.currentststus == 4) {
                onlineState = '<span class="text-success">' + "升级中" + '</span>';
            } else if (ruleData.currentststus == 5) {
                onlineState = '<span class="text-success" title="' + "升级成功，设备正在重启" + '">' + "升级成功" + '</span>';
            } else if (ruleData.currentststus == 6) {
                onlineState = '<span class="text-error">' + "升级失败" + '</span>';
            }
            time = parseInt(ruleData.linkTime);
            time = parseInt(time / 86400) + "天" +
                ((parseInt(time % 86400 / 3600) + 100) + "").slice(1) + ":" +
                ((parseInt(time % 3600 / 60) + 100) + "").slice(1) + ":" +
                ((time % 60 + 100) + "").slice(1);

            rule.checkbox = '<input type="checkbox" tindex="' + i + '" name="webAuthUserID" value="' + (i + 1) + '">';

            rule.staName = ruleData.staName;
            rule.ipAddr = (ruleData.ipAddr == '0.0.0.0') ? _("未知") : data[i].ipAddr;
            rule.macAddr = ruleData.macAddr.toUpperCase();
            rule.sigStrength = ruleData.sigStrength;
            rule.linkTime = time;
            rule.currentststus = onlineState;
            
            userInfo.push(rule);
        };

        return {userList: userInfo};
    }

    //过滤数据
    function filterData(data, filterStr) {
        if (!filterStr) return data;

        var dataList = data.userList,
            filterDataList = [],
            rowObj = null;
        
        for (var i = 0; i < dataList.length; i++) {

            if ((dataList[i].staName + dataList[i].ipAddr + dataList[i].macAddr).indexOf(filterStr) != -1) {
                rowObj = $.extend(true, {}, dataList[i]);

                rowObj.staName = rowObj.staName.replace(filterStr, '<span class="text-danger">'+ filterStr +'</span>');
                rowObj.ipAddr = rowObj.ipAddr.replace(filterStr, '<span class="text-danger">'+ filterStr +'</span>');
                rowObj.macAddr = rowObj.macAddr.replace(filterStr, '<span class="text-danger">'+ filterStr +'</span>');

                filterDataList.push(rowObj);
            }

        };

        return {userList: filterDataList};
    }

    var mainView = new R.View($ws, {
        fetchUrl: '/w20e/goform/getStaState',
        updateCallback: function(data) {
            G_data.list = data.staInfo;
            $("#onlineCount").html(data.onlineCount);
            return filterData(handUserData(data.staInfo), $("#searchTxt").val());
        },
        events: (function() {
            var et = {};
            //搜索
            function search() {

                mainView.defaults.originData = filterData(handUserData(G_data.list), $("#searchTxt").val());
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

            et[ws + ' .export, click'] = function() {
                showConfirm.call(this, "确认导出用户信息？", function() {
                    $.GetSetData.setData('/w20e/goform/handleStaInfo', {language:"cn"}, function(req) {
                        if (req == 'error' || req == 'fail') {
                            showMsg(_("导出日志出错"));
                        } else {
                            window.location = req;
                        }
                    });
                });

            };

            $("#refresh").on("click", function() {
                mainView.update();
                showMsg(MSG.dataUpOk);
            });

            return et;
        })()
    });
})