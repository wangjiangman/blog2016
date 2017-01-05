$(function() {

    var index = window.location.search.indexOf("ld");
    var ld = (index === -1) ? "" : (window.location.search.substr(window.location.search.indexOf("=")+1));
    $.GetSetData.getData('/w20e/goform/getPreTimeoutNotify', function(res) {
        var anData = $.parseJSON(res);
        $("#anTitle").text(anData.preTimeoutTitle);
        $("#anTxt").text(anData.preTimeoutContent);
    });

    $("#continue").on('click', function() { 
        if(ld !== ""){
            $.GetSetData.getData('/w20e/goform/ackPreTimeoutNotify', function(data) {
                window.location.href = ld;
            });
        } else {
            window.close();
        }
    });
});