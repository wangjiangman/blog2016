(function(window, $) {

    var plugAndPlayView = new R.View("#plugAndPlayContainer", {
        fetchUrl: '/w20e/goform/getHotelModeInfo',
        submitUrl: '/w20e/goform/setHotelModeInfo',
        beforeSubmit: function() {
            showSaveMsg(_("请稍候..."));
        },
        afterSubmit: function() {
            showSaveMsg(_("保存成功！"), 1000);
        }
    });

    $("#save").on("click", function() {
        plugAndPlayView.submit();
    });
    $("#cancel").on("click", function() {
        plugAndPlayView.update();
    });

} (window, $));