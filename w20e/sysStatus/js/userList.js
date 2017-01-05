(function(window,$) {

    $('#navCon').on('click', "li", function() {
        //Debug.log(".dhcp click");
        $(this).addClass("active").siblings().removeClass("active");
        $("#" + this.id + 'UserTable').removeClass('none').siblings().addClass('none');
    });


    var dhcpUser = new TablePage($("#dhcpUserTable table"));
    var wifiUser = new TablePage($("#wifiUserTable table"));
    var vpnUser= new TablePage($("#vpnUserTable table"));
    var pppoeUser = new TablePage($("#pppoeUserTable table"));
    var webUser = new TablePage($("#webUserTable table"));
    var ipsecUser = new TablePage($("#ipsecUserTable table"));
    update();

    function update() {
        $.GetSetData.getData('/w20e/goform/getDHCPList', function(res) {
            dhcpUser.data = $.parseJSON(res);
             $('#dhcpUserNum').html(dhcpUser.data.length);

            var data = $.parseJSON(res);
            for(var i=0; i<data.length; i++) {
                dhcpUser.data[i].dhcpListOnlineTime = data[i].dhcpListOnlineTime.replace('d',"天").replace('h',"小时").replace('m',"分钟").replace('s',"秒");
                dhcpUser.data[i].dhcpListReleaseTime = data[i].dhcpListReleaseTime.replace('d',"天").replace('h',"小时").replace('m',"分钟");
            }
           
            dhcpUser.init();
            return res;
        });

        $.GetSetData.getData('/w20e/goform/getWifiList', function(res) {
            wifiUser.data = $.parseJSON(res);
            $('#wifiUserNum').html(wifiUser.data.length);

            var data = $.parseJSON(res);
            for(var i=0; i<data.length; i++) {
                wifiUser.data[i].wifiListOnlineTime = data[i].wifiListOnlineTime.replace('d',"天").replace('h',"小时").replace('m',"分钟").replace('s',"秒");
            }

            wifiUser.init();
            return res;
        });

        $.GetSetData.getData('/w20e/goform/getVpnClientList', function(res) {
            vpnUser.data = $.parseJSON(res);
            $('#vpnUserNum').html(vpnUser.data.length);
            vpnUser.init();
            return res;
        });


        $.GetSetData.getData('/w20e/goform/getPppoeOnlineUserList', function(res) {
            pppoeUser.data = $.parseJSON(res);
            var userNum = pppoeUser.data.length;
            for(var i = 0; i < userNum; i++) {
                pppoeUser.data[i] = $.extend(true, {pppoeUserIndex: (i + 1)}, pppoeUser.data[i]);
            }
            $('#pppoeUserNum').html(userNum);
            pppoeUser.init();
            return res;
        });

        $.GetSetData.getData('/w20e/goform/getWebList', function(res) {
            webUser.data = $.parseJSON(res);
            $('#webUserNum').html(webUser.data.length);
            webUser.init();
            return res;
        });

        $.GetSetData.getData('/w20e/goform/getIpsecSAInfoList', function(res) {
            var data = $.parseJSON(res);

            for (var i = data.length - 1; i >= 0; i--) {
                data[i].ipsecSATunnelEndpoint1 += ("-><br>" + data[i].ipsecSATunnelEndpoint2);
                data[i].ipsecSAPacketStream1 += ("-><br>" + data[i].ipsecSAPacketStream2);
                data[i].ipsecSADirection = (data[i].ipsecSADirection == "in"? "入": "出");
                delete(data[i].ipsecSATunnelEndpoint2);
                delete(data[i].ipsecSAPacketStream2);
            };

            ipsecUser.data = data;
            $('#ipsecUserNum').html(ipsecUser.data.length);
            ipsecUser.init();
            return res;
        });
    }

    setInterval(update, 5000);

}(window,$));


//左右按钮
window.onload = function() {
    var $scrollWrap = $(".userlist-tabs-wrap"),
        $scroller = $("#navCon");

    $scroller.css("left", 0);
    function go(offset) {

        var curLeft = parseInt($scroller.css("left")),
            scrollerWidth = $scroller.outerWidth(),
            scrollWrapWidth = $scrollWrap.width(),
            spaceOver = scrollWrapWidth - scrollerWidth,
            $leftBtn = $(".scroll-btn-left").show(),
            $rightBtn = $(".scroll-btn-right").show();

        curLeft = curLeft + offset;
        curLeft = (curLeft > 0 ? 0:curLeft);
        spaceOver = spaceOver>0?0: spaceOver;
        curLeft = Math.max((spaceOver), curLeft);


        $scroller.stop().animate({"left": curLeft}, 300);
        //console.log(curLeft, scrollWrapWidth, scrollerWidth);
        if (curLeft <= spaceOver) {
            $rightBtn.hide();
        }
        if (curLeft >= 0) {
            $leftBtn.hide();
        }
    }


    $(".scroll-btn-left").on("click", function() {
        go(200)
    });

    $(".scroll-btn-right").on("click", function() {
        go(-200)
    });

    window.onresize = function() {
        go(0)
    }   
    go(0)
}