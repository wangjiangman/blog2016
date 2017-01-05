(function(window, document, $) {
    var lanIP;
    $("#resetBtn").on("click", function() {
        $('#reset-modal').modal();
    });

    $("#resetClose").on("click", function() {
        $('#reset-modal').modal('hide');
    });

    $.GetSetData.getJson("/w20e/goform/getRestoreInfo", function(data) {
        lanIP = data.lanDefaultIP;
    });

    $("#resetNow").on("click", function() {
        $.get("/w20e/goform/restore", function (msg) {
            $('#reset-modal').css("display", "none");
            var p = new top.Progress("http://"+lanIP, 700, $("#progress-dialog")[0]);
            p.show("center");
            p.setText("系统正在恢复出厂设置,请稍候...");
            p.start();
        });
    });
})(window, document, $);
