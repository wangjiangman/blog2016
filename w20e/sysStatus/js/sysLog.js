(function(window,$) {
    var sysLog = new TablePage($("#sysInfo table"));
    $.GetSetData.getData('/w20e/goform/getSysLog', function(res) {
        sysLog.data = $.parseJSON(res);
        sysLog.init();
        return res;
    });
}(window,$))