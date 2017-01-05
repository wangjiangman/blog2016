(function(window, $) {
    function handler(data) {
       if( data.lanPortVlanEn === true) {
            $("#vlanDetail").show();
       } else {
            $("#vlanDetail").hide();
       }
    }

    var vlanSetView  = new R.View("#vlanContanier", {
        fetchUrl: '/w20e/goform/getLanPortVlan',
        submitUrl: '/w20e/goform/setLanPortVlan',
        updateCallback: handler,
        beforeSubmit: function() {
            showSaveMsg(_("请稍候..."));
        },
        afterSubmit: function() {
            vlanSetView.update(true);
            showSaveMsg(_("保存成功！"), 1000);
        }
    });

    $("#save").on("click", function() {
        vlanSetView.submit();
    });
    $("#cancel").on("click", function() {
        vlanSetView.update();
    });

    $("input[name='lanPortVlanEn']").on('change', function() {
        if($(this).val() === "true") {
            $("#vlanDetail").show();
        } else {
            $("#vlanDetail").hide();
        }
    });

} (window, $));