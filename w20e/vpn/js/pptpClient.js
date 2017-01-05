$(function() {

	var lanIp,
		lanMask;

	$.GetSetData.getJson("/w20e/goform/getLanIpMask", function(data) {
		lanIp = data.lanIP;
		lanMask = data.lanMask;
	});

	$("[name='vpnClientUser'],[name='vpnClientPwd']").addCheck([
		{
			"type": "ascii", 
			"args": [1, 32]
		}, 
		{
			"type":"specialChar", 
			"args":["'\"&"]
		}
	]);
	$('[name="vpnClientWAN"]').parent().hide();
    if(top.WAN_NUMBER) {
        $('[name="vpnClientWAN"]:lt('+top.WAN_NUMBER+')').parent().show();
    }

	var mainview = new R.View($("#mainview"), {
		fetchUrl: "/w20e/goform/getVpnClient",
		submitUrl: "/w20e/goform/setVpnClient",
		updateCallback: function(data) {
			updateStatus(data);
			return data;
		},
		afterUpdate: function() {
			initView();
		},
		beforeSubmit: function() {
			var serverIp = $("[name=vpnClientServerAddr]").val(),
				vpnEn = ($("[name=vpnClientAgentEn]:checked").val() == "true"),
				serverNet = $("[name=vpnClientServerNetAddr]").val(),
				serverMask = vpnEn ?  lanMask: $("[name=vpnClientServerNetMask]").val();

			if (!$.valid.ip.all(serverIp)) {
				if (isSameNet(serverIp, lanIp, serverMask, lanMask)) {
					showMsg(_("服务器地址不能和LAN口IP(%s)在同一网段", [lanIp]));
					return false;
				}
				if (!vpnEn && isSameNet(lanIp, serverNet, lanMask, serverMask)) {
					showMsg(_("服务器内网网段不能和LAN口IP(%s)的网段相同", [lanIp]));
					return false;
				}
				if (!vpnEn && isSameNet(serverIp, serverNet, serverMask, serverMask)) {
					showMsg(_("服务器地址不能在服务器内网网段内"));
					return false;
				}

			}

			showSaveMsg(_("请稍候...")); 
		},
		afterSubmit: function(res) {
			showSaveMsg(_("保存成功"), 1000);
			mainview.update();
		},
		events: {
			"#saveBtn, click": function() {
				mainview.submit();
			},
			"#cancelBtn, click": function() {
				mainview.initElements();
			},
			"[name=vpnClientType], click": function() { initView();},
			"[name=vpnClientEn], click": function() { initView();},
			"[name=vpnClientAgentEn], click": function() { initView();}

		}
	});

	function initView(slide) {
		var slide = typeof slide == "undefined" ? 200 : slide;
		if ($("[name=vpnClientEn]:checked").val() == "false") {
			$("#pptpClientEnWrap").slideUp(slide);
		} else {
			$("#pptpClientEnWrap").slideDown(slide);
		}
		if ($("[name=vpnClientType]:checked").val() == "l2tp") {
			$("#encryptWrap").slideUp(slide);
		} else {
			$("#encryptWrap").slideDown(slide);
		}

		if ($("[name=vpnClientAgentEn]:checked").val() == "true") {
			$("#vpnEnWrap").slideUp(slide);
		} else {
			$("#vpnEnWrap").slideDown(slide);
		}

		top.ResetHeight.resetHeight(slide);
	}

	//更新状态
	function updateStatus(data) {
		var connText = {"connected": _("已连接"), "disconnected": _("未连接"), "connecting": _("连接中...")},
			caller = arguments.callee;

		if (connText[data.vpnClientConnectStatus]) {
			$("#clientConnStatusWrap, #gotIPWrap").show();
			$("#clientConnStatus").html(connText[data.vpnClientConnectStatus]);
			$("#gotIP").html(data.vpnClientIP);
			(data.vpnClientIP || $("#gotIPWrap").hide());
		} else {
			$("#clientConnStatusWrap, #gotIPWrap").hide();
			return;
		}

		setTimeout(function() {
			$.GetSetData.getJson("/w20e/goform/getVpnClient", function(data) {
				caller(data);
			});
		}, 5000);
	}	

	/*$.valid.domain = {
		all: function(str) {
			if (!/^[\d\.]+$/.test(str)) {
				if(/^([\w-]+\.)+(\w)+$/.test(str))
				return;
			} else {
				if (!$.valid.ip.all(str)) 
				return;
			}
			return  _("请输入有效的域名或IP地址");
		}
	};*/


	function isSameNet(ip_lan, ip_wan, mask_lan, mask_wan) {
		var ip1Arr = ip_lan.split("."),
			ip2Arr = ip_wan.split("."),
			maskArr1 = mask_lan.split("."),
			maskArr2 = mask_wan.split("."),
			i;

		for (i = 0; i < 4; i++) {
			if ((ip1Arr[i] & maskArr1[i]) != (ip2Arr[i] & maskArr2[i])) {
				return false;
			}
		}
		return true;
	}

});