define(function (require, exports, module) {

    /* model 数据 */
    var model = new Model();

    model.extendModels({
        //拿上级ssid，没有则说明没扩展
        "isFirstBridge": {
            "fetchUrl": "/a9/goform/getWizard"
        },

        //扫描列表的数据
        "wifiScan": {
            container: $("#pageScan"),
            fetchUrl: "/a9/goform/getWizard",
            defaultViewData: {
                "wifiScan": "scaning",
                "scanTitle": "正在扫描无线信号"
            },
            getTransfer: function (data) {
                if(!data.wifiScan) {
                    $("#signalWrap").find("ul").html('');
                    return {};
                }
                var listObj = data.wifiScan.sort(function (a, b) {
                    if (parseInt(a.wifiScanSignalStrength, 10) > parseInt(b.wifiScanSignalStrength, 10)) {
                        return -1;
                    } else {
                        return 1;
                    }
                });
                var viewData = {
                    wifiScan: listObj,
                    scanTitle: "请选择您需要扩展的无线信号..."
                };

                return viewData;
            }
        },

        //扩展，密码输入
        "bridge": {
            container: $("#pagePassword"),
            fetchUrl: "/a9/goform/getWifiRelay",
            submitUrl: "/a9/goform/setWifiRelay",
            defaultViewData: {
                wifiSsid: ""
                //pwdInvalid: "true"
            },
            getTransfer: function (data) {
                return data.connectInfo;
            }
        },

        //扩展结果的数据，无线名称
        "sysStatusInfo": {
            fetchUrl: "/a9/goform/getStatus",
            container: "#pageScanResult",
            defaultViewData: {
                "bridgeSts": {
                    "extended": "0",
                    "wifiRate": "-90"
                },
                "extended": "0",
                "wifiRate": "-90"
            },
            getTransfer: function (data) {
                return {
                    bridgeSts: data.sysStatusInfo
                };
            }
        },

        //无线设置
        "wifiBasic": {
            container: "#pageSsidName",
            fetchUrl: "/a9/goform/getWifi",
            submitUrl: "/a9/goform/setWifi",
            defaultViewData: {
                ssidName: ""
                //ssidInvalid: true
            },
            getTransfer: function (data) {
                data.wifiBasic.wifiPwd = (data.wifiBasic.wifiNoPwd === "true") ? "" : data.wifiBasic.wifiPwd;
                return data.wifiBasic;
            },
            setTransfer: function (data) {
                data.wifiNoPwd = ($("#wirelessPwd").val() == "") ? "true" : "false";
                return data;
            }
        },

        // 在线列表 vs 黑名单
        "userList": {
            container: "#pageUserList",
            fetchUrl: "/a9/goform/getUserList",
            submitUrl: "/a9/goform/setUserList",
            defaultViewData: {
                //ssidName: ""
                //ssidInvalid: true
            }
        }
    });

    /* viewModuel 逻辑*/
    var SpecifyViewModule = ViewModule.extend({

        //自定义视图处理widget
        customWidget: {
            "wifiScan": function (data) {
                var listStr = "";

                if (data == "scaning") {
                    $(this).find("ul").html('<li style="text-align:center; padding:20px;"><img src="/img/loading.gif" alt="" /></li>');
                    return;
                }

                var signal;
                for (var i = 0; i < data.length; i++) {
                    signal = parseInt(data[i].wifiScanSignalStrength, 10);

                    if (signal >= -60) {
                        signal = "icon-signal-4";
                    } else if (signal < -60 && signal >= -75) {
                        signal = "icon-signal-3";
                    } else {
                        signal = "icon-signal-2";
                    }

                    listStr += ('<li class="signal-item" data-ssid-index="' + i + '">' + '<span class="text-ellipsis signal-text">' + escapeText(data[i].wifiScanSSID) + '</span>' + '<i class="icon scan-icon icon-signal ' + signal + '"></i>' + (data[i].wifiScanSecurityMode == "NONE" ? "" : '<i class="icon scan-icon icon-lock"></i>') + '</li>');
                }

                $(this).removeClass("transition")
                    .css3({
                        "transform": "translateY(-150%)"
                    })
                    .find("ul").html(listStr);

                var that = this;
                setTimeout(function () {
                    $(that).addClass("transition").css3({
                        "transform": "none"
                    });
                }, 10);

            },

            "onlineList": function (data) {
                var onlineListStr = "";

                // 在线列表
                for (var i = 1; i < data.length; i++) {

                    onlineListStr += ('<li class="list-item" style="height:40px;" data-ssid-index="' + i + '">' + '<div class="text-ellipsis list-text">' + '<div class="text-ellipsis" style="height:20px;line-height: 27px;">' + escapeText(data[i].devName) + '</div><div style="height:30px;font-size:10px;color:#8A8383;line-height: 20px;">' + data[i].devIp + '</div>' + '</div>' + '<input type="button" class="user-list-icon add-to-black" value="'+_('拉黑') + '"/>' + '</li>');
                }
                $(this).removeClass("transition")
                    .css3({
                        "transform": "translateY(-150%)"
                    })
                    .find("ul").eq(0).html(onlineListStr);

                var that = this;
                setTimeout(function () {
                    $(that).addClass("transition").css3({
                        "transform": "none"
                    });
                }, 10);

            },
            "blackList": function (data) {
                var blackListStr = "";

                // 黑名单
                for (var j = 0; j < data.length; j++) {

                    blackListStr += ('<li class="list-item" data-ssid-index="' + j + '">' + '<span class="text-ellipsis list-text">' + escapeText(data[j].devName) + '</span>' + '<input type="button" class="user-list-icon delete-from-black" value="'+_('删除') + '"/>' + '</li>');
                }

                $(this).removeClass("transition")
                    .css3({
                        "transform": "translateY(-150%)"
                    })
                    .find("ul").eq(0).html(blackListStr);

                var that = this;
                setTimeout(function () {
                    $(that).addClass("transition").css3({
                        "transform": "none"
                    });
                }, 10);

            },

            //扩展中
            "bridging": function (data) {
                $(this).find(".connecting-circle").removeClass("connect-fail");

                if (data == "begin") {
                    $("#bridgingTxt").html("扩展中...");
                } else if (data == "success") {
                    $("#bridgingTxt").html("已就绪，扩展器正在配置，请稍候");
                } else if (data == "fail") {
                    $(this).find(".connecting-circle").addClass("connect-fail");
                    $(this).find("#bridgingTxt").html("扩展失败");
                } else if (data == "jumpFail") {
                    $(this).find(".connecting-circle").addClass("connect-fail");
                    $(this).find("#bridgingTxt").html("扩展成功，请使用扩展信号访问扩展器");
                }
            },

            //扩展结果视图widget
            "bridgeSts": function (data) {
                var signal;

                //是否扩展成功
                if (data.extended == "1") { //成功
                    $(this).removeClass("connected disconnected").addClass("connected");

                    $("#extended").addClass("success-status icon-y");
                    $("#wifiRate").html(translatSignal(data.wifiRate));
                    if (data.wifiRate >= -60) {
                        signal = "icon-signal4";
                    } else if (data.wifiRate < -60 && data.wifiRate > -75) {
                        signal = "icon-signal3";
                    } else {
                        signal = "icon-signal2";
                    }
                    $('#signalPic').removeClass("icon-signal2 icon-signal3 icon-signal4").addClass(signal);
                    $('#reScanBtn2').html("扩展其他信号").removeClass('btn-primary').css("color", "#5adc70");
                } else {
                    $(this).removeClass("connected disconnected").addClass("disconnected");
                    $('#reScanBtn2').html("重新扩展信号").removeClass('btn-primary').addClass('btn-primary');

                    $("#extended").addClass("error-status icon-x");
                    $("#wifiRate").removeClass('success-status').html("0%");
                    $('#signalPic').removeClass("icon-signal2 icon-signal3 icon-signal4");

                }
                $("#bridgeSsidName").html(escapeText(data.extendName));
                $("#statusOnlineNumber").html('<span class="online-num-icon">' + data.statusOnlineNumber + '</span>');
            }
        },

        initialize: function () {
            var that = this;

            this.ssidListScroll = new IScroll('#signalWrap');

            //先检查是否已经扩展过，没有的话重新扫描，有的话检查连接情况
            this.model.fetchData("isFirstBridge", {
                module1: "isFirstBridge"
            }, function (data) {
                var initPage = "";

                if (!data.isFirstBridge.isFirstBridge) {
                    initPage = "#pageScanResult";
                    that.checkBridge();
                } else {
                    initPage = "#pageScan";
                    that.updatewifiScan();
                }
                $(initPage).removeClass("none");
            });
        },

        initEvent: function () {
            var that = this,
                model = that.model,
                bridgeT = 0;

            // reScan
            $("#reScanBtn").on(click, function () {
                that.updatewifiScan();
            });

            // Modify Wifi SSID
            $("#bridgeSsidNameWrap").on(click, function () {
                that.renderForModel("wifiBasic", "fetch", function () {
                    goToPage("#pageSsidName");
                });
            });

            // Modify Wifi SSID [back]
            $("#ssidNamePrevBtn").on(click, function () {
                goToPage("#pageScanResult", "left");
                that.reset("#pageSsidName");
            });

            // Save Wifi SSID
            $("#ssidNameSave").on("click", function () {
                var wifiViewData = that.model.getViewData("wifiBasic");
                if ((wifiViewData.wifiSSID == $("#wifiSSID").val()) && (wifiViewData.wifiPwd == $("#wirelessPwd").val())) {
                    goToPage("#pageScanResult", "left");
                } else {
                    $.showConfirm("修改无线名称或密码之后，需要连接至新的无线信号，确认修改吗？", function () {
                        that.saveForModel("wifiBasic", function () {
                            goToPage("#pageScanResult", "left");
                        });
                    });
                }

            });

            // Userlist
            $("#onlineNumTxtWrap").on(click, function () {
                that.renderForModel("userList", "fetch", function () {
                    goToPage("#pageUserList");
                });
            });

            // UserList [back]
            $("#listBackBtn").on(click, function () {
                goToPage("#pageScanResult", "left");
            });

            // Delete from black list
            $('#blackWrap').on(click, '.delete-from-black', function () {
                var index = $(this).parent().attr("data-ssid-index");
                var mac = model.getViewData("userList").blackList[index].devMac;
                var subData = {
                    module1: "delFromBlackList",
                    mac: mac
                };
                that.model.saveData("userList", subData, function () {
                    goToPage("#pageScanResult", "left");
                });
            });

            // Add to black list
            $('#onlineWrap').on(click, '.add-to-black', function () {
                var index = $(this).parent().attr("data-ssid-index");
                var mac = model.getViewData("userList").onlineList[index].devMac;
                var subData = {
                    module1: "addToBlackList",
                    mac: mac
                };
                that.model.saveData("userList", subData, function () {
                    goToPage("#pageScanResult", "left");
                });
            });

            // Select wifi to scan
            $("#signalWrap").on(click, "li", function () {
                var wifiSelected = model.getViewData("wifiScan").wifiScan[parseInt($(this).data("ssid-index"))],
                    ssid = wifiSelected.wifiScanSSID,
                    wifiRate = wifiSelected.wifiScanSignalStrength;

                var subData = {
                    module1: "setExtenderWifi",
                    wifiRelaySSID: ssid || "",
                    wifiRelaySecurityMode: wifiSelected.wifiScanSecurityMode || "",
                    wifiRelayPwd: "",
                    wifiRelayChannel: wifiSelected.wifiScanChannel || "",
                    module2: "setWifiInfo",
                    wizardSSID: ssid || "",
                    wizardSSIDPwd: ""
                };

                /*if (wifiSelected.wifiScanSecurityMode == "NONE" && wifiSelected.wifiSsid != "") {

                    $.showConfirm("确定扩展？", function () {
                        that.model.saveData("bridge", subData, function () {
                            goToPage("#pageBridging");
                            that.bridge(ssid, wifiRate);
                        });
                    });

                } else */
                if (wifiSelected.wifiScanSecurityMode == "UNKNOW") {
                    $.alert("此上级信号加密方式为WEP，扩展器不支持该种加密方式");
                } else {
                    var bridgeData = $.extend({
                        wifiPwd: ""
                    }, wifiSelected);

                    if (bridgeData.wifiScanSSID) {
                        bridgeData.wifiScanSSID = escapeText(bridgeData.wifiScanSSID);
                        bridgeData.title1Show = true;
                        bridgeData.title2Show = false;
                        bridgeData.wifiSsidShow = false;
                    } else {
                        bridgeData.title1Show = false;
                        bridgeData.title2Show = true;
                        bridgeData.wifiSsidShow = true;
                    }

                    bridgeData.wifiPwdShow = (bridgeData.wifiScanSecurityMode != "NONE");

                    that.renderForModel("bridge", "default");
                    model.setData("bridge", bridgeData);

                    that.renderForModel("bridge");
                    goToPage("#pagePassword");
                }
            });

            // keep upper ssid and password
            $("#keepUpper").on("click", function() {
                var selected = $("#keepUpper").prop("checked");
                if(selected) {
                    $("#extenderInfo").addClass("none");
                } else {
                    $("#extenderInfo").removeClass("none");
                    that.model.fetchData("bridge", {
                        module1: "connectInfo"
                    }, function(data) {
                        $("#extenderSsid").val(data.extenderSsid);
                        $("#extenderPwd").val(data.extenderPwd);
                    });
                }
            });

            //Wifi password prev button
            $("#passwordPrevBtn").on(click, function () {
                that.renderForModel("wifiScan", "last");
                goToPage("#pageScan", "left");
                $("#keepUpper").prop("checked", true);
                var selected = $("#keepUpper").prop("checked");
                if(selected) {
                    $("#extenderInfo").addClass("none");
                } else {
                    $("#extenderInfo").removeClass("none");
                }
            });

            //Wifi password finish button
            $("#ssidpwdFinish").on(click, function () {
                $("input").blur();

                var container = that.model._models['bridge'].container;
                var selected = $("#keepUpper").prop("checked");
                var transObj = that.collect(container);
                var submitData = {
                    module1: "setExtenderWifi",
                    wifiRelaySSID: transObj.wifiScanSSID || $('#wifiSsid').val(),
                    wifiRelaySecurityMode: transObj.wifiScanSecurityMode || "",
                    wifiRelayPwd: transObj.wifiPwd || "",
                    wifiRelayChannel: transObj.wifiScanChannel || "",
                    module2: "setWifiInfo",
                    wizardSSID: selected?(transObj.wifiScanSSID || $('#wifiSsid').val()):transObj.extenderSsid,
                    wizardSSIDPwd: selected?(transObj.wifiPwd || ""):transObj.extenderPwd
                };

                if (container) {
                    var errMsg = that.validateObj.check($(container).find(".validatebox"));

                    //数据验证 
                    if (errMsg) {
                        $.alert(errMsg);
                        return false;
                    }
                }

                model.saveData("bridge", submitData, function () {
                    goToPage("#pageBridging");
                    that.bridge($("#pagePassword #wifiSsid").val() || $("#wifiScanSSID").text(), $("#pagePassword #wifiPwd").val());
                });

                /*that.saveForModel("bridge", function() {
					goToPage("#pageBridging");
					that.bridge($("#pagePassword [name=wifiSsid]").val(), $("#pagePassword [name=wifiRate]").val());
				});*/
            });


            //Rescan button in result page 
            $("#reScanBtn2").on(click, function () {
                goToPage("#pageScan", "left");
                that.updatewifiScan();
                that.stopCheckBridge();
            });

        },

        //更新wifiScan
        updatewifiScan: function () {
            var that = this;

            this.renderForModel("wifiScan", "default");
            this.renderForModel("wifiScan", "fetch", function () {
                that.ssidListScroll.refresh();
            });
        },

        //扩展，需要等待后台重启之后，刷新页面，因为ip变了
        bridge: function (ssid, rate) {
            var checkRebootT,
                that = this,
                checkBridgeT,
                checkBridgeGapTime = 1000, //一秒检查一次
                checkBridgeMaxTime = 27000, //持续检查27秒
                disconnectedTime = 0, //有多少次是请求到未连接，超过20次才是失败
                isConnect = false,
                ssidName = ssid,
                wifiRate = parseInt(rate, 10);


            that.render({
                "bridging": "begin"
            }, "#pageBridging");

            //轮询检查扩展状态
            setTimeout(function () {
                if (checkBridgeMaxTime <= 0) {
                    //30秒都没有连上

                    if (disconnectedTime > 20) { //收到超过20个未连接才是失败
                        that.render({
                            "bridging": "fail"
                        }, "#pageBridging");
                        setTimeout(function () {
                            goToPage("#pageScanResult");
                            that.checkBridge();
                        }, 2000);
                        clearTimeout(checkBridgeT);
                        return;
                    } else {
                        isConnect = true;
                        that.render({
                            "bridging": "success"
                        }, "#pageBridging");
                        setTimeout(function () {
                            checkReboot();
                        }, 5000);
                        clearTimeout(checkBridgeT);
                    }
                }

                $.GetSetData.getJson("/a9/goform/getStatusBeforeBridge", function (data) {
                    if (data.extended == "1") {
                        //扩展成功了，后台会有一段时间失去联系，
                        //使用jsonp检查，若30秒之后还没反应，
                        //代表虽桥上了但是信号改变，
                        isConnect = true;
                        that.render({
                            "bridging": "success"
                        }, "#pageBridging");
                        setTimeout(function () {
                            checkReboot();
                        }, 5000);
                        clearTimeout(checkBridgeT);
                        return;

                    } else {
                        disconnectedTime++;
                    }
                });
                checkBridgeMaxTime -= checkBridgeGapTime;
                checkBridgeT = setTimeout(arguments.callee, checkBridgeGapTime);
            }, 3000);

            //jsonp检测跳转
            function checkReboot() {
                var checkJsonpGapTime = 2000,
                    checkJsonpMaxTime = 2000 /*30000*/ ;

                checkRebootT = setInterval(function () {
                    if (checkJsonpMaxTime <= 0) {
                        //jsonp检测超时，但是已经乔成功了,使用传进来的ssid 和rate做一个成功的数据
                        //来 render pageResult页面
                        if (isConnect) {
                            //that.render({"bridging": "jumpFail"}, "#pageBridging");
                            goToPage("#pageScanResult", "right");
                            that.render({
                                bridgeSts: {
                                    "extended": "1",
                                    "wifiRate": wifiRate,
                                    "extendName": ssidName,
                                    "statusOnlineNumber": 0
                                }
                            }, "#pageScanResult");
                        }
                        clearInterval(checkRebootT);
                        return;
                    }

                    $.ajax({
                        type: "get",
                        url: "/a9/goform/getRebootStatus",
                        dataType: "jsonp",
                        jsonp: "callback", //传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名(一般默认为:callback)
                        jsonpCallback: "flightHandler", //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名，也可以写"?"，jQuery会自动为你处理数据
                        success: function (json) {
                            if (json.status == "success") {
                                clearInterval(checkRebootT);
                                that.render({
                                    "bridging": "success"
                                }, "#pageBridging");
                                setTimeout(function () {
                                    window.location.reload(true);
                                }, 2000);
                            }
                        }
                    });
                    checkJsonpMaxTime -= checkJsonpGapTime;
                }, checkJsonpGapTime);
            }
        },

        //扩展结果更新
        checkBridge: function () {
            var that = this;

            clearTimeout(that.bridgeT);

            //that.renderForModel("sysStatusInfo", "default");
            (function () {
                var callee = arguments.callee;
                that.renderForModel("sysStatusInfo", "fetch", function () {
                    /*if (that.model.getViewData("sysStatusInfo").sysStatusInfo != "connecting") {
						//如果不是连接中则停止检测
						clearTimeout(that.bridgeT);
						return;
					}*/
                    that.bridgeT = setTimeout(callee, 5000);
                });
            })();
        },
        stopCheckBridge: function () {
            clearTimeout(this.bridgeT);
        }

    });

    /***********信号转换函数***********/
    /*
        100%：0~-50dB
        90%：-51dB~-55dB
        80%：-56dB~-60dB
        70%：-61dB~-63dB
        60%：-64dB~-66dB
        50%：-67dB~-70dB
        40%：-71dB~-75dB
        30%：-76dB~-80dB
        20%：-81dB~-85dB
        10%：<-86dB
    */
    function translatSignal(signal) {
        var newPer = 0;
        if (signal >= -50) {
            newPer = "100%";
        } else if (signal >= -60) {
            newPer = 80 - (-60 - signal) * 2 + "%";
        } else if (signal >= -66) {
            newPer = Math.round(60 - (-66 - signal) * 10 / 3) + "%";
        } else if (signal >= -70) {
            newPer = Math.round(50 - (-70 - signal) * 2.5) + "%";
        } else if (signal >= -85) {
            newPer = 20 - (-85 - signal) * 2 + "%";
        } else {
            newPer = "10%";
        }
        return newPer;
    }


    var _module = new SpecifyViewModule("body", model);

    module.exports = _module;
});
