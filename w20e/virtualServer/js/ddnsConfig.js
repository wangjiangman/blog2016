(function(window, $) {
    var G_data;
    var state={
        "autherized": "已连接",
        "unautherized": "未连接",
        "general":"普通服务",
        "professional":"专业服务"
    };

    var linkTrans = {
        "oray": "www.oray.net/Passport/Passport_Register.asp",
        "3322": "3322.org",
        "gnway": "gnway.com",
        "88ip": "88ip.cn"
    }

     var tmpDdns = function(index) {
            var str = '<div class="row">'+
                '<div id="ddns'+index+'switch">'+
                  '<label class="col-xs-12 col-sm-2 col-md-2"> WAN'+ index +'口</label>'+
                '<div class="col-xs-12 col-sm-10">'+
                    '<form class="form-horizontal" role="form">'+
                        '<div class="form-group">'+
                            '<label class="control-label col-xs-5 col-sm-3">DDNS状态：</label>'+
                            '<div class="col-xs-7">'+
                                '<label class="radio-inline">'+
                                    '<input type="radio" name="ddns'+index+'En" value="true">开启'+
                                '</label>'+
                                '<label class="radio-inline">'+
                                    '<input type="radio" name="ddns'+index+'En" value="false">关闭'+
                                '</label>'+
                            '</div>'+
                        '</div>'+
                        '<div id="ddns'+index+'detail" class="none">'+
                            '<div class="form-group">'+
                                '<label class="control-label col-xs-5 col-sm-3">DDNS供应商：</label>'+
                                '<div class="col-xs-7">'+
                                    '<select style="display:inline;" class="form-control" name="ddns'+index+'Server">'+
                                        '<option value="3322">3322.org</option>'+
                                        '<option value="88ip">88ip.cn</option>'+
                                        '<option value="oray">oray.com</option>'+
                                        '<option value="gnway">gnway.com</option>'+
                                    '</select>'+
                                    '<a href="#" target="_blank" id="ddns'+index+'ServerUrl">注册去</a>'+
                                '</div>'+
                            '</div>'+
                            '<div id="orayServer'+index+'">'+
                                '<div class="form-group">'+
                                    '<label class="control-label col-xs-5 col-sm-3">服务商链接：</label>'+
                                    '<div class="col-xs-7 form-control-static">'+
                                        '<a href="http://www.oray.net/peanuthull/peanuthull_prouser.htm" target="_blank" class="orayLink">花生壳DDNS服务升级</a>'+
                                        '<a href="http://www.oray.net/Help" target="_blank" class="orayLink">花生壳DDNS服务帮助</a>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="form-group">'+
                                    '<label class="control-label col-xs-5 col-sm-3">服务类型：</label>'+
                                    '<div class="col-xs-7">'+
                                        '<div class="controls-text" data-bind="ddns'+index+'ServiceType"></div>'+
                                    '</div>'+
                               '</div>'+
                            '</div>'+
                            '<div class="form-group">'+
                                '<label class="control-label col-xs-5 col-sm-3">用户名：</label>'+
                                '<div class="col-xs-7">'+
                                    '<input type="text" maxlength="32" class="form-control validatebox" required id="wan'+index+'ddnsUser" name="ddns'+index+'User" data-options=\'[{"type": "chkHalf"},{"type": "noBlank"}]\'>'+
                                '</div>'+
                            '</div>'+
                            '<div class="form-group">'+
                                '<label class="control-label col-xs-5 col-sm-3">密码：</label>'+
                                '<div class="col-xs-7">'+
                                    '<input type="password" maxlength="32" class="form-control validatebox" data-role="visiblepassword" required id="ddns'+index+'Pwd" name="ddns'+index+'Pwd" data-options=\'[{"type": "ascii"},{"type": "chkHalf"},{"type": "noBlank"}]\'>'+
                                '</div>'+
                            '</div>'+
                            '<div class="form-group none" id="pwd'+index+'Note">'+
                                '<label class="control-label col-xs-5 col-sm-3"></label>'+
                                '<div class="col-xs-7">'+
                                    '<span style="color:red">用户名或密码错误！</span>'+
                                '</div>'+
                            '</div>'+
                            '<div class="form-group">'+
                                '<label class="control-label col-xs-5 col-sm-3">域名信息：</label>'+
                                '<div class="col-xs-7">'+
                                    '<textarea cols="5" name="ddns'+index+'Domain" class="form-control" style="resize:none;" onchange= "this.value=this.value.replace(/\s/g, \'\')">'+
                                    '</textarea>'+
                                '</div>'+
                            '</div>'+
                            '<div class="form-group">'+
                                '<label class="control-label col-xs-5 col-sm-3">状态：</label>'+
                                '<div class="col-xs-7">'+
                                    '<div class="controls-text" data-bind="ddns'+index+'Status"></div>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</form>'+
                '</div>'+
           '</div></div>';
           return str;
       };

    function initHtml() {
        $("#ddnsContanier").html('');
        var wrap = "";
        for(var i = 1; i <= top.WAN_NUMBER; i++) {
            wrap += tmpDdns(i);
        }
        $("#ddnsContanier").html(wrap);
    }

    initHtml();

    function handler(res, updateAll) {
        var data = {};
        G_data = res;
        if(!($("#pwd1Note").hasClass("none"))) {
            $("#pwd1Note").addClass("none");
        }
        if(!($("#pwd2Note").hasClass("none"))) {
            $("#pwd2Note").addClass("none");
        }

        if(!($("#pwd3Note").hasClass("none"))) {
            $("#pwd3Note").addClass("none");
        }
        if(!($("#pwd4Note").hasClass("none"))) {
            $("#pwd4Note").addClass("none");
        }
        res = res.slice(0);
        for (var i = 0, l = res.length; i < l; i++) {
            var domain = [];
            for (var d in res[i]) {
                if (d === 'ddnsDomain') {
                    for(var j = 0, len = res[i][d].length; j < len; j++) {
                        domain.push(res[i][d][j].domain);
                    }

                    res[i][d] = domain.join(' ');
                } else if (d === 'ddnsStatus' || d === 'ddnsServiceType') {
                    res[i][d] = state[res[i][d]];
                }

                if (res[i].hasOwnProperty(d)) {
                    data[d.replace(/(?=(ddns))\1/i, '$1' + (i + 1))] = res[i][d];
                }
            }
            if (data['ddns' + (i + 1) + 'En'] === true) {
                $('#ddns' + (i + 1) + 'detail').removeClass('none');
            }
            
            if (res[i]['ddnsServer'] === 'oray') {
                $('[name=ddns' + (i + 1) + 'Domain]').val(domain.join(' '));
            }

            if (updateAll !== false) {
                changeSelect(i + 1, res[i]['ddnsServer']);
            }
        }

        return data;
    }


    function changeSelect(index, val) {
        var link = linkTrans[val];
        $('#ddns' + index + 'ServerUrl').attr("href","//"+link);

        if(link === "www.oray.net/Passport/Passport_Register.asp") {
            $('#orayServer' + index).slideDown(200);
            $('[name=ddns' + index + 'Domain]').attr('readonly', true);
        } else {
            $('#orayServer' + index).slideUp(200);
            $('[name=ddns' + index + 'Domain]').attr('readonly', false);
        }
        top.ResetHeight.resetHeight(200);
    }

    var ddnsConfigView = new R.View('#ddnsContanier', {
        fetchUrl: '/w20e/goform/getDDNS',
        submitUrl:'/w20e/goform/setDDNS',
        updateCallback: handler,
        beforeSubmit: function() {
            // showSaveMsg(_("请稍候..."));
        },
        afterSubmit: function(res) {
            if(res === "wan1Error") {
                $("#pwd1Note").removeClass("none");
                top.ResetHeight.resetHeight(300);
                $("[name='ddns1User']").focus();
            } else if(res === "wan2Error") {
                $("#pwd2Note").removeClass("none");
                top.ResetHeight.resetHeight(300);
                $("[name='ddns2User']").focus();
            } else if(res === "bothError") {
                $("#pwd1Note").removeClass("none");
                $("#pwd2Note").removeClass("none");
                top.ResetHeight.resetHeight(300);
                $("[name='ddns1User']").focus();
            } else if(res === "1"){
                showSaveMsg(_("保存成功！"), 1000);
                ddnsConfigView.update(true);
            }
        },
        events: {
            '#ddnsSet-save, click': function() {
                ddnsConfigView.submit();
            },
            "select, change": function() {
                if (this.name === 'ddns1Server') {
                    changeSelect(1, $(this).val());
                } else if (this.name === 'ddns2Server'){
                    changeSelect(2, $(this).val());
                }else if (this.name === 'ddns3Server'){
                    changeSelect(3, $(this).val());
                }else if (this.name === 'ddns4Server'){
                    changeSelect(4, $(this).val());
                }
            },
  
            '#ddns1switch, click, input': function() {
                if (this.value === 'true') {
                    $('#ddns1detail').slideDown(200);
                } else if (this.value === 'false') {
                    $('#ddns1detail').slideUp(200);
                }
                top.ResetHeight.resetHeight(200);
            },
            '#ddns2switch, click, input': function() {
                if (this.value === 'true') {
                    $('#ddns2detail').slideDown(200);
                } else if (this.value === 'false') {
                    $('#ddns2detail').slideUp(200);
                }
                top.ResetHeight.resetHeight(200);
            },
            '#ddns3switch, click, input': function() {
                if (this.value === 'true') {
                    $('#ddns3detail').slideDown(200);
                } else if (this.value === 'false') {
                    $('#ddns3detail').slideUp(200);
                }
                top.ResetHeight.resetHeight(200);
            },
            '#ddns4switch, click, input': function() {
                if (this.value === 'true') {
                    $('#ddns4detail').slideDown(200);
                } else if (this.value === 'false') {
                    $('#ddns4detail').slideUp(200);
                }
                top.ResetHeight.resetHeight(200);
            },
            '#ddnsSet-cancel, click': function() {
                if(G_data[0].ddnsEn === true) {
                    $('#ddns1detail').slideDown(200);
                } else if(G_data[0].ddnsEn === false) {
                    $('#ddns1detail').slideUp(200);
                }

                if(G_data[1].ddnsEn === true) {
                    $('#ddns2detail').slideDown(200);
                } else if(G_data[1].ddnsEn === false) {
                    $('#ddns2detail').slideUp(200);
                }
                ddnsConfigView.update();
            }
        },
    });
    
    function update() {
        ddnsConfigView.update(false);
    }

    setInterval(update, 5000);

} (window, $));
