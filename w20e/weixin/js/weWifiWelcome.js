(function(window, $) {
    var G_data = {
            rebootOrNot: false,
            weWifiInitFlag: null,
            changeWeWifi: null
        },
        URL = {
            getMainInfo: '/w20e/goform/getWewifiPageInfo',
            setMainInfo: '/w20e/goform/setWewifiPageInfo',
            delPic: '/w20e/goform/delWewifiPic', //删除图片
            uploadPic: '/cgi-bin/uploadWewifiPic' //上传图片
        };

    function handler(res) {
        //对获取来的数据做处理
        var obj = res;
        if (obj.picExit1) {
            $("#selPicBtn1").html("更换图片");
            $("#delPic1").removeClass("none");
        }
        if (obj.picExit2) {
            $("#selPicBtn2").html("更换图片");
            $("#delPic2").removeClass("none");
        }
        if (obj.picExit3) {
            $("#selPicBtn3").html("更换图片");
            $("#delPic3").removeClass("none");
        }
    }

    function delImage(index) {
        showConfirm.call(this, "确认删除吗？", function() {
            showSaveMsg(_("请稍候..."));
            $.GetSetData.setData(URL.delPic, {
                picName: "wewifipic" + index
            }, function() {
                showSaveMsg(_('删除成功！'), 1000);
                /*$("#pushWrap").attr("src", "../../wewifi/portal_wewifi.html?random=" + Math.random());
                weWifiAuthSetView.update();*/
                window.location.reload();
            });
        });
    };

    function checkUrls() {
        var goUrl = "",
            i = 1,
            strregex = "^((https|http|ftp|rtsp|mms)?://)" + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp的user@
            + "(([0-9]{1,3}.){3}[0-9]{1,3}" // ip形式的url- 199.194.52.184
            + "|" // 允许ip和domain（域名）
            + "([0-9a-z_!~*'()-]+.)*" // 域名- www.
            + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]." // 二级域名
            + "[a-z]{2,6})" // first level domain- .com or .museum
            + "(:[0-9]{1,4})?" // 端口- :80
            + "((/?)|" // a slash isn't required if there is no file name
            + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$",
            re = new RegExp(strregex),
            len = 3,
            submitData = {

            };
        for (; i <= len; i++) {
            if ($("#picLink" + i).val() != "") {
                goUrl = "http://" + $("#picLink" + i).val();
                if ($("#delPic" + i).hasClass("none")) {
                    $("#picLink" + i).val('');
                    showSaveMsg(_("请为图片" + i + "选择图片，再保存链接"), 1000);
                    $("#picLink" + i).focus();
                    return;
                };

                if (!re.test(goUrl)) {
                    showSaveMsg(_("链接地址不合法"), 1000);
                    $("#picLink" + i).focus();
                    return false;
                }
            }
        }

        if(parseInt($("[name=picShowTime]").eq(0).val()) === 0){
            showSaveMsg(_("图片轮播时间最小为1秒"), 1000);
            $("[name=picShowTime]").eq(0).focus();
            return false;
        } 

        return true;
    }

    function initEvent() {
        $('#pushImg1, #pushImg2, #pushImg3').on('change', function(e) {
            var upgradefile = this.value,
                imgId = this.id,
                upPicIndex = "",
                subData = {},
                upgradefileUpper = upgradefile.toUpperCase();

            var upPicIndex = parseInt($(this).attr("id").slice(7, 8));

            if (upgradefile == null || upgradefile == "") {
                return;
            }
            if (upgradefileUpper.indexOf(".JPG") != -1 || upgradefileUpper.indexOf(".PNG") != -1) {
                showSaveMsg(_("请稍候..."));
                subData = {
                    picName: "wewifipic" + upPicIndex
                };
                $.ajaxFileUpload({
                    url: URL.uploadPic,
                    secureuri: false,
                    fileElementId: imgId,
                    data: subData,
                    dataType: 'text',
                    success: function(d) {

                        if (d === "tooLarge") {
                            showSaveMsg(_("图片大小不能超过300kB"), 1000);
                            window.location.reload();
                        }

                        if (d === "ok") {
                            showSaveMsg(_("上传成功！"), 1000);
                            $("#pushWrap").attr("src", "../../wewifi/portal_wewifi.html?random=" + Math.random());
                            weWifiAuthSetView.update();
                            initEvent();
                        }
                    }
                });
            } else {
                showSaveMsg(_("只支持.jpg和.png格式的图片"), 1000);
            }
        });

        $('#delPic1, #delPic2, #delPic3').on('click', function(e) {
            var picIndex = parseInt($(this).attr("id").slice(6, 7));
            delImage(picIndex);
        });


        $('#weWifiAuthSave').on('click', function() {
            if (checkUrls()) {
                showSaveMsg(_("请稍候..."));
                weWifiAuthSetView.submit();
            }
        });

        $('#weWifiAuthCancel').on('click', function() {
            weWifiAuthSetView.initElements();
        });

    }
    var weWifiAuthSetView = new R.View('#weWifiWelContainer', {
        fetchUrl: URL.getMainInfo,
        submitUrl: URL.setMainInfo,
        updateCallback: handler,
        afterSubmit: function(res) {
            Debug.log("res = " + res);
            if (res === "1") {
                showSaveMsg(_("保存成功！"), 1000);
                $("#pushWrap").attr("src", "../../wewifi/portal_wewifi.html?random=" + Math.random());
                weWifiAuthSetView.update();
            } else {
                showSaveMsg(_("保存失败！"), 1000);
            }
        },
        events: initEvent()
    });
}(window, $))
