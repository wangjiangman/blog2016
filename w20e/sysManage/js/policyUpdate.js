var uploadUnit = (function () {
    var uploadFlag = false;
    return {
        uploadFile: function (id, url, callback) {
            url = url || './cgi-bin/uploadPolicy';
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

                    $('#policyUpdateSearch').on("change", function() {
                        var fileName = [];
                        fileName = ($('#policyUpdateSearch').val()).split('\\');
                        $('#policyUpdateName').val(fileName[fileName.length-1]);
                    });

                }
            });
        }
    };
}());

(function(window, $) {
    var a, result;
    $.GetSetData.getData('/w20e/goform/getPolicyVerion', function(res) {
        result = $.parseJSON(res);
        a = new AutoFill('#policyUpdateContainer', result);
    });

    $('#policyUpdateSearch').on("change", function() {
        var fileName = [];
        fileName = ($('#policyUpdateSearch').val()).split('\\');
        $('#policyUpdateName').val(fileName[fileName.length-1]);
    });

    $("#policyUpdateBtn").on("click",function() {
        Debug.log("start upload");
        showMsg("文件上传中...");
        uploadUnit.uploadFile("policyUpdateSearch", "/cgi-bin/uploadPolicy", function (msg) {
            if (msg != "1") {
                showMsg("上传失败，请检查上传固件是否正确！");
                return;
            } else {
                showMsg("上传成功",true,50);
            }
            
            var p = new top.Progress("", 1510);
            p.setUrl(window.location.href.replace(/(http(s)?:\/\/.+(\/)).*/gi, "$1"));
            p.setText("系统正在升级请不要关闭电源...");
            p.setTimeout(600);
            p.setCallback("");
            p.show("center");
            p.start();
        });
    });
}(window, $));
