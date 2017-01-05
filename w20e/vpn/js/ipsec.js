$(function() {

    var G_wan;
    var wanStr = "";
    for (var i = 1; i <= top.WAN_NUMBER; i++) {
        wanStr += '<option value="WAN' + i + '">WAN' + (i - 1) + '</option>';
    }
    $("[name='IPsecWAN']").html(wanStr);

    //处理基本数据，组成表格需要的数据形式
    function handleData(data) {
        var userInfo = [],
            ruleData = {},
            rule;
        var wanMsg = {
            "WAN1": "WAN1",
            "WAN2": "WAN2",
            "WAN3": "WAN3",
            "WAN4": "WAN4"
        };

        for (var i = 0; i < data.length; i++) {
            G_data.list[i].IPsecTunnelIndex = i;
            ruleData = data[i];

            rule = {};
            rule.checkbox = '<input type="checkbox" tindex="' + i + '">';

            rule.IPsecEn = ruleData.IPsecEn == true ? "开启" : "关闭";
            rule.IPsecWAN = wanMsg[ruleData.IPsecWAN];
            rule.IPsecConnectName = ruleData.IPsecConnectName;
            rule.IPsecTunnelProtocol = ruleData.IPsecTunnelProtocol;
            rule.IPsecGateway = ruleData.IPsecGateway;
            rule.operate = '<div class="operate"><span class="edit"></span><span class="delete"></span></div>';
            userInfo.push(rule);
        };

        return {
            list: userInfo
        };
    }


    var G_data = {},
        ws = "#pageWrap",
        $ws = $(ws),
        authTableSelectEvent = new TableSelectEvent($ws).init(),
        mainView = new R.View($ws, {
            fetchUrl: '/w20e/goform/getIPsecTunnelList',
            updateCallback: function(data) {
                G_data.list = data;

                return handleData(data);
            },
            events: (function() {
                var et = {};
                //删除
                et[ws + ' .del-rule, click'] = function() {
                    var selected = authTableSelectEvent.getSelectedItems();
                    if (selected.length < 1) {
                        showMsg('请选择要删除的条目！');
                        return;
                    }

                    showConfirm.call(this, "确认删除吗？", function() {
                        showSaveMsg(_("请稍候..."));
                        $.GetSetData.setData('/w20e/goform/delIPsecTunnels', {

                            "IPsecTunnelIndex": $.map(selected, function(selectedIndex) {
                                return G_data.list[selectedIndex].IPsecTunnelIndex;
                            }).join('\t')

                        }, function(res) {
                            showSaveMsg(_("删除成功"), 1000);
                            mainView.update();
                        });
                    });
                };

                et[ws + ', click, .delete'] = function() {
                    showConfirm.call(this, "确认删除吗？", function() {
                        showSaveMsg(_("请稍候..."));
                        $.GetSetData.setData('/w20e/goform/delIPsecTunnels', {
                            "IPsecTunnelIndex": $(this).parents('tr').find(":checkbox").attr("tindex")
                        }, function() {
                            showSaveMsg(_("删除成功"), 1000);
                            mainView.update();
                        });
                    });
                }

                //修改
                et[ws + ', click, .edit'] = function() {
                    var index = $(this).parents('tr').find(":checkbox").attr("tindex");

                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.getJson("/w20e/goform/getIPsecTunnel?random=" + Math.random() + "&IPsecTunnelIndex=" + index, function(data) {
                        showSaveMsg(_("请稍候..."), 500);

                        if ($("#formWrap [name=IPsecTunnelIndex]").length == 0) {
                            $('<input type="hidden" name="IPsecTunnelIndex"/>').appendTo($("#formWrap form"));
                        }

                        $("#ipsecListWrap").addClass("none");
                        showEdit(_('编辑IPSec隧道'));

                        $("#formWrap [name=IPsecTunnelIndex]").val(index);
                        editForm.update(data);
                    });

                };

                //增加
                et[ws + ' .add-rule, click'] = function() {

                    if (G_data.list.length >= R.CONST.CONFIG_IPSEC_NUMBER) {
                        showMsg(_('IPSec隧道个数已达到上限 %s 个', [R.CONST.CONFIG_IPSEC_NUMBER]));
                        return;
                    }

                    $("#formWrap [name=IPsecTunnelIndex]").remove();
                    showEdit('新增IPSec隧道');
                    editForm.reset();
                    editViewRefresher.refreshPage();
                };

                return et;
            })()
        });
    /****************  列表 over *************************/



    /****************  弹出， 编辑View *******************/
    var editForm = new R.FormView("#formWrap form", {
        afterUpdate: function() {
            if ($("#formWrap").is(":visible"))
                editViewRefresher.refreshPage();
        },

        beforeSubmit: function() {
            return true;
        },

        afterSubmit: function(res) {
            mainView.update();
            showSaveMsg(_("保存成功"), 1000);
            $("#formWrap").hide();
        },

        events: {
            //控制视图显示隐藏的事件
            "#formWrap,click,input": function() {
                editViewRefresher.showWrapContent();
            },

            "#toggleAdv, click": function() {
                editViewRefresher.toggleAdvWrap();
            },

            "[name=IPsecNegotiation], change": function() {
                editViewRefresher.showAuthWrap();
            },

            "[name=IPsecTunnelProtocol], change": function() {
                editViewRefresher.showAuthWrap();
            },

            "[name=IPsecPFSEn], click": function() {
                editViewRefresher.showDH2();
            },

            //改变加密、认证算法时需要验证密码框
            "[name=IPsecESPEncrypt], change": function() {
                $("[name=IPsecESPEncryptPwd]").check();
            },
            "[name=IPsecESPVerify], change": function() {
                editViewRefresher.showEncryptPwd();
                $("[name=IPsecESPVerifyPwd]").check();
            },
            "[name=IPsecAHVerify], change": function() {
                $("[name=IPsecAHVerifyPwd]").check();
            },

            "#ipsec-save, click": (function() {
                var validateObj = $.validate({
                    "wrapElem": "#formWrap form"
                });

                return function() {
                    if (!validateObj.check()) {
                        showMsg(_("输入有误，请检查红色的输入框"));
                        return;
                    }

                    var submitData = (new AutoCollect("#formWrap")).getJson(),
                        IPsecTunnelIndex = submitData.IPsecTunnelIndex || "";

                    for (var i = G_data.list.length - 1; i >= 0; i--) {
                        if (IPsecTunnelIndex && IPsecTunnelIndex == G_data.list[i].IPsecTunnelIndex) {
                            //正在编辑的那条数据不必对比
                            continue;
                        }

                        if (submitData.IPsecConnectName == G_data.list[i].IPsecConnectName) {
                            showMsg(_("设置的连接名称已经存在"));
                            return;
                        }

                        if (submitData.IPsecGateway == G_data.list[i].IPsecGateway) {
                            showMsg(_("设置的远端网关地址已经存在"));
                            return;
                        }

                        if (submitData.IPsecRemoteNet == G_data.list[i].IPsecRemoteNet) {
                            showMsg(_("设置的远端内网网段/掩码的IPSec隧道已经存在！"));
                            return;
                        }
                    };

                    //如果是自动协商，不管高级选项是否隐藏都要传高级选项的数据
                    if ($("[name=IPsecNegotiation]").val() == "auto") {
                        if ($.valid.num($("[name=IPsecPwdValidity1]").val(), 600, 2147483647)) {
                            $("[name=IPsecPwdValidity1]").val(3600);
                        }

                        if ($.valid.num($("[name=IPsecPwdValidity2]").val(), 600, 2147483647)) {
                            $("[name=IPsecPwdValidity2]").val(3600);
                        }

                        $.extend(submitData, $("#advanceWrap").find('[name]').filter(':enabled, [type="hidden"], :visible.input-append').serializeJson());
                    }

                    showSaveMsg(_("请稍候..."));
                    $.GetSetData.setData("/w20e/goform/setIPsecTunnel", submitData, function() {
                        showSaveMsg(_("保存成功"), 1000);
                        mainView.update();
                        showEdit(false);
                    });
                }
            })(),

            "#ipsec-cancel, click": function() {
                showEdit(false);
            }
        }
    });

    /****************  弹出， 编辑View over*******************/

    /****************  此个对象负责刷新编辑view视图 ******************/
    var editViewRefresher = {
        slide: 200,
        showWrapContent: function() {
            if ($("[name=IPsecEn]:checked").val() == "true") {
                $("#wrapContent").slideDown(200);
            } else {
                $("#wrapContent").slideUp(200);
            }
            top.ResetHeight.resetHeight(this.slide);
        },
        refreshAdvWrap: function() {
            if ($("#toggleAdv").attr("show") == "true") {
                $("#toggleAdv").html(_("隐藏高级设置..."));
                $("#advanceWrap").slideDown(200);
            } else {
                $("#toggleAdv").html(_("显示高级设置..."));
                $("#advanceWrap").slideUp(200);
            }
            top.ResetHeight.resetHeight(this.slide);
        },
        toggleAdvWrap: function() {
            $("#toggleAdv").attr("show", $("#toggleAdv").attr("show") == "true" ? "hide" : "true");
            this.refreshAdvWrap();
            top.ResetHeight.resetHeight(this.slide);
        },
        showAuthWrap: function() {
            if ($("[name=IPsecNegotiation]").val() == "auto") {
                $("#autoWrap").slideDown(this.slide);
                $("#ahWrap, #espWrap").slideUp(this.slide);
            } else {

                $("#autoWrap").slideUp(this.slide);
                if ($("[name=IPsecTunnelProtocol]").val() == "AH") {
                    $("#espWrap").slideUp(this.slide);
                    $("#ahWrap").slideDown(this.slide);
                } else if ($("[name=IPsecTunnelProtocol]").val() == "ESP") {
                    $("#espWrap").slideDown(this.slide);
                    $("#ahWrap").slideUp(this.slide);
                } else {
                    $("#ahWrap, #espWrap").slideDown(this.slide);
                }
            }
            top.ResetHeight.resetHeight(this.slide);
        },
        showEncryptPwd: function() {
            if ($("[name=IPsecESPVerify]").val() == "NONE") {
                $("#espPwdWrap").slideUp(this.slide);
            } else {
                $("#espPwdWrap").slideDown(this.slide);
            }
        },
        showDH2: function() {
            if ($("[name=IPsecPFSEn]")[0].checked) {
                $("#DH2Wrap").slideDown(this.slide);
            } else {
                $("#DH2Wrap").slideUp(this.slide);
            }
            top.ResetHeight.resetHeight(this.slide);

        },
        refreshPage: function() {
            this.slide = 0;
            this.showWrapContent();
            this.refreshAdvWrap();
            this.showAuthWrap();
            this.showEncryptPwd();
            this.showDH2()
            this.slide = 200;
            top.ResetHeight.resetHeight(this.slide);
        }
    }

    //显示编辑
    function showEdit(title) {
        if (!title) {
            $(".panel-title span").html(_("IPSec"));
            $("#formWrap").hide();
            $("#ipsecListWrap").show();
            $("#formWrap").find('.validatebox-invalid').removeValidateTip();

        } else {
            $(".panel-title span").html(_(title));
            $("#formWrap").show();
            $("#ipsecListWrap").hide();
            $("body").css("overflow-x", "hidden");
        }
        top.ResetHeight.resetHeight();
    }

    /****************** 验证扩展 *********************/

    /**
     * 判断与lan guest wan 同网段 返回一个结果数组形如[{"ipName": "LAN口", "ip": "192.168.0.1"},....]
     * @param ipOrNet String 判断的ip
     * @param mask String 判断的mask
     * @requireArr Array 要与哪几个Ip判断，默认判断全部["lan", "guest", "wan1", "wan2"]
     */
    var isSameNetWithLanWanGuest = (function(ipOrNet) {
        var lanIp,
            lanMask,
            pppoeIp,
            pppoeMask;

        $.GetSetData.getJson('/w20e/goform/getNetworkIpMask', function(ipObj) {
            lanIp = ipObj.lan.lanIP;
            lanMask = ipObj.lan.lanMask;
            G_wan = ipObj.wan;
            pppoeIp = ipObj.pppoes.pppoesIP;
            pppoeMask = ipObj.pppoes.pppoesMask;
        });


        return function(ipOrNet, mask, requireArr) {
            var isSameNet = R.Valid.isSameNet,
                requireArr = requireArr || ["lan", "guest", "pppoe"];
            for (var j = 0; j < G_wan.length; j++) {
                requireArr.push("wan" + j);
            }
            
            var requireStr = requireArr.join(),
                result = [];

            for (var i = 0; i < G_wan.length; i++) {
                if (requireStr.indexOf("wan" + i) != -1 && G_wan[i].wanIP && isSameNet(ipOrNet, G_wan[i].wanIP, mask, G_wan[i].wanMask)) {
                    result.push({
                        "ipName": _("WAN" + i + "口"),
                        "ip": G_wan[i].wanIP
                    });
                }
            }
            /* 与lanip */
            if (requireStr.indexOf("lan") != -1 && isSameNet(ipOrNet, lanIp, mask, lanMask)) {
                result.push({
                    "ipName": _("LAN口"),
                    "ip": lanIp
                });
            }

            if (requireStr.indexOf("pppoe") != -1 && pppoeIp && isSameNet(ipOrNet, pppoeIp, mask, pppoeMask)) {
                result.push({
                    "ipName": _("PPPOE服务器"),
                    "ip": pppoeIp
                });
            }
            return result;
        }
    })();

    //把形如 24 转化为 255.255.255.0
    function getMaskByNum(num) {
        var maskArr = [0, 0, 0, 0],
            mask = num,
            i = 0;

        //通过 x.x.x.x/num num 得到 255.255...这样的掩码
        while (mask != 0 && i < 4) {
            if (mask >= 8) {
                maskArr[i] = 255;
                mask -= 8;
            } else {
                var b = 7;
                while (mask != 0) {
                    maskArr[i] += Math.pow(2, b);
                    b--
                    mask--;
                }

                mask = 0;
            }
            i++;
        }
        return maskArr.join(".");
    }

    $.extend($.valid, {

        /* 内网不能和lan wan guest 同网段 */
        remoteNetValid: {
            all: function(remoteNetAndMask) {
                var ip = remoteNetAndMask.split("/")[0],
                    mask = getMaskByNum(parseInt(remoteNetAndMask.split("/")[1]), 10);

                var netCheckResult = isSameNetWithLanWanGuest(ip, mask);

                for (var i = 0; i < netCheckResult.length; i++) {
                    return _("远端内网网段不能和%s(%s)的网段相同", [netCheckResult[i].ipName, netCheckResult[i].ip]);
                }
            }
        },

        "localNetValid": {
            all: function(localNetAndMask) {
                var ip = localNetAndMask.split("/")[0],
                    mask = getMaskByNum(parseInt(localNetAndMask.split("/")[1], 10));

                var netCheckResult = isSameNetWithLanWanGuest(ip, mask),
                    valid = false;

                for (var i = 0; i < netCheckResult.length; i++) {
                    if (netCheckResult[i].ipName == _("LAN口") || netCheckResult[i].ipName == _("PPPOE服务器")) {
                        valid = true;
                    }
                }
                if (!valid) {
                    return _("本地内网网段必须和PPPOE服务器或LAN口网段相同");
                }
            }
        },


        segAndMask: {
            all: function(str) {
                var errMsg = "请输入合法的网段/掩码或IP地址/32";

                if (!/[\d\.]\/\d{1,2}/.test(str)) {
                    return errMsg;
                }

                var splits = str.split("/"),
                    seg = splits[0],
                    maskNum = splits[1]
                mask = getMaskByNum(parseInt(maskNum, 10));

                if (maskNum == 32) {
                    //32位掩码的时候代表输入的是主机
                    if ($.valid.ip.all(seg)) {
                        return errMsg;
                    }
                } else {

                    //输入的是网段
                    if ($.valid.ipSegment.all(seg)) {
                        return errMsg;
                    } else if ($.combineValid.ipSegment(seg, mask)) {
                        return errMsg;
                    }
                }

			}
		},
		
		IPMask: {
			all: function(IPMask) {
				var arr = IPMask.split("/");
				var IP = arr[0];
				var Mask = +arr[1]
				var maskReg = /^\d{1,2}/g;
				
				if (!maskReg.test(Mask) || Mask > 32 || Mask <= 0) {
					return "请输入正确的格式";
				}
			 
				var str = "";
				for (var i = 0; i<Mask; i++) {
					str += "1";
				}
			 
				var str1 = "";
				for (var k = 0; k< (32 - Mask); k++) {
					str1 += "0";
				} 
				str = str + str1;
			 
				var arr1 = [];
				arr1[0] = parseInt(str.substring(0,8),2);
				arr1[1] = parseInt(str.substring(8,16),2);
				arr1[2] = parseInt(str.substring(16,24),2);
				arr1[3] = parseInt(str.substring(24,32),2);
			 
				Mask = arr1.join(".");
			 
				var mask_arry = Mask.split("."),
					ip_arry = IP.split("."),
					mask_arry2 = [],
					maskk,
					netIndex = 0,
					netIndexl = 0,
					bIndex = 0;
					
				if (ip_arry[0] == 127) {
					return "IP地址不能以127开头";
				}
				if (ip_arry[0] == 0 || ip_arry[0] >= 224) {
					return "IP地址错误";
				}
		 
				if(Mask == "255.255.255.255") {
					if(ip_arry[3] == "0" || ip_arry[3] == "255") {
						return "掩码为'255.255.255.255时'必须输入IP地址";
					}
				} else {
					for (var i = 0; i < 4; i++) { // IP & mask
						if ((ip_arry[i] & mask_arry[i]) == 0) {
							netIndexl += 0;
						} else {
							netIndexl += 1;
						}
					}
					
				
					for (var i = 0; i < mask_arry.length; i++) {
						maskk = 255 - parseInt(mask_arry[i], 10);
						mask_arry2.push(maskk);
					}
					for (var k = 0; k < 4; k++) { // ip & 255-mask
						if ((ip_arry[k] & mask_arry2[k]) == 0) {
							netIndex += 0;
						} else {
							netIndex += 1;
						}
					}
					if (netIndex == 0 || netIndexl == 0) {
						
					} else {
						return "必须输入网段";
					}
					for (var j = 0; j < 4; j++) { // ip | mask
						if ((ip_arry[j] | mask_arry[j]) == 255) {
							bIndex += 0;
						} else {
							bIndex += 1;
						}
					}
			 
					if (bIndex == 0) {
						return "不能输入广播地址";
					}
				}
			}
		},

        ahEnPwd: {
            all: function(str) {
                var errMsg = {
                    md5: _("AH认证算法为MD5时，认证密钥长度必须为16个ASCII码或32个十六进制数"),
                    sha1: _("AH认证算法为SHA1时，认证密钥长度必须为20个ASCII码或40个十六进制数")
                };
                if ($("[name=IPsecAHVerify]").val() == "MD5") {
                    if (!/^[ -~]{16}$/g.test(str) && !/^[0-9a-fA-F]{32}$/g.test(str)) {
                        return errMsg.md5;
                    }
                } else {
                    if (!/^[ -~]{20}$/g.test(str) && !/^[0-9a-fA-F]{40}$/g.test(str)) {
                        return errMsg.sha1;
                    }
                }
            }
        },

        espEnPwd: {
            all: function(str) {
                var errMsg = {
                    "3DES": _("加密算法为3DES时，密钥长度必须为24个ASCII码或48个十六进制数"),
                    "DES": _("加密算法为DES时，密钥长度必须为8个ASCII码或16个十六进制数"),
                    "AES-128": _("加密算法为AES-128时，密钥长度必须为16个ASCII码或32个十六进制数"),
                    "AES-192": _("加密算法为AES-192时，密钥长度必须为24个ASCII码或48个十六进制数"),
                    "AES-256": _("加密算法为AES-256时，密钥长度必须为32个ASCII码或64个十六进制数")
                };
                switch ($("[name=IPsecESPEncrypt]").val()) {
                    case "3DES":
                        if (!/^[ -~]{24}$/g.test(str) && !/^[0-9a-fA-F]{48}$/g.test(str)) {
                            return errMsg["3DES"];
                        }
                        break;
                    case "DES":
                        if (!/^[ -~]{8}$/g.test(str) && !/^[0-9a-fA-F]{16}$/g.test(str)) {
                            return errMsg["DES"];
                        }
                        break;
                    case "AES-128":
                        if (!/^[ -~]{16}$/g.test(str) && !/^[0-9a-fA-F]{32}$/g.test(str)) {
                            return errMsg["AES-128"];
                        }
                        break;
                    case "AES-192":
                        if (!/^[ -~]{24}$/g.test(str) && !/^[0-9a-fA-F]{48}$/g.test(str)) {
                            return errMsg["AES-192"];
                        }
                        break;
                    case "AES-256":
                        if (!/^[ -~]{32}$/g.test(str) && !/^[0-9a-fA-F]{64}$/g.test(str)) {
                            return errMsg["AES-256"];
                        }
                        break;
                }
            }
        },

        espVePwd: {
            all: function(str) {
                var errMsg = {
                    md5: _("ESP认证算法为MD5时，认证密钥长度必须为16个ASCII码或32个十六进制数"),
                    sha1: _("ESP认证算法为SHA1时，认证密钥长度必须为20个ASCII码或40个十六进制数")
                };
                if ($("[name=IPsecESPVerify]").val() == "MD5") {
                    if (!/^[ -~]{16}$/g.test(str) && !/^[0-9a-fA-F]{32}$/g.test(str)) {
                        return errMsg.md5;
                    }
                } else {
                    if (!/^[ -~]{20}$/g.test(str) && !/^[0-9a-fA-F]{40}$/g.test(str)) {
                        return errMsg.sha1;
                    }
                }
            }
        }
    });

    $.extend($.combineValid, {
        "localNetValid": function(localNetAndMask, remoteNetAndMask) {
            if (localNetAndMask == "" || remoteNetAndMask == "") return;

            var localIp = localNetAndMask.split("/")[0],
                localMask = getMaskByNum(parseInt(localNetAndMask.split("/")[1], 10)),
                remoteIp = remoteNetAndMask.split("/")[0],
                remoteMask = getMaskByNum(parseInt(remoteNetAndMask.split("/")[1], 10));

            if (R.Valid.isSameNet(localIp, remoteIp, localMask, remoteMask)) {
                return _("本地内网网段不能和远端内网网段相同");
            }
        }
    });



    /*1.ESP加密算法：
        3DES：加密算法为3DES时，密钥长度必须为24个ASCII码或48个十六进制数。
        DES：加密算法为DES时，密钥长度必须为8个ASCII码或16个十六进制数。
        AES-128：加密算法为AES-128时，密钥长度必须为16个ASCII码或32个十六进制数。
        AES-192：加密算法为AES-192时，密钥长度必须为24个ASCII码或48个十六进制数。
        AES-256：加密算法为AES-256时，密钥长度必须为32个ASCII码或64个十六进制数。
    2.ESP认证算法：（可选，提供数据包完整性保证服务）
        NONE：ESP认证算法为空，不需要填入认证密钥。
        MD5：ESP认证算法为MD5时，认证密钥长度必须为16个ASCII码或32个十六进制数。
        SHA1：ESP认证算法为SHA1时，认证密钥长度必须为20个ASCII码或40个十六进制数。
    3.AH认证算法：
        MD5：AH认证算法为MD5时，认证密钥长度必须为16个ASCII码或32个十六进制数。
        SHA1：AH认证算法为SHA1时，认证密钥长度必须为20个ASCII码或40个十六进制数。*/
});
