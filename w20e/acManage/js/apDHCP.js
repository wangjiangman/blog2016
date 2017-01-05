(function(window,$) {
    var G_data, ipObj;

    /*********用于检测landhcp的ip和apdhcp的值是否冲突***/
    function lanAndAp(res) {
        var lanStartIp, lanEndIp, apStartIp, apEndIp;

        apStartIp = res.startip.split('.')[3];
        apEndIp = res.endip.split('.')[3];
        lanStartIp = ipObj.dhcp.lanDhcpStart.split('.')[3];
        lanEndIp = ipObj.dhcp.lanDhcpEnd.split('.')[3];

        if(apEndIp < lanStartIp || lanEndIp < apStartIp) {
            return true;
        } else {
            return false;
        }
    }

    /********判断开始ip是否大于结束ip****************/
    function endLEStart(ip1, ip2) {
        if(ip1 === ip2) {
            return true;
        }
        var ipArr1 = ip1.split('.'),
            ipArr2 = ip2.split('.'),
            i;
        for(i = 0; i < 4; i++) {
            if(parseInt(ipArr2[i], 10) > parseInt(ipArr1[i], 10)) {
                return true;
            }
        }
        return false;
    }

    function beforeSubmitHandler(res) {
        var mask = G_data.mask,
            lanIP = G_data.lanip;
            startip = res.startip,
            endip = res.endip,
            gateway = res.gateway,
            dns1 = res.dns1,
            dns2 = res.dns2,
            rel_ip = /^([1-9]|[1-9]\d|1\d\d|2[0-1]\d|22[0-3])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/,
            rel_msk = /^(254|252|248|240|224|192)\.0\.0\.0$|^(255\.(254|252|248|240|224|192|128|0)\.0\.0)$|^(255\.255\.(254|252|248|240|224|192|128|0)\.0)$|^(255\.255\.255\.(254|252|248|240|224|192|128|0))$/,
            rel_dns2 = /^([0-9]|[1-9]\d|1\d\d|2[0-1]\d|22[0-3])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/;
            RegGetTail = /\d{1,3}$/;

        if(!lanAndAp(res)) {
            showMsg(_("lanDHCP和apDHCP的IP地址池冲突"));
            return false;
        } 

        //修改，允许网关和DNS1为空
        if(gateway != '' && !rel_ip.test(gateway)) { 
            showMsg(_("网关地址错误"));
            return false;
        }

        if(dns1 != '' && !rel_ip.test(dns1)) {
            showMsg(_("主DNS地址错误"));
            return false;
        }
        if(dns2 !== '' && !rel_ip.test(dns2)) {
            showMsg(_("备用DNS地址错误"));
            return false;
        }

        if(dns2 !== '' && dns2 == dns1) {
            showMsg(_("备用DNS不能和主DNS相同"));
            return false;
        }
        if(gateway !== '' && !R.Valid.isSameNet(startip, mask, gateway, mask)) {
            showMsg(_("网关地址必须与IP地址在同一网段"));
            return false;
        }

        if(!R.Valid.isSameNet(lanIP, mask, startip, mask)) {
            showMsg(_("起始IP必须和登录IP同网段"));
            return false;
        }
        if(!R.Valid.isSameNet(lanIP, mask, endip, mask)) {
            showMsg(_("结束IP必须和登录IP同网段"));
            return false;
        }
        if(!endLEStart(startip, endip)) {
            showMsg(_("起始IP不能大于结束IP"));
            return false;
        }

        showSaveMsg(_("请稍候..."));
        return res;
    }

    function handler(res) {
        G_data = res;
        $.getJSON('/w20e/goform/getNetworkIpMask', function(res) {
            ipObj = res;
        });
        return res;
    }

    var apDHCPView = new R.View('#lanSetContainer', {
        fetchUrl: '/w20e/goform/getDhcpAP',
        submitUrl:'/w20e/goform/setDhcpAP',
        updateCallback: handler,
        afterSubmit: function(res) {
            if(res == 'success') {
                showSaveMsg(_("保存成功！"), 1000);
            } else if(res == 'error' || res == 'fail') {
                showSaveMsg(_("保存失败！"), 1000);
            }
        },
        beforeSubmit:beforeSubmitHandler,
        events: {
            '#commitBtn, click': function() {
                apDHCPView.submit();
            },
            '#cancelBtn, click': function() {
                apDHCPView.initElements();
            }
        }
    });

}(window,$))
