$(function() {
	G_data = {};

	$("[name=wifiGuestPwd]").initPassword();

	$.valid.checkSameNet= {
		all: function(GuestLanIP) {
			var GuestLanMask = "255.255.255.0";
			if (R.Valid.isSameNet(GuestLanIP, G_data.lan.lanIP, GuestLanMask, G_data.lan.lanMask)) {
				return _("访客网络LAN IP不能和登录IP %s 在同一网段", [G_data.lan.lanIP]);
			}
			for (var i = 0; i < G_data.wan.length; i++) {
				var wanData = G_data.wan[i];
                if(wanData.wanIP !== "0.0.0.0") {
    				if (R.Valid.isSameNet(GuestLanIP, wanData.wanIP, GuestLanMask, wanData.wanMask)) {
    					return _("访客网络LAN IP不能和WAN IP %s 在同一网段", [wanData.wanIP]);
    				}
                }
			}
		}
	}
	$("[name=wifiGuestLanIP]").addCheck([{"type": "ip"},{"type": "checkSameNet"}]);

	function initView(slide) {
		var slide = (typeof slide == "undefined"?200: slide);

		//无线开关

		if ($("[name=wifiGuestEn]:checked").val() == "false") {
			$("#wifiGuestEnWrap").slideUp(slide);
		} else {
			$("#wifiGuestEnWrap").slideDown(slide);
		}

	    //加密
		if ($("[name=wifiGuestSecurity]").val() == "none") {
			$(".encryption-wrap").slideUp(slide);
		} else {
			$(".encryption-wrap").slideDown(slide);
		}		

		//无线编码
       /* var checkObj,
            msgUTF8 = _("无线名称不能超过32个字节，UTF-8编码下中文字符可能占2/3个字节"),
            msgGB2312 = _("无线名称不能超过32个字节，GB2312编码下中文字符占2个字节");

        if ($("[name=wifiGuestSSIDEncode]").val() == "utf-8") {
            checkObj = {type: "byteLen", args: [1, 32], msg: msgUTF8};
        } else {
            checkObj = {type: "gb2312ByteLen", args: [1, 32], msg: msgGB2312};
        }

	    $("[name=wifiGuestSSID]").addCheck(checkObj).check();*/
	    top.ResetHeight.resetHeight(slide);	

	}

	var mainview = new R.View("#mainView", {

		fetchUrl: "/w20e/goform/getWifiGuest",
		submitUrl: "/w20e/goform/setWifiGuest",
		updateCallback: function(data) {
			G_data = data;			
			return data.wifiGuestBasic;
		},
		afterUpdate: function() {
			initView(0);
		},
		beforeSubmit: function() {
			showSaveMsg(_("请稍候...")); 
		},
		afterSubmit: function(res) {
			showSaveMsg(_("保存成功"), 1000);
			mainview.update();
		},
		events: {
			"[name=wifiGuestEn], click": function() {
				initView(); 
			},

			"#wifiGueSet-save, click": function() {
				mainview.submit();
			},

			"#wifiGueSet-cancel, click": function() {
				mainview.initElements();
			},

			"[name=wifiGuestSSIDEncode], change": function() {
				changeSSIDEncode(this.value);
			},

			"[name=wifiGuestSecurity], change": function() {
				initView();
			}
		}
	});


});


function getGBKLength(str) {
    var totalLength = 0,
        charCode,
        len = str.length,
        i;
        
    for (i = 0; i < len; i++) {
        charCode = str.charCodeAt(i);
        if (charCode < 0x007f) {
            totalLength++;
        } else {
            totalLength += 2;
        }
    }
    return totalLength;
}

$.valid.gb2312ByteLen = function (str, min, max) {
    var totalLength = getGBKLength(str);

    if (typeof min !== "undefined" && typeof max !== "undefined" && (totalLength < min || totalLength > max)) { 
        return _($.reasyui.MSG['String length range is: %s - %s byte'], [min, max]);    
    }
}  
	

