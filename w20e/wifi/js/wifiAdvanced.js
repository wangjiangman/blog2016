$(function() {
	var extendChannelOpts = $("[name=wifiExtendChannel]").html().match(/<option.*?<\/option>/ig),
		channelOpts = $("[name=wifiBandWidth]").html().match(/<option.*?<\/option>/ig);

	function changeModel() {
		var $bandWidth = $("[name=wifiBandWidth]")
			bandWidth = $bandWidth.val();

		if ($("[name=wifiMode]").val() == "bgn") {
			$bandWidth.html(channelOpts.join(""));
		} else {
			$bandWidth.html(channelOpts[1]);
		}
		$bandWidth.val(bandWidth);

		if ($bandWidth.val() != bandWidth)
		$bandWidth.find("option").eq(0).attr("selected", "selected");

		changeBandWidth();
	}

	function changeBandWidth(slide) {
		var slideTime = (typeof slide === "undefined" ? 200 : slide);

		if ($("[name=wifiBandWidth]").val() != 20) {
			$("#extendChannel").slideDown(slideTime);
		} else {
			$("#extendChannel").slideUp(slideTime);
		}
		changeChannel();
	}

	function changeChannel() {


		var wifiBandWidth = $("[name=wifiBandWidth]").val(),
			wifiChannel = parseInt($("[name=wifiChannel]").val(), 10),
			$wifiExtendChannel = $("[name=wifiExtendChannel]"),
			wifiExtendChannel = $wifiExtendChannel.val();

		if (wifiBandWidth == 20) return;

		$wifiExtendChannel.html("");

		$("#extendChannel").show();
		if (wifiChannel == 0) {
			//无线带宽为40，且无线信道为自动时，不显示扩展信道
			$("#extendChannel").hide();
			$wifiExtendChannel.html(extendChannelOpts[wifiChannel]);
		} else if (wifiChannel < 5) {
			$wifiExtendChannel.html(extendChannelOpts[wifiChannel + 4]);
		} else if (wifiChannel > 9) {
			$wifiExtendChannel.html(extendChannelOpts[wifiChannel - 4]);
		} else {
			$wifiExtendChannel.html(extendChannelOpts[wifiChannel - 4] + extendChannelOpts[wifiChannel + 4]);
		}

		$wifiExtendChannel.val(wifiExtendChannel);
		if (wifiChannel == 0 || !wifiExtendChannel || $wifiExtendChannel.val() != wifiExtendChannel)
		$wifiExtendChannel.find("option").eq(0).attr("selected", "selected");
	}

	var mainview = new R.View("#wifiAdvWrap", {
		fetchUrl: "/w20e/goform/getWifiAdvanced",
		submitUrl: "/w20e/goform/setWifiAdvanced",
		afterUpdate: function() {
			var wifiExtendChannel = mainview.defaults.originData.wifiExtendChannel,
				wifiChannel = parseInt(mainview.defaults.originData.wifiChannel,10),
				extendSlt = (wifiChannel == 0 ? false: wifiChannel + (wifiExtendChannel == "upper"? -4: 4));

			$("[name=wifiExtendChannel]").val(extendSlt);
			changeModel();
		},
		beforeSubmit: function(data) {
			if (data.wifiExtendChannel) {
				data.wifiExtendChannel = (parseInt(data.wifiExtendChannel,10) < parseInt(data.wifiChannel,10)? "upper": "lower");
			}

			showSaveMsg(_("请稍候...")); 
		},
		afterSubmit: function(res) {
			showSaveMsg(_("保存成功"), 1000);
			mainview.update();
		},
		events: {
			"#wifiAdvSet-save, click": function() {
				mainview.submit();
			},

			"#wifiAdvSet-cancel, click": function() {
				mainview.initElements(false);
			},

			"[name=wifiMode], change": function() {
				changeModel();
			},

			"[name=wifiBandWidth], change": function() {
				changeBandWidth();
			},

			"[name=wifiChannel], change": function() {
				changeChannel();
			}

		}
	});

});