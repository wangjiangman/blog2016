var uploadUnit = (function () {
    var uploadFlag = false;
    return {
        uploadFile: function (id, url, callback) {
            url = url || './cgi-bin/upgrade';
            if (uploadFlag) {
                return;
            }
            uploadFlag = true;
            $.ajaxFileUpload({
                url: url,
                secureuri: false,
                fileElementId: id,
                dataType: 'text',
                success: function () {
                    uploadFlag = false;
                    if (typeof callback === "function") {
                        callback.apply(this, arguments);
                    }
                }
            });
        }
    };
}());

(function(window, document, $) {

    $("#version")[0].innerHTML = R.CONST.CONFIG_FIRWARE_VERION;

    $('#updateFileSearchContainer').on("change", "input:file", function() {
        var fileName = [];
        fileName = ($('#updateFileSearch').val()).split('\\');
        $('#updateFileName').val(fileName[fileName.length-1]);
    });

    $("#upgradeBtn").on("click",function() {
        Debug.log("start upload");
        showMsg("文件上传中...");
        uploadUnit.uploadFile("updateFileSearch", "/cgi-bin/upgrade", function (msg) {
            if (msg != "1") {
                showMsg("上传失败，请检查上传固件是否正确！");
                return;
            } else {
                showMsg("上传成功",true,50);
            }
            
            var p = new top.Progress("", 1510);
            p.setUrl(window.location.href.replace(/(http(s)?:\/\/.+(\/)).*/gi, "$1"));
            p.setText("系统正在升级请不要关闭电源...");
            p.setTimeout(1000);
            p.setCallback("");
            p.show("center");
            p.start();
        });
    });

    function initPage() {
        $("#localUpgrade").show();
        $("#onlineUpgrade").hide();
        $("#statusNotice").text("");
    }

    function onlineUpgrade() {
        $("#localUpgrade").hide();
        $.GetSetData.getData('/w20e/goform/getOnlineUpgrade', initOnlineUpgradeData);
    }

    var initTimerHandler;
    onlineUpgrade();


    /**********************change upgrade type ********************/
    function initOnlineUpgradeData(data) {
        var res = $.parseJSON(data);
        var initStatus = res.status;
        initTimerHandler = setTimeout(function() {
            $.GetSetData.getData('/w20e/goform/getOnlineUpgrade', initOnlineUpgradeData);
        }, 3000);
        if(initStatus === 0) {
            $("#statusNotice").text("正在检测新版本，请稍候...");
        } else if(initStatus === 1) {
            clearTimeout(initTimerHandler);
            $("#statusNotice").text("当前版本为最新版本，不需要升级。");
        } else if(initStatus === 5) {
            clearTimeout(initTimerHandler);
            $("#statusNotice").text("连接服务器失败，无法获取版本信息");
        }else if(initStatus === 2){
            clearTimeout(initTimerHandler);
            $("#statusNotice").text("");
            $("#onlineUpgrade").show();
            $("#newVersion").text(res.update_info.new_version);
            $("#newContent").text(res.update_info.description.join(" "));
        }
    }

    $("input[name='upgradeType']").on('click', function() {
        if($("input[name='upgradeType']:checked").val() === "online") {
            onlineUpgrade();
        } else {
            clearTimeout(initTimerHandler);
            initPage();
        }
    });
    /**********************change upgrade type end********************/

    /**************************online upgrade*************************/
    function setUpdateHandler(res) {
        var pTest = new top.Progress("", 1510);
        if(res === "1") {
            var timeHandler = setInterval(function() {
                $.GetSetData.getData('/w20e/goform/getOnlineUpgrade', function(data) {
                    var transData = $.parseJSON(data);
                    var status = transData.status;
                    if(status === 5) {
                        clearInterval(timeHandler);
                        $("#onlineUpgrade").hide();
                        $("#statusNotice").text("连接服务器失败，无法获取版本信息");
                        pTest.hide();
                    } else if(status === 3) {
                        $("#onlineUpgrade").hide();
                        pTest.setText("正在下载软件...");
                        pTest.setTimeout(1000);
                        pTest.setCallback("");
                        pTest.show("center");
                        pTest.setPercent(transData.percent);
                    } else if(status === 4) {
                        var p = new top.Progress("", 1510);
                        pTest.hide();
                        pTest = null;
                        clearInterval(timeHandler);
                        $("#statusNotice").text("");
                        setTimeout(function() {
                            p.setUrl(window.location.href.replace(/(http(s)?:\/\/.+(\/)).*/gi, "$1"));
                            p.setText("系统正在升级请不要关闭电源...");
                            p.setTimeout(1000);
                            p.setCallback("");
                            p.show("center");
                            p.start();
                            }, 1000)
                    } 
                })
            }, 3000);
        }
    }

    $("#downAndUpgrade").on("click", function() {
        showConfirm.call(this, "下载完成后，路由器将自动开始升级操作，在升级过程中请不要切断电源，否则会造成路由器损坏。", function() {
            $.GetSetData.getData('/w20e/goform/setOnlineUpgrade', setUpdateHandler)
        });
    });
    /**************************online upgrade end*************************/
})(window, document, $);
