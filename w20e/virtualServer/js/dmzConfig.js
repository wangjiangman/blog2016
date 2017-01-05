$(function(){

    $('#dmzContainer > .row').hide();
    $('#dmzContainer > hr').hide();
    if(top.WAN_NUMBER) {
        $('#dmzContainer > .row:lt('+top.WAN_NUMBER+')').show();
        $('#dmzContainer > hr:lt('+(top.WAN_NUMBER-1)+')').show();
    };

    function initData() {
         var dmzObj = {};
        for(var i = 0; i < G_data.dmz.length; i++) {
            dmzObj = {};
            if(G_data.dmz[i].dmzEn === true){
                $('#dmz'+(i+1)+'detail').removeClass('none');
            } else {
                $('#dmz'+(i+1)+'detail').addClass('none');
            }
            dmzObj["dmzEn"+(i+1)] = G_data.dmz[i].dmzEn;
            dmzObj["dmzHost" + (i+1)] = G_data.dmz[i].dmzHost;
            new AutoFill('#dmzContainer',dmzObj);
        }
        
    }
    var G_data;
    $.GetSetData.getData('/w20e/goform/getDMZ',function(res){
        G_data = $.parseJSON(res);
        initData();
       
    });

    $("#dmz1switch input").click(function() {
        if (this.value === 'true') {
            $('#dmz1detail').slideDown(200);
        } else if (this.value === 'false') {
            $('#dmz1detail').slideUp(200);
        }
        top.ResetHeight.resetHeight(200);
    });

     $("#dmz2switch input").click(function() {
        if (this.value === 'true') {
            $('#dmz2detail').slideDown(200);
        } else if (this.value === 'false') {
            $('#dmz2detail').slideUp(200);
        }
        top.ResetHeight.resetHeight(200);
    });

     $("#dmz3switch input").click(function() {
        if (this.value === 'true') {
            $('#dmz3detail').slideDown(200);
        } else if (this.value === 'false') {
            $('#dmz3detail').slideUp(200);
        }
        top.ResetHeight.resetHeight(200);
    });

     $("#dmz4switch input").click(function() {
        if (this.value === 'true') {
            $('#dmz4detail').slideDown(200);
        } else if (this.value === 'false') {
            $('#dmz4detail').slideUp(200);
        }
        top.ResetHeight.resetHeight(200);
    });


    $("#dmzSet-save").on("click",function(){
        var validateObj = $.validate({"wrapElem": "#dmzContainer"});
        if (!validateObj.check()) {
            showMsg(_("输入有误，请检查红色的输入框"));
            return;
        }
        showSaveMsg(_("请稍候..."));
        $.GetSetData.setData('/w20e/goform/setDMZ',
            new AutoCollect('#dmzContainer').getJson(), function() {
                showSaveMsg(_("保存成功！"), 1000);
            });
    });

    $("#dmzSet-cancel").on("click", function() {
        initData();
        
    });

    $("#dmzHost1").addCheck([
        {"type":"ip"},
        {"type": "netSegmentCheck"}
    ]);
    $("#dmzHost2").addCheck([
        {"type":"ip"},
        {"type": "netSegmentCheck"}
    ]);
    $("#dmzHost3").addCheck([
        {"type":"ip"},
        {"type": "netSegmentCheck"}
    ]);
    $("#dmzHost4").addCheck([
        {"type":"ip"},
        {"type": "netSegmentCheck"}
    ]);
    //判断输入IP地址与lanIP是否在同一个网段
    $.valid.netSegmentCheck = {
        all: function(inputIP) {

        var res1 = [],
            res2 = [];
        
        var lanIP = G_data.lanIP;
        var mask = G_data.lanMask;

        if(lanIP === inputIP) {
            return "不能与LAN口IP相同";
        }
        inputIP = inputIP.split(".");
        lanIP = lanIP.split(".");
        mask  = mask.split(".");

        for(var i = 0, len = inputIP.length; i < len ; i += 1) {
            res1.push(parseInt(inputIP[i]) & parseInt(mask[i]));
            res2.push(parseInt(lanIP[i]) & parseInt(mask[i]));
        }
        if((res1.length !== 4) || (res2.length !== 4))
        {
            //necessary.传递给type ip验证
        }else if(res1.join(".") !== res2.join(".")) {
            return "与LAN口IP不在同一个网段";
        }
    }};
    
});
