(function(window, $) {

    function handlerAfterSubmit() {
        upnpConfigView.update(true);
        showMsg(_("保存成功！"));
    }
    
    var upnpConfigView = new R.View("#upnpContainer", {
        fetchUrl: '/w20e/goform/getUPnP',
        submitUrl: '/w20e/goform/setUPnP',
        updateCallback: function(res) {
            if(res.upnpEn === true){
                $('#upnpDetail').removeClass('none');
            } else {
                $('#upnpDetail').addClass('none');
            }
        },
        beforeSubmit: function() {
            showSaveMsg(_("请稍候..."));
        },
        afterSubmit: function() {
            upnpConfigView.update(true);
            showSaveMsg(_("保存成功！"), 1000);
        },
        events: {
            '#upnpSet-save,click':function() {
                upnpConfigView.submit();
            },
            '#refresh, click':function() {
                // upnpConfigView.update(true);
                //仅刷新表格
                $.GetSetData.getData('/w20e/goform/getUPnP',function(res) {
                    res = $.parseJSON(res);
                    new AutoFill($('#upnpList'), {"upnpList": res.upnpList});
                })
                  
            },
            '#upnpSwitch, click, input': function() {
                if (this.value === 'true') {
                    $('#upnpDetail').slideDown(200);
                } else if (this.value === 'false') {
                    $('#upnpDetail').slideUp(200);
                }
                top.ResetHeight.resetHeight();
            }
        }
    });

} (window, $));
