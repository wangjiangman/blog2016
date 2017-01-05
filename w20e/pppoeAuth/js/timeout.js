$(function() {

    $.GetSetData.getData('/w20e/goform/getTimeoutNotify', function(res) {
        var anData = $.parseJSON(res);
        $("#anTitle").text(anData.timeoutTitle);
        $("#anTxt").text(anData.timeoutContent);
    });

});