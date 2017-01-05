$(function() {

    var G_data = {};

    /*****开启微信连WIFI后，主SSID中影响微信连WIFI功能全部置灰（如：SSID、密码等）*****/
    if (top.hideInfo.ssidMainHide === true) {
        $('[name="wifiSSID"]').eq(0).attr('disabled', true);
        $('[name="wifiSecurity"]').eq(0).attr('disabled', true);
    } else {
        $('[name="wifiSSID"]').eq(0).attr('disabled', false);
        $('[name="wifiSecurity"]').eq(0).attr('disabled', false);
    }


    /****************  主网络  *******************/
    var wifiForm = new R.FormView('#wifiForm');
    wifiForm.dataIndex = 0;

    /****************  主网络 over *******************/

    /****************  次网络1  *******************/
    var wifiForm1 = new R.FormView('#wifiForm1');
    wifiForm1.dataIndex = 1;

    /****************  次网络1 over *******************/


    var forms = [wifiForm, wifiForm1];

    function init() {
        initEvent();
        update();
        $("[name=wifiPwd]").initPassword();
    }
    init();

    function update() {
        $.GetSetData.getJson("/w20e/goform/getWifiBasic", function(data) {
            var dataArr = data.wifiBasic;

            G_data = data;
            for (var i = forms.length - 1; i >= 0; i--) {
                forms[i].update(dataArr[forms[i].dataIndex]);
            }
            initView();
        });
    }

    function initView() {
        updateView(true);

    }

    function updateView(firstInit) {
        var slide = (firstInit === true ? 0 : 200);

        $("[name=wifiEn]:checked").each(function() {
            if (this.value == "true") {
                $(this).parents(".form-group").next().slideDown(slide);
            } else {
                $(this).parents(".form-group").next().slideUp(slide);
            }
        });

        $("[name=wifiSecurity]").each(function() {
            if (this.value != "none") {
                $(this).parents(".form-group").next().slideDown(slide);
            } else {
                $(this).parents(".form-group").next().slideUp(slide);
            }
        });

        /*$("[name=wifiSSIDEncode]").each(function() {
            var checkObj,
                msgUTF8 = _("无线名称不能超过32个字节，UTF-8编码下中文字符可能占2/3个字节"),
                msgGB2312 = _("无线名称不能超过32个字节，GB2312编码下中文字符占2个字节");

            if (this.value == "utf-8") {
                checkObj = {type: "byteLen", args: [1, 32], msg: msgUTF8};
            } else {
                checkObj = {type: "gb2312ByteLen", args: [1, 32], msg: msgGB2312};
            }
            $(this).parents(".wifi-on-wrap").find("[name=wifiSSID]").addCheck(checkObj).check();
        });*/

        top.ResetHeight.resetHeight(slide);

    }

    function initEvent() {
        $("#save").on("click", submit);
        $("#cancel").on("click", function() {
            wifiForm.update(G_data.wifiBasic[0]);
            wifiForm1.update(G_data.wifiBasic[1]);
            initView();
        });
        $("[name=wifiEn]").on("click", updateView);
        $("[name=wifiSecurity]").on("change", updateView);
        $("[name=wifiSSIDEncode]").on("change", updateView);

    }

    function submit() {
        var formData = null,
            data = {},
            keyAppend = "";

        for (var i = 0; i < forms.length; i++) {
            keyAppend = i + 1 + "";

            if (formData = forms[i].getSubmitData()) {
                for (var key in formData) {
                    data[key + keyAppend] = formData[key];
                }
            } else {
                return false;
            }
        }

        if (top.hideInfo.ssidMainHide === true) {
            $.extend(data, {
                wifiSSID1: G_data.wifiBasic[0].wifiSSID,
                wifiSecurity1: G_data.wifiBasic[0].wifiSecurity
            })
        }

        showSaveMsg(_("保存中"));
        $.GetSetData.setData("/w20e/goform/setWifiBasic", data, function(res) {
            showSaveMsg(_("保存成功"), 1000);
            update();
        });
    }


    $.valid.wifiUpdate = function(str) {
        var errorMsg = _("输入范围66-99999，输入0代表不更新");

        if (str == "0") {
            return;
        } else {
            return $.valid.num(str, 66, 99999) ? errorMsg : false;
        }
    }

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

$.valid.gb2312ByteLen = function(str, min, max) {
    var totalLength = getGBKLength(str);

    if (typeof min !== "undefined" && typeof max !== "undefined" && (totalLength < min || totalLength > max)) {
        return _($.reasyui.MSG['String length range is: %s - %s byte'], [min, max]);
    }
}
