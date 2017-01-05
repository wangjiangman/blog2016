(function(window,$){

    var G_data = {};
    $('#wanArgsContainer > hr').hide();

    function getFastNatData() {
        $.GetSetData.getJson("/w20e/goform/getFastnat",function(obj) {
            if(obj.fastnatEn) {
                $("#fastnatEn").prop("checked", true);
            }
        }); 
    }
    getFastNatData();
    
    function handler(res) {
        $('#wanArgsContainer > hr:lt('+(res.length-1)+')').show();
        for(var i = 1; i <= res.length; i++) {
            $("#wanArgs" + i).removeClass('none');
        }
        G_data = res;
        var data = res;
        res = res.slice(0);
        for (var i = 0, l = res.length; i < l; i++) {
            for (var d in res[i]) {
                if (res[i].hasOwnProperty) {
                    data[d.replace(/(?=(wan))\1/i, '$1' + (i + 1))] = res[i][d];
                }
            }

            if(res[i].wanType !== "pppoe") {
                $("#wan"+(i+1)+"Mtu option[value='auto']").after('<option value="1500">1500</option>');
            }

            var mac = "";
            if(res[i].wanMacType === "default") {
                mac = "默认MAC:"+res[i].wanMacDefault;
            } else if(res[i].wanMacType === "current") {
                mac = "当前MAC:"+res[i].wanMacCurrent;
            } else if(res[i].wanMacType === "currentPc"){
                mac = "克隆本机MAC:"+res[i].wanMacCurrentPc;
            }
            $("#wan"+(i+1)+"Mac").html(mac);
        }

        setTimeout(function() {
            $("select").select();
        }, 100);

        return data;
    }

    var wanArgsView = new R.View('#wanArgsContainer', {
        fetchUrl: '/w20e/goform/getWan',
        submitUrl:'/w20e/goform/setWan',
        updateCallback: handler,
        beforeSubmit: function() {
            var mac1 = $('#wan1Mac').text() || '手动填写MAC:' + $('#jSelect-input2').val();
            var mac2 = $('#wan2Mac').text() || '手动填写MAC:' + $('#jSelect-input5').val();
            if(mac1.substring(mac1.indexOf(":") + 1) == mac2.substring(mac2.indexOf(":") + 1)) {               
                showMsg(_("WAN1和WAN2的MAC地址不能相同！"));
                return false;
            }

            showSaveMsg(_("请稍候..."));
        },
        afterSubmit: function() {
            showSaveMsg(_("保存成功！"), 1000);
            wanArgsView.update();
        },
        events: {
            '#submitBtn, click': function() {
                wanArgsView.submit();
                $.GetSetData.setData("/w20e/goform/setFastnat", {fastnatEn: $("#fastnatEn").prop("checked")}, function() {
                    getFastNatData();
                });
            },
            '#cancelBtn, click': function() {
                wanArgsView.update();
            }
        }
    });

    $('select[name="wan1MacType"]').on('change',function() {
        var mac1 = "";
        var selectedTxt1 = $("select[name='wan1MacType']").children("option:selected").text();
        if(selectedTxt1 === "默认MAC") {
            mac1 = "默认MAC:"+G_data[0].wanMacDefault;
        } else if(selectedTxt1 === "当前MAC") {
            mac1 = "当前MAC:"+G_data[0].wanMacCurrent;
        } else if(selectedTxt1 === "克隆本机MAC") {
            mac1 = "克隆本机MAC:"+G_data[0].wanMacCurrentPc;
        }
        $("#wan1Mac").html(mac1);
    });

    $('select[name="wan2MacType"]').on('change',function() {
        var mac2 = "";
        var selectedTxt2 = $("select[name='wan2MacType']").children("option:selected").text();
        if(selectedTxt2 === "默认MAC") {
            mac2 = "默认MAC:"+G_data[1].wanMacDefault;
        } else if(selectedTxt2 === "当前MAC") {
            mac2 = "当前MAC:"+G_data[1].wanMacCurrent;
        } else if(selectedTxt2 === "克隆本机MAC") {
            mac2 = "克隆本机MAC:"+G_data[1].wanMacCurrentPc;
        }
        $("#wan2Mac").html(mac2);
    });

    $('select[name="wan3MacType"]').on('change',function() {
        var mac3 = "";
        var selectedTxt3 = $("select[name='wan3MacType']").children("option:selected").text();
        if(selectedTxt3 === "默认MAC") {
            mac3 = "默认MAC:"+G_data[2].wanMacDefault;
        } else if(selectedTxt3 === "当前MAC") {
            mac3 = "当前MAC:"+G_data[2].wanMacCurrent;
        } else if(selectedTxt3 === "克隆本机MAC") {
            mac3 = "克隆本机MAC:"+G_data[2].wanMacCurrentPc;
        }
        $("#wan3Mac").html(mac3);
    });

    $('select[name="wan4MacType"]').on('change',function() {
        var mac4 = "";
        var selectedTxt4 = $("select[name='wan4MacType']").children("option:selected").text();
        if(selectedTxt4 === "默认MAC") {
            mac4 = "默认MAC:"+G_data[3].wanMacDefault;
        } else if(selectedTxt4 === "当前MAC") {
            mac4 = "当前MAC:"+G_data[3].wanMacCurrent;
        } else if(selectedTxt4 === "克隆本机MAC") {
            mac4 = "克隆本机MAC:"+G_data[3].wanMacCurrentPc;
        }
        $("#wan4Mac").html(mac4);
    });

}(window,$));