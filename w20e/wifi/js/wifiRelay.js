$(function() {
	var msg = {"unconnected": "未连接", "connected": "已连接"};

	/*****开启微信连WIFI后，中继开关禁用*****/
    if(top.hideInfo.apclientHide === true) {
        $('[name="wifiRelayEn"]').attr('disabled', true);
        $('#SetWifiRelay-save').attr('disabled', true);
    } else {
    	$('[name="wifiRelayEn"]').attr('disabled', false);
        $('#SetWifiRelay-save').attr('disabled', false);
    }

	var scanner = {
		scannerData: null,
		onchange: null,
		fetchUrl: "/w20e/goform/getWifiScan",
		currentData: null,
		$wrap: $("#apSsid"),
		$ssidTxt: $("#apSsid .self-select-text"),
		$listWrap: $("#apSsid .self-select-ul"),
		scanning: false,
		handset: false,

		init: function() {

			$(document).on("click", function(e) {
				if (!$(e.target).parents("#apSsid").length)
				scanner.$listWrap.slideUp(200);
			});

			scanner.$wrap.find(".self-select-display").on("click", function() {
				if (!scanner.scanning)
				scanner.$listWrap.slideToggle(200);
			});

			scanner.$listWrap.on("click", "li.self-select-option", function() {
				var index = parseInt($(this).find(".self-select-data").attr("data-val")),
					dataObj = index < 0 ? index: scanner.scannerData[index];


				if (index < 0) {
					dataObj = index;
				} else {
					var selectData = scanner.scannerData[index],
						pskTypeMap = {
							"wpa": "psk",
							"wpa2": "psk2",
							"wpa&wpa2": "psk psk2"
						},
						encriptionMap = {
							"aes": "aes",
							"tkip": "tkip",
							"aes&tkip": "tkip+aes",
						},

						security = selectData.wifiScanSecurity.indexOf("none") != -1?"none":"wpapsk",
						wpaPskType = security != "none"? pskTypeMap[selectData.wifiScanSecurity.split("/")[0]]: "psk",
						encription  = security != "none"? encriptionMap[selectData.wifiScanSecurity.split("/")[1]]: "aes";

					dataObj = {
						"wifiRelaySSID" : scanner.scannerData[index].wifiScanSSID,
						"wifiRelaySecurity" : security,
					}			
					if (security != "none") {
						$.extend(dataObj, {
							"wifiRelayWpaPskType" : wpaPskType,
							"wifiRelayEncription" : encription							
						});
					}
				}

				scanner.val(dataObj);
				scanner.$listWrap.slideUp(200);
			});

			//扫描
			$("#scanBtn").on("click", function() {
				if (scanner.scanning) return;

				$("#scanBtn").addClass("refreshing");
				scanner.scanning = true;
				scanner.scan();
			});
		},
		
		scan: function(callback) {
			$.GetSetData.getJson(this.fetchUrl, function(data) {

				scanner.scanning = false;
				$("#scanBtn").removeClass("refreshing");
				scanner.scannerData = data.wifiScan;
				scanner.scannerData.sort(function(a, b) {
					if (a.wifiScanSignalStrength > b.wifiScanSignalStrength) {
						return 1;
					} else {
						return -1;
					}
				});

				scanner.createList();
				if (!scanner.handset)
				scanner.val(-2);
				if (typeof callback === "function") {
					callback();
				}
			});
		},

		createList: function() {
			var scan_str,
				signalObj;

			scan_str = '<li class="self-select-option current">' + '<span class="self-select-data" data-val="-1">--' + _("手动输入") + '--</span></li>';			

			if (!this.scannerData || this.scannerData.length === 0) {
				scan_str += '<li>无线列表为空</li>'
			} else {

				for (var i = 0; i < this.scannerData.length; i++) {
					signalObj = this.scannerData[i];

					signal = parseInt(signalObj.wifiScanSignalStrength, 10);

					if (signal > -60) {
						signal = "signal_4";
					} else if (signal <= -60 && signal > -70) {
						signal = "signal_3";
					} else if (signal <= -70 && signal > -80) {
						signal = "signal_2"
					} else {
						signal = "signal_1"
					}

					scan_str += '<li class="self-select-option wifi-ssid-txt" title="' + $("<div/>").text(signalObj.wifiScanSSID).html() + '"><span class="signal ' + signal + '">&nbsp;</span><span class="self-select-data" data-val="' + i + '">' + $("<div/>").text(signalObj.wifiScanSSID).html() + '</span></li>';
				}				
			}

			this.$listWrap.html(scan_str);
		},

		val: function(dataObj, handsetData) {
			if (typeof dataObj === "undefined") {
				return scanner.currentData;
			}

			scanner.handset = false;

			scanner.currentData = null;
			if (typeof dataObj === "object") {
				scanner.currentData = dataObj;
				scanner.$ssidTxt.html(dataObj.wifiRelaySSID);
			} else if (dataObj == -1){
				scanner.currentData = handsetData || null;
 				scanner.$ssidTxt.html(_("--手动输入--"));
 				scanner.handset = true;
			} else if (dataObj == -2) {
				scanner.currentData = null;
 				scanner.$ssidTxt.html(_("--请选择--"))
			} else {
 				scanner.$ssidTxt.html(_(dataObj))
			}

			if (typeof scanner.onchange === "function") {
				scanner.onchange(scanner.handset, scanner.currentData);
			}
		}
	};

	scanner.init();


	scanner.onchange = function changeSSID(handset, dataObj) {
		var formData = {
			"wifiRelaySSID" : "",
			"wifiRelaySecurity" : "none",
			"wifiRelayWpaPskType" : "psk",
			"wifiRelayEncription": 	"aes",
			"wifiRelayPwd": "",
			"wifiRelayStatus": ""
		};

		if (dataObj) {
			formData = $.extend(formData, dataObj);
		}

		if (handset) {
			$("#handsetWrap").show();
		} else {
			$("#handsetWrap").hide();
		}

		mainView.initElements(formData);
		mainView.initView();
	}



	$("[name=wifiRelayPwd]").initPassword();
	G_data = {};
	var mainView = new R.View("#mainView", {
		fetchUrl: "/w20e/goform/getWifiRelay",
		submitUrl: "/w20e/goform/setWifiRelay",
		updateCallback: function(data) {
			G_data.relay = data;
			data.wifiRelayStatus = msg[data.wifiRelayStatus] || "";

			if (G_data.relay.wifiRelaySSID) {
				if (G_data.relay.wifiRelayHandset) {
					scanner.val(-1, G_data.relay);
				} else {
					scanner.val(G_data.relay);
				}				
			}

			return data;
		},
		afterUpdate: function() {

			mainView.initView(0);

		},
		beforeSubmit: function(data) {
			var submitData = data,
				handset = true;

			if ($("#handsetWrap").is(":hidden")) {
				handset = false;
				if (data.wifiRelayEn == "true" && !scanner.currentData) {
					showMsg(_("请指定或输入一个有效的上级信号"));
					return false;
				}
				submitData = $.extend({}, scanner.currentData, data);
			}
			submitData.wifiRelayEn = data.wifiRelayEn;
			submitData.wifiRelayHandset = handset + "";

            showConfirm.call(this, "保存本页配置，路由器将重启使配置生效，确认要保存吗？", function() {

            	$.GetSetData.setData("/w20e/goform/setWifiRelay", submitData , function() {});

	            var p = new top.Progress(window.location.href.replace(/(http(s)?:\/\/.+(\/)).*/gi, "$1"), 600, $("#progress-dialog")[0]);
	            p.show("center");

	            p.setText(_("系统正在重启,请稍候..."));
	            p.start();
				//showSaveMsg(_("请稍候..."));
			});
			return false;
		},
		afterSubmit: function(res) {
			//showSaveMsg(_("保存成功"), 1000);
			//mainView.update();
		},
		events: {
			"[name=wifiRelayEn], click": function() {
				mainView.initView();
			},
			
			"[name=wifiRelaySecurity], change": function() {
				mainView.initView();
			},

			"#SetWifiRelay-save, click": function() {
				mainView.submit();
			},

			"#SetWifiRelay-cancel, click": function() {
				mainView.initElements();
			}

		}
	});

	mainView.initView = function(slide) {
		var slide = (typeof slide === "undefined" ? 200 : slide);

		if ($("[name=wifiRelayEn]:checked").val() == "false") {
			$("#relayEnableWrap").slideUp(slide);
		} else {
			$("#relayEnableWrap").slideDown(slide);
		}

		if ($("[name=wifiRelaySecurity]").val() != "wpapsk") {
			$(".encryption-wrap, #pwdWrap").slideUp(slide);
		} else {
			$(".encryption-wrap, #pwdWrap").slideDown(slide);
		}

		if ($("[data-bind=wifiRelayStatus]").html() == "") {
			$("#connStatus").hide();
			$("#connStatusLabel").css("display","inline-block");
		} else {
			$("#connStatus").show();
			$("#connStatusLabel").css("display","none");
		}
		top.ResetHeight.resetHeight(slide);
	}

});