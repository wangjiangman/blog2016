var GPage = {
    imgHeight: null,
    isIframeSetFlag: false,
    speed: null //图片轮播速度
};
var UrlLinks = {
    link1: null,
    picEn1: false,
    link2: null,
    picEn2: false,
    link3: null,
    picEn3: false
};
/***********add weixinLinkWifi info*******************/
var appid = "";
var shopid = "";
var ssid = "";
var secretKey = "";
var extend = "";
var authUrl = "";
var mac = "";
/***********end*******************/

var redirectUrl = "",
    searchData = "";

var Urls = {
    mainInfoUrl: '/w20e/goform/getWewifiPortalCfg',
    portalAuthUrl: '/w20e/goform/PortalAuth'
};

function handler(res) {
    appid = res.wewifiAppId;
    shopid = res.wewifiShopId;
    ssid = res.wewifiSsid;
    secretKey = res.wewifiSecretKey;
    extend = res.wewifiExtendInfo;
    authUrl = res.wewifiAuthUrl;
    mac = res.wewifiUserMac;
    GPage.speed = (res.picShowTime) * 1000;

    if (res.shopName) {
        $("#pre-text").html(res.shopName);
    } else {
        $("#pre-text").hide();
    }

    UrlLinks.link1 = res.picLink1;
    UrlLinks.link2 = res.picLink2
    UrlLinks.link3 = res.picLink3;
    UrlLinks.picEn1 = res.picExit1;
    UrlLinks.picEn2 = res.picExit2;
    UrlLinks.picEn3 = res.picExit3;

    initEvent();
    sliderImg();
}

window.onload = function() {
    searchData = window.location.search.match(/data=(.+)&rd=.*/),
        redirectUrl = searchData && searchData.length == 2 ? searchData[1] : "";
    //是否是iframe
    GPage.isIframeSetFlag = true ? top !== window : top === window;
    window.isIframeSetFlag = GPage.isIframeSetFlag;

    if (GPage.isIframeSetFlag) {
        //若是iframe,则高度减小
        GPage.imgHeight = 180;
    } else {
        GPage.imgHeight = 400;
    }

    $.ajax({
        url: Urls.mainInfoUrl,
        cache: false,
        type: "get",
        dataType: "text",
        async: true,
        success: function(res) {
            handler($.parseJSON(res));
        },
        error: function(xml, status, err) {
            console.log(err)
        }
    });
};

function initEvent() {
    if (GPage.isIframeSetFlag) {
        //若是iframe,则取消事件绑定
        return;
    }

    $("#weichart_qrcode").on("click", function() {
        if (!redirectUrl) {
            return;
        } else {
            $.ajax({
                url: Urls.portalAuthUrl + "?portalAuthType=wewifi_temppass",
                cache: false,
                type: "get",
                dataType: "text",
                async: true,
                success: function(res) {
                    if ($(".weichart-main-content").hasClass("none")) {
                        $(".weichart-main-content").removeClass("none");
                        JSAPI.auth({
                            target: document.getElementById('qrcode_zone'), //固定
                            appId: appid,
                            shopId: shopid,
                            extend: extend + "?redirectUrl=" + redirectUrl,
                            authUrl: authUrl
                        });
                    } else {
                        $(".weichart-main-content").addClass("none");
                    }
                },
                error: function(xml, status, err) {
                    console.log(err)
                }
            });
        }
    });
}

function callWechatBrowser() {
    if (GPage.isIframeSetFlag) {
        return;
    }

    if (mac == "") {
        return;
    }

    $.ajax({
        url: Urls.portalAuthUrl + "?portalAuthType=wewifi_temppass",
        cache: false,
        type: "get",
        dataType: "text",
        async: true,
        success: function(res) {
            var timestamp = Math.round(new Date().getTime());

            var sign = $.md5(appid + extend + timestamp + shopid + authUrl + mac + ssid + secretKey);

            console.log("sign = ", sign);
            Wechat_GotoRedirect(appid, extend, timestamp, sign, shopid, authUrl, mac, ssid);
        },
        error: function(xml, status, err) {
            console.log(err)
        }
    });
}

function sliderImg() {
    var slider = new Slider(GPage);
    slider.init(GPage.isIframeSetFlag);

    var imgLength = 0,
        i = 0;
    if (UrlLinks.picEn1) {
        $(".ad-pic").eq(imgLength).attr("src", "/images/webpush/wewifipic1.jpg?" + Math.random());
        $(".ad-pic").eq(imgLength).parent().attr("href", "http://" + UrlLinks.link1);
        imgLength++;
    }
    if (UrlLinks.picEn2) {
        $(".ad-pic").eq(imgLength).attr("src", "/images/webpush/wewifipic2.jpg?" + Math.random());
        $(".ad-pic").eq(imgLength).parent().attr("href", "http://" + UrlLinks.link2);
        imgLength++;
    }
    if (UrlLinks.picEn3) {
        $(".ad-pic").eq(imgLength).attr("src", "/images/webpush/wewifipic3.jpg?" + Math.random());
        $(".ad-pic").eq(imgLength).parent().attr("href", "http://" + UrlLinks.link3);
        imgLength++;
    }

    for (; i < imgLength; i++) {
        if (GPage.isIframeSetFlag) {
            //当在PC的手机图片上预览时，去除图片链接跳转
            $(".ad-pic").eq(i).parent().attr("href", "javascript:void(0)");
        }
    }

    slider.setLength(imgLength);

    if (slider.imgListLength <= 0) {
        $('#slider').parent().html('').css({
            'text-align': 'center',
            'height': '80px',
            'padding-top': '50px'
        });
    }

    $('#slider img').on('error', function() {
        $(this).parent().parent().remove();
        slider.setLength(slider.imgListLength - 1);
        if (slider.imgListLength <= 0) {
            $('#slider').parent().html('轮播图片加载失败!').css({
                'text-align': 'center',
                'height': '80px',
                'padding-top': '50px'
            });
        }
    });

    $("#slider img").css("height", GPage.imgHeight + "px");
    $("#slider").css("height", GPage.imgHeight + "px");
    window.slider = slider;
}
