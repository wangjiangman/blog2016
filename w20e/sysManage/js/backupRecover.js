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

                    $('#fileSearch').on("change", function() {
                        var fileName = [];
                        fileName = ($('#fileSearch').val()).split('\\');
                        $('#fileName').val(fileName[fileName.length-1]);
                    });
                }
            });
        }
    };
}());

(function(window, document, $) {

    $("#backup").on('click',function() {
        window.location.href = "/cgi-bin/DownloadCfg/RouterCfm.cfg";
    });

    $('#fileSearch').on("change", function() {
        var fileName = [];
        fileName = ($('#fileSearch').val()).split('\\');
        $('#fileName').val(fileName[fileName.length-1]);
    });

    $("#recoveryBtn").on("click", function() {
        uploadUnit.uploadFile("fileSearch", "/cgi-bin/UploadCfg", function (msg) {
            Debug.log("restore settings msg:", msg);
            if (msg !== "yes") {
                showMsg(_("上传失败，请检查上传固件是否正确！"));
                return;
            }
            
            var p = new top.Progress(window.location.href.replace(/(http(s)?:\/\/.+(\/)).*/gi, "$1"), 500, $("#progress-dialog")[0]);
            p.show("center");
            p.setText("系统正在重启,请稍候...");
            p.start();
        });
    });

})(window, document, $);