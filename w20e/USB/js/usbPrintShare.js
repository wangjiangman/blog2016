(function(window, $) {

    var usbPrintView = new R.View("#usbPrintContainer", {
        fetchUrl: '/w20e/goform/getUSBPrint',
        submitUrl: '/w20e/goform/setUSBPrint',
        beforeSubmit: function() {
            showSaveMsg(_("请稍候..."));
        },
        afterSubmit: function() {
            showSaveMsg(_("保存成功！"), 1000);
        },
        events: {
            '#usbPrintSet-save, click': function() {
                usbPrintView.submit();           
            },
            '#usbPrintSet-cancel, click': function() {
                usbPrintView.initElements();   
            }
        }
    });

} (window, $));
